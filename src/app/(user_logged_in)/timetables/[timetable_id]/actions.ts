"use server";

import { generateUuidWithPrefix } from "~/lib/utils";
import { db } from "~/server/db";
import { slots as slotsTable, slot_classes as slotClassesTable } from "~/server/db/schema";
import type { Slot } from "~/server/db/types";
import { and, eq, gt, gte, lt, lte, ne, or } from "drizzle-orm"; // Adjust based on your Drizzle setup
import { auth } from "@clerk/nextjs/server";

interface AddSlotInput {
  timetable_id: string;
  day: string;
  start_time: string; // Format: "HH:MM"
  end_time: string;   // Format: "HH:MM"
}

interface UpdateSlotInput {
    timetable_id: string;
    slot_id: string;
    day: string;
    start_time: string; // Format: "HH:MM"
    end_time: string;   // Format: "HH:MM"
  }

export async function createSlot(slotDataFromClientForm: AddSlotInput) {
  const { timetable_id, day, start_time, end_time } = slotDataFromClientForm;

  // Authenticate the user
  const { userId } = auth();
  if (!userId) throw new Error("User not authenticated");

  if (!timetable_id) throw new Error("Timetable is undefined")

  // Validate input data
  if (!day || !start_time || !end_time) {
    return { 
      success: false, 
      message: "All fields (day, start_time, end_time) are required." 
    };
  }

  // Optional: Validate time format (HH:MM)
  const timeRegex = /^([0-1]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
    return { 
      success: false, 
      message: "Start time and end time must be in HH:MM format." 
    };
  }

  if (start_time >= end_time) {
    return { 
      success: false, 
      message: "Start time must be earlier than end time." 
    };
  }

  try {
    // Create a new slot
    const newSlot: Slot = {
      user_id: userId,
      timetable_id,
      slot_id: generateUuidWithPrefix("slot_"),
      day,
      start_time,
      end_time,
    };

    // Update the timetable in the database
    await db
      .insert(slotsTable)
      .values(newSlot)

    return { 
      success: true, 
      message: "Slot added successfully.", 
      slot: newSlot 
    };
  } catch (error) {
    console.error("Error adding slot:", error);
    return { 
      success: false, 
      message: "Failed to add slot due to a server error." 
    };
  }
}

export async function updateSlot(slotDataFromClientForm: UpdateSlotInput) {
  const { timetable_id, slot_id, day, start_time, end_time } = slotDataFromClientForm;

  // Authenticate the user
  const { userId } = auth();
  if (!userId) throw new Error("User not authenticated");

  // Validate input data
  if (!day || !start_time || !end_time) {
    return { 
      success: false, 
      message: "All fields (day, start_time, end_time) are required." 
    };
  }

  // Optional: Validate time format (HH:MM)
  const timeRegex = /^([0-1]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
    return { 
      success: false, 
      message: "Start time and end time must be in HH:MM format." 
    };
  }

  if (start_time >= end_time) {
    return { 
      success: false, 
      message: "Start time must be earlier than end time." 
    };
  }

  try {
    // Check for overlapping slots on the same day
    const overlappingSlots = await db.select()
      .from(slotsTable)
      .where(and(
        eq(slotsTable.timetable_id, timetable_id),
        eq(slotsTable.day, day),
        ne(slotsTable.slot_id, slot_id), // Exclude the current slot
        or(
          and(
            gte(slotsTable.start_time, start_time),
            lt(slotsTable.start_time, end_time)
          ),
          and(
            gt(slotsTable.end_time, start_time),
            lte(slotsTable.end_time, end_time)
          ),
          and(
            lte(slotsTable.start_time, start_time),
            gte(slotsTable.end_time, end_time)
          )
        )
      ))
      .execute();

    if (overlappingSlots.length > 0) {
      return { 
        success: false, 
        message: "The updated slot overlaps with an existing slot." 
      };
    }

    // Update the slot in the database
    const updatedSlot = await db.update(slotsTable)
      .set({ 
        day,
        start_time,
        end_time
      })
      .where(and(
        eq(slotsTable.slot_id, slot_id),
        eq(slotsTable.timetable_id, timetable_id),
        eq(slotsTable.user_id, userId)
      ))
      .returning()
      .execute();

    if (updatedSlot.length === 0) {
      return { 
        success: false, 
        message: "Slot not found or you don't have permission to modify it." 
      };
    }

    return { 
      success: true, 
      message: "Slot updated successfully.", 
      slot: updatedSlot[0]
    };
  } catch (error) {
    console.error("Error updating slot:", error);
    return { 
      success: false, 
      message: "Failed to update slot due to a server error." 
    };
  }
}

export async function deleteSlot(slot_id: string) {
  // Authenticate the user
  const { userId } = auth();
  if (!userId) throw new Error("User not authenticated");

  try {
    await db
      .delete(slotsTable)
      .where(and(
        eq(slotsTable.user_id, userId),
        eq(slotsTable.slot_id, slot_id),
      ))
    
    return { 
      success: true, 
      message: "Slot deleted successfully." 
    };
  } catch (error) {
    console.error("Error deleting slot:", error);
    return { 
      success: false, 
      message: "Failed to delete slot due to a server error." 
    };
  }
}

export async function moveSlotClass(
  classId: string,
  newSlotId: string,
  timetableId: string,
  year: number,
  weekNumber: number
) {
  const { userId } = auth();
  if (!userId) throw new Error("User not authenticated");

  try {
    await db.transaction(async (trx) => {
      // Delete the old slot_class entry for the target week
      await trx
        .delete(slotClassesTable)
        .where(
          and(
            eq(slotClassesTable.user_id, userId),
            eq(slotClassesTable.class_id, classId),
            eq(slotClassesTable.year, year),
            eq(slotClassesTable.week_number, weekNumber)
          )
        );

      // Create a new slot_class entry for the target week
      await trx.insert(slotClassesTable).values({
        id: generateUuidWithPrefix("slot_class_"), // ID generation remains
        user_id: userId,
        timetable_id: timetableId,
        slot_id: newSlotId,
        class_id: classId,
        year,
        week_number: weekNumber,
        size: "whole",
      });
    });

    // Fetch the updated slotClasses for the current week
    const updatedSlotClassesForWeek = await db
      .select()
      .from(slotClassesTable)
      .where(
        and(
          eq(slotClassesTable.timetable_id, timetableId),
          eq(slotClassesTable.year, year),
          eq(slotClassesTable.week_number, weekNumber)
        )
      );

    return {
      success: true,
      message: "Class moved successfully.",
      slotClassesForWeek: updatedSlotClassesForWeek,
    };
  } catch (error) {
    console.error("Error moving slot_class:", error);
    return {
      success: false,
      message: "Failed to move class due to a server error.",
    };
  }
}

export async function removeSlotClassFromAllSlots(
  classId: string,
  timetableId: string,
  year: number,
  weekNumber: number
) {
  const { userId } = auth();
  if (!userId) throw new Error("User not authenticated");

  try {
    await db
      .delete(slotClassesTable)
      .where(
        and(
          eq(slotClassesTable.user_id, userId),
          eq(slotClassesTable.class_id, classId),
          eq(slotClassesTable.year, year),
          eq(slotClassesTable.week_number, weekNumber)
        )
      );

    // Fetch the updated slotClasses for the current week
    const updatedSlotClassesForWeek = await db
      .select()
      .from(slotClassesTable)
      .where(
        and(
          eq(slotClassesTable.timetable_id, timetableId),
          eq(slotClassesTable.year, year),
          eq(slotClassesTable.week_number, weekNumber)
        )
      );

    return {
      success: true,
      message:
        "Class removed from all slots for the target week successfully.",
      slotClassesForWeek: updatedSlotClassesForWeek,
    };
  } catch (error) {
    console.error(
      "Error removing slot_class from slots for the target week:",
      error
    );
    return {
      success: false,
      message:
        "Failed to remove class from slots for the target week due to a server error.",
    };
  }
}
