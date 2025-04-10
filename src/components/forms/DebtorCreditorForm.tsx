import React, { useEffect, useState } from "react";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DebtorCreditorFormProps {
  isView?: boolean;
  ledgerDetails?: {
    table?: any[];
    table1?: { pid: number; stateName: string }[];
    table2?: { pid: number; cityName: string; statePid: number }[];
  };
}

const DebtorCreditorForm: React.FC<DebtorCreditorFormProps> = ({
  isView,
  ledgerDetails,
}) => {
  const { control, setValue, getValues } = useFormContext();

  const [stateName, setStateName] = useState<
    { id: number; label: string; value: string }[]
  >([]);
  const [cityName, setCityName] = useState<{ label: string; value: string }[]>(
    []
  );

  useEffect(() => {
    if (ledgerDetails?.table1) {
      // Map over ledgerDetails.table1 data to populate options
      const options = ledgerDetails.table1.map((item) => ({
        id: item.pid,
        label: item.stateName,
        value: item.stateName,
      }));
      setStateName(options);
    }

    // const currentState = getValues("State");
    // if (currentState && stateName.length > 0) {
    //   const selected = stateName.find((opt) => opt.value === currentState);
    //   if (selected) {
    //     updateCityOptions(selected.id);
    //     //setValue("City", "");
    //   }
    // }
  }, [ledgerDetails]);
  // Update city dropdown options based on selected state's id.
  function updateCityOptions(selectedStatePid: number) {
    if (ledgerDetails?.table2) {
      const filteredCities = ledgerDetails.table2
        .filter((city) => city.statePid === selectedStatePid)
        .map((city) => ({
          label: city.cityName,
          value: city.cityName,
        }));
      setCityName(filteredCities);
    }
  }

  useEffect(() => {
    const currentState = getValues("State");
    if (currentState && stateName.length > 0) {
      const selected = stateName.find((opt) => opt.value === currentState);
      if (selected) {
        updateCityOptions(selected.id);
        //setValue("City", "");
      }
    }
  }, [ledgerDetails, stateName, getValues, setValue]);
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
        {/* <FormField
          control={control}
          name="State"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>State</FormLabel>
              <Select
                value={field.value || ""}
                onValueChange={(value) => {
                  field.onChange(value);
                }}
                disabled={isView}
              >
                <FormControl>
                  <SelectTrigger disabled={isView}>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ledgerDetails && ledgerDetails.table1
                    ? ledgerDetails.table1.map(
                        (item: { pid: number; stateName: string }) => (
                          <SelectItem key={item.pid} value={item.stateName}>
                            {item.stateName}
                          </SelectItem>
                        )
                      )
                    : null}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        /> */}
        <FormField
          control={control}
          name="State"
          render={({ field }) => (
            <FormItem className="w-full flex flex-col justify-end gap-1">
              <FormLabel>State</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                      disabled={isView}
                    >
                      {field.value
                        ? stateName.find(
                            (option) => option.value === field.value
                          )?.label
                        : "Select State"}
                      <ChevronsUpDown className="opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search State..."
                      className="h-9"
                      disabled={isView}
                    />
                    <CommandList>
                      <CommandEmpty>No State found.</CommandEmpty>
                      <CommandGroup>
                        {stateName.map((option) => (
                          <CommandItem
                            value={option.label}
                            key={option.value}
                            onSelect={() => {
                              field.onChange(option.value);
                              updateCityOptions(option.id);
                              setValue("City", "");
                            }}
                            disabled={isView}
                          >
                            {option.label}
                            <Check
                              className={cn(
                                "ml-auto",
                                option.value === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="City"
          render={({ field }) => (
            <FormItem className="w-full flex flex-col justify-end gap-1">
              <FormLabel>City</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                      disabled={isView}
                    >
                      {field.value
                        ? cityName.find(
                            (option) => option.value === field.value
                          )?.label
                        : "Select City"}
                      <ChevronsUpDown className="opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search City..."
                      className="h-9"
                      disabled={isView}
                    />
                    <CommandList>
                      <CommandEmpty>No City found.</CommandEmpty>
                      <CommandGroup>
                        {cityName.map((option) => (
                          <CommandItem
                            value={option.label}
                            key={option.value}
                            onSelect={() => {
                              field.onChange(option.value);
                            }}
                            disabled={isView}
                          >
                            {option.label}
                            <Check
                              className={cn(
                                "ml-auto",
                                option.value === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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
                <Input
                  placeholder="Enter Postal Code"
                  {...field}
                  maxLength={6}
                />
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
                <Input
                  placeholder="Enter Country"
                  defaultValue="India"
                  {...field}
                />
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
                  <Input
                    placeholder="Enter Phone Number"
                    {...field}
                    maxLength={10}
                  />
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
                  <Input placeholder="Enter Email" {...field} maxLength={100} />
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
                  value={field.value || ""}
                  onValueChange={(value) => field.onChange(value)}
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
                  <Input
                    className="uppercase"
                    placeholder="Enter GST Number"
                    {...field}
                    maxLength={15}
                  />
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
                  <Input
                    className="uppercase"
                    placeholder="Enter PAN Number"
                    {...field}
                    maxLength={10}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default DebtorCreditorForm;
