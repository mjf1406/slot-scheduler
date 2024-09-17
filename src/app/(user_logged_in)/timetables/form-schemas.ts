import { z } from "zod";

export const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    days: z.array(z.string()).min(1, "Select at least one day"),
    start_time: z .number(),
    end_time: z .number()
  });

export type FormSchema = z.infer<typeof formSchema>;