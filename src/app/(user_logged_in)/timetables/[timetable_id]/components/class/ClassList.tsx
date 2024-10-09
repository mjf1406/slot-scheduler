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
  timetableId: string;
  onDisplayClick: (classData: Class | SlotClass) => void;
  slotClasses: SlotClass[];
  currentWeekStart: Date;
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
  const [classItems, setClassItems] = useState<Class[]>(classes);
  const [isAdding, setIsAdding] = useState(false);

  const { setNodeRef } = useDroppable({
    id: "unassigned-area",
    data: {
      type: "UnassignedArea",
    },
  });

  useEffect(() => {
    setClassItems(classes);
  }, [classes]);

  const handleAddExampleClasses = async () => {
    setIsAdding(true);
    try {
      const newClasses = await addExampleClasses(timetableId);
      setClassItems((prev) => [...prev, ...newClasses]);
    } catch (error) {
      console.error("Failed to add example classes:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const { year, weekNumber } = getYearAndWeekNumber(currentWeekStart);

  return (
    <div
      ref={setNodeRef}
      className="mt-5 flex flex-col gap-5 rounded-lg bg-foreground/5 p-3"
    >
      <div className="w-full">
        <h3 className="mb-2 text-center text-lg font-medium">
          Unassigned Classes
        </h3>
        {classItems.length === 0 ? (
          <div className="flex justify-center">
            <Button onClick={handleAddExampleClasses} disabled={isAdding}>
              {isAdding ? "Adding..." : "Add Example Classes"}
            </Button>
          </div>
        ) : (
          <div className="m-auto flex w-full flex-col gap-1">
            {classItems.map((cls) => {
              if (!cls) return null;
              const slotClass = slotClasses.find(
                (sc) =>
                  sc.class_id === cls.class_id &&
                  sc.year === year &&
                  sc.week_number === weekNumber,
              );
              const isComplete = slotClass?.complete ?? false;
              console.log("🚀 ~ {classItems.map ~ isComplete:", isComplete);

              return (
                <ClassItem
                  key={cls.class_id}
                  classData={cls}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onClick={onClassClick}
                  onDisplayClick={onDisplayClick}
                  timetableId={timetableId}
                  isComplete={isComplete}
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
