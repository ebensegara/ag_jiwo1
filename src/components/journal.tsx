'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Plus, Edit, Trash2, Calendar, Heart } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase, getSafeUser } from "@/lib/supabase";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood_id: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

const moodOptions = [
  { value: 1, label: 'Very Sad', emoji: '😢', color: 'bg-red-100 text-red-800' },
  { value: 2, label: 'Sad', emoji: '😔', color: 'bg-orange-100 text-orange-800' },
  { value: 3, label: 'Neutral', emoji: '😐', color: 'bg-yellow-100 text-yellow-800' },
  { value: 4, label: 'Happy', emoji: '😊', color: 'bg-green-100 text-green-800' },
  { value: 5, label: 'Very Happy', emoji: '😄', color: 'bg-blue-100 text-blue-800' },
];

export default function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    moodValue: 3,
    tags: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchEntries();
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel('journals_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'journals' },
        () => {
          fetchEntries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchEntries = async () => {
    try {
      const user = await getSafeUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('journals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch journals',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEntry = () => {
    setEditingEntry(null);
    setFormData({
      title: '',
      content: '',
      moodValue: 3,
      tags: '',
    });
    setIsDialogOpen(true);
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setFormData({
      title: entry.title,
      content: entry.content,
      moodValue: 3,
      tags: entry.tags.join(', '),
    });
    setIsDialogOpen(true);
  };

  const handleSaveEntry = async () => {
    try {
      const user = await getSafeUser();
      if (!user) throw new Error('Not authenticated');

      const selectedMood = moodOptions.find(m => m.value === formData.moodValue);
      
      // First create mood entry
      const { data: moodData, error: moodError } = await supabase
        .from('moods')
        .insert([{
          user_id: user.id,
          mood_value: formData.moodValue,
          mood_label: selectedMood?.label || 'Neutral',
        }])
        .select()
        .single();

      if (moodError) throw moodError;

      const entryData = {
        user_id: user.id,
        title: formData.title,
        content: formData.content,
        mood_id: moodData.id,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      };

      if (editingEntry) {
        const { error } = await supabase
          .from('journals')
          .update({ ...entryData, updated_at: new Date().toISOString() })
          .eq('id', editingEntry.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('journals')
          .insert([entryData]);

        if (error) throw error;
      }

      toast({
        title: editingEntry ? 'Entry Updated' : 'Entry Created',
        description: 'Your journal entry has been saved.',
      });

      setIsDialogOpen(false);
      fetchEntries();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save entry',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('journals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Entry Deleted',
        description: 'Your journal entry has been deleted.',
      });

      fetchEntries();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete entry',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center space-x-2">
            <BookOpen className="h-6 w-6" />
            <span>My Journal</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Reflect on your thoughts and track your emotional journey
          </p>
        </div>
        <Button onClick={handleCreateEntry} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>New Entry</span>
        </Button>
      </div>

      {/* Entries List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
              <p className="text-muted-foreground">Loading your journal entries...</p>
            </CardContent>
          </Card>
        ) : entries.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No journal entries yet</h3>
              <p className="text-muted-foreground mb-4">
                Start your journaling journey by creating your first entry
              </p>
              <Button onClick={handleCreateEntry}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Entry
              </Button>
            </CardContent>
          </Card>
        ) : (
          entries.map((entry) => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{entry.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditEntry(entry)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Entry?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your journal entry.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteEntry(entry.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                  {entry.content}
                </p>
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {entry.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? 'Edit Journal Entry' : 'New Journal Entry'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-sm font-medium mb-2 block">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Give your entry a title..."
              />
            </div>
            
            <div>
              <Label htmlFor="mood" className="text-sm font-medium mb-2 block">How are you feeling?</Label>
              <Select
                value={formData.moodValue.toString()}
                onValueChange={(value) => setFormData(prev => ({ ...prev, moodValue: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your mood" />
                </SelectTrigger>
                <SelectContent>
                  {moodOptions.map((mood) => (
                    <SelectItem key={mood.value} value={mood.value.toString()}>
                      <div className="flex items-center space-x-2">
                        <span>{mood.emoji}</span>
                        <span>{mood.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="content" className="text-sm font-medium mb-2 block">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Write about your day, thoughts, or feelings..."
                className="min-h-[150px]"
              />
            </div>

            <div>
              <Label htmlFor="tags" className="text-sm font-medium mb-2 block">Tags (optional)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="work, gratitude, self-care (separate with commas)"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveEntry}
                disabled={!formData.title.trim() || !formData.content.trim()}
              >
                {editingEntry ? 'Update Entry' : 'Save Entry'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}