import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchTimetables } from '~/app/api/fetchers';
import type { Timetable } from "~/server/db/types";

export const useTimetables = (initialData?: Timetable[]) => {
  const queryClient = useQueryClient();

  const query = useQuery<Timetable[], Error>({
    queryKey: ['timetables'],
    queryFn: fetchTimetables,
    initialData: initialData,
    retry: 3,
    staleTime: 60000, // Consider data fresh for 1 minute
    refetchOnWindowFocus: false,
  });

  const refetchTimetables = () => {
    return queryClient.invalidateQueries({ queryKey: ['timetables'] });
  };

  return { ...query, refetchTimetables };
};