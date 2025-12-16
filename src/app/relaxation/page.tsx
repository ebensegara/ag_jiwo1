"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, Volume2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const MUSIC_TRACKS = [
  {
    id: "pantai",
    title: "Pantai",
    subtitle: "Beach Waves",
    file: "pantai.mp3",
    color: "from-blue-400/20 to-cyan-400/20",
  },
  {
    id: "hutan",
    title: "Hutan",
    subtitle: "Forest Surround",
    file: "hutan.mp3",
    color: "from-green-400/20 to-emerald-400/20",
  },
  {
    id: "alam",
    title: "Suasana Alam",
    subtitle: "Nature Atmosphere",
    file: "alam.mp3",
    color: "from-teal-400/20 to-green-400/20",
  },
  {
    id: "bali",
    title: "Tradisional Bali",
    subtitle: "Bali Gamelan Soft",
    file: "bali.mp3",
    color: "from-orange-400/20 to-amber-400/20",
  },
];

type BreathPhase = "inhale" | "hold" | "exhale" | "idle";

export default function RelaxationPage() {
  const [breathPhase, setBreathPhase] = useState<BreathPhase>("idle");
  const [isBreathing, setIsBreathing] = useState(false);
  const [phaseText, setPhaseText] = useState("Tekan Mulai untuk Bernapas");
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const breathTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isBreathing) {
      runBreathingCycle();
    } else {
      if (breathTimerRef.current) {
        clearTimeout(breathTimerRef.current);
      }
      setBreathPhase("idle");
      setPhaseText("Tekan Mulai untuk Bernapas");
    }

    return () => {
      if (breathTimerRef.current) {
        clearTimeout(breathTimerRef.current);
      }
    };
  }, [isBreathing]);

  const runBreathingCycle = () => {
    setBreathPhase("inhale");
    setPhaseText("Tarik Napas – 4 detik");

    breathTimerRef.current = setTimeout(() => {
      setBreathPhase("hold");
      setPhaseText("Tahan – 7 detik");

      breathTimerRef.current = setTimeout(() => {
        setBreathPhase("exhale");
        setPhaseText("Buang Napas – 8 detik");

        breathTimerRef.current = setTimeout(() => {
          if (isBreathing) {
            runBreathingCycle();
          }
        }, 8000);
      }, 7000);
    }, 4000);
  };

  const toggleBreathing = () => {
    setIsBreathing(!isBreathing);
  };

  const playMusic = async (trackId: string, file: string) => {
    try {
      if (currentTrack === trackId && isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
        return;
      }

      const { data } = await supabase.storage
        .from("internal_app")
        .createSignedUrl(`music_relaxation/${file}`, 3600);

      if (data?.signedUrl) {
        if (audioRef.current) {
          audioRef.current.pause();
        }

        const audio = new Audio(data.signedUrl);
        audio.loop = true;
        audioRef.current = audio;

        audio.addEventListener("timeupdate", () => {
          if (audio.duration) {
            setAudioProgress((audio.currentTime / audio.duration) * 100);
          }
        });

        await audio.play();
        setCurrentTrack(trackId);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error playing music:", error);
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const getCircleScale = () => {
    switch (breathPhase) {
      case "inhale":
        return "scale-150";
      case "hold":
        return "scale-150";
      case "exhale":
        return "scale-100";
      default:
        return "scale-100";
    }
  };

  const getCircleTransition = () => {
    switch (breathPhase) {
      case "inhale":
        return "transition-all duration-[4000ms] ease-in-out";
      case "hold":
        return "transition-none";
      case "exhale":
        return "transition-all duration-[8000ms] ease-in-out";
      default:
        return "transition-all duration-1000 ease-in-out";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e8e6e3] to-[#756657] flex flex-col items-center justify-start px-4 py-8 overflow-y-auto">
      {/* Header */}
      <div className="text-center mb-12 mt-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
          Tenangkan Pikiranmu
        </h1>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto">
          Teknik napas 4-7-8 + musik terapi untuk meredakan kecemasan.
        </p>
      </div>

      {/* Breathing Animation Circle */}
      <div className="mb-12 flex flex-col items-center">
        <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center mb-8">
          <div
            className={`absolute w-48 h-48 md:w-56 md:h-56 rounded-full bg-white/40 backdrop-blur-sm shadow-2xl ${getCircleScale()} ${getCircleTransition()}`}
            style={{
              boxShadow: breathPhase !== "idle" 
                ? "0 0 60px rgba(117, 102, 87, 0.4), 0 0 120px rgba(117, 102, 87, 0.2)"
                : "0 20px 60px rgba(0, 0, 0, 0.15)",
            }}
          />
          <div className="absolute text-center z-10">
            <p className="text-xl md:text-2xl font-semibold text-gray-800">
              {phaseText}
            </p>
          </div>
        </div>

        {/* Start/Stop Button */}
        <Button
          onClick={toggleBreathing}
          size="lg"
          className="px-8 py-6 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          {isBreathing ? "Berhenti" : "Mulai"}
        </Button>
      </div>

      {/* Music Section */}
      <div className="w-full max-w-4xl mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-8">
          Pilih Suasana Hati
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MUSIC_TRACKS.map((track) => (
            <Card
              key={track.id}
              className={`cursor-pointer transition-all hover:shadow-xl hover:scale-105 border-2 ${
                currentTrack === track.id
                  ? "border-gray-700 shadow-lg"
                  : "border-transparent"
              }`}
              onClick={() => playMusic(track.id, track.file)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {track.title}
                    </h3>
                    <p className="text-sm text-gray-600">{track.subtitle}</p>
                  </div>
                  <div
                    className={`p-3 rounded-full bg-gradient-to-br ${track.color}`}
                  >
                    {currentTrack === track.id && isPlaying ? (
                      <Pause className="h-6 w-6 text-gray-700" />
                    ) : (
                      <Play className="h-6 w-6 text-gray-700" />
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {currentTrack === track.id && (
                  <div className="w-full bg-gray-300 rounded-full h-2 mt-3">
                    <div
                      className="bg-gray-700 h-2 rounded-full transition-all"
                      style={{ width: `${audioProgress}%` }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Global Play/Pause Control */}
        {currentTrack && (
          <div className="mt-6 flex justify-center">
            <Button
              onClick={togglePlayPause}
              variant="outline"
              size="lg"
              className="rounded-full px-6"
            >
              <Volume2 className="h-5 w-5 mr-2" />
              {isPlaying ? "Jeda Musik" : "Lanjutkan Musik"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
