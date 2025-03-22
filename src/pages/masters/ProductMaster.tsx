import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

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
import { cn } from "@/lib/utils";
import { fetchProductDetails } from "./helper/mastersApiCall";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;
const API_TOKEN = import.meta.env.VITE_API_TOKEN;

const formSchema = z.object({
  ProductName: z
    .string()
    .min(2, { message: "Product Name must be at least 2 characters." })
    .max(255),
  HSNCode: z.string().max(20),
  ProductDescription: z.string(),
  UnitPrice: z.coerce.number().positive(),
  OpeningUnits: z.coerce.number().positive(),
  OpeningBalance: z.coerce.number().positive(),
  IsActive: z.boolean(),
});

const ProductMaster: React.FC = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const pid = searchParams.get("pid") || "0";
  const action = searchParams.get("action") || "";
  const isView = action.toLowerCase() === "view";
  const { toast } = useToast();
  const navigate = useNavigate();
  const [hsnOptions, setHsnOptions] = useState<
    { label: string; value: string }[]
  >([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ProductName: "",
      HSNCode: "",
      ProductDescription: "",
      UnitPrice: 0,
      OpeningUnits: 0,
      OpeningBalance: 0,
      IsActive: false,
    },
  });
  // Read pid and action from the URL query string

  useEffect(() => {
    fetchProductDetails(pid).then((data) => {
      if (data.table) {
        const options = data.table.map((item: any) => ({
          label: item.c1,
          value: item.c2,
        }));
        setHsnOptions(options);
      }
      if (data.table1[0]) {
        const prodData = data.table1[0];
        form.reset({
          ProductName: prodData.productName || "",
          HSNCode: prodData.hsnCode || "",
          ProductDescription: prodData.productDescription || "",
          UnitPrice: Number(prodData.unitPrice) || 0,
          OpeningUnits: Number(prodData.openingUnits) || 0,
          OpeningBalance: Number(prodData.openingBalance) || 0,
          IsActive: prodData.isActive || false,
        });
      }
    });
  }, [pid, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const isAdd = action.toLowerCase() === "add";
    const endpoint = isAdd ? "api/product/create" : `api/product/update/${pid}`;
    const methodType = isAdd ? "POST" : "PUT";
    const payload = { ...values };

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
        // description: msg,
        // action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
      navigate("/base/basemaster?mod=ProdMast");
      console.log("API response:", data.result);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error submitting Product:",
        description: String(error),
      });
    }
  }

  return (
    <div className="w-full">
      <h1 className="text-center">Product Master</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex gap-8 w-1/2 pr-5">
            <FormField
              control={form.control}
              name="ProductName"
              render={({ field }) => (
                <FormItem className="w-full flex flex-col">
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter Product Name"
                      {...field}
                      disabled={isView}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="HSNCode"
              render={({ field }) => (
                <FormItem className="w-full flex flex-col">
                  <FormLabel>HSN Code</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-[200px] justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={isView}
                        >
                          {field.value
                            ? hsnOptions.find(
                                (option) => option.value === field.value
                              )?.label
                            : "Select HSN Code"}
                          <ChevronsUpDown className="opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search HSN Code..."
                          className="h-9"
                          disabled={isView}
                        />
                        <CommandList>
                          <CommandEmpty>No HSN Code found.</CommandEmpty>
                          <CommandGroup>
                            {hsnOptions.map((option) => (
                              <CommandItem
                                value={option.label}
                                key={option.value}
                                onSelect={() => {
                                  form.setValue("HSNCode", option.value);
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
          </div>
          <div className="flex gap-8 w-full">
            <FormField
              control={form.control}
              name="ProductDescription"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Product Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter Product Description"
                      {...field}
                      disabled={isView}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex gap-8 w/full">
            <FormField
              control={form.control}
              name="UnitPrice"
              render={({ field }) => (
                <FormItem className="w-40">
                  <FormLabel>Unit Price</FormLabel>
                  <FormControl>
                    <Input
                      step="1.00"
                      placeholder="Enter Unit Price"
                      {...field}
                      disabled={isView}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="OpeningUnits"
              render={({ field }) => (
                <FormItem className="w-40">
                  <FormLabel>Opening Units</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Enter Opening Units"
                      {...field}
                      disabled={isView}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="OpeningBalance"
              render={({ field }) => (
                <FormItem className="w-40">
                  <FormLabel>Opening Balance</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Enter Opening Balance"
                      {...field}
                      disabled={isView}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="IsActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormLabel>Active</FormLabel>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isView}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isView}>
            {action.toLowerCase() === "add" ? "Submit" : "Update"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ProductMaster;
