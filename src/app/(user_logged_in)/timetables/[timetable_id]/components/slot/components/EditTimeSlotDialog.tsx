// components/EditTimeSlotDialog.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "~/components/ui/button";
import { Minus, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

interface EditTimeSlotDialogProps {
  slot: Slot;
  isOpen: boolean;
  onClose: () => void;
  onEditSlot: (updatedSlot: Slot) => void;
  timetableDays: string[];
}

export const EditTimeSlotDialog: React.FC<EditTimeSlotDialogProps> = ({
  slot,
  isOpen,
  onClose,
  onEditSlot,
  timetableDays,
}) => {
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
      onClose();
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
    <Dialog open={isOpen} onOpenChange={onClose}>
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
  );
};
