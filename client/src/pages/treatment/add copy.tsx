import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { addTreatmentLog, getPatients, getAdmissions } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export default function AddTreatmentLog() {
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [selectedAdmission, setSelectedAdmission] = useState<string>("");
  const [patients, setPatients] = useState<any[]>([]);
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [treatmentType, setTreatmentType] = useState("medication");
  const [medication, setMedication] = useState("");
  const [dosage, setDosage] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingAdmissions, setLoadingAdmissions] = useState(false);
  
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  // Fetch patients on component mount
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const result = await getPatients(user?.role === "doctor" ? user?.uid : undefined);
        setPatients(result.patients);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load patients",
          variant: "destructive",
        });
        console.error("Error fetching patients:", error);
      } finally {
        setLoadingPatients(false);
      }
    };

    if (user) {
      fetchPatients();
    }
  }, [user, toast]);

  // Fetch admissions when patient is selected
  useEffect(() => {
    console.log("selectedPatient",selectedPatient)
    const fetchAdmissions = async () => {
      if (!selectedPatient) return;
      
      setLoadingAdmissions(true);
      try {
        const result = await getAdmissions(selectedPatient);
        setAdmissions(result.admissions);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load patient admissions",
          variant: "destructive",
        });
        console.error("Error fetching admissions:", error);
      } finally {
        setLoadingAdmissions(false);
      }
    };

    fetchAdmissions();
  }, [selectedPatient, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPatient) {
      toast({
        title: "Error",
        description: "Please select a patient",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const treatmentData = {
        title,
        description,
        treatmentType,
        medication: treatmentType === "medication" ? medication : undefined,
        dosage: treatmentType === "medication" ? dosage : undefined,
        notes,
        patientId: selectedPatient,
        admissionId: selectedAdmission || undefined,
        createdById: user?.uid,
        createdByName: user?.displayName,
        createdByRole: user?.role,
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
        <form onSubmit={handleSubmit}> 
          <CardContent className="space-y-4">
            {/* Patient Selection */}
            <div className="space-y-2">
              <Label htmlFor="patient">Patient</Label>
              <Select
                value={selectedPatient}
                onValueChange={setSelectedPatient}
                disabled={loadingPatients}
              >
                <SelectTrigger id="patient">
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name} {patient.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {loadingPatients && <p className="text-sm text-muted-foreground">Loading patients...</p>}
            </div>

            {/* Admission Selection (Optional) */}
            {selectedPatient && (
              <div className="space-y-2">
                <Label htmlFor="admission">Admission (Optional)</Label>
                <Select
                  value={selectedAdmission}
                  onValueChange={setSelectedAdmission}
                  disabled={loadingAdmissions}
                >
                  <SelectTrigger id="admission">
                    <SelectValue placeholder="Select admission" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No specific admission</SelectItem>
                    {admissions.map((admission) => (
                      <SelectItem key={admission.id} value={admission.id}>
                        {new Date(admission.admissionDate).toLocaleDateString()} - {admission.reason}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {loadingAdmissions && <p className="text-sm text-muted-foreground">Loading admissions...</p>}
              </div>
            )}

            {/* Treatment Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Treatment Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., IV Antibiotics, Wound Dressing"
                required
              />
            </div>

            {/* Treatment Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Treatment Type</Label>
              <Select
                value={treatmentType}
                onValueChange={setTreatmentType}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medication">Medication</SelectItem>
                  <SelectItem value="procedure">Procedure</SelectItem>
                  <SelectItem value="therapy">Therapy</SelectItem>
                  <SelectItem value="test">Diagnostic Test</SelectItem>
                  <SelectItem value="observation">Observation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Medication fields (only if type is medication) */}
            {treatmentType === "medication" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="medication">Medication Name</Label>
                  <Input
                    id="medication"
                    value={medication}
                    onChange={(e) => setMedication(e.target.value)}
                    placeholder="e.g., Amoxicillin, Ibuprofen"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dosage">Dosage & Frequency</Label>
                  <Input
                    id="dosage"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="e.g., 500mg every 8 hours"
                    required
                  />
                </div>
              </>
            )}

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed description of the treatment"
                required
                rows={3}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional observations or notes (optional)"
                rows={3}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => setLocation("/treatment")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Treatment Log"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}