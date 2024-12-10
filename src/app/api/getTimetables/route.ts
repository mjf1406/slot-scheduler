import { NextResponse } from 'next/server';
import { db } from '~/server/db/index';
import { timetables, classes, slots as slotsTable, slot_classes, disabled_slots } from '~/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Timetable, Class, Slot, SlotClass } from '~/server/db/types';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    try {
        // Fetch all data in parallel
        const [
            fetchedTimetables,
            fetchedClasses,
            slots,
            slotClasses,
            disabledSlots,
        ] = await Promise.all([
            db.select().from(timetables).where(eq(timetables.user_id, userId)),
            db.select().from(classes).where(eq(classes.user_id, userId)),
            db.select().from(slotsTable).where(eq(slotsTable.user_id, userId)),
            db.select().from(slot_classes).where(eq(slot_classes.user_id, userId)),
            db.select().from(disabled_slots).where(eq(disabled_slots.user_id, userId)),
        ]);

        // Format classes
        const formattedClasses: Class[] = fetchedClasses.map(cls => ({
            user_id: cls.user_id,
            timetable_id: cls.timetable_id,
            class_id: cls.class_id,
            name: cls.name,
            default_day: cls.default_day ?? '',
            default_start: cls.default_start ?? '',
            default_end: cls.default_end ?? '',
            day: cls.day ?? '',
            start: cls.start ?? '',
            end: cls.end ?? '',
            year: cls.year,
            weekNumber: cls.week_number,
            color: cls.color ?? '#FFFFFF',
            icon_name: cls.icon_name ?? '',
            icon_prefix: (cls.icon_prefix as 'fas' | 'far') ?? 'fas',
            linked_class: cls.linked_class,
        }));

        // Create maps for efficient data access
        const slotsByTimetableId = new Map<string, Slot[]>();
        slots.forEach(slot => {
            if (!slotsByTimetableId.has(slot.timetable_id)) {
                slotsByTimetableId.set(slot.timetable_id, []);
            }
            slotsByTimetableId.get(slot.timetable_id)!.push(slot);
        });

        const disabledDatesBySlotId = new Map<string, string[]>();
        disabledSlots.forEach(disabledSlot => {
            if (!disabledDatesBySlotId.has(disabledSlot.slot_id)) {
                disabledDatesBySlotId.set(disabledSlot.slot_id, []);
            }
            disabledDatesBySlotId.get(disabledSlot.slot_id)!.push(disabledSlot.disable_date);
        });

        const classesByTimetableId = new Map<string, Class[]>();
        formattedClasses.forEach(cls => {
            if (!classesByTimetableId.has(cls.timetable_id)) {
                classesByTimetableId.set(cls.timetable_id, []);
            }
            classesByTimetableId.get(cls.timetable_id)!.push(cls);
        });

        const slotClassesByTimetableId = new Map<string, SlotClass[]>();
        slotClasses.forEach(slotClass => {
            if (!slotClassesByTimetableId.has(slotClass.timetable_id)) {
                slotClassesByTimetableId.set(slotClass.timetable_id, []);
            }
            slotClassesByTimetableId.get(slotClass.timetable_id)!.push(slotClass);
        });

        // Format timetables
        const formattedTimetables: Timetable[] = fetchedTimetables.map(timetable => {
            const timetableSlots = slotsByTimetableId.get(timetable.timetable_id) ?? [];
            const formattedSlots = timetableSlots.map(slot => ({
                ...slot,
                isDisabled: (disabledDatesBySlotId.get(slot.slot_id) ?? []).sort(),
            }));

            return {
                user_id: timetable.user_id,
                timetable_id: timetable.timetable_id,
                days: timetable.days,
                name: timetable.name,
                slots: formattedSlots,
                start_time: timetable.start_time,
                end_time: timetable.end_time,
                classes: classesByTimetableId.get(timetable.timetable_id) ?? [],
                slotClasses: slotClassesByTimetableId.get(timetable.timetable_id) ?? [],
            };
        });

        return NextResponse.json(formattedTimetables);
    } catch (error) {
        console.error('Error fetching timetables and classes:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
