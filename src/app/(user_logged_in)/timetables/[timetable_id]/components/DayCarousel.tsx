"use client";

import { useCallback, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { calculateDuration } from "~/lib/utils";
import type { Slot, Class, SlotClass } from "~/server/db/types";
import { TimeSlot } from "./slot/TimeSlot";
import { HOUR_SIZE_PIXELS } from "~/lib/constants";
import { getYearAndWeekNumber } from "../utils";

type CalendarCarouselProps = {
  start_time: number; // 0-23
  end_time: number; // 0-23
  days: string[];
  timeSlots: Slot[];
  classes: ExtendedClass[];
  slotClasses: SlotClass[];
  onDeleteSlot: (id: string) => void;
  onCreateSlot: (
    slot: Omit<Slot, "id" | "user_id" | "timetable_id">,
  ) => Promise<void>; // Add this line
  onEditSlot: (slot: Slot, editFuture: boolean) => void;
  onEditClass: (updatedClass: Class) => Promise<void>;
  onDeleteClass: (id: string) => Promise<void>;
  currentWeekStart: Date;
  onWeekChange: (newWeekStart: Date) => void;
  onClassClick: (classData: Class | SlotClass) => void;
  onDisplayClick: (classData: Class | SlotClass) => void;
};

interface ExtendedClass extends Class {
  slot_id?: string;
}

export default function DayCarousel({
  start_time = 9,
  end_time = 17,
  days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  timeSlots = [],
  classes = [],
  slotClasses = [],
  onDeleteSlot,
  onCreateSlot, // Add this line
  onEditSlot,
  onEditClass,
  onDeleteClass,
  currentWeekStart,
  onWeekChange,
  onClassClick,
  onDisplayClick,
}: CalendarCarouselProps) {
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const { year, weekNumber } = getYearAndWeekNumber(currentWeekStart);
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

  const goToPreviousDays = () => {
    setCurrentDayIndex((prevIndex) =>
      prevIndex === 0 ? days.length - 2 : prevIndex - 2,
    );
  };

  const goToNextDays = () => {
    setCurrentDayIndex((prevIndex) =>
      prevIndex >= days.length - 2 ? 0 : prevIndex + 2,
    );
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

    const top = (startHour + startMinute / 60 - start_time) * HOUR_SIZE_PIXELS;
    const height =
      (endHour + endMinute / 60 - (startHour + startMinute / 60)) *
      HOUR_SIZE_PIXELS;

    return {
      top: `${top}px`,
      height: `${height}px`,
    };
  };

  const visibleDays = days.slice(currentDayIndex, currentDayIndex + 2);
  const visibleDates = weekDays.slice(currentDayIndex, currentDayIndex + 2);

  const handleToggleDisable = useCallback(
    (slot: Slot) => {
      const updatedSlot = { ...slot, disabled: !slot.isDisabled };
      onEditSlot(updatedSlot, false);
    },
    [onEditSlot],
  );

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
      <div className="mb-4 flex items-center justify-between">
        <Button onClick={goToPreviousDays} variant="outline" size="icon">
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous days</span>
        </Button>
        <h3 className="text-md font-semibold">{visibleDays.join(" - ")}</h3>
        <Button onClick={goToNextDays} variant="outline" size="icon">
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next days</span>
        </Button>
      </div>
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `auto repeat(2, 1fr)` }}
      >
        <div></div>
        {visibleDates.map(({ day, date }) => (
          <div key={day} className="text-center">
            <div className="font-semibold">{day}</div>
            <div className="text-sm text-muted-foreground">
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
          className="relative col-span-2"
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
          {visibleDays.map((day, dayIndex) => (
            <div
              key={day}
              className="absolute bottom-0 top-0 border-r border-gray-200 border-opacity-25"
              style={{
                left: `${(dayIndex / 2) * 100}%`,
                width: `${100 / 2}%`,
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
                    isDisabled={slot.isDisabled} // Pass isDisabled
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
