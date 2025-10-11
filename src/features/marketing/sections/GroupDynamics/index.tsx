export interface GroupDynamicsPoint {
  title: string;
  description: string;
}

export interface GroupDynamicsProps {
  title: string;
  description?: string;
  points: GroupDynamicsPoint[];
}

export default function GroupDynamics({ title, description, points }: GroupDynamicsProps) {
  return (
    <section>
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
      <ul>
        {points.map((point, index) => (
          <li key={point.title + index}>
            <h3>{point.title}</h3>
            <p>{point.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
