import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

interface Appointment {
  id: string;
  time: string;
  patientName: string;
  type: string;
  description: string;
}

export default function DoctorSchedule() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    // In a real app, you would fetch appointments from your backend
    // This is mocked data for demonstration purposes
    const mockAppointments: Appointment[] = [
      {
        id: '1',
        time: '9:30 AM',
        patientName: 'Ravi Sharma',
        type: 'OPD Consultation',
        description: 'Follow-up for hypertension'
      },
      {
        id: '2',
        time: '11:00 AM',
        patientName: 'Sonia Khanna',
        type: 'New Consultation',
        description: 'Abdominal pain for 3 days'
      },
      {
        id: '3',
        time: '2:15 PM',
        patientName: 'Hospital Rounds',
        type: 'IPD Visits',
        description: '7 inpatients to check'
      },
      {
        id: '4',
        time: '4:30 PM',
        patientName: 'OPD',
        type: 'OPD Consultations',
        description: '5 patients scheduled'
      }
    ];

    setAppointments(mockAppointments);
  }, []);

  return (
    <Card className="mt-6">
      <CardHeader className="pb-2 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <CardTitle>Today's Schedule</CardTitle>
        <Button variant="link" className="h-auto p-0 text-sm">
          View calendar
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <div className="overflow-hidden">
          <ul role="list" className="divide-y divide-slate-200 dark:divide-slate-700">
            {appointments.map((appointment) => (
              <li key={appointment.id} className="py-4 flex">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-300">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {appointment.time} - {appointment.patientName}
                    </p>
                    <Badge variant="secondary">
                      {appointment.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {appointment.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
