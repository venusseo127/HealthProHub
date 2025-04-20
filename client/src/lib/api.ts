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
  return await apiRequest('/api/users/profile', {
    method: 'PATCH',
    body: JSON.stringify(userData),
  });
};

// Patient-related API functions
export const fetchPatients = async (params?: { doctorId?: string; page?: number; limit?: number }): Promise<{data: Patient[], total: number}> => {
  const queryParams = new URLSearchParams();
  if (params?.doctorId) queryParams.append('doctorId', params.doctorId);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  
  return await apiRequest(`/api/patients?${queryParams.toString()}`, {
    method: 'GET',
  });
};

export const fetchPatientById = async (patientId: string): Promise<Patient> => {
  return await apiRequest(`/api/patients/${patientId}`, {
    method: 'GET',
  });
};

export const createPatient = async (patientData: Partial<Patient>): Promise<Patient> => {
  return await apiRequest('/api/patients', {
    method: 'POST',
    body: JSON.stringify(patientData),
  });
};

export const updatePatient = async (patientId: string, patientData: Partial<Patient>): Promise<Patient> => {
  return await apiRequest(`/api/patients/${patientId}`, {
    method: 'PATCH',
    body: JSON.stringify(patientData),
  });
};

// Admission-related API functions
export const fetchAdmissions = async (params?: { patientId?: string; status?: string; page?: number; limit?: number }): Promise<{data: Admission[], total: number}> => {
  const queryParams = new URLSearchParams();
  if (params?.patientId) queryParams.append('patientId', params.patientId);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  
  return await apiRequest(`/api/admissions?${queryParams.toString()}`, {
    method: 'GET',
  });
};

export const fetchAdmissionById = async (admissionId: string): Promise<Admission> => {
  return await apiRequest(`/api/admissions/${admissionId}`, {
    method: 'GET',
  });
};

export const createAdmission = async (admissionData: Partial<Admission>): Promise<Admission> => {
  return await apiRequest('/api/admissions', {
    method: 'POST',
    body: JSON.stringify(admissionData),
  });
};

export const updateAdmission = async (admissionId: string, admissionData: Partial<Admission>): Promise<Admission> => {
  return await apiRequest(`/api/admissions/${admissionId}`, {
    method: 'PATCH',
    body: JSON.stringify(admissionData),
  });
};

// Treatment logs API functions
export const fetchTreatmentLogs = async (params?: { admissionId?: string; patientId?: string; page?: number; limit?: number }): Promise<{data: TreatmentLog[], total: number}> => {
  const queryParams = new URLSearchParams();
  if (params?.admissionId) queryParams.append('admissionId', params.admissionId);
  if (params?.patientId) queryParams.append('patientId', params.patientId);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  
  return await apiRequest(`/api/treatment-logs?${queryParams.toString()}`, {
    method: 'GET',
  });
};

export const fetchTreatmentLogById = async (logId: string): Promise<TreatmentLog> => {
  return await apiRequest(`/api/treatment-logs/${logId}`, {
    method: 'GET',
  });
};

export const createTreatmentLog = async (logData: Partial<TreatmentLog>): Promise<TreatmentLog> => {
  return await apiRequest('/api/treatment-logs', {
    method: 'POST',
    body: JSON.stringify(logData),
  });
};

// Billing API functions
export const fetchBillings = async (params?: { patientId?: string; status?: string; page?: number; limit?: number }): Promise<{data: Billing[], total: number}> => {
  const queryParams = new URLSearchParams();
  if (params?.patientId) queryParams.append('patientId', params.patientId);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  
  return await apiRequest(`/api/billings?${queryParams.toString()}`, {
    method: 'GET',
  });
};

export const createBilling = async (billingData: Partial<Billing>): Promise<Billing> => {
  return await apiRequest('/api/billings', {
    method: 'POST',
    body: JSON.stringify(billingData),
  });
};

export const updateBillingStatus = async (billingId: string, status: string): Promise<Billing> => {
  return await apiRequest(`/api/billings/${billingId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
};

// Inventory API functions
export const fetchInventoryItems = async (params?: { type?: string; reorderNeeded?: boolean; page?: number; limit?: number }): Promise<{data: InventoryItem[], total: number}> => {
  const queryParams = new URLSearchParams();
  if (params?.type) queryParams.append('type', params.type);
  if (params?.reorderNeeded) queryParams.append('reorderNeeded', params.reorderNeeded.toString());
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  
  return await apiRequest(`/api/inventory?${queryParams.toString()}`, {
    method: 'GET',
  });
};

export const createInventoryItem = async (itemData: Partial<InventoryItem>): Promise<InventoryItem> => {
  return await apiRequest('/api/inventory', {
    method: 'POST',
    body: JSON.stringify(itemData),
  });
};

export const updateInventoryItem = async (itemId: string, itemData: Partial<InventoryItem>): Promise<InventoryItem> => {
  return await apiRequest(`/api/inventory/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify(itemData),
  });
};

// Diet plan API functions
export const fetchDietPlans = async (params?: { patientId?: string; page?: number; limit?: number }): Promise<{data: DietPlan[], total: number}> => {
  const queryParams = new URLSearchParams();
  if (params?.patientId) queryParams.append('patientId', params.patientId);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  
  return await apiRequest(`/api/diet-plans?${queryParams.toString()}`, {
    method: 'GET',
  });
};

export const createDietPlan = async (dietData: Partial<DietPlan>): Promise<DietPlan> => {
  return await apiRequest('/api/diet-plans', {
    method: 'POST',
    body: JSON.stringify(dietData),
  });
};

export const updateDietPlan = async (planId: string, dietData: Partial<DietPlan>): Promise<DietPlan> => {
  return await apiRequest(`/api/diet-plans/${planId}`, {
    method: 'PATCH',
    body: JSON.stringify(dietData),
  });
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
  
  return await apiRequest(`/api/affiliate-tracking?${queryParams.toString()}`, {
    method: 'GET',
  });
};

export const getAffiliateStats = async (affiliateId: string): Promise<any> => {
  return await apiRequest(`/api/affiliate-tracking/${affiliateId}/stats`, {
    method: 'GET',
  });
};

// Dashboard API functions
export const fetchDashboardStats = async (role: string, userId: string): Promise<any> => {
  return await apiRequest(`/api/dashboard?role=${role}&userId=${userId}`, {
    method: 'GET',
  });
};

// Activity logs
export const fetchActivityLogs = async (params?: { userId?: string; type?: string; page?: number; limit?: number }): Promise<any> => {
  const queryParams = new URLSearchParams();
  if (params?.userId) queryParams.append('userId', params.userId);
  if (params?.type) queryParams.append('type', params.type);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  
  return await apiRequest(`/api/activity-logs?${queryParams.toString()}`, {
    method: 'GET',
  });
};

// Reports
export const generateReport = async (type: string, params: Record<string, any>): Promise<any> => {
  return await apiRequest('/api/reports/generate', {
    method: 'POST',
    body: JSON.stringify({
      type,
      params
    }),
  });
};