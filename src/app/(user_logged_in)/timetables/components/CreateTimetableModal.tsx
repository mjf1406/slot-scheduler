"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { toast } from "~/components/ui/use-toast";
import { createTimetable } from "../actions";
import { Loader2, Plus } from "lucide-react";
import { WEEKDAYS } from "~/lib/constants";
import { timeToMinutes } from "~/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { timetablesOptions } from "~/app/api/queryOptions";
import type { Timetable } from "~/server/db/types";

// Update the form schema to include start_time and end_time
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  days: z.array(z.string()).min(1, "Select at least one day"),
  start_time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  end_time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
});

export function CreateTimetableModal() {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      days: [],
      start_time: "09:00",
      end_time: "17:00",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const result = await createTimetable({
        ...values,
        start_time: Math.floor(timeToMinutes(values.start_time) / 60),
        end_time: Math.floor(timeToMinutes(values.end_time) / 60),
      });
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        form.reset();
        setIsOpen(false);

        // Update the cache immediately
        queryClient.setQueryData<Timetable[]>(
          timetablesOptions.queryKey,
          (oldData) => {
            if (!oldData) {
              return [result.timetable as unknown as Timetable];
            }
            return [...oldData, result.timetable as unknown as Timetable];
          },
        );

        // Invalidate and refetch
        await queryClient.invalidateQueries({
          queryKey: timetablesOptions.queryKey,
        });
      } else {
        form.setError("name", {
          type: "manual",
          message: result.message,
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" onClick={() => setIsOpen(true)}>
          <Plus size={20} className="mr-2" /> Create Timetable
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Timetable</DialogTitle>
          <DialogDescription>
            Enter a name, select days, and set start and end times for your
            timetable.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timetable Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Weekly Schedule" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="days"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">
                      Days of the Week
                    </FormLabel>
                    <FormDescription>
                      Select the days to include in your timetable.
                    </FormDescription>
                  </div>
                  {WEEKDAYS.map((day) => (
                    <FormField
                      key={day}
                      control={form.control}
                      name="days"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={day}
                            className="flex flex-row items-start space-x-3 space-y-0"
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
                            <FormLabel className="font-normal">{day}</FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
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
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  "Create Timetable"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
