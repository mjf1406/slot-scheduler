import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import type { Slot } from "./types";

export const users = sqliteTable('users',
  {
    user_id: text('user_id').notNull().primaryKey(),
    user_name: text('user_name').notNull(),
    user_email: text('user_email').notNull().unique(),
    user_role: text('user_role', { enum: ["teacher","admin"] }), // All users who sign up will be assigned the teacher role. Will need to manually assign admins.
    joined_date: text('joined_date').default(sql`CURRENT_TIMESTAMP`).notNull(),
    updated_date: text('updated_date').default(sql`CURRENT_TIMESTAMP`).notNull(),
  }
)

/*
  INSERT INTO users (user_id, user_name, user_email, user_role) 
  VALUES 
  ('user_2hJQqqywkygYAjPEoAncvveceXL', 'Michael Fitzgerald', 'michael.fitzgerald.1406@gmail.com', 'admin');
*/
  
export const classes = sqliteTable('classes', 
  {
    user_id: text('user_id').notNull().references(() => users.user_id),
    timetable_id: text('timetable_id').notNull().references(() => timetables.timetable_id),
    class_id: text('class_id').notNull().primaryKey(),
    name: text('name').notNull(),
    default_day: text('default_day'),
    default_start: text('default_start'),
    default_end: text('default_end'),
    day: text('day'),
    start: text('start'),
    end: text('end'),
    color: text('color').notNull(),
    icon_name: text('icon_name').notNull(),
    icon_prefix: text('icon_prefix').notNull(),
  }, 
  (table) => {
      return {
          classes_by_user_id: index("classes_by_user_id").on(table.user_id)
      }
  }
);

export const timetables = sqliteTable('timetables',
  {
    user_id: text('user_id').notNull().references(() => users.user_id),
    timetable_id: text('timetable_id').notNull().primaryKey(),
    days: text('days', { mode: 'json' }).notNull().$type<string[]>(),
    name: text('name').notNull(),
    slots: text('slots', { mode: 'json' }).$type<Slot[]>().default([]),
    start_time: integer('start_time', { mode: 'number' }).notNull(),
    end_time: integer('end_time', { mode: 'number' }).notNull(),
  }, 
  (table) => {
      return {
          timetables_by_user_id: index("timetables_by_user_id").on(table.user_id)
      }
  }
)

export const slots = sqliteTable('slots', 
  {
    user_id: text('user_id').notNull().references(() => users.user_id),
    timetable_id: text('timetable_id').notNull().references(() => timetables.timetable_id),
    slot_id: text('slot_id').notNull().primaryKey(),
    day: text('day').notNull(),
    start_time: text('start_time').notNull(),
    end_time: text('end_time').notNull(),
  }, 
  (table) => {
      return {
          slots_by_user_id: index("slots_by_user_id").on(table.user_id)
      }
  }
)