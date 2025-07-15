import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getAdmissions } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { QueryDocumentSnapshot } from "firebase/firestore";

export default function Admissions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<any> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchAdmissions();
  }, [filter, activeTab]);

  const fetchAdmissions = async (loadMore = false) => {
    setLoading(true);
    try {
      // Get status filter based on active tab
      const statusFilter = activeTab !== "all" ? activeTab : undefined;
      
      const result = await getAdmissions(
        undefined, 
        statusFilter,
        loadMore ? lastVisible ?? undefined : undefined
      );
      
      if (result.admissions.length === 0) {
        setHasMore(false);
      } else {
        setLastVisible(result.lastVisible);
        if (loadMore) {
          setAdmissions([...admissions, ...result.admissions]);
        } else {
          setAdmissions(result.admissions);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load admissions",
        variant: "destructive",
      });
      console.error("Error fetching admissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewAdmission = () => {
    setLocation("/admissions/add");
  };

  const filteredAdmissions = admissions.filter(admission => {
    // Apply search query
    const matchesSearch = 
      (admission.patientName && admission.patientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (admission.roomNumber && admission.roomNumber.includes(searchQuery));
    
    // Apply filter
    let matchesFilter = true;
    if (filter === "opd") {
      matchesFilter = admission.admissionType === "OPD";
    } else if (filter === "ipd") {
      matchesFilter = admission.admissionType === "IPD";
    } else if (filter === "recent") {
      // Assuming we have an admissionDate timestamp
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const admissionDate = new Date(admission.admissionDate);
      matchesFilter = admissionDate >= oneWeekAgo;
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
              placeholder="Search by patient name or room..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </div>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <Select defaultValue={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full md:w-44">
              <SelectValue placeholder="Filter admissions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Admissions</SelectItem>
              <SelectItem value="recent">Recent</SelectItem>
              <SelectItem value="opd">OPD</SelectItem>
              <SelectItem value="ipd">IPD</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={handleAddNewAdmission}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New Admission
          </Button>
        </div>
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="discharged">Discharged</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {renderAdmissionsList(filteredAdmissions, loading)}
        </TabsContent>
        
        <TabsContent value="active" className="space-y-4">
          {renderAdmissionsList(filteredAdmissions, loading)}
        </TabsContent>
        
        <TabsContent value="discharged" className="space-y-4">
          {renderAdmissionsList(filteredAdmissions, loading)}
        </TabsContent>
      </Tabs>
      
      {/* Load More */}
      {!loading && admissions.length > 0 && hasMore && (
        <div className="flex justify-center mt-4">
          <Button 
            variant="outline" 
            onClick={() => fetchAdmissions(true)}
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
  
  function renderAdmissionsList(admissions: any[], loading: boolean) {
    if (loading && admissions.length === 0) {
      return (
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
      );
    }
    
    if (!loading && admissions.length === 0) {
      return (
        <Card>
          <CardContent className="text-center py-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-200">No admissions</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Get started by creating a new admission.</p>
            <div className="mt-6">
              <Button onClick={handleAddNewAdmission}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                New Admission
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <div className="space-y-4">
        {admissions.map((admission) => (
          <Card key={admission.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setLocation(`/admissions/${admission.id}`)}>
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">{admission.patientName || 'Unknown Patient'}</CardTitle>
                <Badge variant={admission.status === 'active' ? 'default' : 'secondary'}>
                  {admission.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div>
                  <div className="text-slate-500 dark:text-slate-400">Type</div>
                  <div className="font-medium">{admission.admissionType}</div>
                </div>
                <div>
                  <div className="text-slate-500 dark:text-slate-400">Room/Ward</div>
                  <div className="font-medium">{admission.roomNumber || 'Not assigned'}</div>
                </div>
                <div>
                  <div className="text-slate-500 dark:text-slate-400">Doctor</div>
                  <div className="font-medium">{admission.doctorName || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-slate-500 dark:text-slate-400">Date</div>
                  <div className="font-medium">
                    {admission.admissionDate ? new Date(admission.admissionDate).toLocaleDateString() : 'Unknown'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
}
