const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
  const apiKey = "AIzaSyATpq7hIT1GkGJ74af99HeWWxHg9FHE9C0";
  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    console.log("Testing Gemini Embedding...");
    const model = genAI.getGenerativeModel({ model: "models/text-embedding-004" });
    const result = await model.embedContent("Hello world");
    console.log("Success! Embedding length:", result.embedding.values.length);
  } catch (err) {
    console.error("Embedding failed:", err);
  }
}

test();
