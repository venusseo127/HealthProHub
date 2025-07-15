import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getPatients, getAdmissions } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Patient, Admission } from "@/types";
import { Trash2 } from "lucide-react";

const medicationSchema = z.object({
  name: z.string().min(1, "Medication name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().optional(),
  duration: z.string().optional(),
});

const vitalsSchema = z.object({
  temperature: z.string().optional(),
  pulse: z.string().optional(),
  respiration: z.string().optional(),
  bloodPressure: z.string().optional(),
  oxygenSaturation: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
});

const treatmentLogSchema = z.object({
  patientId: z.string({
    required_error: "Please select a patient",
  }),
  admissionId: z.string().optional(),
  title: z.string().optional(),
  notes: z.string().min(1, "Treatment notes are required"),
  vitals: vitalsSchema.optional(),
  medications: z.array(medicationSchema).optional(),
});

type TreatmentLogFormValues = z.infer<typeof treatmentLogSchema>;

interface TreatmentLogFormProps {
  onSubmit: (values: TreatmentLogFormValues) => void;
  isLoading: boolean;
  selectedPatient?: Patient | null;
  patientLoading?: boolean;
  selectedAdmission?: Admission | null;
  defaultValues?: Partial<TreatmentLogFormValues>;
}

export default function TreatmentLogForm({ 
  onSubmit, 
  isLoading, 
  selectedPatient,
  patientLoading,
  selectedAdmission,
  defaultValues 
}: TreatmentLogFormProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingAdmissions, setLoadingAdmissions] = useState(false);
  const { toast } = useToast();

  const form = useForm<TreatmentLogFormValues>({
    resolver: zodResolver(treatmentLogSchema),
    defaultValues: {
      patientId: selectedPatient?.id || "",
      admissionId: selectedAdmission?.id || "",
      title: "",
      notes: "",
      vitals: {
        temperature: "",
        pulse: "",
        respiration: "",
        bloodPressure: "",
        oxygenSaturation: "",
        height: "",
        weight: "",
      },
      medications: [
        { name: "", dosage: "", frequency: "", duration: "" }
      ],
      ...defaultValues
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "medications",
  });

  // Watch for patient ID changes to load admissions
  const watchPatientId = form.watch("patientId");

  // If selectedPatient changes, update form value
  useEffect(() => {
    if (selectedPatient?.id) {
      form.setValue("patientId", selectedPatient.id);
    }
  }, [selectedPatient, form]);

  // If selectedAdmission changes, update form value
  useEffect(() => {
    if (selectedAdmission?.id) {
      if(selectedAdmission?.id!="Unassigned"){
        form.setValue("admissionId", selectedAdmission.id);
      }
    }
  }, [selectedAdmission, form]);

  useEffect(() => {
    // Only fetch patients if no selectedPatient is provided
    //todo select patient by doctor or hospital
    if (!selectedPatient && !patientLoading) {
      fetchPatients();
    }
  }, [selectedPatient, patientLoading]);

  // Load admissions when patient changes
  useEffect(() => {
    if (watchPatientId) {
      fetchAdmissions(watchPatientId);
    }
  }, [watchPatientId]);

  const fetchPatients = async () => {
    setLoadingPatients(true);
    try {
      const result = await getPatients();
      setPatients(result.patients || []);
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

  const fetchAdmissions = async (patientId: string) => {
    setLoadingAdmissions(true);
    try {
      const result = await getAdmissions(patientId, "active");
      setAdmissions(result.admissions || []);
    } catch (error) {
      console.error("Error fetching admissions:", error);
    } finally {
      setLoadingAdmissions(false);
    }
  };
console.log(selectedPatient,loadingPatients,patients.length)
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4 pt-6">
          {/* Patient Selection */}
          <FormField
            control={form.control}
            name="patientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Patient</FormLabel>
                {loadingPatients || !patientLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : selectedPatient ? (
                  <div className="p-2 border rounded-md bg-slate-50 dark:bg-slate-800">
                    <p className="font-medium">{selectedPatient.name}</p>
                    <p className="text-sm text-slate-500">
                      {selectedPatient.age}{selectedPatient.gender} - {selectedPatient.contact}
                    </p>
                  </div>
                ) : (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a patient" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name} ({patient.age}{patient.gender})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <FormMessage />
                {!selectedPatient && !loadingPatients && patients.length === 0 && (
                  <p className="text-sm text-slate-500">
                    No patients found. Please add a patient first.
                  </p>
                )}
              </FormItem>
            )}
          />

          {/* Admission Selection */}
          <FormField
            control={form.control}
            name="admissionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Related Admission (Optional)</FormLabel>
                {loadingAdmissions ? (
                  <Skeleton className="h-10 w-full" />
                ) : selectedAdmission ? (
                  <div className="p-2 border rounded-md bg-slate-50 dark:bg-slate-800">
                    <p className="font-medium">{selectedAdmission.admissionType} Admission</p>
                    <p className="text-sm text-slate-500">
                      Admitted: {new Date(selectedAdmission.admissionDate).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an admission (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Unassigned">No specific admission</SelectItem>
                      {admissions.map((admission) => (
                        <SelectItem key={admission.id} value={admission.id}>
                          {admission.admissionType} - {new Date(admission.admissionDate).toLocaleDateString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <FormDescription>
                  Link this treatment to an active admission, if applicable
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Treatment Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Treatment title (optional)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Treatment Notes */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Treatment Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Detailed treatment notes, observations, and recommendations"
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Vitals */}
          <div>
            <h3 className="text-base font-medium mb-2">Vitals</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="vitals.temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temperature</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 98.6°F" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="vitals.pulse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pulse</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 72 bpm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="vitals.bloodPressure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blood Pressure</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 120/80 mmHg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="vitals.respiration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Respiration</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 16 breaths/min" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="vitals.oxygenSaturation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Oxygen Saturation</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 98%" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="vitals.weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 70 kg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Medications */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-base font-medium">Medications</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: "", dosage: "", frequency: "", duration: "" })}
              >
                Add Medication
              </Button>
            </div>
            
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-md mb-4 bg-slate-50 dark:bg-slate-800">
                <FormField
                  control={form.control}
                  name={`medications.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medication Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Medicine name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name={`medications.${index}.dosage`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dosage</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 500mg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name={`medications.${index}.frequency`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Twice daily" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name={`medications.${index}.duration`}
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormLabel>Duration</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 7 days" {...field} />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-8 right-0"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Treatment Log"}
          </Button>
        </CardContent>
      </form>
    </Form>
  );
}
