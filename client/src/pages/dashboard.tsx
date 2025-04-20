import { useAuth } from "@/context/AuthContext";
import StatCard from "@/components/dashboard/StatCard";
import ActivityLog from "@/components/dashboard/ActivityLog";
import DoctorSchedule from "@/components/dashboard/DoctorSchedule";
import AffiliateMetrics from "@/components/dashboard/AffiliateMetrics";
import { useEffect, useState } from "react";
import { getPatients, getAdmissions, getBillings, getAffiliateTracking } from "@/lib/firebase";

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    appointments: 0,
    admissions: { total: 0, opd: 0, ipd: 0 },
    revenue: 0,
    accounts: { total: 0, active: 0, pending: 0 },
    commission: { total: 0, pending: 0, paid: 0 }
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Basic data for all roles
        if (user?.role === "doctor" || user?.role === "nurse" || user?.role === "staff") {
          // Get total patients count
          const { patients } = await getPatients(user?.role === "doctor" ? user.uid : undefined);
          
          // Get active admissions
          const { admissions } = await getAdmissions(undefined, "active");
          
          // Count OPD vs IPD
          const opdCount = admissions.filter(adm => adm.admissionType === "OPD").length;
          const ipdCount = admissions.filter(adm => adm.admissionType === "IPD").length;
          
          // Get billing data
          const { billings } = await getBillings();
          const totalRevenue = billings.reduce((sum, bill) => sum + (bill.amount || 0), 0);
          
          setStats({
            ...stats,
            totalPatients: patients.length,
            appointments: patients.length > 0 ? Math.floor(patients.length * 0.3) : 0, // Simplified for demo
            admissions: { 
              total: admissions.length, 
              opd: opdCount, 
              ipd: ipdCount 
            },
            revenue: totalRevenue
          });
        } 
        else if (user?.role === "affiliate") {
          // Get affiliate specific data
          const { tracking } = await getAffiliateTracking(user?.uid);
          
          // Calculate metrics
          const totalAccounts = tracking.length;
          const activeAccounts = tracking.filter(t => t.status === "active").length;
          const pendingAccounts = tracking.filter(t => t.status === "pending").length;
          
          const totalCommission = tracking.reduce((sum, t) => sum + (t.amount || 0), 0);
          const paidCommission = tracking
            .filter(t => t.status === "paid")
            .reduce((sum, t) => sum + (t.amount || 0), 0);
          const pendingCommission = totalCommission - paidCommission;
          
          setStats({
            ...stats,
            accounts: {
              total: totalAccounts,
              active: activeAccounts,
              pending: pendingAccounts
            },
            commission: {
              total: totalCommission,
              paid: paidCommission,
              pending: pendingCommission
            }
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // If still loading
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 shadow rounded-lg p-4 sm:p-6 h-28"></div>
          ))}
        </div>
        <div className="bg-white dark:bg-slate-800 shadow rounded-lg mb-8 h-96"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {(user?.role === "doctor" || user?.role === "nurse" || user?.role === "staff") && (
          <StatCard 
            title="Total Patients"
            value={stats.totalPatients.toString()}
            icon="user-injured"
            trend={{ value: "12%", direction: "up", text: "from last month" }}
            role={user?.role || ""}
          />
        )}
        
        {(user?.role === "doctor" || user?.role === "nurse" || user?.role === "staff") && (
          <StatCard 
            title="Today's Appointments"
            value={stats.appointments.toString()}
            icon="calendar-check"
            trend={{ value: "3", direction: "down", text: "fewer than yesterday" }}
            role={user?.role || ""}
          />
        )}
        
        {(user?.role === "doctor" || user?.role === "nurse" || user?.role === "staff") && (
          <StatCard 
            title="Active Admissions"
            value={stats.admissions.total.toString()}
            icon="procedures"
            additionalInfo={[
              { label: "OPD", value: stats.admissions.opd.toString() },
              { label: "IPD", value: stats.admissions.ipd.toString() }
            ]}
            role={user?.role || ""}
          />
        )}
        
        {(user?.role !== "affiliate") && (
          <StatCard 
            title="Monthly Revenue"
            value={`₹${stats.revenue.toLocaleString('en-IN')}`}
            icon="money-bill-wave"
            trend={{ value: "8%", direction: "up", text: "increase" }}
            role={user?.role || ""}
          />
        )}
        
        {user?.role === "affiliate" && (
          <StatCard 
            title="Total Doctors"
            value={stats.accounts.total > 0 ? Math.ceil(stats.accounts.total * 0.6).toString() : "14"}
            icon="user-md"
            trend={{ value: "2", direction: "up", text: "new this month" }}
            role={user?.role || ""}
          />
        )}
        
        {user?.role === "affiliate" && (
          <StatCard 
            title="Total Hospitals"
            value={stats.accounts.total > 0 ? Math.floor(stats.accounts.total * 0.4).toString() : "10"}
            icon="hospital"
            trend={{ value: "1", direction: "up", text: "new this month" }}
            role={user?.role || ""}
          />
        )}
        
        {user?.role === "affiliate" && (
          <StatCard 
            title="Total Accounts"
            value={stats.accounts.total.toString()}
            icon="users"
            additionalInfo={[
              { label: "Active", value: stats.accounts.active.toString() },
              { label: "Pending", value: stats.accounts.pending.toString() }
            ]}
            role={user?.role || ""}
          />
        )}
        
        {user?.role === "affiliate" && (
          <StatCard 
            title="Monthly Commission"
            value={`₹${stats.commission.total.toLocaleString('en-IN')}`}
            icon="hand-holding-usd"
            additionalInfo={[
              { label: "Pending", value: `₹${stats.commission.pending.toLocaleString('en-IN')}` },
              { label: "Paid", value: `₹${stats.commission.paid.toLocaleString('en-IN')}` }
            ]}
            role={user?.role || ""}
          />
        )}
      </div>
      
      {/* Recent Activity */}
      <ActivityLog role={user?.role || ""} />
      
      {/* Role-specific content */}
      {user?.role === "doctor" && <DoctorSchedule />}
      
      {user?.role === "affiliate" && <AffiliateMetrics metrics={stats} />}
    </div>
  );
}
