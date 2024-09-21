// components/TimeSlot.tsx
"use client";

import React from "react";
import type { Slot } from "~/server/db/types";
import { EditTimeSlotDialog } from "./components/EditTimeSlotDialog";
import { ActionDropdown } from "./components/ActionDropdown";
interface TimeSlotProps {
  slot: Slot;
  onDeleteSlot: (id: string) => void;
  onEditSlot: (updatedSlot: Slot) => void;
  getSlotStyle: (slot: Slot) => React.CSSProperties;
  calculateDuration: (start_time: string, end_time: string) => string;
  timetableDays: string[];
}

export const TimeSlot: React.FC<TimeSlotProps> = ({
  slot,
  onDeleteSlot,
  onEditSlot,
  getSlotStyle,
  calculateDuration,
  timetableDays,
}) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  return (
    <div
      key={slot.slot_id}
      className="absolute left-1 right-1 flex flex-col justify-between overflow-hidden rounded bg-accent/20 p-1"
      style={getSlotStyle(slot)}
    >
      <div className="text-4xs font-semibold md:text-xs">
        {slot.start_time} - {slot.end_time}
      </div>
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
