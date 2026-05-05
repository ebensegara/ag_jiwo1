const { GoogleGenerativeAI } = require("@google/generative-ai");

async function list() {
  const apiKey = "AIzaSyATpq7hIT1GkGJ74af99HeWWxHg9FHE9C0";
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    const embeddingModels = data.models.filter(m => m.name.includes('embedding') || m.supportedGenerationMethods.includes('embedContent'));
    console.log("Embedding models:", embeddingModels.map(m => m.name));
  } catch (e) {
    console.error("Fetch failed:", e.message);
  }
}

list();
