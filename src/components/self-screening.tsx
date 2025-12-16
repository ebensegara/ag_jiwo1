'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Heart, Bell, ArrowLeft, Brain, Briefcase, Lightbulb, Send, Bot, User } from 'lucide-react';
import { supabase, getSafeUser } from "@/lib/supabase";
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// CSS Styles for chat UI
const chatStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes bounce {
    0%, 60%, 100% {
      transform: translateY(0);
    }
    30% {
      transform: translateY(-4px);
    }
  }

  .chat-message {
    animation: fadeInUp 0.4s ease-out forwards;
  }

  .chat-bubble-bot {
    background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,253,250,0.95) 100%);
    border-radius: 0 18px 18px 18px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  }

  .chat-bubble-user {
    background: linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%);
    border-radius: 18px 18px 0 18px;
    box-shadow: 0 2px 12px rgba(14,165,233,0.3);
  }

  .quick-reply-btn {
    background: rgba(255,255,255,0.9);
    border: 2px solid transparent;
    border-radius: 24px;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 500;
    color: #0f766e;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }

  .quick-reply-btn:hover {
    background: linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(14,165,233,0.3);
  }

  .quick-reply-btn.selected {
    background: linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%);
    color: white;
    border-color: transparent;
  }

  .typing-indicator {
    display: flex;
    gap: 4px;
    padding: 12px 16px;
  }

  .typing-dot {
    width: 8px;
    height: 8px;
    background: #14b8a6;
    border-radius: 50%;
    animation: bounce 1.4s infinite;
  }

  .typing-dot:nth-child(2) {
    animation-delay: 0.2s;
  }

  .typing-dot:nth-child(3) {
    animation-delay: 0.4s;
  }

  .gradient-bg {
    background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #14b8a6 100%);
    min-height: 100vh;
  }
`;

interface SelfScreeningProps {
  onNavigate?: (tab: string) => void;
}

const mentalHealthQuestions = [
  {
    id: 'q1',
    text: 'Seberapa sering Anda merasa sedih, depresi, atau putus asa dalam dua minggu terakhir?',
    number: 1,
  },
  {
    id: 'q2',
    text: 'Seberapa sering Anda mengalami kesulitan tidur, sering terbangun, atau tidur terlalu banyak?',
    number: 2,
  },
  {
    id: 'q3',
    text: 'Seberapa sering Anda merasa lelah atau kurang energi?',
    number: 3,
  },
  {
    id: 'q4',
    text: 'Seberapa sering Anda mengalami nafsu makan berkurang atau makan berlebihan?',
    number: 4,
  },
  {
    id: 'q5',
    text: 'Seberapa sering Anda kesulitan berkonsentrasi pada hal-hal seperti membaca atau menonton televisi?',
    number: 5,
  },
];

const personalityQuestions = [
  // E vs I
  { id: 'p1', text: 'Saya lebih suka menghabiskan waktu dengan banyak orang daripada sendirian', dimension: 'EI', direction: 'E' },
  { id: 'p2', text: 'Saya merasa energi saya terisi kembali setelah berinteraksi dengan orang lain', dimension: 'EI', direction: 'E' },
  { id: 'p3', text: 'Saya lebih suka merenung dan berpikir dalam diri sendiri', dimension: 'EI', direction: 'I' },
  { id: 'p4', text: 'Saya merasa nyaman bekerja sendiri dalam waktu lama', dimension: 'EI', direction: 'I' },

  // S vs N
  { id: 'p5', text: 'Saya lebih fokus pada fakta dan detail konkret', dimension: 'SN', direction: 'S' },
  { id: 'p6', text: 'Saya lebih suka mengikuti prosedur yang sudah terbukti', dimension: 'SN', direction: 'S' },
  { id: 'p7', text: 'Saya sering memikirkan kemungkinan dan pola di masa depan', dimension: 'SN', direction: 'N' },
  { id: 'p8', text: 'Saya lebih tertarik pada konsep abstrak dan teori', dimension: 'SN', direction: 'N' },

  // T vs F
  { id: 'p9', text: 'Saya membuat keputusan berdasarkan logika dan analisis objektif', dimension: 'TF', direction: 'T' },
  { id: 'p10', text: 'Saya lebih menghargai keadilan daripada harmoni', dimension: 'TF', direction: 'T' },
  { id: 'p11', text: 'Saya mempertimbangkan perasaan orang lain saat membuat keputusan', dimension: 'TF', direction: 'F' },
  { id: 'p12', text: 'Saya lebih suka menjaga harmoni dalam hubungan', dimension: 'TF', direction: 'F' },

  // J vs P
  { id: 'p13', text: 'Saya suka membuat rencana dan mengikuti jadwal', dimension: 'JP', direction: 'J' },
  { id: 'p14', text: 'Saya merasa nyaman dengan struktur dan organisasi', dimension: 'JP', direction: 'J' },
  { id: 'p15', text: 'Saya lebih suka tetap fleksibel dan spontan', dimension: 'JP', direction: 'P' },
  { id: 'p16', text: 'Saya nyaman dengan ketidakpastian dan perubahan', dimension: 'JP', direction: 'P' },
];

const personalityOptions = [
  { value: '1', label: 'Sangat Tidak Setuju' },
  { value: '2', label: 'Tidak Setuju' },
  { value: '3', label: 'Netral' },
  { value: '4', label: 'Setuju' },
  { value: '5', label: 'Sangat Setuju' },
];

const mentalHealthOptions = [
  { value: '0', label: 'Tidak sama sekali' },
  { value: '1', label: 'Beberapa hari' },
  { value: '2', label: 'Lebih dari setengah hari' },
  { value: '3', label: 'Hampir setiap hari' },
];

const mbtiProfiles: Record<string, any> = {
  INTJ: {
    name: 'The Architect',
    description: 'Pemikir strategis dengan visi jangka panjang',
    strengths: ['Analitis', 'Independen', 'Visioner', 'Strategis'],
    careers: ['Software Engineer', 'Data Scientist', 'Strategic Planner', 'Research Scientist', 'Investment Analyst'],
    lifeAdvice: 'Kembangkan keterampilan interpersonal dan fleksibilitas. Jangan terlalu perfeksionis.'
  },
  INTP: {
    name: 'The Logician',
    description: 'Pemikir inovatif yang suka memecahkan masalah kompleks',
    strengths: ['Logis', 'Kreatif', 'Objektif', 'Analitis'],
    careers: ['Programmer', 'Mathematician', 'Philosopher', 'Architect', 'Professor'],
    lifeAdvice: 'Praktikkan menyelesaikan proyek hingga tuntas. Kembangkan keterampilan sosial.'
  },
  ENTJ: {
    name: 'The Commander',
    description: 'Pemimpin alami yang berani dan tegas',
    strengths: ['Leadership', 'Strategis', 'Efisien', 'Percaya Diri'],
    careers: ['CEO', 'Business Manager', 'Lawyer', 'Entrepreneur', 'Management Consultant'],
    lifeAdvice: 'Dengarkan perspektif orang lain. Kembangkan empati dan kesabaran.'
  },
  ENTP: {
    name: 'The Debater',
    description: 'Inovator yang cerdas dan penuh ide',
    strengths: ['Inovatif', 'Energik', 'Cerdas', 'Adaptif'],
    careers: ['Entrepreneur', 'Marketing Director', 'Inventor', 'Consultant', 'Journalist'],
    lifeAdvice: 'Fokus pada eksekusi ide. Kembangkan konsistensi dan follow-through.'
  },
  INFJ: {
    name: 'The Advocate',
    description: 'Idealis yang penuh inspirasi dan prinsip',
    strengths: ['Empatik', 'Kreatif', 'Idealis', 'Organized'],
    careers: ['Counselor', 'Psychologist', 'Writer', 'HR Manager', 'Social Worker'],
    lifeAdvice: 'Jaga boundaries pribadi. Jangan terlalu keras pada diri sendiri.'
  },
  INFP: {
    name: 'The Mediator',
    description: 'Idealis yang kreatif dan penuh empati',
    strengths: ['Kreatif', 'Empatik', 'Idealis', 'Fleksibel'],
    careers: ['Writer', 'Artist', 'Therapist', 'Teacher', 'Designer'],
    lifeAdvice: 'Praktikkan pengambilan keputusan yang tegas. Jangan terlalu sensitif terhadap kritik.'
  },
  ENFJ: {
    name: 'The Protagonist',
    description: 'Pemimpin karismatik yang menginspirasi',
    strengths: ['Karismatik', 'Empatik', 'Organized', 'Inspiring'],
    careers: ['Teacher', 'HR Director', 'Coach', 'Public Relations', 'Event Coordinator'],
    lifeAdvice: 'Prioritaskan kebutuhan diri sendiri. Jangan terlalu people-pleasing.'
  },
  ENFP: {
    name: 'The Campaigner',
    description: 'Antusias, kreatif, dan sosial',
    strengths: ['Antusias', 'Kreatif', 'Sosial', 'Optimis'],
    careers: ['Marketing', 'Journalist', 'Actor', 'Entrepreneur', 'Counselor'],
    lifeAdvice: 'Kembangkan fokus dan disiplin. Selesaikan proyek sebelum memulai yang baru.'
  },
  ISTJ: {
    name: 'The Logistician',
    description: 'Praktis, faktual, dan dapat diandalkan',
    strengths: ['Reliable', 'Praktis', 'Detail-oriented', 'Organized'],
    careers: ['Accountant', 'Auditor', 'Project Manager', 'Military Officer', 'Administrator'],
    lifeAdvice: 'Buka diri terhadap perubahan. Kembangkan fleksibilitas dan kreativitas.'
  },
  ISFJ: {
    name: 'The Defender',
    description: 'Protektif, hangat, dan bertanggung jawab',
    strengths: ['Supportive', 'Reliable', 'Patient', 'Practical'],
    careers: ['Nurse', 'Teacher', 'Administrator', 'Social Worker', 'Librarian'],
    lifeAdvice: 'Belajar mengatakan tidak. Prioritaskan kebutuhan diri sendiri.'
  },
  ESTJ: {
    name: 'The Executive',
    description: 'Organizer yang efisien dan praktis',
    strengths: ['Organized', 'Practical', 'Direct', 'Loyal'],
    careers: ['Manager', 'Administrator', 'Judge', 'Military Officer', 'Business Analyst'],
    lifeAdvice: 'Kembangkan fleksibilitas. Dengarkan perspektif yang berbeda.'
  },
  ESFJ: {
    name: 'The Consul',
    description: 'Peduli, kooperatif, dan populer',
    strengths: ['Caring', 'Social', 'Organized', 'Loyal'],
    careers: ['Teacher', 'Nurse', 'Event Planner', 'HR Manager', 'Receptionist'],
    lifeAdvice: 'Jangan terlalu bergantung pada validasi orang lain. Kembangkan independensi.'
  },
  ISTP: {
    name: 'The Virtuoso',
    description: 'Praktis dan suka eksplorasi hands-on',
    strengths: ['Practical', 'Flexible', 'Logical', 'Hands-on'],
    careers: ['Engineer', 'Mechanic', 'Pilot', 'Forensic Scientist', 'Athlete'],
    lifeAdvice: 'Kembangkan keterampilan komunikasi. Ekspresikan emosi lebih terbuka.'
  },
  ISFP: {
    name: 'The Adventurer',
    description: 'Artistik, fleksibel, dan charming',
    strengths: ['Artistic', 'Flexible', 'Charming', 'Sensitive'],
    careers: ['Artist', 'Designer', 'Musician', 'Chef', 'Veterinarian'],
    lifeAdvice: 'Kembangkan perencanaan jangka panjang. Jangan terlalu impulsif.'
  },
  ESTP: {
    name: 'The Entrepreneur',
    description: 'Energik, spontan, dan pragmatis',
    strengths: ['Energetic', 'Pragmatic', 'Bold', 'Sociable'],
    careers: ['Entrepreneur', 'Sales', 'Paramedic', 'Detective', 'Marketing'],
    lifeAdvice: 'Pikirkan konsekuensi jangka panjang. Kembangkan kesabaran.'
  },
  ESFP: {
    name: 'The Entertainer',
    description: 'Spontan, energik, dan antusias',
    strengths: ['Enthusiastic', 'Friendly', 'Spontaneous', 'Practical'],
    careers: ['Entertainer', 'Event Planner', 'Sales', 'Teacher', 'Social Worker'],
    lifeAdvice: 'Kembangkan perencanaan finansial. Fokus pada tujuan jangka panjang.'
  },
};

export default function SelfScreening({ onNavigate }: SelfScreeningProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('mental-health');
  const [isLoading, setIsLoading] = useState(false);

  // Mental Health State
  const [mentalAnswers, setMentalAnswers] = useState<Record<string, string>>({});
  const [mentalSubmitted, setMentalSubmitted] = useState(false);
  const [mentalScore, setMentalScore] = useState<number | null>(null);

  // Personality Test State
  const [personalityAnswers, setPersonalityAnswers] = useState<Record<string, string>>({});
  const [personalitySubmitted, setPersonalitySubmitted] = useState(false);
  const [mbtiType, setMbtiType] = useState<string | null>(null);

  // Chat UI state (declared here so it's available in all render paths)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [chatMessages, setChatMessages] = useState<Array<{ type: 'bot' | 'user', text: string, options?: typeof mentalHealthOptions }>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const handleMentalAnswerChange = (questionId: string, value: string) => {
    setMentalAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handlePersonalityAnswerChange = (questionId: string, value: string) => {
    setPersonalityAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const calculateMBTI = () => {
    const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

    personalityQuestions.forEach(q => {
      const answer = parseInt(personalityAnswers[q.id] || '3');
      const score = answer - 3; // Convert to -2 to +2 scale

      if (q.direction === 'E' || q.direction === 'I') {
        if (q.direction === 'E') scores.E += score;
        else scores.I += score;
      } else if (q.direction === 'S' || q.direction === 'N') {
        if (q.direction === 'S') scores.S += score;
        else scores.N += score;
      } else if (q.direction === 'T' || q.direction === 'F') {
        if (q.direction === 'T') scores.T += score;
        else scores.F += score;
      } else if (q.direction === 'J' || q.direction === 'P') {
        if (q.direction === 'J') scores.J += score;
        else scores.P += score;
      }
    });

    const type =
      (scores.E >= scores.I ? 'E' : 'I') +
      (scores.S >= scores.N ? 'S' : 'N') +
      (scores.T >= scores.F ? 'T' : 'F') +
      (scores.J >= scores.P ? 'J' : 'P');

    return type;
  };

  const handleMentalSubmit = async () => {
    try {
      const user = await getSafeUser();
      if (!user) throw new Error("Not authenticated");

      const totalScore = Object.values(mentalAnswers).reduce((sum, value) => sum + parseInt(value || '0'), 0);

      const { error } = await supabase.from("screenings").insert([
        {
          user_id: user.id,
          screening_type: 'mental_health',
          score: totalScore,
          responses: mentalAnswers,
          severity_level: totalScore <= 4 ? 'minimal' : totalScore <= 9 ? 'mild' : totalScore <= 14 ? 'moderate' : 'severe'
        },
      ]);

      if (error) throw error;

      setMentalScore(totalScore);
      setMentalSubmitted(true);

      toast({
        title: "Penilaian Selesai",
        description: "Hasil Anda telah disimpan.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menyimpan hasil",
        variant: "destructive",
      });
    }
  };

  const handlePersonalitySubmit = async () => {
    try {
      const user = await getSafeUser();
      if (!user) throw new Error("Not authenticated");

      const type = calculateMBTI();

      const { error } = await supabase.from("screenings").insert([
        {
          user_id: user.id,
          screening_type: 'personality',
          responses: personalityAnswers,
          result_data: { mbti_type: type }
        },
      ]);

      if (error) throw error;

      setMbtiType(type);
      setPersonalitySubmitted(true);

      toast({
        title: "Test Selesai",
        description: "Hasil personality test Anda telah disimpan.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menyimpan hasil",
        variant: "destructive",
      });
    }
  };

  const getScoreInterpretation = () => {
    const totalScore = Object.values(mentalAnswers).reduce((sum, value) => sum + parseInt(value || '0'), 0);

    if (totalScore <= 4) return {
      level: 'Minimal',
      color: 'text-green-600',
      description: 'Respons Anda menunjukkan gejala minimal.',
      recommendation: 'Anda dalam kondisi baik! Pertahankan kesehatan mental Anda dengan:',
      suggestions: [
        'Life Coaching untuk pengembangan diri',
        'Yoga Studio untuk relaksasi',
        'Art Therapy untuk ekspresi kreatif'
      ]
    };
    if (totalScore <= 9) return {
      level: 'Ringan',
      color: 'text-yellow-600',
      description: 'Respons Anda menunjukkan gejala ringan.',
      recommendation: 'Anda mungkin mengalami stres ringan. Disarankan untuk:',
      suggestions: [
        'Life Coaching untuk dukungan emosional',
        'Yoga Studio untuk mengurangi stres',
        'Art Therapy untuk healing kreatif',
        'Konsultasi dengan Psikolog jika gejala berlanjut'
      ]
    };
    if (totalScore <= 14) return {
      level: 'Sedang',
      color: 'text-orange-600',
      description: 'Respons Anda menunjukkan gejala sedang.',
      recommendation: 'Kami sangat menyarankan Anda untuk:',
      suggestions: [
        'Konsultasi dengan Psikolog untuk terapi',
        'Life Coaching sebagai dukungan tambahan',
        'Yoga dan Art Therapy sebagai terapi komplementer'
      ]
    };
    return {
      level: 'Berat',
      color: 'text-red-600',
      description: 'Respons Anda menunjukkan gejala yang signifikan.',
      recommendation: 'Segera konsultasi dengan profesional:',
      suggestions: [
        'Psikiater untuk evaluasi medis dan pengobatan',
        'Psikolog untuk terapi intensif',
        'Dukungan keluarga dan teman terdekat'
      ]
    };
  };

  // Derived values for chat UI
  const currentQuestions = activeTab === 'mental-health' ? mentalHealthQuestions : personalityQuestions;
  const currentOptions = activeTab === 'mental-health' ? mentalHealthOptions : personalityOptions;
  const currentAnswers = activeTab === 'mental-health' ? mentalAnswers : personalityAnswers;

  // Get current question options if not yet answered
  const currentQuestion = currentQuestions[currentQuestionIndex];
  const isCurrentQuestionAnswered = currentQuestion && currentAnswers[currentQuestion.id];

  // Initialize chat with first question
  useEffect(() => {
    if (chatMessages.length === 0) {
      const greeting = activeTab === 'mental-health'
        ? "Halo! 👋 Aku Jiwo, teman virtual kamu. Yuk, kita ngobrol santai tentang kondisi mental kamu akhir-akhir ini. Tenang aja, jawabanmu aman kok~ 💙"
        : "Hai! 🌟 Sekarang kita mau explore kepribadian kamu nih! Jawab pertanyaan berikut sesuai dengan diri kamu ya~";

      setIsTyping(true);
      setTimeout(() => {
        setChatMessages([{ type: 'bot', text: greeting }]);
        setIsTyping(false);

        // Add first question after greeting
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            setChatMessages(prev => [...prev, {
              type: 'bot',
              text: currentQuestions[0].text,
              options: currentOptions
            }]);
            setIsTyping(false);
          }, 800);
        }, 500);
      }, 1000);
    }
  }, [activeTab]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, isTyping]);

  const handleQuickReply = (questionId: string, value: string, label: string) => {
    // Add user message
    setChatMessages(prev => [...prev, { type: 'user', text: label }]);

    // Update answer
    if (activeTab === 'mental-health') {
      handleMentalAnswerChange(questionId, value);
    } else {
      handlePersonalityAnswerChange(questionId, value);
    }

    // Move to next question or submit
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < currentQuestions.length) {
      setCurrentQuestionIndex(nextIndex);
      setIsTyping(true);

      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          type: 'bot',
          text: currentQuestions[nextIndex].text,
          options: currentOptions
        }]);
        setIsTyping(false);
      }, 1000);
    } else {
      // All questions answered, show completion message
      setIsTyping(true);
      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          type: 'bot',
          text: "Makasih udah jawab semua pertanyaannya! 🎉 Tekan tombol di bawah untuk lihat hasilnya ya~"
        }]);
        setIsTyping(false);
      }, 800);
    }
  };

  const resetChat = () => {
    setChatMessages([]);
    setCurrentQuestionIndex(0);
    if (activeTab === 'mental-health') {
      setMentalAnswers({});
    } else {
      setPersonalityAnswers({});
    }
  };

  const allMentalQuestionsAnswered = mentalHealthQuestions.every(q => mentalAnswers[q.id]);
  const allPersonalityQuestionsAnswered = personalityQuestions.every(q => personalityAnswers[q.id]);

  // Mental Health Results
  if (mentalSubmitted && activeTab === 'mental-health') {
    const interpretation = getScoreInterpretation();
    return (
      <>
        <style>{chatStyles}</style>
        <div className="gradient-bg min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-10 bg-white/10 backdrop-blur-md border-b border-white/20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onNavigate?.('dashboard')}
                    className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div className="h-10 w-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                    <Heart className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-white">Hasil Screening</h1>
                    <p className="text-xs text-white/70">Mental Health 💙</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Result Card */}
              <div className="chat-message">
                <div className="bg-white/95 backdrop-blur rounded-3xl p-6 shadow-xl">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Heart className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      Yeay, selesai! 🎉
                    </h2>
                    <p className="text-gray-600">
                      Makasih udah cerita sama Jiwo~
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-cyan-50 to-teal-50 rounded-2xl p-5 mb-5">
                    <h3 className="text-sm font-medium text-teal-700 mb-2">Hasil Kamu</h3>
                    <p className={`text-2xl font-bold ${interpretation.color} mb-2`}>
                      Gejala {interpretation.level}
                    </p>
                    <p className="text-sm text-gray-600">
                      {interpretation.description}
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-5 mb-5">
                    <h3 className="text-sm font-medium text-blue-700 mb-3">
                      {interpretation.recommendation}
                    </h3>
                    <div className="space-y-2">
                      {interpretation.suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-teal-500 mt-0.5">✦</span>
                          <span>{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-2xl p-4 mb-6">
                    <p className="text-sm text-orange-800">
                      <span className="font-medium">📝 Catatan:</span> Ini bukan diagnosis medis ya. Kalau kamu butuh dukungan lebih, yuk konsultasi sama profesional!
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setMentalSubmitted(false);
                        setChatMessages([]);
                        setCurrentQuestionIndex(0);
                        setPersonalityAnswers({});
                        setActiveTab('personality');
                      }}
                      className="w-full py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold rounded-2xl hover:opacity-90 transition-all shadow-lg"
                    >
                      Lanjut Personality Test 🌟
                    </button>
                    <button
                      onClick={() => onNavigate?.('professionals')}
                      className="w-full py-3 bg-white border-2 border-teal-200 text-teal-600 font-semibold rounded-2xl hover:bg-teal-50 transition-all"
                    >
                      Cari Profesional
                    </button>
                    <button
                      onClick={() => onNavigate?.('dashboard')}
                      className="w-full py-3 text-teal-600 font-medium hover:bg-white/50 rounded-2xl transition-all"
                    >
                      Kembali ke Dashboard
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </>
    );
  }

  // Personality Test Results
  if (personalitySubmitted && mbtiType && activeTab === 'personality') {
    const profile = mbtiProfiles[mbtiType];
    return (
      <>
        <style>{chatStyles}</style>
        <div className="gradient-bg min-h-screen pb-8">
          {/* Header */}
          <header className="sticky top-0 z-10 bg-white/10 backdrop-blur-md border-b border-white/20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onNavigate?.('dashboard')}
                    className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div className="h-10 w-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-white">Hasil Personality</h1>
                    <p className="text-xs text-white/70">MBTI Test 🌟</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Result Card */}
              <div className="chat-message">
                <div className="bg-white/95 backdrop-blur rounded-3xl p-6 shadow-xl">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <span className="text-2xl font-bold text-white">{mbtiType}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-1">
                      {profile.name}
                    </h2>
                    <p className="text-gray-600">
                      {profile.description}
                    </p>
                  </div>

                  {/* Strengths */}
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5 mb-5">
                    <h3 className="text-sm font-medium text-teal-700 mb-3 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Kekuatan Kamu
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.strengths.map((strength: string, index: number) => (
                        <span key={index} className="px-3 py-1.5 bg-white/80 text-teal-700 rounded-full text-sm font-medium shadow-sm">
                          {strength}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Career Recommendations */}
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-5 mb-5">
                    <h3 className="text-sm font-medium text-blue-700 mb-3 flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Karir yang Cocok
                    </h3>
                    <div className="space-y-2">
                      {profile.careers.map((career: string, index: number) => (
                        <div key={index} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-cyan-500 mt-0.5">✦</span>
                          <span>{career}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Life Advice */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 mb-5">
                    <h3 className="text-sm font-medium text-purple-700 mb-2">
                      💡 Tips Pengembangan Diri
                    </h3>
                    <p className="text-sm text-gray-700">
                      {profile.lifeAdvice}
                    </p>
                  </div>

                  <div className="bg-amber-50 rounded-2xl p-4 mb-6">
                    <p className="text-sm text-amber-800">
                      <span className="font-medium">� Catatan:</span> Hasil ini berdasarkan teori MBTI. Gunakan sebagai panduan eksplorasi diri, bukan label permanen~
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => onNavigate?.('professionals')}
                      className="w-full py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold rounded-2xl hover:opacity-90 transition-all shadow-lg"
                    >
                      Konsultasi Life Coach 🎯
                    </button>
                    <button
                      onClick={() => {
                        setPersonalitySubmitted(false);
                        setChatMessages([]);
                        setCurrentQuestionIndex(0);
                        setMentalAnswers({});
                        setActiveTab('mental-health');
                      }}
                      className="w-full py-3 bg-white border-2 border-teal-200 text-teal-600 font-semibold rounded-2xl hover:bg-teal-50 transition-all"
                    >
                      Kembali ke Mental Health
                    </button>
                    <button
                      onClick={() => onNavigate?.('dashboard')}
                      className="w-full py-3 text-teal-600 font-medium hover:bg-white/50 rounded-2xl transition-all"
                    >
                      Kembali ke Dashboard
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{chatStyles}</style>
      <div className="gradient-bg min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/10 backdrop-blur-md border-b border-white/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onNavigate?.('dashboard')}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="h-10 w-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Jiwo AI</h1>
                  <p className="text-xs text-white/70">Online • Siap membantu 💙</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={resetChat}
                  className="px-3 py-1.5 rounded-full bg-white/20 text-white text-sm font-medium hover:bg-white/30 transition-colors"
                >
                  Mulai Ulang
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Switcher */}
        <div className="container mx-auto px-4 pt-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-2 bg-white/10 backdrop-blur rounded-full p-1">
              <button
                onClick={() => { setActiveTab('mental-health'); resetChat(); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-sm font-medium transition-all ${activeTab === 'mental-health'
                  ? 'bg-white text-teal-600 shadow-lg'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
              >
                <Heart className="h-4 w-4" />
                Mental Health
              </button>
              <button
                onClick={() => { setActiveTab('personality'); resetChat(); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-sm font-medium transition-all ${activeTab === 'personality'
                  ? 'bg-white text-teal-600 shadow-lg'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
              >
                <Brain className="h-4 w-4" />
                Personality
              </button>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <main className="container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto">
            {/* Chat Messages */}
            <div
              ref={chatContainerRef}
              className="h-[calc(100vh-320px)] overflow-y-auto space-y-4 px-2 pb-4"
              style={{ scrollBehavior: 'smooth' }}
            >
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`chat-message flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {msg.type === 'bot' && (
                    <div className="flex items-start gap-2 max-w-[85%]">
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="chat-bubble-bot px-4 py-3 text-gray-800">
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                        </div>

                        {/* Quick Reply Options */}
                        {msg.options && index === chatMessages.length - 1 && !isCurrentQuestionAnswered && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {msg.options.map((option) => (
                              <button
                                key={option.value}
                                onClick={() => handleQuickReply(currentQuestion.id, option.value, option.label)}
                                className="quick-reply-btn"
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {msg.type === 'user' && (
                    <div className="flex items-start gap-2 max-w-[85%]">
                      <div className="chat-bubble-user px-4 py-3">
                        <p className="text-sm text-white leading-relaxed">{msg.text}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/30 backdrop-blur flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="chat-message flex justify-start">
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="chat-bubble-bot">
                      <div className="typing-indicator">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Progress & Submit */}
            <div className="mt-4 space-y-3">
              {/* Progress Bar */}
              <div className="bg-white/20 backdrop-blur rounded-full p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/80">Progress</span>
                  <span className="text-sm font-medium text-white">
                    {Object.keys(currentAnswers).length} / {currentQuestions.length}
                  </span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${(Object.keys(currentAnswers).length / currentQuestions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Submit Button */}
              {(activeTab === 'mental-health' ? allMentalQuestionsAnswered : allPersonalityQuestionsAnswered) && (
                <button
                  onClick={activeTab === 'mental-health' ? handleMentalSubmit : handlePersonalitySubmit}
                  className="w-full py-4 bg-white text-teal-600 font-bold rounded-2xl hover:bg-white/90 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <span>Lihat Hasil</span>
                  <Send className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}