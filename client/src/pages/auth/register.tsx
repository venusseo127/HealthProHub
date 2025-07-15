import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { registerUser } from "@/lib/firebase";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addDoc, collection } from "firebase/firestore";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [role, setRole] = useState("doctor");
  const [subscription, setSubscription] = useState("3");
  const [isLoading, setIsLoading] = useState(false);
  const [planType, setPlanType] = useState("standard");
  const [planAmount, setPlanAmount] = useState<string>("2499");
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please make sure your passwords match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      /*
      subscription
      1 = admin
      2 = affiliate
      3= registered withour affiliate with 7 days trial
      else = affiliate Id
      */

     if(role=="affiliate"){
      setSubscription("2")
     }
     // Prepare account data
      const accountData = {
        name,
        email,
        contact: contactNumber,
        planType,
        planAmount: Number(planAmount),
        planStart: new Date().toISOString(),
        planEnd: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),// 7 days trial
        accountType:'doctor',
        status: "trial", // Initially pending until payment
        affiliateId: '2MhNMC1NolON3a77r8AXNRw6bJO2', // admin: no affiliate
        createdAt: new Date().toISOString(),
        lastPayment: null
      };

      // Create the account record in Accounts collection 
      await addDoc(collection(db, "Accounts"), accountData);

      await registerUser(email, password, name, role, subscription);
      toast({
        title: "Registration successful",
        description: "Your account has been created successfully",
      });
      setLocation("/dashboard");
    } catch (error) {
      toast({
        title: "Registration failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>Enter your information to create an account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Dr. John Doe"
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
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
                  <Label htmlFor="contact">Contact Number</Label>
                  <Input
                    id="contact"
                    placeholder="Phone number"
                    required
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                  />
                </div>
            <div className="space-y-2">
              <Label htmlFor="role">Account Type</Label>
              <Select defaultValue={role} onValueChange={(value) => setRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="affiliate">Affiliate</SelectItem>
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
            
            <div className="space-y-2">
                  <Label>Subscription Plan</Label>
                  <RadioGroup 
                    value={planType} 
                    onValueChange={setPlanType}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-start space-x-3 p-3 border rounded-md">
                      <RadioGroupItem value="standard" id="standard" className="mt-1" />
                      <div>
                        <Label htmlFor="standard" className="font-medium">Free Health Pro Account Plus 7 days trial of Premium Plan</Label>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Users (especially doctors or health professionals) to create a personal profile website for free. 
                          You can select from professionally designed templates, customize content (bio, contact info, services, etc.), and publish their site instantly.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 border rounded-md">
                      <RadioGroupItem value="standard" id="standard" className="mt-1" />
                      <div>
                        <Label htmlFor="standard" className="font-medium">Standard Plan - Php {accountType === "doctor" ? "2499" : "4,000"}/month</Label>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Basic features with limited patient records
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 border rounded-md">
                      <RadioGroupItem value="premium" id="premium" className="mt-1" />
                      <div>
                        <Label htmlFor="premium" className="font-medium">Premium Plan - Php {accountType === "doctor" ? "4,000" : "5,500"}/month</Label>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Advanced features with unlimited patient records
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
            <p className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Button variant="link" className="p-0" onClick={() => setLocation("/login")}>
                Sign in
              </Button>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
