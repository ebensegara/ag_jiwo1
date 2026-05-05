const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  const apiKey = "AIzaSyATpq7hIT1GkGJ74af99HeWWxHg9FHE9C0";
  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    console.log("Listing models...");
    // There isn't a direct listModels in the JS SDK usually without auth, 
    // but we can try to hit an endpoint or just guess.
    // Let's try common ones.
    const models = ["text-embedding-004", "models/text-embedding-004", "embedding-001", "models/embedding-001"];
    for (const m of models) {
      try {
        const model = genAI.getGenerativeModel({ model: m });
        await model.embedContent("test");
        console.log(`✅ Success with: ${m}`);
      } catch (e) {
        console.log(`❌ Failed with: ${m} - ${e.message}`);
      }
    }
  } catch (err) {
    console.error("Failed:", err);
  }
}

listModels();
