// Frontend/src/types/schedule.ts
export interface ClassSession {
  id: string;
  title: string; // e.g., "Data Structures (CS201)"
  start: Date;
  end: Date;
  facultyName?: string;
  room?: string;
}
