import React, { useState, useMemo } from "react";
import { Edit, Grip, MoreVertical, Trash2 } from "lucide-react";
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

interface ClassItemProps {
  classData: Class;
  onEdit: (updatedClass: Class) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  timetableId: string;
}

const ClassItem: React.FC<ClassItemProps> = ({
  classData,
  onEdit,
  onDelete,
}) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const textColorClass = useMemo(() => {
    return getContrastColor(classData.color || "#ffffff");
  }, [classData.color]);

  const handleEdit = async (updatedClass: Class) => {
    await onEdit(updatedClass);
    setIsEditDialogOpen(false);
  };

  const handleDelete = async () => {
    if (classData.class_id) {
      await onDelete(classData.class_id);
    }
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <div
        style={{ backgroundColor: classData.color || "#ffffff" }}
        className={`flex w-full items-center justify-between rounded p-0.5 shadow-sm transition-shadow duration-200 hover:shadow-md ${textColorClass}`}
      >
        <div className="flex items-center justify-start gap-2">
          <Grip size={20} className="cursor-move" />
          {classData.icon_name ? (
            <FontAwesomeIcon
              icon={[classData.icon_prefix, classData.icon_name as IconName]}
              className="h-6 w-6"
            />
          ) : (
            <FontAwesomeIcon icon="circle-question" className="h-6 w-6" />
          )}
          <span className="truncate text-sm font-medium">{classData.name}</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className={textColorClass}>
              <MoreVertical size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => setIsEditDialogOpen(true)}>
              <Edit size={16} className="mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive hover:text-destructive-foreground"
              onSelect={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 size={16} className="mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <EditClassDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        classData={classData}
        onEdit={handleEdit}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        itemName={classData.name}
      />
    </>
  );
};

export default ClassItem;
