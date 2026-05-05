const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
  const apiKey = "AIzaSyATpq7hIT1GkGJ74af99HeWWxHg9FHE9C0";
  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const res = await model.generateContent("ping");
    console.log("Success! Response:", res.response.text());
  } catch (err) {
    console.error("Failed with gemini-1.5-flash:", err.message);
  }
}

test();
