"use client";

import React, { Suspense, useState } from "react";
import { useParams } from "next/navigation";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { timetablesOptions } from "~/app/api/queryOptions";
import { ContentLayout } from "~/components/admin-panel/content-layout";
import LoadingPage from "~/components/Loading";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "~/components/ui/breadcrumb";
import Link from "next/link";
import { CreateClassDialog } from "./components/class/CreateClassDialog";
import WeekView from "./components/WeekView";
import { CreateSlotDialog } from "./components/slot/CreateSlotDialog";
import ClassList from "./components/class/ClassList";
import type { Class, Timetable, Slot } from "~/server/db/types";
import { deleteClass, editClass } from "../actions";
import DayCarousel from "./components/DayCarousel";
import { Button } from "~/components/ui/button";
import { createSlot, deleteSlot, updateSlot } from "./actions";

export default function TimetablePage() {
  const params = useParams();
  const timetableId = params.timetable_id as string;

  const queryClient = useQueryClient();
  const { data: timetables } = useSuspenseQuery(timetablesOptions);

  const selectedTimetable = timetables?.find(
    (t) => t.timetable_id === timetableId,
  );

  const [timeSlots, setTimeSlots] = useState<Slot[]>(
    selectedTimetable?.slots ?? [],
  );

  const [showWeekView, setShowWeekView] = useState(true);

  const handleDeleteSlot = async (slot_id: string) => {
    try {
      const response = await deleteSlot(slot_id);

      if (response.success) {
        setTimeSlots((slots) =>
          slots.filter((slot) => slot.slot_id !== slot_id),
        );
      } else {
        console.error("Failed to delete slot:", response.message);
        // Handle the error (e.g., show an error message to the user)
      }
    } catch (error) {
      console.error("Error deleting slot:", error);
      // Handle the error (e.g., show an error message to the user)
    }
  };

  const handleCreateSlot = async (
    newSlot: Omit<Slot, "slot_id" | "user_id" | "timetable_id">,
  ) => {
    console.log("🚀 ~ handleCreateSlot ~ newSlot:", newSlot);
    const response = await createSlot({
      ...newSlot,
      timetable_id: timetableId,
    });
    console.log("🚀 ~ handleCreateSlot ~ response:", response);

    if (response.success && response.slot) {
      setTimeSlots((slots) => [...slots, response.slot]);
    } else {
      console.error("Failed to create slot:", response.message);
    }
  };

  const handleEditSlot = async (updatedSlot: Slot) => {
    try {
      const response = await updateSlot(updatedSlot);
      console.log("🚀 ~ handleEditSlot ~ response:", response);

      if (response.success && response.slot) {
        setTimeSlots((prevSlots) =>
          prevSlots.map((slot) =>
            slot.slot_id === updatedSlot.slot_id
              ? (response.slot ?? slot)
              : slot,
          ),
        );
      } else {
        console.error("Failed to edit slot:", response.message);
      }
    } catch (error) {
      console.error("Error editing slot:", error);
    }
  };

  const handleEditClass = async (updatedClass: Class) => {
    console.log("🚀 ~ handleEditClass ~ updatedClass:", updatedClass);
    // Optimistically update the UI
    queryClient.setQueryData(timetablesOptions.queryKey, (oldData) => {
      return oldData?.map((timetable: Timetable) => {
        if (timetable.timetable_id === timetableId) {
          return {
            ...timetable,
            classes: timetable.classes.map((cls: Class) =>
              cls.class_id === updatedClass.class_id ? updatedClass : cls,
            ),
          };
        }
        return timetable;
      });
    });

    try {
      await editClass(updatedClass);
    } catch (error) {
      console.error("Failed to edit class:", error);
      await queryClient.invalidateQueries({
        queryKey: timetablesOptions.queryKey,
      });
    }
  };

  const handleDeleteClass = async (classId: string) => {
    // Optimistically update the UI
    queryClient.setQueryData(timetablesOptions.queryKey, (oldData) => {
      return oldData?.map((timetable: Timetable) => {
        if (timetable.timetable_id === timetableId) {
          return {
            ...timetable,
            classes: timetable.classes.filter(
              (cls: Class) => cls.class_id !== classId,
            ),
          };
        }
        return timetable;
      });
    });

    try {
      await deleteClass(classId);
    } catch (error) {
      console.error("Failed to edit class:", error);
      await queryClient.invalidateQueries({
        queryKey: timetablesOptions.queryKey,
      });
    }
  };

  if (!selectedTimetable) {
    return (
      <div className="flex h-dvh w-full flex-col items-center justify-center gap-3">
        <p className="text-2xl text-destructive">Timetable not found.</p>
        <p className="max-w-md text-center">
          {" "}
          It is possible that you do not have access to this timetable. If you
          know you have access, please try again.
        </p>
      </div>
    );
  }

  return (
    <ContentLayout title="Timetables">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/timetables">Timetables</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{selectedTimetable.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Suspense fallback={<LoadingPage />}>
        <div className="container px-0 py-8">
          <div id="timetable" className="mt-5">
            <div className="flex gap-5">
              <h1 className="mb-2 text-3xl font-bold">
                {selectedTimetable.name}
              </h1>
              <CreateClassDialog timetableId={selectedTimetable.timetable_id} />
              <CreateSlotDialog
                days={selectedTimetable.days}
                onCreateSlot={handleCreateSlot}
              />
            </div>
          </div>
          <div className="flex grid-cols-4 flex-col gap-5 xl:grid">
            <div className="col-span-1">
              <ClassList
                classes={selectedTimetable.classes}
                onEdit={handleEditClass}
                onDelete={handleDeleteClass}
                timetableId={selectedTimetable.timetable_id}
              />
            </div>
            <div className="col-span-3">
              <div className="mb-4 flex justify-end">
                <Button
                  onClick={() => setShowWeekView(!showWeekView)}
                  variant="outline"
                >
                  {showWeekView ? "Switch to Day View" : "Switch to Week View"}
                </Button>
              </div>
              {showWeekView ? (
                <WeekView
                  start_time={selectedTimetable.start_time}
                  end_time={selectedTimetable.end_time}
                  days={selectedTimetable.days}
                  timeSlots={timeSlots}
                  classes={selectedTimetable.classes}
                  onDeleteSlot={handleDeleteSlot}
                  onCreateSlot={handleCreateSlot}
                  onEditSlot={handleEditSlot}
                />
              ) : (
                <DayCarousel
                  start_time={selectedTimetable.start_time}
                  end_time={selectedTimetable.end_time}
                  days={selectedTimetable.days}
                  timeSlots={timeSlots}
                  classes={selectedTimetable.classes}
                  onDeleteSlot={handleDeleteSlot}
                  onCreateSlot={handleCreateSlot}
                  onEditSlot={handleEditSlot}
                />
              )}
            </div>
          </div>
        </div>
      </Suspense>
    </ContentLayout>
  );
}
