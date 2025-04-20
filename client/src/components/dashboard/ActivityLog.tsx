import { CalendarCheck, UserRound, ClipboardList, Receipt, Bed, Users, UserPlus, Building, Wallet, Utensils, PackageOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getRelativeTime } from "@/lib/utils";
import { useEffect, useState } from "react";
import { ActivityLog as ActivityLogType } from "@/types";

interface ActivityLogProps {
  role: string;
}

export default function ActivityLog({ role }: ActivityLogProps) {
  const [activities, setActivities] = useState<ActivityLogType[]>([]);

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
        type: role === 'doctor' ? 'staff_account_created' : (role === 'nurse' ? 'diet_updated' : (role === 'staff' ? 'inventory_updated' : 'patient_registered')),
        title: role === 'doctor' ? 'Staff account created' : (role === 'nurse' ? 'Diet plan updated' : (role === 'staff' ? 'Inventory updated' : 'New referral processed')),
        description: role === 'doctor' ? 'Amit Joshi - Clinic Staff' : (role === 'nurse' ? 'Diet plans for 8 patients updated' : (role === 'staff' ? 'Antibiotics stock replenished' : 'Dr. Rahul Gupta - Orthopedic')),
        details: role === 'doctor' ? 'New staff account created with reception and billing permissions.' : (role === 'nurse' ? 'Updated diabetic diet plans for inpatient ward.' : (role === 'staff' ? 'Added 500 units of Amoxicillin to inventory.' : 'Processed referral through affiliate program.')),
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    setActivities(mockActivities);
  }, [role]);

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
    <Card>
      <CardHeader className="pb-2 border-b border-slate-200 dark:border-slate-700">
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flow-root">
          <ul role="list" className="-mb-8">
            {activities.map((activity, idx) => (
              <li key={activity.id}>
                <div className="relative pb-8">
                  {idx < activities.length - 1 && (
                    <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-slate-200 dark:bg-slate-700" aria-hidden="true"></span>
                  )}
                  <div className="relative flex items-start space-x-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center ring-8 ring-white dark:ring-slate-800">
                        {renderIcon(activity.type)}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div>
                        <div className="text-sm">
                          <a href="#" className="font-medium text-slate-900 dark:text-white">
                            {activity.title}
                          </a>
                        </div>
                        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                          {activity.description}
                        </p>
                      </div>
                      <div className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                        <p>{activity.details}</p>
                      </div>
                    </div>
                    <div className="text-right text-sm whitespace-nowrap text-slate-500 dark:text-slate-400">
                      <time dateTime={activity.timestamp}>
                        {getRelativeTime(activity.timestamp)}
                      </time>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-6">
          <Button variant="outline" className="w-full">
            View all activity
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
