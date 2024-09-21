import React, { useEffect, useState } from "react";
import ClassItem from "./ClassItem";
import type { Class } from "~/server/db/types";
import { useDroppable } from "@dnd-kit/core";

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
  const [classItems, setClassItems] = useState<Class[]>(classes);

  const { setNodeRef } = useDroppable({
    id: "unassigned-area",
    data: {
      type: "UnassignedArea",
    },
  });

  useEffect(() => {
    setClassItems(classes);
  }, [classes]);

  return (
    <div
      ref={setNodeRef}
      className="mt-5 flex flex-col gap-5 rounded-lg bg-foreground/5 p-3"
    >
      <div className="w-full">
        <h3 className="mb-2 text-center text-lg font-medium">
          Unassigned Classes
        </h3>
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
      </div>
    </div>
  );
};

export default ClassList;
