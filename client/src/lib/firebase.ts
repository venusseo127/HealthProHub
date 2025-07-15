import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile, 
  sendPasswordResetEmail, 
  onAuthStateChanged,
  User
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Firebase config - use environment variables
const firebaseConfig = {
  apiKey: "AIzaSyCZt39VzN9nt5vtvJiJn5GWxE_1iHcdGtA",
  authDomain: "healthcare-management-de627.firebaseapp.com",
  projectId: "healthcare-management-de627",
  storageBucket: "healthcare-management-de627.firebasestorage.app",
  messagingSenderId: "630206916469",
  appId: "1:630206916469:web:d981fe8508e3c2d82d953c",
  measurementId: "G-QKHZCNWL0Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
let messaging: any;

// Only initialize messaging in browser environment with service worker support
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  messaging = getMessaging(app);
}

// Auth functions
export const registerUser = async (email: string, password: string, name: string, role: string, subscription: string, accountId: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with display name
    await updateProfile(userCredential.user, {
      displayName: name
    });
    
    // Create user document in Firestore with role
    await setDoc(doc(db, "users", userCredential.user.uid), {
      uid: accountId,
      email,
      displayName: name,
      subscription: subscription,
      role,
      createdAt: new Date().toISOString(),
      isActive: true
    });
    
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Get additional user data from Firestore
    const user = userCredential.user;
    const userData = await getUserData(user);
    
    return userData;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  return await signOut(auth);
};

export const resetPassword = async (email: string) => {
  return await sendPasswordResetEmail(auth, email);
};

// Get user with additional data from Firestore
export const getUserData = async (user: User) => {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return {
      ...user,
      ...userSnap.data()
    };
  }
  
  return user;
};
export const getUserById = async (userId: string) => {
  try {
    const userSnap = await getDoc(doc(db, "users", userId));
    
    if (userSnap.exists()) {
      return {
        id: userSnap.id,
        ...userSnap.data()
      };
    }
    
    return null;
  } catch (error) {
    throw error;
  }
};
// Patient functions
export const addPatient = async (patientData: any) => {
  try {
    const docRef = await addDoc(collection(db, "patients"), {
      ...patientData,
      createdAt: new Date().toISOString()
    });
    
    // Return both the document reference and the ID
    return {
      id: docRef.id,
      ...patientData,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error adding patient:", error);
    throw error;
  }
};

export const getPatients = async (doctorId?: string, lastVisible?: QueryDocumentSnapshot<any>, pageSize = 10) => {
  try {
    let patientQuery;
    
    if (doctorId) {
      patientQuery = query(
        collection(db, "patients"), 
        where("doctorId", "==", doctorId),
        orderBy("createdAt", "desc"),
        limit(pageSize)
      );
    } else {
      patientQuery = query(
        collection(db, "patients"),
        orderBy("createdAt", "desc"),
        limit(pageSize)
      );
    }
    
    // If we have a cursor, start after it
    if (lastVisible) {
      patientQuery = query(
        patientQuery,
        startAfter(lastVisible)
      );
    }
    
    const querySnapshot = await getDocs(patientQuery);
    const patients: any[] = [];
    
    querySnapshot.forEach((doc) => {
      patients.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Get the last document for pagination
    const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

    return {
      patients,
      lastVisible: lastVisibleDoc
    };
  } catch (error) {
    throw error;
  }
};

export const getPatientById = async (patientId: string) => {
  try {
    const patientDoc = await getDoc(doc(db, "patients", patientId));
    
    if (patientDoc.exists()) {
      return {
        id: patientDoc.id,
        ...patientDoc.data()
      };
    }
    
    return null;
  } catch (error) {
    throw error;
  }
};

export const updatePatient = async (patientId: string, patientData: any) => {
  try {
    await updateDoc(doc(db, "patients", patientId), patientData);
    return patientId;
  } catch (error) {
    throw error;
  }
};

// Admission functions
export const addAdmission = async (admissionData: any) => {
  try {
    const docRef = await addDoc(collection(db, "admissions"), {
      ...admissionData,
      admissionDate: new Date().toISOString(),
      createdAt: new Date().toISOString()
    });
    
    return {
      id: docRef.id,
      ...admissionData,
      admissionDate: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error adding admission:", error);
    throw error;
  }
};
export const getAdmissionById = async (admissionId: string) => {
  try {
    const admissionDoc = await getDoc(doc(db, "admissions", admissionId));
    
    if (admissionDoc.exists()) {
      return {
        id: admissionDoc.id,
        ...admissionDoc.data()
      };
    }
    
    return null;
  } catch (error) {
    throw error;
  }
};

export const getAdmissions = async (patientId?: string, status?: string, lastVisible?: QueryDocumentSnapshot<any>, pageSize = 10) => {
  try {
    let admissionQuery;
    
    if (patientId && status) {
      admissionQuery = query(
        collection(db, "admissions"), 
        where("patientId", "==", patientId),
        where("status", "==", status),
        orderBy("admissionDate", "desc"),
        limit(pageSize)
      );
    } else if (patientId) {
      admissionQuery = query(
        collection(db, "admissions"), 
        where("patientId", "==", patientId),
        orderBy("admissionDate", "desc"),
        limit(pageSize)
      );
    } else if (status) {
      admissionQuery = query(
        collection(db, "admissions"), 
        where("status", "==", status),
        orderBy("admissionDate", "desc"),
        limit(pageSize)
      );
    } else {
      admissionQuery = query(
        collection(db, "admissions"),
        orderBy("admissionDate", "desc"),
        limit(pageSize)
      );
    }
    
    // If we have a cursor, start after it
    if (lastVisible) {
      admissionQuery = query(
        admissionQuery,
        startAfter(lastVisible)
      );
    }
    
    const querySnapshot = await getDocs(admissionQuery);
    const admissions: any[] = [];
    
    querySnapshot.forEach((doc) => {
      admissions.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Get the last document for pagination
    const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    return {
      admissions,
      lastVisible: lastVisibleDoc
    };
  } catch (error) {
    throw error;
  }
};

// Treatment logs
export const addTreatmentLog = async (treatmentData: any) => {
  try {
    const docRef = await addDoc(collection(db, "treatmentLogs"), {
      ...treatmentData,
      createdAt: new Date().toISOString()
    });
    
    return {
      id: docRef.id,
      ...treatmentData,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error adding treatment log:", error);
    throw error;
  }
};

export const getTreatmentLogs = async (admissionId?: string, patientId?: string, lastVisible?: QueryDocumentSnapshot<any>, pageSize = 10) => {
  try {
    let treatmentQuery;
    
    if (admissionId) {
      treatmentQuery = query(
        collection(db, "treatmentLogs"), 
        where("admissionId", "==", admissionId),
        orderBy("createdAt", "desc"),
        limit(pageSize)
      );
    } else if (patientId) {
      treatmentQuery = query(
        collection(db, "treatmentLogs"), 
        where("patientId", "==", patientId),
        orderBy("createdAt", "desc"),
        limit(pageSize)
      );
    } else {
      treatmentQuery = query(
        collection(db, "treatmentLogs"),
        orderBy("createdAt", "desc"),
        limit(pageSize)
      );
    }
    
    // If we have a cursor, start after it
    if (lastVisible) {
      treatmentQuery = query(
        treatmentQuery,
        startAfter(lastVisible)
      );
    }
    
    const querySnapshot = await getDocs(treatmentQuery);
    const treatments: any[] = [];
    
    querySnapshot.forEach((doc) => {
      treatments.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Get the last document for pagination
    const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    return {
      treatments,
      lastVisible: lastVisibleDoc
    };
  } catch (error) {
    throw error;
  }
};

// Billing
export const addBilling = async (billingData: any) => {
  try {
    // Generate invoice number
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    return await addDoc(collection(db, "billings"), {
      ...billingData,
      invoiceNumber,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    throw error;
  }
};

export const getBillings = async (patientId?: string, status?: string, lastVisible?: QueryDocumentSnapshot<any>, pageSize = 10) => {
  try {
    let billingQuery;
    
    if (patientId && status) {
      billingQuery = query(
        collection(db, "billings"), 
        where("patientId", "==", patientId),
        where("status", "==", status),
        orderBy("createdAt", "desc"),
        limit(pageSize)
      );
    } else if (patientId) {
      billingQuery = query(
        collection(db, "billings"), 
        where("patientId", "==", patientId),
        orderBy("createdAt", "desc"),
        limit(pageSize)
      );
    } else if (status) {
      billingQuery = query(
        collection(db, "billings"), 
        where("status", "==", status),
        orderBy("createdAt", "desc"),
        limit(pageSize)
      );
    } else {
      billingQuery = query(
        collection(db, "billings"),
        orderBy("createdAt", "desc"),
        limit(pageSize)
      );
    }
    
    // If we have a cursor, start after it
    if (lastVisible) {
      billingQuery = query(
        billingQuery,
        startAfter(lastVisible)
      );
    }
    
    const querySnapshot = await getDocs(billingQuery);
    const billings: any[] = [];
    
    querySnapshot.forEach((doc) => {
      billings.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Get the last document for pagination
    const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    return {
      billings,
      lastVisible: lastVisibleDoc
    };
  } catch (error) {
    throw error;
  }
};

// Inventory
export const addInventoryItem = async (itemData: any) => {
  try {
    return await addDoc(collection(db, "inventory"), {
      ...itemData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    throw error;
  }
};

export const getInventoryItems = async (type?: string, reorderNeeded?: boolean, lastVisible?: QueryDocumentSnapshot<any>, pageSize = 10) => {
  try {
    let inventoryQuery;
    
    if (type && reorderNeeded) {
      inventoryQuery = query(
        collection(db, "inventory"), 
        where("type", "==", type),
        where("quantity", "<=", "reorderLevel"),
        orderBy("updatedAt", "desc"),
        limit(pageSize)
      );
    } else if (type) {
      inventoryQuery = query(
        collection(db, "inventory"), 
        where("type", "==", type),
        orderBy("updatedAt", "desc"),
        limit(pageSize)
      );
    } else if (reorderNeeded) {
      inventoryQuery = query(
        collection(db, "inventory"), 
        where("quantity", "<=", "reorderLevel"),
        orderBy("updatedAt", "desc"),
        limit(pageSize)
      );
    } else {
      inventoryQuery = query(
        collection(db, "inventory"),
        orderBy("updatedAt", "desc"),
        limit(pageSize)
      );
    }
    
    // If we have a cursor, start after it
    if (lastVisible) {
      inventoryQuery = query(
        inventoryQuery,
        startAfter(lastVisible)
      );
    }
    
    const querySnapshot = await getDocs(inventoryQuery);
    const items: any[] = [];
    
    querySnapshot.forEach((doc) => {
      items.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Get the last document for pagination
    const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    return {
      items,
      lastVisible: lastVisibleDoc
    };
  } catch (error) {
    throw error;
  }
};

// Diet Plans
export const addDietPlan = async (dietData: any) => {
  try {
    return await addDoc(collection(db, "dietPlans"), {
      ...dietData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    throw error;
  }
};

export const getDietPlans = async (patientId?: string, lastVisible?: QueryDocumentSnapshot<any>, pageSize = 10) => {
  try {
    let dietQuery;
    
    if (patientId) {
      dietQuery = query(
        collection(db, "dietPlans"), 
        where("patientId", "==", patientId),
        orderBy("updatedAt", "desc"),
        limit(pageSize)
      );
    } else {
      dietQuery = query(
        collection(db, "dietPlans"),
        orderBy("updatedAt", "desc"),
        limit(pageSize)
      );
    }
    
    // If we have a cursor, start after it
    if (lastVisible) {
      dietQuery = query(
        dietQuery,
        startAfter(lastVisible)
      );
    }
    
    const querySnapshot = await getDocs(dietQuery);
    const diets: any[] = [];
    
    querySnapshot.forEach((doc) => {
      diets.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Get the last document for pagination
    const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    return {
      diets,
      lastVisible: lastVisibleDoc
    };
  } catch (error) {
    throw error;
  }
};

// Staff management
export const addStaffMember = async (staffData: any, password: string) => {
  try {
    // Create auth account
    const userCredential = await createUserWithEmailAndPassword(auth, staffData.email, password);
    
    // Update profile with display name
    await updateProfile(userCredential.user, {
      displayName: staffData.name
    });
    
    // Create user document in Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      uid: userCredential.user.uid,
      email: staffData.email,
      displayName: staffData.name,
      role: staffData.role,
      permissions: staffData.permissions || [],
      doctorId: staffData.doctorId,
      //hospitalId: staffData.hospitalId,
      createdAt: new Date().toISOString(),
      isActive: true
    });
    
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const getStaffMembers = async (doctorId?: string, hospitalId?: string, role?: string, lastVisible?: QueryDocumentSnapshot<any>, pageSize = 10) => {
  try {
    let staffQuery;
    
    if (doctorId && role) {
      staffQuery = query(
        collection(db, "users"), 
        where("doctorId", "==", doctorId),
        where("role", "==", role),
        limit(pageSize)
      );
    } else if (doctorId) {
      staffQuery = query(
        collection(db, "users"), 
        where("doctorId", "==", doctorId),
        limit(pageSize)
      );
    } else if (hospitalId && role) {
      staffQuery = query(
        collection(db, "users"), 
        where("hospitalId", "==", hospitalId),
        where("role", "==", role),
        limit(pageSize)
      );
    } else if (hospitalId) {
      staffQuery = query(
        collection(db, "users"), 
        where("hospitalId", "==", hospitalId),
        limit(pageSize)
      );
    } else if (role) {
      staffQuery = query(
        collection(db, "users"), 
        where("role", "==", role),
        limit(pageSize)
      );
    } else {
      staffQuery = query(
        collection(db, "users"),
        limit(pageSize)
      );
    }
    
    // If we have a cursor, start after it
    if (lastVisible) {
      staffQuery = query(
        staffQuery,
        startAfter(lastVisible)
      );
    }
    
    const querySnapshot = await getDocs(staffQuery);
    const staff: any[] = [];
    
    querySnapshot.forEach((doc) => {
      // Don't include the auth fields
      const userData = doc.data();
      delete userData.stsTokenManager;
      
      staff.push({
        id: doc.id,
        ...userData
      });
    });
    
    // Get the last document for pagination
    const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    return {
      staff,
      lastVisible: lastVisibleDoc
    };
  } catch (error) {
    throw error;
  }
};

// Affiliate functions
export const addAffiliateTracking = async (trackingData: any) => {
  try {
    return await addDoc(collection(db, "affiliateTracking"), {
      ...trackingData,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    throw error;
  }
};

export const getAffiliateTracking = async (affiliateId?: string, status?: string, lastVisible?: QueryDocumentSnapshot<any>, pageSize = 10) => {
  try {
    let trackingQuery;
    
    if (affiliateId && status) {
      trackingQuery = query(
        collection(db, "affiliateTracking"), 
        where("affiliateId", "==", affiliateId),
        where("status", "==", status),
        orderBy("createdAt", "desc"),
        limit(pageSize)
      );
    } else if (affiliateId) {
      trackingQuery = query(
        collection(db, "affiliateTracking"), 
        where("affiliateId", "==", affiliateId),
        orderBy("createdAt", "desc"),
        limit(pageSize)
      );
    } else if (status) {
      trackingQuery = query(
        collection(db, "affiliateTracking"), 
        where("status", "==", status),
        orderBy("createdAt", "desc"),
        limit(pageSize)
      );
    } else {
      trackingQuery = query(
        collection(db, "affiliateTracking"),
        orderBy("createdAt", "desc"),
        limit(pageSize)
      );
    }
    
    // If we have a cursor, start after it
    if (lastVisible) {
      trackingQuery = query(
        trackingQuery,
        startAfter(lastVisible)
      );
    }
    
    const querySnapshot = await getDocs(trackingQuery);
    const tracking: any[] = [];
    
    querySnapshot.forEach((doc) => {
      tracking.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Get the last document for pagination
    const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    return {
      tracking,
      lastVisible: lastVisibleDoc
    };
  } catch (error) {
    throw error;
  }
};

// Utilities
export const uploadFile = async (file: File, path: string) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    throw error;
  }
};

// Notifications
export const requestNotificationPermission = async () => {
  try {
    if (!messaging) return null;
    
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      const token = await getToken(messaging);
      return token;
    }
    
    return null;
  } catch (error) {
    console.error('Notification permission error:', error);
    return null;
  }
};

export const onMessageListener = () => {
  if (!messaging) return;
  
  return onMessage(messaging, (payload) => {
    return payload;
  });
};

// Export Firebase instances
export { app, auth, db, storage, messaging, onAuthStateChanged };
