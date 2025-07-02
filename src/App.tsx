import Login from "./pages/user/Login";
import Dashboard from "./pages/user/Dashboard";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LedgerMaster from "./pages/masters/LedgerMaster";
import ProductMaster from "./pages/masters/ProductMaster";
import PaymentReceipt from "./pages/transaction/PaymentReceipt";
import InvoiceProforma from "./pages/transaction/InvoiceProforma";
import LedgerReport from "./pages/reports/LedgerReport";
import BaseMaster from "./pages/base/BaseMaster";

// export default function Page() {
const App: React.FC = () => {
  return (
    <Router>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        {/* <div className="flex w-full p-4 justify-end">
          <ModeToggle />
        </div> */}
        {/* <div className="flex w-full items-center justify-center"> */}
        {/* <div className="w-full max-w-md"> */}
        {/* <Login /> */}

        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />

          <Route
            path="/base/BaseMaster"
            element={
              <Dashboard>
                <BaseMaster />
              </Dashboard>
            }
          />

          <Route
            path="masters/ledger"
            element={
              <Dashboard>
                <LedgerMaster />
              </Dashboard>
            }
          />
          <Route
            path="masters/product"
            element={
              <Dashboard>
                <ProductMaster />
              </Dashboard>
            }
          />
          <Route
            path="transaction/payment-receipt"
            element={
              <Dashboard>
                <PaymentReceipt />
              </Dashboard>
            }
          />
          <Route
            path="transaction/invoice-proforma"
            element={
              <Dashboard>
                <InvoiceProforma />
              </Dashboard>
            }
          />
          <Route
            path="reports/LedgerReport"
            element={
              <Dashboard>
                <LedgerReport />
              </Dashboard>
            }
          />

          {/* </Route> */}
          {/* <Route path="/masters/ledger" element={<LedgerMaster />} />
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
            <Route path="/base/BaseMaster" element={<BaseMaster />} /> */}
        </Routes>
        {/* </div> */}
        {/* </div> */}
      </ThemeProvider>
    </Router>
  );
};
export default App;
