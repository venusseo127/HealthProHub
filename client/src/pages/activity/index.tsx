import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CalendarCheck, UserRound, ClipboardList, Receipt, Bed, Users, UserPlus, Building, Wallet, Utensils, PackageOpen, Search, Calendar } from "lucide-react";
import { getRelativeTime } from "@/lib/utils";
import { ActivityLog as ActivityLogType } from "@/types";

export default function ActivityPage() {
  const { user } = useAuth();
  const role = user?.role || "";
  const [activities, setActivities] = useState<ActivityLogType[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityLogType[]>([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState("all");

  useEffect(() => {
    // In a real app, you would fetch activities from your backend
    // This is mocked data for demonstration purposes
    const mockActivities: ActivityLogType[] = [
      {
        id: '1',
        type: 'patient_registered',
        title: role === 'affiliate' ? 'New doctor account created' : 'New patient registered',
        description: role === 'affiliate' ? 'Dr. Ananya Sharma - Cardiologist' : 'Raj Patel, 42M - Diabetes',
        details: role === 'affiliate' ? 'Account created with starting plan (₹3,500/month)' : 'Patient registered with primary complaint of dizzy spells.',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        type: role === 'affiliate' ? 'commission_received' : (role === 'staff' ? 'payment_received' : 'treatment_updated'),
        title: role === 'affiliate' ? 'Commission received' : (role === 'staff' ? 'Payment received' : 'Treatment log updated'),
        description: role === 'affiliate' ? 'September Commission - ₹18,200' : (role === 'staff' ? 'Invoice #INV-2023-0078 - ₹4,850' : 'Neha Singh, 29F - Pregnancy'),
        details: role === 'affiliate' ? 'Commission for 12 active accounts transferred to bank account.' : (role === 'staff' ? 'Payment received via UPI for consultation and medications.' : 'Updated vitals and prescribed routine checkup in 2 weeks.'),
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '3',
        type: role === 'affiliate' ? 'hospital_account_created' : 'patient_admitted',
        title: role === 'affiliate' ? 'New hospital account' : (role === 'staff' ? 'Patient record updated' : 'Patient admitted'),
        description: role === 'affiliate' ? 'City Care Hospital - Multi-specialty' : (role === 'staff' ? 'Priya Mehta, 33F - Contact details updated' : 'Mohan Kumar, 65M - Cardiac issue'),
        details: role === 'affiliate' ? 'Hospital account created with premium plan (₹6,000/month).' : (role === 'staff' ? 'Updated mobile number and emergency contact details.' : 'Admitted to ICU with complaints of chest pain and shortness of breath.'),
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '4',
        type: role === 'doctor' ? 'staff_account_created' : (role === 'nurse' ? 'diet_updated' : (role === 'staff' ? 'inventory_updated' : 'doctor_account_created')),
        title: role === 'doctor' ? 'Staff account created' : (role === 'nurse' ? 'Diet plan updated' : (role === 'staff' ? 'Inventory updated' : 'New doctor account created')),
        description: role === 'doctor' ? 'Amit Joshi - Clinic Staff' : (role === 'nurse' ? 'Diet plans for 8 patients updated' : (role === 'staff' ? 'Antibiotics stock replenished' : 'Dr. Rahul Gupta - Orthopedic')),
        details: role === 'doctor' ? 'New staff account created with reception and billing permissions.' : (role === 'nurse' ? 'Updated diabetic diet plans for inpatient ward.' : (role === 'staff' ? 'Added 500 units of Amoxicillin to inventory.' : 'New account created with starting plan (₹3,500/month)')),
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '5',
        type: 'hospital_account_created',
        title: 'New hospital account created',
        description: 'Lifeline Hospital - General Hospital',
        details: 'New account created with premium plan (₹6,000/month).',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '6',
        type: 'doctor_account_created',
        title: 'New doctor account created',
        description: 'Dr. Priya Mehta - Gynecologist',
        details: 'New account created with starting plan (₹3,500/month).',
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '7',
        type: 'commission_received',
        title: 'Commission received',
        description: 'August Commission - ₹15,750',
        details: 'Commission for 10 active accounts transferred to bank account.',
        timestamp: new Date(Date.now() - 34 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '8',
        type: 'hospital_account_created',
        title: 'New hospital account created',
        description: 'City Care Hospital - Multi-specialty',
        details: 'New account created with premium plan (₹6,000/month).',
        timestamp: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    setActivities(mockActivities);
    setFilteredActivities(mockActivities);
  }, [role]);

  useEffect(() => {
    // Apply filters
    let result = [...activities];
    
    // Apply type filter
    if (filter !== "all") {
      if (filter === "accounts") {
        result = result.filter(activity => 
          activity.type === 'doctor_account_created' || 
          activity.type === 'hospital_account_created'
        );
      } else if (filter === "commission") {
        result = result.filter(activity => 
          activity.type === 'commission_received'
        );
      } else {
        result = result.filter(activity => activity.type.includes(filter));
      }
    }
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(activity => 
        activity.title.toLowerCase().includes(term) || 
        activity.description.toLowerCase().includes(term) ||
        (activity.details && activity.details.toLowerCase().includes(term))
      );
    }
    
    // Apply date range filter
    if (dateRange !== "all") {
      const now = new Date();
      let cutoff = new Date();
      
      if (dateRange === "today") {
        cutoff.setHours(0, 0, 0, 0);
      } else if (dateRange === "week") {
        cutoff.setDate(now.getDate() - 7);
      } else if (dateRange === "month") {
        cutoff.setMonth(now.getMonth() - 1);
      }
      
      result = result.filter(activity => new Date(activity.timestamp) >= cutoff);
    }
    
    setFilteredActivities(result);
  }, [activities, filter, searchTerm, dateRange]);

  // Helper to render the appropriate icon
  const renderIcon = (type: string) => {
    switch (type) {
      case 'patient_registered':
        return role === 'affiliate' ? <UserPlus className="text-primary-600 dark:text-primary-400" /> : <UserRound className="text-primary-600 dark:text-primary-400" />;
      case 'treatment_updated':
        return <ClipboardList className="text-primary-600 dark:text-primary-400" />;
      case 'payment_received':
        return <Receipt className="text-primary-600 dark:text-primary-400" />;
      case 'patient_admitted':
        return <Bed className="text-primary-600 dark:text-primary-400" />;
      case 'staff_account_created':
        return <Users className="text-primary-600 dark:text-primary-400" />;
      case 'doctor_account_created':
        return <UserPlus className="text-primary-600 dark:text-primary-400" />;
      case 'hospital_account_created':
        return <Building className="text-primary-600 dark:text-primary-400" />;
      case 'commission_received':
        return <Wallet className="text-primary-600 dark:text-primary-400" />;
      case 'diet_updated':
        return <Utensils className="text-primary-600 dark:text-primary-400" />;
      case 'inventory_updated':
        return <PackageOpen className="text-primary-600 dark:text-primary-400" />;
      default:
        return <CalendarCheck className="text-primary-600 dark:text-primary-400" />;
    }
  };

  return (
    <div className="container px-4 py-6 mx-auto max-w-7xl">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
        <p className="text-muted-foreground">
          View a complete history of activities in your account
        </p>
        
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mt-6">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Search</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search activities..." 
                className="pl-8" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="w-full md:w-48 space-y-2">
            <label className="text-sm font-medium">Filter By</label>
            <Select 
              value={filter} 
              onValueChange={setFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="All activities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All activities</SelectItem>
                {role === "affiliate" && (
                  <>
                    <SelectItem value="accounts">Account creation</SelectItem>
                    <SelectItem value="commission">Commission payments</SelectItem>
                  </>
                )}
                {role !== "affiliate" && (
                  <>
                    <SelectItem value="patient">Patient activities</SelectItem>
                    <SelectItem value="treatment">Treatment activities</SelectItem>
                    <SelectItem value="payment">Payment activities</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-48 space-y-2">
            <label className="text-sm font-medium">Time Period</label>
            <Select 
              value={dateRange} 
              onValueChange={setDateRange}
            >
              <SelectTrigger>
                <SelectValue placeholder="All time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 days</SelectItem>
                <SelectItem value="month">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Card className="mt-6">
          <CardHeader className="border-b border-slate-200 dark:border-slate-700">
            <CardTitle>Activity History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flow-root">
              <ul role="list" className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredActivities.length > 0 ? (
                  filteredActivities.map((activity, idx) => (
                    <li key={activity.id} className="p-4 sm:p-6">
                      <div className="flex items-start space-x-4">
                        <div className="relative">
                          <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                            {renderIcon(activity.type)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between">
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">
                                {activity.title}
                              </p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                {activity.description}
                              </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-slate-500 dark:text-slate-400 flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              <time dateTime={activity.timestamp}>
                                {getRelativeTime(activity.timestamp)}
                              </time>
                            </div>
                          </div>
                          {activity.details && (
                            <div className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                              <p>{activity.details}</p>
                            </div>
                          )}
                          {role === "affiliate" && activity.type.includes("account_created") && (
                            <div className="mt-2">
                              <Button variant="outline" size="sm" asChild>
                                <a href="/accounts">View Account</a>
                              </Button>
                            </div>
                          )}
                          {role === "affiliate" && activity.type === "commission_received" && (
                            <div className="mt-2">
                              <Button variant="outline" size="sm" asChild>
                                <a href="/commission">View Commission Details</a>
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-slate-500 dark:text-slate-400">No activities found with the current filters</p>
                  </div>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}