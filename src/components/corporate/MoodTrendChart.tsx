"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MoodTrendChartProps {
  data: {
    day: string;
    avgMood: number;
  }[];
}

export default function MoodTrendChart({ data }: MoodTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="bg-white dark:bg-slate-800">
        <CardHeader>
          <CardTitle>Weekly Mood Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">No data available</p>
        </CardContent>
      </Card>
    );
  }

  const maxMood = 5;
  const minMood = 1;

  return (
    <Card className="bg-white dark:bg-slate-800">
      <CardHeader>
        <CardTitle>Weekly Mood Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => {
            const percentage = ((item.avgMood - minMood) / (maxMood - minMood)) * 100;
            const prevMood = index > 0 ? data[index - 1].avgMood : item.avgMood;
            const trend = item.avgMood > prevMood ? "up" : item.avgMood < prevMood ? "down" : "stable";

            return (
              <div key={item.day} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {item.day}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800 dark:text-white">
                      {item.avgMood.toFixed(1)}
                    </span>
                    {trend === "up" && <TrendingUp className="h-4 w-4 text-green-500" />}
                    {trend === "down" && <TrendingDown className="h-4 w-4 text-red-500" />}
                    {trend === "stable" && <Minus className="h-4 w-4 text-gray-400" />}
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      item.avgMood >= 4
                        ? "bg-green-500"
                        : item.avgMood >= 3
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
