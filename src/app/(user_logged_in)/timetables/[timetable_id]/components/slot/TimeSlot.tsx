// TimeSlot.tsx
import React, { useState, useCallback } from "react";
import type { Slot, Class, SlotClass } from "~/server/db/types";
import { EditTimeSlotDialog } from "./components/EditTimeSlotDialog";
import { ActionDropdown } from "./components/ActionDropdown";
import { useDroppable } from "@dnd-kit/core";
import ClassItem from "../class/ClassItem";
import { cn } from "~/lib/utils";
import { CircleMinus } from "lucide-react";
import { toggleSlotDisabled } from "../../actions";
import { DayOfWeek, getDateFromWeekNumber } from "../../utils";

interface TimeSlotProps {
  slot: Slot;
  classes: Class[];
  slotClasses: SlotClass[];
  onDeleteSlot: (id: string) => void;
  onEditSlot: (updatedSlot: Slot) => void;
  getSlotStyle: (slot: Slot) => React.CSSProperties;
  calculateDuration: (start_time: string, end_time: string) => string;
  timetableDays: string[];
  onEditClass: (updatedClass: Class) => Promise<void>;
  onDeleteClass: (id: string) => Promise<void>;
  onClassClick: (classData: Class) => void;
  onDisplayClick: (classData: Class) => void;
  isPastTimeSlot: (slot: Slot) => boolean;
  isDisabled: boolean | undefined; // New prop
  onToggleDisable: () => void; // New prop
  year: number; // New prop
  weekNumber: number; // New prop
}

export const TimeSlot: React.FC<TimeSlotProps> = ({
  slot,
  classes,
  slotClasses,
  onDeleteSlot,
  onEditSlot,
  getSlotStyle,
  calculateDuration,
  timetableDays,
  onEditClass,
  onDeleteClass,
  onClassClick,
  onDisplayClick,
  isPastTimeSlot,
  isDisabled, // New prop
  onToggleDisable, // New prop
  year, // New prop
  weekNumber, // New prop
}) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [disabled, setDisabled] = useState(isDisabled);
  const { isOver, setNodeRef } = useDroppable({
    id: slot.slot_id,
    disabled: disabled,
    data: {
      type: "TimeSlot",
      slot: slot,
    },
  });

  const handleEditClick = useCallback(() => {
    setIsEditDialogOpen(true);
    setIsDropdownOpen(false);
  }, []);

  const handleDeleteClick = useCallback(() => {
    onDeleteSlot(slot.slot_id);
    setIsDropdownOpen(false);
  }, [onDeleteSlot, slot.slot_id]);

  const handleToggleDisable = useCallback(async () => {
    setDisabled(!disabled);
    setIsDropdownOpen(false);
    try {
      const disabledDate = getDateFromWeekNumber(
        year,
        weekNumber,
        slot.day as DayOfWeek,
      );
      if (disabledDate.success && disabledDate.date) {
        const result = await toggleSlotDisabled(
          slot.slot_id,
          disabledDate.date,
        );
        console.log(result.message);
      }
    } catch (error) {
      console.error("Error toggling slot disabled status:", error);
      setDisabled(!disabled);
    }
  }, [disabled, year, weekNumber, slot.day, slot.slot_id]);

  const isPast = isPastTimeSlot(slot);

  return (
    <>
      <div
        ref={setNodeRef}
        key={slot.slot_id}
        className={cn(
          "absolute left-1 right-1 flex flex-col justify-between overflow-hidden rounded border border-accent bg-accent/20 p-1",
          { "bg-accent/40": isOver },
          isPast || disabled ? "opacity-50" : "",
        )}
        style={{ ...getSlotStyle(slot), zIndex: 1 }}
      >
        <div className="text-4xs font-semibold md:text-xs">
          {slot.start_time} - {slot.end_time}
        </div>
        {disabled && (
          <div className="flex h-full w-full items-center justify-center opacity-60">
            <CircleMinus size={54} />
          </div>
        )}
        {classes.map((classItem) => {
          const slotClass = slotClasses.find(
            (sc) =>
              sc.class_id === classItem.class_id && sc.slot_id === slot.slot_id,
          );
          const isComplete = slotClass?.complete ?? false;
          const isHidden = slotClass?.hidden ?? false;

          return (
            <div key={classItem.class_id} className="flex h-full flex-col">
              <ClassItem
                classData={classItem}
                onEdit={onEditClass}
                onDelete={onDeleteClass}
                onClick={onClassClick}
                onDisplayClick={onDisplayClick}
                timetableId={slot.timetable_id}
                size="small"
                isComplete={isComplete}
                isHidden={isHidden} // Added
                slotId={slot.slot_id} // Added
                slotClassData={slotClass} // Added
                year={year} // Added
                weekNumber={weekNumber} // Added
              />
            </div>
          );
        })}
        <div className="flex items-end justify-between">
          <span className="text-4xs md:text-xs">
            {calculateDuration(slot.start_time, slot.end_time)}
          </span>
          <ActionDropdown
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onToggleDisable={handleToggleDisable} // Pass onToggleDisable
            isDisabled={disabled}
            isOpen={isDropdownOpen}
            onOpenChange={setIsDropdownOpen}
          />
        </div>

        <EditTimeSlotDialog
          slot={slot}
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setIsDropdownOpen(false);
          }}
          onEditSlot={(updatedSlot) => {
            onEditSlot(updatedSlot);
            setIsEditDialogOpen(false);
            setIsDropdownOpen(false);
          }}
          timetableDays={timetableDays}
        />
      </div>
    </>
  );
};
