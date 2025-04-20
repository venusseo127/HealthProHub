import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getInventoryItems } from "@/lib/firebase";
import { QueryDocumentSnapshot } from "firebase/firestore";

export default function Inventory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<any> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  // Check if user has permission
  useEffect(() => {
    if (user && (user.role === "nurse" || user.role === "staff")) {
      fetchInventoryItems();
    } else if (user && user.role !== "nurse" && user.role !== "staff") {
      toast({
        title: "Access Denied",
        description: "You don't have permission to view the inventory",
        variant: "destructive",
      });
      setLocation("/dashboard");
    }
  }, [filter, user]);

  const fetchInventoryItems = async (loadMore = false) => {
    setLoading(true);
    try {
      // Get type filter
      const typeFilter = filter !== "all" ? filter : undefined;
      
      const result = await getInventoryItems(
        typeFilter, 
        false,
        loadMore ? lastVisible : undefined
      );
      
      if (result.items.length === 0) {
        setHasMore(false);
      } else {
        setLastVisible(result.lastVisible);
        if (loadMore) {
          setInventoryItems([...inventoryItems, ...result.items]);
        } else {
          setInventoryItems(result.items);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load inventory items",
        variant: "destructive",
      });
      console.error("Error fetching inventory items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewItem = () => {
    setLocation("/inventory/add");
  };

  const filteredItems = inventoryItems.filter(item => {
    // Apply search query
    const matchesSearch = 
      (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.type && item.type.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch;
  });

  // Calculate low-stock items
  const lowStockItems = filteredItems.filter(item => 
    item.quantity <= item.reorderLevel
  );

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
              placeholder="Search inventory items..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </div>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <Select defaultValue={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full md:w-44">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="medicine">Medicines</SelectItem>
              <SelectItem value="supply">Supplies</SelectItem>
              <SelectItem value="equipment">Equipment</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={handleAddNewItem}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Item
          </Button>
        </div>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredItems.length}</div>
            <p className="text-sm text-slate-500 dark:text-slate-400">items in inventory</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems.length}</div>
            <p className="text-sm text-slate-500 dark:text-slate-400">items need reorder</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Stock Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{filteredItems
                .reduce((total, item) => total + (item.price || 0) * item.quantity, 0)
                .toLocaleString('en-IN')}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">total inventory value</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs for All and Low Stock */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {renderInventoryTable(filteredItems, loading)}
        </TabsContent>
        
        <TabsContent value="low-stock">
          {renderInventoryTable(lowStockItems, loading)}
        </TabsContent>
      </Tabs>
      
      {/* Load More */}
      {!loading && inventoryItems.length > 0 && hasMore && (
        <div className="flex justify-center mt-4">
          <Button 
            variant="outline" 
            onClick={() => fetchInventoryItems(true)}
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
  
  function renderInventoryTable(items: any[], loading: boolean) {
    if (loading && items.length === 0) {
      return (
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
          ))}
        </div>
      );
    }
    
    if (!loading && items.length === 0) {
      return (
        <Card>
          <CardContent className="text-center py-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-200">No inventory items</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Get started by adding items to inventory.</p>
            <div className="mt-6">
              <Button onClick={handleAddNewItem}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Item
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="capitalize">{item.type}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>
                  {item.quantity <= item.reorderLevel ? (
                    <Badge variant="destructive">Low Stock</Badge>
                  ) : (
                    <Badge variant="outline">In Stock</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setLocation(`/inventory/${item.id}`)}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </Button>
                    <Button variant="ghost" size="sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v7h-2l-1 2H8l-1-2H5V5z" clipRule="evenodd" />
                      </svg>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
}
