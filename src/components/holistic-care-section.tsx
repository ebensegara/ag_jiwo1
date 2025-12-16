"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";

const services = [
  {
    name: "Yoga",
    description:
      "Latihan fisik dan pernapasan untuk keseimbangan tubuh dan pikiran",
    image:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80",
  },
  {
    name: "Reiki",
    description:
      "Terapi energi untuk relaksasi mendalam dan penyembuhan holistik",
    image:
      "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400&q=80",
  },
  {
    name: "Art Therapy",
    description: "Ekspresikan diri melalui seni untuk kesehatan emosional",
    image:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80",
  },
  {
    name: "Hypnotherapy",
    description:
      "Terapi hipnosis untuk mengatasi trauma, kecemasan, dan mengubah pola pikir negatif",
    image:
      "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&q=80",
  },
];

export default function HolisticCareSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 px-6 bg-[#FAF7F0]">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#e6542d] mb-6">
            Perawatan Holistik untuk Jiwa
          </h2>
          <blockquote className="text-2xl text-gray-600 italic max-w-3xl mx-auto mb-4">
            "Kesehatan mental bukan hanya tentang pikiran, tapi juga tentang
            tubuh dan jiwa yang seimbang."
          </blockquote>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Jelajahi berbagai layanan wellness yang dirancang untuk
            kesejahteraan menyeluruh
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <Card className="overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-white group">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <h3 className="absolute bottom-4 left-6 text-3xl font-bold text-white">
                    {service.name}
                  </h3>
                </div>
                <CardContent className="p-6">
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
