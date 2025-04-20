import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { addStaffMember } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export default function AddStaff() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("nurse");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([
    "view_patients",
    "edit_patients"
  ]);
  
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const availablePermissions = [
    { id: "view_patients", label: "View Patients" },
    { id: "edit_patients", label: "Edit Patients" },
    { id: "view_admissions", label: "View Admissions" },
    { id: "manage_admissions", label: "Manage Admissions" },
    { id: "view_treatments", label: "View Treatments" },
    { id: "manage_treatments", label: "Manage Treatments" },
    { id: "view_billing", label: "View Billing" },
    { id: "manage_billing", label: "Manage Billing" },
    { id: "view_inventory", label: "View Inventory" },
    { id: "manage_inventory", label: "Manage Inventory" },
    { id: "view_reports", label: "View Reports" }
  ];

  // Toggle permission in the array
  const togglePermission = (permission: string) => {
    if (permissions.includes(permission)) {
      setPermissions(permissions.filter(p => p !== permission));
    } else {
      setPermissions([...permissions, permission]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || user.role !== "doctor") {
      toast({
        title: "Permission Denied",
        description: "Only doctors can add staff members",
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please make sure your passwords match",
        variant: "destructive",
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const staffData = {
        name,
        email,
        role,
        permissions,
        contact: contactNumber,
        doctorId: user.uid,
        doctorName: user.displayName,
        status: "active",
      };
      
      await addStaffMember(staffData, password);
      
      toast({
        title: "Staff member added",
        description: `${name} has been added successfully as a ${role}`,
      });
      
      setLocation("/staff");
    } catch (error) {
      toast({
        title: "Error adding staff member",
        description: (error as Error).message,
        variant: "destructive",
      });
      console.error("Error adding staff member:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add Staff Member</CardTitle>
          <CardDescription>
            Add a new staff member to your team. They will be able to login using the provided email and password.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Full name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                This email will be used for login
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact">Contact Number</Label>
              <Input
                id="contact"
                placeholder="Phone number"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select defaultValue={role} onValueChange={setRole}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nurse">Nurse</SelectItem>
                  <SelectItem value="receptionist">Receptionist</SelectItem>
                  <SelectItem value="assistant">Medical Assistant</SelectItem>
                  <SelectItem value="lab">Lab Technician</SelectItem>
                  <SelectItem value="pharmacist">Pharmacist</SelectItem>
                  <SelectItem value="accountant">Accountant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            
            <div className="space-y-3 pt-2">
              <Label>Permissions</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {availablePermissions.map((permission) => (
                  <div key={permission.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={permission.id}
                      checked={permissions.includes(permission.id)}
                      onCheckedChange={() => togglePermission(permission.id)}
                    />
                    <Label 
                      htmlFor={permission.id}
                      className="font-normal text-sm cursor-pointer"
                    >
                      {permission.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => setLocation("/staff")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Staff Member"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}