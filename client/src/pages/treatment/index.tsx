import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getTreatmentLogs } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { QueryDocumentSnapshot } from "firebase/firestore";

export default function TreatmentLogs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [treatments, setTreatments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<any> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchTreatmentLogs();
  }, [filter]);

  const fetchTreatmentLogs = async (loadMore = false) => {
    setLoading(true);
    try {
      const result = await getTreatmentLogs(
        undefined, 
        undefined, 
        loadMore ? lastVisible : undefined
      );
      
      if (result.treatments.length === 0) {
        setHasMore(false);
      } else {
        setLastVisible(result.lastVisible);
        if (loadMore) {
          setTreatments([...treatments, ...result.treatments]);
        } else {
          setTreatments(result.treatments);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load treatment logs",
        variant: "destructive",
      });
      console.error("Error fetching treatment logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewTreatment = () => {
    setLocation("/treatment/add");
  };

  const filteredTreatments = treatments.filter(treatment => {
    // Apply search query
    const matchesSearch = 
      (treatment.patientName && treatment.patientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (treatment.notes && treatment.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Apply filter
    let matchesFilter = true;
    if (filter === "recent") {
      // Assuming we have a createdAt timestamp
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const treatmentDate = new Date(treatment.createdAt);
      matchesFilter = treatmentDate >= oneWeekAgo;
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
              placeholder="Search by patient name or notes..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </div>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <Select defaultValue={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full md:w-44">
              <SelectValue placeholder="Filter treatments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Treatments</SelectItem>
              <SelectItem value="recent">Recent</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={handleAddNewTreatment}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New Treatment Log
          </Button>
        </div>
      </div>
      
      {/* Loading state */}
      {loading && treatments.length === 0 && (
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
      {!loading && treatments.length === 0 && (
        <Card>
          <CardContent className="text-center py-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-200">No treatment logs</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Get started by creating a new treatment log.</p>
            <div className="mt-6">
              <Button onClick={handleAddNewTreatment}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                New Treatment Log
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Treatment logs list */}
      {treatments.length > 0 && (
        <div className="space-y-4">
          {filteredTreatments.map((treatment) => (
            <Card key={treatment.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setLocation(`/treatment/${treatment.id}`)}>
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">
                    {treatment.patientName || 'Unknown Patient'}
                  </CardTitle>
                  <Badge>
                    {new Date(treatment.createdAt).toLocaleDateString()}
                  </Badge>
                </div>
                <CardDescription>
                  {treatment.doctorName ? `Dr. ${treatment.doctorName}` : 'Unassigned'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="text-sm line-clamp-2">
                  {treatment.notes}
                </div>
                
                {treatment.vitals && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {Object.entries(treatment.vitals).slice(0, 3).map(([key, value]) => (
                      <Badge key={key} variant="outline" className="capitalize">
                        {key}: {value as string}
                      </Badge>
                    ))}
                    {Object.keys(treatment.vitals).length > 3 && (
                      <Badge variant="outline">+ more</Badge>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-4 pt-0 border-t text-sm text-slate-500 dark:text-slate-400">
                <div className="flex justify-between items-center w-full">
                  <div>
                    {treatment.admissionType || 'Regular checkup'}
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </CardFooter>
            </Card>
          ))}
          
          {/* Load More */}
          {!loading && treatments.length > 0 && hasMore && (
            <div className="flex justify-center mt-4">
              <Button 
                variant="outline" 
                onClick={() => fetchTreatmentLogs(true)}
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
