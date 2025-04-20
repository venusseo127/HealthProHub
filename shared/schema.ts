import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("staff"),
  displayName: text("display_name"),
  firebaseUid: text("firebase_uid").unique(),
  affiliateId: integer("affiliate_id").references(() => users.id),
  doctorId: integer("doctor_id").references(() => users.id),
  hospitalId: integer("hospital_id").references(() => users.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  isActive: true,
  createdAt: true,
});

// Patient Model
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(),
  contact: text("contact").notNull(),
  address: text("address"),
  allergies: text("allergies"),
  bloodGroup: text("blood_group"),
  createdById: integer("created_by_id").references(() => users.id).notNull(),
  doctorId: integer("doctor_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
  createdAt: true,
});

// Admission Model
export const admissions = pgTable("admissions", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  admissionType: text("admission_type").notNull(), // OPD/IPD
  admissionDate: timestamp("admission_date").defaultNow().notNull(),
  dischargeDate: timestamp("discharge_date"),
  status: text("status").notNull().default("active"),
  roomNumber: text("room_number"),
  createdById: integer("created_by_id").references(() => users.id).notNull(),
  doctorId: integer("doctor_id").references(() => users.id).notNull(),
});

export const insertAdmissionSchema = createInsertSchema(admissions).omit({
  id: true,
  dischargeDate: true,
});

// Treatment Logs Model
export const treatmentLogs = pgTable("treatment_logs", {
  id: serial("id").primaryKey(),
  admissionId: integer("admission_id").references(() => admissions.id).notNull(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  notes: text("notes").notNull(),
  treatments: jsonb("treatments"),
  vitals: jsonb("vitals"),
  medications: jsonb("medications"),
  createdById: integer("created_by_id").references(() => users.id).notNull(),
  doctorId: integer("doctor_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTreatmentLogSchema = createInsertSchema(treatmentLogs).omit({
  id: true,
  createdAt: true,
});

// Billing Model
export const billings = pgTable("billings", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  admissionId: integer("admission_id").references(() => admissions.id),
  invoiceNumber: text("invoice_number").notNull(),
  amount: integer("amount").notNull(),
  items: jsonb("items"),
  status: text("status").notNull().default("pending"),
  createdById: integer("created_by_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  paidAt: timestamp("paid_at"),
});

export const insertBillingSchema = createInsertSchema(billings).omit({
  id: true,
  createdAt: true,
  paidAt: true,
});

// Inventory Model
export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  quantity: integer("quantity").notNull().default(0),
  unit: text("unit").notNull(),
  reorderLevel: integer("reorder_level").notNull().default(10),
  createdById: integer("created_by_id").references(() => users.id).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({
  id: true,
  updatedAt: true,
});

// Diet Plans Model
export const dietPlans = pgTable("diet_plans", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  admissionId: integer("admission_id").references(() => admissions.id),
  plan: jsonb("plan").notNull(),
  specialInstructions: text("special_instructions"),
  createdById: integer("created_by_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDietPlanSchema = createInsertSchema(dietPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Affiliate Tracking Model
export const affiliateTracking = pgTable("affiliate_tracking", {
  id: serial("id").primaryKey(),
  affiliateId: integer("affiliate_id").references(() => users.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  userType: text("user_type").notNull(), // doctor, hospital
  amount: integer("amount").notNull(),
  status: text("status").notNull().default("pending"),
  month: text("month").notNull(),
  year: integer("year").notNull(),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAffiliateTrackingSchema = createInsertSchema(affiliateTracking).omit({
  id: true,
  createdAt: true,
  paidAt: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;

export type Admission = typeof admissions.$inferSelect;
export type InsertAdmission = z.infer<typeof insertAdmissionSchema>;

export type TreatmentLog = typeof treatmentLogs.$inferSelect;
export type InsertTreatmentLog = z.infer<typeof insertTreatmentLogSchema>;

export type Billing = typeof billings.$inferSelect;
export type InsertBilling = z.infer<typeof insertBillingSchema>;

export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;

export type DietPlan = typeof dietPlans.$inferSelect;
export type InsertDietPlan = z.infer<typeof insertDietPlanSchema>;

export type AffiliateTracking = typeof affiliateTracking.$inferSelect;
export type InsertAffiliateTracking = z.infer<typeof insertAffiliateTrackingSchema>;
