// src/app/api/getTimetables

import { NextResponse } from 'next/server';
import { db } from '~/server/db/index';
import { timetables, classes, slots as slotsTable, slot_classes } from '~/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Timetable, Class } from '~/server/db/types';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
    const { userId } = auth();
    if (!userId) {
        return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    try {
        // Fetch timetables
        const fetchedTimetables = await db
            .select()
            .from(timetables)
            .where(eq(timetables.user_id, userId));

        // Fetch classes
        const fetchedClasses = await db
            .select()
            .from(classes)
            .where(eq(classes.user_id, userId));

        const slots = await db
            .select()
            .from(slotsTable)
            .where(eq(slotsTable.user_id, userId))

        const slotClasses = await db
            .select()
            .from(slot_classes)
            .where(eq(slot_classes.user_id, userId))

        // Format timetables
        const formattedTimetables: Timetable[] = fetchedTimetables.map(timetable => ({
            user_id: timetable.user_id,
            timetable_id: timetable.timetable_id,
            days: timetable.days,
            name: timetable.name,
            slots: slots.filter(i => i.timetable_id === timetable.timetable_id),
            start_time: timetable.start_time,
            end_time: timetable.end_time,
            classes: [],
            slotClasses: slotClasses.filter(i => i.timetable_id === timetable.timetable_id)
        }));

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
            color: cls.color ?? '#FFFFFF',
            icon_name: cls.icon_name ?? '',
            icon_prefix: cls.icon_prefix as "fas" | "far" ?? 'fas',
            linked_class: cls.linked_class,
        }));

        // Combine timetables and classes
        const combinedData = formattedTimetables.map(timetable => ({
            ...timetable,
            classes: formattedClasses.filter(cls => cls.timetable_id === timetable.timetable_id),
        }));

        return NextResponse.json(combinedData);
    } catch (error) {
        console.error('Error fetching timetables and classes:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}