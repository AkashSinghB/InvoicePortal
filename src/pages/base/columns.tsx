import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown } from "lucide-react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TbEdit, TbEye } from "react-icons/tb";
import { MdDeleteForever } from "react-icons/md";
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
// export type data = {
//   id: string;
//   amount: number;
//   status: "pending" | "processing" | "success" | "failed";
//   email: string;
// };
// Define a generic Data type (must include an "id" field for our row clicks)
export type Data = {
  id: string;
  [key: string]: any;
};
// Define the checkbox column
const checkboxColumn: ColumnDef<Data, any> = {
  id: "select",
  header: ({ table }) => (
    <Checkbox
      checked={
        table.getIsAllPageRowsSelected() ||
        (table.getIsSomePageRowsSelected() && "indeterminate")
      }
      onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      aria-label="Select all"
    />
  ),
  cell: ({ row }) => (
    <div className="flex items-center h-4">
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    </div>
  ),
  enableSorting: false,
  enableHiding: false,
};
const createEditColumn = (
  onEdit: (row: Data) => void
): ColumnDef<Data, any> => ({
  id: "edit",
  header: "Edit",
  cell: ({ row }) => (
    <div onClick={() => onEdit(row.original)}>
      <TbEdit className="text-2xl cursor-pointer text-blue-500" />
    </div>
  ),
  enableSorting: false,
  enableHiding: false,
});

const createViewColumn = (
  onView: (row: Data) => void
): ColumnDef<Data, any> => ({
  id: "view",
  header: "View",
  cell: ({ row }) => (
    <div onClick={() => onView(row.original)}>
      <TbEye className="text-2xl cursor-pointer text-green-500" />
    </div>
  ),
  enableSorting: false,
  enableHiding: false,
});
const createDeleteColumn = (
  onDelete: (row: Data) => void
): ColumnDef<Data, any> => ({
  id: "delete",
  header: "Del",
  cell: ({ row }) => (
    <div onClick={() => onDelete(row.original)}>
      <MdDeleteForever className="text-2xl cursor-pointer text-red-500" />
    </div>
  ),
  enableSorting: false,
  enableHiding: false,
});

// Helper function to generate dynamic columns from API-fetched data.
export function getDynamicColumns<T extends Data>(
  data: T[],
  onEdit: (row: Data) => void,
  onView: (row: Data) => void,
  onDelete: (row: Data) => void
): ColumnDef<T, any>[] {
  if (!data.length) return [];
  // Filter out the "pid" key (case-insensitive) so it's not rendered as a column.
  const keys = Object.keys(data[0]).filter(
    (key) => key.toLowerCase() !== "pid"
  );
  const dynamicCols: ColumnDef<T, any>[] = keys.map((key) => ({
    accessorKey: key,
    header: key.charAt(0).toUpperCase() + key.slice(1),
  }));
  return [
    checkboxColumn as ColumnDef<T, any>,
    createEditColumn(onEdit) as ColumnDef<T, any>,
    createViewColumn(onView) as ColumnDef<T, any>,
    createDeleteColumn(onDelete) as ColumnDef<T, any>,
    ...dynamicCols,
  ];
}

// export const columns: ColumnDef<Payment>[] = [
//   {
//     id: "select",
//     header: ({ table }) => (
//       <Checkbox
//         checked={
//           table.getIsAllPageRowsSelected() ||
//           (table.getIsSomePageRowsSelected() && "indeterminate")
//         }
//         onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
//         aria-label="Select all"
//       />
//     ),
//     cell: ({ row }) => (
//       <Checkbox
//         checked={row.getIsSelected()}
//         onCheckedChange={(value) => row.toggleSelected(!!value)}
//         aria-label="Select row"
//       />
//     ),
//     enableSorting: false,
//     enableHiding: false,
//   },
//   {
//     accessorKey: "status",
//     header: "Status",
//   },
//   {
//     accessorKey: "email",
//     header: ({ column }) => {
//       return (
//         <Button
//           variant="ghost"
//           onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//         >
//           Email
//           <ArrowUpDown className="ml-2 h-4 w-4" />
//         </Button>
//       );
//     },
//   },
//   {
//     accessorKey: "amount",
//     header: () => <div className="text-right">Amount</div>,
//     cell: ({ row }) => {
//       const amount = parseFloat(row.getValue("amount"));
//       const formatted = new Intl.NumberFormat("en-IN", {
//         style: "currency",
//         currency: "INR",
//       }).format(amount);

//       return <div className="text-right font-medium">{formatted}</div>;
//     },
//   },
//   {
//     id: "actions",
//     cell: ({ row }) => {
//       const payment = row.original;

//       return (
//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <Button variant="ghost" className="h-8 w-8 p-0">
//               <span className="sr-only">Open menu</span>
//               <MoreHorizontal className="h-4 w-4" />
//             </Button>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent align="end">
//             <DropdownMenuLabel>Actions</DropdownMenuLabel>
//             <DropdownMenuItem
//               onClick={() => navigator.clipboard.writeText(payment.id)}
//             >
//               Copy payment ID
//             </DropdownMenuItem>
//             <DropdownMenuSeparator />
//             <DropdownMenuItem>View customer</DropdownMenuItem>
//             <DropdownMenuItem>View payment details</DropdownMenuItem>
//           </DropdownMenuContent>
//         </DropdownMenu>
//       );
//     },
//   },
// ];
