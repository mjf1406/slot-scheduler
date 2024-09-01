"use client";

import React, { useState, useCallback } from "react";
import { TimetableSelect } from './TimetablesSelect';
import { useTimetables } from '../hooks';
import { CreateTimetableModal } from "./CreateTimetableModal";
import { CreateClassDialog } from "./CreateClassModal";
import { GripVertical } from "lucide-react";

export default function Timetables() {
  const [selectedTimetableId, setSelectedTimetableId] = useState<string | null>(null);
  const { data: timetables, isLoading, error, refetch: refetchTimetables } = useTimetables();

  const handleTimetableSelect = useCallback((timetableId: string) => {
    setSelectedTimetableId(timetableId);
  }, []);

  const handleClassCreated = useCallback(() => {
    void refetchTimetables();
  }, [refetchTimetables]);

  const selectedTimetable = timetables?.find(t => t.timetable_id === selectedTimetableId);

  return (
    <div className='flex flex-col gap-5 mt-5'>
      <div className="flex gap-5">
        <CreateTimetableModal />
        <TimetableSelect onSelect={handleTimetableSelect} />
      </div>
      {error && <p className="text-red-500">Error loading timetables: {error.message}</p>}
      {isLoading && <p>Loading timetables...</p>}
      {selectedTimetable && (
        <div id="timetable" className="mt-5">
          <h2 className="text-xl font-bold mb-2">Selected Timetable: {selectedTimetable.name}</h2>
          <p className="mb-4">Timetable ID: {selectedTimetable.timetable_id}</p>
          
          <div id="classes-container" className="mb-6 p-4 border rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Classes</h3>
              <CreateClassDialog timetableId={selectedTimetable.timetable_id} onClassCreated={handleClassCreated} />
            </div>
            {selectedTimetable.classes && selectedTimetable.classes.length > 0 ? (
              <ul className="space-y-2">
                {selectedTimetable.classes.map(cls => (
                  <li key={cls.class_id} className="flex items-center p-2 bg-foreground/10 border rounded shadow-sm hover:shadow-md transition-shadow duration-200 cursor-move">
                    <GripVertical className="mr-2 text-gray-400" size={20} />
                    <div>
                      <span className="font-medium">{cls.name}</span>
                      {cls.default_day && <span className="ml-2 text-gray-600">({cls.default_day})</span>}
                      {cls.default_start && cls.default_end && (
                        <span className="ml-2 text-gray-600">{cls.default_start} - {cls.default_end}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No classes found for this timetable.</p>
            )}
          </div>
          
          <div id="timetable-dnd" className="border p-4 rounded">
            <h3 className="text-lg font-semibold mb-2">Timetable Structure</h3>
            <pre className="text-sm">{JSON.stringify(selectedTimetable.days, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}