export interface TestimonialProps {
  quote: string;
  author: string;
  role?: string;
}

export default function Testimonial({ quote, author, role }: TestimonialProps) {
  return (
    <section>
      <blockquote>
        <p>{quote}</p>
      </blockquote>
      <footer>
        <p>{author}</p>
        {role ? <p>{role}</p> : null}
      </footer>
    </section>
  );
}
