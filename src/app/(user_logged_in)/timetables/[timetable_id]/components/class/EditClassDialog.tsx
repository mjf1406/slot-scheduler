"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import ColorPicker from "~/components/ShadcnColorPicker";
import FAIconPicker from "~/components/FontAwesomeIconPicker";
import LoadingButton from "~/components/LoadingButton";
import type { Class } from "~/server/db/types";
import type { IconName } from "@fortawesome/fontawesome-svg-core";

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  color: z.string(),
  icon_name: z.string(),
  icon_prefix: z.enum(["fas", "far"]),
});

type EditProps = {
  isOpen: boolean;
  onClose: () => void;
  classData: Class;
  onEdit: (updatedClass: Class) => Promise<void>;
};

export const EditClassDialog: React.FC<EditProps> = ({
  isOpen,
  onClose,
  classData,
  onEdit,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: classData.name,
      color: classData.color,
      icon_name: classData.icon_name,
      icon_prefix: classData.icon_prefix,
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const updatedClass: Class = {
        ...classData,
        ...data,
      };
      await onEdit(updatedClass);
      onClose();
    } catch (error) {
      console.error("Failed to edit class:", error);
      // Handle error (e.g., show error message to user)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Class</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <ColorPicker
                      onSelectColor={field.onChange}
                      selectedColor={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="icon_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <FormControl>
                    <FAIconPicker
                      onSelectIcon={(iconName, prefix) => {
                        field.onChange(iconName);
                        form.setValue("icon_prefix", prefix as "fas" | "far");
                      }}
                      selectedIcon={
                        field.value
                          ? {
                              name: field.value as IconName,
                              prefix: form.getValues("icon_prefix"),
                            }
                          : undefined
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <LoadingButton type="submit" loading={isLoading}>
              Save Changes
            </LoadingButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
