import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "~/components/ui/use-toast";
import { deleteTimetable } from "../actions";
import { useQueryClient } from "@tanstack/react-query";
import type { Timetable } from "~/server/db/types";
import { cn } from "~/lib/utils";

interface DeleteDialogProps {
  timetable: Timetable;
}

export function DeleteDialog({ timetable }: DeleteDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteTimetable({
        timetableId: timetable.timetable_id,
      });
      if (result.success) {
        await queryClient.invalidateQueries({ queryKey: ["timetables"] });
        toast({
          title: "Success",
          description: "Timetable deleted successfully",
        });
        setOpen(false);
      } else {
        throw new Error(result.error ?? "Failed to delete timetable");
      }
    } catch (error) {
      console.error("Error deleting timetable:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Trash2 size={20} className="text-destructive" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            timetable <span className="font-bold">{timetable.name}</span> and
            remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className={cn(
              "bg-destructive text-destructive-foreground hover:bg-destructive/90",
              isDeleting &&
                "cursor-not-allowed opacity-50 hover:bg-destructive",
            )}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
