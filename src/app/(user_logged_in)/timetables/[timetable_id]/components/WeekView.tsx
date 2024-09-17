"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { calculateDuration } from "~/lib/utils";
import type { Slot, Class } from "~/server/db/types";
import { TimeSlot } from "./slot/TimeSlot";
import { HOUR_SIZE_PIXELS } from "~/lib/constants";

type CalendarProps = {
  start_time: number;
  end_time: number;
  days: string[];
  timeSlots: Slot[];
  classes: Class[];
  onDeleteSlot: (id: string) => void;
  onCreateSlot: (slot: Omit<Slot, "id">) => void;
  onEditSlot: (slot: Slot, editFuture: boolean) => void;
};

export default function WeekView({
  start_time = 9,
  end_time = 16,
  days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  timeSlots = [],
  classes = [],
  onDeleteSlot,
  onCreateSlot,
  onEditSlot,
}: CalendarProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    return new Date(
      now.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)),
    );
  });

  const goToPreviousWeek = () => {
    setCurrentWeekStart((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  };

  const goToNextWeek = () => {
    setCurrentWeekStart((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
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

    const top =
      (startHour + startMinute / HOUR_SIZE_PIXELS - start_time) *
      HOUR_SIZE_PIXELS;
    const height =
      (endHour +
        endMinute / HOUR_SIZE_PIXELS -
        (startHour + startMinute / HOUR_SIZE_PIXELS)) *
      HOUR_SIZE_PIXELS;

    return {
      top: `${top}px`,
      height: `${height}px`,
    };
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
              className={`mb-10 h-[${HOUR_SIZE_PIXELS}px] text-right text-sm text-muted-foreground`}
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
                    onDeleteSlot={onDeleteSlot}
                    getSlotStyle={getSlotStyle}
                    onEditSlot={(updatedSlot) => onEditSlot(updatedSlot, false)}
                    calculateDuration={calculateDuration}
                    timetableDays={days}
                  />
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}