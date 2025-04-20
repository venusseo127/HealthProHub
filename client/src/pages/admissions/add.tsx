import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { addAdmission, getPatientById } from "@/lib/firebase";
import AdmissionForm from "@/components/forms/AdmissionForm";
import { useAuth } from "@/context/AuthContext";

export default function AddAdmission() {
  const [isLoading, setIsLoading] = useState(false);
  const [patient, setPatient] = useState<any>(null);
  const [patientLoading, setPatientLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/admissions/add");
  const { user } = useAuth();
  
  // Check for patient ID in query parameters
  const searchParams = new URLSearchParams(window.location.search);
  const patientId = searchParams.get('patientId');

  useEffect(() => {
    if (patientId) {
      fetchPatient(patientId);
    }
  }, [patientId]);

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

  const handleSubmit = async (formData: any) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Add created by and doctor ID
      const admissionData = {
        ...formData,
        createdById: user.uid,
        doctorId: user.role === "doctor" ? user.uid : formData.doctorId,
        admissionDate: new Date().toISOString(),
        status: "active"
      };
      
      const result = await addAdmission(admissionData);
      
      toast({
        title: "Success",
        description: "Admission has been created successfully",
      });
      
      // Redirect to the admissions list
      setLocation("/admissions");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create admission",
        variant: "destructive",
      });
      console.error("Error adding admission:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create New Admission</CardTitle>
          <CardDescription>
            {patientId 
              ? `Creating admission for ${patientLoading ? 'loading...' : patient?.name || 'patient'}`
              : 'Enter patient and admission details'
            }
          </CardDescription>
        </CardHeader>
        <AdmissionForm 
          onSubmit={handleSubmit} 
          isLoading={isLoading} 
          selectedPatient={patient} 
          patientLoading={patientLoading}
        />
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setLocation("/admissions")}>
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
