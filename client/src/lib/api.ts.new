import type { User, Patient, Admission, TreatmentLog, Billing, InventoryItem, DietPlan, AffiliateTracking } from '../types';
import { getAuth } from 'firebase/auth';

// Helper function to handle API requests with Firebase authentication
async function handleApiRequest<T>(method: string, url: string, data?: any): Promise<T> {
  try {
    // Get Firebase auth token for authenticated requests
    const auth = getAuth();
    const currentUser = auth.currentUser;
    let authToken = '';
    
    if (currentUser) {
      authToken = await currentUser.getIdToken();
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add authorization header if token exists
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const response = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }
    
    return await response.json() as T;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

// User-related API functions
export const fetchCurrentUser = async (): Promise<User> => {
  return await handleApiRequest<User>('GET', '/api/users/me');
};

export const updateUserProfile = async (userData: Partial<User>): Promise<User> => {
  return await handleApiRequest<User>('PATCH', '/api/users/profile', userData);
};

// Patient-related API functions
export const fetchPatients = async (params?: { doctorId?: string; page?: number; limit?: number }): Promise<{data: Patient[], total: number}> => {
  const queryParams = new URLSearchParams();
  if (params?.doctorId) queryParams.append('doctorId', params.doctorId);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  
  return await handleApiRequest<{data: Patient[], total: number}>('GET', `/api/patients?${queryParams.toString()}`);
};

export const fetchPatientById = async (patientId: string): Promise<Patient> => {
  return await handleApiRequest<Patient>('GET', `/api/patients/${patientId}`);
};

export const createPatient = async (patientData: Partial<Patient>): Promise<Patient> => {
  return await handleApiRequest<Patient>('POST', '/api/patients', patientData);
};

export const updatePatient = async (patientId: string, patientData: Partial<Patient>): Promise<Patient> => {
  return await handleApiRequest<Patient>('PATCH', `/api/patients/${patientId}`, patientData);
};

// Admission-related API functions
export const fetchAdmissions = async (params?: { patientId?: string; status?: string; page?: number; limit?: number }): Promise<{data: Admission[], total: number}> => {
  const queryParams = new URLSearchParams();
  if (params?.patientId) queryParams.append('patientId', params.patientId);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  
  return await handleApiRequest<{data: Admission[], total: number}>('GET', `/api/admissions?${queryParams.toString()}`);
};

export const fetchAdmissionById = async (admissionId: string): Promise<Admission> => {
  return await handleApiRequest<Admission>('GET', `/api/admissions/${admissionId}`);
};

export const createAdmission = async (admissionData: Partial<Admission>): Promise<Admission> => {
  return await handleApiRequest<Admission>('POST', '/api/admissions', admissionData);
};

export const updateAdmission = async (admissionId: string, admissionData: Partial<Admission>): Promise<Admission> => {
  return await handleApiRequest<Admission>('PATCH', `/api/admissions/${admissionId}`, admissionData);
};

// Treatment logs API functions
export const fetchTreatmentLogs = async (params?: { admissionId?: string; patientId?: string; page?: number; limit?: number }): Promise<{data: TreatmentLog[], total: number}> => {
  const queryParams = new URLSearchParams();
  if (params?.admissionId) queryParams.append('admissionId', params.admissionId);
  if (params?.patientId) queryParams.append('patientId', params.patientId);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  
  return await handleApiRequest<{data: TreatmentLog[], total: number}>('GET', `/api/treatment-logs?${queryParams.toString()}`);
};

export const fetchTreatmentLogById = async (logId: string): Promise<TreatmentLog> => {
  return await handleApiRequest<TreatmentLog>('GET', `/api/treatment-logs/${logId}`);
};

export const createTreatmentLog = async (logData: Partial<TreatmentLog>): Promise<TreatmentLog> => {
  return await handleApiRequest<TreatmentLog>('POST', '/api/treatment-logs', logData);
};

// Billing API functions
export const fetchBillings = async (params?: { patientId?: string; status?: string; page?: number; limit?: number }): Promise<{data: Billing[], total: number}> => {
  const queryParams = new URLSearchParams();
  if (params?.patientId) queryParams.append('patientId', params.patientId);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  
  return await handleApiRequest<{data: Billing[], total: number}>('GET', `/api/billings?${queryParams.toString()}`);
};

export const createBilling = async (billingData: Partial<Billing>): Promise<Billing> => {
  return await handleApiRequest<Billing>('POST', '/api/billings', billingData);
};

export const updateBillingStatus = async (billingId: string, status: string): Promise<Billing> => {
  return await handleApiRequest<Billing>('PATCH', `/api/billings/${billingId}/status`, { status });
};

// Inventory API functions
export const fetchInventoryItems = async (params?: { type?: string; reorderNeeded?: boolean; page?: number; limit?: number }): Promise<{data: InventoryItem[], total: number}> => {
  const queryParams = new URLSearchParams();
  if (params?.type) queryParams.append('type', params.type);
  if (params?.reorderNeeded) queryParams.append('reorderNeeded', params.reorderNeeded.toString());
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  
  return await handleApiRequest<{data: InventoryItem[], total: number}>('GET', `/api/inventory?${queryParams.toString()}`);
};

export const createInventoryItem = async (itemData: Partial<InventoryItem>): Promise<InventoryItem> => {
  return await handleApiRequest<InventoryItem>('POST', '/api/inventory', itemData);
};

export const updateInventoryItem = async (itemId: string, itemData: Partial<InventoryItem>): Promise<InventoryItem> => {
  return await handleApiRequest<InventoryItem>('PATCH', `/api/inventory/${itemId}`, itemData);
};

// Diet plan API functions
export const fetchDietPlans = async (params?: { patientId?: string; page?: number; limit?: number }): Promise<{data: DietPlan[], total: number}> => {
  const queryParams = new URLSearchParams();
  if (params?.patientId) queryParams.append('patientId', params.patientId);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  
  return await handleApiRequest<{data: DietPlan[], total: number}>('GET', `/api/diet-plans?${queryParams.toString()}`);
};

export const createDietPlan = async (dietData: Partial<DietPlan>): Promise<DietPlan> => {
  return await handleApiRequest<DietPlan>('POST', '/api/diet-plans', dietData);
};

export const updateDietPlan = async (planId: string, dietData: Partial<DietPlan>): Promise<DietPlan> => {
  return await handleApiRequest<DietPlan>('PATCH', `/api/diet-plans/${planId}`, dietData);
};

// Affiliate tracking API functions
export const fetchAffiliateTrackings = async (params?: { affiliateId?: string; status?: string; year?: string; month?: string; page?: number; limit?: number }): Promise<{data: AffiliateTracking[], total: number}> => {
  const queryParams = new URLSearchParams();
  if (params?.affiliateId) queryParams.append('affiliateId', params.affiliateId);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.year) queryParams.append('year', params.year);
  if (params?.month) queryParams.append('month', params.month);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  
  return await handleApiRequest<{data: AffiliateTracking[], total: number}>('GET', `/api/affiliate-tracking?${queryParams.toString()}`);
};

export const getAffiliateStats = async (affiliateId: string): Promise<any> => {
  return await handleApiRequest<any>('GET', `/api/affiliate-tracking/${affiliateId}/stats`);
};

// Dashboard API functions
export const fetchDashboardStats = async (role: string, userId: string): Promise<any> => {
  return await handleApiRequest<any>('GET', `/api/dashboard?role=${role}&userId=${userId}`);
};

// Activity logs
export const fetchActivityLogs = async (params?: { userId?: string; type?: string; page?: number; limit?: number }): Promise<any> => {
  const queryParams = new URLSearchParams();
  if (params?.userId) queryParams.append('userId', params.userId);
  if (params?.type) queryParams.append('type', params.type);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  
  return await handleApiRequest<any>('GET', `/api/activity-logs?${queryParams.toString()}`);
};

// Reports
export const generateReport = async (type: string, params: Record<string, any>): Promise<any> => {
  return await handleApiRequest<any>('POST', '/api/reports/generate', {
    type,
    params
  });
};