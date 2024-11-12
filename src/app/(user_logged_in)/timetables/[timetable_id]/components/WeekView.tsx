// WeekView.tsx
"use client";

import React, { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { calculateDuration, cn } from "~/lib/utils";
import type { Slot, Class, SlotClass } from "~/server/db/types";
import { TimeSlot } from "./slot/TimeSlot";
import { HOUR_SIZE_PIXELS, MINUTE_SIZE_PIXELS } from "~/lib/constants";
import ClassItem from "./class/ClassItem";
import { getYearAndWeekNumber } from "../utils";

interface ExtendedClass extends Class {
  slot_id?: string;
}

type CalendarProps = {
  start_time: number;
  end_time: number;
  days: string[];
  timeSlots: Slot[];
  classes: ExtendedClass[];
  slotClasses: SlotClass[];
  onDeleteSlot: (id: string) => void;
  onCreateSlot: (slot: Omit<Slot, "id">) => void;
  onEditSlot: (slot: Slot, editFuture: boolean) => void;
  onEditClass: (updatedClass: Class) => Promise<void>;
  onDeleteClass: (id: string) => Promise<void>;
  currentWeekStart: Date;
  onWeekChange: (newWeekStart: Date) => void;
  onClassClick: (classData: Class | SlotClass) => void;
  onDisplayClick: (classData: Class | SlotClass) => void;
};

export default function WeekView({
  start_time = 9,
  end_time = 16,
  days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  timeSlots = [],
  classes = [],
  slotClasses = [],
  onDeleteSlot,
  onCreateSlot,
  onEditSlot,
  onEditClass,
  onDeleteClass,
  currentWeekStart,
  onWeekChange,
  onClassClick,
  onDisplayClick,
}: CalendarProps) {
  const { year, weekNumber } = getYearAndWeekNumber(currentWeekStart);
  const renderClassInSlot = (slot: Slot, classItem: Class) => {
    return (
      <div
        key={classItem.class_id}
        className={cn(
          "absolute left-0 right-0 overflow-hidden rounded",
          isPastTimeSlot(slot) ? "opacity-50" : "",
        )}
        style={getSlotStyle(slot)}
      >
        <div className="mt-5 flex h-full flex-col">
          <ClassItem
            classData={classItem}
            onEdit={onEditClass}
            onDelete={onDeleteClass}
            timetableId={slot.timetable_id}
            onClick={onClassClick}
            onDisplayClick={onDisplayClick}
            isHidden={false}
            slotId={slot.slot_id} // Added
            year={year} // Added
            weekNumber={weekNumber} // Added
          />
        </div>
      </div>
    );
  };

  const goToPreviousWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() - 7);
    onWeekChange(newWeekStart);
  };

  const goToNextWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() + 7);
    onWeekChange(newWeekStart);
  };

  const generateWeekDays = () => {
    return days.map((day, index) => {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + index);
      return { day, date };
    });
  };

  const weekDays = generateWeekDays();

  const hours = Array.from(
    { length: end_time - start_time + 1 },
    (_, i) => start_time + i,
  );

  const getSlotStyle = (slot: Slot) => {
    const [startHour, startMinute] = slot.start_time.split(":").map(Number);
    const [endHour, endMinute] = slot.end_time.split(":").map(Number);

    if (
      startHour === undefined ||
      startMinute === undefined ||
      endHour === undefined ||
      endMinute === undefined
    ) {
      return { top: "0px", height: "0px" };
    }

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    const startTimeMinutes = start_time * 60;

    const top = (startMinutes - startTimeMinutes) * MINUTE_SIZE_PIXELS;
    const height = (endMinutes - startMinutes) * MINUTE_SIZE_PIXELS;

    return {
      top: `${top}px`,
      height: `${height}px`,
    };
  };

  const getClassesForSlot = (slot: Slot) => {
    return classes.filter((cls) => {
      const slotClass = slotClasses.find(
        (sc) => sc.class_id === cls.class_id && sc.slot_id === slot.slot_id,
      );
      return !!slotClass;
    });
  };

  const isPastTimeSlot = (slot: Slot) => {
    if (!slot.end_time || !slot.day) {
      return false; // If end_time or day is undefined or empty, consider it not past
    }

    const now = new Date();
    const slotDate = new Date(currentWeekStart);
    const slotDay = days.indexOf(slot.day);

    if (slotDay === -1) {
      return false; // If the day is not found in the days array, consider it not past
    }

    slotDate.setDate(slotDate.getDate() + slotDay);

    const timeParts = slot.end_time.split(":");
    if (timeParts.length !== 2) {
      return false; // Invalid time format
    }

    if (!timeParts[0] || !timeParts[1]) return false;
    const endHour = parseInt(timeParts[0], 10);
    const endMinute = parseInt(timeParts[1], 10);

    if (!isNaN(endHour) && !isNaN(endMinute)) {
      slotDate.setHours(endHour, endMinute, 0, 0);
      return now > slotDate;
    }
    return false;
  };

  // Define handleToggleDisable
  const handleToggleDisable = useCallback(
    (slot: Slot) => {
      const updatedSlot = { ...slot, disabled: !slot.disabled };
      onEditSlot(updatedSlot, false);
    },
    [onEditSlot],
  );

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex items-center justify-between">
        <Button onClick={goToPreviousWeek} variant="outline" size="icon">
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous week</span>
        </Button>
        <h2 className="text-lg font-semibold">
          {currentWeekStart.toLocaleDateString()} -{" "}
          {weekDays[weekDays.length - 1]?.date.toLocaleDateString()}
        </h2>
        <Button onClick={goToNextWeek} variant="outline" size="icon">
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next week</span>
        </Button>
      </div>
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `auto repeat(${days.length}, 1fr)` }}
      >
        <div></div>
        {weekDays.map(({ day, date }) => (
          <div key={day} className="text-center text-xs md:text-base">
            <div className="font-semibold">{day.slice(0, 3)}.</div>
            <div className="text-2xs text-muted-foreground md:text-sm">
              {date.getDate()}
            </div>
          </div>
        ))}
        <div
          className="relative"
          style={{
            gridColumn: "1",
            gridRow: "2",
            marginTop: "-5px",
          }}
        >
          {hours.map((hour) => (
            <div
              key={hour}
              style={{ height: `${HOUR_SIZE_PIXELS}px` }}
              className="text-right text-sm text-muted-foreground"
            >
              {hour === 0
                ? "12 AM"
                : hour < 12
                  ? `${hour} AM`
                  : hour === 12
                    ? "12 PM"
                    : `${hour - 12} PM`}
            </div>
          ))}
        </div>
        <div
          className="relative col-span-7"
          style={{
            gridColumn: "2 / -1",
            gridRow: "2",
            height: `${(end_time - start_time + 1) * HOUR_SIZE_PIXELS}px`,
          }}
        >
          {hours.map((hour) => (
            <div
              key={hour}
              className="absolute left-0 right-0 border-t border-gray-200 border-opacity-25"
              style={{
                top: `${(hour - start_time) * HOUR_SIZE_PIXELS}px`,
                height: "1px",
              }}
            />
          ))}
          {days.map((day, dayIndex) => (
            <div
              key={day}
              className="absolute bottom-0 top-0 border-r border-gray-200 border-opacity-25"
              style={{
                left: `${(dayIndex / days.length) * 100}%`,
                width: `${100 / days.length}%`,
              }}
            >
              {timeSlots
                .filter((slot) => slot.day === day)
                .map((slot) => (
                  <TimeSlot
                    key={slot.slot_id}
                    slot={slot}
                    classes={getClassesForSlot(slot)}
                    slotClasses={slotClasses.filter(
                      (sc) => sc.slot_id === slot.slot_id,
                    )}
                    onDeleteSlot={onDeleteSlot}
                    getSlotStyle={getSlotStyle}
                    onEditSlot={(updatedSlot) => onEditSlot(updatedSlot, false)}
                    calculateDuration={calculateDuration}
                    timetableDays={days}
                    onEditClass={onEditClass}
                    onDeleteClass={onDeleteClass}
                    onClassClick={onClassClick}
                    onDisplayClick={onDisplayClick}
                    isPastTimeSlot={isPastTimeSlot}
                    isDisabled={slot.disabled} // Pass isDisabled
                    onToggleDisable={() => handleToggleDisable(slot)} // Pass onToggleDisable
                    year={year}
                    weekNumber={weekNumber}
                  />
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
