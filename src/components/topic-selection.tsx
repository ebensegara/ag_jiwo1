"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Brain, Users, Zap, Sparkles, Heart } from "lucide-react";
import { type Topic } from "@/lib/topicWebhook";

const topics: Topic[] = [
  {
    id: "mindfulness",
    title: "Mindfulness",
    description: "Find peace and calm through mindful practices",
    icon: Brain,
    color: "bg-[#756657]/10 border-[#756657]/30",
    iconColor: "text-[#0f0e0d]",
  },
  {
    id: "social_relation",
    title: "Social & Relation",
    description: "Navigate relationships and social connections",
    icon: Users,
    color: "bg-blue-300/10 border-blue-300/30",
    iconColor: "text-blue-700",
  },
  {
    id: "productivity",
    title: "Productivity",
    description: "Boost your focus and achieve your goals",
    icon: Zap,
    color: "bg-green-300/10 border-green-300/30",
    iconColor: "text-green-700",
  },
  {
    id: "spiritual_guide",
    title: "Spiritual Guide",
    description: "Explore your spiritual journey and inner peace",
    icon: Sparkles,
    color: "bg-purple-300/10 border-purple-300/30",
    iconColor: "text-purple-700",
  },
  {
    id: "lansia",
    title: "Lansia Care",
    description: "Support and guidance for elderly wellness",
    icon: Heart,
    color: "bg-orange-300/10 border-orange-300/30",
    iconColor: "text-orange-700",
  },
];

interface TopicSelectorProps {
  onSelectTopic: (topic: Topic) => void;
}

export default function TopicSelector({ onSelectTopic }: TopicSelectorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Choose Your Topic
        </h2>
        <p className="text-muted-foreground">
          Select a topic to start your conversation with our AI companion
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-4xl">
        {topics.map((topic) => {
          const Icon = topic.icon;
          return (
            <Card
              key={topic.id}
              className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 ${topic.color}`}
              onClick={() => onSelectTopic(topic)}
            >
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <div className={`p-4 rounded-full ${topic.color} mb-3`}>
                  <Icon className={`h-8 w-8 ${topic.iconColor}`} />
                </div>
                <h3 className="font-semibold text-lg mb-1">{topic.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {topic.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}