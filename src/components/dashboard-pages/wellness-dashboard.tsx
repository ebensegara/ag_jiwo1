"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BookOpen,
    Wind,
    Gamepad2,
    PenTool,
    Sparkles,
    Moon,
    Map,
    BarChart2,
    AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const TOOLS = [
    {
        title: "Learn",
        description: "Understand the science behind panic attacks and anxiety to regain control.",
        icon: BookOpen,
        color: "bg-blue-100 text-blue-700",
    },
    {
        title: "Breathe",
        description: "Guided breathing exercises to stabilize your heart rate and ground you.",
        icon: Wind,
        color: "bg-green-100 text-green-700",
    },
    {
        title: "Play",
        description: "Engaging mini-games designed to shift your focus away from anxiety.",
        icon: Gamepad2,
        color: "bg-purple-100 text-purple-700",
    },
    {
        title: "Journal",
        description: "Track your mood and write down your thoughts to clear your mind.",
        icon: PenTool,
        color: "bg-amber-100 text-amber-700",
    },
    {
        title: "Visualize",
        description: "Immersive visual journeys to transport you to a safe, happy place.",
        icon: Sparkles,
        color: "bg-pink-100 text-pink-700",
    },
    {
        title: "Sleep",
        description: "Calming soundscapes and stories to help you drift into a deep sleep.",
        icon: Moon,
        color: "bg-indigo-100 text-indigo-700",
        image: "/images/sleep-monster.png",
    },
];

export default function WellnessDashboard() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Hero Section */}
            <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-[#3D3D3D]">How are you feeling today?</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Your journey to calmness starts here. Choose a tool below or use the panic relief button for immediate help.
                </p>
                <Button variant="destructive" className="rounded-full px-8 py-6 h-auto text-lg font-bold shadow-xl hover:scale-105 transition-transform">
                    <AlertTriangle className="mr-2 h-6 w-6" />
                    Panic Relief
                </Button>
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {TOOLS.map((tool) => (
                    <Card key={tool.title} className="group hover:shadow-2xl transition-all duration-300 border-none bg-white/50 backdrop-blur-sm cursor-pointer hover:-translate-y-1">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-start justify-between">
                                <div className={`w-12 h-12 rounded-2xl ${tool.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <tool.icon className="h-6 w-6" />
                                </div>
                                {tool.image && (
                                    <div className="relative w-24 h-24 -mt-4 -mr-4 group-hover:scale-110 transition-transform duration-300 z-10">
                                        <Image
                                            src={tool.image}
                                            alt={tool.title}
                                            fill
                                            priority
                                            className="object-contain"
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-[#3D3D3D]">{tool.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {tool.description}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Progress Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
                <Card className="bg-gradient-to-br from-[#FFD3BA] to-[#FF9A76] border-none text-[#3D3D3D] cursor-pointer hover:shadow-xl transition-all">
                    <CardContent className="p-8 flex items-center justify-between">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold">My Journey</h3>
                            <p className="opacity-80">View your progress map</p>
                        </div>
                        <Map className="h-12 w-12 opacity-50" />
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-[#B8C9E3] to-[#7A9CC6] border-none text-[#3D3D3D] cursor-pointer hover:shadow-xl transition-all">
                    <CardContent className="p-8 flex items-center justify-between">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold">My Stats</h3>
                            <p className="opacity-80">Weekly mood analysis</p>
                        </div>
                        <BarChart2 className="h-12 w-12 opacity-50" />
                    </CardContent>
                </Card>
            </div>

            <footer className="text-center py-8 text-gray-500 text-sm italic">
                © 2023 JIWO.AI - Mental Wellness Companion
            </footer>
        </div>
    );
}
