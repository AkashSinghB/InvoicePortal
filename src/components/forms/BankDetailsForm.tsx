import React from "react";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormLabel,
  FormMessage,
  FormItem,
  FormField,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const BankDetails: React.FC = () => {
  const { control } = useFormContext();

  return (
    <div id="CustomerBankDtl" className="flex gap-3 w-full flex-col ">
      <div className="flex gap-8 w-full">
        <div className="flex gap-8 w-full">
          <FormField
            control={control}
            name="AccountType"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Account Type</FormLabel>
                <Select
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  // onValueChange={(value) => {
                  //   field.onChange(value);
                  //   setSelectedSubhead(value);
                  // }}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Account Type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Savings">Savings</SelectItem>
                    <SelectItem value="Current">Current</SelectItem>
                    <SelectItem value="Fixed deposit">Fixed deposit</SelectItem>
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
            control={control}
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
        <div className="flex gap-8 w-full">
          <FormField
            control={control}
            name="AccountNumber"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Account Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Account Number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="AccountHolderName"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Account Holder Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Account Holder Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
      <div className="flex gap-8 w-1/2 pr-4">
        <FormField
          control={control}
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
          control={control}
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
        <FormField
          control={control}
          name="BankName"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Bank Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter Bank Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default BankDetails;
