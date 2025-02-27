import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

const DebtorCreditorForm: React.FC = () => {
  const { control } = useFormContext();

  return (
    <div id="CustomerDtl" className="flex gap-3 w-full flex-col">
      <div className="flex gap-8 w-full">
        <FormField
          control={control}
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
          control={control}
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
          control={control}
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
          control={control}
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
          control={control}
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
          control={control}
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
            control={control}
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
            control={control}
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
            control={control}
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
                    <SelectItem value="Unregistered">Unregistered</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
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
            control={control}
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
      {/* <div className="flex gap-5 w-1/4">
        <FormField
          control={control}
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
      </div> */}
    </div>
  );
};

export default DebtorCreditorForm;
