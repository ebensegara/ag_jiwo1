const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
  const apiKey = "AIzaSyATpq7hIT1GkGJ74af99HeWWxHg9FHE9C0";
  // Try to use v1 instead of v1beta
  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    // Some versions of the SDK allow passing version in getGenerativeModel
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: 'v1' });
    const res = await model.generateContent("ping");
    console.log("Success with v1! Response:", res.response.text());
  } catch (err) {
    console.error("Failed with v1:", err.message);
  }
}

test();
