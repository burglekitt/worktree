import { Code, Pre } from "nextra/components";

interface TerminalBlockProps {
  language?: string;
  children: string;
}

export function TerminalBlock({
  language = "bash",
  children,
}: TerminalBlockProps) {
  const command = children.trim();
  const lines = command.split(/\r?\n/);
  const lineCounts = new Map<string, number>();

  return (
    <Pre data-language={language}>
      <Code data-language={language}>
        {lines.map((line) => {
          const nextCount = (lineCounts.get(line) ?? 0) + 1;
          lineCounts.set(line, nextCount);

          return <span key={`${line}-${nextCount}`}>{line}</span>;
        })}
      </Code>
    </Pre>
  );
}
