import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
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
import { format } from "date-fns";
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

const companies = [
  {
    label: "Company A",
    value: "1",
    address: "123 Street, City",
    gst: "GST1234",
  },
  {
    label: "Company B",
    value: "2",
    address: "456 Avenue, City",
    gst: "GST5678",
  },
];

const debtors = [
  { label: "Debtor X", value: "1", address: "789 Road, City", gst: "GST9999" },
  { label: "Debtor Y", value: "2", address: "321 Lane, City", gst: "GST8888" },
];

const formSchema = z.object({
  PartyName: z.string().max(100),
  InvoiceNo: z.string().max(20),
  InvoiceDate: z.date(),
  ProductDescription: z.string(),
  UnitPrice: z.coerce.number().positive(),
  OpeningUnits: z.coerce.number().positive(),
  OpeningBalance: z.coerce.number().positive(),
  IsActive: z.boolean(),
});

interface Product {
  id: number;
  name: string;
  price: number;
}

interface InvoiceItem {
  productId: number;
  quantity: number;
  price: number;
}

const products: Product[] = [
  { id: 1, name: "Aggarbatti", price: 100 },
  { id: 2, name: "Sambrani Cup", price: 200 },
  { id: 3, name: "Hawan Samagri with blossom scent", price: 300 },
];

const InvoiceGenerator: React.FC = () => {
  //export default function InvoiceGenerator() {
  const [selectedCompany, setSelectedCompany] = useState(companies[0]);
  // const { control, setValue, getValues } = useFormContext();

  const [selectedDebtor, setSelectedDebtor] = useState<
    { id: number; label: string; value: string }[]
  >([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<number | "">("");
  const [quantity, setQuantity] = useState<number>(1);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState<InvoiceItem | null>(null);

  const addItem = () => {
    if (!selectedProduct) return;
    const product = products.find((p) => p.id === Number(selectedProduct));
    if (!product) return;

    setInvoiceItems([
      ...invoiceItems,
      { productId: product.id, quantity, price: product.price },
    ]);
    setSelectedProduct("");
    setQuantity(1);
  };

  const calculateTotal = () => {
    return invoiceItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
  };

  return (
    <Form {...form}>
      <form className="w-full flex">
        <div className="w-full flex flex-col gap-4 items-start">
          <span className="self-center">INVOICE</span>
          {/* <Separator></Separator> */}
          <div className="w-full flex flex-col gap-4 items-start justify-start">
            {/* <span className="mb-3">Debtors (Customer)</span> */}
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
                      <Input
                        className="w-[200px]"
                        placeholder=""
                        {...field}
                        // disabled={isView}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="InvoiceDate"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-4">
                    <FormLabel>Invoice Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[200px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd-MM-yyyy")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {/* <FormDescription>
                        Your date of birth is used to calculate your age.
                      </FormDescription> */}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex w-full">
              <FormField
                control={form.control}
                name="PartyName"
                render={({ field }) => (
                  <FormItem className="w-2/6 flex flex-col justify-end gap-1">
                    <FormLabel>Pary A/C Name</FormLabel>
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
                            // disabled={isView}
                          >
                            {field.value
                              ? selectedDebtor.find(
                                  (option) => option.value === field.value
                                )?.label
                              : "Select Ledger Account"}
                            <ChevronsUpDown className="opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search Debtor..."
                            className="h-9"
                            // disabled={isView}
                          />
                          <CommandList>
                            <CommandEmpty>No Debtor found</CommandEmpty>
                            <CommandGroup>
                              {selectedDebtor.map((option) => (
                                <CommandItem
                                  value={option.label}
                                  key={option.value}
                                  onSelect={() => {
                                    field.onChange(option.value);
                                    // setValue("City", "");
                                  }}
                                  // disabled={isView}
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
          </div>
          <div className="w-full flex gap-4 items-start ">
            <div className="w-full">
              {/* <span className="font-medium">Party Details</span> */}
              <div className="flex ">
                <span className="font-medium w-20">Bill To: </span>
                <label>{selectedCompany.label} </label>
              </div>
              <div className="flex ">
                <span className="font-medium w-20">Address:</span>
                <label>{selectedCompany.address} </label>
              </div>
              <div className="flex ">
                <span className="font-medium w-32">Place of supply: </span>
                <label>{selectedCompany.address} </label>
              </div>
            </div>
            <Separator orientation="vertical"></Separator>
            <div className="w-full">
              <div className="flex gap-5 w-full">
                <div className="flex">
                  <span className="font-medium w-12">State:</span>
                  <label> {selectedCompany.gst}</label>
                </div>
                <div className="flex">
                  <span className="font-medium w-12">City:</span>
                  <label> {selectedCompany.gst}</label>
                </div>
                <div className="flex">
                  <span className="font-medium w-20 ">Pin Code:</span>
                  <label> 110084</label>
                </div>
              </div>
              <div className="flex gap-6">
                <div>
                  <span className="font-medium w-20">Registration Type:</span>
                  <label> {selectedCompany.gst}</label>
                </div>
                <div>
                  <span className="font-medium w-20">GST:</span>
                  <label> {selectedCompany.gst}</label>
                </div>
              </div>
            </div>
          </div>
          <Separator></Separator>
          <div className="w-full ">
            <div className="flex gap-4 mb-4">
              <div className="flex flex-col gap-3">
                <label className="text-sm font-medium ">Add Items</label>
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
                        )} // disabled={isView}
                      >
                        {value
                          ? products.find(
                              (option) => option.id.toString() === value
                            )?.name
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
                        // disabled={isView}
                      />
                      <CommandList>
                        <CommandEmpty>No Item found</CommandEmpty>
                        <CommandGroup>
                          {products.map((option) => (
                            <CommandItem
                              value={option.id.toString()}
                              key={option.id}
                              onSelect={(currentValue) => {
                                setValue(
                                  currentValue == value ? "" : currentValue
                                );
                                setOpen(false);
                                setSelectedProduct(Number(currentValue));
                                // console.log(currentValue);
                                // updateCityOptions(option.id);
                                // setValue("City", "");
                              }}
                              // disabled={isView}
                            >
                              {option.name} - ₹{option.price}
                              <Check
                                className={cn(
                                  "ml-auto",
                                  value === option.id.toString()
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
              <div className="flex flex-col gap-3">
                <label className="text-sm font-medium ">Quantity</label>
                <Input
                  type="number"
                  className="w-[100px]"
                  placeholder="Enter Qty"
                  value={quantity}
                  min={1}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </div>

              <Button type="button" onClick={addItem} className="mt-8">
                Add Item
              </Button>
            </div>

            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Amount</TableHead>
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
                    className={` ${
                      openDialog &&
                      selectedRow &&
                      selectedRow.productId === item.productId &&
                      selectedRow.quantity === item.quantity
                        ? "bg-muted"
                        : ""
                    }`}
                  >
                    <TableCell>
                      {products.find((p) => p.id === item.productId)?.name}
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>₹{item.price}</TableCell>
                    <TableCell>₹{item.price * item.quantity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="text-right font-bold text-lg mt-4">
              Total: ₹{calculateTotal()}
            </div>

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
                    <div className="flex flex-col">
                      <Label className="text-sm font-medium">Product:</Label>
                      <Input
                        value={
                          products.find((p) => p.id === selectedRow.productId)
                            ?.name || ""
                        }
                        disabled
                      />
                    </div>
                    <div className="flex flex-col">
                      <Label className="text-sm font-medium">Quantity:</Label>
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
                    <div className="flex flex-col">
                      <Label className="text-sm font-medium">Unit Price:</Label>
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
                        // Update the invoiceItems array by replacing the matching item.
                        const index = invoiceItems.findIndex(
                          (item) =>
                            item.productId === selectedRow.productId &&
                            // Optionally, if needed, match also by an identifier or current quantity
                            true
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
          </div>
        </div>
      </form>
    </Form>
  );
};

export default InvoiceGenerator;
