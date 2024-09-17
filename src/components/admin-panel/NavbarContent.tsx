"use client";

import { useParams, usePathname } from "next/navigation";
import { useSuspenseQuery } from "@tanstack/react-query";
import { timetablesOptions } from "~/app/api/queryOptions";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "../ui/breadcrumb";
import Link from "next/link";

export function NavbarContent() {
  const params = useParams();
  const pathname = usePathname();
  const timetableId = params.timetable_id as string;
  const { data: timetables } = useSuspenseQuery(timetablesOptions);
  const selectedTimetable = timetables?.find(
    (t) => t.timetable_id === timetableId,
  );

  // Check if we're on the home page
  if (pathname === "/") {
    return null; // Don't render anything on the home page
  }

  return (
    <Breadcrumb>
      <BreadcrumbList className="-ml-6 md:-ml-2">
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link
              href="/timetables"
              className="text-lg font-semibold hover:underline"
            >
              Timetables
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {selectedTimetable ? (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-lg font-semibold">
                {selectedTimetable.name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        ) : null}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
