import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import AppBreadcrumb from "@/components/ui/myBreadcrumbItem";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LedgerMaster from "../masters/LedgerMaster";
import ProductMaster from "../masters/ProductMaster";
import PaymentReceipt from "../transaction/PaymentReceipt";
import InvoiceProforma from "../transaction/InvoiceProforma";
import LedgerReport from "../reports/LedgerReport";
import BaseMaster from "../base/BaseMaster";
import { Outlet } from "react-router-dom";

interface DashboardProps {
  children?: React.ReactNode;
}

const Dashboard: React.FC<DashboardProps> = ({ children }) => {
  return (
    // <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            {/* <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                    <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                  </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb> */}
            <AppBreadcrumb />
          </div>
          <div className="px-4">
            <ModeToggle />
          </div>
        </header>
        {/* <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
              <div className="aspect-video rounded-xl bg-muted/50" />
              <div className="aspect-video rounded-xl bg-muted/50" />
              <div className="aspect-video rounded-xl bg-muted/50" />
            </div>
            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
          </div> */}
        <div className="flex p-4 pt-0">
          {children || <Outlet />}
          {/* <Routes>
              <Route path="/base/BaseMaster" element={<BaseMaster />} />
              <Route path="/masters/ledger" element={<LedgerMaster />} />
              <Route path="/masters/product" element={<ProductMaster />} />
              <Route
                path="/transaction/payment-receipt"
                element={<PaymentReceipt />}
              />
              <Route
                path="/transaction/invoice-proforma"
                element={<InvoiceProforma />}
              />
              <Route path="/reports/LedgerReport" element={<LedgerReport />} />
            </Routes> */}
        </div>
      </SidebarInset>
    </SidebarProvider>
    // </ThemeProvider>
  );
};
export default Dashboard;
