import { useState, useEffect } from "react";
import { Data, getDynamicColumns } from "./columns";
import { DataTable } from "../../components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  GetNavigation,
  fetchAllRecords,
  deleteRecord,
} from "./helper/HelperBase";
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
import { useLocation } from "react-router-dom";

export default function BaseMaster() {
  const location = useLocation();

  let searchParams = new URLSearchParams(location.search);
  let modCode = searchParams.get("mod");
  const navUrl = GetNavigation(modCode || "").navUrl;
  const reqEndpoint = modCode ? GetNavigation(modCode).reqEndpoint || "" : "";
  const reqEndpointDel = modCode
    ? GetNavigation(modCode).reqEndpointDel || ""
    : "";
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
    window.location.href = `${navUrl}?action=edit&pid=${row.pid}`;
  };

  const handleView = (row: Data) => {
    window.location.href = `${navUrl}?action=view&pid=${row.pid}`;
  };

  const handleDelete = async (row: Data) => {
    try {
      await deleteRecord(reqEndpointDel, row.pid);
      console.log("Row deleted successfully");

      // Update the data state without refetching from the API.
      setData((prevData) => prevData.filter((item) => item.pid !== row.pid));
      // Also update columns if needed (usually not required)
      //setColumns(getDynamicColumns(data.filter((item) => item.pid !== row.pid), handleEdit, handleView, handleDelete));
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  if (reqEndpoint != null) {
    useEffect(() => {
      async function fetchData() {
        const fetchedData = await fetchAllRecords(reqEndpoint);
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
