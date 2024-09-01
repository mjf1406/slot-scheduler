# Slotted

Create and manage timetables. Use predefined slots with drag-and-drop functionality to organize them.

## To-do List

### p1

- backend: set up the webhook
  - Start up ngrok to use the route in `~/app/api/webhooks/route.ts`
  - Set up [Clerk Webhook](https://clerk.com/docs/integrations/webhooks/sync-data)
- fixed: sidebar doesn't load on home page on mobile

### p0

- UX: user can now set up their newly created timetables
- UX: make it so the user can chooses whether this class applies to all timetables. Defaults to current only

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
