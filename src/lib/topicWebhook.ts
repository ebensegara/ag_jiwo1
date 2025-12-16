import { supabase } from "@/lib/supabase";

export interface Topic {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  iconColor: string;
}

export async function sendTopicWebhook(topic: Topic, userId: string) {
  try {
    const { data, error } = await supabase.functions.invoke(
      'supabase-functions-n8n-webhook-proxy',
      {
        body: {
          topic: topic.id,
          user_id: userId,
          message: `User selected topic: ${topic.title}`,
          timestamp: new Date().toISOString(),
        },
      }
    );

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error calling topic webhook:", error);
    throw error;
  }
}