import type { Class } from "~/server/db/types";

export const APP_NAME = "Slotted"
export const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",]
export const LOADING_MESSAGES: string[] = [
    "Sharpening pencils... and minds!",
    "Preparing quests... and your brain!",
    "Gathering supplies... where’s my magic wand?",
    "Unlocking achievements... like a true adventurer!",
    "Brain power activated... let’s go!",
    "Charging up your imagination... almost there!",
    "Saddle up! We're heading into Learningville!",
    "Preparing your adventure... grab your thinking cap!",
    "Loading awesome... stay tuned!",
    "Magic math wands on standby!",
    "Mixing knowledge potions... almost ready!",
    "Making learning more epic... hold on!",
    "Finding treasure... in your next lesson!",
    "Stretching your brain... just a little longer!",
    "Summoning the power of learning!",
    "Unlocking level 5: Super Student!",
    "Loading fun... and a little bit of math!",
    "Crossing the bridge to Knowledge Land!",
    "Casting spells of curiosity... almost done!",
    "Upgrading your brain... stay tuned!",
    "Hold tight! The quest begins soon!",
    "Gathering facts... with a sprinkle of fun!",
    "Creating fun challenges... just for you!",
    "Building bridges... between you and knowledge!",
    "Knights of Learning, assemble!",
    "Loading your next adventure... almost there!",
    "Connecting the dots... of fun and learning!",
    "Shuffling ideas... and treasure maps!",
    "Grab your backpack... learning starts soon!",
    "Turning gears of knowledge... stay with us!",
    "Polishing shields... and pencils!",
    "Clearing the path to success... hold on tight!",
    "Gathering quests... and fun facts!",
    "Almost there! Knowledge awaits!",
    "Packing your learning toolkit!",
    "Sharpening swords... and spelling!",
    "Ready, set... learn!",
    "Deploying fun... in 3... 2... 1!",
    "Watch out for the learning dragon!",
    "Your adventure is loading... magic in progress!",
    "Charging up your curiosity!",
    "Creating riddles... for your quest!",
    "Bracing for knowledge!",
    "Fastening seat belts... learning blast-off!",
    "Loading treasure chests... of knowledge!",
    "Casting spells... of awesome learning!",
    "The adventure is almost here!",
    "Fueling up on fun facts!",
    "Hold tight, learning heroes!",
    "Almost there! Get ready to explore!",
  ];
export const MINUTE_SIZE_PIXELS = 1
export const HOUR_SIZE_PIXELS = MINUTE_SIZE_PIXELS * 60
export const EXAMPLE_CLASSES: Omit<Class, 'user_id' | 'timetable_id' | 'class_id'>[] = [
  { name: 'Grammar', color: '#ff6767', icon_name: 'spell-check', icon_prefix: 'fas' },
  { name: 'Reading', color: '#2433be', icon_name: 'book-open', icon_prefix: 'fas' },
  { name: 'Math', color: '#56d6ac', icon_name: 'square-root-variable', icon_prefix: 'fas' },
  { name: 'Writing', color: '#dbaf2a', icon_name: 'pencil', icon_prefix: 'fas' },
  { name: 'Vocabulary', color: '#5eb74f', icon_name: 'language', icon_prefix: 'fas' },
  { name: 'Science', color: '#8624dd', icon_name: 'flask', icon_prefix: 'fas' },
  { name: 'Social', color: '#ff00de', icon_name: 'earth-africa', icon_prefix: 'fas' },
  { name: 'Exam', color: '#000000', icon_name: 'file-lines', icon_prefix: 'fas' },
];