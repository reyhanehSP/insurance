// api/metis.ts
import axios from "axios";

const headersAi = {
  Authorization: "Bearer tpsg-fZjznCMESRkQnVIrylqg8zZA4QvUVWn",
  "Content-Type": "application/json",
};

const botId = "c65e5439-0f1d-46c3-b8bf-75d286a9d3f8";
const baseUrl = "https://api.metisai.ir/api/v1";

export const sendTextToMetis = async (text: string) => {
  if (!text.trim()) throw new Error("متن ورودی خالی است");

  // 1️⃣ ساخت session
  const sessionRes = await axios.post(
    `${baseUrl}/chat/session`,
    {
      botId,
      user: null,
      initialMessages: null,
    },
    { headers: headersAi }
  );

  const sessionId = sessionRes.data.id;


  const chatRes = await axios.post(
    `${baseUrl}/chat/session/${sessionId}/message`,
    {
      message: {
        content: text,
        type: "USER",
      },
    },
    { headers: headersAi }
  );

  const chatData = chatRes.data;
  const cleaned = chatData.content.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned);

  return {
    parsed,
    raw: chatData,
  };
};
