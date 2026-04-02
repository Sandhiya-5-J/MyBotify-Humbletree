
"use server";

import API from "./api";
import { handleApiError } from "./api_error";


export const sendMessageToBot = async (message: string, conversationId: string, storeId?: number, isAdmin?: boolean) => {
 
  try {
    const res = await API.post("/api/chat/conversation", {
      "message":message,
      "conversation_id":conversationId,
      ...(storeId && { "store_id": storeId }),
      ...(isAdmin && { "is_admin": isAdmin })
    });

    const responseData = res.data?.data;
    const setCookieHeader = res.headers['set-cookie'];
 
    
    return {
      message: responseData?.message || "No response",
      cookies: setCookieHeader
    
    };
  } catch (error) {
    console.error("API CALL FAILED:", error);
    handleApiError(error);
  }
};







