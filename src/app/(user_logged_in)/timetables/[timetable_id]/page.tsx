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
import DisplayClassDetails from "./components/DisplayClassDetails";
import { useToast } from "~/components/ui/use-toast";

export default function TimetablePage() {
  const params = useParams();
  const timetableId = params.timetable_id as string;
  const queryClient = useQueryClient();
  const { toast } = useToast();
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
  const [selectedClass, setSelectedClass] = useState<SlotClass | null>(null);
  const [selectedClassDetails, setSelectedClassDetails] =
    useState<Class | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Controls RichTextModal
  const [isDisplayDialogOpen, setIsDisplayDialogOpen] = useState(false); // Controls DisplayClassDetails

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 300, tolerance: 8 },
    }),
  );

  const handleSaveClassDetails = async (updatedSlotClass: SlotClass) => {
    console.log("handleSaveClassDetails called with:", updatedSlotClass);

    try {
      // First, optimistically update the cache
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
      } else if (response.slotClass) {
        // Update the cache with the server response
        queryClient.setQueryData(
          timetablesOptions.queryKey,
          (oldData: Timetable[] | undefined) =>
            oldData?.map((timetable) => {
              if (timetable.timetable_id === timetableId) {
                const existingSlotClassIndex = (
                  timetable.slotClasses ?? []
                ).findIndex((sc) => sc.id === response?.slotClass?.id);

                const newSlotClasses = [...(timetable.slotClasses ?? [])];
                if (existingSlotClassIndex >= 0) {
                  // Update existing slot class with server data
                  newSlotClasses[existingSlotClassIndex] = response.slotClass!;
                } else {
                  // Add new slot class
                  newSlotClasses.push(response.slotClass!);
                }

                return {
                  ...timetable,
                  slotClasses: newSlotClasses,
                };
              }
              return timetable;
            }),
        );
      }

      // handleCloseModal();
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !selectedTimetable) return;

    const activeData = active.data.current as { type: string; class?: Class };
    const overData = over.data.current as { type: string; slot?: Slot };

    if (activeData.type === "ClassItem" && activeData.class) {
      const droppedClass = activeData.class;
      const { year, weekNumber } = getYearAndWeekNumber(currentWeekStart);

      // Keep a snapshot of the previous state
      const previousTimetableData = queryClient.getQueryData<Timetable[]>(
        timetablesOptions.queryKey,
      );

      if (overData.type === "TimeSlot" && overData.slot) {
        const targetSlot = overData.slot;

        // Optimistically update the cache
        queryClient.setQueryData<Timetable[]>(
          timetablesOptions.queryKey,
          (oldData) =>
            oldData?.map((timetable) => {
              if (timetable.timetable_id === selectedTimetable.timetable_id) {
                // Find the existing SlotClass for this class in the current week
                const slotClasses = timetable.slotClasses ?? [];
                const existingSlotClassIndex = slotClasses.findIndex(
                  (sc) =>
                    sc.class_id === droppedClass.class_id &&
                    sc.year === year &&
                    sc.week_number === weekNumber,
                );

                if (existingSlotClassIndex >= 0) {
                  // Update the slot_id of the existing SlotClass
                  const updatedSlotClasses = [...slotClasses];
                  updatedSlotClasses[existingSlotClassIndex] = {
                    ...updatedSlotClasses[existingSlotClassIndex],
                    slot_id: targetSlot.slot_id,
                    user_id: selectedTimetable.user_id, // ensure user_id is a non-optional string
                    timetable_id: selectedTimetable.timetable_id, // ensure timetable_id is a non-optional string
                    class_id: droppedClass.class_id, // ensure class_id is a non-optional string
                    year: year, // ensure year is a non-optional number
                    week_number: weekNumber, // ensure week_number is a non-optional number
                    size: "whole", // or some other default value for size
                    text: "", // or some other default value for text
                  };

                  return {
                    ...timetable,
                    slotClasses: updatedSlotClasses,
                  };
                } else {
                  // No existing SlotClass, create a new one without id
                  const newSlotClass: SlotClass = {
                    // id is optional and not set here
                    class_id: droppedClass.class_id,
                    slot_id: targetSlot.slot_id,
                    timetable_id: selectedTimetable.timetable_id,
                    user_id: selectedTimetable.user_id,
                    year: year,
                    week_number: weekNumber,
                    size: "whole",
                    text: "", // Initialize text as empty or null
                  };

                  return {
                    ...timetable,
                    slotClasses: [...slotClasses, newSlotClass],
                  };
                }
              }
              return timetable;
            }),
        );

        // Update classes for the current week
        updateClassesForWeek();

        // Make the server call
        moveSlotClass(
          droppedClass.class_id,
          targetSlot.slot_id,
          selectedTimetable.timetable_id,
          year,
          weekNumber,
        )
          .then((response) => {
            if (response.success && response.slotClassesForWeek) {
              // Update the cache with the server response
              queryClient.setQueryData<Timetable[]>(
                timetablesOptions.queryKey,
                (oldData) =>
                  oldData?.map((timetable) => {
                    if (
                      timetable.timetable_id === selectedTimetable.timetable_id
                    ) {
                      return {
                        ...timetable,
                        slotClasses: [
                          // Keep slotClasses not in the current week
                          ...(timetable.slotClasses ?? []).filter(
                            (sc) =>
                              sc.year !== year || sc.week_number !== weekNumber,
                          ),
                          // Add the updated slotClasses from the server
                          ...response.slotClassesForWeek,
                        ],
                      };
                    }
                    return timetable;
                  }),
              );

              // Update classes for the current week
              updateClassesForWeek();

              // Show success toast
              toast({
                title: "Success",
                description: "Class moved successfully.",
              });
            } else {
              // Revert the cache
              if (previousTimetableData) {
                queryClient.setQueryData<Timetable[]>(
                  timetablesOptions.queryKey,
                  previousTimetableData,
                );
                updateClassesForWeek();
              }
              // Show error toast
              toast({
                title: "Error",
                description: `Failed to move class: ${response.message}`,
                variant: "destructive",
              });
            }
          })
          .catch((error: unknown) => {
            // Revert the cache
            if (previousTimetableData) {
              queryClient.setQueryData<Timetable[]>(
                timetablesOptions.queryKey,
                previousTimetableData,
              );
              updateClassesForWeek();
            }
            // Show error toast
            toast({
              title: "Error",
              description: `Failed to move class: ${
                error instanceof Error ? error.message : String(error)
              }`,
              variant: "destructive",
            });
          });
      } else if (
        overData.type === "UnassignedArea" ||
        overData.type === "ClassItem"
      ) {
        const slotClasses = selectedTimetable.slotClasses ?? [];
        const updatedSlotClasses = slotClasses.map((sc) => {
          if (
            sc.class_id === droppedClass.class_id &&
            sc.year === year &&
            sc.week_number === weekNumber
          ) {
            return {
              ...sc,
              slot_id: null,
            };
          }
          return sc;
        });

        queryClient.setQueryData<Timetable[]>(
          timetablesOptions.queryKey,
          (oldData) =>
            oldData?.map((timetable) => {
              if (timetable.timetable_id === selectedTimetable.timetable_id) {
                return {
                  ...timetable,
                  slotClasses: updatedSlotClasses,
                };
              }
              return timetable;
            }),
        );

        // Update classes for the current week
        updateClassesForWeek();

        // Make the server call
        removeSlotClassFromAllSlots(
          droppedClass.class_id,
          selectedTimetable.timetable_id,
          year,
          weekNumber,
        )
          .then((response) => {
            // Handle response...
          })
          .catch((error) => {
            // Handle error...
          });
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (!over || !selectedTimetable) return;
    // Handle drag over if needed
  };

  // const handleDeleteSlot = async (slot_id: string) => {
  //   try {
  //     const response = await deleteSlot(slot_id);

  //     if (response.success) {
  //       // Invalidate the query to refetch the updated data
  //       await queryClient.invalidateQueries({
  //         queryKey: [timetablesOptions.queryKey],
  //       });
  //     } else {
  //       console.error("Failed to delete slot:", response.message);
  //     }
  //   } catch (error) {
  //     console.error("Error deleting slot:", error);
  //   }
  // };

  const handleDeleteSlot = async (slot_id: string) => {
    // Keep a copy of the current timeSlots
    const previousTimeSlots = timeSlots;

    // Optimistically update the UI
    const updatedTimeSlots = timeSlots.filter(
      (slot) => slot.slot_id !== slot_id,
    );

    // Update the query cache
    queryClient.setQueryData<Timetable[]>(
      timetablesOptions.queryKey,
      (oldData) => {
        if (!oldData) return oldData;
        return oldData.map((timetable) => {
          if (timetable.timetable_id === timetableId) {
            return {
              ...timetable,
              slots: updatedTimeSlots,
            };
          }
          return timetable;
        });
      },
    );

    try {
      const response = await deleteSlot(slot_id);

      if (response.success) {
        // If successful, no need to do anything else as the UI is already updated
        toast({
          title: "Success",
          description: "Slot deleted successfully.",
        });
      } else {
        // If the server request fails, revert the UI change
        queryClient.setQueryData<Timetable[]>(
          timetablesOptions.queryKey,
          (oldData) => {
            if (!oldData) return oldData;
            return oldData.map((timetable) => {
              if (timetable.timetable_id === timetableId) {
                return {
                  ...timetable,
                  slots: previousTimeSlots,
                };
              }
              return timetable;
            });
          },
        );
        console.error("Failed to delete slot:", response.message);
        toast({
          title: "Error",
          description: "Failed to delete slot. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      // If there's an error, revert the UI change
      queryClient.setQueryData<Timetable[]>(
        timetablesOptions.queryKey,
        (oldData) => {
          if (!oldData) return oldData;
          return oldData.map((timetable) => {
            if (timetable.timetable_id === timetableId) {
              return {
                ...timetable,
                slots: previousTimeSlots,
              };
            }
            return timetable;
          });
        },
      );
      console.error("Error deleting slot:", error);
      toast({
        title: "Error",
        description:
          "An error occurred while deleting the slot. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateSlot = async (
    newSlot: Omit<Slot, "slot_id" | "user_id" | "timetable_id">,
  ) => {
    try {
      const response = await createSlot({
        ...newSlot,
        timetable_id: timetableId,
      });

      if (response.success && response.slot) {
        // Update the query cache
        queryClient.setQueryData<Timetable[]>(
          timetablesOptions.queryKey,
          (oldData) => {
            if (!oldData) return oldData;
            return oldData.map((timetable) => {
              if (timetable.timetable_id === timetableId) {
                return {
                  ...timetable,
                  slots: [...(timetable.slots || []), response.slot],
                };
              }
              return timetable;
            });
          },
        );

        // Invalidate the query to ensure consistency
        await queryClient.invalidateQueries({
          queryKey: timetablesOptions.queryKey,
        });

        // Optionally, show a success toast
        toast({
          title: "Success",
          description: "Slot created successfully",
        });
      } else {
        console.error("Failed to create slot:", response.message);
        // Optionally, show an error toast
        toast({
          title: "Error",
          description: "Failed to create slot",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating slot:", error);
      // Optionally, show an error toast
      toast({
        title: "Error",
        description: "An error occurred while creating the slot",
        variant: "destructive",
      });
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

  // const handleClassClick = (classData: SlotClass | Class) => {
  //   if ("slot_id" in classData) {
  //     // It's a SlotClass
  //     setSelectedClass(classData);
  //     const classDetails =
  //       selectedTimetable?.classes.find(
  //         (c) => c.class_id === classData.class_id,
  //       ) ?? null;
  //     setSelectedClassDetails(classDetails);
  //   } else {
  //     // It's a Class
  //     // Find if this class has any existing SlotClass for the current week
  //     const { year, weekNumber } = getYearAndWeekNumber(currentWeekStart);
  //     const existingSlotClass =
  //       selectedTimetable?.slotClasses?.find(
  //         (sc) =>
  //           sc.class_id === classData.class_id &&
  //           sc.year === year &&
  //           sc.week_number === weekNumber,
  //       ) ?? null;

  //     setSelectedClass(existingSlotClass);
  //     setSelectedClassDetails(classData);
  //   }
  //   setIsModalOpen(true);
  // };

  // TimetablePage.tsx
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
      const { year, weekNumber } = getYearAndWeekNumber(currentWeekStart);
      const existingSlotClass =
        selectedTimetable?.slotClasses?.find(
          (sc) =>
            sc.class_id === classData.class_id &&
            sc.year === year &&
            sc.week_number === weekNumber,
        ) ?? null;

      if (!existingSlotClass) {
        // Create a new SlotClass with slot_id null
        const newSlotClass: SlotClass = {
          class_id: classData.class_id,
          slot_id: null, // Since it's unassigned
          timetable_id: selectedTimetable.timetable_id,
          user_id: selectedTimetable.user_id,
          year: year,
          week_number: weekNumber,
          size: "whole",
          text: "", // Initialize text as empty
        };

        setSelectedClass(newSlotClass);
      } else {
        setSelectedClass(existingSlotClass);
      }
      setSelectedClassDetails(classData);
    }
    setIsModalOpen(true);
  };

  const handleDisplayClick = (classData: Class | SlotClass) => {
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

    setIsDisplayDialogOpen(true);
  };

  return (
    <ContentLayout title="Timetables">
      <Suspense fallback={<LoadingPage />}>
        {/* <RichTextModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          classItem={selectedClass}
          classDetails={selectedClassDetails}
          onSave={handleSaveClassDetails}
        /> */}
        <DisplayClassDetails
          classItem={selectedClass}
          classDetails={selectedClassDetails}
          isOpen={isDisplayDialogOpen}
          onClose={() => setIsDisplayDialogOpen(false)}
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
              <div className="col-span-1 w-full">
                <ClassList
                  classes={unassignedClassesForCurrentWeek}
                  onEdit={handleEditClass}
                  onDelete={handleDeleteClass}
                  timetableId={selectedTimetable.timetable_id}
                  onClassClick={handleClassClick}
                  onDisplayClick={handleDisplayClick}
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
                    onDisplayClick={handleDisplayClick}
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
                    onDisplayClick={handleDisplayClick}
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
