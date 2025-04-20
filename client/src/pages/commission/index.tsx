import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAffiliateTracking } from "@/lib/firebase";
import { QueryDocumentSnapshot } from "firebase/firestore";

export default function Commission() {
  const [filter, setFilter] = useState("all");
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<any> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  // Check if user has permission (affiliate only)
  useEffect(() => {
    if (user && user.role === "affiliate") {
      fetchCommissions();
    } else if (user && user.role !== "affiliate") {
      toast({
        title: "Access Denied",
        description: "Only affiliates can access commission tracking",
        variant: "destructive",
      });
      setLocation("/dashboard");
    }
  }, [filter, currentMonth, currentYear, user]);

  const fetchCommissions = async (loadMore = false) => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get status filter
      const statusFilter = filter !== "all" ? filter : undefined;
      
      const result = await getAffiliateTracking(
        user.uid,
        statusFilter,
        loadMore ? lastVisible : undefined
      );
      
      if (result.tracking.length === 0) {
        setHasMore(false);
      } else {
        setLastVisible(result.lastVisible);
        if (loadMore) {
          setCommissions([...commissions, ...result.tracking]);
        } else {
          setCommissions(result.tracking);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load commission data",
        variant: "destructive",
      });
      console.error("Error fetching commissions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter commissions for the selected month and year
  const filteredCommissions = commissions.filter(commission => {
    // Apply month/year filter
    const matchesMonthYear = 
      (filter === "all" || 
       (parseInt(commission.month) === currentMonth && parseInt(commission.year) === currentYear));
    
    return matchesMonthYear;
  });

  // Calculate statistics
  const totalCommission = filteredCommissions.reduce((sum, c) => sum + c.amount, 0);
  const paidCommission = filteredCommissions
    .filter(c => c.status === "paid")
    .reduce((sum, c) => sum + c.amount, 0);
  const pendingCommission = filteredCommissions
    .filter(c => c.status === "pending")
    .reduce((sum, c) => sum + c.amount, 0);

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="text-lg font-medium">Commission Report</div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <Select 
            defaultValue={currentMonth.toString()} 
            onValueChange={(value) => setCurrentMonth(parseInt(value))}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value.toString()}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select 
            defaultValue={currentYear.toString()} 
            onValueChange={(value) => setCurrentYear(parseInt(value))}
          >
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select defaultValue={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Commission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{totalCommission.toLocaleString('en-IN')}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {months.find(m => m.value === currentMonth)?.label} {currentYear}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Paid Commission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-500">
              ₹{paidCommission.toLocaleString('en-IN')}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {((paidCommission / totalCommission) * 100 || 0).toFixed(0)}% of total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Pending Commission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">
              ₹{pendingCommission.toLocaleString('en-IN')}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {((pendingCommission / totalCommission) * 100 || 0).toFixed(0)}% of total
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="table">
        <TabsList>
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>
        
        <TabsContent value="table">
          {renderCommissionTable()}
        </TabsContent>
        
        <TabsContent value="summary">
          {renderCommissionSummary()}
        </TabsContent>
      </Tabs>
      
      {/* Actions */}
      {pendingCommission > 0 && (
        <div className="flex justify-end">
          <Button>
            Withdraw Available Commission
          </Button>
        </div>
      )}
    </div>
  );
  
  function renderCommissionTable() {
    if (loading && commissions.length === 0) {
      return (
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
          ))}
        </div>
      );
    }
    
    if (!loading && filteredCommissions.length === 0) {
      return (
        <Card>
          <CardContent className="text-center py-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-200">No commission data</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              No commission records found for {months.find(m => m.value === currentMonth)?.label} {currentYear}.
            </p>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Month</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCommissions.map((commission) => (
              <TableRow key={commission.id}>
                <TableCell className="font-medium">{commission.userName || commission.userAccount}</TableCell>
                <TableCell className="capitalize">{commission.userType}</TableCell>
                <TableCell>
                  {months.find(m => m.value === parseInt(commission.month))?.label} {commission.year}
                </TableCell>
                <TableCell>₹{commission.amount.toLocaleString('en-IN')}</TableCell>
                <TableCell>
                  <Badge variant={commission.status === "paid" ? "default" : "secondary"}>
                    {commission.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {commission.paidAt ? new Date(commission.paidAt).toLocaleDateString() : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
  
  function renderCommissionSummary() {
    if (loading) {
      return (
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="p-4 pb-0">
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }
    
    // Get summary by type
    const doctorCommissions = filteredCommissions.filter(c => c.userType === "doctor");
    const hospitalCommissions = filteredCommissions.filter(c => c.userType === "hospital");
    
    const doctorTotal = doctorCommissions.reduce((sum, c) => sum + c.amount, 0);
    const hospitalTotal = hospitalCommissions.reduce((sum, c) => sum + c.amount, 0);
    
    // Monthly trend (last 5 months)
    const monthlyTrend = [];
    for (let i = 0; i < 5; i++) {
      let month = currentMonth - i;
      let year = currentYear;
      
      if (month <= 0) {
        month += 12;
        year -= 1;
      }
      
      const monthCommissions = commissions.filter(
        c => parseInt(c.month) === month && parseInt(c.year) === year
      );
      
      monthlyTrend.push({
        month,
        year,
        total: monthCommissions.reduce((sum, c) => sum + c.amount, 0)
      });
    }
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Commission by Account Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="font-medium">Doctor Accounts (₹3,500/month)</div>
                <div className="flex justify-between text-sm">
                  <span>Total Accounts:</span>
                  <span>{doctorCommissions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Commission:</span>
                  <span className="font-medium">₹{doctorTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                  <span>Average per Account:</span>
                  <span>
                    ₹{doctorCommissions.length > 0 
                      ? Math.round(doctorTotal / doctorCommissions.length).toLocaleString('en-IN') 
                      : 0}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="font-medium">Hospital Accounts (₹6,000/month)</div>
                <div className="flex justify-between text-sm">
                  <span>Total Accounts:</span>
                  <span>{hospitalCommissions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Commission:</span>
                  <span className="font-medium">₹{hospitalTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                  <span>Average per Account:</span>
                  <span>
                    ₹{hospitalCommissions.length > 0 
                      ? Math.round(hospitalTotal / hospitalCommissions.length).toLocaleString('en-IN') 
                      : 0}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyTrend.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-24 text-sm">
                    {months.find(m => m.value === item.month)?.label.slice(0, 3)} {item.year}:
                  </div>
                  <div className="flex-1 ml-2">
                    <div className="h-6 bg-primary-100 dark:bg-primary-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary-500 rounded-full"
                        style={{ 
                          width: `${Math.min(100, (item.total / (totalCommission || 1)) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-32 text-right font-medium">
                    ₹{item.total.toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="flex h-full">
                <div 
                  className="bg-green-500 h-full"
                  style={{ width: `${(paidCommission / (totalCommission || 1)) * 100}%` }}
                ></div>
                <div 
                  className="bg-yellow-500 h-full"
                  style={{ width: `${(pendingCommission / (totalCommission || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span>Paid: ₹{paidCommission.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                <span>Pending: ₹{pendingCommission.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}
