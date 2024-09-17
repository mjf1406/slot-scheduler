"use server"

import { generateUuidWithPrefix } from "~/lib/utils";
import { db } from "~/server/db";
import { timetables, classes } from "~/server/db/schema";
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

    const newTimetable = {
        user_id: userId,
        timetable_id: timetable_id,
        days: data.days,
        name: data.name,
        slots: null,
        start_time: data.start_time,
        end_time: data.end_time,
      }
  
    await db.insert(timetables).values(newTimetable);
  
    return { success: true, message: "Timetable created successfully", timetable: newTimetable};
}

export async function createClass(data: {
    name: string;
    default_day?: string;
    default_start?: string;
    default_end?: string;
    timetable_id: string;
    color: string;
    icon_name: string;
    icon_prefix: "fas" | "far";
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
        default_day: data.default_day ?? null,
        default_start: data.default_start ?? null,
        default_end: data.default_end ?? null,
        day: data.default_day ?? null,
        start: data.default_start ?? null,
        end: data.default_end ?? null,
        color: data.color,
        icon_name: data.icon_name,
        icon_prefix: data.icon_prefix,
    });

    revalidatePath('/timetables');

    return { success: true, message: "Class created successfully", class_id };
}

export async function editClass(data: {
    class_id: string;
    name: string;
    color: string;
    icon_name: string;
    icon_prefix: string;
  }) {
    const { userId } = auth();
    if (!userId) throw new Error("User not authenticated");
  
    await db.update(classes)
      .set({
        name: data.name,
        color: data.color,
        icon_name: data.icon_name,
        icon_prefix: data.icon_prefix,
      })
      .where(eq(classes.class_id, data.class_id));
  
    revalidatePath('/timetables');
    return { success: true, message: "Class updated successfully" };
}
  
export async function deleteClass(class_id: string) {
const { userId } = auth();
if (!userId) throw new Error("User not authenticated");

await db.delete(classes)
    .where(eq(classes.class_id, class_id));

revalidatePath('/timetables');
return { success: true, message: "Class deleted successfully" };
}