import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormLabel,
  FormMessage,
  FormItem,
  FormField,
} from "@/components/ui/form";
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
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Check, ChevronsUpDown, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { number, z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar } from "@/components/ui/calendar";
import { format, parse } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  createUpdateInvoiceSales,
  fetchInvDetailsForPrint,
  fetchInvoiceDetails,
  fetchPartyDetails,
} from "./helper/TransactionApiCall";
import { Checkbox } from "@/components/ui/checkbox";
import { MdDeleteForever } from "react-icons/md";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const formSchema = z.object({
  PartyName: z.string().max(100),
  InvoiceNo: z.string().max(20),
  InvoiceDate: z.date(),
  // PaymentStatus: z.enum(["Unpaid", "Paid", "Partially Paid", "Not Approved"]),
  PaymentStatus: z.enum(["U", "P", "PP", "NA"]),
  ProductDescription: z.string(),
  UnitPrice: z.coerce.number().positive(),
  OpeningUnits: z.coerce.number().positive(),
  OpeningBalance: z.coerce.number().positive(),
  IsActive: z.boolean(),
});

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  hsnCode?: string;
  taxPerc: number;
}

interface InvoiceItem {
  productId: number;
  description: string;
  quantity: number;
  price: number;
  hsnCode?: string;
  taxPerc: number;
}

interface PartyDetail {
  companyName: string;
  ledgerPid: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  statePid: number;
  postalCode: string;
  registrationType: string;
  gstNumber: string;
}

const InvoiceGenerator: React.FC = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const pid = searchParams.get("pid") || "0";
  const action = searchParams.get("action") || "";
  const isView = action.toLowerCase() === "view";
  const { toast } = useToast();
  const navigate = useNavigate();

  const [party, setParty] = useState<{ label: string; value: string }[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedParty, setSelectedParty] = useState<PartyDetail>({
    companyName: "",
    ledgerPid: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    registrationType: "",
    gstNumber: "",
    statePid: 0,
  });
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<number | "">("");
  const [quantity, setQuantity] = useState<number>(1);
  const [description, setDescription] = useState("");
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [partyPopoverOpen, setPartyPopoverOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState<InvoiceItem | null>(null);
  const [state, setState] = useState<number>(0);
  const [totalAmt, setTotalAmt] = useState<number>(0);

  // Add new state variables for discount and GST percentages
  const [discount, setDiscount] = useState<number>(0);
  const [partyDetailsDialogOpen, setPartyDetailsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      PaymentStatus: "U", // default value (Unpaid)
    },
  });

  const [dateInput, setDateInput] = useState("");

  useEffect(() => {
    fetchInvoiceDetails(pid).then((data) => {
      if (data.table) {
        //bind company
        const options = data.table.map((item: any) => ({
          label: item.c1,
          value: item.c2,
        }));
        setParty(options);
      }
      if (data.table1) {
        //bind product
        //console.log("Product Data:", data.table1);
        const prodList: Product[] = data.table1.map((item: any) => ({
          id: item.pid,
          name: item.productName,
          description: item.productDescription,
          price: item.unitPrice,
          hsnCode: item.hsnCode || "",
          taxPerc: item.taxPerc || 0,
        }));
        setProducts(prodList);
      }
      if (data.table2[0]) {
        //bind invoice details
        // Assuming data.table2 is an array with one object containing:
        // { InvoiceNo, InvoiceDate, PartyName }
        const invoiceData = data.table2[0];
        //console.log("Invoice Data:", invoiceData);
        form.setValue("InvoiceNo", invoiceData.invoiceNo);
        if (invoiceData.invoiceDate) {
          const invDate = new Date(invoiceData.invoiceDate);
          form.setValue("InvoiceDate", invDate);
        }
        form.setValue("PartyName", invoiceData.ledgerName);
        handlePartySelect(invoiceData.ledgerMasterPid, invoiceData.ledgerName);
        form.setValue("PaymentStatus", invoiceData.paymentStatus);
      }

      if (data.table3) {
        //bind invoice details
        const invoiceDetails: InvoiceItem[] = data.table3.map((item: any) => ({
          productId: item.pid,
          description: item.description,
          quantity: item.quantity,
          price: item.unitPrice,
          hsnCode: item.hsnCode,
          taxPerc: item.taxPerc_GST,
        }));
        //console.log("products Details:", data.table3);
        setInvoiceItems(invoiceDetails);
      }
    });
  }, [pid, form]);

  const handlePartySelect = (ledgerPid: string, partyName: string) => {
    fetchPartyDetails(ledgerPid).then((data) => {
      setSelectedParty({
        companyName: partyName,
        ledgerPid: data.table[0].ledgerID,
        addressLine1: data.table[0].addressLine1,
        addressLine2: data.table[0].addressLine2,
        city: data.table[0].city,
        state: data.table[0].state,
        postalCode: data.table[0].postalCode,
        registrationType: data.table[0].registrationType,
        gstNumber: data.table[0].gstNumber,
        statePid: data.table[0].statePid,
      });
      setState(data.table1[0].statePid);
    });
  };

  const addItem = () => {
    if (!selectedProduct) return;
    const product = products.find((p) => p.id === Number(selectedProduct));
    if (!product) return;
    //console.log(product);
    setInvoiceItems([
      ...invoiceItems,
      {
        productId: product.id,
        description: description,
        quantity: quantity,
        price: product.price,
        hsnCode: product.hsnCode || "",
        taxPerc: product.taxPerc || 0,
      },
    ]);
    calculateTotal();
    setSelectedProduct("");
    setDescription("");
    setQuantity(1);
    setValue("");
  };

  const calculateTotal = () => {
    return invoiceItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
  };

  const calculateTax = () => {
    return invoiceItems.reduce(
      (acc, item) => acc + (item.price * item.quantity * item.taxPerc) / 100,
      0
    );
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const isAdd = action.toLowerCase() === "add";
    let payload: {
      [key: string]: any;
    } = {
      LedgerPid: Number(selectedParty.ledgerPid),
      InvoiceNo: values.InvoiceNo,
      InvoiceDate: values.InvoiceDate,
      PaymentStatus: values.PaymentStatus,
      GSTAmount: 0,
      SGSTAmount: sgstAmount,
      CGSTAmount: cgstAmount,
      IGSTAmount: igstAmount,
      TotalAmount: calculateTotal(),
      InvoiceDetails: invoiceItems.map((item) => ({
        productPid: item.productId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.price,
        total: item.price * item.quantity,
        hsnCode: item.hsnCode || "",
        taxPerc_Gst: item.taxPerc || 0,
      })),
    };
    try {
      console.log("Payload to be sent:", payload);
      var response = await createUpdateInvoiceSales(payload, Number(pid));
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
      navigate("/base/basemaster?mod=SalesInvoice");
      console.log("API response:", data.result);
    } catch (error) {
      console.error("Error creating Invoice:", error);
      toast({
        title: "Error creating Invoice:",
        description: String(error),
      });
    }
  }

  const totalAmount = calculateTotal();
  const discountAmount = (totalAmount * discount) / 100;
  const taxableAmount = totalAmount - discountAmount;
  const cgstAmount = state === selectedParty.statePid ? calculateTax() / 2 : 0;
  const sgstAmount = cgstAmount;
  const igstAmount = state === selectedParty.statePid ? 0 : calculateTax();
  const netAmount = taxableAmount + cgstAmount + sgstAmount + igstAmount;

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedForDeletion, setSelectedForDeletion] =
    useState<InvoiceItem | null>(null);
  // Add a function to handle deletion:
  const handleDelete = (itemToDelete: InvoiceItem) => {
    const updatedItems = invoiceItems.filter((item) => item !== itemToDelete);
    setInvoiceItems(updatedItems);
  };

  const PrintPdf = () => {
    fetchInvDetailsForPrint(pid).then((data) => {
      console.log("Print Data:", data);
      if (data.table) {
        //bind company
      }
    });
  };

  const GetProductDesc = () => {
    if (!selectedProduct) return;
    const product = products.find((p) => p.id === Number(selectedProduct));
    if (!product) return;
    //console.log(product);
    setInvoiceItems([
      ...invoiceItems,
      {
        productId: product.id,
        description: description,
        quantity: quantity,
        price: product.price,
        hsnCode: product.hsnCode || "",
        taxPerc: product.taxPerc || 0,
      },
    ]);
  };

  return (
    <Form {...form}>
      <form className="w-full flex flex-col">
        <span className="self-center">INVOICE</span>
        <div className="w-full flex flex-col gap-4 items-start">
          <div className="w-full flex flex-col gap-4 items-start justify-start">
            <div className="flex w-full justify-between">
              <FormField
                control={form.control}
                name="InvoiceNo"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-4">
                    <FormLabel className="whitespace-nowrap">
                      Invoice No
                    </FormLabel>
                    <FormControl>
                      <Input className="w-[200px]" placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="InvoiceDate"
                render={({ field }) => {
                  const displayDate = field.value
                    ? format(field.value, "dd-MM-yyyy")
                    : "";
                  useEffect(() => {
                    setDateInput(displayDate);
                  }, [displayDate]);
                  return (
                    <FormItem className="flex items-center gap-4">
                      <FormLabel>Invoice Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Pick a date"
                              value={dateInput}
                              onChange={(e) => setDateInput(e.target.value)}
                              onBlur={() => {
                                const parsedDate = parse(
                                  dateInput,
                                  "dd-MM-yyyy",
                                  new Date()
                                );
                                if (!isNaN(parsedDate.getTime())) {
                                  field.onChange(parsedDate);
                                }
                              }}
                              className={cn(
                                "w-[200px] pl-3 text-left font-normal",
                                !dateInput && "text-muted-foreground"
                              )}
                            />
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date);
                              setDateInput(
                                date ? format(date, "dd-MM-yyyy") : ""
                              );
                            }}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>
            <div className="flex w-full">
              <FormField
                control={form.control}
                name="PartyName"
                render={({ field }) => (
                  <FormItem className="w-2/6 flex flex-col justify-end gap-1">
                    <FormLabel>Party A/C Name</FormLabel>
                    <div className="flex items-center">
                      {/* Keep dropdown as it is */}
                      <Popover
                        open={partyPopoverOpen}
                        onOpenChange={setPartyPopoverOpen}
                      >
                        <PopoverTrigger asChild>
                          <FormControl className="w-full">
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? party.find(
                                    (option) => option.value === field.value
                                  )?.value
                                : "Select Ledger Account"}
                              <ChevronsUpDown className="opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                          <Command>
                            <CommandInput
                              placeholder="Search Party..."
                              className="h-9"
                            />
                            <CommandList>
                              <CommandEmpty>No Party found</CommandEmpty>
                              <CommandGroup>
                                {party.map((option) => (
                                  <CommandItem
                                    value={option.label}
                                    key={option.value}
                                    onSelect={() => {
                                      field.onChange(option.value);
                                      handlePartySelect(
                                        option.label,
                                        option.value
                                      );
                                      setPartyPopoverOpen(false);
                                    }}
                                  >
                                    {option.value}
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
                      {/* Add show party details button */}
                      <Button
                        type="button"
                        size="sm"
                        className="ml-2"
                        onClick={() => setPartyDetailsDialogOpen(true)}
                      >
                        Show Party Details
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          {/* Remove/hide inline party details */}
          {/* <div id="Div_PartyDetails" ...> ... </div> */}
          <div>
            <FormField
              control={form.control}
              name="PaymentStatus"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Payment Status</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex space-x-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="U" />
                        </FormControl>
                        <FormLabel className="font-normal">Unpaid</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="P" />
                        </FormControl>
                        <FormLabel className="font-normal">Paid</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="PP" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Partially Paid
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="NA" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Not Approved
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* <Separator /> */}
          <div className="w-full">
            <Table className="w-full border mb-4">
              <TableHeader className="pointer-events-none bg-[#131314]">
                <TableRow>
                  <TableHead className="text-white">Del</TableHead>
                  <TableHead className="text-white">Name of Item</TableHead>
                  <TableHead className="text-white">Description</TableHead>
                  <TableHead className="text-white">HSN Code</TableHead>
                  <TableHead className="text-white">Quantity</TableHead>
                  <TableHead className="text-white">Rate (per)</TableHead>
                  <TableHead className="text-white">GST (%)</TableHead>
                  <TableHead className="text-white">GST Amt</TableHead>
                  <TableHead className="text-white">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoiceItems.map((item, index) => (
                  <TableRow
                    key={index}
                    onClick={() => {
                      setSelectedRow(item);
                      setOpenDialog(true);
                    }}
                    className={`cursor-pointer hover:bg-muted/50 ${
                      openDialog &&
                      selectedRow &&
                      selectedRow.productId === item.productId
                        ? "bg-muted"
                        : ""
                    }`}
                  >
                    <TableCell>
                      <MdDeleteForever
                        className="text-2xl cursor-pointer text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedForDeletion(item);
                          setDeleteDialogOpen(true);
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {products.find((p) => p.id === item.productId)?.name}
                    </TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.hsnCode}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>₹{item.price}</TableCell>
                    <TableCell>{item.taxPerc}</TableCell>
                    <TableCell>
                      {(item.price * item.quantity * item.taxPerc) / 100}
                    </TableCell>
                    <TableCell>₹{item.price * item.quantity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* <div className="text-right font-medium text-md mt-2">
              Total: ₹{calculateTotal()}
            </div> */}
            <span className="font-medium">Add Items</span>
            <div className="flex gap-4 mb-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Item</label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                          "justify-between w-[300px]",
                          !value && "text-muted-foreground"
                        )}
                      >
                        {value
                          ? products.find((option) => option.name === value)
                              ?.name
                          : "Select Item"}
                        <ChevronsUpDown className="opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search Item..."
                        className="h-9"
                      />
                      <CommandList>
                        <CommandEmpty>No Item found</CommandEmpty>
                        <CommandGroup>
                          {products.map((option) => (
                            <CommandItem
                              value={option.name}
                              key={option.id}
                              onSelect={(currentValue) => {
                                setValue(
                                  currentValue === value ? "" : currentValue
                                );
                                setOpen(false);
                                setSelectedProduct(Number(option.id));
                                setDescription(option.description || "");
                              }}
                            >
                              {option.name} - ₹{option.price}
                              <Check
                                className={cn(
                                  "ml-auto",
                                  value === option.name
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
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Enter Address Line 1"
                  className="resize-none w-[400px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Quantity</label>
                <Input
                  type="number"
                  className="w-[90px]"
                  placeholder="Enter Qty"
                  value={quantity}
                  min={1}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </div>
              <Button type="button" onClick={addItem} className="mt-7">
                Add Item
              </Button>
            </div>
          </div>
          <div className="flex w-full justify-end">
            <table className="w-[560px] col-span-3">
              <tbody>
                <tr className="border-b">
                  <td className="text-left font-normal text-md w-40">
                    Total Amount (₹):
                  </td>
                  <td
                    className="text-right font-medium text-md ml-2"
                    colSpan={3}
                  >
                    {totalAmount.toFixed(2)}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="text-left font-normal text-md w-40">
                    Discount(%):
                  </td>
                  <td className="text-right font-medium text-md ml-2">
                    <Input
                      type="number"
                      className="w-[90px]"
                      placeholder=""
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      min={0}
                    />
                  </td>
                  <td
                    className="text-right font-medium text-md ml-2"
                    colSpan={2}
                  >
                    {discountAmount.toFixed(2)}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="text-left font-normal text-md w-40">
                    Taxable Amount (₹):
                  </td>
                  <td
                    className="text-right font-medium text-md ml-2"
                    colSpan={3}
                  >
                    {taxableAmount.toFixed(2)}
                  </td>
                </tr>
                <tr className="border-b">
                  <td
                    className="text-left font-normal text-md w-40"
                    colSpan={2}
                  >
                    CGST Amount (₹):
                  </td>
                  {/* <td className="w-40">
                    <Input
                      type="number"
                      className="w-[90px]"
                      placeholder=""
                      value={cgstPercent}
                      onChange={(e) => setCgstPercent(Number(e.target.value))}
                      min={0}
                    />
                  </td> */}
                  {/* <td>Amount (₹):</td> */}
                  <td className="text-right font-medium text-md ml-2">
                    {cgstAmount.toFixed(2)}
                  </td>
                </tr>
                <tr className="border-b">
                  <td
                    className="text-left font-normal text-md w-40"
                    colSpan={2}
                  >
                    SGST Amount (₹):
                  </td>
                  {/* <td className="w-40">
                    <Input
                      type="number"
                      className="w-[90px]"
                      placeholder=""
                      value={sgstPercent}
                      onChange={(e) => setSgstPercent(Number(e.target.value))}
                      min={0}
                    />
                  </td> */}
                  {/* <td>Amount (₹):</td> */}
                  <td className="text-right font-medium text-md ml-2">
                    {sgstAmount.toFixed(2)}
                  </td>
                </tr>
                <tr className="border-b">
                  <td
                    className="text-left font-normal text-md w-40"
                    colSpan={2}
                  >
                    IGST Amount (₹):
                  </td>
                  {/* <td className="w-40">
                    <Input
                      type="number"
                      className="w-[90px]"
                      placeholder=""
                      value={igstPercent}
                      onChange={(e) => setIgstPercent(Number(e.target.value))}
                      min={0}
                    />
                  </td> */}
                  {/* <td>Amount (₹):</td> */}
                  <td className="text-right font-medium text-md ml-2">
                    {igstAmount.toFixed(2)}
                  </td>
                </tr>
                <tr className="border-b">
                  <td>Round off</td>
                  <td>
                    <Checkbox />
                  </td>
                  <td colSpan={2} className="text-right">
                    0
                  </td>
                </tr>
                <tr className="border-b">
                  <td colSpan={2}>Net Amount Receivable (₹)</td>
                  <td colSpan={2} className="text-right">
                    {netAmount.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex gap-2">
            <Button type="button" onClick={() => onSubmit(form.getValues())}>
              {action === "add" ? "Submit" : "Update"}
            </Button>
            <Button type="button" onClick={PrintPdf}>
              Print
            </Button>
          </div>
        </div>
      </form>

      {/* Party Details Dialog */}
      <Dialog
        open={partyDetailsDialogOpen}
        onOpenChange={setPartyDetailsDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Party Details</DialogTitle>
          </DialogHeader>
          {selectedParty.companyName ? (
            <div className="flex gap-6 items-start">
              <div className="w-full">
                <div className="flex">
                  <span className="font-medium w-36">Bill To: </span>
                  <label>{selectedParty.companyName}</label>
                </div>
                <div className="flex">
                  <span className="font-medium w-36">Address:</span>
                  <label>
                    {selectedParty.addressLine1}, {selectedParty.addressLine2}
                  </label>
                </div>
                <div className="flex">
                  <span className="font-medium w-36">Place of supply:</span>
                  <label>{selectedParty.city}</label>
                </div>
                <div className="flex">
                  <span className="font-medium w-36">Registration Type:</span>
                  <label>{selectedParty.registrationType}</label>
                </div>
              </div>
              <Separator orientation="vertical" />
              <div className="w-full">
                <div className="flex gap-5 w-full">
                  <div className="flex">
                    <span className="font-medium w-24">State:</span>
                    <label>{selectedParty.state}</label>
                  </div>
                </div>
                <div className="flex">
                  <span className="font-medium w-24">City:</span>
                  <label>{selectedParty.city}</label>
                </div>
                <div className="flex">
                  <span className="font-medium w-24">Pin Code:</span>
                  <label>{selectedParty.postalCode}</label>
                </div>
                <div className="flex gap-6">
                  <div className="flex">
                    <span className="font-medium w-24">GST:</span>
                    <label>{selectedParty.gstNumber}</label>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>No party selected.</div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPartyDetailsDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ------ popup ----------*/}
      <Dialog
        open={openDialog}
        onOpenChange={(open) => {
          setOpenDialog(open);
          if (!open) {
            setSelectedRow(null);
          }
        }}
      >
        <DialogTrigger asChild></DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Invoice Item Details</DialogTitle>
            <DialogDescription>
              Update the quantity and unit price.
            </DialogDescription>
          </DialogHeader>
          {selectedRow ? (
            <div className="space-y-2">
              <div className="flex flex-col gap-1">
                <Label className="text-sm font-medium">Product</Label>
                <Input
                  value={
                    products.find((p) => p.id === selectedRow.productId)
                      ?.name || ""
                  }
                  disabled
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-sm font-medium">Description</Label>
                <Textarea
                  value={selectedRow.description}
                  onChange={(e) =>
                    setSelectedRow({
                      ...selectedRow,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col gap-1">
                  <Label className="text-sm font-medium">Quantity</Label>
                  <Input
                    type="number"
                    value={selectedRow.quantity}
                    onChange={(e) =>
                      setSelectedRow({
                        ...selectedRow,
                        quantity: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-sm font-medium">Unit Price</Label>
                  <Input
                    type="number"
                    value={selectedRow.price}
                    onChange={(e) =>
                      setSelectedRow({
                        ...selectedRow,
                        price: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex items-center">
                <Label className="text-sm font-medium">Total:</Label>
                <span className="ml-2">
                  ₹{selectedRow.quantity * selectedRow.price}
                </span>
              </div>
            </div>
          ) : (
            <p>No details available.</p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOpenDialog(false);
                setSelectedRow(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedRow) {
                  const index = invoiceItems.findIndex(
                    (item) => item.productId === selectedRow.productId
                  );
                  if (index !== -1) {
                    const updatedItems = [...invoiceItems];
                    updatedItems[index] = selectedRow;
                    setInvoiceItems(updatedItems);
                  }
                  setOpenDialog(false);
                  setSelectedRow(null);
                }
              }}
            >
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* ------ popup end ----------*/}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        {/* <AlertDialogTrigger asChild>
                <Button variant="outline">Show Dialog</Button>
              </AlertDialogTrigger> */}
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteDialogOpen(false);
                setSelectedForDeletion(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedForDeletion) {
                  handleDelete(selectedForDeletion);
                }
                setDeleteDialogOpen(false);
                setSelectedForDeletion(null);
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Form>
  );
};

export default InvoiceGenerator;

// same state cgst sgst else igst
