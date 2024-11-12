import React, { useState, useMemo } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  Edit,
  Eye,
  EyeOff,
  Grip,
  Monitor,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { EditClassDialog } from "./EditClassDialog";
import DeleteConfirmationDialog from "./DeleteClassAlert";
import type { Class, SlotClass } from "~/server/db/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconName } from "@fortawesome/fontawesome-svg-core";
import { getContrastColor } from "~/lib/utils";
import { useTheme } from "next-themes";
import { moveSlotClass } from "../../actions";
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";

interface ClassItemProps {
  classData: Class;
  onEdit: (updatedClass: Class) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClick: (classData: Class) => void;
  onDisplayClick: (classData: Class) => void; // Add this new prop
  timetableId: string;
  size?: "small" | "normal";
  isDragging?: boolean;
  isComplete?: boolean;
  isHidden?: boolean;
  slotId?: string | null;
  slotClassData?: SlotClass | undefined;
  year: number;
  weekNumber: number;
}

const ClassItem: React.FC<ClassItemProps> = ({
  classData,
  onEdit,
  onDelete,
  onClick,
  onDisplayClick,
  timetableId,
  size = "normal",
  isDragging = false,
  isComplete = false,
  isHidden = false,
  slotId,
  slotClassData,
  year,
  weekNumber,
}) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: classData.class_id,
    disabled: isHidden,
    data: {
      type: "ClassItem",
      class: classData,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDisplayDialogOpen, setIsDisplayDialogOpen] = useState(false);
  const { theme } = useTheme();

  const textColorClass = useMemo(() => {
    return getContrastColor(
      classData.color || "#ffffff",
      theme as "light" | "dark",
    );
  }, [classData.color, theme]);

  const handleEdit = async (updatedClass: Class) => {
    await onEdit(updatedClass);
    setIsEditDialogOpen(false);
    setIsDropdownOpen(false);
  };

  const handleDelete = async () => {
    if (classData.class_id) {
      await onDelete(classData.class_id);
    }
    setIsDeleteDialogOpen(false);
    setIsDropdownOpen(false);
  };

  const handleDetailsClick = () => {
    onClick(classData);
    setIsDropdownOpen(false);
  };

  const handleDisplayClick = () => {
    onDisplayClick(classData);
    setIsDropdownOpen(false);
  };

  // Get the queryClient instance
  const queryClient = useQueryClient();

  // Set up the mutation with optimistic updates
  const hideClassMutation = useMutation({
    mutationFn: (variables: {
      class_id: string;
      timetable_id: string;
      year: number;
      weekNumber: number;
      newHiddenState: boolean;
    }) => {
      return moveSlotClass(
        variables.class_id,
        null,
        variables.timetable_id,
        variables.year,
        variables.weekNumber,
        variables.newHiddenState,
      );
    },
    // Optimistic update
    onMutate: async (variables) => {
      if (!slotId) {
        // Optionally, throw an error or handle the null case
        return;
      }
      // Cancel any outgoing refetches
      // await queryClient.cancelQueries(["slotClasses", slotId]);
      await queryClient.cancelQueries({ queryKey: ["timetables"] });

      // Snapshot the previous value
      const previousSlotClasses = queryClient.getQueryData<SlotClass[]>([
        "slotClasses",
        slotId,
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData<SlotClass[]>(["slotClasses", slotId], (old) => {
        if (!old) return [];
        return old.map((slotClass) => {
          if (slotClass.class_id === variables.class_id) {
            return {
              ...slotClass,
              isHidden: variables.newHiddenState,
            };
          }
          return slotClass;
        });
      });

      // Return a context object with the snapshotted value
      return { previousSlotClasses };
    },
    // On error, rollback to the previous value
    onError: (err, variables, context) => {
      if (context?.previousSlotClasses) {
        queryClient.setQueryData(
          ["slotClasses", slotId],
          context.previousSlotClasses,
        );
      }
    },
    // Always refetch after error or success
    onSettled: () => {
      // void queryClient.invalidateQueries(["slotClasses", slotId]);
      void queryClient.invalidateQueries({ queryKey: ["timetables"] });
    },
  });

  const handleHideClick = () => {
    // Determine the new hidden state
    const newHiddenState = !isHidden;

    if (!slotClassData) return;

    // Use the mutation to hide/unhide the class
    hideClassMutation.mutate({
      class_id: classData.class_id,
      timetable_id: classData.timetable_id,
      year,
      weekNumber,
      newHiddenState,
    });

    setIsDropdownOpen(false);
  };

  const sizeClasses = useMemo(() => {
    if (size === "small") {
      return {
        container: "p-0",
        icon: "h-4 w-4",
        text: "text-xs",
        button: "p-0",
      };
    }
    return {
      container: "p-1",
      icon: "h-6 w-6",
      text: "text-sm",
      button: "p-1",
    };
  }, [size]);

  return (
    <>
      <div
        ref={setNodeRef}
        style={{ ...style, backgroundColor: classData.color || "#ffffff" }}
        className={`flex w-full touch-none items-center justify-between rounded shadow-sm transition-shadow duration-200 hover:shadow-md ${textColorClass} ${sizeClasses.container}`}
      >
        <div
          className={` ${
            isHidden && "opacity-50"
          } flex items-center justify-start gap-1`}
        >
          <Grip
            size={size === "small" ? 16 : 20}
            className={`${isHidden ? "cursor-not-allowed" : "cursor-move"}`}
            {...attributes}
            {...listeners}
          />
          {classData.icon_name ? (
            <FontAwesomeIcon
              icon={[classData.icon_prefix, classData.icon_name as IconName]}
              className={sizeClasses.icon}
            />
          ) : (
            <FontAwesomeIcon
              icon="circle-question"
              className={sizeClasses.icon}
            />
          )}
          {isComplete && (
            <span
              className={`${sizeClasses.text}`}
              role="img"
              aria-label="Completed"
            >
              ✅
            </span>
          )}
          <span className={`truncate font-medium ${sizeClasses.text}`}>
            {classData.name}
          </span>
          <span>{isHidden && <EyeOff className="ml-2" size={24} />}</span>
        </div>
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`${textColorClass} ${sizeClasses.button}`}
            >
              <MoreVertical size={size === "small" ? 14 : 16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onSelect={() => {
                setIsEditDialogOpen(true);
                setIsDropdownOpen(false);
              }}
            >
              <Edit size={16} className="mr-2" /> Edit
            </DropdownMenuItem>
            {!isHidden ? (
              <DropdownMenuItem onSelect={handleHideClick}>
                <EyeOff size={16} className="mr-2" /> Hide
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onSelect={handleHideClick}>
                <Eye size={16} className="mr-2" /> Unhide
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onSelect={handleDisplayClick}>
              <Monitor size={16} className="mr-2" /> Display
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive hover:text-destructive-foreground"
              onSelect={() => {
                setIsDeleteDialogOpen(true);
                setIsDropdownOpen(false);
              }}
            >
              <Trash2 size={16} className="mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <EditClassDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setIsDropdownOpen(false);
        }}
        classData={classData}
        onEdit={handleEdit}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setIsDropdownOpen(false);
        }}
        onConfirm={handleDelete}
        itemName={classData.name}
      />
    </>
  );
};

export default ClassItem;
