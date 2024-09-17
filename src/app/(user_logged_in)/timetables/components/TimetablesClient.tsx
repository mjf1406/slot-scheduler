"use client";

import React from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { CreateTimetableModal } from "./CreateTimetableModal";
import { Badge } from "~/components/ui/badge";
import { timetablesOptions } from "~/app/api/queryOptions";
import { useSuspenseQuery } from "@tanstack/react-query";
import { formatTime } from "~/lib/utils";

const ORDERED_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const formatDays = (days: string[]): string[] => {
  if (!days || typeof days !== "object" || days === null) {
    return [];
  }
  return ORDERED_DAYS.filter((day) => days.includes(day));
};

export default function Timetables() {
  const { data: timetables } = useSuspenseQuery(timetablesOptions);

  return (
    <div className="container px-0 py-8">
      <div className="mb-6 flex items-center gap-5">
        <h1 className="text-3xl font-bold">Timetables</h1>
        <CreateTimetableModal />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {timetables?.map((timetable) => {
          const formattedDays = formatDays(timetable.days);
          const startTime = formatTime(timetable.start_time);
          const endTime = formatTime(timetable.end_time);

          return (
            <Card
              className="transition-shadow duration-300 hover:shadow-lg"
              key={timetable.timetable_id}
            >
              <CardHeader>
                <CardTitle>{timetable.name}</CardTitle>
                <CardDescription>
                  <div className="flex flex-col gap-1">
                    <span>
                      <span className="font-bold">Classes:</span>{" "}
                      {timetable.classes?.length || 0}
                    </span>
                    <span>
                      <span className="font-bold">Hours:</span> {startTime} -{" "}
                      {endTime}
                    </span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {formattedDays.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {formattedDays.map((day) => (
                      <Badge
                        key={day}
                        variant="outline"
                        className="hover:bg-transparent"
                      >
                        {day}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p>No days defined</p>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="secondary" asChild>
                  <Link href={`/timetables/${timetable.timetable_id}`}>
                    View Timetable
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
