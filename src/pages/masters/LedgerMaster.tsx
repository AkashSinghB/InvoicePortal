import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useState } from "react";
import DebCustBankAddinList from "@/components/DebCustBankAddinList";


const formSchema = z.object({
  CompanyName: z
    .string()
    .min(2, {
      message: "Company Name must be at least 2 characters.",
    })
    .max(50),
  SubHead: z.string(),
  AccountType: z.string(),
});

const LedgerMaster: React.FC = () => {
  const [selectedSubhead, setSelectedSubhead] = useState("");
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [bankDetails, setBankDetails] = useState<{ accountType: string; accountNumber: string; bankBranch: string; ifscCode: string; micrCode: string; }[]>([]);
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      CompanyName: "",
      SubHead: "",
      AccountType:"",
    },
  });
  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }

  const addBankDetails = () => {
    const values = form.getValues();
    setBankDetails([
      ...bankDetails,
      {
        accountType: values.AccountType,
        accountNumber: values.AccountNumber,
        bankBranch: values.BankBranch,
        ifscCode: values.IFSCCode,
        micrCode: values.MICRCode,
      },
    ]);
  };

  return (
    <div className="w-full">
      <h1 className="text-center">Ledger Master</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex gap-8 w-1/2 pr-5 ">
            <FormField
              control={form.control}
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
              control={form.control}
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
            <div id="CustomerDtl" className="flex gap-3 w-full flex-col">
              <div className="flex gap-8 w-full">
                <FormField
                  control={form.control}
                  name="AddressLine1"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Address Line 1</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter Address Line 1"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="AddressLine2"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Address Line 2</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter Address Line 2"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex gap-8 w-full">
                <FormField
                  control={form.control}
                  name="City"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter City" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="State"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter State" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="PostalCode"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Postal Code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="Country"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex gap-8 w-full">
                <div className="flex gap-8 w-full">
                  <FormField
                    control={form.control}
                    name="PhoneNumber"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter Phone Number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="Email"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter Email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex gap-5 w-full">
                  <FormField
                    control={form.control}
                    name="RegistrationType"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Registration Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          // onValueChange={(value) => {
                          //   field.onChange(value);
                          //   setSelectedSubhead(value);
                          // }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Registration" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Regular">Regular</SelectItem>
                            <SelectItem value="Unregistered">
                              Unregistered
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="GSTNumber"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>GST Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter GST Number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="PANNumber"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>PAN Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter PAN Number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="flex gap-5 w-1/4">
                <FormField
                  control={form.control}
                  name="IsBankDetails"
                  render={({ field }) => (
                    <FormItem className="w-1/2 pr-4">
                      <FormLabel>Bank Details</FormLabel>
                      <Select
                        // onValueChange={field.onChange}
                        // defaultValue={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          setShowBankDetails(value == "Yes");
                        }}
                        defaultValue={"No"}
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
              {showBankDetails && (
                <div
                  id="CustomerBankDtl"
                  className="flex gap-3 w-full flex-col "
                >
                  <div className="flex gap-8 w-full">
                    <div className="flex gap-8 w-full">
                      <FormField
                        control={form.control}
                        name="AccountType"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>Account Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              // onValueChange={(value) => {
                              //   field.onChange(value);
                              //   setSelectedSubhead(value);
                              // }}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select an Account Type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Savings">Savings</SelectItem>
                                <SelectItem value="Current">Current</SelectItem>
                                <SelectItem value="Fixed deposit">
                                  Fixed deposit
                                </SelectItem>
                                <SelectItem value="Recurring deposit">
                                  Recurring deposit
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="AccountNumber"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>Account Number</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter Account Number"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex gap-8 w-full">
                      <FormField
                        control={form.control}
                        name="BankBranch"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>Bank Branch</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter Bank Branch"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <div className="flex gap-8 w-1/2 pr-4">
                    <FormField
                      control={form.control}
                      name="IFSCCode"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>IFSC Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter IFSC Code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="MICRCode"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>MICR Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter MICR Code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                  <DebCustBankAddinList bankDetails={bankDetails}/>
                  </div>
                  <div>
                    <Button type="button" onClick={addBankDetails}>
                      Add Bank Details
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          {selectedSubhead === "Bank" && (
            <div id="BankDtl" className="flex gap-3 w-full flex-col ">
              <div className="flex gap-8 w-full">
                <div className="flex gap-8 w-full">
                  <FormField
                    control={form.control}
                    name="AccountType"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Account Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          // onValueChange={(value) => {
                          //   field.onChange(value);
                          //   setSelectedSubhead(value);
                          // }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an Account Type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Savings">Savings</SelectItem>
                            <SelectItem value="Current">Current</SelectItem>
                            <SelectItem value="Fixed deposit">
                              Fixed deposit
                            </SelectItem>
                            <SelectItem value="Recurring deposit">
                              Recurring deposit
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="AccountNumber"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Account Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter Account Number"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex gap-8 w-full">
                  <FormField
                    control={form.control}
                    name="BankBranch"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Bank Branch</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter Bank Branch" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="flex gap-8 w-1/2 pr-4">
                <FormField
                  control={form.control}
                  name="IFSCCode"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>IFSC Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter IFSC Code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="MICRCode"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>MICR Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter MICR Code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
};

export default LedgerMaster;
