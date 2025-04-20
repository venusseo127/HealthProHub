// User types
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  permissions?: string[];
  photoURL?: string;
  isActive: boolean;
  doctorId?: string;
  hospitalId?: string;
  affiliateId?: string;
  createdAt: string;
}

export type UserRole = 'doctor' | 'nurse' | 'staff' | 'affiliate' | 'hospital';

// Patient types
export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  contact: string;
  address?: string;
  allergies?: string;
  bloodGroup?: string;
  doctorId?: string;
  doctorName?: string;
  createdById: string;
  createdAt: string;
}

// Admission types
export interface Admission {
  id: string;
  patientId: string;
  patientName?: string;
  admissionType: 'OPD' | 'IPD';
  admissionDate: string;
  dischargeDate?: string;
  status: 'active' | 'discharged';
  roomNumber?: string;
  note?: string;
  doctorId: string;
  doctorName?: string;
  createdById: string;
  createdAt: string;
}

// Treatment log types
export interface TreatmentLog {
  id: string;
  admissionId: string;
  patientId: string;
  patientName?: string;
  title?: string;
  notes: string;
  vitals?: Record<string, string | number>;
  medications?: Medication[];
  treatments?: string[];
  doctorId: string;
  doctorName?: string;
  createdById: string;
  createdAt: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency?: string;
  duration?: string;
}

// Billing types
export interface Billing {
  id: string;
  patientId: string;
  patientName?: string;
  admissionId?: string;
  admissionType?: string;
  invoiceNumber: string;
  amount: number;
  items?: BillingItem[];
  status: 'pending' | 'paid';
  createdById: string;
  createdAt: string;
  paidAt?: string;
}

export interface BillingItem {
  description: string;
  amount: number;
  quantity?: number;
}

// Inventory types
export interface InventoryItem {
  id: string;
  name: string;
  type: 'medicine' | 'supply' | 'equipment';
  quantity: number;
  unit: string;
  reorderLevel: number;
  price?: number;
  createdById: string;
  updatedAt: string;
}

// Diet plan types
export interface DietPlan {
  id: string;
  patientId: string;
  patientName?: string;
  admissionId?: string;
  plan: Record<string, string[]>;
  specialInstructions?: string;
  createdById: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

// Affiliate tracking types
export interface AffiliateTracking {
  id: string;
  affiliateId: string;
  userId: string;
  userName?: string;
  userAccount?: string;
  userType: 'doctor' | 'hospital';
  amount: number;
  status: 'pending' | 'paid';
  month: string;
  year: string;
  paidAt?: string;
  createdAt: string;
}

// Dashboard statistics types
export interface DashboardStats {
  totalPatients: number;
  appointments: number;
  admissions: {
    total: number;
    opd: number;
    ipd: number;
  };
  revenue: number;
  accounts?: {
    total: number;
    active: number;
    pending: number;
  };
  commission?: {
    total: number;
    pending: number;
    paid: number;
  };
}

// Activity log types
export interface ActivityLog {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  details?: string;
  icon?: string;
  relatedId?: string;
}

export type ActivityType = 
  | 'patient_registered'
  | 'treatment_updated'
  | 'payment_received'
  | 'patient_admitted'
  | 'staff_account_created'
  | 'doctor_account_created'
  | 'hospital_account_created'
  | 'commission_received'
  | 'diet_updated'
  | 'inventory_updated';

// Form state types
export interface FormState {
  isLoading: boolean;
  isSubmitting: boolean;
  isSuccess: boolean;
  error?: string;
}
