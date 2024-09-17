"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { timetablesOptions } from "~/app/api/queryOptions";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import { toast } from "~/components/ui/use-toast";
import { Loader2, Plus } from "lucide-react";
import ColorPicker from "~/components/ShadcnColorPicker";
import FAIconPicker from "~/components/FontAwesomeIconPicker";
import { createClass } from "../../../actions";
import type { IconName } from "@fortawesome/fontawesome-svg-core";

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  color: z.string(),
  icon_name: z.string(),
  icon_prefix: z.enum(["fas", "far"]),
});

type FormSchema = z.infer<typeof formSchema>;

export function CreateClassDialog({ timetableId }: { timetableId: string }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  useSuspenseQuery(timetablesOptions);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      color: "#000000",
      icon_name: "",
      icon_prefix: "fas",
    },
  });

  const onSubmit = async (data: FormSchema) => {
    setIsLoading(true);
    try {
      const result = await createClass({ ...data, timetable_id: timetableId });
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        setOpen(false);
        form.reset();
        await queryClient.invalidateQueries({
          queryKey: timetablesOptions.queryKey,
        });
      } else {
        form.setError("name", {
          type: "manual",
          message: result.message,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus size={20} className="mr-2" />
          Create Class
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Class</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Form fields remain unchanged */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Class name" {...field} />
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
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  "Create Class"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
