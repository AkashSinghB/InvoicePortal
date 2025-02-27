import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useState } from "react";
import DebCustBankAddinList from "@/components/DebCustBankAddinList";
import DebtorCreditorForm from "@/components/forms/DebtorCreditorForm";
import BankDetailsForm from "@/components/forms/BankDetailsForm";

// Define a type for bank details.
interface BankDetail {
  accountType: string;
  accountNumber: string;
  bankBranch: string;
  ifscCode: string;
  micrCode: string;
}

const formSchema = z.object({
  CompanyName: z
    .string()
    .min(2, {
      message: "Company Name must be at least 2 characters.",
    })
    .max(50),
  SubHead: z.string(),
  // Bank detail fields (managed separately via addBankDetails)
  BankDetails: z.string(),
  AccountType: z.string(),
  AccountNumber: z.string(),
  BankBranch: z.string(),
  IFSCCode: z.string(),
  MICRCode: z.string(),

  // DebtorCreditorForm fields
  AddressLine1: z.string(),
  AddressLine2: z.string().optional(),
  City: z.string(),
  State: z.string(),
  PostalCode: z.string(),
  Country: z.string(),
  PhoneNumber: z.string(),
  Email: z.string().email(),
  RegistrationType: z.string(),
  GSTNumber: z.string().optional(),
  PANNumber: z.string().optional(),
});

const LedgerMaster: React.FC = () => {
  const [selectedSubhead, setSelectedSubhead] = useState("");
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [bankDetails, setBankDetails] = useState<BankDetail[]>([]);
  // 1. Define your form.
  const methods = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      CompanyName: "",
      SubHead: "",
      BankDetails: "No",
      AccountType: "",
      AccountNumber: "",
      BankBranch: "",
      IFSCCode: "",
      MICRCode: "",
      AddressLine1: "",
      AddressLine2: "",
      City: "",
      State: "",
      PostalCode: "",
      Country: "",
      PhoneNumber: "",
      Email: "",
      RegistrationType: "",
      GSTNumber: "",
      PANNumber: "",
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    if (selectedSubhead === "Debtors" || selectedSubhead === "Creditors") {
      const {
        AccountType,
        AccountNumber,
        BankBranch,
        IFSCCode,
        MICRCode,
        ...rest
      } = values;
      const payload = { ...rest, bankDetails };
      console.log(JSON.stringify(payload, null, 2));
    } else if (selectedSubhead === "Bank") {
      const {
        AddressLine1,
        AddressLine2,
        City,
        State,
        PostalCode,
        Country,
        PhoneNumber,
        Email,
        RegistrationType,
        GSTNumber,
        PANNumber,
        ...rest
      } = values;
      const payload = { ...rest };
      console.log(JSON.stringify(payload, null, 2));
    }
    //console.log("Hello");
  }

  const addBankDetails = () => {
    const values = methods.getValues() as z.infer<typeof formSchema>;

    // Create a BankDetail object with fallback values for optional fields.
    const newBankDetail: BankDetail = {
      accountType: values.AccountType || "",
      accountNumber: values.AccountNumber || "",
      bankBranch: values.BankBranch || "",
      ifscCode: values.IFSCCode || "",
      micrCode: values.MICRCode || "",
    };

    setBankDetails([...bankDetails, newBankDetail]);

    // Clear the bank details fields after adding.
    methods.setValue("AccountType", "");
    methods.setValue("AccountNumber", "");
    methods.setValue("BankBranch", "");
    methods.setValue("IFSCCode", "");
    methods.setValue("MICRCode", "");
  };

  const handleEditBankDetail = (index: number) => {
    const detail = bankDetails[index];
    // Load record into the form for editing.
    methods.setValue("AccountType", detail.accountType);
    methods.setValue("AccountNumber", detail.accountNumber);
    methods.setValue("BankBranch", detail.bankBranch);
    methods.setValue("IFSCCode", detail.ifscCode);
    methods.setValue("MICRCode", detail.micrCode);
    // Optionally, remove the record from the list so that updating it will re-add it.
    //setBankDetails(bankDetails.filter((_, i) => i !== index));
  };

  const handleDeleteBankDetail = (index: number) => {
    setBankDetails(bankDetails.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full">
      <h1 className="text-center">Ledger Master</h1>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex gap-8 w-1/2 pr-5 ">
            <FormField
              control={methods.control}
              name="CompanyName"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Ledger Name</FormLabel>
                  <FormControl>
                    <Input placeholder="ex. akash corporation" {...field} />
                  </FormControl>
                  {/* <FormDescription>
                  This is your public display name.
                </FormDescription> */}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={methods.control}
              name="SubHead"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Subhead</FormLabel>
                  <Select
                    // onValueChange={field.onChange}
                    // defaultValue={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedSubhead(value);
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subhead type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Debtors">Debtors</SelectItem>
                      <SelectItem value="Creditors">Creditors</SelectItem>
                      <SelectItem value="Bank">Bank</SelectItem>
                      <SelectItem value="Fixed Assets">Fixed Assets</SelectItem>
                      <SelectItem value="Current Assets">
                        Current Assets
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {(selectedSubhead === "Debtors" ||
            selectedSubhead === "Creditors") && (
            <>
              <DebtorCreditorForm />
              <div className="flex gap-5 w-1/4">
                <FormField
                  control={methods.control}
                  name="BankDetails"
                  render={({ field }) => (
                    <FormItem className="w-1/2 pr-4">
                      <FormLabel>Bank Details</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setShowBankDetails(value === "Yes");
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="--Select--" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </>
          )}
          {(showBankDetails || selectedSubhead === "Bank") && (
            <BankDetailsForm />
          )}

          {showBankDetails &&
            (selectedSubhead === "Debtors" ||
              selectedSubhead === "Creditors") && (
              <>
                <Button type="button" onClick={addBankDetails}>
                  Add Bank Details
                </Button>
                <DebCustBankAddinList
                  bankDetails={bankDetails}
                  onEdit={handleEditBankDetail}
                  onDelete={handleDeleteBankDetail}
                />
              </>
            )}
          <Button type="submit">Submit</Button>
        </form>
      </FormProvider>
    </div>
  );
};

export default LedgerMaster;
