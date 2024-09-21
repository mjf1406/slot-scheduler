import type { CollisionDetection } from '@dnd-kit/core';

export const customCollisionDetection: CollisionDetection = ({
  droppableContainers,
  pointerCoordinates,
}) => {
  if (!pointerCoordinates) {
    return [];
  }

  const timeSlots = droppableContainers.filter(
    (container) => container.data.current?.type === "TimeSlot"
  );

  const classItems = droppableContainers.filter(
    (container) => container.data.current?.type === "ClassItem"
  );

  const unassignedArea = droppableContainers.find(
    (container) => container.data.current?.type === "UnassignedArea"
  );

  // Check collision with TimeSlots
  for (const timeSlot of timeSlots) {
    const rect = timeSlot.rect.current;
    if (
      rect &&
      pointerCoordinates.x >= rect.left &&
      pointerCoordinates.x <= rect.right &&
      pointerCoordinates.y >= rect.top &&
      pointerCoordinates.y <= rect.bottom
    ) {
      return [{ id: timeSlot.id }];
    }
  }

  // Check collision with ClassItems
  for (const classItem of classItems) {
    const rect = classItem.rect.current;
    if (
      rect &&
      pointerCoordinates.x >= rect.left &&
      pointerCoordinates.x <= rect.right &&
      pointerCoordinates.y >= rect.top &&
      pointerCoordinates.y <= rect.bottom
    ) {
      return [{ id: classItem.id }];
    }
  }

  // Check collision with UnassignedArea
  if (unassignedArea) {
    const rect = unassignedArea.rect.current;
    if (
      rect &&
      pointerCoordinates.x >= rect.left &&
      pointerCoordinates.x <= rect.right &&
      pointerCoordinates.y >= rect.top &&
      pointerCoordinates.y <= rect.bottom
    ) {
      return [{ id: unassignedArea.id }];
    }
  }

  return [];
};