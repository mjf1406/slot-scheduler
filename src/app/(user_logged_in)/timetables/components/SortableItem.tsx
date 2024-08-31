import React from "react";
import type { ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableItemProps {
  id: string;
  children: ReactNode;
}

export function SortableItem({ id, children }: SortableItemProps) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}
