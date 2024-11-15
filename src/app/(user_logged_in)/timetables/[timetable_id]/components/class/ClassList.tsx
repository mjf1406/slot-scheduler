import React, { useEffect, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Button } from "~/components/ui/button";
import ClassItem from "./ClassItem";
import type { Class, SlotClass } from "~/server/db/types";
import { addExampleClasses } from "../../actions";
import { getYearAndWeekNumber } from "../../utils";

interface ClassListProps {
  classes: Class[];
  onEdit: (updatedClass: Class) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClassClick: (classData: SlotClass | Class) => void;
  onDisplayClick: (classData: Class | SlotClass) => void;
  timetableId: string;
  slotClasses: SlotClass[];
  currentWeekStart: Date;
}

interface ClassItemData {
  classData: Class;
  slotClass?: SlotClass;
}

const ClassList: React.FC<ClassListProps> = ({
  classes,
  onEdit,
  onDelete,
  onClassClick,
  onDisplayClick,
  timetableId,
  slotClasses,
  currentWeekStart,
}) => {
  const [classItems, setClassItems] = useState<ClassItemData[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [showHidden, setShowHidden] = useState(false);
  const { year, weekNumber } = getYearAndWeekNumber(currentWeekStart);

  const { setNodeRef } = useDroppable({
    id: "unassigned-area",
    data: {
      type: "UnassignedArea",
    },
  });

  // Combine classes with their corresponding slotClasses
  useEffect(() => {
    const nullClasses = classes.filter((cls) => !cls.year && !cls.weekNumber);
    const currentWeekClasses = classes.filter(
      (cls) => cls.year === year && cls.weekNumber === weekNumber,
    );

    const combinedClasses: ClassItemData[] = [
      ...nullClasses,
      ...currentWeekClasses,
    ].map((cls) => {
      const slotClass = slotClasses.find(
        (sc) =>
          sc.class_id === cls.class_id &&
          sc.year === year &&
          sc.week_number === weekNumber,
      );
      return { classData: cls, slotClass };
    });

    setClassItems(combinedClasses);
  }, [classes, slotClasses, year, weekNumber]);

  const handleHiddenChange = (class_id: string, newHiddenState: boolean) => {
    setClassItems((prevItems) =>
      prevItems.map((item) => {
        if (item.classData.class_id === class_id) {
          return {
            ...item,
            slotClass: {
              ...item.slotClass,
              hidden: newHiddenState,
            } as SlotClass,
          };
        }
        return item;
      }),
    );
  };

  const handleAddExampleClasses = async () => {
    setIsAdding(true);
    try {
      const newClasses = await addExampleClasses(timetableId);
      const newClassItems: ClassItemData[] = newClasses.map((cls) => ({
        classData: cls,
        slotClass: undefined,
      }));
      setClassItems((prev) => [...prev, ...newClassItems]);
    } catch (error) {
      console.error("Failed to add example classes:", error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      className="mt-5 flex flex-col gap-5 rounded-lg bg-foreground/5 p-3"
    >
      <div className="flex w-full flex-col items-center justify-center gap-2">
        <h3 className="text-center text-lg font-medium">Unassigned Classes</h3>
        <div>
          {slotClasses.some(
            (sc) =>
              sc.hidden && sc.year === year && sc.week_number === weekNumber,
          ) && (
            <Button
              variant={"outline"}
              onClick={() => setShowHidden((prev) => !prev)}
            >
              {showHidden ? "Hide hidden classes" : "Show hidden classes"}
            </Button>
          )}
        </div>
        {classItems.length === 0 ? (
          <div className="flex justify-center">
            <Button onClick={handleAddExampleClasses} disabled={isAdding}>
              {isAdding ? "Adding..." : "Add Example Classes"}
            </Button>
          </div>
        ) : (
          <div className="grid w-full grid-cols-2 flex-col gap-1 md:grid-cols-3 lg:grid-cols-4 xl:flex">
            {classItems.map(({ classData, slotClass }) => {
              const isComplete = slotClass?.complete ?? false;

              if (slotClass?.hidden && !showHidden) return null;

              return (
                <ClassItem
                  key={classData.class_id}
                  classData={classData}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onClick={onClassClick}
                  onDisplayClick={onDisplayClick}
                  timetableId={timetableId}
                  isComplete={isComplete}
                  isHidden={slotClass?.hidden ?? false}
                  slotId={slotClass?.slot_id ?? null}
                  slotClassData={slotClass}
                  year={year}
                  weekNumber={weekNumber}
                  onHiddenChange={handleHiddenChange}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassList;
