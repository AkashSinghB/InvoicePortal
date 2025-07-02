import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import DebtorCreditorForm from "@/components/forms/DebtorCreditorForm";
import BankDetailsForm from "@/components/forms/BankDetailsForm";
import DebCustBankAddinList from "@/components/DebCustBankAddinList";
import { fetchLedgerDetails } from "./helper/mastersApiCall";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;
const API_TOKEN = import.meta.env.VITE_API_TOKEN;

// Define BankDetail type.
interface BankDetail {
  accountType: string;
  accountNumber: string;
  accountHolderName: string;
  bankBranch: string;
  bankName: string;
  ifscCode: string;
  micrCode: string;
}

// ----- Zod Schema using Discriminated Union ------

// Common fields for all variants.
const commonSchema = {
  CompanyName: z
    .string()
    .min(2, "Company Name must be at least 2 characters")
    .max(50, "Company Name cannot exceed 50 characters"),
  // SubHead acts as the discriminator.
  SubHead: z.string(),
  BankDetails: z.boolean().optional(),
};

// Party detail fields (for Debtors and Creditors).
const partyDetailsSchema = {
  AddressLine1: z.string().min(1, "Address Line 1 is required"),
  AddressLine2: z.string().optional(),
  CityPid: z.string().min(1, "City is required"),
  StatePid: z.string().min(1, "State is required"),
  PostalCode: z
    .string()
    .regex(/^\d{6}$/, "Postal Code must be exactly 6 digits"),
  Country: z.string().min(1, "Country is required"),
  PhoneNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Phone number must be 10 digits"),
  Email: z.string().email("Invalid email address"),
  RegistrationType: z.string().min(1, "Registration Type is required"),
  // GSTNumber: z
  //   .preprocess(
  //     (val) => (typeof val === "string" ? val.toUpperCase() : val),
  //     z
  //       .string()
  //       .max(15, "GST Number must be 15 characters")
  //       .refine(
  //         (val) =>
  //           /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
  //             val
  //           ),
  //         "Invalid GST number"
  //       )
  //   )
  //   .optional(),
  // PANNumber: z
  //   .preprocess(
  //     (val) => (typeof val === "string" ? val.toUpperCase() : val),
  //     z
  //       .string()
  //       .max(10, "PAN Number must be 10 characters")
  //       .refine(
  //         (val) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val),
  //         "Invalid PAN number"
  //       )
  //   )
  //   .optional(),
  GSTNumber: z.string().optional(),
  PANNumber: z.string().optional(),
  AccountType: z.string().optional(),
  AccountNumber: z.string().optional(),
  AccountHolderName: z.string().optional(),
  BankName: z.string().optional(),
  BankBranch: z.string().optional(),
  IFSCCode: z.string().optional(),
  MICRCode: z.string().optional(),
};

// Bank detail fields (for Bank).
const bankDetailsSchema = {
  AccountType: z.string().min(1, "Account Type is required"),
  AccountNumber: z.string().min(1, "Account Number is required"),
  AccountHolderName: z.string().min(1, "Account Holder Name is required"),
  BankName: z.string().min(1, "Bank Name is required"),
  BankBranch: z.string().min(1, "Bank Branch is required"),
  IFSCCode: z.string().min(1, "IFSC Code is required"),
  MICRCode: z.string().optional(),
};

// Define the party variant for Debtors and Creditors.
const partyVariant = z
  .object({
    ...commonSchema,
    SubHead: z.enum(["Debtors", "Creditors"]),
  })
  .merge(z.object(partyDetailsSchema));
//.merge(z.object(bankDetailsSchema));

// Define the bank variant.
const bankVariant = z
  .object({
    ...commonSchema,
    SubHead: z.literal("Bank"),
  })
  .merge(z.object(bankDetailsSchema));

// Final discriminated union.
const formSchema = z.discriminatedUnion("SubHead", [partyVariant, bankVariant]);

// ----- End Zod Schema ------

const LedgerMaster: React.FC = () => {
  const [selectedSubhead, setSelectedSubhead] = useState("");
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [bankDetails, setBankDetails] = useState<BankDetail[]>([]);
  const [ledgerDetails, setLedgerDetails] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Initialize the form using the unified schema.
  const methods = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      CompanyName: "",
      SubHead: undefined, // Set to undefined or a valid default value like "Debtors", "Creditors", or "Bank"
      BankDetails: false,
      // Party details
      AddressLine1: "",
      AddressLine2: "",
      CityPid: "",
      StatePid: "",
      PostalCode: "",
      Country: "India",
      PhoneNumber: "",
      Email: "",
      RegistrationType: "",
      GSTNumber: "",
      PANNumber: "",
      // Bank details
      AccountType: "",
      AccountNumber: "",
      AccountHolderName: "",
      BankName: "",
      BankBranch: "",
      IFSCCode: "",
      MICRCode: "",
    },
    //reValidateMode: "onBlur",
  });

  // Get pid & action parameter from URL query
  const searchParams = new URLSearchParams(window.location.search);
  const pid = searchParams.get("pid") || "0";
  const action = (searchParams.get("action") || "").toLowerCase();
  const isView = action === "view";

  if (!pid) {
    console.error("pid not found in the URL");
    return null;
  }

  // Load ledger details and set form fields accordingly.
  useEffect(() => {
    async function loadLedgerDetails() {
      const details = await fetchLedgerDetails(pid);
      if (details) {
        setLedgerDetails(details);
        if (details.table3 && details.table3.length > 0) {
          const partyDetails = details.table3[0];
          setSelectedSubhead(partyDetails.accountTypeName);
          setShowBankDetails(partyDetails.isBankDtl);

          if (
            partyDetails.accountTypeName === "Creditors" ||
            partyDetails.accountTypeName === "Debtors"
          ) {
            methods.reset({
              CompanyName: partyDetails.ledgerName || "",
              SubHead: partyDetails.accountTypeName || "",
              BankDetails: partyDetails.isBankDtl || false,
              // For party variant fields:
              AddressLine1: partyDetails.addressLine1 || "",
              AddressLine2: partyDetails.addressLine2 || "",
              CityPid: partyDetails.cityPid || "",
              StatePid: partyDetails.statePid || "",
              PostalCode: partyDetails.postalCode || "",
              Country: partyDetails.country || "",
              PhoneNumber: partyDetails.phoneNumber || "",
              Email: partyDetails.email || "",
              RegistrationType: partyDetails.registrationType || "",
              GSTNumber: partyDetails.gstNumber || "",
              PANNumber: partyDetails.panNumber || "",
              // For bank variant fields (empty for party variant)
              // AccountType: partyDetails.accountType || "",
              // AccountNumber: partyDetails.accountNumber || "",
              // AccountHolderName: partyDetails.accountHolderName || "",
              // BankName: partyDetails.bankName || "",
              // BankBranch: partyDetails.bankBranch || "",
              // IFSCCode: partyDetails.ifscCode || "",
              // MICRCode: partyDetails.micrCode || "",
            });
          }
        }
        // Map bank details from table4.
        if (details.table4 && details.table4.length > 0) {
          if (details.table3[0].accountTypeName === "Bank") {
            methods.reset({
              CompanyName: details.table3[0].ledgerName || "",
              SubHead: details.table3[0].accountTypeName || "",
              AccountType: details.table4[0].accountType || "",
              AccountNumber: details.table4[0].accountNumber || "",
              AccountHolderName: details.table4[0].accHolderName || "",
              BankName: details.table4[0].bankName || "",
              BankBranch: details.table4[0].bankBranch || "",
              IFSCCode: details.table4[0].ifscCode || "",
              MICRCode: details.table4[0].micrCode || "",
            });
          } else {
            const mappedBankDetails = details.table4.map((item: any) => ({
              accountType: item.accountType || "",
              accountNumber: item.accountNumber || "",
              accountHolderName: item.accHolderName || "",
              bankBranch: item.bankBranch || "",
              bankName: item.bankName || "",
              ifscCode: item.ifscCode || "",
              micrCode: item.micrCode || "",
            }));
            setBankDetails(mappedBankDetails);
          }
        }
      }
    }
    loadLedgerDetails();
  }, [pid, methods]);

  // Submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("values", values);
    return;
    if (values.BankDetails && bankDetails.length === 0) {
      methods.setError("BankDetails", {
        message:
          "At least one bank detail row must be added when Bank Details is Yes.",
      });
      return;
    }

    let payload: any = {};
    if (values.SubHead === "Debtors" || values.SubHead === "Creditors") {
      if (values.RegistrationType.trim().toLowerCase() === "regular") {
        let valid = true;
        if (!values.GSTNumber || values.GSTNumber.trim() === "") {
          methods.setError("GSTNumber", {
            message: "GST Number is required for Regular registration",
          });
          valid = false;
        }
        if (!values.PANNumber || values.PANNumber.trim() === "") {
          methods.setError("PANNumber", {
            message: "PAN Number is required for Regular registration",
          });
          valid = false;
        }
        if (!valid) {
          return; // stop form submission if validation fails
        }
      }
      const {
        AddressLine1,
        AddressLine2,
        CityPid,
        StatePid,
        PostalCode,
        Country,
        PhoneNumber,
        Email,
        RegistrationType,
        GSTNumber,
        PANNumber,
      } = values;

      payload = {
        CompanyName: values.CompanyName,
        SubHead: values.SubHead,
        PartyDetails: {
          AddressLine1,
          AddressLine2,
          CityPid,
          StatePid,
          PostalCode,
          Country,
          PhoneNumber,
          Email,
          RegistrationType,
          GSTNumber,
          PANNumber,
          BankDetails: values.BankDetails,
        },
        BankDetailsList: bankDetails,
      };
    } else if (values.SubHead === "Bank") {
      // For bank, send only bank-specific details.
      const {
        AccountType,
        AccountNumber,
        AccountHolderName,
        BankName,
        BankBranch,
        IFSCCode,
        MICRCode,
      } = values;
      //addBankDetails();
      const newBankDetail: BankDetail = {
        accountType: AccountType,
        accountNumber: AccountNumber,
        accountHolderName: AccountHolderName,
        bankName: BankName,
        bankBranch: BankBranch,
        ifscCode: IFSCCode,
        micrCode: MICRCode || "",
      };
      payload = {
        CompanyName: values.CompanyName,
        SubHead: values.SubHead,
        PartyDetails: null,
        BankDetailsList: [newBankDetail],
      };
    }

    const isAdd = action === "add";
    const endpoint = isAdd ? "api/ledger/create" : "api/ledger/update/" + pid;
    const methodType = isAdd ? "POST" : "PUT";
    console.log("payload", payload);
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
      const msg = isAdd
        ? "Record saved successfully"
        : "Record updated successfully";
      toast({
        title: msg,
      });
      navigate("/base/basemaster?mod=LedgerMast");
      console.log("API response:", data);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error submitting Ledger:",
        description: String(error),
      });
    }
  }

  // Function to add a bank detail row (for non-bank variants).
  const addBankDetails = () => {
    const values = methods.getValues();
    const newBankDetail: BankDetail = {
      accountType: values.AccountType || "",
      accountNumber: values.AccountNumber || "",
      accountHolderName: values.AccountHolderName || "",
      bankName: values.BankName || "",
      bankBranch: values.BankBranch || "",
      ifscCode: values.IFSCCode || "",
      micrCode: values.MICRCode || "",
    };

    setBankDetails([...bankDetails, newBankDetail]);

    // Clear bank detail fields.
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
    methods.setValue("AccountType", detail.accountType);
    methods.setValue("AccountNumber", detail.accountNumber);
    methods.setValue("BankName", detail.bankName);
    methods.setValue("BankBranch", detail.bankBranch);
    methods.setValue("IFSCCode", detail.ifscCode);
    methods.setValue("MICRCode", detail.micrCode);
    methods.setValue("AccountHolderName", detail.accountHolderName);
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
                    <Input
                      placeholder="ex. akash corporation"
                      {...field}
                      disabled={isView}
                    />
                  </FormControl>
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
                      <SelectTrigger disabled={isView}>
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
              <DebtorCreditorForm
                isView={isView}
                ledgerDetails={ledgerDetails}
              />
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
            {action === "add" ? "Submit" : "Update"}
          </Button>
        </form>
      </FormProvider>
    </div>
  );
};

export default LedgerMaster;
