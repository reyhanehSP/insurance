const API_URL = "https://api.metisai.ir/api/v1/chat/session";
const API_KEY = "tpsg-fZjznCMESRkQnVIrylqg8zZA4QvUVWn";

export const extractFieldsFromVoiceText = async (text: string) => {
  const prompt = `لطفاً از متن زیر فقط فیلدهای زیر را استخراج کن و به صورت JSON فارسی برگردان:
- firsName
- lastName
- nationalCode
- birthdayDate

متن:
"${text}"`;

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "gpt-4o",
      }),
    });

    const data = await res.json();

    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error("پاسخی از API دریافت نشد");

    try {
      const parsed = JSON.parse(content);
      return parsed;
    } catch (err) {
      console.warn("خروجی JSON نبود:", content);
      return null;
    }
  } catch (error) {
    console.error("خطا در تماس با API:", error);
    return null;
  }
};
