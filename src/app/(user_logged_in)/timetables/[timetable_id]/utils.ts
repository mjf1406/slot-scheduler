import type { CollisionDetection } from '@dnd-kit/core';
import type { Timetable, Class } from '~/server/db/types';

export const customCollisionDetection: CollisionDetection = ({
  droppableContainers,
  pointerCoordinates,
}) => {
  if (!pointerCoordinates) {
    return [];
  }

  const timeSlots = droppableContainers.filter(
    (container) => container.data.current?.type === "TimeSlot"
  );

  const classItems = droppableContainers.filter(
    (container) => container.data.current?.type === "ClassItem"
  );

  const unassignedArea = droppableContainers.find(
    (container) => container.data.current?.type === "UnassignedArea"
  );

  // Check collision with TimeSlots
  for (const timeSlot of timeSlots) {
    const rect = timeSlot.rect.current;
    if (
      rect &&
      pointerCoordinates.x >= rect.left &&
      pointerCoordinates.x <= rect.right &&
      pointerCoordinates.y >= rect.top &&
      pointerCoordinates.y <= rect.bottom
    ) {
      return [{ id: timeSlot.id }];
    }
  }

  // Check collision with ClassItems
  for (const classItem of classItems) {
    const rect = classItem.rect.current;
    if (
      rect &&
      pointerCoordinates.x >= rect.left &&
      pointerCoordinates.x <= rect.right &&
      pointerCoordinates.y >= rect.top &&
      pointerCoordinates.y <= rect.bottom
    ) {
      return [{ id: classItem.id }];
    }
  }

  // Check collision with UnassignedArea
  if (unassignedArea) {
    const rect = unassignedArea.rect.current;
    if (
      rect &&
      pointerCoordinates.x >= rect.left &&
      pointerCoordinates.x <= rect.right &&
      pointerCoordinates.y >= rect.top &&
      pointerCoordinates.y <= rect.bottom
    ) {
      return [{ id: unassignedArea.id }];
    }
  }

  return [];
};

export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function getYearAndWeekNumber(date: Date) {
  const year = date.getFullYear();
  const weekNumber = getWeekNumber(date);
  return { year, weekNumber };
}

export function getClassesForWeek(
  timetable: Timetable,
  currentWeekStart: Date
): Class[] {
  const { year, weekNumber } = getYearAndWeekNumber(currentWeekStart);

  const assignedClassIds = new Set(
    (timetable.slotClasses ?? [])
      .filter(
        (slotClass) =>
          slotClass.year === year && slotClass.week_number === weekNumber
      )
      .map((slotClass) => slotClass.class_id)
  );

  return timetable.classes.filter((cls) => assignedClassIds.has(cls.class_id));
}

export function getUnassignedClassesForWeek(
  timetable: Timetable,
  currentWeekStart: Date
): Class[] {
  const { year, weekNumber } = getYearAndWeekNumber(currentWeekStart);

  const assignedClassIds = new Set(
    (timetable.slotClasses ?? [])
      .filter(
        (slotClass) =>
          slotClass.year === year && slotClass.week_number === weekNumber
      )
      .map((slotClass) => slotClass.class_id)
  );

  return timetable.classes.filter(
    (cls) => !assignedClassIds.has(cls.class_id)
  );
}

export function calculateDateFromDay(day: string, weekStart: Date): Date {
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const targetDay = daysOfWeek.indexOf(day);

  const targetDate = new Date(weekStart);
  targetDate.setDate(weekStart.getDate() + targetDay);
  targetDate.setHours(12, 0, 0, 0); // Reset the time to noon to avoid timezone issues

  return targetDate;
}