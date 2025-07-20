// NEVER expose real keys in production apps or public sandboxes
import axios from "axios";


export const generateImage = async (text: string): Promise<string | null> => {
  if (!text) {
    console.warn("Image description is missing");
    return text;
  }

  try {
    console.log("Requesting image for:", text);
    const res = await axios.post<{ s3Url?: string; imageUrl?: string }>(
      "https://be-tan-theta.vercel.app/api/ai/image",
      { text },
      {
        headers: {
          Authorization: `Bearer 1234`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("image result:", res.data);
    return res?.data?.s3Url || res?.data?.imageUrl || null;
  } catch (err: any) {
    console.error("Error creating image:", err.response?.data || err.message);
    return text;
  }
};
