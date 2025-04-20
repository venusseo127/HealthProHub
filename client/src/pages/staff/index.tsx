import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getStaffMembers } from "@/lib/firebase";
import { QueryDocumentSnapshot } from "firebase/firestore";

export default function Staff() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<any> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  // Check if user has permission (doctor only)
  useEffect(() => {
    if (user && user.role === "doctor") {
      fetchStaffMembers();
    } else if (user && user.role !== "doctor") {
      toast({
        title: "Access Denied",
        description: "Only doctors can access staff management",
        variant: "destructive",
      });
      setLocation("/dashboard");
    }
  }, [filter, user]);

  const fetchStaffMembers = async (loadMore = false) => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get role filter
      const roleFilter = filter !== "all" ? filter : undefined;
      
      const result = await getStaffMembers(
        user.uid, 
        undefined,
        roleFilter,
        loadMore ? lastVisible : undefined
      );
      
      if (result.staff.length === 0) {
        setHasMore(false);
      } else {
        setLastVisible(result.lastVisible);
        if (loadMore) {
          setStaffMembers([...staffMembers, ...result.staff]);
        } else {
          setStaffMembers(result.staff);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load staff members",
        variant: "destructive",
      });
      console.error("Error fetching staff members:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewStaff = () => {
    setLocation("/staff/add");
  };

  const filteredStaff = staffMembers.filter(staff => {
    // Apply search query
    const matchesSearch = 
      (staff.displayName && staff.displayName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (staff.email && staff.email.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch;
  });

  function getInitials(name: string) {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  }

  function getRoleBadgeVariant(role: string) {
    switch (role) {
      case 'nurse':
        return 'default';
      case 'staff':
        return 'secondary';
      default:
        return 'outline';
    }
  }

  return (
    <div className="space-y-6">
      {/* Search and actions */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:max-w-md">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <Input 
              className="pl-10" 
              placeholder="Search staff members..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </div>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <Select defaultValue={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full md:w-44">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Staff</SelectItem>
              <SelectItem value="nurse">Nurses</SelectItem>
              <SelectItem value="staff">Clinic Staff</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={handleAddNewStaff}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Staff
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredStaff.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Nurses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredStaff.filter(s => s.role === 'nurse').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Clinic Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredStaff.filter(s => s.role === 'staff').length}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Loading state */}
      {loading && staffMembers.length === 0 && (
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="flex items-center p-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 mr-4"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Empty state */}
      {!loading && staffMembers.length === 0 && (
        <Card>
          <CardContent className="text-center py-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-200">No staff members</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Get started by adding staff members to your practice.</p>
            <div className="mt-6">
              <Button onClick={handleAddNewStaff}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Staff
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Staff List */}
      {staffMembers.length > 0 && (
        <div className="space-y-4">
          {filteredStaff.map((staff) => (
            <Card key={staff.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setLocation(`/staff/${staff.id}`)}>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-4">
                    {staff.photoURL ? (
                      <AvatarImage src={staff.photoURL} alt={staff.displayName} />
                    ) : (
                      <AvatarFallback>{getInitials(staff.displayName || 'Staff Member')}</AvatarFallback>
                    )}
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-medium">{staff.displayName}</h3>
                      <Badge variant={getRoleBadgeVariant(staff.role)} className="capitalize">
                        {staff.role}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{staff.email}</p>
                    
                    {staff.permissions && staff.permissions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {staff.permissions.map((permission: string, index: number) => (
                          <span 
                            key={index}
                            className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-full capitalize"
                          >
                            {permission}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </Button>
                    <Button variant="ghost" size="sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {/* Load More */}
          {!loading && staffMembers.length > 0 && hasMore && (
            <div className="flex justify-center mt-4">
              <Button 
                variant="outline" 
                onClick={() => fetchStaffMembers(true)}
              >
                Load More
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
