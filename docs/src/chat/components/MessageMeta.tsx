"use client";

interface MessageMetaProps {
  titleId: string;
  title: string;
  titleClass?: string;
  createdAt: number;
}

export function MessageMeta({
  titleId,
  title,
  titleClass = "font-semibold",
  createdAt,
}: MessageMetaProps) {
  const isoTime = new Date(createdAt).toISOString();
  const formattedTime = new Date(createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex items-baseline justify-between mb-1">
      <div id={titleId} className={titleClass}>
        {title}
      </div>
      <time
        dateTime={isoTime}
        className="text-xs text-gray-400 dark:text-gray-500 ml-2"
      >
        {formattedTime}
      </time>
    </div>
  );
}
