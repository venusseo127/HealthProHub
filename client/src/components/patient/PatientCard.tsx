import { Badge } from "@/components/ui/badge";
import { Calendar, Phone, User } from "lucide-react";
import { useLocation } from "wouter";
import { formatDate } from "@/lib/utils";
import { Patient } from "@/types";

interface PatientCardProps {
  patient: Patient;
}

export default function PatientCard({ patient }: PatientCardProps) {
  const [, setLocation] = useLocation();

  const handleClick = () => {
    setLocation(`/patients/${patient.id}`);
  };

  const getGenderText = (gender: string) => {
    switch (gender) {
      case 'M': return 'Male';
      case 'F': return 'Female';
      case 'O': return 'Other';
      default: return gender;
    }
  };

  return (
    <li>
      <div 
        className="block hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
        onClick={handleClick}
      >
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-primary-600 dark:text-primary-400 truncate">
              {patient.name}
            </p>
            <div className="ml-2 flex-shrink-0 flex">
              <Badge variant={patient.status === 'active' ? 'default' : patient.status === 'critical' ? 'destructive' : 'secondary'}>
                {patient.status === 'active' ? 'Active' : 
                 patient.status === 'critical' ? 'Critical' : 
                 patient.status === 'follow-up' ? 'Follow-up' : 'Inactive'}
              </Badge>
            </div>
          </div>
          <div className="mt-2 sm:flex sm:justify-between">
            <div className="sm:flex">
              <p className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                <User className="flex-shrink-0 mr-1.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                {patient.age}{patient.gender} - {patient.bloodGroup ? `${patient.bloodGroup} • ` : ''}
                {patient.allergies ? `Allergies: ${patient.allergies}` : 'No known allergies'}
              </p>
              <p className="mt-2 flex items-center text-sm text-slate-500 dark:text-slate-400 sm:mt-0 sm:ml-6">
                <Phone className="flex-shrink-0 mr-1.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                {patient.contact || 'No contact'}
              </p>
            </div>
            <div className="mt-2 flex items-center text-sm text-slate-500 dark:text-slate-400 sm:mt-0">
              <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <p>
                Last visit: <time dateTime={patient.lastVisit || patient.createdAt}>
                  {formatDate(patient.lastVisit || patient.createdAt)}
                </time>
              </p>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
