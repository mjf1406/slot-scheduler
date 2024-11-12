# Slotted

Create and manage timetables. Use predefined slots with drag-and-drop functionality to organize them.

## To-do List

### p2

- backend: set up the webhook
  - Start up ngrok to use the route in `~/app/api/webhooks/route.ts`
  - Set up [Clerk Webhook](https://clerk.com/docs/integrations/webhooks/sync-data)

### p1

- slots: added an edit button to created slots that prompts you to change all future slots, or just this one
- UX: when adding a class, class applies to current timetable or selected timetables
- ⚠️ local-first: use [TinyBase](https://tinybase.org/) to implement a local-first architecture
- ⚠️ i18n: use [next-international](https://next-international.vercel.app/docs/app-setup) for localization
- automation: announcements can now be automated. User can add an announcement that is on a given date, then set the range for which to display them, e.g. only display announcements from current day to 3 weeks out.

### p0

- BUG: can now edit the details of a class when it is unassigned
- BUG: when moving a class from a slot to unassigned and back into a slot, the slot no longer loses its dnd functionality
- How do we handle the same class being repeated when the class will be in different blocks?
  - when editing a class, allow a linked class to be selected, where they both share TEXT column data
    - call this Linked Class and it shares only the TEXT column
- added: can now create a new class for the current week only
- UX: user can now mark an entire day as no school day for the given week only (this will just loop through all the slots on the given day, using the below)
- UX: user can now disable a slot using the action menu for the given week only

## Change Log

2024/11/12

- UX: finalized the hide/unhide classes in class list

2024/11/11

- UI: user can show and hide hidden classes in the class list
- UI: hidden classes cannot be dragged and dropped

2024/11/10

- UX: can disable a time slot, but it does not persist in the DB
- UI: there is a border around the slots to more easily tell them apart
- fixed: classes can now be deleted properly

2024/10/09

- tags must also include hyphens and underscores and other characters, only a space should break them
- Add a checkbox to the details that the user can click to indicate it's done, then display it in the class item

2024/10/07

- timeslots that have passed are now rendered with opacity-50
- added an edit button to the display modal, improving UX
- adjusted the pixel size of each minute to 1.75, increasing the height of each time slot

2024/10/04

- UX: if there are no classes in a timetable, a Add example classes button appears and if clicked, will add the 8 classes in `constants.ts`
- fixed: timeslots are now optimistically rendered and deleted
- fixed: moving a classitem to a new timeslot or unassigned classes no longer deletes the text
- UX: switched to [optimistic queries](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates) so the UI updates before saving to the server
- fixed: when creating/editing a class, the icon and color can now be selected again

2024/10/03

- added: can add details for a specific class on specific day/week and then click display to make it all nice on the screen for display during class
- added: the user can easily return to the current week by clicking the button
- added: user can now move classes to timeslots and they will stay when moving to another week and load correctly when reloading the page
- added: can add class details for a given class in a given week, should use to set up the schedule for that class for that day

2024/09/21

- UI: moved the timeslot buttons to an action menu
- UX: classes in unassigned classes are now draggable to any order
- UX: when creating a slot, user can select as many days as they want

2024/09/17

- UI: removed breadcrumb in the page and added it to the navbar
- UI: removed the sidebar and sheetmenu (can easily be added in by uncommenting)
- UX: can edit a timetable
- UX: can delete a timetable
- fixed font color for classes to render based on their bg color for best contrast
- slots: added a button to quickly cut the duration in half, while maintaining the same start time in the edit dialog
- slots: added a button to quickly double the duration while maintaining the same start time in the edit dialog
- UI: new timetables appear properly in the UI upon creation
- backend: created slots are saved to the db
- backend: user can now delete slots in UI and db
- UI: on mobile, implement a day carousel so that only 2 days are shown at a time.
- UX: let the user toggle between the DayCarousel and a VERY small, WeekView
- fixed: mobile main padding and margins are now a decent size to ensure the week view as the most room as possible.
- backend: added start and end times when creating a new timetable

2024/09/16

- UI: rebuilt the `timetable/timetable_id` page
- UX: removed default day, start time, and end time from Create New Class
- UX: user can create a slot
- backend: suspenseQuery is now used
- routing: a list of timetables is now displayed on `/timetables`
- routing: use clicks on a timetable in the above and is routed to `/timetables/timetable_id`
- UX: added a bunch of icons for the seven main classes: grammar, social, reading, vocab, science, math, writing, exam

2024/09/04

- added basic dates to the timetable view
- UX: can delete a class from current timetable only
- UX: can edit a class: icon, color, name, timetable
- added loading state to the get started/timetables button on the home page
- added color and icon to class

2024/09/03

- created color picker and icon picker components

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

## Stuff

### Step 1

using dnd-kit, implement drag and drop into the below components using useDroppable and useDraggable in the following way. Prepare for a future where users can also move classitem to timeslot and back, but do not implement it. only implement the below.

1.) users should be able to move the ClassItems within ClassList into any order they want

### Step 2

using dnd-kit, implement drag and drop into the below components using useDroppable and useDraggable in the following way.

1.) user should be able to move a ClassItem from the ClassList into a TimeSlot and have it display within the timeslot once dropped.
2.) users should be able to drag and drop a classitem from a timeslot back into the classlist in any position that they want.

if a component has changes, ensure you output all code for that component so i can easily copy-paste it
