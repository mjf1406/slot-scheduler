import { z } from "zod";

export const formSchema = z.object({
    name: z.string().min(1, "Timetable name is required"),
    days: z.array(z.string()).min(1, "Select at least one day"),
});

export type FormSchema = z.infer<typeof formSchema>;