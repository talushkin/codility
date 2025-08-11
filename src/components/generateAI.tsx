// External modules
import axios from "axios";

// Environment variables
const AI_API_TOKEN = process.env.REACT_APP_AI_API_TOKEN;
const AI_API_BASE_URL = process.env.REACT_APP_AI_API_BASE_URL || 'https://be-tan-theta.vercel.app';

export const generateImage = async (text: string): Promise<string | null> => {
  if (!text) {
    console.warn("Image description is missing");
    return text;
  }

  if (!AI_API_TOKEN) {
    console.error("AI API token is not configured. Please set REACT_APP_AI_API_TOKEN in your environment variables.");
    return null;
  }

  try {
    console.log("Requesting image for:", text);
    const res = await axios.post<{ s3Url?: string; imageUrl?: string }>(
      `${AI_API_BASE_URL}/api/ai/image`,
      { text },
      {
        headers: {
          Authorization: `Bearer ${AI_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("image result:", res.data);
    return res?.data?.s3Url || res?.data?.imageUrl || null;
  } catch (err: any) {
    console.error("Error creating image:", err.response?.data || err.message);
    return null;
  }
};
