import React, { useState } from "react";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";

interface ActionDropdownProps {
  onEdit: () => void;
  onDelete: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ActionDropdown: React.FC<ActionDropdownProps> = ({
  onEdit,
  onDelete,
  isOpen,
  onOpenChange,
}) => {
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleEdit = () => {
    onEdit();
    onOpenChange(false);
  };

  const handleDeleteClick = () => {
    setIsAlertOpen(true);
  };

  const handleDeleteConfirm = () => {
    onDelete();
    setIsAlertOpen(false);
    onOpenChange(false);
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-3 w-3 md:h-4 md:w-4">
            <MoreVertical className="h-2 w-2 md:h-4 md:w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive"
            onSelect={handleDeleteClick}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              time slot.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
