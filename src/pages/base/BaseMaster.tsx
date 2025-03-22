import { useState, useEffect } from "react";
import { Data, getDynamicColumns } from "./columns";
import { DataTable } from "../../components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { GetNavigation } from "./helper/HelperBase";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useLocation, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;
const API_TOKEN = import.meta.env.VITE_API_TOKEN;

export default function BaseMaster() {
  const location = useLocation();
  // const navigate = useNavigate();

  // Update modCode and API URLs when location changes
  let searchParams = new URLSearchParams(location.search);
  let modCode = searchParams.get("mod");
  const navUrl = GetNavigation(modCode || "").navUrl;
  const apiUrl = modCode ? GetNavigation(modCode).apiUrl || "" : "";
  const apiUrlDel = modCode ? GetNavigation(modCode).apiUrlDel || "" : "";
  const [data, setData] = useState<Data[]>([]);
  const [columns, setColumns] = useState<ColumnDef<Data, any>[]>([]);
  const [loading, setLoading] = useState(true);
  // State for deletion confirmation through dialog
  const [selectedForDeletion, setSelectedForDeletion] = useState<Data | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const confirmDelete = (row: Data) => {
    setSelectedForDeletion(row);
    setDeleteDialogOpen(true);
  };

  const handleEdit = (row: Data) => {
    console.log("Edit row:", row);
    window.location.href = `${navUrl}?action=edit&pid=${row.pid}`;
    // Add your edit logic here
  };

  const handleView = (row: Data) => {
    console.log("View row:", row);
    window.location.href = `${navUrl}?action=view&pid=${row.pid}`;
    // Add your view logic here
  };

  const handleDelete = async (row: Data) => {
    //console.log("Delete row:", row);
    try {
      // Adjust delete endpoint as needed; this one uses row.pid
      const deleteEndpoint = `${apiUrlDel}${row.pid}`;
      const response = await fetch(API_URL + deleteEndpoint, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_TOKEN}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Error deleting row: ${response.status}`);
      }
      console.log("Row deleted successfully");

      // Update the data state without refetching from the API.
      setData((prevData) => prevData.filter((item) => item.pid !== row.pid));
      // Also update columns if needed (usually not required)
      //setColumns(getDynamicColumns(data.filter((item) => item.pid !== row.pid), handleEdit, handleView, handleDelete));
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };
  // Asynchronous function to fetch dynamic data from your API.
  async function getData(): Promise<Data[]> {
    try {
      const response = await fetch(API_URL + apiUrl, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_TOKEN}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const jsonData = await response.json();
      //console.log("Data fetched successfully:", jsonData);
      return jsonData;
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    }
  }

  if (apiUrl != null) {
    useEffect(() => {
      async function fetchData() {
        const fetchedData = await getData();
        setData(fetchedData);
        setColumns(
          getDynamicColumns(fetchedData, handleEdit, handleView, confirmDelete)
        );
        setLoading(false);
      }
      fetchData();
    }, [location.search]);
  }

  const addNewLedger = () => {
    window.location.href = `${navUrl}?action=add`;
  };

  if (loading) {
    return <div className="container mx-auto py-10">Loading...</div>;
  }

  return (
    <div className="container mx-auto ">
      <Button type="button" onClick={addNewLedger}>
        Add New
      </Button>
      <DataTable columns={columns} data={data} />
      {/* onRowClick={handleRowClick} */}
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
    </div>
  );
}
