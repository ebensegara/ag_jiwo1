"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MessageSquare,
  BookOpen,
  Heart,
  ClipboardList,
  TrendingUp,
  Users,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "AI Chat",
    description:
      "Ngobrol dengan AI Jiwo yang empatik, tersedia 24/7 untuk mendengarkan dan memberi dukungan.",
    color: "from-[#A3B18A] to-[#8a9a75]",
  },
  {
    icon: BookOpen,
    title: "Journal",
    description:
      "Tulis perasaan dan pikiranmu dalam jurnal pribadi yang aman dan terenkripsi.",
    color: "from-[#A9D6E5] to-[#89b6c5]",
  },
  {
    icon: Heart,
    title: "Mood Tracking",
    description:
      "Pantau suasana hatimu setiap hari dan temukan pola emosionalmu.",
    color: "from-[#F4A9A8] to-[#d48988]",
  },
  {
    icon: ClipboardList,
    title: "Self-Screening",
    description:
      "Tes kesehatan mental yang valid untuk memahami kondisimu lebih baik.",
    color: "from-[#A3B18A] to-[#8a9a75]",
  },
  {
    icon: TrendingUp,
    title: "Insights",
    description:
      "Dapatkan wawasan mendalam tentang perjalanan kesehatan mentalmu.",
    color: "from-[#A9D6E5] to-[#89b6c5]",
  },
  {
    icon: Users,
    title: "Professional Marketplace",
    description:
      "Terhubung dengan psikolog dan terapis profesional yang tepat untukmu.",
    color: "from-[#F4A9A8] to-[#d48988]",
  },
];

export default function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 px-6 bg-[#FAF7F0]">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#e6542d] mb-4">
            Fitur Lengkap untuk Kesejahteraanmu
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Semua yang kamu butuhkan untuk merawat kesehatan mental dalam satu
            platform
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white">
                <CardHeader>
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-gray-800">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <a
            href="#"
            className="inline-flex items-center text-lg font-semibold text-[#A3B18A] hover:text-[#8a9a75] transition-colors group"
          >
            Lihat Semua Fitur
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
