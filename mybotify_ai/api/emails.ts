import API from "./api";
import { handleApiError } from "./api_error";

export interface EmailGenerateRequest {
  store_id: number;
  sequence_type: string;
  tone: string;
  product_context?: string;
  audience?: string;
}

export interface EmailTemplate {
  subject: string;
  body: string;
  call_to_action: string;
  delay_days: number;
}

export interface EmailSequenceResponse {
  emails: EmailTemplate[];
}

export const generateEmailSequence = async (data: EmailGenerateRequest): Promise<EmailSequenceResponse | undefined> => {
  try {
    const response = await API.post("/api/emails/generate", data);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};
