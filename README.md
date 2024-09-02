# Slotted

Create and manage timetables. Use predefined slots with drag-and-drop functionality to organize them.

## To-do List

### p1

- backend: set up the webhook
  - Start up ngrok to use the route in `~/app/api/webhooks/route.ts`
  - Set up [Clerk Webhook](https://clerk.com/docs/integrations/webhooks/sync-data)
- fixed: sidebar doesn't load on home page on mobile
- UX: timetable
  - edit mode
    - [ ] the user to change their slots' times by dragging the ends and starts to different times
    - [ ] can change slots' names
    - [ ] add/remove days
    - [ ] name
    - [ ] when a class is put into a slot, it sets that as the default, so the next week, the class will be there automatically

### p0

- UX: when adding a class, classes can have the the below changed
  - [ ] background color
  - [ ] icon & icon color
  - [ ] class applies to current timetable or selected timetables
- UX: can edit a class: icon, color, name, timetable
- UX: can delete a class: from current timetable only, or from all
- UX: removed default day, start time, and end time from Create New Class

## Change Log

2024/09/01

- UI: user can now add classes to a specific timetable
- backend: set up the DB schema in `~/server/db/schema.ts`
- UI: user can now create timetables
- UI: added a timetable select

2024/08/31

- UX: updated FAQ in `~/components/brand/FAQ.tsx`
- set up navbar and sidebar

## Dependencies

- Hosted on [Vercel](https://vercel.com/)
- CSS made easy thanks to [TailwindCSS](https://tailwindcss.com/)
- Database by [Turso](https://turso.tech/)
- Auth by [Clerk](https://clerk.com/)
- ORM by [Drizzle](https://orm.drizzle.team/)
- Colors from [RealtimeColors](https://www.realtimecolors.com/?colors=def2e7-050e09-89ddb0-1f824d-2bd579&fonts=Poppins-Poppins)
- UI components from [Shadcn/ui](https://ui.shadcn.com/)
