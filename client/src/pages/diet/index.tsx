import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDietPlans, getPatients } from "@/lib/firebase";
import { QueryDocumentSnapshot } from "firebase/firestore";

export default function Diet() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dietPlans, setDietPlans] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<any> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  // Check if user has permission (nurse only)
  useEffect(() => {
    if (user && user.role === "nurse") {
      fetchDietPlans();
      fetchPatients();
    } else if (user && user.role !== "nurse") {
      toast({
        title: "Access Denied",
        description: "Only nurses can access the diet module",
        variant: "destructive",
      });
      setLocation("/dashboard");
    }
  }, [user]);

  const fetchDietPlans = async (loadMore = false) => {
    setLoading(true);
    try {
      const result = await getDietPlans(
        undefined,
        loadMore ? lastVisible : undefined
      );
      
      if (result.diets.length === 0) {
        setHasMore(false);
      } else {
        setLastVisible(result.lastVisible);
        if (loadMore) {
          setDietPlans([...dietPlans, ...result.diets]);
        } else {
          setDietPlans(result.diets);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load diet plans",
        variant: "destructive",
      });
      console.error("Error fetching diet plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const result = await getPatients();
      setPatients(result.patients || []);
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  const handleAddNewDietPlan = () => {
    setLocation("/diet/add");
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.name : "Unknown Patient";
  };

  const filteredDietPlans = dietPlans.filter(plan => {
    // Apply search query to patient name
    const patientName = getPatientName(plan.patientId);
    const matchesSearch = patientName.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
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
              placeholder="Search by patient name..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </div>
        </div>
        
        <Button onClick={handleAddNewDietPlan}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Diet Plan
        </Button>
      </div>
      
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Diet Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredDietPlans.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Active Inpatients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patients.filter(p => p.admissionType === "IPD" && p.status === "active").length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Special Diets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredDietPlans.filter(plan => plan.specialInstructions).length}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Loading state */}
      {loading && dietPlans.length === 0 && (
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="p-4">
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-3 w-1/2"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Empty state */}
      {!loading && dietPlans.length === 0 && (
        <Card>
          <CardContent className="text-center py-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-200">No diet plans</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Get started by creating a new diet plan.</p>
            <div className="mt-6">
              <Button onClick={handleAddNewDietPlan}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Diet Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Diet Plans List */}
      {dietPlans.length > 0 && (
        <div className="space-y-4">
          {filteredDietPlans.map((plan) => (
            <Card key={plan.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setLocation(`/diet/${plan.id}`)}>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base flex justify-between">
                  <span>{getPatientName(plan.patientId)}</span>
                  <Badge variant="outline">
                    Last updated: {new Date(plan.updatedAt).toLocaleDateString()}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Patient ID: {plan.patientId}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                {plan.plan && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(plan.plan).map(([meal, items]) => (
                      <div key={meal} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-md">
                        <div className="font-medium capitalize mb-1">{meal}</div>
                        <ul className="text-sm space-y-1">
                          {(items as string[]).slice(0, 3).map((item, idx) => (
                            <li key={idx} className="text-slate-600 dark:text-slate-300">• {item}</li>
                          ))}
                          {(items as string[]).length > 3 && (
                            <li className="text-slate-500 dark:text-slate-400">+ {(items as string[]).length - 3} more</li>
                          )}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
                
                {plan.specialInstructions && (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border border-yellow-100 dark:border-yellow-900/50">
                    <div className="font-medium mb-1 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Special Instructions
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{plan.specialInstructions}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-4 pt-0 border-t">
                <div className="flex justify-between items-center w-full">
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Created by: {plan.createdByName || "Staff"}
                  </div>
                  <Button variant="outline" size="sm">
                    Edit Plan
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
          
          {/* Load More */}
          {!loading && dietPlans.length > 0 && hasMore && (
            <div className="flex justify-center mt-4">
              <Button 
                variant="outline" 
                onClick={() => fetchDietPlans(true)}
              >
                Load More
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
