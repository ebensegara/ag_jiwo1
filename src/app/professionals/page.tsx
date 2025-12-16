'use client';

import { useState } from 'react';
import ProfessionalList from '@/components/professional-list';
import { Button } from '@/components/ui/button';
import { Brain, Stethoscope, Target, Apple } from 'lucide-react';

export default function ProfessionalsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Professionals', icon: Brain },
    { id: 'Psychologist', label: 'Psychologist', icon: Brain },
    { id: 'Psychiatrist', label: 'Psychiatrist', icon: Stethoscope },
    { id: 'Life Coaching', label: 'Life Coaching', icon: Target },
    { id: 'Nutrition', label: 'Nutrition', icon: Apple },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      {/* Category Filter */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <Icon className="h-4 w-4" />
                  {cat.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Professional List */}
      <ProfessionalList category={selectedCategory} />
    </div>
  );
}