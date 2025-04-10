const API_URL = import.meta.env.VITE_API_URL;
const API_TOKEN = import.meta.env.VITE_API_TOKEN;

export type Data = {
  id: string;
  [key: string]: any;
};

export const GetNavigation = (modCode: string) => {
  //   let targetUrl = "/";
  const navigationMap: {
    [key: string]: {
      navUrl: string;
      reqEndpoint: string;
      reqEndpointDel: string;
    };
  } = {
    LedgerMast: {
      navUrl: "/masters/ledger",
      reqEndpoint: "api/ledger/fetch/Basedata",
      reqEndpointDel: "api/ledger/del/",
    },
    ProdMast: {
      navUrl: "/masters/product",
      reqEndpoint: "api/product/fetch/Basedata",
      reqEndpointDel: "api/product/del/",
    },
    SalesInvoice: {
      navUrl: "/transaction/invoice-proforma",
      reqEndpoint: "api/invoice/sales/fetch/Basedata",
      reqEndpointDel: "api/invoice/sales/del/",
    },
  };

  return navigationMap[modCode];
  // console.log(row.id);
  //   if (modCode === "LedgerMast") {
  //     return navigationMap[1];
  //   } else if (modCode === "ProdMast") {
  //     return navigationMap[2];
  //   } else {
  //     // Fallback page
  //     return (targetUrl = `/masters/basemaster`);
  //   }
};

export async function fetchAllRecords(reqEndpoint: string): Promise<Data[]> {
  try {
    const response = await fetch(API_URL + reqEndpoint, {
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

export async function deleteRecord(
  reqEndpointDel: string,
  pid: string
): Promise<void> {
  const response = await fetch(API_URL + `${reqEndpointDel}${pid}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_TOKEN}`,
    },
  });
  if (!response.ok) {
    let errorMessage = "";
    const contentType = response.headers.get("Content-Type");
    if (contentType && contentType.includes("application/json")) {
      const errorData = await response.json();
      errorMessage = errorData.message || JSON.stringify(errorData);
    } else {
      errorMessage = await response.text();
    }
    throw new Error(`Error deleting row: ${response.status} - ${errorMessage}`);
  }
}
