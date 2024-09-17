import React from "react";
import ClassItem from "./ClassItem";
import type { Class } from "~/server/db/types";

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
  const assignedClasses = classes.filter((cls) => cls.day !== "");
  const unassignedClasses = classes.filter((cls) => cls.day === "");

  return (
    // <div className="mt-5 grid grid-cols-2 gap-5 rounded-lg bg-foreground/5 p-3">
    <div className="mt-5 flex flex-col gap-5 rounded-lg bg-foreground/5 p-3">
      {/* <div className="col-span-1"> */}
      <div className="w-full">
        <h3 className="mb-2 text-center text-lg font-medium">
          Unassigned Classes
        </h3>
        <div className="m-auto flex w-full flex-col gap-1">
          {unassignedClasses.map((cls) => (
            <ClassItem
              key={cls.class_id}
              classData={cls}
              onEdit={onEdit}
              onDelete={onDelete}
              timetableId={timetableId}
            />
          ))}
        </div>
      </div>
      {/* <div className="col-span-1">
        <h3 className="mb-2 text-center text-lg font-medium">
          Assigned Classes
        </h3>
        <div className="m-auto flex w-full flex-col gap-1">
          {assignedClasses.map((cls) => (
            <ClassItem
              key={cls.class_id}
              classData={cls}
              onEdit={onEdit}
              onDelete={onDelete}
              timetableId={timetableId}
            />
          ))}
        </div>
      </div> */}
    </div>
  );
};

export default ClassList;
