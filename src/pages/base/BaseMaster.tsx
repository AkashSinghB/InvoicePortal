import { useState, useEffect } from "react";
import { Data, getDynamicColumns } from "./columns";
import { DataTable } from "../../components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { GetNavigation } from "./helper/HelperBase";

const API_URL = import.meta.env.VITE_API_URL;
const API_TOKEN = import.meta.env.VITE_API_TOKEN;
const searchParams = new URLSearchParams(window.location.search);
const modCode = searchParams.get("mod");
let apiUrl = "",
  apiUrlDel = "";
if (modCode != null) {
  apiUrl = GetNavigation(modCode).apiUrl || "";
  apiUrlDel = GetNavigation(modCode).apiUrlDel || "";
}
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
    return jsonData;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}

export default function BaseMaster() {
  const navUrl = GetNavigation(modCode || "").navUrl;
  const [data, setData] = useState<Data[]>([]);
  const [columns, setColumns] = useState<ColumnDef<Data, any>[]>([]);
  const [loading, setLoading] = useState(true);
  if (apiUrl != null) {
    useEffect(() => {
      async function fetchData() {
        const fetchedData = await getData();
        setData(fetchedData);
        setColumns(
          getDynamicColumns(fetchedData, handleEdit, handleView, handleDelete)
        );
        setLoading(false);
      }
      fetchData();
    }, []);
  }
  // const handleRowClick = (row: Data) => {
  //   window.location.href = `${navUrl}?pid=${row.pid}`;
  // };

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

  const addNewLedger = () => {
    window.location.href = `${navUrl}?action=add`;
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
    </div>
  );
}
