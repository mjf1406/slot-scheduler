import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

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
  
export const timetables = sqliteTable('timetables',
  {
    user_id: text('user_id').notNull().references(() => users.user_id),
    timetable_id: text('timetable_id').notNull().primaryKey(),
    days: text('days', { mode: 'json' }).notNull(),
    name: text('name').notNull(),
  }
)

