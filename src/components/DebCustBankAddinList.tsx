import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "@/components/ui/table";

interface BankDetail {
  accountType: string;
  accountNumber: string;
  bankBranch: string;
  ifscCode: string;
  micrCode: string;
}

interface CustomerBankDetailsTableProps {
  bankDetails: BankDetail[];
}

const DebCustBankAddinList: React.FC<CustomerBankDetailsTableProps> = ({
  bankDetails,
}) => {
  return (
    <Table>
      <TableCaption>A list of bank details.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Account Type</TableHead>
          <TableHead>Account Number</TableHead>
          <TableHead>Bank Branch</TableHead>
          <TableHead>IFSC Code</TableHead>
          <TableHead>MICR Code</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bankDetails.map((detail, index) => (
          <TableRow key={index}>
            <TableCell>{detail.accountType}</TableCell>
            <TableCell>{detail.accountNumber}</TableCell>
            <TableCell>{detail.bankBranch}</TableCell>
            <TableCell>{detail.ifscCode}</TableCell>
            <TableCell>{detail.micrCode}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default DebCustBankAddinList;
