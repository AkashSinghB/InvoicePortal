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
import { MdDeleteForever } from "react-icons/md";
import { TbEdit } from "react-icons/tb";

interface BankDetail {
  accountType: string;
  accountNumber: string;
  bankBranch: string;
  ifscCode: string;
  micrCode: string;
}

interface CustomerBankDetailsTableProps {
  bankDetails: BankDetail[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

const DebCustBankAddinList: React.FC<CustomerBankDetailsTableProps> = ({
  bankDetails,
  onEdit,
  onDelete,
}) => {
  return (
    <Table>
      <TableCaption>A list of bank details.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Edit</TableHead>
          <TableHead>Del</TableHead>
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
            <TableCell>
              <TbEdit
                className="text-2xl cursor-pointer text-blue-500"
                onClick={() => onEdit(index)}
                type="button"
              />
            </TableCell>
            <TableCell>
              <MdDeleteForever
                className="text-2xl cursor-pointer text-red-500"
                onClick={() => onDelete(index)}
                type="button"
              />
            </TableCell>
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
