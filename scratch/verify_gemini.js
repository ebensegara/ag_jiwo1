const { GoogleGenerativeAI } = require("@google/generative-ai");

async function findModel() {
  const apiKey = "AIzaSyATpq7hIT1GkGJ74af99HeWWxHg9FHE9C0";
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Try to use a generative model first to verify API key
  try {
    const flash = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const res = await flash.generateContent("hi");
    console.log("API Key Valid. Gemini says:", res.response.text());
  } catch (e) {
    console.error("API Key Invalid or unreachable:", e.message);
    return;
  }

  const candidates = [
    "text-embedding-004",
    "models/text-embedding-004",
    "embedding-001",
    "models/embedding-001"
  ];

  for (const c of candidates) {
    try {
      const model = genAI.getGenerativeModel({ model: c });
      const result = await model.embedContent("test");
      console.log(`✅ SUCCESS: ${c}`);
      return;
    } catch (e) {
      console.log(`❌ FAIL: ${c} - ${e.message}`);
    }
  }
}

findModel();
