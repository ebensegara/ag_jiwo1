'use client';

import { useState } from 'react';
import { Heart, Bell, Search, Play } from 'lucide-react';

interface YogaStudioProps {
  onNavigate?: (tab: string) => void;
}

export default function YogaStudio({ onNavigate }: YogaStudioProps) {
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  const handlePlayVideo = (videoId: string) => {
    setPlayingVideo(videoId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f6f3] via-white to-[#f1ede8] dark:from-[#1b1918] dark:via-[#1f1d1a] dark:to-[#1b1918] font-['Lexend',sans-serif]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#e6e2df]/80 dark:bg-[#1a1817]/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 text-[#765567]">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path clipRule="evenodd" d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z" fill="currentColor" fillRule="evenodd"></path>
                </svg>
              </div>
              <h1 className="text-xl font-bold text-[#3b3430] dark:text-[#d1ccc8]">Jiwo.AI</h1>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a className="text-sm font-medium hover:text-[#765567] transition-colors" href="#">Home</a>
              <a className="text-sm font-medium hover:text-[#765567] transition-colors" href="#">AI Companion</a>
              <a className="text-sm font-medium hover:text-[#765567] transition-colors" href="#">Community</a>
              <a className="text-sm font-medium hover:text-[#765567] transition-colors" href="#">Resources</a>
            </nav>
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-full hover:bg-[#edeae8] dark:hover:bg-[#2c2826] transition-colors">
                <Bell className="h-6 w-6 text-[#3b3430] dark:text-[#d1ccc8]" />
              </button>
              <div className="w-10 h-10 rounded-full bg-cover bg-center" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAbBBQXsaXcsQ9oU7-7zMuyOBFONLafwoRvFjcMt2ihMdPzYOmfB5wdFJ19rkn_axOV8Xj3pIHuu60IS9abzxhKX4BLPP0tKl-6LwSsIj6gDRtA8j79Hs6-aMGTgF0diNlkVnE3gXNrYmXhYQHcvWzxa1XMwEufju3wxY023mjXtQHghWMmJQkCI0Ud9VtbYpT513Ll28RpmLGDMstkgxTjub5u-qCXrGAjrOaFaFPXg5UybmA62CBgAO-Fr5Xldm2nKyGa1Ddv300')"}}></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 flex-grow">
        <div className="max-w-5xl mx-auto">
          <header className="mb-12 text-center">
            <h2 className="text-5xl font-bold text-[#3b3430] dark:text-[#d1ccc8] mb-4">Yoga untuk Kesehatan Mental</h2>
            <p className="text-lg text-[#3b3430]/80 dark:text-[#d1ccc8]/80 max-w-3xl mx-auto">Yoga bukan hanya tentang kelenturan fisik, tetapi sangat powerful untuk menenangkan pikiran dan mengelola emosi.</p>
          </header>

          {/* Filter Section */}
          <div className="mb-12 p-4 bg-[#edeae8]/50 dark:bg-[#2c2826]/50 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#3b3430] dark:text-[#d1ccc8] mb-1" htmlFor="search-yoga">Cari Kelas</label>
                <div className="relative">
                  <input className="w-full pl-10 pr-4 py-2 rounded-md bg-[#edeae8] dark:bg-[#2c2826] border-transparent focus:border-[#765567] focus:ring-[#765567] transition" id="search-yoga" name="search-yoga" placeholder="Cari nama kelas, instruktur..." type="text"/>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 text-[#3b3430]/60 dark:text-[#d1ccc8]/60" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3b3430] dark:text-[#d1ccc8] mb-1" htmlFor="yoga-type">Jenis Yoga</label>
                <select className="w-full py-2 px-3 rounded-md bg-[#edeae8] dark:bg-[#2c2826] border-transparent focus:border-[#765567] focus:ring-[#765567] transition" id="yoga-type" name="yoga-type">
                  <option>Semua</option>
                  <option>Yin</option>
                  <option>Restorative</option>
                  <option>Hatha</option>
                  <option>Kundalini</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3b3430] dark:text-[#d1ccc8] mb-1" htmlFor="duration">Durasi</label>
                <select className="w-full py-2 px-3 rounded-md bg-[#edeae8] dark:bg-[#2c2826] border-transparent focus:border-[#765567] focus:ring-[#765567] transition" id="duration" name="duration">
                  <option>Semua</option>
                  <option>&lt; 15 menit</option>
                  <option>15-30 menit</option>
                  <option>30-60 menit</option>
                  <option>&gt; 60 menit</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3b3430] dark:text-[#d1ccc8] mb-1" htmlFor="benefit">Manfaat</label>
                <select className="w-full py-2 px-3 rounded-md bg-[#edeae8] dark:bg-[#2c2826] border-transparent focus:border-[#765567] focus:ring-[#765567] transition" id="benefit" name="benefit">
                  <option>Semua</option>
                  <option>Kecemasan</option>
                  <option>Stres</option>
                  <option>Tidur</option>
                  <option>Fokus</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-16">
            {/* Kelas dengan Elemen Tambahan */}
            <section>
              <h3 className="text-3xl font-bold mb-8 text-center text-[#765567]">Kelas dengan Elemen Tambahan untuk Relaksasi Mendalam</h3>
              <div className="space-y-8">
                <div className="bg-[#edeae8] dark:bg-[#2c2826] rounded-lg p-6 shadow-lg flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-full md:w-1/3 aspect-video rounded-lg overflow-hidden relative group">
                    <img alt="Yoga with Singing Bowl" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAt_ahO-fW7pLSFICHHdjzaRcFjEINHqRfL75cZk3qT2eHScM91BsB1pK7r4ghoPdYOCTyuWieJviQYUoa9UD02KfmKEwfFQz40MMM54jXaELWQiRjklMbes50P1fFQKXcYRC67F44M3OWYLOAi8D35DDdFook8ivLWwz_F1X4E1UD4uR8PyvxdoTBGQs12aMT2O4-5C57tmIoQEamG9iEzwxgKQqbYgA1KRXMkjjBUKdcJOTIIdhd6m_jJGc4Zsq4V9sTEcufuJ-Y"/>
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => alert('Video akan tersedia segera')}
                        className="w-16 h-16 rounded-full bg-[#765567]/80 flex items-center justify-center hover:bg-[#765567] transition-colors"
                      >
                        <Play className="text-white w-8 h-8 ml-1" />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-2xl font-bold mb-4 text-[#3b3430] dark:text-[#d1ccc8]">Yoga dengan Terapi Singing Bowl</h4>
                    <p className="font-semibold mb-2">Apa itu?</p>
                    <p className="mb-4 text-[#3b3430]/90 dark:text-[#d1ccc8]/90">Sesi yoga yang menggabungkan gerakan lembut dengan getaran suara dari singing bowl. Getaran ini membantu merilekskan sistem saraf secara mendalam.</p>
                    <p className="font-semibold mb-2">Manfaat untuk Mental:</p>
                    <ul className="list-disc list-inside text-[#3b3430]/90 dark:text-[#d1ccc8]/90 space-y-1">
                      <li>Mengurangi stres dan kecemasan secara signifikan.</li>
                      <li>Meningkatkan kualitas tidur.</li>
                      <li>Membantu mencapai kondisi meditasi yang lebih dalam.</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-[#edeae8] dark:bg-[#2c2826] rounded-lg p-6 shadow-lg flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-full md:w-1/3 aspect-video rounded-lg overflow-hidden relative group">
                    <img alt="Yoga Nidra" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNXLNUrOuxP8n19_aX-6WjQ5s7BH-qQmxGsZ73JgOpEE6sOj79u_jbyUvCT8zSfJY3-fGCP-eCIddE7sfONUHSJWEJxU9OfVFBhUtesSOynPHqOe0YSRhZl1q9FLfBTS95wYPN8z2puP-4I2YQFGa3NaaM9JEHsnpHm8Ow4dzYLfPNwPfNgCr7SzUsjbZlvhFca7esRL-OPBSLpF1v-Ig0xcMdBco0dRoOePXIdT2PN6dcgKvKz1lKyLDK_bcrjpyHNLK1L9IAlJ8"/>
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => alert('Video akan tersedia segera')}
                        className="w-16 h-16 rounded-full bg-[#765567]/80 flex items-center justify-center hover:bg-[#765567] transition-colors"
                      >
                        <Play className="text-white w-8 h-8 ml-1" />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-2xl font-bold mb-4 text-[#3b3430] dark:text-[#d1ccc8]">Yoga Nidra (Yoga Tidur)</h4>
                    <p className="font-semibold mb-2">Apa itu?</p>
                    <p className="mb-4 text-[#3b3430]/90 dark:text-[#d1ccc8]/90">Meditasi terpandu yang membawa Anda ke kondisi relaksasi mendalam, di antara sadar dan tidur. Dilakukan dalam posisi berbaring nyaman.</p>
                    <p className="font-semibold mb-2">Manfaat untuk Mental:</p>
                    <ul className="list-disc list-inside text-[#3b3430]/90 dark:text-[#d1ccc8]/90 space-y-1">
                      <li>Memulihkan kelelahan mental dan fisik.</li>
                      <li>Meredakan ketegangan dan kecemasan kronis.</li>
                      <li>Meningkatkan kesadaran diri dan kejernihan pikiran.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Kelas Berdasarkan Jenis Gerakan */}
            <section>
              <h3 className="text-3xl font-bold mb-8 text-center text-[#765567]">Kelas Berdasarkan Jenis Gerakan</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-[#edeae8] dark:bg-[#2c2826] rounded-lg p-6 shadow-lg">
                  <div className="w-full aspect-video rounded-lg overflow-hidden relative group mb-4">
                    <img alt="Yin Yoga" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCa7gxW1M8hIMmEpr9LUB58QQTgBkaMGRz__oBqvHNz9S76XavkKX5UxC7DaCsxvU8GY2xixEvYpANgjbFAL49woEV8CPDvxhI_y-tF_C8uXMYIu5fzf9JXx3PbIJyDblumU5-E6ZqZSrqohwffqkjJeWwtw3Z9B-ALJ9H1LPrrRWZljqfecEjtvg48-JxKzY5X9lQONBOKJAsUdZQRWTY3csVKShlIHR_3cq6lliWPBr3rDBnKVelAlunlHieVz1F3aUXk-r9PUJw"/>
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-12 h-12 rounded-full bg-[#765567]/80 flex items-center justify-center">
                        <Play className="text-white w-6 h-6 ml-1" />
                      </button>
                    </div>
                  </div>
                  <h4 className="text-xl font-bold mb-3">Yin Yoga</h4>
                  <p className="mb-4 text-sm text-[#3b3430]/90 dark:text-[#d1ccc8]/90">Praktik pasif di mana pose ditahan lebih lama (3-5 menit) untuk menargetkan jaringan ikat dalam tubuh. Mengajarkan kesabaran dan membantu melepaskan emosi yang terpendam.</p>
                </div>

                <div className="bg-[#edeae8] dark:bg-[#2c2826] rounded-lg p-6 shadow-lg">
                  <div className="w-full aspect-video rounded-lg overflow-hidden relative group mb-4">
                    <img alt="Restorative Yoga" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBb1faVUeOrLvuwwooYUEM_jx0O8-ZhBCTrdgG77TDtCBsfjr9SlL9OKILmC-Em7f5nDcXBiZRyYXkm7xl4z2m7e94WwKh_47fOyOQ1HToW1WDsWOQx7oZxu1-BIUsO95qOFhWwHziy4jRK15QkAXnXYfJFXpY66Y3EGZ7zsMK_AV2fvBeRpRRDOZBPVfwfwqXkU5iccRd_KMzfm6PJRhIjYG4W3vrfDnUNDXY0eTXyft1vJaXOPLG4mi3lF1uVqhFKTDG0e1ONUyg"/>
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-12 h-12 rounded-full bg-[#765567]/80 flex items-center justify-center">
                        <Play className="text-white w-6 h-6 ml-1" />
                      </button>
                    </div>
                  </div>
                  <h4 className="text-xl font-bold mb-3">Restorative Yoga</h4>
                  <p className="mb-4 text-sm text-[#3b3430]/90 dark:text-[#d1ccc8]/90">Fokus pada relaksasi total dengan dukungan alat bantu, memungkinkan tubuh untuk beristirahat dan pulih. Menenangkan sistem saraf dan mengurangi gejala burnout.</p>
                </div>

                <div className="bg-[#edeae8] dark:bg-[#2c2826] rounded-lg p-6 shadow-lg">
                  <div className="w-full aspect-video rounded-lg overflow-hidden relative group mb-4">
                    <img alt="Hatha Yoga" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDaPZ0Jsh3mLvZjhqHep0nRkmnACoPaHFZk19V_YyYngBfrxciek4AYkkL57sB6E3Z5Ainm0eGCv6Neaumt_Kx2iyP5U0XNsAoBi_7fyLKoNGXtbpklEb-2tWxRgJmJBRYAPTcYap9fzkrelsQQWC_NSrI9Gn-X7jZc4Wt3pKOj4m2KWVQ6v8hqUqrzfqURDOFeB17VZzHmwqegv9kT2MP5DGn4devELIqMkZDZmk_pNnO-4vPxL6Ns4ux3w20gdHwcGx-m_BYbw-U"/>
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-12 h-12 rounded-full bg-[#765567]/80 flex items-center justify-center">
                        <Play className="text-white w-6 h-6 ml-1" />
                      </button>
                    </div>
                  </div>
                  <h4 className="text-xl font-bold mb-3">Hatha Yoga (Klasik)</h4>
                  <p className="mb-4 text-sm text-[#3b3430]/90 dark:text-[#d1ccc8]/90">Pendekatan yang lebih lambat dan fokus pada dasar-dasar pose dan pernapasan untuk menciptakan keseimbangan. Meningkatkan fokus dan konsentrasi.</p>
                </div>

                <div className="bg-[#edeae8] dark:bg-[#2c2826] rounded-lg p-6 shadow-lg">
                  <div className="w-full aspect-video rounded-lg overflow-hidden relative group mb-4">
                    <img alt="Kundalini Yoga" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_lWO0nUo4zhtDkz8qMoiZSH5J8AE3K41n5-iHVYmzSxYq5LCAVa8tbgo3zlx6AfzsjhrpV-ywIc3MciMhj7RfxqDW3M2kwxGXTeE4k5O01JSHI0eB_OwbhE8ScWQLpsnSkYm6bz84-Ig0YRJ04LEiVuKtIjla2fTvM3eB_7MHKiM_RpJolqY3jNrldSD3Xxx-pm2QIQzM5Y9eH_XfKQB_mr57EbrmrpZEPVmWKHTKbOIeTZklL2ISuz6XXRuVzwJ3NGD44oNvaEE"/>
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-12 h-12 rounded-full bg-[#765567]/80 flex items-center justify-center">
                        <Play className="text-white w-6 h-6 ml-1" />
                      </button>
                    </div>
                  </div>
                  <h4 className="text-xl font-bold mb-3">Kundalini Yoga</h4>
                  <p className="mb-4 text-sm text-[#3b3430]/90 dark:text-[#d1ccc8]/90">Praktik dinamis yang menggabungkan gerakan, teknik pernapasan, dan meditasi. Membangkitkan energi dan membantu mengatasi pola pikir negatif.</p>
                </div>
              </div>
            </section>

            {/* Kelas untuk Kondisi Khusus */}
            <section>
              <h3 className="text-3xl font-bold mb-8 text-center text-[#765567]">Kelas untuk Kondisi Khusus</h3>
              <div className="space-y-8">
                <div className="bg-[#edeae8] dark:bg-[#2c2826] rounded-lg p-6 shadow-lg flex flex-col md:flex-row-reverse gap-6 items-start">
                  <div className="w-full md:w-1/3 aspect-video rounded-lg overflow-hidden relative group">
                    <img alt="Postnatal Yoga" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2pEgm115zhfBV45nrWGhSxOooZR5L8Q95VdkEdFJVqRgu4Jk7rrqVGQpS_ePkJkD17l4gggMAPoN1yfcoiCsN_Dv4Dz5OphmLJ_ZIMyt1JrPnYjNTxTazpooAiZh6cIO9-AGui_ViK7rb51bmTnigz1h_1aQXRvTVTQz_U6XWscIpGfuy_h7BQf-WrQBO04hrIRBzlSNHZszIebvCbK3P0GT3PWymTE4NEQRs5vOiv7aM3uVuwidcSEDukCfTEttUzRQPjL3eaug"/>
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => alert('Video akan tersedia segera')}
                        className="w-16 h-16 rounded-full bg-[#765567]/80 flex items-center justify-center hover:bg-[#765567] transition-colors"
                      >
                        <Play className="text-white w-8 h-8 ml-1" />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-2xl font-bold mb-4 text-[#3b3430] dark:text-[#d1ccc8]">Yoga Postnatal (Setelah Melahirkan)</h4>
                    <p className="mb-4 text-[#3b3430]/90 dark:text-[#d1ccc8]/90">Yoga lembut dirancang untuk membantu pemulihan fisik dan emosional ibu. Membantu mengatasi baby blues dan memberikan waktu untuk merawat diri.</p>
                  </div>
                </div>

                <div className="bg-[#edeae8] dark:bg-[#2c2826] rounded-lg p-6 shadow-lg flex flex-col md:flex-row-reverse gap-6 items-start">
                  <div className="w-full md:w-1/3 aspect-video rounded-lg overflow-hidden relative group">
                    <img alt="Trauma-Informed Yoga" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB25RJGuXbSnfm6BxWWoJFdQfEsBKaTPZ8KxuP5QqGbg0lWXV_-p4Q74QfjIr3geItdAydMaDt6vgNjdqFIbXwzfsZSDM3NEeb9Ipz_L7RuJiSxaflQAiXXP-zPQOEGCsjBbF5BEbxglAlRwYlOULQ-30IvIxnKfXsxVfuNoAeKV6VjqUdRsffEIQOQCvEVeX7zy5kmZNqfRkF3ij00CCQ4Ve6hsjcrAiZ3akwBei2ClQyjXPnx3Mo3XwlzUht9Y5tn16UqSrecmB4"/>
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => alert('Video akan tersedia segera')}
                        className="w-16 h-16 rounded-full bg-[#765567]/80 flex items-center justify-center hover:bg-[#765567] transition-colors"
                      >
                        <Play className="text-white w-8 h-8 ml-1" />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-2xl font-bold mb-4 text-[#3b3430] dark:text-[#d1ccc8]">Yoga untuk Trauma</h4>
                    <p className="mb-4 text-[#3b3430]/90 dark:text-[#d1ccc8]/90">Pendekatan hati-hati di mana peserta didorong untuk membuat pilihan sendiri. Menciptakan rasa aman dan mengembalikan kendali atas diri sendiri.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Tips Section */}
          <div className="mt-16 pt-12 border-t border-[#3b3430]/20 dark:border-[#d1ccc8]/20">
            <div className="grid md:grid-cols-2 gap-8 text-center">
              <div className="bg-[#edeae8]/50 dark:bg-[#2c2826]/50 rounded-lg p-6">
                <h4 className="font-bold text-xl mb-3 text-[#765567]">Dengarkan Tubuh Anda</h4>
                <p className="text-[#3b3430]/80 dark:text-[#d1ccc8]/80">Setiap tubuh berbeda. Jangan memaksakan diri. Jika sebuah pose terasa sakit, berhentilah. Hormati batasan Anda setiap hari.</p>
              </div>
              <div className="bg-[#edeae8]/50 dark:bg-[#2c2826]/50 rounded-lg p-6">
                <h4 className="font-bold text-xl mb-3 text-[#765567]">Mulai dari yang Lembut</h4>
                <p className="text-[#3b3430]/80 dark:text-[#d1ccc8]/80">Jika Anda baru atau merasa tidak enak badan, mulailah dengan kelas yang lebih lambat seperti Hatha atau Restorative. Konsistensi lebih penting daripada intensitas.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#e6e2df]/50 dark:bg-[#1a1817]/50 mt-16">
        <div className="container mx-auto px-6 py-8 text-center text-[#3b3430]/70 dark:text-[#d1ccc8]/70">
          <p>© 2024 Jiwo.AI. All rights reserved.</p>
          <p className="text-sm mt-2">Find your peace, find your strength, find your Jiwo.</p>
        </div>
      </footer>
    </div>
  );
}