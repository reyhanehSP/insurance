// api/transcribe.ts
import axios from "axios";

export const transcribeAudio = async (formData: FormData) => {
  const response = await axios.post(
    "https://api.alobegoo.com/ai-noauth/transcribe",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data; 
};
