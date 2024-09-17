import { queryOptions } from '@tanstack/react-query'
import type { Timetable } from '~/server/db/types';

export const timetablesOptions = queryOptions<Timetable[]>({
    queryKey: ["timetables"],
    queryFn: async () => {
        const response = await fetch('/api/getTimetables');
        return response.json()
      },
})