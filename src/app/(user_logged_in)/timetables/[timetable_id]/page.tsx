"use client";

import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useParams } from "next/navigation";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { timetablesOptions } from "~/app/api/queryOptions";
import { ContentLayout } from "~/components/admin-panel/content-layout";
import LoadingPage from "~/components/Loading";
import { CreateClassDialog } from "./components/class/CreateClassDialog";
import WeekView from "./components/WeekView";
import { CreateSlotDialog } from "./components/slot/CreateSlotDialog";
import ClassList from "./components/class/ClassList";
import type { Class, Timetable, Slot, SlotClass } from "~/server/db/types";
import { deleteClass, editClass } from "../actions";
import DayCarousel from "./components/DayCarousel";
import { Button } from "~/components/ui/button";
import {
  createSlot,
  deleteSlot,
  moveSlotClass,
  removeSlotClassFromAllSlots,
  updateSlot,
  updateSlotClass,
} from "./actions";
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import DragOverlayWrapper from "./components/class/DragOverlayWrapper";
import {
  customCollisionDetection,
  getClassesForWeek,
  getUnassignedClassesForWeek,
  getYearAndWeekNumber,
} from "./utils";
import RichTextModal from "./components/text-editor/RichTextModal";

export default function TimetablePage() {
  const params = useParams();
  const timetableId = params.timetable_id as string;
  const queryClient = useQueryClient();
  const { data: timetables } = useSuspenseQuery(timetablesOptions);

  // Derive selectedTimetable directly from the query data
  const selectedTimetable = useMemo(
    () => timetables?.find((t) => t.timetable_id === timetableId),
    [timetables, timetableId],
  );

  // Derive timeSlots from selectedTimetable
  const timeSlots = useMemo(
    () => selectedTimetable?.slots ?? [],
    [selectedTimetable],
  );

  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const weekStart = new Date(
      now.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)),
    );
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  });
  const [classesForCurrentWeek, setClassesForCurrentWeek] = useState<Class[]>(
    [],
  );
  const [unassignedClassesForCurrentWeek, setUnassignedClassesForCurrentWeek] =
    useState<Class[]>([]);
  const [showWeekView, setShowWeekView] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<SlotClass | null>(null);
  const [selectedClassDetails, setSelectedClassDetails] =
    useState<Class | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 300, tolerance: 8 },
    }),
  );

  const handleClassClick = (classData: SlotClass | Class) => {
    if ("slot_id" in classData) {
      // It's a SlotClass
      setSelectedClass(classData);
      const classDetails =
        selectedTimetable?.classes.find(
          (c) => c.class_id === classData.class_id,
        ) ?? null;
      setSelectedClassDetails(classDetails);
    } else {
      // It's a Class
      // Find if this class has any existing SlotClass for the current week
      const { year, weekNumber } = getYearAndWeekNumber(currentWeekStart);
      const existingSlotClass =
        selectedTimetable?.slotClasses?.find(
          (sc) =>
            sc.class_id === classData.class_id &&
            sc.year === year &&
            sc.week_number === weekNumber,
        ) ?? null;

      setSelectedClass(existingSlotClass);
      setSelectedClassDetails(classData);
    }
    setIsModalOpen(true);
  };

  // Update the handleSaveClassDetails function to handle both new and existing slot classes
  const handleSaveClassDetails = async (updatedSlotClass: SlotClass) => {
    console.log("handleSaveClassDetails called with:", updatedSlotClass);

    try {
      // First update the cache optimistically
      queryClient.setQueryData(
        timetablesOptions.queryKey,
        (oldData: Timetable[] | undefined) =>
          oldData?.map((timetable) => {
            if (timetable.timetable_id === timetableId) {
              const existingSlotClassIndex = (
                timetable.slotClasses ?? []
              ).findIndex((sc) => sc.id === updatedSlotClass.id);

              const newSlotClasses = [...(timetable.slotClasses ?? [])];
              if (existingSlotClassIndex >= 0) {
                // Update existing slot class
                newSlotClasses[existingSlotClassIndex] = updatedSlotClass;
              } else {
                // Add new slot class
                newSlotClasses.push(updatedSlotClass);
              }

              return {
                ...timetable,
                slotClasses: newSlotClasses,
              };
            }
            return timetable;
          }),
      );

      // Then make the server call
      const response = await updateSlotClass(updatedSlotClass);
      console.log("Server response:", response);

      if (!response?.success) {
        // If the server call fails, invalidate the query to refresh the data
        await queryClient.invalidateQueries({
          queryKey: timetablesOptions.queryKey,
        });
      }

      handleCloseModal();
    } catch (error) {
      console.error("Error updating class:", error);
      // Invalidate the query to refresh the data
      await queryClient.invalidateQueries({
        queryKey: timetablesOptions.queryKey,
      });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClass(null);
    setSelectedClassDetails(null);
  };

  const updateClassesForWeek = useCallback(() => {
    if (selectedTimetable) {
      const assignedClasses = getClassesForWeek(
        selectedTimetable,
        currentWeekStart,
      );
      const unassignedClasses = getUnassignedClassesForWeek(
        selectedTimetable,
        currentWeekStart,
      );
      setClassesForCurrentWeek(assignedClasses);
      setUnassignedClassesForCurrentWeek(unassignedClasses);
    }
  }, [selectedTimetable, currentWeekStart]);

  useEffect(() => {
    updateClassesForWeek();
  }, [updateClassesForWeek]);

  const handleWeekChange = (newWeekStart: Date) => {
    setCurrentWeekStart(newWeekStart);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !selectedTimetable) return;

    const activeData = active.data.current as { type: string; class?: Class };
    const overData = over.data.current as { type: string; slot?: Slot };

    if (activeData.type === "ClassItem" && activeData.class) {
      const droppedClass = activeData.class;
      const { year, weekNumber } = getYearAndWeekNumber(currentWeekStart);

      if (overData.type === "TimeSlot" && overData.slot) {
        const targetSlot = overData.slot;

        // Update the server
        const response = await moveSlotClass(
          droppedClass.class_id,
          targetSlot.slot_id,
          selectedTimetable.timetable_id,
          year,
          weekNumber,
        );

        if (response.success && response.slotClassesForWeek) {
          // Update the query cache with the new slotClasses for the current week
          queryClient.setQueryData(
            timetablesOptions.queryKey,
            (oldData: Timetable[] | undefined) =>
              oldData?.map((timetable) => {
                if (timetable.timetable_id === selectedTimetable.timetable_id) {
                  // Merge existing slotClasses with the updated ones for the current week
                  const otherSlotClasses = (timetable.slotClasses ?? []).filter(
                    (sc) => sc.year !== year || sc.week_number !== weekNumber,
                  );

                  // Remove duplicates based on slotClass IDs
                  const allSlotClasses = [
                    ...otherSlotClasses,
                    ...response.slotClassesForWeek,
                  ];
                  const uniqueSlotClasses = Array.from(
                    new Map(allSlotClasses.map((sc) => [sc.id, sc])).values(),
                  );

                  return {
                    ...timetable,
                    slotClasses: uniqueSlotClasses,
                  };
                }
                return timetable;
              }),
          );
          updateClassesForWeek();
        } else {
          console.error("Failed to move class:", response.message);
        }
      } else if (
        overData.type === "UnassignedArea" ||
        overData.type === "ClassItem"
      ) {
        // Update the server
        const response = await removeSlotClassFromAllSlots(
          droppedClass.class_id,
          selectedTimetable.timetable_id,
          year,
          weekNumber,
        );

        if (response.success && response.slotClassesForWeek) {
          // Update the query cache with the new slotClasses for the current week
          queryClient.setQueryData(
            timetablesOptions.queryKey,
            (oldData: Timetable[] | undefined) =>
              oldData?.map((timetable) => {
                if (timetable.timetable_id === selectedTimetable.timetable_id) {
                  // Merge existing slotClasses with the updated ones for the current week
                  const otherSlotClasses = (timetable.slotClasses ?? []).filter(
                    (sc) => sc.year !== year || sc.week_number !== weekNumber,
                  );

                  // Remove duplicates
                  const allSlotClasses = [
                    ...otherSlotClasses,
                    ...response.slotClassesForWeek,
                  ];
                  const uniqueSlotClasses = Array.from(
                    new Map(allSlotClasses.map((sc) => [sc.id, sc])).values(),
                  );

                  return {
                    ...timetable,
                    slotClasses: uniqueSlotClasses,
                  };
                }
                return timetable;
              }),
          );
          updateClassesForWeek();
        } else {
          console.error("Failed to remove class from slots:", response.message);
        }
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (!over || !selectedTimetable) return;
    // Handle drag over if needed
  };

  const handleDeleteSlot = async (slot_id: string) => {
    try {
      const response = await deleteSlot(slot_id);

      if (response.success) {
        // Invalidate the query to refetch the updated data
        await queryClient.invalidateQueries({
          queryKey: [timetablesOptions.queryKey],
        });
      } else {
        console.error("Failed to delete slot:", response.message);
      }
    } catch (error) {
      console.error("Error deleting slot:", error);
    }
  };

  const handleCreateSlot = async (
    newSlot: Omit<Slot, "slot_id" | "user_id" | "timetable_id">,
  ) => {
    const response = await createSlot({
      ...newSlot,
      timetable_id: timetableId,
    });

    if (response.success && response.slot) {
      // Invalidate the query to refetch the updated data
      await queryClient.invalidateQueries({
        queryKey: [timetablesOptions.queryKey],
      });
    } else {
      console.error("Failed to create slot:", response.message);
    }
  };

  const handleEditSlot = async (updatedSlot: Slot) => {
    try {
      const response = await updateSlot(updatedSlot);

      if (response.success && response.slot) {
        // Invalidate the query to refetch the updated data
        await queryClient.invalidateQueries({
          queryKey: [timetablesOptions.queryKey],
        });
      } else {
        console.error("Failed to edit slot:", response.message);
      }
    } catch (error) {
      console.error("Error editing slot:", error);
    }
  };

  const handleEditClass = async (updatedClass: Class) => {
    // Optimistically update the query cache
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
      console.error("Failed to delete class:", error);
      await queryClient.invalidateQueries({
        queryKey: timetablesOptions.queryKey,
      });
    }
  };

  const handleGoToCurrentWeek = () => {
    setCurrentWeekStart(getCurrentWeekStart());
  };

  const getCurrentWeekStart = useCallback(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const weekStart = new Date(
      now.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)),
    );
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  }, []);

  if (!selectedTimetable) {
    return (
      <div className="flex h-dvh w-full flex-col items-center justify-center gap-3">
        <p className="text-2xl text-destructive">Timetable not found.</p>
        <p className="max-w-md text-center">
          It is possible that you do not have access to this timetable. If you
          know you have access, please try again.
        </p>
      </div>
    );
  }

  return (
    <ContentLayout title="Timetables">
      <Suspense fallback={<LoadingPage />}>
        <RichTextModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          classItem={selectedClass}
          classDetails={selectedClassDetails}
          onSave={handleSaveClassDetails}
        />
        <DndContext
          sensors={sensors}
          modifiers={[restrictToWindowEdges]}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          collisionDetection={customCollisionDetection}
        >
          <div className="container px-0">
            <div id="timetable" className="mt-5">
              <div className="flex gap-5">
                <h1 className="mb-2 text-3xl font-bold">
                  {selectedTimetable.name}
                </h1>
                <CreateClassDialog
                  timetableId={selectedTimetable.timetable_id}
                />
                <CreateSlotDialog
                  days={selectedTimetable.days}
                  onCreateSlot={handleCreateSlot}
                />
              </div>
            </div>
            <div className="flex grid-cols-4 flex-col gap-5 xl:grid">
              <div className="col-span-1">
                <ClassList
                  classes={unassignedClassesForCurrentWeek}
                  onEdit={handleEditClass}
                  onDelete={handleDeleteClass}
                  timetableId={selectedTimetable.timetable_id}
                  onClassClick={handleClassClick}
                />
              </div>
              <div className="col-span-3">
                <div className="mb-4 flex justify-end gap-2">
                  <Button onClick={handleGoToCurrentWeek} variant="outline">
                    Go to Current Week
                  </Button>
                  <Button
                    onClick={() => setShowWeekView(!showWeekView)}
                    variant="outline"
                  >
                    {showWeekView
                      ? "Switch to Day View"
                      : "Switch to Week View"}
                  </Button>
                </div>
                {showWeekView ? (
                  <WeekView
                    start_time={selectedTimetable.start_time}
                    end_time={selectedTimetable.end_time}
                    days={selectedTimetable.days}
                    timeSlots={timeSlots}
                    classes={classesForCurrentWeek}
                    slotClasses={
                      (selectedTimetable?.slotClasses ?? []).filter((sc) => {
                        const { year, weekNumber } =
                          getYearAndWeekNumber(currentWeekStart);
                        return (
                          sc.year === year && sc.week_number === weekNumber
                        );
                      }) ?? []
                    }
                    onDeleteSlot={handleDeleteSlot}
                    onCreateSlot={handleCreateSlot}
                    onEditSlot={handleEditSlot}
                    onEditClass={handleEditClass}
                    onDeleteClass={handleDeleteClass}
                    currentWeekStart={currentWeekStart}
                    onWeekChange={handleWeekChange}
                    onClassClick={handleClassClick}
                  />
                ) : (
                  <DayCarousel
                    start_time={selectedTimetable.start_time}
                    end_time={selectedTimetable.end_time}
                    days={selectedTimetable.days}
                    timeSlots={timeSlots}
                    classes={classesForCurrentWeek}
                    slotClasses={
                      (selectedTimetable?.slotClasses ?? []).filter((sc) => {
                        const { year, weekNumber } =
                          getYearAndWeekNumber(currentWeekStart);
                        return (
                          sc.year === year && sc.week_number === weekNumber
                        );
                      }) ?? []
                    }
                    onDeleteSlot={handleDeleteSlot}
                    onCreateSlot={handleCreateSlot}
                    onEditSlot={handleEditSlot}
                    onEditClass={handleEditClass}
                    onDeleteClass={handleDeleteClass}
                    currentWeekStart={currentWeekStart}
                    onWeekChange={handleWeekChange}
                    onClassClick={handleClassClick}
                  />
                )}
              </div>
            </div>
          </div>
          <DragOverlayWrapper />
        </DndContext>
      </Suspense>
    </ContentLayout>
  );
}
