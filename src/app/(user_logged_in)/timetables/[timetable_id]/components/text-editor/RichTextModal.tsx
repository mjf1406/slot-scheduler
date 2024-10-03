import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

import type { SlotClass, Class } from "~/server/db/types";
import { Button } from "~/components/ui/button";

interface RichTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  classItem: SlotClass | null;
  classDetails: Class | null;
  onSave: (updatedClassItem: SlotClass) => void;
}

const RichTextModal: React.FC<RichTextModalProps> = ({
  isOpen,
  onClose,
  classItem,
  classDetails,
  onSave,
}) => {
  const [editorContent, setEditorContent] = useState("");

  useEffect(() => {
    if (isOpen && classItem) {
      setEditorContent(classItem.text ?? "");
    } else {
      setEditorContent("");
    }
  }, [isOpen, classItem]);

  const handleClose = () => {
    setEditorContent("");
    onClose();
  };

  const handleSave = () => {
    if (!classItem) {
      console.error("Cannot save: No class item available");
      return;
    }

    const updatedClassItem: SlotClass = {
      ...classItem,
      text: editorContent,
    };

    onSave(updatedClassItem);
    handleClose();
  };

  const modules = {
    toolbar: [
      [{ header: "1" }, { header: "2" }, { font: [] }],
      [{ size: [] }],
      [{ color: [] }, { background: [] }],
      [
        "bold",
        "italic",
        "underline",
        "strike",
        "blockquote",
        "link",
        "code-block",
      ],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      ["clean"],
      [{ script: "sub" }, { script: "super" }],
    ],
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {classDetails?.name ?? "Edit class schedule"}
          </DialogTitle>
        </DialogHeader>
        <div className="h-[60vh]">
          <ReactQuill
            value={editorContent}
            onChange={setEditorContent}
            modules={modules}
            theme="snow"
            className="h-full"
            preserveWhitespace
          />
        </div>
        <div className="mt-10 flex justify-end space-x-2">
          <Button onClick={handleClose} variant="destructive">
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RichTextModal;
