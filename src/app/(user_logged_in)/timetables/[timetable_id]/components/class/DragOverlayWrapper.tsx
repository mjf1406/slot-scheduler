import React from "react";
import { DragOverlay, useDndContext } from "@dnd-kit/core";
import type { Class, SlotClass } from "~/server/db/types"; // Ensure correct import
import ClassItem from "./ClassItem"; // Ensure correct import

const DragOverlayWrapper: React.FC = () => {
  const { active } = useDndContext();

  if (!active) {
    return null;
  }

  // Define the expected structure of active.data.current
  const activeData = active.data.current as {
    type: string;
    class?: Class;
    isComplete?: boolean;
    isHidden?: boolean;
    slotId?: string | null;
    slotClassData?: SlotClass;
    year?: number;
    weekNumber?: number;
  };

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
      <div style={{ zIndex: 1000, pointerEvents: "none" }}>
        <ClassItem
          classData={activeData.class}
          // Disabled actions during drag
          onEdit={async () => {
            // No-op
          }}
          onDelete={async () => {
            // No-op
          }}
          timetableId={activeData.class.timetable_id ?? ""}
          isDragging={true}
          onClick={() => {
            // No-op
          }}
          onDisplayClick={() => {
            // No-op
          }}
          isComplete={activeData.isComplete ?? false}
          isHidden={activeData.isHidden ?? false}
          slotId={activeData.slotId ?? null}
          slotClassData={activeData.slotClassData}
          year={activeData.year ?? new Date().getFullYear()}
          weekNumber={activeData.weekNumber ?? getCurrentWeekNumber()}
          size="normal" // You can adjust this as needed
        />
      </div>
    </DragOverlay>
  );
};

// Utility function to get the current week number
const getCurrentWeekNumber = (): number => {
  const today = new Date();
  const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
  const pastDaysOfYear =
    (today.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

export default DragOverlayWrapper;
