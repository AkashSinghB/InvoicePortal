const API_URL = import.meta.env.VITE_API_URL;
// const API_TOKEN = import.meta.env.VITE_API_TOKEN;
const API_TOKEN = sessionStorage.getItem("token") ?? "";

export async function fetchInvoiceDetails(pid: string): Promise<any> {
  try {
    const response = await fetch(`${API_URL}api/invoice/sales/fetch/${pid}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching Sales Invoice details:", error);
    return null;
  }
}

export async function fetchPartyDetails(pid: string): Promise<any> {
  try {
    const response = await fetch(`${API_URL}api/invoice/fetchParty/${pid}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching Party details:", error);
    return null;
  }
}

export async function createUpdateInvoiceSales(
  payload: any,
  pid: number
): Promise<Response> {
  const isAdd = pid == 0;
  const endpoint = isAdd
    ? "api/invoice/sales/create"
    : "api/invoice/sales/update/" + pid;
  const methodType = isAdd ? "POST" : "PUT";
  try {
    const response = await fetch(API_URL + endpoint, {
      method: methodType,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    return response;
  } catch (error) {
    console.error("Error creating Invoice:", error);
    return Promise.reject(error);
  }
}
