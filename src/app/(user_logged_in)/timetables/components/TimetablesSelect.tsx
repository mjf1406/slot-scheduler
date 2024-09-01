"use client"

import React from 'react'
import { useTimetables } from '../hooks'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"

export function TimetableSelect({ onSelect }: { onSelect: (timetableId: string) => void }) {
  const { data: timetables, isLoading, error } = useTimetables()

  return (
    <Select onValueChange={onSelect} disabled={isLoading || !!error}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={isLoading ? "Loading..." : error ? "Error" : "Select a timetable"} />
      </SelectTrigger>
      <SelectContent>
        {timetables && timetables.length > 0 ? (
          timetables.map((timetable) => (
            <SelectItem key={timetable.timetable_id} value={timetable.timetable_id}>
              {timetable.name}
            </SelectItem>
          ))
        ) : (
          <SelectItem value="none" disabled>No timetables available</SelectItem>
        )}
      </SelectContent>
    </Select>
  )
}