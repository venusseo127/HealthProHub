import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { getDoc, doc, updateDoc, collection, query, where, getDocs, orderBy, limit, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatCurrency } from "@/lib/utils";

export default function AccountDetails({ params }: { params: { id: string } }) {
  const [account, setAccount] = useState<any>(null);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { id } = params;

  useEffect(() => {
    // Check if user is an affiliate
    if (user && user.role !== "affiliate") {
      toast({
        title: "Access Denied",
        description: "Only affiliates can access account management",
        variant: "destructive",
      });
      setLocation("/dashboard");
      return;
    }
    
    const fetchAccountData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Fetch account from affiliateAccounts collection
        const accountDoc = await getDoc(doc(db, "affiliateAccounts", id));
        
        if (!accountDoc.exists()) {
          toast({
            title: "Not found",
            description: "The account was not found",
            variant: "destructive",
          });
          setLocation("/accounts");
          return;
        }
        
        const accountData = { id: accountDoc.id, ...accountDoc.data() };
        setAccount(accountData);
        
        // Fetch payment history
        const paymentsQuery = query(
          collection(db, "payments"),
          where("accountId", "==", id),
          orderBy("date", "desc"),
          limit(10)
        );
        
        const paymentsSnapshot = await getDocs(paymentsQuery);
        const paymentsData: any[] = [];
        
        paymentsSnapshot.forEach((doc) => {
          paymentsData.push({ id: doc.id, ...doc.data() });
        });
        
        setPaymentHistory(paymentsData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load account details",
          variant: "destructive",
        });
        console.error("Error fetching account details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountData();
  }, [id, toast, setLocation, user]);

  const handleMarkAsPaid = async () => {
    if (!account) return;
    
    setLoadingAction(true);
    try {
      // Update account status to active
      await updateDoc(doc(db, "affiliateAccounts", account.id), {
        status: "active",
        lastPayment: new Date().toISOString()
      });
      
      // Create payment record
      await addDoc(collection(db, "payments"), {
        accountId: account.id,
        accountType: account.accountType,
        accountName: account.accountType === "doctor" ? account.name : account.hospitalName,
        amount: account.planAmount,
        date: new Date().toISOString(),
        method: "manual",
        status: "completed",
        createdBy: user?.uid,
        notes: "Manually marked as paid by affiliate"
      });
      
      toast({
        title: "Payment recorded",
        description: "Account has been marked as active",
      });
      
      // Update local state
      setAccount({
        ...account,
        status: "active",
        lastPayment: new Date().toISOString()
      });
      
      // Refresh payment history
      const paymentsQuery = query(
        collection(db, "payments"),
        where("accountId", "==", id),
        orderBy("date", "desc"),
        limit(10)
      );
      
      const paymentsSnapshot = await getDocs(paymentsQuery);
      const paymentsData: any[] = [];
      
      paymentsSnapshot.forEach((doc) => {
        paymentsData.push({ id: doc.id, ...doc.data() });
      });
      
      setPaymentHistory(paymentsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive",
      });
      console.error("Error updating payment status:", error);
    } finally {
      setLoadingAction(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "";
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "pending":
        return "secondary";
      case "suspended":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto animate-pulse">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
        </div>
        
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-slate-200 dark:bg-slate-700"></div>
            <div className="flex-1">
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
            </div>
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
          </CardHeader>
          
          <CardContent className="space-y-8">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium">Account not found</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              The account you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button className="mt-6" onClick={() => setLocation("/accounts")}>
              Back to Accounts
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Account Details</h1>
        <Button variant="outline" onClick={() => setLocation("/accounts")}>
          Back to Accounts
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center gap-4 pb-4">
          <Avatar className="h-14 w-14">
            {account.photoURL ? (
              <AvatarImage src={account.photoURL} alt={account.name} />
            ) : (
              <AvatarFallback>
                {getInitials(account.accountType === "doctor" ? account.name : account.hospitalName)}
              </AvatarFallback>
            )}
          </Avatar>
          
          <div className="flex-1">
            <CardTitle>
              {account.accountType === "doctor" ? account.name : account.hospitalName}
            </CardTitle>
            <CardDescription>
              {account.accountType === "doctor" ? "Doctor" : "Hospital"} • {account.email}
            </CardDescription>
          </div>
          
          <Badge variant={getStatusVariant(account.status)} className="capitalize">
            {account.status}
          </Badge>
        </CardHeader>
        
        <CardContent className="pb-2">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">Email</div>
                      <div>{account.email}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">Phone</div>
                      <div>{account.contact || "Not provided"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">Address</div>
                      <div>{account.address || "Not provided"}</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Plan Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">Plan Type</div>
                      <div className="capitalize">{account.planType || "Standard"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">Monthly Fee</div>
                      <div className="font-medium">{formatCurrency(account.planAmount || 0)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">Last Payment</div>
                      <div>
                        {account.lastPayment ? new Date(account.lastPayment).toLocaleDateString() : "No payment yet"}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    {account.accountType === "doctor" ? "Professional Details" : "Hospital Details"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {account.accountType === "doctor" ? (
                    <>
                      <div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Registration Number</div>
                        <div>{account.registrationNumber || "Not provided"}</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Specialization</div>
                        <div className="capitalize">{account.specialization || "General"}</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Hospital Type</div>
                        <div className="capitalize">{account.hospitalType || "Private"}</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Bed Count</div>
                        <div>{account.bedCount || "Not specified"}</div>
                      </div>
                    </>
                  )}
                  <div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Account Created</div>
                    <div>{new Date(account.createdAt).toLocaleDateString()}</div>
                  </div>
                </CardContent>
              </Card>
              
              {account.status === "pending" && (
                <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
                  <CardContent className="flex justify-between items-center p-4">
                    <div>
                      <h3 className="font-medium">Payment Pending</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        This account is waiting for payment confirmation
                      </p>
                    </div>
                    <Button 
                      onClick={handleMarkAsPaid}
                      disabled={loadingAction}
                    >
                      {loadingAction ? "Processing..." : "Mark as Paid"}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="payments" className="space-y-4">
              {paymentHistory.length > 0 ? (
                <div className="border rounded-md">
                  <div className="grid grid-cols-12 gap-4 p-4 font-medium text-sm bg-slate-50 dark:bg-slate-800 rounded-t-md">
                    <div className="col-span-3">Date</div>
                    <div className="col-span-3">Reference</div>
                    <div className="col-span-2">Method</div>
                    <div className="col-span-2 text-right">Amount</div>
                    <div className="col-span-2 text-right">Status</div>
                  </div>
                  <div className="divide-y">
                    {paymentHistory.map((payment) => (
                      <div key={payment.id} className="grid grid-cols-12 gap-4 p-4 text-sm">
                        <div className="col-span-3">
                          {new Date(payment.date).toLocaleDateString()}
                        </div>
                        <div className="col-span-3 truncate">
                          {payment.id}
                        </div>
                        <div className="col-span-2 capitalize">
                          {payment.method || "manual"}
                        </div>
                        <div className="col-span-2 text-right">
                          {formatCurrency(payment.amount)}
                        </div>
                        <div className="col-span-2 text-right">
                          <Badge variant={payment.status === "completed" ? "default" : "outline"} className="capitalize">
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-200">No payment history</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      No payments have been recorded for this account yet.
                    </p>
                  </CardContent>
                </Card>
              )}
              
              <div className="flex justify-end">
                <Button variant="outline" size="sm" disabled={paymentHistory.length === 0}>
                  Export Payment History
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex justify-between pt-6">
          <Button variant="outline" onClick={() => setLocation(`/accounts/edit/${account.id}`)}>
            Edit Account
          </Button>
          
          <div className="flex space-x-2">
            {account.status === "active" && (
              <Button variant="destructive" onClick={() => {
                toast({
                  title: "Not implemented",
                  description: "This feature is not yet implemented",
                });
              }}>
                Suspend Account
              </Button>
            )}
            
            {account.status === "suspended" && (
              <Button variant="outline" onClick={() => {
                toast({
                  title: "Not implemented",
                  description: "This feature is not yet implemented",
                });
              }}>
                Reactivate Account
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}