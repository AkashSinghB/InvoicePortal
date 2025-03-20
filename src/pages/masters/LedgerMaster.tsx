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
import React, { useState, useEffect } from "react";
import DebCustBankAddinList from "@/components/DebCustBankAddinList";
import DebtorCreditorForm from "@/components/forms/DebtorCreditorForm";
import BankDetailsForm from "@/components/forms/BankDetailsForm";
import { fetchLedgerDetails } from "./helper/mastersApiCall";
const API_URL = import.meta.env.VITE_API_URL;
const API_TOKEN = import.meta.env.VITE_API_TOKEN;
// Define a type for bank details.
interface BankDetail {
  accountType: string;
  accountNumber: string;
  accountHolderName: string;
  bankBranch: string;
  bankName: string;
  ifscCode: string;
  micrCode: string;
}

const formSchema = z.object({
  CompanyName: z.string().min(2).max(50),
  SubHead: z.string(),
  BankDetails: z.boolean(),
  AddressLine1: z.string(),
  AddressLine2: z.string().optional(),
  City: z.string(),
  State: z.string(),
  PostalCode: z.string(),
  Country: z.string(),
  PhoneNumber: z.string(),
  Email: z.string(),
  RegistrationType: z.string(),
  GSTNumber: z.string().optional(),
  PANNumber: z.string().optional(),
  AccountType: z.string().optional(),
  AccountNumber: z.string().optional(),
  AccountHolderName: z.string().optional(),
  BankName: z.string().optional(),
  BankBranch: z.string().optional(),
  IFSCCode: z.string().optional(),
  MICRCode: z.string().optional(),
});

const LedgerMaster: React.FC = () => {
  const [selectedSubhead, setSelectedSubhead] = useState("");
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [bankDetails, setBankDetails] = useState<BankDetail[]>([]);
  // State to hold ledger details fetched on page load.
  const [ledgerDetails, setLedgerDetails] = useState<any>(null);
  // 1. Define your form.
  const methods = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      CompanyName: "",
      SubHead: "",
      BankDetails: false,
      AccountType: "",
      AccountNumber: "",
      AccountHolderName: "",
      BankName: "",
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
  // Get the pid from URL query parameters
  const searchParams = new URLSearchParams(window.location.search);
  let pid = searchParams.get("pid") || "0";
  let action = searchParams.get("action") || "";

  if (!pid) {
    console.error("pid not found in the URL");
    return null;
  }

  useEffect(() => {
    async function loadLedgerDetails() {
      const details = await fetchLedgerDetails(pid as string);
      if (details) {
        setLedgerDetails(details);

        if (details.table1 && details.table1.length > 0) {
          const partyDetails = details.table1[0];
          //console.log("Ledger details:", partyDetails);
          setSelectedSubhead(partyDetails.accountTypeName);
          setShowBankDetails(partyDetails.isBankDtl);
          //console.log(showBankDetails);
          methods.reset({
            // ...methods.getValues(),
            // Map ledgerName to CompanyName
            CompanyName: partyDetails.ledgerName || "",
            SubHead: partyDetails.accountTypeName || "",
            BankDetails: partyDetails.isBankDtl || false,
            // Map party detail fields
            AddressLine1: partyDetails.addressLine1 || "",
            AddressLine2: partyDetails.addressLine2 || "",
            City: partyDetails.city || "",
            State: partyDetails.state || "",
            PostalCode: partyDetails.postalCode || "",
            Country: partyDetails.country || "",
            PhoneNumber: partyDetails.phoneNumber || "",
            Email: partyDetails.email || "",
            RegistrationType: partyDetails.registrationType || "",
            GSTNumber: partyDetails.gstNumber || "",
            PANNumber: partyDetails.panNumber || "",

            // Other form fields can be retained or mapped similarly
            AccountType: "",
            AccountNumber: "",
            AccountHolderName: "",
            BankName: "",
            BankBranch: "",
            IFSCCode: "",
            MICRCode: "",
          });
        }
        // Map bank details from table2 to BankDetail interface.
        if (details.table2 && details.table2.length > 0) {
          const mappedBankDetails = details.table2.map((item: any) => ({
            accountType: item.accountType || "",
            accountNumber: item.accountNumber || "",
            accountHolderName: item.accountHolderName || "",
            bankBranch: item.bankBranch || "",
            bankName: item.bankName || "",
            ifscCode: item.ifscCode || "",
            micrCode: item.micrCode || "",
          }));
          setBankDetails(mappedBankDetails);
        }
      }
    }
    loadLedgerDetails();
  }, [pid, methods]);

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Extra check: if BankDetails is true, ensure that at least one bank detail row is added.
    if (values.BankDetails && bankDetails.length === 0) {
      // You can set a form error to stop submission.
      methods.setError("BankDetails", {
        message:
          "At least one bank detail row must be added when Bank Details is Yes.",
      });
      return;
    }

    //console.log("BankDetails:", methods.getValues("BankDetails"));
    let payload: any = {};
    if (selectedSubhead === "Debtors" || selectedSubhead === "Creditors") {
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
      payload = {
        CompanyName: values.CompanyName,
        SubHead: values.SubHead,
        PartyDetails: {
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
          BankDetails: values.BankDetails,
        },
        bankDetailsList: bankDetails,
      };
    } else if (selectedSubhead === "Bank") {
      // Exclude party details fields for Bank
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
      payload = { ...rest };
    }

    // Determine API endpoint and method based on action.
    // Assume action "add" is for creation and any other value (e.g., "update") for the update.
    const isAdd = action.toLowerCase() === "add";
    const endpoint = isAdd ? "api/ledger/create" : "api/ledger/update/" + pid;
    const methodType = isAdd ? "POST" : "PUT";

    try {
      const response = await fetch(API_URL + endpoint, {
        method: methodType,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_TOKEN}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("API response:", data);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  }
  const addBankDetails = () => {
    const values = methods.getValues() as z.infer<typeof formSchema>;

    // Create a BankDetail object with fallback values for optional fields.
    const newBankDetail: BankDetail = {
      accountType: values.AccountType || "",
      accountNumber: values.AccountNumber || "",
      bankName: values.BankName || "",
      bankBranch: values.BankBranch || "",
      ifscCode: values.IFSCCode || "",
      micrCode: values.MICRCode || "",
      accountHolderName: values.AccountHolderName || "",
    };

    setBankDetails([...bankDetails, newBankDetail]);

    // Clear the bank details fields after adding.
    methods.setValue("AccountType", "");
    methods.setValue("AccountNumber", "");
    methods.setValue("AccountHolderName", "");
    methods.setValue("BankName", "");
    methods.setValue("BankBranch", "");
    methods.setValue("IFSCCode", "");
    methods.setValue("MICRCode", "");
  };

  const handleEditBankDetail = (index: number) => {
    const detail = bankDetails[index];
    // Load record into the form for editing.
    methods.setValue("AccountType", detail.accountType);
    methods.setValue("AccountNumber", detail.accountNumber);
    methods.setValue("BankName", detail.bankName);
    methods.setValue("BankBranch", detail.bankBranch);
    methods.setValue("IFSCCode", detail.ifscCode);
    methods.setValue("MICRCode", detail.micrCode);
    methods.setValue("AccountHolderName", detail.accountHolderName);
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
                    key={ledgerDetails ? "loaded" : "loading"}
                    value={field.value || ""}
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
                      {ledgerDetails && ledgerDetails.table
                        ? ledgerDetails.table.map(
                            (item: {
                              pid: number;
                              accountTypeName: string;
                            }) => (
                              <SelectItem
                                key={item.pid}
                                value={item.accountTypeName}
                              >
                                {item.accountTypeName}
                              </SelectItem>
                            )
                          )
                        : null}
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
                        value={field.value ? "true" : "false"}
                        onValueChange={(value) => {
                          field.onChange(value === "true");
                          setShowBankDetails(value === "true");
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="--Select--" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="true">Yes</SelectItem>
                          <SelectItem value="false">No</SelectItem>
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
          <Button type="submit">
            {action.toLowerCase() === "add" ? "Submit" : "Update"}
          </Button>
        </form>
      </FormProvider>
    </div>
  );
};

export default LedgerMaster;
