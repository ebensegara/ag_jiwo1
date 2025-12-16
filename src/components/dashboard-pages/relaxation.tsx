"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, Volume2, Wind } from "lucide-react";

const MUSIC_TRACKS = [
  {
    id: "pantai",
    title: "Pantai",
    subtitle: "Beach Waves",
    url: "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3",
    color: "from-blue-400/20 to-cyan-400/20",
  },
  {
    id: "hutan",
    title: "Hutan",
    subtitle: "Forest Surround",
    url: "https://cdn.pixabay.com/audio/2022/03/10/audio_4e3f1b6b29.mp3",
    color: "from-green-400/20 to-emerald-400/20",
  },
  {
    id: "alam",
    title: "Suasana Alam",
    subtitle: "Nature Atmosphere",
    url: "https://cdn.pixabay.com/audio/2022/03/15/audio_c610232532.mp3",
    color: "from-teal-400/20 to-green-400/20",
  },
  {
    id: "bali",
    title: "Tradisional Bali",
    subtitle: "Bali Gamelan Soft",
    url: "https://cdn.pixabay.com/audio/2023/10/30/audio_c20e2c5f3f.mp3",
    color: "from-orange-400/20 to-amber-400/20",
  },
];

type BreathPhase = "inhale" | "hold" | "exhale" | "idle";

export default function Relaxation() {
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

  const playMusic = async (trackId: string, url: string) => {
    try {
      if (currentTrack === trackId && isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
        return;
      }

      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(url);
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
    <Card className="bg-gradient-to-b from-[#e8e6e3] to-[#756657] border-none">
      <CardContent className="p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Wind className="h-6 w-6 text-gray-800" />
            <h2 className="text-2xl font-bold text-gray-800">
              Relaksasi & Pernapasan
            </h2>
          </div>
          <p className="text-sm text-gray-700">
            Teknik napas 4-7-8 + musik terapi untuk meredakan kecemasan
          </p>
        </div>

        {/* Breathing Animation Circle */}
        <div className="mb-8 flex flex-col items-center">
          <div className="relative w-48 h-48 flex items-center justify-center mb-6">
            <div
              className={`absolute w-32 h-32 rounded-full bg-white/40 backdrop-blur-sm shadow-2xl ${getCircleScale()} ${getCircleTransition()}`}
              style={{
                boxShadow: breathPhase !== "idle" 
                  ? "0 0 60px rgba(117, 102, 87, 0.4), 0 0 120px rgba(117, 102, 87, 0.2)"
                  : "0 20px 60px rgba(0, 0, 0, 0.15)",
              }}
            />
            <div className="absolute text-center z-10">
              <p className="text-base font-semibold text-gray-800">
                {phaseText}
              </p>
            </div>
          </div>

          {/* Start/Stop Button */}
          <Button
            onClick={toggleBreathing}
            size="lg"
            className="px-6 py-4 rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            {isBreathing ? "Berhenti" : "Mulai"}
          </Button>
        </div>

        {/* Music Section */}
        <div className="w-full">
          <h3 className="text-lg font-bold text-gray-800 text-center mb-4">
            Pilih Suasana Hati
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {MUSIC_TRACKS.map((track) => (
              <Card
                key={track.id}
                className={`cursor-pointer transition-all hover:shadow-xl hover:scale-105 border-2 ${
                  currentTrack === track.id
                    ? "border-gray-700 shadow-lg"
                    : "border-transparent"
                }`}
                onClick={() => playMusic(track.id, track.url)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800">
                        {track.title}
                      </h4>
                      <p className="text-xs text-gray-600">{track.subtitle}</p>
                    </div>
                    <div
                      className={`p-2 rounded-full bg-gradient-to-br ${track.color}`}
                    >
                      {currentTrack === track.id && isPlaying ? (
                        <Pause className="h-4 w-4 text-gray-700" />
                      ) : (
                        <Play className="h-4 w-4 text-gray-700" />
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {currentTrack === track.id && (
                    <div className="w-full bg-gray-300 rounded-full h-1.5 mt-2">
                      <div
                        className="bg-gray-700 h-1.5 rounded-full transition-all"
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
            <div className="mt-4 flex justify-center">
              <Button
                onClick={togglePlayPause}
                variant="outline"
                size="sm"
                className="rounded-full px-4"
              >
                <Volume2 className="h-4 w-4 mr-2" />
                {isPlaying ? "Jeda Musik" : "Lanjutkan Musik"}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
