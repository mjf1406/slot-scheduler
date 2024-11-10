"use server"

import { generateUuidWithPrefix } from "~/lib/utils";
import { db } from "~/server/db";
import { timetables, classes, slots, slot_classes } from "~/server/db/schema";
import { auth } from '@clerk/nextjs/server'
import type { FormSchema } from './form-schemas';
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type UpdateTimetableParams = {
    timetable_id: string;
    name: string;
    days: string[];
    start_time: number;
    end_time: number;
  };

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

export async function updateTimetable(params: UpdateTimetableParams) {
    const { userId } = auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }
  
    const { timetable_id, name, days, start_time, end_time } = params;
  
    try {
      await db.update(timetables)
        .set({
          name,
          days: days,
          start_time: Math.floor(start_time / 60), // Convert minutes to hours
          end_time: Math.floor(end_time / 60),
        })
        .where(and(
          eq(timetables.timetable_id, timetable_id),
          eq(timetables.user_id, userId)
        ));
  
      revalidatePath('/timetables');
      return { success: true };
    } catch (error) {
      console.error("Error updating timetable:", error);
      return { success: false, error: "Failed to update timetable" };
    }
  }

  export async function deleteTimetable(params: { timetableId: string }) {
    const { userId } = auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }
  
    const { timetableId } = params;
  
    try {
      // Start a transaction to ensure all related data is deleted
      await db.transaction(async (tx) => {
        // Delete associated classes
        await tx.delete(classes)
          .where(and(
            eq(classes.timetable_id, timetableId),
            eq(classes.user_id, userId)
          ));
  
        // Delete associated slots
        await tx.delete(slots)
          .where(and(
            eq(slots.timetable_id, timetableId),
            eq(slots.user_id, userId)
          ));
  
        // Delete the timetable itself
        const result = await tx.delete(timetables)
          .where(and(
            eq(timetables.timetable_id, timetableId),
            eq(timetables.user_id, userId)
          ));
  
        // Check if the timetable was actually deleted
        if (result.rowsAffected === 0) {
          throw new Error("Timetable not found or you don't have permission to delete it");
        }
      });
  
      revalidatePath('/timetables');
      return { success: true };
    } catch (error) {
      console.error("Error deleting timetable:", error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to delete timetable" };
    }
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

  await db.delete(slot_classes)
    .where(eq(slot_classes.class_id, class_id));

  await db.delete(classes)
    .where(eq(classes.class_id, class_id));

  revalidatePath('/timetables');
  return { success: true, message: "Class deleted successfully" };
}