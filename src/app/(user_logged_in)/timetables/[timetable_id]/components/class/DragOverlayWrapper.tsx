import React from "react";
import { DragOverlay, useDndContext } from "@dnd-kit/core";
import type { Class } from "~/server/db/types"; // Adjust the import path as necessary
import ClassItem from "./ClassItem"; // Adjust the import path as necessary

const DragOverlayWrapper: React.FC = () => {
  const { active } = useDndContext();

  if (!active) {
    return null;
  }

  const activeData = active.data.current as { type: string; class?: Class };

  if (activeData.type !== "ClassItem" || !activeData.class) {
    return null;
  }

  return (
    <DragOverlay
      dropAnimation={{
        duration: 500,
        easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
      }}
    >
      <div style={{ zIndex: 1000 }}>
        <ClassItem
          classData={activeData.class}
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          onEdit={async () => {
            // This is disabled during drag
          }}
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          onDelete={async () => {
            // This is disabled during drag
          }}
          timetableId={activeData.class.timetable_id ?? ""}
          isDragging={true}
        />
      </div>
    </DragOverlay>
  );
};

export default DragOverlayWrapper;
