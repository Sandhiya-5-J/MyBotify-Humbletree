import API from "./api";
import { handleApiError } from "./api_error";

/** Get all campaigns for a specific store */
export const getStoreCampaigns = async (storeId: number) => {
  try {
    const res = await API.get(`/api/campaign/store/${storeId}`);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

/** Create a new campaign */
export const createCampaign = async (data: {
  store_id: number;
  name: string;
  platform: string;
  status?: string;
  budget?: number;
  target_audience?: string;
  generated_copy?: string;
  products_targeted?: string;
  ad_creative_url?: string;
}) => {
  try {
    const res = await API.post("/api/campaign/", data);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

/** Generate campaign content with AI */
export const generateCampaignContent = async (data: {
  store_id: number;
  platform: string;
  goal?: string;
  target_audience?: string;
  products_context?: string;
}) => {
  try {
    const res = await API.post("/api/campaign/generate", data);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

/** Update an existing campaign */
export const updateCampaign = async (
  campaignId: number,
  data: {
    name?: string;
    platform?: string;
    status?: string;
    budget?: number;
    target_audience?: string;
    generated_copy?: string;
    products_targeted?: string;
    ad_creative_url?: string;
  }
) => {
  try {
    const res = await API.put(`/api/campaign/${campaignId}`, data);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

/** Delete a campaign */
export const deleteCampaign = async (campaignId: number) => {
  try {
    const res = await API.delete(`/api/campaign/${campaignId}`);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

/** Get AI budget optimization recommendations */
export const getCampaignOptimization = async (storeId: number) => {
  try {
    const res = await API.get(`/api/campaign/store/${storeId}/optimize`);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

/** Apply AI budget optimization shifts */
export const applyCampaignOptimization = async (shifts: any[]) => {
  try {
    // Sanitize to match backend OptimizationRecommendationItem schema exactly
    const sanitizedShifts = shifts.map((s) => ({
      campaign_id_from: Number(s.campaign_id_from),
      campaign_name_from: String(s.campaign_name_from),
      campaign_id_to: Number(s.campaign_id_to),
      campaign_name_to: String(s.campaign_name_to),
      amount_to_shift: Number(s.amount_to_shift),
      expected_impact: String(s.expected_impact),
      reasoning: String(s.reasoning),
    }));
    const res = await API.post("/api/campaign/optimize/apply", { shifts: sanitizedShifts });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

/** Get all A/B testing variants for a campaign */
export const getCampaignVariants = async (campaignId: number) => {
  try {
    const res = await API.get(`/api/campaign/${campaignId}/variants`);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

/** Use AI to generate A/B testing variations */
export const generateABVariants = async (campaignId: number, numVariants = 2) => {
  try {
    const res = await API.post(`/api/campaign/${campaignId}/variants/generate`, {
      num_variants: numVariants,
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

/** Pause or activate a campaign variant */
export const updateVariantStatus = async (
  campaignId: number,
  variantId: number,
  isActive: boolean
) => {
  try {
    const res = await API.put(`/api/campaign/${campaignId}/variants/${variantId}/status`, {
      is_active: isActive,
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

/** Declare a variant as the winner of the A/B test */
export const declareVariantWinner = async (campaignId: number, variantId: number) => {
  try {
    const res = await API.post(`/api/campaign/${campaignId}/variants/${variantId}/set-winner`);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};


