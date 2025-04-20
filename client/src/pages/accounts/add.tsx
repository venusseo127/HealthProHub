import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { registerUser } from "@/lib/firebase";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export default function AddAccount() {
  const [accountType, setAccountType] = useState<string>("doctor");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [hospitalType, setHospitalType] = useState("private");
  const [bedCount, setBedCount] = useState<string>("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [planType, setPlanType] = useState("standard");
  const [planAmount, setPlanAmount] = useState<string>(accountType === "doctor" ? "3500" : "6000");
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  // Set plan amount when account type changes
  const handleAccountTypeChange = (value: string) => {
    setAccountType(value);
    setPlanAmount(value === "doctor" ? "3500" : "6000");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || user.role !== "affiliate") {
      toast({
        title: "Permission Denied",
        description: "Only affiliates can add accounts",
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
      // Create the user account first
      const userCredential = await registerUser(email, password, name, accountType);
      
      // Prepare account data
      const accountData = {
        uid: userCredential.uid,
        name,
        email,
        contact: contactNumber,
        address,
        accountType,
        planType,
        planAmount: Number(planAmount),
        status: "pending", // Initially pending until payment
        affiliateId: user.uid,
        createdAt: new Date().toISOString(),
        lastPayment: null
      };
      
      // Add doctor or hospital specific fields
      if (accountType === "doctor") {
        Object.assign(accountData, {
          registrationNumber,
          specialization
        });
      } else {
        Object.assign(accountData, {
          hospitalName,
          hospitalType,
          bedCount: Number(bedCount)
        });
      }
      
      // Create the account record in affiliateAccounts collection
      await addDoc(collection(db, "affiliateAccounts"), accountData);
      
      toast({
        title: "Account created",
        description: `${name} has been added as a new ${accountType} account`,
      });
      
      setLocation("/accounts");
    } catch (error) {
      toast({
        title: "Error creating account",
        description: (error as Error).message,
        variant: "destructive",
      });
      console.error("Error creating account:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add New Account</CardTitle>
          <CardDescription>
            Register a new doctor or hospital on the healthcare platform
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <Tabs defaultValue="doctor" value={accountType} onValueChange={handleAccountTypeChange}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="doctor">Doctor</TabsTrigger>
                <TabsTrigger value="hospital">Hospital</TabsTrigger>
              </TabsList>
              
              <TabsContent value="doctor" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Doctor's Name</Label>
                  <Input
                    id="name"
                    placeholder="Dr. Full Name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="regNumber">Registration Number</Label>
                    <Input
                      id="regNumber"
                      placeholder="Medical council registration"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization</Label>
                    <Select value={specialization} onValueChange={setSpecialization}>
                      <SelectTrigger id="specialization">
                        <SelectValue placeholder="Select specialization" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Physician</SelectItem>
                        <SelectItem value="pediatrics">Pediatrics</SelectItem>
                        <SelectItem value="cardiology">Cardiology</SelectItem>
                        <SelectItem value="orthopedics">Orthopedics</SelectItem>
                        <SelectItem value="neurology">Neurology</SelectItem>
                        <SelectItem value="gynecology">Gynecology</SelectItem>
                        <SelectItem value="dermatology">Dermatology</SelectItem>
                        <SelectItem value="ophthalmology">Ophthalmology</SelectItem>
                        <SelectItem value="ent">ENT</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="hospital" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="hospitalName">Hospital Name</Label>
                  <Input
                    id="hospitalName"
                    placeholder="Hospital/Clinic name"
                    required
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hospitalType">Hospital Type</Label>
                    <RadioGroup 
                      value={hospitalType} 
                      onValueChange={setHospitalType}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="private" id="private" />
                        <Label htmlFor="private" className="font-normal">Private Hospital</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="government" id="government" />
                        <Label htmlFor="government" className="font-normal">Government Hospital</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="clinic" id="clinic" />
                        <Label htmlFor="clinic" className="font-normal">Clinic</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bedCount">Number of Beds</Label>
                    <Input
                      id="bedCount"
                      type="number"
                      placeholder="Total bed capacity"
                      value={bedCount}
                      onChange={(e) => setBedCount(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Contact Person's Name</Label>
                  <Input
                    id="name"
                    placeholder="Full name of main contact"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </TabsContent>
              
              {/* Common fields for both tabs */}
              <div className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
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
                    required
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    placeholder="Full address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
                
                <Separator className="my-4" />
                
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
                        <Label htmlFor="standard" className="font-medium">Standard Plan</Label>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Basic features with limited patient records
                        </p>
                      </div>
                      <div className="ml-auto font-medium">
                        ₹{accountType === "doctor" ? "3,500" : "6,000"}/month
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-3 border rounded-md">
                      <RadioGroupItem value="premium" id="premium" className="mt-1" />
                      <div>
                        <Label htmlFor="premium" className="font-medium">Premium Plan</Label>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Advanced features with unlimited patient records
                        </p>
                      </div>
                      <div className="ml-auto font-medium">
                        ₹{accountType === "doctor" ? "5,500" : "9,000"}/month
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => setLocation("/accounts")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}