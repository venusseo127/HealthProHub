import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PatientCard from "@/components/patient/PatientCard";
import { getPatients } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { QueryDocumentSnapshot } from "firebase/firestore";

export default function Patients() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<any> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchPatients();
  }, [filter]);

  const fetchPatients = async (loadMore = false) => {
    setLoading(true);
    try {
      const doctorId = user?.role === "doctor" ? user.uid : undefined;
      const result = await getPatients(
        doctorId, 
        loadMore ? lastVisible ?? undefined : undefined
      );
      
      if (result.patients.length === 0) {
        setHasMore(false);
      } else {
        setLastVisible(result.lastVisible);
        if (loadMore) {
          setPatients([...patients, ...result.patients]);
        } else {
          setPatients(result.patients);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load patients",
        variant: "destructive",
      });
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewPatient = () => {
    setLocation("/patients/add");
  };

  const filteredPatients = patients.filter(patient => {
    // Apply search query
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (patient.contact && patient.contact.includes(searchQuery));
    
    // Apply filter
    let matchesFilter = true;
    if (filter === "opd") {
      matchesFilter = patient.admissionType === "OPD";
    } else if (filter === "ipd") {
      matchesFilter = patient.admissionType === "IPD";
    } else if (filter === "recent") {
      // Assuming we have a createdAt timestamp
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const patientDate = new Date(patient.createdAt);
      matchesFilter = patientDate >= oneWeekAgo;
    }
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Search and actions */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:max-w-md">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <Input 
              className="pl-10" 
              placeholder="Search patients..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </div>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <Select defaultValue={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full md:w-44">
              <SelectValue placeholder="Filter patients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Patients</SelectItem>
              <SelectItem value="recent">Recent</SelectItem>
              <SelectItem value="opd">OPD</SelectItem>
              <SelectItem value="ipd">IPD</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={handleAddNewPatient}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New Patient
          </Button>
        </div>
      </div>
      
      {/* Loading state */}
      {loading && patients.length === 0 && (
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 shadow rounded-md p-4 h-20"></div>
          ))}
        </div>
      )}
      
      {/* Empty state */}
      {!loading && patients.length === 0 && (
        <div className="text-center py-10 bg-white dark:bg-slate-800 shadow rounded-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-200">No patients</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Get started by creating a new patient.</p>
          <div className="mt-6">
            <Button onClick={handleAddNewPatient}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              New Patient
            </Button>
          </div>
        </div>
      )}
      
      {/* Patient list */}
      {patients.length > 0 && (
        <div className="bg-white dark:bg-slate-800 shadow rounded-md">
          <ul className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredPatients.map((patient) => (
              <PatientCard key={patient.id} patient={patient} />
            ))}
          </ul>
          
          {/* Pagination */}
          <div className="bg-white dark:bg-slate-800 px-4 py-3 flex items-center justify-between border-t border-slate-200 dark:border-slate-700 sm:px-6">
            <div className="hidden sm:block">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Showing <span className="font-medium">{filteredPatients.length}</span> results
              </p>
            </div>
            <div className="flex-1 flex justify-between sm:justify-end">
              <Button 
                variant="outline" 
                disabled={!hasMore || loading}
                onClick={() => fetchPatients(true)}
              >
                {loading ? "Loading..." : "Load More"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
