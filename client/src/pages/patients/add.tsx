import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { addPatient } from "@/lib/firebase";
import PatientForm from "@/components/forms/PatientForm";
import { useAuth } from "@/context/AuthContext";

export default function AddPatient() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const handleSubmit = async (formData: any) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Add created by and doctor ID
      const patientData = {
        ...formData,
        createdById: user.uid,
        doctorId: user.role === "doctor" ? user.uid : undefined,
      };
      
      const result = await addPatient(patientData);
      
      toast({
        title: "Success",
        description: "Patient has been added successfully",
      });
      
      // Redirect to the new patient page
      setLocation(`/patients/${result.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add patient",
        variant: "destructive",
      });
      console.error("Error adding patient:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add New Patient</CardTitle>
          <CardDescription>
            Enter the patient's information to create a new record
          </CardDescription>
        </CardHeader>
        <PatientForm onSubmit={handleSubmit} isLoading={isLoading} />
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setLocation("/patients")}>
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
