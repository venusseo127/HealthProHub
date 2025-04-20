import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getPatients } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Patient } from "@/types";

const admissionFormSchema = z.object({
  patientId: z.string({
    required_error: "Please select a patient",
  }),
  admissionType: z.enum(["OPD", "IPD"], {
    required_error: "Please select admission type",
  }),
  roomNumber: z.string().optional(),
  note: z.string().optional(),
  doctorId: z.string().optional(),
});

type AdmissionFormValues = z.infer<typeof admissionFormSchema>;

interface AdmissionFormProps {
  onSubmit: (values: AdmissionFormValues) => void;
  isLoading: boolean;
  selectedPatient?: Patient | null;
  patientLoading?: boolean;
  defaultValues?: Partial<AdmissionFormValues>;
}

export default function AdmissionForm({ 
  onSubmit, 
  isLoading, 
  selectedPatient,
  patientLoading,
  defaultValues 
}: AdmissionFormProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const { toast } = useToast();

  const form = useForm<AdmissionFormValues>({
    resolver: zodResolver(admissionFormSchema),
    defaultValues: {
      patientId: selectedPatient?.id || "",
      admissionType: "OPD",
      roomNumber: "",
      note: "",
      doctorId: "", // This would come from user context or selection
      ...defaultValues
    },
  });

  // If selectedPatient changes, update form value
  useEffect(() => {
    if (selectedPatient?.id) {
      form.setValue("patientId", selectedPatient.id);
    }
  }, [selectedPatient, form]);

  useEffect(() => {
    // Only fetch patients if no selectedPatient is provided
    if (!selectedPatient && !patientLoading) {
      fetchPatients();
    }
  }, [selectedPatient, patientLoading]);

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
                {loadingPatients || patientLoading ? (
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

          {/* Admission Type */}
          <FormField
            control={form.control}
            name="admissionType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Admission Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-row space-x-4"
                  >
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="OPD" />
                      </FormControl>
                      <FormLabel className="font-normal">OPD (Outpatient)</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="IPD" />
                      </FormControl>
                      <FormLabel className="font-normal">IPD (Inpatient)</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Room Number */}
          <FormField
            control={form.control}
            name="roomNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room/Ward Number</FormLabel>
                <FormControl>
                  <Input placeholder="Room or ward number" {...field} />
                </FormControl>
                <FormDescription>
                  Required for IPD admissions
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Notes */}
          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Admission Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Chief complaint, preliminary diagnosis, or other notes"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Admission"}
          </Button>
        </CardContent>
      </form>
    </Form>
  );
}
