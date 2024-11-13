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
  FormDescription,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";
import { toast } from "~/components/ui/use-toast";
import { Loader2, Plus } from "lucide-react";
import { createClass } from "../../../actions";
import type { IconName } from "@fortawesome/fontawesome-svg-core";
import ColorPicker from "~/components/popover-pickers/ShadcnColorPicker";
import FAIconPicker from "~/components/popover-pickers/FontAwesomeIconPicker";
import { getYearAndWeekNumber } from "../../utils";

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  color: z.string(),
  icon_name: z.string(),
  icon_prefix: z.enum(["fas", "far"]),
  includeWeekInfo: z.boolean().default(false),
});

type FormSchema = z.infer<typeof formSchema>;

export function CreateClassDialog({
  timetableId,
  currentWeekStart,
}: {
  timetableId: string;
  currentWeekStart: Date;
}) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  useSuspenseQuery(timetablesOptions);

  const { year, weekNumber } = getYearAndWeekNumber(currentWeekStart);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      color: "#000000",
      icon_name: "",
      icon_prefix: "fas",
      includeWeekInfo: false,
    },
  });

  const onSubmit = async (data: FormSchema) => {
    setIsLoading(true);
    try {
      const result = await createClass({
        ...data,
        timetable_id: timetableId,
        year: data.includeWeekInfo ? year : null,
        weekNumber: data.includeWeekInfo ? weekNumber : null,
      });

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
    <>
      <style jsx global>{`
        .dialog-content {
          z-index: 50;
        }
        .picker-content {
          z-index: 100;
        }
      `}</style>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus size={20} className="mr-2" />
            Create Class
          </Button>
        </DialogTrigger>
        <DialogContent className="dialog-content sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Class</DialogTitle>
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
                      <div className="picker-content">
                        <ColorPicker
                          onSelectColor={(color) => {
                            console.log("Color selected:", color);
                            field.onChange(color);
                          }}
                          selectedColor={field.value}
                        />
                      </div>
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
                      <div className="picker-content">
                        <FAIconPicker
                          onSelectIcon={(iconName, prefix) => {
                            console.log("Icon selected:", iconName, prefix);
                            field.onChange(iconName);
                            form.setValue(
                              "icon_prefix",
                              prefix as "fas" | "far",
                            );
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
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="includeWeekInfo"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>For this week only</FormLabel>
                      <FormDescription>
                        This class will only appear in {year} during week{" "}
                        {weekNumber}.
                      </FormDescription>
                    </div>
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
    </>
  );
}
