"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Clock, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface AvailabilitySlot {
    id: string;
    professional_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_recurring: boolean;
}

interface AvailabilityManagerProps {
    professionalId: string;
}

const DAYS = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

export default function AvailabilityManager({ professionalId }: AvailabilityManagerProps) {
    const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const { toast } = useToast();

    const [newSlot, setNewSlot] = useState({
        day_of_week: 1, // Monday
        start_time: "09:00",
        end_time: "17:00",
    });

    useEffect(() => {
        fetchSlots();
    }, [professionalId]);

    const fetchSlots = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from("availability_slots")
                .select("*")
                .eq("professional_id", professionalId)
                .order("day_of_week", { ascending: true })
                .order("start_time", { ascending: true });

            if (error) throw error;
            setSlots(data || []);
        } catch (error: any) {
            toast({
                title: "Error fetching slots",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddSlot = async () => {
        try {
            setIsAdding(true);
            const { data, error } = await supabase
                .from("availability_slots")
                .insert({
                    professional_id: professionalId,
                    day_of_week: newSlot.day_of_week,
                    start_time: newSlot.start_time,
                    end_time: newSlot.end_time,
                    is_recurring: true,
                })
                .select()
                .single();

            if (error) throw error;

            setSlots([...slots, data].sort((a, b) => {
                if (a.day_of_week !== b.day_of_week) return a.day_of_week - b.day_of_week;
                return a.start_time.localeCompare(b.start_time);
            }));

            toast({
                title: "Slot Added",
                description: "Your availability has been updated.",
            });
        } catch (error: any) {
            toast({
                title: "Error adding slot",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeleteSlot = async (id: string) => {
        try {
            const { error } = await supabase
                .from("availability_slots")
                .delete()
                .eq("id", id);

            if (error) throw error;

            setSlots(slots.filter(s => s.id !== id));
            toast({
                title: "Slot Deleted",
                description: "The availability slot has been removed.",
            });
        } catch (error: any) {
            toast({
                title: "Error deleting slot",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#8B6CFD]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Add Availability Slot
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="space-y-2">
                            <Label>Day of Week</Label>
                            <Select
                                value={newSlot.day_of_week.toString()}
                                onValueChange={(v) => setNewSlot({ ...newSlot, day_of_week: parseInt(v) })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select day" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DAYS.map((day, index) => (
                                        <SelectItem key={index} value={index.toString()}>{day}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Start Time</Label>
                            <input
                                type="time"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={newSlot.start_time}
                                onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>End Time</Label>
                            <input
                                type="time"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={newSlot.end_time}
                                onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
                            />
                        </div>
                        <Button
                            onClick={handleAddSlot}
                            disabled={isAdding}
                            className="bg-[#8B6CFD] hover:bg-[#8B6CFD]/90"
                        >
                            {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Slot"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {slots.length === 0 ? (
                    <p className="col-span-full text-center py-8 text-muted-foreground">
                        No availability slots added yet.
                    </p>
                ) : (
                    slots.map((slot) => (
                        <Card key={slot.id} className="bg-white dark:bg-slate-800">
                            <CardContent className="pt-6">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <p className="font-bold text-[#8B6CFD]">{DAYS[slot.day_of_week]}</p>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <Clock className="h-3 w-3" />
                                            {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        onClick={() => handleDeleteSlot(slot.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
