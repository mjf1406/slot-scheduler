"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import fetchClassesGroupsStudents from "~/app/api/fetchers";
import { SortableItem } from "./components/SortableItem";

type Student = {
  student_id: string;
  student_name_en: string;
};

type Group = {
  group_id: string;
  group_name: string;
  students: Student[];
};

type Class = {
  class_id: string;
  class_name: string;
  groups: Group[];
};

type Event = {
  id: string;
  content: string;
  day: string;
};

const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function Droppable(props) {
  const { setNodeRef } = useDroppable({
    id: props.id,
  });

  return (
    <div ref={setNodeRef} className="min-h-[100px]">
      {props.children}
    </div>
  );
}

export default function Timetables() {
  const [events, setEvents] = useState<Event[]>([]);
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const {
    data: classes,
    isLoading,
    error,
  } = useQuery<Class[], Error>({
    queryKey: ["classes"],
    queryFn: fetchClassesGroupsStudents,
  });

  function handleDragStart(event) {
    const { active } = event;
    setActiveId(active.id);
  }

  function handleDragEnd(event) {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    setEvents((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const activeItem = items[oldIndex];

      let newDay;
      let newIndex;

      if (weekDays.includes(over.id)) {
        // Dropped onto an empty day
        newDay = over.id;
        newIndex = items.filter((item) => item.day === newDay).length;
      } else {
        // Dropped onto another event
        const overItem = items.find((item) => item.id === over.id);
        newDay = overItem.day;
        newIndex = items
          .filter((item) => item.day === newDay)
          .findIndex((item) => item.id === over.id);
      }

      // Remove the item from its old position
      const updatedItems = items.filter((item) => item.id !== active.id);

      // Insert the item at its new position
      activeItem.day = newDay;
      updatedItems.splice(
        updatedItems.findIndex((item) => item.day === newDay) + newIndex,
        0,
        activeItem,
      );

      return updatedItems;
    });

    setActiveId(null);
  }

  function addEvent(day: string) {
    const newEvent: Event = {
      id: `${Date.now()}`,
      content: `New Event`,
      day: day,
    };
    setEvents([...events, newEvent]);
  }

  return (
    <div className="mt-5">
      <h1 className="mb-4 text-2xl font-bold">Timetables</h1>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((day) => (
            <div key={day} className="rounded border p-4">
              <h2 className="mb-2 font-semibold">{day}</h2>
              <Droppable id={day}>
                <SortableContext
                  items={events.filter((e) => e.day === day).map((e) => e.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {events
                    .filter((event) => event.day === day)
                    .map((event) => (
                      <SortableItem key={event.id} id={event.id}>
                        <div className="my-2 rounded bg-blue-100 p-2">
                          {event.content}
                        </div>
                      </SortableItem>
                    ))}
                </SortableContext>
              </Droppable>
              <button
                onClick={() => addEvent(day)}
                className="mt-2 rounded bg-green-500 px-2 py-1 text-white"
              >
                Add Event
              </button>
            </div>
          ))}
        </div>
        <DragOverlay>
          {activeId ? (
            <div className="rounded bg-blue-200 p-2">
              {events.find((e) => e.id === activeId)?.content}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
