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

export function getUnassignedClassesForWeek(timetable: Timetable, weekStart: Date): Class[] {
  const { year, weekNumber } = getYearAndWeekNumber(weekStart);
  return timetable.classes.filter((cls) => {
    const slotClass = timetable.slotClasses?.find(
      (sc) =>
        sc.class_id === cls.class_id &&
        sc.year === year &&
        sc.week_number === weekNumber,
    );
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    return !slotClass || slotClass.slot_id === null;
  });
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

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

interface WeekDateResult {
    success: boolean;
    date?: string;
    formattedDay?: DayOfWeek;
    error?: string;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDateFromWeekNumber(
  year: number, 
  weekNumber: number, 
  targetDay: DayOfWeek
): WeekDateResult {
  // Input validation
  if (!Number.isInteger(year) || !Number.isInteger(weekNumber)) {
      return {
          success: false,
          error: 'Year and week number must be integers'
      };
  }

  if (weekNumber < 1 || weekNumber > 53) {
      return {
          success: false,
          error: 'Week number must be between 1 and 53'
      };
  }

  if (year < 1 || year > 9999) {
      return {
          success: false,
          error: 'Year must be between 1 and 9999'
      };
  }

  try {
      // Array of day names
      const days: DayOfWeek[] = [
          'Monday', 'Tuesday', 'Wednesday', 'Thursday',
          'Friday', 'Saturday', 'Sunday'
      ];

      // Find January 1st of the given year
      const januaryFirst = new Date(year, 0, 1);
      
      // Calculate the first week of the year
      // According to ISO 8601, week 1 is the week with the first Thursday
      const dayOffset = januaryFirst.getDay();
      const firstMonday = new Date(year, 0, 1 + ((8 - dayOffset) % 7));
      
      // Calculate the Monday of the target week
      const targetWeekMonday = new Date(firstMonday);
      targetWeekMonday.setDate(firstMonday.getDate() + (weekNumber - 1) * 7);

      // Calculate the target day within that week
      const dayIndex = days.indexOf(targetDay);
      if (dayIndex === -1) {
          return {
              success: false,
              error: 'Invalid day provided'
          };
      }

      // Add days to Monday to get to the target day
      const targetDate = new Date(targetWeekMonday);
      targetDate.setDate(targetWeekMonday.getDate() + dayIndex);

      return {
          success: true,
          date: formatDate(targetDate),
          formattedDay: targetDay
      };

  } catch (error) {
      return {
          success: false,
          error: 'Error calculating date'
      };
  }
}