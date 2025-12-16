'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Heart, Calendar, CheckCircle } from 'lucide-react';
import { supabase, getSafeUser } from "@/lib/supabase";
import { useToast } from '@/components/ui/use-toast';

const moodEmojis = [
  { value: 1, emoji: '😢', label: 'Very Sad', color: 'text-red-500' },
  { value: 2, emoji: '😔', label: 'Sad', color: 'text-orange-500' },
  { value: 3, emoji: '😐', label: 'Neutral', color: 'text-yellow-500' },
  { value: 4, emoji: '😊', label: 'Happy', color: 'text-green-500' },
  { value: 5, emoji: '😄', label: 'Very Happy', color: 'text-blue-500' },
];

export default function MoodCheckin() {
  const [selectedMood, setSelectedMood] = useState<number>(3);
  const [moodNote, setMoodNote] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSliderChange = (value: number[]) => {
    setSelectedMood(value[0]);
  };

  const handleEmojiSelect = (value: number) => {
    setSelectedMood(value);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const user = await getSafeUser();
      if (!user) throw new Error('Not authenticated');

      const currentMood = moodEmojis.find(mood => Math.round(selectedMood) === mood.value);
      
      const { error } = await supabase
        .from('moods')
        .insert([
          {
            user_id: user.id,
            mood_value: selectedMood,
            mood_label: currentMood?.label || 'Neutral',
            note: moodNote || null,
          },
        ]);

      if (error) throw error;

      toast({
        title: 'Mood Recorded!',
        description: 'Your mood has been saved successfully.',
      });

      setIsSubmitted(true);
      
      setTimeout(() => {
        setIsSubmitted(false);
        setMoodNote('');
        setSelectedMood(3);
      }, 2000);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save mood',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const currentMood = moodEmojis.find(mood => Math.round(selectedMood) === mood.value);

  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="mb-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Mood Recorded!</h2>
            <p className="text-muted-foreground">
              Thank you for checking in. Your mood has been saved.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Heart className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2">How are you feeling today?</h1>
        <p className="text-muted-foreground">
          Take a moment to reflect on your current emotional state
        </p>
      </div>

      {/* Current Date */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </CardContent>
      </Card>

      {/* Mood Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Your Mood</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Emoji Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Choose an emoji that represents your mood:</Label>
            <div className="flex justify-center space-x-4">
              {moodEmojis.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => handleEmojiSelect(mood.value)}
                  className={`flex flex-col items-center p-3 rounded-lg transition-all ${
                    Math.round(selectedMood) === mood.value
                      ? 'bg-primary/10 border-2 border-primary scale-110'
                      : 'hover:bg-muted border-2 border-transparent'
                  }`}
                >
                  <span className="text-3xl mb-1">{mood.emoji}</span>
                  <span className={`text-xs font-medium ${mood.color}`}>
                    {mood.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Slider */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Fine-tune your mood (1-5):
            </Label>
            <div className="px-3">
              <Slider
                value={[selectedMood]}
                onValueChange={handleSliderChange}
                max={5}
                min={1}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Very Sad</span>
                <span>Neutral</span>
                <span>Very Happy</span>
              </div>
            </div>
          </div>

          {/* Current Selection Display */}
          {currentMood && (
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-4xl mb-2">{currentMood.emoji}</div>
              <div className={`font-semibold ${currentMood.color}`}>
                {currentMood.label}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {selectedMood.toFixed(1)}/5.0
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Optional Note */}
      <Card>
        <CardHeader>
          <CardTitle>Add a Note (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="What's on your mind? Share any thoughts about your current mood..."
            value={moodNote}
            onChange={(e) => setMoodNote(e.target.value)}
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button 
        onClick={handleSubmit}
        className="w-full py-6 text-lg"
        size="lg"
        disabled={isLoading}
      >
        {isLoading ? 'Saving...' : 'Record My Mood'}
      </Button>
    </div>
  );
}