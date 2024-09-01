"use client";

import React, { useState } from "react";
import { TimetableSelect } from './TimetablesSelect';
import { useTimetables } from '../hooks';
import { CreateTimetableModal } from "./CreateTimetableModal";

export default function Timetables() {
  const [selectedTimetableId, setSelectedTimetableId] = useState<string | null>(null);
  const { data: timetables, isLoading, error } = useTimetables();

  const handleTimetableSelect = (timetableId: string) => {
    setSelectedTimetableId(timetableId);
  };

  const selectedTimetable = timetables?.find(t => t.timetable_id === selectedTimetableId);

  return (
    <div className='flex flex-col gap-5 mt-5'>
      <div className="flex gap-5">
        <CreateTimetableModal />
        <TimetableSelect onSelect={handleTimetableSelect} />
      </div>
      {error && <p className="text-red-500">Error loading timetables: {error.message}</p>}
      {selectedTimetable && (
        <div>
          <h2 className="text-xl font-bold mb-2">Selected Timetable: {selectedTimetable.name}</h2>
          <p>Timetable ID: {selectedTimetable.timetable_id}</p>
          <pre>{JSON.stringify(selectedTimetable.days, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}