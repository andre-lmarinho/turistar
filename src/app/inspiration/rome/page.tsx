// src/app/inspiration/rome/page.tsx
import rome from '@/data/rome.json';

export const metadata = {
  title: 'Rome Inspiration',
};

export default function RomeInspiration() {
  return (
    <main id="main-content" className="space-y-8 p-8">
      <h1 className="font-title text-4xl font-semibold">{rome.title_inspiration}</h1>
      {rome.itinerary.map((day) => (
        <section key={day.day} className="space-y-2">
          <h2 className="text-2xl font-medium">Day {day.day}</h2>
          <ul className="space-y-2">
            {day.activities.map((act, idx) => (
              <li key={idx} className="rounded border p-2">
                <p className="font-semibold">{act.title}</p>
                {act.startTime && <p>Start: {act.startTime}</p>}
                {act.duration != null && <p>Duration: {act.duration}h</p>}
                {act.address && <p>{act.address}</p>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
