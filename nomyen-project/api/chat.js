// ไฟล์: api/chat.js
// หน้าที่: รับข้อความจากหน้าบ้าน -> ส่งให้ Google Gemini -> ส่งคำตอบกลับ

export default async function handler(req, res) {
  // 1. ตรวจสอบว่าเป็นวิธี POST หรือไม่
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 2. ดึง API Key จากที่ซ่อนไว้ (Environment Variable)
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server Configuration Error: Missing API Key' });
  }

  // 3. รับข้อความที่ส่งมาจากหน้าบ้าน
  const { prompt } = req.body;

  try {
    // 4. ส่งต่อไปหา Google Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await response.json();

    // 5. ตรวจสอบว่ามีคำตอบหรือไม่
    if (data.candidates && data.candidates[0].content) {
       const text = data.candidates[0].content.parts[0].text;
       res.status(200).json({ text: text });
    } else {
       res.status(500).json({ error: 'No response from AI' });
    }
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}