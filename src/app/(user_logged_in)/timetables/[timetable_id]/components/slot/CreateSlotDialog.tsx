"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";
import { Plus } from "lucide-react";
import { useToast } from "~/components/ui/use-toast";
import type { Slot } from "~/server/db/types";

const slotSchema = z
  .object({
    days: z.array(z.string()).min(1, "Select at least one day"),
    start_time: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format"),
    end_time: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format"),
  })
  .refine((data) => data.start_time < data.end_time, {
    message: "End time must be after start time",
    path: ["end_time"],
  });

type SlotFormValues = z.infer<typeof slotSchema>;

type CreateSlotDialogProps = {
  days: string[];
  onCreateSlot: (
    slot: Omit<Slot, "slot_id" | "user_id" | "timetable_id">,
  ) => Promise<void>;
};

export function CreateSlotDialog({
  days,
  onCreateSlot,
}: CreateSlotDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<SlotFormValues>({
    resolver: zodResolver(slotSchema),
    defaultValues: {
      days: [],
      start_time: "09:00",
      end_time: "10:00",
    },
  });

  // const handleCreateSlot = async (values: SlotFormValues) => {
  //   try {
  //     for (const day of values.days) {
  //       await onCreateSlot({
  //         day,
  //         start_time: values.start_time,
  //         end_time: values.end_time,
  //       });
  //     }
  //     setOpen(false);
  //     form.reset();
  //     toast({
  //       title: "Success",
  //       description: "Slots created successfully",
  //     });
  //   } catch (error) {
  //     console.error("Error creating slots:", error);
  //     toast({
  //       title: "Error",
  //       description: "Failed to create slots",
  //       variant: "destructive",
  //     });
  //   }
  // };

  const handleCreateSlot = async (values: SlotFormValues) => {
    try {
      for (const day of values.days) {
        const newSlot = {
          day,
          start_time: values.start_time,
          end_time: values.end_time,
        };
        await onCreateSlot(newSlot);
      }
      setOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Slots created successfully",
      });
    } catch (error) {
      console.error("Error creating slots:", error);
      toast({
        title: "Error",
        description: "Failed to create slots",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <Plus className="mr-2 h-4 w-4" />
          Create Slot
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Slot(s)</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleCreateSlot)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="days"
              render={() => (
                <FormItem>
                  <FormLabel>Days</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {days.map((day) => (
                      <FormField
                        key={day}
                        control={form.control}
                        name="days"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={day}
                              className="flex w-full flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(day)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, day])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== day,
                                          ),
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {day}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
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
                    <Input type="time" {...field} />
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
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Creating..." : "Create Slot(s)"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
