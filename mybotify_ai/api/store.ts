import API from "./api";
import { handleApiError } from "./api_error";

/** Connect a Shopify store via API token */
export const connectStore = async (storeUrl: string, accessToken: string) => {
  try {
    const res = await API.post("/api/store/connect", {
      store_url: storeUrl,
      access_token: accessToken,
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

/** Add a store manually */
export const addStoreManual = async (data: {
  store_name: string;
  store_url?: string;
  description?: string;
  shopify_email?: string;
  currency?: string;
  country?: string;
}) => {
  try {
    const res = await API.post("/api/store/add-manual", data);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

/** Upload products CSV for a store */
export const uploadProductsCSV = async (storeId: number, file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await API.post(`/api/store/${storeId}/upload-products`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

/** Upload orders CSV for a store */
export const uploadOrdersCSV = async (storeId: number, file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await API.post(`/api/store/${storeId}/upload-orders`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

/** Upload customers CSV for a store */
export const uploadCustomersCSV = async (storeId: number, file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await API.post(`/api/store/${storeId}/upload-customers`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

/** Get current user's connected stores */
export const getMyStores = async () => {
  try {
    const res = await API.get("/api/store/my-stores");
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

/** Get all connected stores (admin only) */
export const getAllStores = async () => {
  try {
    const res = await API.get("/api/store/all");
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

/** Get products for a store */
export const getStoreProducts = async (storeId: number) => {
  try {
    const res = await API.get(`/api/store/${storeId}/products`);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

/** Get analytics for a store */
export const getStoreAnalytics = async (storeId: number) => {
  try {
    const res = await API.get(`/api/store/${storeId}/analytics`);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

/** Get orders for a store */
export const getStoreOrders = async (storeId: number) => {
  try {
    const res = await API.get(`/api/store/${storeId}/orders`);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

/** Disconnect a store */
export const disconnectStore = async (storeId: number) => {
  try {
    const res = await API.delete(`/api/store/${storeId}`);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};
