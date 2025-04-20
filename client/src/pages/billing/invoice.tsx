import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatCurrency } from "@/lib/utils";

export default function Invoice({ params }: { params: { id: string } }) {
  const [invoice, setInvoice] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const printRef = useRef<HTMLDivElement>(null);
  const { id } = params;

  useEffect(() => {
    const fetchInvoiceData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Fetch billing/invoice data
        const invoiceDoc = await getDoc(doc(db, "billings", id));
        
        if (!invoiceDoc.exists()) {
          toast({
            title: "Not found",
            description: "The invoice was not found",
            variant: "destructive",
          });
          setLocation("/billing");
          return;
        }
        
        const invoiceData = { id: invoiceDoc.id, ...invoiceDoc.data() };
        setInvoice(invoiceData);
        
        // Fetch patient data if patientId exists
        if (invoiceData.patientId) {
          const patientDoc = await getDoc(doc(db, "patients", invoiceData.patientId));
          if (patientDoc.exists()) {
            setPatient({ id: patientDoc.id, ...patientDoc.data() });
          }
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load invoice details",
          variant: "destructive",
        });
        console.error("Error fetching invoice details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceData();
  }, [id, toast, setLocation]);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;
    
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    
    window.print();
    
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  const calculateTotal = (): number => {
    if (!invoice || !invoice.items) return 0;
    return invoice.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
  };

  const calculateTax = (): number => {
    if (!invoice) return 0;
    const taxRate = invoice.taxRate || 0.18; // Default 18% if not specified
    return calculateTotal() * taxRate;
  };

  const calculateGrandTotal = (): number => {
    return calculateTotal() + calculateTax() - (invoice?.discount || 0);
  };

  const getStatusColor = (): string => {
    if (!invoice) return "";
    switch (invoice.status) {
      case "paid":
        return "text-green-600";
      case "pending":
        return "text-amber-600";
      case "overdue":
        return "text-red-600";
      default:
        return "text-slate-600";
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto animate-pulse">
        <Card>
          <CardHeader>
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex justify-between">
              <div className="space-y-4 w-1/2">
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
              </div>
              <div className="space-y-4 w-1/3">
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
              </div>
            </div>
            <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded w-1/3 ml-auto"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium">Invoice not found</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              The invoice you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button className="mt-6" onClick={() => setLocation("/billing")}>
              Back to Billing
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Invoice</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setLocation("/billing")}>
            Back to Billing
          </Button>
          <Button onClick={handlePrint}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Invoice
          </Button>
        </div>
      </div>

      <Card className="mb-8" ref={printRef}>
        <CardContent className="p-8">
          {/* Header */}
          <div className="flex justify-between mb-10">
            <div>
              <h1 className="text-3xl font-bold">INVOICE</h1>
              <Badge className={`mt-2 ${getStatusColor()}`}>
                {invoice.status ? invoice.status.toUpperCase() : "DRAFT"}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">Healthcare Platform</p>
              <p>123 Medical Center Dr.</p>
              <p>New Delhi, India 110001</p>
              <p>contact@healthcare-platform.com</p>
              <p>+91 123-456-7890</p>
            </div>
          </div>

          {/* Invoice Info & Patient */}
          <div className="grid grid-cols-2 gap-8 mb-10">
            <div>
              <div className="text-slate-500 mb-1 text-sm">BILLED TO</div>
              <p className="font-bold">{patient?.name || "Patient"}</p>
              <p>{patient?.address || "Address not provided"}</p>
              <p>{patient?.contact || "Contact not provided"}</p>
            </div>
            <div className="text-right">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-slate-500 text-sm">INVOICE NUMBER</div>
                <div className="font-medium">{invoice.invoiceNumber || `INV-${invoice.id}`}</div>
                
                <div className="text-slate-500 text-sm">DATE ISSUED</div>
                <div className="font-medium">{new Date(invoice.createdAt).toLocaleDateString()}</div>
                
                <div className="text-slate-500 text-sm">DUE DATE</div>
                <div className="font-medium">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "On receipt"}</div>
                
                {invoice.admissionId && (
                  <>
                    <div className="text-slate-500 text-sm">ADMISSION ID</div>
                    <div className="font-medium">{invoice.admissionId}</div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-10">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-t-md">
              <div className="grid grid-cols-12 gap-4 p-4 font-medium">
                <div className="col-span-5">Item</div>
                <div className="col-span-2">Quantity</div>
                <div className="col-span-2 text-right">Rate</div>
                <div className="col-span-3 text-right">Amount</div>
              </div>
            </div>
            
            <div className="border-x border-b rounded-b-md divide-y">
              {invoice.items && invoice.items.map((item: any, idx: number) => (
                <div key={idx} className="grid grid-cols-12 gap-4 p-4">
                  <div className="col-span-5">
                    <div className="font-medium">{item.description}</div>
                    {item.details && <div className="text-sm text-slate-500">{item.details}</div>}
                  </div>
                  <div className="col-span-2">{item.quantity || 1}</div>
                  <div className="col-span-2 text-right">{formatCurrency(item.price)}</div>
                  <div className="col-span-3 text-right">{formatCurrency(item.price * (item.quantity || 1))}</div>
                </div>
              ))}
              
              {/* If no items are provided, show a placeholder */}
              {(!invoice.items || invoice.items.length === 0) && (
                <div className="p-4 text-center text-slate-500">
                  No items added to this invoice
                </div>
              )}
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-slate-500">Subtotal</div>
                <div className="text-right">{formatCurrency(calculateTotal())}</div>
                
                <div className="text-slate-500">Tax ({((invoice.taxRate || 0.18) * 100).toFixed(1)}%)</div>
                <div className="text-right">{formatCurrency(calculateTax())}</div>
                
                {invoice.discount && invoice.discount > 0 && (
                  <>
                    <div className="text-slate-500">Discount</div>
                    <div className="text-right">-{formatCurrency(invoice.discount)}</div>
                  </>
                )}
                
                <div className="text-slate-800 dark:text-slate-200 font-bold text-lg pt-2 border-t">Total</div>
                <div className="text-right font-bold text-lg pt-2 border-t">{formatCurrency(calculateGrandTotal())}</div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mb-8">
              <div className="text-slate-500 mb-1">NOTES</div>
              <p className="text-sm">{invoice.notes}</p>
            </div>
          )}

          {/* Payment Instructions */}
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-md">
            <div className="text-slate-500 mb-1">PAYMENT INSTRUCTIONS</div>
            <p className="text-sm">Please make payment via bank transfer or in person at our facility.</p>
            <p className="text-sm mt-2">
              <span className="font-medium">Bank Transfer:</span> Healthcare Platform Ltd. | Account: 1234567890 | IFSC: HDFC0001234
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-slate-500">
            <p>Thank you for choosing Healthcare Platform for your medical needs.</p>
            <p>For any queries related to this invoice, please contact our billing department.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}