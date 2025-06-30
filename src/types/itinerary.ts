export interface Activity {
  id: string;
  title: string;
  duration: number;
  description: string;
}
export interface DayPlan {
  id: string;
  label: string;
  activities: Activity[];
}