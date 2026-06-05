// Renders a JSON-LD <script> for structured data. Server component — the JSON
// is serialised at render time and shipped in the HTML so crawlers and AI
// agents read it without executing JS. `<` is escaped to prevent the closing
// </script> sequence from ever appearing inside the payload.
export function JsonLd({ data }: { data: object | object[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
