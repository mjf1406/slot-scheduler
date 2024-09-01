import { NextResponse } from 'next/server';
import { db } from '~/server/db/index'; // Assume this is your database connection
import { timetables } from '~/server/db/schema'; // Assume this is where your table definitions are
import { eq } from 'drizzle-orm'; // For constructing SQL queries
import type { Timetable, Activity } from '~/server/db/types'; // Import the Timetable type
import { auth } from '@clerk/nextjs/server';

export async function GET() {
    const { userId } = auth()
    if (!userId) throw new Error("User not authenticated")
    try {
        const fetchedTimetables = await db
            .select()
            .from(timetables)
            .where(eq(timetables.user_id, userId));

        const formattedTimetables: Timetable[] = fetchedTimetables.map(timetable => ({
            user_id: timetable.user_id,
            timetable_id: timetable.timetable_id,
            days: JSON.parse(timetable.days as string) as Record<string, Activity[]>,
            name: timetable.name,
        }));

        return NextResponse.json(formattedTimetables);
    } catch (error) {
        console.error('Error fetching timetables:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}