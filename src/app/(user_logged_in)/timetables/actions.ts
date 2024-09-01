"use server"

import { generateUuidWithPrefix } from "~/lib/utils";
import { db } from "~/server/db";
import { timetables, classes } from "~/server/db/schema";
import type { Activity } from "~/server/db/types";
import { auth } from '@clerk/nextjs/server'
import type { FormSchema } from './form-schemas';
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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

export async function createClass(data: {
    name: string;
    default_day?: string;
    default_start?: string;
    default_end?: string;
    timetable_id: string;
}) {
    const { userId } = auth()
    if (!userId) throw new Error("User not authenticated")

    // Check if a class with the same name already exists for this timetable
    const existingClass = await db.select()
        .from(classes)
        .where(
            and(
                eq(classes.user_id, userId),
                eq(classes.timetable_id, data.timetable_id),
                eq(classes.name, data.name)
            )
        )
        .limit(1);

    if (existingClass.length > 0) {
        return { 
            success: false, 
            message: "A class with this name already exists in this timetable. Please choose a different name." 
        };
    }

    const class_id = generateUuidWithPrefix("class_");

    await db.insert(classes).values({
        user_id: userId,
        timetable_id: data.timetable_id,
        class_id: class_id,
        name: data.name,
        default_day: data.default_day || null,
        default_start: data.default_start || null,
        default_end: data.default_end || null,
        day: data.default_day || null,
        start: data.default_start || null,
        end: data.default_end || null,
    });

    revalidatePath('/timetables');

    return { success: true, message: "Class created successfully", class_id };
}