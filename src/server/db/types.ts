// types.ts

export type Activity = {
    startTime: string;
    endTime: string;
    description: string;
};

export type Slot = {
    user_id: string;
    timetable_id: string;
    slot_id: string;
    day: string;
    start_time: string;
    end_time: string;
    isDisabled?: boolean | undefined;
};

export type Timetable = {
    user_id: string;
    timetable_id: string;
    days: string[];
    name: string;
    slots: Slot[];
    classes: Class[];
    start_time: number;
    end_time: number;
    slotClasses?: SlotClass[]
};

export type Class = {
    user_id: string;
    timetable_id: string;
    class_id: string;
    name: string;
    default_day?: string;
    default_start?: string;
    default_end?: string;
    day?: string;
    start?: string;
    end?: string;
    color: string;
    icon_name: string;
    icon_prefix: 'fas' | 'far';
    linked_class: string | null;
};

export type SlotClass = {
    id?: string;
    user_id: string;
    timetable_id: string;
    slot_id: string | null;
    class_id: string;
    week_number: number;
    year: number;
    size: "whole" | "split";
    text?: string | null;
    complete: boolean | null;
    hidden: boolean | undefined | null;
};

export type DisabledSlot = {
    id: string;
    slot_id: string;
    disable_date: string;  // YYYY-MM-DD
    user_id: string;
  };
  