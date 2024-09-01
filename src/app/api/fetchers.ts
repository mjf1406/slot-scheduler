import type { Timetable } from "~/server/db/types";

export const fetchTimetables = async (): Promise<Timetable[]> => {
  const response = await fetch('/api/getTimetables');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return await response.json() as Timetable[];
};