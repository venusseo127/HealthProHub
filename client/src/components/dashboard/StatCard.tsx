import { 
  ArrowDown, 
  ArrowUp, 
  Users, 
  CalendarCheck, 
  Bed, 
  Wallet, 
  Building, 
  CircleDollarSign
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  trend?: {
    value: string;
    direction: 'up' | 'down';
    text: string;
  };
  additionalInfo?: {
    label: string;
    value: string;
  }[];
  role: string;
}

export default function StatCard({ 
  title, 
  value, 
  icon, 
  trend, 
  additionalInfo,
  role 
}: StatCardProps) {
  // Render the appropriate icon
  const renderIcon = () => {
    switch (icon) {
      case 'user-injured':
        return <Users className="text-primary-500 dark:text-primary-400" />;
      case 'calendar-check':
        return <CalendarCheck className="text-primary-500 dark:text-primary-400" />;
      case 'procedures':
        return <Bed className="text-primary-500 dark:text-primary-400" />;
      case 'money-bill-wave':
        return <Wallet className="text-primary-500 dark:text-primary-400" />;
      case 'users':
        return <Building className="text-primary-500 dark:text-primary-400" />;
      case 'hand-holding-usd':
        return <CircleDollarSign className="text-primary-500 dark:text-primary-400" />;
      default:
        return <Users className="text-primary-500 dark:text-primary-400" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-4 sm:p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0 rounded-full p-3 bg-primary-50 dark:bg-slate-700">
          {renderIcon()}
        </div>
        <div className="ml-4">
          <h2 className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</h2>
          <p className="text-2xl font-semibold text-slate-900 dark:text-white">{value}</p>
        </div>
      </div>
      
      {trend && (
        <div className="mt-2">
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            trend.direction === 'up' 
              ? 'text-green-600 bg-green-50 dark:bg-slate-700 dark:text-green-500' 
              : 'text-red-500 bg-red-50 dark:bg-slate-700 dark:text-red-400'
          }`}>
            {trend.direction === 'up' ? <ArrowUp className="inline h-3 w-3 mr-1" /> : <ArrowDown className="inline h-3 w-3 mr-1" />}
            {trend.value} {trend.text}
          </span>
        </div>
      )}
      
      {additionalInfo && additionalInfo.length > 0 && (
        <div className="mt-2 flex gap-2">
          {additionalInfo.map((info, index) => (
            <span key={index} className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
              {info.label}: {info.value}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
