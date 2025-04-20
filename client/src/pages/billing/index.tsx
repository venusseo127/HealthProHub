import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getBillings } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { QueryDocumentSnapshot } from "firebase/firestore";

export default function Billing() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [billings, setBillings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<any> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchBillings();
  }, [filter]);

  const fetchBillings = async (loadMore = false) => {
    setLoading(true);
    try {
      // Get status filter
      const statusFilter = filter !== "all" ? filter : undefined;
      
      const result = await getBillings(
        undefined, 
        statusFilter,
        loadMore ? lastVisible : undefined
      );
      
      if (result.billings.length === 0) {
        setHasMore(false);
      } else {
        setLastVisible(result.lastVisible);
        if (loadMore) {
          setBillings([...billings, ...result.billings]);
        } else {
          setBillings(result.billings);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load billing records",
        variant: "destructive",
      });
      console.error("Error fetching billings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewBilling = () => {
    setLocation("/billing/add");
  };

  const filteredBillings = billings.filter(billing => {
    // Apply search query
    const matchesSearch = 
      (billing.patientName && billing.patientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (billing.invoiceNumber && billing.invoiceNumber.includes(searchQuery));
    
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
              placeholder="Search by patient name or invoice..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </div>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <Select defaultValue={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full md:w-44">
              <SelectValue placeholder="Filter billings" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Invoices</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={handleAddNewBilling}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New Invoice
          </Button>
        </div>
      </div>
      
      {/* Loading state */}
      {loading && billings.length === 0 && (
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
      {!loading && billings.length === 0 && (
        <Card>
          <CardContent className="text-center py-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-200">No billing records</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Get started by creating a new invoice.</p>
            <div className="mt-6">
              <Button onClick={handleAddNewBilling}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                New Invoice
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Billing list */}
      {billings.length > 0 && (
        <div className="space-y-4">
          {filteredBillings.map((billing) => (
            <Card key={billing.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setLocation(`/billing/${billing.id}`)}>
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-base">
                      {billing.patientName || 'Unknown Patient'}
                    </CardTitle>
                    <CardDescription>
                      Invoice #{billing.invoiceNumber}
                    </CardDescription>
                  </div>
                  <Badge variant={billing.status === 'paid' ? 'default' : 'secondary'}>
                    {billing.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Date: {new Date(billing.createdAt).toLocaleDateString()}
                  </div>
                  <div className="font-medium">
                    ₹{billing.amount.toLocaleString('en-IN')}
                  </div>
                </div>
                
                {billing.admissionId && (
                  <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {billing.admissionType || 'Consultation'} - {billing.admissionId}
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-4 pt-0 border-t">
                <div className="flex justify-between items-center w-full">
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Items: {billing.items?.length || 0}
                  </div>
                  <div className="flex items-center gap-2">
                    {billing.status === 'pending' && (
                      <Button variant="outline" size="sm">Mark as Paid</Button>
                    )}
                    <Button variant="ghost" size="sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z" clipRule="evenodd" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
          
          {/* Load More */}
          {!loading && billings.length > 0 && hasMore && (
            <div className="flex justify-center mt-4">
              <Button 
                variant="outline" 
                onClick={() => fetchBillings(true)}
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
