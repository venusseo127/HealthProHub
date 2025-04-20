import { useState } from "react";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

export default function Settings() {
  const { user } = useAuth();
  const { role } = useUserRole();
  const [activeTab, setActiveTab] = useState("profile");
  const { toast } = useToast();
  
  const [profileForm, setProfileForm] = useState({
    name: user?.displayName || "",
    email: user?.email || "",
    phone: "",
    language: "english"
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    appNotifications: true,
    newPatient: true,
    appointmentReminders: true,
    systemUpdates: true
  });
  
  const handleProfileSave = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated successfully."
    });
  };
  
  const handleNotificationSave = () => {
    toast({
      title: "Notification Settings Updated",
      description: "Your notification preferences have been saved."
    });
  };

  return (
    <div className="container px-4 py-6 mx-auto max-w-5xl">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>

        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
          <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={user?.photoURL || ""} />
                    <AvatarFallback className="text-2xl">{getInitials(user?.displayName || "User")}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 text-center sm:text-left">
                    <h3 className="text-xl font-medium">{user?.displayName || "User"}</h3>
                    <p className="text-sm text-muted-foreground">{role ? role.charAt(0).toUpperCase() + role.slice(1) : "User"}</p>
                    <Button variant="outline" size="sm">
                      Change Picture
                    </Button>
                  </div>
                </div>
                
                <div className="grid gap-4 pt-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                      id="phone" 
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <select 
                      id="language"
                      className="w-full h-10 px-3 py-2 bg-transparent border rounded-md border-input"
                      value={profileForm.language}
                      onChange={(e) => setProfileForm({...profileForm, language: e.target.value})}
                    >
                      <option value="english">English</option>
                      <option value="spanish">Spanish</option>
                      <option value="french">French</option>
                      <option value="german">German</option>
                    </select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end space-x-2">
                <Button variant="outline">Cancel</Button>
                <Button onClick={handleProfileSave}>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Configure how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notification Channels</h3>
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="flex items-center justify-between space-x-4">
                      <Label htmlFor="email-notifications" className="flex-1">
                        Email Notifications
                      </Label>
                      <Switch 
                        id="email-notifications" 
                        checked={notificationSettings.emailNotifications}
                        onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between space-x-4">
                      <Label htmlFor="sms-notifications" className="flex-1">
                        SMS Notifications
                      </Label>
                      <Switch 
                        id="sms-notifications" 
                        checked={notificationSettings.smsNotifications}
                        onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, smsNotifications: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between space-x-4">
                      <Label htmlFor="app-notifications" className="flex-1">
                        In-App Notifications
                      </Label>
                      <Switch 
                        id="app-notifications" 
                        checked={notificationSettings.appNotifications}
                        onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, appNotifications: checked})}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 space-y-4">
                  <h3 className="text-lg font-medium">Notification Types</h3>
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="flex items-center justify-between space-x-4">
                      <Label htmlFor="new-patient" className="flex-1">
                        New Patient Registrations
                      </Label>
                      <Switch 
                        id="new-patient" 
                        checked={notificationSettings.newPatient}
                        onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, newPatient: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between space-x-4">
                      <Label htmlFor="appointment-reminders" className="flex-1">
                        Appointment Reminders
                      </Label>
                      <Switch 
                        id="appointment-reminders" 
                        checked={notificationSettings.appointmentReminders}
                        onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, appointmentReminders: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between space-x-4">
                      <Label htmlFor="system-updates" className="flex-1">
                        System Updates
                      </Label>
                      <Switch 
                        id="system-updates" 
                        checked={notificationSettings.systemUpdates}
                        onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, systemUpdates: checked})}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end space-x-2">
                <Button variant="outline">Reset to Default</Button>
                <Button onClick={handleNotificationSave}>Save Preferences</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your password and account security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Change Password</h3>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 space-y-4">
                  <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account by enabling two-factor authentication.
                  </p>
                  <Button variant="outline">
                    Enable Two-Factor Authentication
                  </Button>
                </div>
                
                <div className="pt-4 space-y-4">
                  <h3 className="text-lg font-medium">Sessions</h3>
                  <p className="text-sm text-muted-foreground">
                    These are the devices that have logged into your account. Revoke any sessions that you do not recognize.
                  </p>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Current Session</p>
                        <p className="text-sm text-muted-foreground">Last active: Just now</p>
                      </div>
                      <Button variant="ghost" size="sm" disabled>
                        This Device
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end space-x-2">
                <Button variant="outline">Cancel</Button>
                <Button>Update Password</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}