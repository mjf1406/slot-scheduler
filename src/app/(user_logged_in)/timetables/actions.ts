"use server"

import { generateUuidWithPrefix } from "~/lib/utils";
import { db } from "~/server/db";
import { timetables } from "~/server/db/schema";
import type { Activity } from "~/server/db/types";
import { auth } from '@clerk/nextjs/server'
import type { FormSchema } from './form-schemas';
import { eq, and } from "drizzle-orm";

export async function createTimetable(data: FormSchema) {  
    const { userId } = auth()
    if (!userId) throw new Error("User not authenticated")

    // Check if a timetable with the same name already exists for this user
    const existingTimetable = await db.select()
        .from(timetables)
        .where(
            and(
                eq(timetables.user_id, userId),
                eq(timetables.name, data.name)
            )
        )
        .limit(1);

    if (existingTimetable.length > 0) {
        return { 
            success: false, 
            message: "A timetable with this name already exists. Please choose a different name." 
        };
    }

    const timetable_id = generateUuidWithPrefix("timetable_");
    const days: Record<string, Activity[]> = {};
  
    data.days.forEach((day) => {
      days[day] = [];
    });
  
    await db.insert(timetables).values({
      user_id: userId,
      timetable_id: timetable_id,
      days: JSON.stringify(days),
      name: data.name,
    });
  
    return { success: true, message: "Timetable created successfully" };
}