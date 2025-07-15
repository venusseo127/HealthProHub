import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getPatientById, updatePatient,getUserById, getTreatmentLogs, getAdmissions,getAdmissionById, getBillings, getDietPlans } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import PatientForm from "@/components/forms/PatientForm";

export default function AdmissionDetails() {
  const [match, params] = useRoute("/admissions/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [patient, setPatient] = useState<any>(null);
  const [treatments, setTreatments] = useState<any[]>([]);
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [admission, setAdmission] = useState<any>(null);
  const [billings, setBillings] = useState<any[]>([]);
  const [dietPlans, setDietPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!match || !params?.id) {
      setLocation("/admissions");
      return;
    }

    const fetchAdmissionData = async () => {
      setIsLoading(true);
      try {
        // Fetch admission details
        const admissionData = await getAdmissionById(params.id);
        if (!admissionData) {
          toast({
            title: "Error",
            description: "Admission Info not found"+params.id,
            variant: "destructive",
          });
          setLocation("/admissions");
          return;
        }else{
          setAdmission(admissionData);
          let patientId = admissionData.patientId

          // Fetch patient details
          const patientData = await getPatientById(patientId);
          if (!patientData) {
            toast({
              title: "Error",
              description: "Admission not found",
              variant: "destructive",
            });
            setLocation("/admissions");
            return;
          }
          setPatient(patientData);
          
          // Fetch related data
          //const getDoctorInfo = await getUserById(admissionData.doctorId);
          //setPatient({doctorName:getDoctorInfo.displayName, ... patientData});

          const treatmentResult = await getTreatmentLogs(undefined, patientId);
          setTreatments(treatmentResult.treatments || []);
          
          const admissionResult = await getAdmissions(patientId);
          setAdmissions(admissionResult.admissions || []);
          
          const billingResult = await getBillings(patientId);
          setBillings(billingResult.billings || []);
          
          if (user?.role === "nurse") {
            const dietResult = await getDietPlans(patientId);
            setDietPlans(dietResult.diets || []);
          }
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load patient data",
          variant: "destructive",
        });
        console.error("Error fetching patient data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdmissionData();
  }, [match, params?.id, user]);

  const handleUpdatePatient = async (formData: any) => {
    if (!patient?.id) return;
    
    try {
      await updatePatient(patient.id, formData);
      
      // Update local state
      setPatient({
        ...patient,
        ...formData
      });
      
      setIsEditing(false);
      
      toast({
        title: "Success",
        description: "Patient information has been updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update patient information",
        variant: "destructive",
      });
      console.error("Error updating patient:", error);
    }
  };

  const handleAddAdmission = () => {
    setLocation(`/admissions/add?patientId=${patient.id}`);
  };

  const handleAddTreatment = () => {
    setLocation(`/treatment/add?patientId=${patient.id}`);
  };

  const handleAddBilling = () => {
    setLocation(`/billing/add?patientId=${patient.id}`);
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="animate-pulse">
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded mb-4 w-1/4"></div>
          <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded mb-6"></div>
          <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!admission) {
    return (
      <div className="p-8 max-w-6xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-2">Admission Info Not Found</h2>
        <p className="mb-4 text-slate-600 dark:text-slate-400">The patient admission you're looking for doesn't exist or you don't have permission to view it.</p>
        <Button onClick={() => setLocation("/patients")}>Back to Admissions</Button>
      </div>
    );
  }
   if (!patient) {
    return (
      <div className="p-8 max-w-6xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-2">patient Info Not Found</h2>
        <p className="mb-4 text-slate-600 dark:text-slate-400">The patient  you're looking for doesn't exist or you don't have permission to view it.</p>
        <Button onClick={() => setLocation("/patients")}>Back to Admissions</Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{patient.name}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {patient.age}{patient.gender === 'M' ? 'M' : 'F'} • ID: {patient.id.substring(0, 8)}
          </p>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>Edit Admission</Button>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel Edit</Button>
          )}
          <Button variant="outline" onClick={() => setLocation("/admissions")}>
            Back to List
          </Button>
        </div>
      </div>

      {isEditing ? (
        <Card>
          <CardHeader>
            <CardTitle>Edit Admission Information</CardTitle>
            <CardDescription>Update the patient's admissions details</CardDescription>
          </CardHeader>
          <PatientForm 
            onSubmit={handleUpdatePatient} 
            isLoading={false} 
            defaultValues={patient} 
          />
        </Card>
      ) : (
        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="treatments">Treatment History</TabsTrigger>
            <TabsTrigger value="admissions">Admissions</TabsTrigger>
            <TabsTrigger value="billings">Billing</TabsTrigger>
            {user?.role === "nurse" && (
              <TabsTrigger value="diet">Diet Plans</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium text-slate-500 dark:text-slate-400">Name</div>
                    <div className="col-span-2">{patient.name}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium text-slate-500 dark:text-slate-400">Age</div>
                    <div className="col-span-2">{patient.age} years</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium text-slate-500 dark:text-slate-400">Gender</div>
                    <div className="col-span-2">{patient.gender === 'M' ? 'Male' : 'Female'}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium text-slate-500 dark:text-slate-400">Contact</div>
                    <div className="col-span-2">{patient.contact || 'Not provided'}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium text-slate-500 dark:text-slate-400">Address</div>
                    <div className="col-span-2">{patient.address || 'Not provided'}</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Medical Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium text-slate-500 dark:text-slate-400">Blood Group</div>
                    <div className="col-span-2">{patient.bloodGroup || 'Not recorded'}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium text-slate-500 dark:text-slate-400">Allergies</div>
                    <div className="col-span-2">{patient.allergies || 'None reported'}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="font-medium text-slate-500 dark:text-slate-400">Registered On</div>
                    <div className="col-span-2">
                      {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'Unknown'}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium text-slate-500 dark:text-slate-400">Doctor</div>
                    <div className="col-span-2">{patient.doctorName || 'Not assigned'}</div>
                  </div>
                </CardContent>
              </Card>
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Admission Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="font-medium text-slate-500 dark:text-slate-400">Date of Admission</div>
                      <div className="col-span-2">{admission.admissionDate ? new Date(admission.admissionDate).toLocaleDateString() : 'Unknown'}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="font-medium text-slate-500 dark:text-slate-400">Admission Type</div>
                      <div className="col-span-2">{admission.admissionType} </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="font-medium text-slate-500 dark:text-slate-400">Room or Ward Number</div>
                      <div className="col-span-2">{admission.roomNumber}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="font-medium text-slate-500 dark:text-slate-400">Admission Notes</div>
                      <div className="col-span-2">{admission.note}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      <Button onClick={handleAddAdmission}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        New Admission
                      </Button>
                      <Button variant="outline" onClick={handleAddTreatment}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                        </svg>
                        Add Treatment
                      </Button>
                      <Button variant="outline" onClick={handleAddBilling}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        New Billing
                      </Button>
                      {user?.role === "nurse" && (
                        <Button variant="outline">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                          </svg>
                          Add Diet Plan
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="treatments">
            {treatments.length === 0 ? (
              <Card>
                <CardContent className="text-center py-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-200">No treatment records</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">There are no treatment records for this patient yet.</p>
                  <div className="mt-6">
                    <Button onClick={handleAddTreatment}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Add Treatment Record
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {treatments.map((treatment) => (
                  <Card key={treatment.id}>
                    <CardHeader>
                      <CardTitle className="text-base">
                        {new Date(treatment.createdAt).toLocaleDateString()} - {treatment.title || 'Treatment Record'}
                      </CardTitle>
                      <CardDescription>Created by {treatment.doctorName || treatment.createdBy || 'Unknown'}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm">{treatment.notes}</div>
                      {treatment.vitals && (
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                          {Object.entries(treatment.vitals).map(([key, value]) => (
                            <div key={key} className="bg-slate-50 dark:bg-slate-800 p-2 rounded">
                              <div className="text-xs text-slate-500 dark:text-slate-400">{key}</div>
                              <div className="font-medium">{value as string}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      {treatment.medications && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-2">Medications</h4>
                          <ul className="list-disc list-inside text-sm">
                            {treatment.medications.map((med: any, index: number) => (
                              <li key={index}>
                                {med.name} - {med.dosage} {med.frequency && `(${med.frequency})`}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                
                <div className="flex justify-center mt-4">
                  <Button onClick={handleAddTreatment}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Treatment Record
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="admissions">
            {admissions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-200">No admission records</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">There are no admission records for this patient yet.</p>
                  <div className="mt-6">
                    <Button onClick={handleAddAdmission}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Add Admission
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {admissions.map((admission) => (
                  <Card key={admission.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{admission.admissionType} Admission</CardTitle>
                          <CardDescription>
                            {new Date(admission.admissionDate).toLocaleDateString()}
                            {admission.dischargeDate && ` to ${new Date(admission.dischargeDate).toLocaleDateString()}`}
                          </CardDescription>
                        </div>
                        <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                          admission.status === 'active' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                        }`}>
                          {admission.status}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">Doctor</div>
                          <div>{admission.doctorName || 'Not specified'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">Room/Ward</div>
                          <div>{admission.roomNumber || 'Not assigned'}</div>
                        </div>
                        {admission.note && (
                          <div className="col-span-2">
                            <div className="text-sm text-slate-500 dark:text-slate-400">Notes</div>
                            <div>{admission.note}</div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                <div className="flex justify-center mt-4">
                  <Button onClick={handleAddAdmission}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Admission
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="billings">
            {billings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-200">No billing records</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">There are no billing records for this patient yet.</p>
                  <div className="mt-6">
                    <Button onClick={handleAddBilling}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Add Billing
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {billings.map((billing) => (
                  <Card key={billing.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">Invoice #{billing.invoiceNumber}</CardTitle>
                          <CardDescription>
                            {new Date(billing.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                          billing.status === 'paid' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {billing.status}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between border-b pb-2 mb-2">
                        <div className="text-sm text-slate-500 dark:text-slate-400">Amount</div>
                        <div className="font-medium">₹{billing.amount.toLocaleString('en-IN')}</div>
                      </div>
                      
                      {billing.items && billing.items.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm font-medium">Items</div>
                          <ul className="space-y-1 text-sm">
                            {billing.items.map((item: any, idx: number) => (
                              <li key={idx} className="flex justify-between">
                                <span>{item.description}</span>
                                <span>₹{item.amount.toLocaleString('en-IN')}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {billing.status === 'paid' && billing.paidAt && (
                        <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                          Paid on {new Date(billing.paidAt).toLocaleDateString()}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                
                <div className="flex justify-center mt-4">
                  <Button onClick={handleAddBilling}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Billing
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          {user?.role === "nurse" && (
            <TabsContent value="diet">
              {dietPlans.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-200">No diet plans</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">There are no diet plans for this patient yet.</p>
                    <div className="mt-6">
                      <Button>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add Diet Plan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {dietPlans.map((plan) => (
                    <Card key={plan.id}>
                      <CardHeader>
                        <CardTitle className="text-base">Diet Plan</CardTitle>
                        <CardDescription>
                          Last updated: {new Date(plan.updatedAt).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {plan.plan && (
                          <div className="space-y-4">
                            {Object.entries(plan.plan).map(([meal, items]) => (
                              <div key={meal}>
                                <h4 className="font-medium capitalize mb-1">{meal}</h4>
                                <ul className="list-disc list-inside text-sm">
                                  {(items as string[]).map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        )}
                        {plan.specialInstructions && (
                          <div className="mt-4 border-t pt-2">
                            <h4 className="font-medium mb-1">Special Instructions</h4>
                            <p className="text-sm">{plan.specialInstructions}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  
                  <div className="flex justify-center mt-4">
                    <Button>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Update Diet Plan
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  );
}
