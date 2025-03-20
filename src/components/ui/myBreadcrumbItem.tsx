import React from "react";
import { useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";

const AppBreadcrumb: React.FC = () => {
  const location = useLocation();
  let label = "Dashboard"; // default fallback

  if (location.pathname.includes("/masters/ledger")) {
    label = "Ledger Master";
  } else if (location.pathname.includes("/masters/product")) {
    label = "Product Master";
  } else if (location.pathname.includes("/transaction/payment-receipt")) {
    label = "Payment Receipt";
  } else if (location.pathname.includes("/transaction/invoice-proforma")) {
    label = "Invoice Proforma";
  } else if (location.pathname.includes("/reports/ledgerreport")) {
    label = "Ledger Report";
  } else if (location.pathname.includes("/base/basemaster")) {
    label = "Records";
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href="#">{label}</BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default AppBreadcrumb;
