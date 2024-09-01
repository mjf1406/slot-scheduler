// types.ts
export type Activity = {
    startTime: string;
    endTime: string;
    description: string;
};
  
export type Slot = {
    start_time: string,
    end_time: string,
    day: string,
}

export type Timetable = {
    user_id: string;
    timetable_id: string;
    days: Record<string, Activity[]>;
    name: string,
    slots: Slot[],
    classes: Class[],
};

export type Class = {
    user_id?: string,
    timetable_id?: string,
    class_id?: string,
    name: string,
    default_day: string,
    default_start: string,
    default_end: string,
    day: string,
    start: string,
    end: string,
}