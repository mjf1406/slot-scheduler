# Slotted

Effortlessly set up predefined time slots, then drag and drop events all around.

## To-do List

### p0

- UX: user can now create a new timetable
  - the setup has them moving slots around a week-long
- backend: set up the DB schema in `~/server/db/schema.ts`
- backend: set up the webhook
  - Start up ngrok to use the route in `~/app/api/webhooks/route.ts`
  - Set up [Clerk Webhook](https://clerk.com/docs/integrations/webhooks/sync-data)

## Change Log

2024/08/31

- UX: updated FAQ in `~/components/brand/FAQ.tsx`
- set up navbar and sidebar
-

## Dependencies

- Hosted on [Vercel](https://vercel.com/)
- CSS made easy thanks to [TailwindCSS](https://tailwindcss.com/)
- Database by [Turso](https://turso.tech/)
- Auth by [Clerk](https://clerk.com/)
- ORM by [Drizzle](https://orm.drizzle.team/)
- Colors from [RealtimeColors](https://www.realtimecolors.com/?colors=def2e7-050e09-89ddb0-1f824d-2bd579&fonts=Poppins-Poppins)
- UI components from [Shadcn/ui](https://ui.shadcn.com/)
