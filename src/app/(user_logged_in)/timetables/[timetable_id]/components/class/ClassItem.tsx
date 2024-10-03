import React, { useState, useMemo } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  Edit,
  FileText,
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
import type { Class } from "~/server/db/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconName } from "@fortawesome/fontawesome-svg-core";
import { getContrastColor } from "~/lib/utils";
import { useTheme } from "next-themes";

interface ClassItemProps {
  classData: Class;
  onEdit: (updatedClass: Class) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClick: (classData: Class) => void;
  timetableId: string;
  size?: "small" | "normal";
  isDragging?: boolean;
}

const ClassItem: React.FC<ClassItemProps> = ({
  classData,
  onEdit,
  onDelete,
  onClick,
  size = "normal",
  isDragging = false,
}) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: classData.class_id,
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
        <div className="flex items-center justify-start gap-1">
          <Grip
            size={size === "small" ? 16 : 20}
            className="cursor-move"
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
          <span className={`truncate font-medium ${sizeClasses.text}`}>
            {classData.name}
          </span>
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
            <DropdownMenuItem onSelect={handleDetailsClick}>
              <FileText size={16} className="mr-2" /> Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                /* TODO: Add functionality */
              }}
            >
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
