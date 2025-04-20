import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardStats } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Building, Users } from "lucide-react";

interface AffiliateMetricsProps {
  metrics: DashboardStats;
}

export default function AffiliateMetrics({ metrics }: AffiliateMetricsProps) {
  // Ensure accounts and commission properties exist
  const accounts = metrics.accounts || { total: 0, active: 0, pending: 0 };
  const commission = metrics.commission || { total: 0, pending: 0, paid: 0 };

  // Calculate percentages for progress bars
  const doctorActivePercentage = 85; // In a real app, calculate from actual data
  const doctorPendingPercentage = 15;
  const hospitalActivePercentage = 80;
  const hospitalPendingPercentage = 20;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Account Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                Doctor Accounts ({accounts.total > 0 ? Math.ceil(accounts.total * 0.6) : 14})
              </h4>
              <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Active</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {accounts.total > 0 ? Math.ceil(accounts.active * 0.6) : 12}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2.5">
                  <div 
                    className="bg-green-500 h-2.5 rounded-full" 
                    style={{ width: `${doctorActivePercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center mt-4 mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Pending Payment</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {accounts.total > 0 ? Math.ceil(accounts.pending * 0.6) : 2}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2.5">
                  <div 
                    className="bg-yellow-500 h-2.5 rounded-full" 
                    style={{ width: `${doctorPendingPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                Hospital Accounts ({accounts.total > 0 ? Math.floor(accounts.total * 0.4) : 10})
              </h4>
              <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Active</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {accounts.total > 0 ? Math.floor(accounts.active * 0.4) : 8}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2.5">
                  <div 
                    className="bg-green-500 h-2.5 rounded-full" 
                    style={{ width: `${hospitalActivePercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center mt-4 mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Pending Payment</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {accounts.total > 0 ? Math.floor(accounts.pending * 0.4) : 2}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2.5">
                  <div 
                    className="bg-yellow-500 h-2.5 rounded-full" 
                    style={{ width: `${hospitalPendingPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Monthly Revenue</h4>
              <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Doctors (₹3,500/month)</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {formatCurrency(accounts.active > 0 ? 3500 * Math.ceil(accounts.active * 0.6) : 42000)}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Hospitals (₹6,000/month)</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {formatCurrency(accounts.active > 0 ? 6000 * Math.floor(accounts.active * 0.4) : 48000)}
                  </span>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Total Revenue</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {formatCurrency(commission.total > 0 ? commission.total * 5 : 90000)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm font-medium text-green-600 dark:text-green-500">Your Commission (20%)</span>
                    <span className="text-sm font-medium text-green-600 dark:text-green-500">
                      {formatCurrency(commission.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <ul role="list" className="divide-y divide-slate-200 dark:divide-slate-700">
            <li className="py-4">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-slate-700 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">Dr. Ananya Sharma</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">Cardiologist</p>
                </div>
                <div>
                  <Badge variant="default">Active</Badge>
                </div>
              </div>
            </li>
            <li className="py-4">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-slate-700 flex items-center justify-center">
                    <Building className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">City Care Hospital</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">Multi-specialty</p>
                </div>
                <div>
                  <Badge variant="default">Active</Badge>
                </div>
              </div>
            </li>
            <li className="py-4">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-slate-700 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">Dr. Rahul Gupta</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">Orthopedic</p>
                </div>
                <div>
                  <Badge variant="secondary">Pending</Badge>
                </div>
              </div>
            </li>
            <li className="py-4">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-slate-700 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">Dr. Priya Mehta</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">Gynecologist</p>
                </div>
                <div>
                  <Badge variant="default">Active</Badge>
                </div>
              </div>
            </li>
            <li className="py-4">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-slate-700 flex items-center justify-center">
                    <Building className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">Lifeline Hospital</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">General Hospital</p>
                </div>
                <div>
                  <Badge variant="secondary">Pending</Badge>
                </div>
              </div>
            </li>
          </ul>
          <div className="mt-6">
            <Button className="w-full">
              Create New Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
