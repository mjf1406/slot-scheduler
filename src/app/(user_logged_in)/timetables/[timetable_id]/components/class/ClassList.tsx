// components/class/ClassList.tsx
import React, { useEffect, useState } from "react";
import ClassItem from "./ClassItem";
import type { Class } from "~/server/db/types";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  rectIntersection,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";

interface ClassListProps {
  classes: Class[];
  onEdit: (updatedClass: Class) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  timetableId: string;
}

const ClassList: React.FC<ClassListProps> = ({
  classes,
  onEdit,
  onDelete,
  timetableId,
}) => {
  // Manage the state of class items
  const [classItems, setClassItems] = useState<Class[]>(classes);
  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));
  // Update state when classes prop changes
  useEffect(() => {
    setClassItems(classes);
  }, [classes]);

  // Handle the drag end event to reorder items
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      setClassItems((items) => {
        const oldIndex = items.findIndex((item) => item.class_id === active.id);
        const newIndex = items.findIndex((item) => item.class_id === over.id);

        const newItems = [...items];
        const [movedItem] = newItems.splice(oldIndex, 1);
        if (movedItem) newItems.splice(newIndex, 0, movedItem);

        return newItems;
      });
    }
  };

  return (
    <div className="mt-5 flex flex-col gap-5 rounded-lg bg-foreground/5 p-3">
      <div className="w-full">
        <h3 className="mb-2 text-center text-lg font-medium">
          Unassigned Classes
        </h3>
        <DndContext
          collisionDetection={rectIntersection}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToWindowEdges]}
          sensors={sensors}
        >
          <div className="m-auto flex w-full flex-col gap-1">
            {classItems.map(
              (cls) =>
                cls && (
                  <ClassItem
                    key={cls.class_id}
                    classData={cls}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    timetableId={timetableId}
                  />
                ),
            )}
          </div>
        </DndContext>
      </div>
    </div>
  );
};

export default ClassList;
