"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import {
  Heart,
  BookOpen,
  MessageCircle,
  Users,
  ClipboardList,
  TrendingUp,
  Palette,
  Wind,
} from "lucide-react";
import MoodCheckin from "@/components/mood-checkin";
import Journal from "@/components/journal";
import AIChat from "@/components/ai-chat";
import ProfessionalList from "@/components/professional-list";
import SelfScreening from "@/components/dashboard-pages/self-screening";
import WeeklyInsight from "@/components/dashboard-pages/weekly-insight";
import HolisticCare from "@/components/dashboard-pages/holistic-care";
import ArtTherapy from "@/components/dashboard-pages/art-therapy";
import Relaxation from "@/components/dashboard-pages/relaxation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const pages = [
  {
    id: "mood",
    title: "Mood Check-in",
    icon: Heart,
    component: MoodCheckin,
    bgColor: "bg-[#FFD3BA]", // Bright peach
    activeBg: "bg-[#FF9A76]", // Vibrant coral
    textColor: "text-[#3D3D3D]",
    activeText: "text-white",
  },
  {
    id: "journal",
    title: "Journal",
    icon: BookOpen,
    component: Journal,
    bgColor: "bg-[#C9ADA7]", // Mauve
    activeBg: "bg-[#9A8C98]", // Deep mauve
    textColor: "text-[#3D3D3D]",
    activeText: "text-white",
  },
  {
    id: "chat",
    title: "AI Chat",
    icon: MessageCircle,
    component: AIChat,
    bgColor: "bg-[#FFE5B4]", // Bright cream
    activeBg: "bg-[#FFB84D]", // Golden yellow
    textColor: "text-[#3D3D3D]",
    activeText: "text-[#3D3D3D]",
  },
  {
    id: "relaxation",
    title: "Relaksasi",
    icon: Wind,
    component: Relaxation,
    bgColor: "bg-[#B5D3C3]", // Mint green
    activeBg: "bg-[#7BA896]", // Sage green
    textColor: "text-[#3D3D3D]",
    activeText: "text-white",
  },
  {
    id: "professionals",
    title: "Professionals",
    icon: Users,
    component: () => (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Connect with Professionals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProfessionalList category="all" embedded={true} />
        </CardContent>
      </Card>
    ),
    bgColor: "bg-[#DEB887]", // Burlywood
    activeBg: "bg-[#CD853F]", // Peru
    textColor: "text-[#3D3D3D]",
    activeText: "text-white",
  },
  {
    id: "screening",
    title: "Test Mandiri",
    icon: ClipboardList,
    component: SelfScreening,
    bgColor: "bg-[#F4C2C2]", // Baby pink
    activeBg: "bg-[#D98B8B]", // Rose
    textColor: "text-[#3D3D3D]",
    activeText: "text-white",
  },
  {
    id: "insights",
    title: "Weekly Insights",
    icon: TrendingUp,
    component: WeeklyInsight,
    bgColor: "bg-[#B8C9E3]", // Powder blue
    activeBg: "bg-[#7A9CC6]", // Steel blue
    textColor: "text-[#3D3D3D]",
    activeText: "text-white",
  },
  {
    id: "holistic",
    title: "Holistic Care",
    icon: Heart,
    component: HolisticCare,
    bgColor: "bg-[#E6C8A0]", // Tan
    activeBg: "bg-[#C9A05A]", // Bronze
    textColor: "text-[#3D3D3D]",
    activeText: "text-white",
  },
  {
    id: "art",
    title: "Art Therapy",
    icon: Palette,
    component: ArtTherapy,
    bgColor: "bg-[#E0BBE4]", // Lavender
    activeBg: "bg-[#B695C0]", // Purple
    textColor: "text-[#3D3D3D]",
    activeText: "text-white",
  },
];

export default function DashboardCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    skipSnaps: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi],
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="w-full">
      {/* Navigation Bar */}
      <div className="mb-8 overflow-x-auto pb-3 scrollbar-hide">
        <div className="flex gap-4 min-w-max px-1">
          {pages.map((page, index) => {
            const Icon = page.icon;
            const isActive = selectedIndex === index;
            return (
              <button
                key={page.id}
                onClick={() => scrollTo(index)}
                className={`flex flex-col items-center gap-3 px-8 py-5 rounded-2xl transition-all whitespace-nowrap shadow-lg hover:shadow-xl transform hover:scale-105 min-w-[160px] ${
                  isActive
                    ? `${page.activeBg} ${page.activeText} shadow-2xl scale-105 ring-4 ring-white/50`
                    : `${page.bgColor} ${page.textColor} hover:brightness-95`
                }`}
              >
                <Icon className="h-7 w-7 flex-shrink-0" />
                <span className="text-base font-bold text-center leading-tight">
                  {page.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {pages.map((page) => {
            const Component = page.component;
            return (
              <div key={page.id} className="flex-[0_0_100%] min-w-0">
                <div className="px-1">
                  <Component />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dot Indicators */}
      <div className="flex justify-center gap-3 mt-8">
        {pages.map((page, index) => {
          const isActive = selectedIndex === index;
          return (
            <button
              key={page.id}
              onClick={() => scrollTo(index)}
              className={`h-3 rounded-full transition-all shadow-sm hover:shadow-md ${
                isActive
                  ? `w-12 shadow-lg ${page.activeBg}`
                  : `w-3 hover:brightness-90 ${page.bgColor}`
              }`}
              aria-label={`Go to ${page.title}`}
            />
          );
        })}
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
