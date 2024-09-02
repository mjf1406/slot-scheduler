"use client";

import React, { useState, useCallback } from "react";
import { TimetableSelect } from "./TimetablesSelect";
import { useTimetables } from "../hooks";
import { CreateTimetableModal } from "./CreateTimetableModal";
import { CreateClassDialog } from "./CreateClassModal";
import TimetableDnD from "./TimetableDnD";

export default function Timetables() {
  const [selectedTimetableId, setSelectedTimetableId] = useState(null);
  const { data: timetables, isLoading, error } = useTimetables();

  const handleTimetableSelect = useCallback((timetableId) => {
    setSelectedTimetableId(timetableId);
  }, []);

  const selectedTimetable = timetables?.find(
    (t) => t.timetable_id === selectedTimetableId,
  );

  return (
    <div className="mt-5 flex flex-col gap-5">
      <div className="flex gap-5">
        <CreateTimetableModal />
        <TimetableSelect
          timetables={timetables}
          onSelect={handleTimetableSelect}
          selectedTimetableId={selectedTimetableId}
        />
      </div>
      {error && (
        <p className="text-red-500">
          Error loading timetables: {error.message}
        </p>
      )}
      {isLoading && <p>Loading timetables...</p>}
      {selectedTimetable && (
        <div id="timetable" className="mt-5">
          <h2 className="mb-2 text-xl font-bold">
            Selected Timetable: {selectedTimetable.name}
          </h2>
          <p className="mb-4">Timetable ID: {selectedTimetable.timetable_id}</p>

          <div className="mb-4">
            <CreateClassDialog timetableId={selectedTimetable.timetable_id} />
          </div>

          <TimetableDnD timetable={selectedTimetable} />
        </div>
      )}
    </div>
  );
}
