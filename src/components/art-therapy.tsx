'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Bell, ArrowLeft, ArrowRight, Menu } from 'lucide-react';

interface ArtTherapyProps {
  onNavigate?: (tab: string) => void;
}

const featuredActivities = [
  {
    id: 1,
    title: 'Expressive Painting',
    description: 'Unleash your emotions through vibrant color and form.',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&q=80',
  },
  {
    id: 2,
    title: 'Mindful Sculpting',
    description: 'Ground yourself by shaping clay into tangible forms.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80',
  },
  {
    id: 3,
    title: 'Watercolor Meditation',
    description: 'Find peace and focus in the gentle flow of watercolor.',
    image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&q=80',
  },
];

const artForms = [
  { id: 1, name: 'Painting', image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=300&q=80' },
  { id: 2, name: 'Sculpture', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&q=80' },
  { id: 3, name: 'Drawing', image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&q=80' },
  { id: 4, name: 'Collage', image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&q=80' },
  { id: 5, name: 'Mixed Media', image: 'https://images.unsplash.com/photo-1596548438137-d51ea5c83ca4?w=300&q=80' },
];

const tabs = [
  { id: 'art-forms', label: 'Art Forms', active: true },
  { id: 'themes', label: 'Themes', active: false },
  { id: 'goals', label: 'Therapeutic Goals', active: false },
];

export default function ArtTherapy({ onNavigate }: ArtTherapyProps) {
  const [activeTab, setActiveTab] = useState('art-forms');

  const handleBeginActivity = (activityTitle: string) => {
    alert(`Starting ${activityTitle}. This would typically open a guided art therapy session.`);
  };

  const handleArtFormClick = (artForm: string) => {
    alert(`Exploring ${artForm} activities. This would show specific exercises for this art form.`);
  };

  const handleStartJourney = () => {
    alert('Starting your art therapy journey! This would typically open an onboarding flow.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-10 w-full bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onNavigate?.('professionals')}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors md:hidden"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-white">
              <Heart className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Jiwo.AI</h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => onNavigate?.('chat')}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              AI Companion
            </button>
            <button 
              onClick={() => onNavigate?.('professionals')}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Professionals
            </button>
            <span className="text-sm font-medium text-primary">Art Therapy</span>
            <a className="text-sm font-medium hover:text-primary transition-colors" href="#">
              Resources
            </a>
          </nav>
          
          <div className="flex items-center gap-4">
            <button className="flex items-center justify-center rounded-full h-10 w-10 bg-gray-100 dark:bg-gray-800 hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white font-semibold">A</span>
            </div>
            <button className="md:hidden flex items-center justify-center rounded-full h-10 w-10 bg-gray-100 dark:bg-gray-800">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-12">
          {/* Hero Section */}
          <section className="text-center">
            <h2 className="text-4xl font-extrabold tracking-tight text-gray-800 dark:text-white sm:text-5xl md:text-6xl">
              Discover Through <span className="text-primary">Art</span>
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
              Explore creative expression as a path to mindfulness, healing, and self-discovery. Our guided activities are designed to inspire you, no matter your skill level.
            </p>
          </section>

          {/* Featured Activities */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Featured Activities</h3>
              <a className="text-sm font-medium text-primary hover:underline" href="#">View All</a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredActivities.map((activity) => (
                <Card 
                  key={activity.id}
                  className="group flex flex-col gap-4 bg-white/70 dark:bg-black/70 backdrop-blur-sm shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  <div 
                    className="w-full aspect-video bg-cover bg-center rounded-lg overflow-hidden"
                    style={{ backgroundImage: `url("${activity.image}")` }}
                  />
                  <CardContent className="p-4 flex flex-col flex-grow">
                    <div className="flex-grow">
                      <h4 className="text-lg font-bold text-gray-800 dark:text-white">{activity.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{activity.description}</p>
                    </div>
                    <Button
                      onClick={() => handleBeginActivity(activity.title)}
                      className="mt-4 w-full bg-primary text-white py-2.5 text-sm font-semibold shadow-sm transition-opacity group-hover:opacity-100 md:opacity-0 focus:opacity-100 hover:bg-primary/90"
                    >
                      Begin Activity
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Explore By Category */}
          <section>
            <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Explore By Category</h3>
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav aria-label="Tabs" className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
            <div className="py-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {artForms.map((artForm) => (
                <div 
                  key={artForm.id}
                  className="flex flex-col items-center gap-3 group cursor-pointer"
                  onClick={() => handleArtFormClick(artForm.name)}
                >
                  <div 
                    className="w-full aspect-square bg-cover bg-center rounded-lg transition-transform group-hover:scale-105"
                    style={{ backgroundImage: `url("${artForm.image}")` }}
                  />
                  <p className="text-sm font-medium text-gray-800 dark:text-white group-hover:text-primary transition-colors">
                    {artForm.name}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Materials & Benefits */}
          <section>
            <Card className="bg-white/70 dark:bg-black/70 backdrop-blur-sm p-8 grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Materials & Benefits</h3>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Each activity details the needed supplies, from simple pencils to specialized tools. We also outline the potential emotional benefits, like stress reduction and improved self-awareness, to help you choose what's right for you.
                </p>
                <Button
                  onClick={handleStartJourney}
                  className="mt-6 inline-flex items-center gap-2 bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
                >
                  <span>Start Your Journey</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className="aspect-[4/5] bg-cover bg-center rounded-lg"
                  style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&q=80")' }}
                />
                <div 
                  className="aspect-[4/5] bg-cover bg-center rounded-lg"
                  style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80")' }}
                />
              </div>
            </Card>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/30 dark:bg-black/30 backdrop-blur-sm mt-16 border-t border-white/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">© 2024 Jiwo.AI. All rights reserved.</p>
            <div className="flex gap-6">
              <a className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary" href="#">Terms</a>
              <a className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary" href="#">Privacy</a>
              <a className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary" href="#">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}