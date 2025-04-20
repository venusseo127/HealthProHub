import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function TreatmentDetails({ params }: { params: { id: string } }) {
  const [treatment, setTreatment] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { id } = params;

  useEffect(() => {
    const fetchTreatmentData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Fetch treatment log
        const treatmentDoc = await getDoc(doc(db, "treatmentLogs", id));
        
        if (!treatmentDoc.exists()) {
          toast({
            title: "Not found",
            description: "The treatment log was not found",
            variant: "destructive",
          });
          setLocation("/treatment");
          return;
        }
        
        const treatmentData = { id: treatmentDoc.id, ...treatmentDoc.data() };
        setTreatment(treatmentData);
        
        // Fetch patient data if patientId exists
        if (treatmentData.patientId) {
          const patientDoc = await getDoc(doc(db, "patients", treatmentData.patientId));
          if (patientDoc.exists()) {
            setPatient({ id: patientDoc.id, ...patientDoc.data() });
          }
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load treatment details",
          variant: "destructive",
        });
        console.error("Error fetching treatment details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTreatmentData();
  }, [id, toast, setLocation]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto animate-pulse">
        <Card>
          <CardHeader>
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
              <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
              <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!treatment) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium">Treatment log not found</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              The treatment log you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button className="mt-6" onClick={() => setLocation("/treatment")}>
              Back to Treatment Logs
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Treatment Details</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setLocation("/treatment")}>
            Back to List
          </Button>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{treatment.title || "Treatment"}</CardTitle>
              <CardDescription>
                {new Date(treatment.createdAt).toLocaleDateString()} at {new Date(treatment.createdAt).toLocaleTimeString()}
              </CardDescription>
            </div>
            <Badge>{treatment.treatmentType || "general"}</Badge>
          </div>
          <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Created by: {treatment.createdByName || "Unknown"} ({treatment.createdByRole || "Staff"})
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {patient && (
            <div className="p-4 border rounded-md bg-slate-50 dark:bg-slate-900">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-medium">Patient Information</h3>
                  <p className="text-lg">{patient.name}</p>
                  <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {patient.gender === "M" ? "Male" : patient.gender === "F" ? "Female" : "Other"}, {patient.age} years
                  </div>
                  <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {patient.contact}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setLocation(`/patients/${patient.id}`)}>
                  View Patient
                </Button>
              </div>
            </div>
          )}
          
          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
              {treatment.description}
            </p>
          </div>
          
          {treatment.treatmentType === "medication" && (
            <div>
              <h3 className="font-medium mb-2">Medication Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-500 dark:text-slate-400">Medication Name</Label>
                  <div className="font-medium">{treatment.medication || "Not specified"}</div>
                </div>
                <div>
                  <Label className="text-slate-500 dark:text-slate-400">Dosage & Frequency</Label>
                  <div className="font-medium">{treatment.dosage || "Not specified"}</div>
                </div>
              </div>
            </div>
          )}
          
          {treatment.notes && (
            <div>
              <h3 className="font-medium mb-2">Additional Notes</h3>
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {treatment.notes}
              </p>
            </div>
          )}
          
          {treatment.admissionId && (
            <div className="p-4 border rounded-md">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-medium">Related Admission</h3>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    This treatment is part of a hospital admission
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setLocation(`/admissions/${treatment.admissionId}`)}>
                  View Admission
                </Button>
              </div>
            </div>
          )}

        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4 items-start">
          <Separator />
          
          <div className="flex justify-between w-full">
            <div className="flex items-center">
              <Badge variant="outline" className="mr-2">Status: {treatment.status || "Active"}</Badge>
              {treatment.followUp && <Badge variant="outline">Follow-up required</Badge>}
            </div>
            
            <div className="flex space-x-2">
              {user?.role === "doctor" || user?.role === "nurse" || user?.uid === treatment.createdById ? (
                <Button variant="outline" size="sm" onClick={() => setLocation(`/treatment/edit/${treatment.id}`)}>
                  Edit Treatment
                </Button>
              ) : null}
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}