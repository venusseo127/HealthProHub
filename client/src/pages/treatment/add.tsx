import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { addTreatmentLog} from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import TreatmentLogForm from "@/components/forms/TreatmentLogForm";
import { getPatientById, getAdmissions } from "@/lib/firebase";

export default function AddTreatmentLog() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [patient, setPatient] = useState<any>(null);
  const [admission, setAdmission] = useState<any>(null);
  const [patientLoading, setPatientLoading] = useState(false);

  // Check for patient ID in query parameters
  const searchParams = new URLSearchParams(window.location.search);
  const patientId = searchParams.get('patientId');

  useEffect(() => {
    if (patientId) {
      fetchPatient(patientId);
      fetchAdmissions(patientId);
    }
  }, [[patientId]]);

  const fetchPatient = async (id: string) => {
    setPatientLoading(true);
    try {
      const patientData = await getPatientById(id);
      setPatient(patientData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load patient data",
        variant: "destructive",
      });
      console.error("Error fetching patient:", error);
    } finally {
      setPatientLoading(false);
    }
  };

  const fetchAdmissions = async (id: string) => {

    try {
      const admissionData = await getAdmissions(id);
      setAdmission(admissionData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load patient admissions",
        variant: "destructive",
      });
      console.error("Error fetching admissions:", error);
    } finally {
      //setLoadingAdmissions(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const treatmentData = {
        ...formData,
        createdById: user?.uid,
        createdByName: user?.displayName,
        createdByRole: user?.role,
        doctorName: user.displayName,
        treatmentDate: new Date().toISOString(),
        patientName: patient?.name || "",
        patientAge: patient?.age || "",
        admissionType: admission?.admissionType || "",
        status: "active"
      };
      const result = await addTreatmentLog(treatmentData);

      toast({
        title: "Success",
        description: "Treatment log has been added successfully",
      });
      
      // Redirect to treatment logs list
      setLocation("/treatment");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add treatment log",
        variant: "destructive",
      });
      console.error("Error adding treatment log:", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add Treatment Log</CardTitle>
          <CardDescription>
            Record a new treatment, medication, or procedure for a patient
          </CardDescription>
        </CardHeader>
        <TreatmentLogForm 
          onSubmit={handleSubmit} 
          isLoading={isLoading}
          selectedPatient={patient} 
          patientLoading={patientLoading}
        />
      </Card>
    </div>
  );
}