export type Activity = {
    startTime: string;
    endTime: string;
    description: string;
};
  
export type Timetable = {
    user_id: string;
    timetable_id: string;
    days: Record<string, Activity[]>;
    name: string,
};