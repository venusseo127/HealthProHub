import type { Express, Request as ExpressRequest, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./firebase";
import admin from 'firebase-admin';

// Extend the Request type to include user
interface Request extends ExpressRequest {
  user?: admin.auth.DecodedIdToken | null;
}

// Middleware to verify Firebase authentication token
const verifyFirebaseToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - Missing or invalid token format' });
    }
    
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Add type definition for request.user
  app.use((req: Request, _res: Response, next: NextFunction) => {
    req.user = null;
    next();
  });

  // Authentication routes
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { email, password, name, role } = req.body;
      
      // Create user in Firebase Auth
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: name,
      });
      
      // Create user document in Firestore
      await db.collection('users').doc(userRecord.uid).set({
        uid: userRecord.uid,
        email,
        displayName: name,
        role,
        createdAt: new Date().toISOString(),
        isActive: true
      });
      
      res.status(201).json({ 
        message: 'User registered successfully',
        user: {
          uid: userRecord.uid,
          email,
          displayName: name
        }
      });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ error: 'Failed to register user' });
    }
  });

  // Protected routes (require authentication)
  app.get('/api/users/me', verifyFirebaseToken, async (req: Request, res: Response) => {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const userDoc = await db.collection('users').doc(uid).get();
      
      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(userDoc.data());
    } catch (error) {
      console.error('Error getting user data:', error);
      res.status(500).json({ error: 'Failed to get user data' });
    }
  });
  
  // Patient routes
  app.get('/api/patients', verifyFirebaseToken, async (req: Request, res: Response) => {
    try {
      const { doctorId, page = '1', limit = '10' } = req.query;
      const pageNumber = parseInt(page as string);
      const limitNumber = parseInt(limit as string);
      const startAt = (pageNumber - 1) * limitNumber;
      
      let patientsQuery = db.collection('patients');
      
      if (doctorId) {
        patientsQuery = patientsQuery.where('doctorId', '==', doctorId);
      }
      
      // Get total count for pagination
      const countSnapshot = await patientsQuery.count().get();
      const total = countSnapshot.data().count;
      
      // Get paginated data
      const snapshot = await patientsQuery
        .orderBy('createdAt', 'desc')
        .limit(limitNumber)
        .offset(startAt)
        .get();
      
      const patients = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      res.json({
        data: patients,
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber)
      });
    } catch (error) {
      console.error('Error getting patients:', error);
      res.status(500).json({ error: 'Failed to get patients' });
    }
  });
  
  app.get('/api/patients/:id', verifyFirebaseToken, async (req: Request, res: Response) => {
    try {
      const patientId = req.params.id;
      const patientDoc = await db.collection('patients').doc(patientId).get();
      
      if (!patientDoc.exists) {
        return res.status(404).json({ error: 'Patient not found' });
      }
      
      res.json({
        id: patientDoc.id,
        ...patientDoc.data()
      });
    } catch (error) {
      console.error('Error getting patient:', error);
      res.status(500).json({ error: 'Failed to get patient' });
    }
  });
  
  app.post('/api/patients', verifyFirebaseToken, async (req: Request, res: Response) => {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const patientData = {
        ...req.body,
        createdById: uid,
        createdAt: new Date().toISOString()
      };
      
      const patientRef = await db.collection('patients').add(patientData);
      const newPatient = await patientRef.get();
      
      // Log activity
      await db.collection('activityLogs').add({
        type: 'patient_registered',
        title: 'New Patient Registered',
        description: `Patient ${patientData.name} was registered`,
        timestamp: new Date().toISOString(),
        userId: uid,
        relatedId: patientRef.id
      });
      
      res.status(201).json({
        id: newPatient.id,
        ...newPatient.data()
      });
    } catch (error) {
      console.error('Error creating patient:', error);
      res.status(500).json({ error: 'Failed to create patient' });
    }
  });

  // Admission routes
  app.get('/api/admissions', verifyFirebaseToken, async (req: Request, res: Response) => {
    try {
      const { patientId, status, page = '1', limit = '10' } = req.query;
      const pageNumber = parseInt(page as string);
      const limitNumber = parseInt(limit as string);
      const startAt = (pageNumber - 1) * limitNumber;
      
      let admissionsQuery = db.collection('admissions');
      
      if (patientId) {
        admissionsQuery = admissionsQuery.where('patientId', '==', patientId);
      }
      
      if (status) {
        admissionsQuery = admissionsQuery.where('status', '==', status);
      }
      
      // Get total count for pagination
      const countSnapshot = await admissionsQuery.count().get();
      const total = countSnapshot.data().count;
      
      // Get paginated data
      const snapshot = await admissionsQuery
        .orderBy('admissionDate', 'desc')
        .limit(limitNumber)
        .offset(startAt)
        .get();
      
      const admissions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      res.json({
        data: admissions,
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber)
      });
    } catch (error) {
      console.error('Error getting admissions:', error);
      res.status(500).json({ error: 'Failed to get admissions' });
    }
  });
  
  app.post('/api/admissions', verifyFirebaseToken, async (req: Request, res: Response) => {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const admissionData = {
        ...req.body,
        admissionDate: new Date().toISOString(),
        createdById: uid,
        createdAt: new Date().toISOString()
      };
      
      const admissionRef = await db.collection('admissions').add(admissionData);
      const newAdmission = await admissionRef.get();
      
      // Log activity
      await db.collection('activityLogs').add({
        type: 'patient_admitted',
        title: 'Patient Admitted',
        description: `Patient was admitted as ${admissionData.admissionType}`,
        timestamp: new Date().toISOString(),
        userId: uid,
        relatedId: admissionRef.id
      });
      
      res.status(201).json({
        id: newAdmission.id,
        ...newAdmission.data()
      });
    } catch (error) {
      console.error('Error creating admission:', error);
      res.status(500).json({ error: 'Failed to create admission' });
    }
  });

  // Treatment logs routes
  app.get('/api/treatment-logs', verifyFirebaseToken, async (req: Request, res: Response) => {
    try {
      const { admissionId, patientId, page = '1', limit = '10' } = req.query;
      const pageNumber = parseInt(page as string);
      const limitNumber = parseInt(limit as string);
      const startAt = (pageNumber - 1) * limitNumber;
      
      let logsQuery = db.collection('treatmentLogs');
      
      if (admissionId) {
        logsQuery = logsQuery.where('admissionId', '==', admissionId);
      } else if (patientId) {
        logsQuery = logsQuery.where('patientId', '==', patientId);
      }
      
      // Get total count for pagination
      const countSnapshot = await logsQuery.count().get();
      const total = countSnapshot.data().count;
      
      // Get paginated data
      const snapshot = await logsQuery
        .orderBy('createdAt', 'desc')
        .limit(limitNumber)
        .offset(startAt)
        .get();
      
      const logs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      res.json({
        data: logs,
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber)
      });
    } catch (error) {
      console.error('Error getting treatment logs:', error);
      res.status(500).json({ error: 'Failed to get treatment logs' });
    }
  });
  
  app.post('/api/treatment-logs', verifyFirebaseToken, async (req: Request, res: Response) => {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const logData = {
        ...req.body,
        createdById: uid,
        createdAt: new Date().toISOString()
      };
      
      const logRef = await db.collection('treatmentLogs').add(logData);
      const newLog = await logRef.get();
      
      // Log activity
      await db.collection('activityLogs').add({
        type: 'treatment_updated',
        title: 'Treatment Updated',
        description: logData.title || 'A treatment log was updated',
        timestamp: new Date().toISOString(),
        userId: uid,
        relatedId: logRef.id
      });
      
      res.status(201).json({
        id: newLog.id,
        ...newLog.data()
      });
    } catch (error) {
      console.error('Error creating treatment log:', error);
      res.status(500).json({ error: 'Failed to create treatment log' });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard', verifyFirebaseToken, async (req: Request, res: Response) => {
    try {
      const { role, userId } = req.query;
      let stats: any = {};
      
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString();
      
      if (role === 'doctor' || role === 'nurse' || role === 'staff') {
        // Count total patients
        const patientsQuery = db.collection('patients');
        const patientsCount = await patientsQuery.count().get();
        stats.totalPatients = patientsCount.data().count;
        
        // Count recent admissions
        const admissionsQuery = db.collection('admissions')
          .where('createdAt', '>=', thirtyDaysAgoStr);
        const admissionsSnapshot = await admissionsQuery.get();
        
        let opdCount = 0;
        let ipdCount = 0;
        
        admissionsSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.admissionType === 'OPD') {
            opdCount++;
          } else if (data.admissionType === 'IPD') {
            ipdCount++;
          }
        });
        
        stats.admissions = {
          total: opdCount + ipdCount,
          opd: opdCount,
          ipd: ipdCount
        };
        
        // Calculate revenue
        const billingsQuery = db.collection('billings')
          .where('createdAt', '>=', thirtyDaysAgoStr);
        const billingsSnapshot = await billingsQuery.get();
        
        let totalRevenue = 0;
        billingsSnapshot.forEach(doc => {
          const data = doc.data();
          totalRevenue += data.amount || 0;
        });
        
        stats.revenue = totalRevenue;
        
        // Get appointments (today's treatment logs)
        const today = new Date().toISOString().split('T')[0]; // Just get YYYY-MM-DD part
        const treatmentLogsQuery = db.collection('treatmentLogs')
          .where('createdAt', '>=', today);
        const treatmentLogsCount = await treatmentLogsQuery.count().get();
        
        stats.appointments = treatmentLogsCount.data().count;
      } else if (role === 'affiliate') {
        if (!userId) {
          return res.status(400).json({ error: 'userId is required for affiliate dashboard' });
        }
        
        // Count total hospitals and doctors
        const doctorsQuery = db.collection('users')
          .where('role', '==', 'doctor')
          .where('affiliateId', '==', userId);
        const doctorsCount = await doctorsQuery.count().get();
        
        const hospitalsQuery = db.collection('users')
          .where('role', '==', 'hospital')
          .where('affiliateId', '==', userId);
        const hospitalsCount = await hospitalsQuery.count().get();
        
        stats.accounts = {
          total: doctorsCount.data().count + hospitalsCount.data().count,
          doctors: doctorsCount.data().count,
          hospitals: hospitalsCount.data().count
        };
        
        // Calculate commission
        const trackingQuery = db.collection('affiliateTracking')
          .where('affiliateId', '==', userId)
          .where('createdAt', '>=', thirtyDaysAgoStr);
        const trackingSnapshot = await trackingQuery.get();
        
        let totalCommission = 0;
        let pendingCommission = 0;
        let paidCommission = 0;
        
        trackingSnapshot.forEach(doc => {
          const data = doc.data();
          totalCommission += data.amount || 0;
          
          if (data.status === 'pending') {
            pendingCommission += data.amount || 0;
          } else if (data.status === 'paid') {
            paidCommission += data.amount || 0;
          }
        });
        
        stats.commission = {
          total: totalCommission,
          pending: pendingCommission,
          paid: paidCommission
        };
        
        // Get monthly revenue trend
        const currentYear = today.getFullYear();
        const monthlyRevenueQuery = db.collection('affiliateTracking')
          .where('affiliateId', '==', userId)
          .where('year', '==', currentYear.toString());
        const monthlyRevenueSnapshot = await monthlyRevenueQuery.get();
        
        const monthlyRevenue: Record<string, number> = {};
        
        monthlyRevenueSnapshot.forEach(doc => {
          const data = doc.data();
          const month = data.month;
          
          if (!monthlyRevenue[month]) {
            monthlyRevenue[month] = 0;
          }
          
          monthlyRevenue[month] += data.amount || 0;
        });
        
        stats.monthlyRevenue = monthlyRevenue;
      }
      
      res.json(stats);
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      res.status(500).json({ error: 'Failed to get dashboard stats' });
    }
  });
  
  // Activity logs routes
  app.get('/api/activity-logs', verifyFirebaseToken, async (req: Request, res: Response) => {
    try {
      const { userId, type, page = '1', limit = '10' } = req.query;
      const pageNumber = parseInt(page as string);
      const limitNumber = parseInt(limit as string);
      const startAt = (pageNumber - 1) * limitNumber;
      
      let logsQuery = db.collection('activityLogs');
      
      if (userId) {
        logsQuery = logsQuery.where('userId', '==', userId);
      }
      
      if (type) {
        logsQuery = logsQuery.where('type', '==', type);
      }
      
      // Get total count for pagination
      const countSnapshot = await logsQuery.count().get();
      const total = countSnapshot.data().count;
      
      // Get paginated data
      const snapshot = await logsQuery
        .orderBy('timestamp', 'desc')
        .limit(limitNumber)
        .offset(startAt)
        .get();
      
      const logs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      res.json({
        data: logs,
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber)
      });
    } catch (error) {
      console.error('Error getting activity logs:', error);
      res.status(500).json({ error: 'Failed to get activity logs' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
