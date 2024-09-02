import React, { useState, useEffect } from "react";
import { DndContext, closestCorners, DragOverlay } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

const ClassItem = ({ id, name }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex cursor-move items-center rounded border bg-foreground/10 p-2 shadow-sm transition-shadow duration-200 hover:shadow-md"
    >
      <GripVertical className="mr-2 text-gray-400" size={20} />
      <div>
        <span className="font-medium">{name}</span>
      </div>
    </div>
  );
};

const Droppable = ({ id, items, day }) => {
  const { setNodeRef } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      className="flex min-h-[100px] w-full flex-col gap-2 rounded border p-4"
    >
      <h4 className="mb-2 font-semibold">{day}</h4>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {items.map((item) => (
          <ClassItem key={item.class_id} id={item.class_id} name={item.name} />
        ))}
      </SortableContext>
    </div>
  );
};

const TimetableDnD = ({ timetable }) => {
  const [items, setItems] = useState({});

  useEffect(() => {
    const initialItems = {
      unassigned: timetable.classes.filter((cls) => !cls.day),
      ...Object.fromEntries(
        Object.keys(timetable.days).map((day) => [
          day,
          timetable.classes.filter((cls) => cls.day === day),
        ]),
      ),
    };
    setItems(initialItems);
  }, [timetable]);

  const containers = ["unassigned", ...Object.keys(timetable.days)];

  const findContainer = (id) => {
    if (containers.includes(id)) {
      return id;
    }
    return Object.keys(items).find((key) =>
      items[key].some((item) => item.class_id === id),
    );
  };

  const handleDragOver = ({ active, over }) => {
    const overId = over?.id;

    if (!overId) {
      return;
    }

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(overId);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }

    setItems((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];

      const activeIndex = activeItems.findIndex(
        (item) => item.class_id === active.id,
      );
      const overIndex = overItems.findIndex((item) => item.class_id === overId);

      let newIndex;
      if (overId in prev) {
        newIndex = overItems.length + 1;
      } else {
        const isBelowLastItem = over && overIndex === overItems.length - 1;

        const modifier = isBelowLastItem ? 1 : 0;

        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      return {
        ...prev,
        [activeContainer]: [
          ...prev[activeContainer].filter(
            (item) => item.class_id !== active.id,
          ),
        ],
        [overContainer]: [
          ...prev[overContainer].slice(0, newIndex),
          activeItems[activeIndex],
          ...prev[overContainer].slice(newIndex, prev[overContainer].length),
        ],
      };
    });
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over) {
      return;
    }

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);

    if (!activeContainer || !overContainer) {
      return;
    }

    if (activeContainer !== overContainer) {
      setItems((prev) => {
        const activeItems = prev[activeContainer];
        const overItems = prev[overContainer] || [];

        const activeIndex = activeItems.findIndex(
          (item) => item.class_id === active.id,
        );

        const updatedItems = {
          ...prev,
          [activeContainer]: [
            ...prev[activeContainer].filter(
              (item) => item.class_id !== active.id,
            ),
          ],
          [overContainer]: [
            ...overItems,
            {
              ...activeItems[activeIndex],
              day: overContainer === "unassigned" ? "" : overContainer,
            },
          ],
        };

        // Update the timetable.classes array with the new day assignments
        timetable.classes = Object.values(updatedItems).flat();

        return updatedItems;
      });
    }
  };

  return (
    <DndContext onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Droppable
          id="unassigned"
          items={items.unassigned || []}
          day="Unassigned Classes"
        />
        <div className="flex justify-between gap-2">
          {Object.keys(timetable.days).map((day) => (
            <Droppable key={day} id={day} items={items[day] || []} day={day} />
          ))}
        </div>
      </div>
    </DndContext>
  );
};

export default TimetableDnD;
