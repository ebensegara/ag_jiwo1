import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TOPIC_WEBHOOKS: Record<string, string> = {
  mindfulness: "https://n8n.srv1104373.hstgr.cloud/webhook/mindfulness",
  social_relation: "https://n8n.srv1104373.hstgr.cloud/webhook/social",
  productivity: "https://n8n.srv1104373.hstgr.cloud/webhook/productivity",
  spiritual_guide: "https://n8n.srv1104373.hstgr.cloud/webhook/spiritual",
  lansia: "https://n8n.srv1104373.hstgr.cloud/webhook/lansia",
};

const DEFAULT_WEBHOOK = "https://dindon.app.n8n.cloud/webhook/jiwohook";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { message, user_id, topic, timestamp } = await req.json();

    console.log("=== INCOMING REQUEST ===");
    console.log("Request data:", { message, user_id, topic });

    const webhookUrl = topic && TOPIC_WEBHOOKS[topic] 
      ? TOPIC_WEBHOOKS[topic] 
      : DEFAULT_WEBHOOK;

    console.log("Using webhook URL:", webhookUrl);

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        userId: user_id,
        topic,
        timestamp: timestamp || new Date().toISOString(),
      }),
    });

    console.log("=== N8N RESPONSE ===");
    console.log("n8n response status:", response.status);

    if (!response.ok) {
      throw new Error(`n8n webhook returned status ${response.status}`);
    }

    const text = await response.text();
    console.log("n8n raw response:", text);

    let data;
    if (text && text.trim().length > 0) {
      try {
        const parsed = JSON.parse(text);
        
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].output) {
          data = { message: parsed[0].output };
        } else if (parsed.output) {
          data = { message: parsed.output };
        } else if (parsed.message) {
          data = { message: parsed.message };
        } else {
          data = { message: text };
        }
      } catch (e) {
        data = { message: text };
      }
    } else {
      data = {
        message: "Thank you for sharing. I'm here to support you on your mental health journey.",
      };
    }

    console.log("=== FINAL RESPONSE ===");
    console.log("Returning:", data);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("❌ PROXY ERROR:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        message: "Server sedang sibuk, coba lagi.",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  }
});