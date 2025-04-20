import { useState } from "react";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function Reports() {
  const { role } = useUserRole();
  const [activeTab, setActiveTab] = useState("patient");
  const { toast } = useToast();

  const handleDownload = (reportType: string) => {
    // In a real app, this would generate and download a report
    toast({
      title: "Report Download",
      description: `${reportType} report download started`,
    });
  };

  return (
    <div className="container px-4 py-6 mx-auto max-w-7xl">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Generate and download various reports based on your permissions.
        </p>

        <Tabs defaultValue="patient" value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
          <TabsList className="grid w-full grid-cols-4 md:w-auto md:inline-flex">
            <TabsTrigger value="patient">Patient Reports</TabsTrigger>
            <TabsTrigger value="financial">Financial Reports</TabsTrigger>
            <TabsTrigger value="inventory">Inventory Reports</TabsTrigger>
            {(role === "affiliate") && (
              <TabsTrigger value="commission">Commission Reports</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="patient" className="mt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <ReportCard 
                title="Patient Statistics"
                description="Summary of patient demographics, admissions, and treatments."
                onDownload={() => handleDownload("Patient Statistics")}
              />
              <ReportCard 
                title="Treatment Analysis"
                description="Detailed analysis of treatments performed and outcomes."
                onDownload={() => handleDownload("Treatment Analysis")}
              />
              <ReportCard 
                title="Admission Report"
                description="Report on patient admissions, stay duration, and categories."
                onDownload={() => handleDownload("Admission Report")}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="financial" className="mt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <ReportCard 
                title="Revenue Summary"
                description="Monthly revenue breakdown by department and service."
                onDownload={() => handleDownload("Revenue Summary")}
              />
              <ReportCard 
                title="Billing Status"
                description="Overview of paid and pending invoices with aging analysis."
                onDownload={() => handleDownload("Billing Status")}
              />
              <ReportCard 
                title="Financial Trends"
                description="Financial performance trends over selected time periods."
                onDownload={() => handleDownload("Financial Trends")}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="inventory" className="mt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <ReportCard 
                title="Stock Status"
                description="Current inventory levels with reorder notifications."
                onDownload={() => handleDownload("Stock Status")}
              />
              <ReportCard 
                title="Consumption Trends"
                description="Analysis of inventory consumption patterns over time."
                onDownload={() => handleDownload("Consumption Trends")}
              />
              <ReportCard 
                title="Expiry Report"
                description="Items approaching expiration date requiring attention."
                onDownload={() => handleDownload("Expiry Report")}
              />
            </div>
          </TabsContent>
          
          {(role === "affiliate") && (
            <TabsContent value="commission" className="mt-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <ReportCard 
                  title="Commission Summary"
                  description="Summary of commissions earned and pending payments."
                  onDownload={() => handleDownload("Commission Summary")}
                />
                <ReportCard 
                  title="Referral Performance"
                  description="Analysis of referral patterns and conversion rates."
                  onDownload={() => handleDownload("Referral Performance")}
                />
                <ReportCard 
                  title="Payment History"
                  description="Detailed record of commission payments processed."
                  onDownload={() => handleDownload("Payment History")}
                />
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

interface ReportCardProps {
  title: string;
  description: string;
  onDownload: () => void;
}

function ReportCard({ title, description, onDownload }: ReportCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={onDownload} 
          variant="outline" 
          className="w-full"
        >
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </CardContent>
    </Card>
  );
}