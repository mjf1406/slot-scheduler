import React from "react";
import type { Slot, Class } from "~/server/db/types";
import { EditTimeSlotDialog } from "./components/EditTimeSlotDialog";
import { ActionDropdown } from "./components/ActionDropdown";
import { useDroppable } from "@dnd-kit/core";
import ClassItem from "../class/ClassItem";
import { cn } from "~/lib/utils";

interface TimeSlotProps {
  slot: Slot;
  classes: Class[];
  onDeleteSlot: (id: string) => void;
  onEditSlot: (updatedSlot: Slot) => void;
  getSlotStyle: (slot: Slot) => React.CSSProperties;
  calculateDuration: (start_time: string, end_time: string) => string;
  timetableDays: string[];
  onEditClass: (updatedClass: Class) => Promise<void>;
  onDeleteClass: (id: string) => Promise<void>;
}

export const TimeSlot: React.FC<TimeSlotProps> = ({
  slot,
  classes,
  onDeleteSlot,
  onEditSlot,
  getSlotStyle,
  calculateDuration,
  timetableDays,
  onEditClass,
  onDeleteClass,
}) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const { isOver, setNodeRef } = useDroppable({
    id: slot.slot_id,
    data: {
      type: "TimeSlot",
      slot: slot,
    },
  });

  return (
    <div
      ref={setNodeRef}
      key={slot.slot_id}
      className={cn(
        "absolute left-1 right-1 flex flex-col justify-between overflow-hidden rounded bg-accent/20 p-1",
        { "bg-accent/40": isOver },
      )}
      style={{ ...getSlotStyle(slot), zIndex: 1 }}
    >
      <div className="text-4xs font-semibold md:text-xs">
        {slot.start_time} - {slot.end_time}
      </div>
      {classes.map((classItem) => (
        <div key={classItem.class_id} className="flex h-full flex-col">
          <ClassItem
            classData={classItem}
            onEdit={onEditClass}
            onDelete={onDeleteClass}
            timetableId={slot.timetable_id}
            size="small"
          />
        </div>
      ))}
      <div className="flex items-end justify-between">
        <span className="text-4xs md:text-xs">
          {calculateDuration(slot.start_time, slot.end_time)}
        </span>
        <ActionDropdown
          onEdit={() => setIsEditDialogOpen(true)}
          onDelete={() => onDeleteSlot(slot.slot_id)}
        />
      </div>

      <EditTimeSlotDialog
        slot={slot}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onEditSlot={onEditSlot}
        timetableDays={timetableDays}
      />
    </div>
  );
};
