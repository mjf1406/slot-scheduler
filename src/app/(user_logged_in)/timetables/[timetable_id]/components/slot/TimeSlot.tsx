"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "~/components/ui/button";
import { Trash2, Edit, Minus, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { Slot } from "~/server/db/types";

// Define the Zod schema
const editFormSchema = z.object({
  day: z.string().min(1, { message: "Day is required" }),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Invalid time format. Use HH:MM",
  }),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Invalid time format. Use HH:MM",
  }),
});

type EditFormValues = z.infer<typeof editFormSchema>;

interface TimeSlotProps {
  slot: Slot;
  onDeleteSlot: (id: string) => void;
  onEditSlot: (updatedSlot: Slot) => void;
  getSlotStyle: (slot: Slot) => React.CSSProperties;
  calculateDuration: (start_time: string, end_time: string) => string;
  timetableDays: string[];
}

export const TimeSlot: React.FC<TimeSlotProps> = ({
  slot,
  onDeleteSlot,
  onEditSlot,
  getSlotStyle,
  calculateDuration,
  timetableDays,
}) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      day: slot.day,
      start_time: slot.start_time,
      end_time: slot.end_time,
    },
  });

  const onSubmit = async (data: EditFormValues) => {
    setIsSubmitting(true);
    try {
      const updatedSlot: Slot = {
        ...slot,
        day: data.day,
        start_time: data.start_time,
        end_time: data.end_time,
      };
      onEditSlot(updatedSlot);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error updating slot:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      form
        .handleSubmit(onSubmit)()
        .catch((error) => {
          console.error("Error submitting form:", error);
        });
    }
  };

  const adjustDuration = (factor: number) => {
    const start = new Date(`2000-01-01T${form.getValues("start_time")}`);
    const end = new Date(`2000-01-01T${form.getValues("end_time")}`);
    const durationMs = end.getTime() - start.getTime();
    const newDurationMs = durationMs * factor;
    const newEnd = new Date(start.getTime() + newDurationMs);

    // Ensure the new end time doesn't exceed midnight
    const adjustedEnd =
      newEnd.getTime() > start.getTime() + 24 * 60 * 60 * 1000
        ? new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1000) // Set to 23:59:59
        : newEnd;

    const newEndTime = adjustedEnd.toTimeString().slice(0, 5);

    form.setValue("end_time", newEndTime);
  };

  return (
    <div
      key={slot.slot_id}
      className="absolute left-1 right-1 flex flex-col justify-between overflow-hidden rounded bg-accent/20 p-1"
      style={getSlotStyle(slot)}
    >
      <div className="text-4xs font-semibold md:text-xs">
        {slot.start_time} - {slot.end_time}
      </div>
      <div className="flex items-end justify-between">
        <span className="text-4xs md:text-xs">
          {calculateDuration(slot.start_time, slot.end_time)}
        </span>
        <div className="flex">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-3 w-3 text-blue-500 hover:text-blue-700 md:h-4 md:w-4"
              >
                <Edit className="h-2 w-2 md:h-4 md:w-4" />
                <span className="sr-only">Edit slot</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Time Slot</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                  onKeyDown={handleKeyDown}
                >
                  <FormField
                    control={form.control}
                    name="day"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Day</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a day" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {timetableDays.map((day) => (
                              <SelectItem key={day} value={day}>
                                {day}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="start_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <Input {...field} type="time" placeholder="HH:MM" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="end_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <FormControl>
                          <Input {...field} type="time" placeholder="HH:MM" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => adjustDuration(0.5)}
                      title="Halve duration"
                    >
                      <Minus className="mr-2 h-4 w-4" />
                      Halve duration
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => adjustDuration(2)}
                      title="Double duration"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Double duration
                    </Button>
                  </div>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save changes"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          <Button
            variant="ghost"
            size="icon"
            className="ml-1 h-3 w-3 text-red-500 hover:text-red-700 md:h-4 md:w-4"
            onClick={() => onDeleteSlot(slot.slot_id)}
          >
            <Trash2 className="h-2 w-2 md:h-4 md:w-4" />
            <span className="sr-only">Delete slot</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
