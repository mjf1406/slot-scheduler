"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { CreateTimetableModal } from "./CreateTimetableModal";
import { Badge } from "~/components/ui/badge";
import { timetablesOptions } from "~/app/api/queryOptions";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { convertTo24HourFormat, formatTime, timeToMinutes } from "~/lib/utils";
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
import { Edit, Loader2 } from "lucide-react";
import { WEEKDAYS } from "~/lib/constants";
import { deleteTimetable, updateTimetable } from "../actions";
import type { Timetable } from "~/server/db/types";
import { DeleteDialog } from "./DeleteClassDialog";

const ORDERED_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const formatDays = (days: string[]): string[] => {
  if (!days ?? typeof days !== "object" ?? days === null) {
    return [];
  }
  return ORDERED_DAYS.filter((day) => days.includes(day));
};

const formSchema = z.object({
  timetable_id: z.string(),
  name: z.string().min(1, "Name is required"),
  days: z.array(z.string()).min(1, "Select at least one day"),
  start_time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  end_time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
});

type FormValues = z.infer<typeof formSchema>;

export default function Timetables() {
  const { data: timetables } = useSuspenseQuery(timetablesOptions);
  const [editingTimetable, setEditingTimetable] = useState<Timetable | null>(
    null,
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingTimetableId, setDeletingTimetableId] = useState<string | null>(
    null,
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [timetableToDelete, setTimetableToDelete] = useState<Timetable | null>(
    null,
  );
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      timetable_id: "",
      name: "",
      days: [],
      start_time: "09:00",
      end_time: "17:00",
    },
  });

  const handleEdit = (timetable: Timetable) => {
    const startTime = formatTime(timetable.start_time);
    const endTime = formatTime(timetable.end_time);
    console.log("Editing timetable:", timetable);
    console.log("Formatted start time:", startTime);
    console.log("Formatted end time:", endTime);

    setEditingTimetable(timetable);
    form.reset({
      timetable_id: timetable.timetable_id,
      name: timetable.name,
      days: timetable.days,
      start_time: convertTo24HourFormat(startTime),
      end_time: convertTo24HourFormat(endTime),
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (values: FormValues) => {
    console.log("Submitting values:", values);
    setIsLoading(true);
    try {
      const result = await updateTimetable({
        timetable_id: values.timetable_id,
        name: values.name,
        days: values.days,
        start_time: timeToMinutes(values.start_time), // Convert to hours
        end_time: timeToMinutes(values.end_time), // Convert to hours
      });

      if (result.success) {
        toast({
          title: "Success",
          description: "Timetable updated successfully",
        });
        setIsEditDialogOpen(false);
        await queryClient.invalidateQueries({ queryKey: ["timetables"] });
      } else {
        throw new Error(result.error ?? "Failed to update timetable");
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (timetable: Timetable) => {
    setTimetableToDelete(timetable);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!timetableToDelete) return;
    setDeletingTimetableId(timetableToDelete.timetable_id);
    try {
      const result = await deleteTimetable({
        timetableId: timetableToDelete.timetable_id,
      });
      if (result.success) {
        await queryClient.invalidateQueries({ queryKey: ["timetables"] });
        toast({
          title: "Success",
          description: "Timetable deleted successfully",
        });
      } else {
        throw new Error(result.error ?? "Failed to delete timetable");
      }
    } catch (error) {
      console.error("Error deleting timetable:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setDeletingTimetableId(null);
      setIsDeleteDialogOpen(false);
      setTimetableToDelete(null);
    }
  };

  return (
    <div className="container px-0">
      <div className="mb-6 flex items-center gap-5">
        <h1 className="text-3xl font-bold">Timetables</h1>
        <CreateTimetableModal />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {timetables?.map((timetable) => {
          const formattedDays = formatDays(timetable.days);
          const startTime = formatTime(timetable.start_time);
          const endTime = formatTime(timetable.end_time);

          return (
            <Card
              className="transition-shadow duration-300 hover:shadow-lg"
              key={timetable.timetable_id}
            >
              <CardHeader>
                <CardTitle>{timetable.name}</CardTitle>
                <CardDescription>
                  <div className="flex flex-col gap-1">
                    <span>
                      <span className="font-bold">Classes:</span>{" "}
                      {timetable.classes?.length ?? 0}
                    </span>
                    <span>
                      <span className="font-bold">Hours:</span> {startTime} -{" "}
                      {endTime}
                    </span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {formattedDays.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {formattedDays.map((day) => (
                      <Badge
                        key={day}
                        variant="outline"
                        className="hover:bg-transparent"
                      >
                        {day}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p>No days defined</p>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="secondary" asChild>
                  <Link href={`/timetables/${timetable.timetable_id}`}>
                    View
                  </Link>
                </Button>
                <div className="flex">
                  <Dialog
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size={"icon"}
                        onClick={() => handleEdit(timetable)}
                      >
                        <Edit size={20} />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Edit Timetable</DialogTitle>
                        <DialogDescription>
                          Make changes to your timetable here. Click save when
                          you&apos;re done.
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...form}>
                        <form
                          onSubmit={form.handleSubmit(handleEditSubmit)}
                          className="space-y-8"
                        >
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Timetable Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="My Weekly Schedule"
                                    {...field}
                                  />
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
                                    Select the days to include in your
                                    timetable.
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
                                              checked={field.value?.includes(
                                                day,
                                              )}
                                              onCheckedChange={(checked) => {
                                                return checked
                                                  ? field.onChange([
                                                      ...field.value,
                                                      day,
                                                    ])
                                                  : field.onChange(
                                                      field.value?.filter(
                                                        (value) =>
                                                          value !== day,
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
                                  <Input
                                    type="time"
                                    {...field}
                                    value={field.value}
                                    onChange={(e) => {
                                      console.log(
                                        "Start time changed:",
                                        e.target.value,
                                      );
                                      field.onChange(e.target.value);
                                    }}
                                  />
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
                                  <Input
                                    type="time"
                                    {...field}
                                    value={field.value}
                                    onChange={(e) => {
                                      console.log(
                                        "End time changed:",
                                        e.target.value,
                                      );
                                      field.onChange(e.target.value);
                                    }}
                                  />
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
                                  <span>Updating...</span>
                                </>
                              ) : (
                                "Update Timetable"
                              )}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                  <DeleteDialog timetable={timetable} />
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
