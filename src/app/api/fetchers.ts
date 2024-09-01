import type { Class, Timetable } from "~/server/db/types";

export interface TimetableWithClasses extends Timetable {
  classes: Class[];
}

export const fetchTimetables = async (): Promise<TimetableWithClasses[]> => {
  const response = await fetch('/api/getTimetables');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return await response.json() as TimetableWithClasses[];
};