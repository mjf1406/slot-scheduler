import { foreignKey, index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
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
    class_id: text('class_id').notNull().primaryKey(),
    user_id: text('user_id').notNull().references(() => users.user_id),
    timetable_id: text('timetable_id').notNull().references(() => timetables.timetable_id),
    linked_class: text('linked_class'), // references class_id
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
          classes_by_user_id: index("classes_by_user_id").on(table.user_id),
          parentReference: foreignKey({
            columns: [table.linked_class],
            foreignColumns: [table.class_id],
            name: "class_linked_class_id",
        })
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

export const slot_classes = sqliteTable('slot_classes',
  {
    id: text('id').notNull().primaryKey(),
    user_id: text('user_id').notNull().references(() => users.user_id),
    timetable_id: text('timetable_id').notNull().references(() => timetables.timetable_id),
    slot_id: text('slot_id').references(() => slots.slot_id),
    class_id: text('class_id').notNull().references(() => classes.class_id),
    week_number: integer('week_number').notNull(),
    year: integer('year').notNull(),
    size: text('size').$type<"whole" | "split">().notNull(),
    text: text('text'),
    complete: integer('complete', { mode: 'boolean' }).default(false),
    hidden: integer('hidden', { mode: 'boolean' }).default(false),
  },
  (table) => ({
    slot_classes_timetable_idx: index("slot_classes_timetable_idx").on(table.timetable_id),
    slot_classes_slot_idx: index("slot_classes_slot_idx").on(table.slot_id),
    slot_classes_class_idx: index("slot_classes_class_idx").on(table.class_id),
    slot_classes_week_year_idx: index("slot_classes_week_year_idx").on(table.week_number, table.year),
    slot_classes_slot_week_year_idx: index("slot_classes_slot_week_year_idx").on(table.slot_id, table.week_number, table.year),
    slot_classes_class_week_year_idx: index("slot_classes_class_week_year_idx").on(table.class_id, table.week_number, table.year),
  })
)

export const disabled_slots = sqliteTable('disabled_slots',
  {
    id: text('id').notNull().primaryKey(),
    slot_id: text('slot_id').notNull().references(() => slots.slot_id),
    disable_date: text('disable_date').default(sql`CURRENT_TIMESTAMP`).notNull(),
    user_id: text('user_id').notNull().references(() => users.user_id),
  },
  (table) => ({
    disabled_slots_slot_date_idx: index("disabled_slots_slot_date_idx").on(table.slot_id, table.disable_date),
  })
);
