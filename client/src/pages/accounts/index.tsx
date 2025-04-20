import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getStaffMembers } from "@/lib/firebase"; // Reusing staff members API for now
import { QueryDocumentSnapshot } from "firebase/firestore";

export default function Accounts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<any> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  // Check if user has permission (affiliate only)
  useEffect(() => {
    if (user && user.role === "affiliate") {
      fetchAccounts();
    } else if (user && user.role !== "affiliate") {
      toast({
        title: "Access Denied",
        description: "Only affiliates can access account management",
        variant: "destructive",
      });
      setLocation("/dashboard");
    }
  }, [filter, activeTab, user]);

  const fetchAccounts = async (loadMore = false) => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get role filter
      const roleFilter = activeTab === "doctor" ? "doctor" : 
                         activeTab === "hospital" ? "hospital" : undefined;
      
      // This is using the staff API as a placeholder - in a real app, would have a separate affiliate accounts API
      const result = await getStaffMembers(
        undefined, 
        undefined,
        roleFilter,
        loadMore ? lastVisible : undefined
      );
      
      // Mock data for demonstration
      const mockAccounts = result.staff.map((account: any) => ({
        ...account,
        planAmount: account.role === "doctor" ? 3500 : 6000,
        status: Math.random() > 0.2 ? "active" : "pending",
        lastPayment: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString()
      }));
      
      if (mockAccounts.length === 0) {
        setHasMore(false);
      } else {
        setLastVisible(result.lastVisible);
        if (loadMore) {
          setAccounts([...accounts, ...mockAccounts]);
        } else {
          setAccounts(mockAccounts);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load accounts",
        variant: "destructive",
      });
      console.error("Error fetching accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewAccount = () => {
    setLocation("/accounts/add");
  };

  const filteredAccounts = accounts.filter(account => {
    // Apply search query
    const matchesSearch = 
      (account.displayName && account.displayName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (account.email && account.email.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Apply tab filter
    let matchesTab = true;
    if (activeTab === "doctor") {
      matchesTab = account.role === "doctor";
    } else if (activeTab === "hospital") {
      matchesTab = account.role === "hospital";
    }
    
    // Apply status filter
    let matchesFilter = true;
    if (filter === "active") {
      matchesFilter = account.status === "active";
    } else if (filter === "pending") {
      matchesFilter = account.status === "pending";
    }
    
    return matchesSearch && matchesTab && matchesFilter;
  });

  function getInitials(name: string) {
    if (!name) return "";
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  }

  function getStatusBadgeVariant(status: string) {
    switch (status) {
      case 'active':
        return 'default';
      case 'pending':
        return 'secondary';
      default:
        return 'outline';
    }
  }

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
              placeholder="Search accounts..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </div>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <Select defaultValue={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full md:w-44">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending Payment</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={handleAddNewAccount}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New Account
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accounts.length}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Doctors: {accounts.filter(a => a.role === "doctor").length} | 
              Hospitals: {accounts.filter(a => a.role === "hospital").length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{accounts
                .filter(a => a.status === "active")
                .reduce((total, account) => total + account.planAmount, 0)
                .toLocaleString('en-IN')}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Commission: ₹{Math.floor(accounts
                .filter(a => a.status === "active")
                .reduce((total, account) => total + account.planAmount * 0.2, 0))
                .toLocaleString('en-IN')}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">
                  {accounts.filter(a => a.status === "active").length}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Active
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-yellow-600">
                  {accounts.filter(a => a.status === "pending").length}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Pending
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Accounts</TabsTrigger>
          <TabsTrigger value="doctor">Doctors</TabsTrigger>
          <TabsTrigger value="hospital">Hospitals</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {renderAccountsList()}
        </TabsContent>
        
        <TabsContent value="doctor" className="space-y-4">
          {renderAccountsList()}
        </TabsContent>
        
        <TabsContent value="hospital" className="space-y-4">
          {renderAccountsList()}
        </TabsContent>
      </Tabs>
    </div>
  );
  
  function renderAccountsList() {
    if (loading && accounts.length === 0) {
      return (
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="flex items-center p-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 mr-4"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }
    
    if (!loading && filteredAccounts.length === 0) {
      return (
        <Card>
          <CardContent className="text-center py-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-200">No accounts found</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Get started by creating a new account.</p>
            <div className="mt-6">
              <Button onClick={handleAddNewAccount}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                New Account
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <div className="space-y-4">
        {filteredAccounts.map((account) => (
          <Card key={account.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setLocation(`/accounts/${account.id}`)}>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Avatar className="h-12 w-12 mr-4">
                  {account.photoURL ? (
                    <AvatarImage src={account.photoURL} alt={account.displayName} />
                  ) : (
                    <AvatarFallback>{getInitials(account.displayName || 'User')}</AvatarFallback>
                  )}
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-medium">{account.displayName}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{account.email}</p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(account.status)} className="capitalize">
                      {account.status}
                    </Badge>
                  </div>
                  
                  <div className="mt-2 flex justify-between items-center">
                    <div className="flex gap-4">
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Plan</div>
                        <div className="text-sm font-medium">
                          {account.role === "doctor" ? "Doctor" : "Hospital"} (₹{account.planAmount}/month)
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Last Payment</div>
                        <div className="text-sm">
                          {new Date(account.lastPayment).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {account.status === "pending" ? (
                        <Button size="sm">Mark as Paid</Button>
                      ) : (
                        <Button variant="outline" size="sm">View Details</Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {/* Load More */}
        {!loading && accounts.length > 0 && hasMore && (
          <div className="flex justify-center mt-4">
            <Button 
              variant="outline" 
              onClick={() => fetchAccounts(true)}
            >
              Load More
            </Button>
          </div>
        )}
      </div>
    );
  }
}
