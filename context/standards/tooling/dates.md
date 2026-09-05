# Dates, Times, and Timezones

## Core Rules

- Use `Temporal` types for all date/time work — never the legacy `Date` object
- Store timestamps as UTC (`Temporal.Instant` serialized to ISO 8601)
- Convert to the user's timezone only at display time (`Temporal.ZonedDateTime`)
- Use `Temporal.PlainDate` for calendar dates (birthdays, holidays) — not timestamps
- Never assume the server and client share a timezone

## Preferred Library

Use [`@burglekitt/gmt`](https://github.com/burglekitt/gmt) — a thin layer over the modern [Temporal API](https://tc39.es/proposal-temporal/docs/) for handling date/time, timezones, and arithmetic. Includes a polyfill for environments without native Temporal yet.

Temporal replaces the legacy `Date` object and provides:
- Immutable types with explicit timezone handling
- Calendar-aware arithmetic that doesn't break on DST or leap seconds
- Clear separation between instants, zoned datetimes, plain dates, and durations

## Choosing the Right Temporal Type

| Concept | Type | Use for |
|---|---|---|
| A specific moment globally | `Temporal.Instant` | Server timestamps, event times, audit logs |
| A moment in a specific timezone | `Temporal.ZonedDateTime` | Scheduled local meetings, recurring events |
| A calendar date with no time | `Temporal.PlainDate` | Birthdays, holidays, due dates |
| Wall-clock time with no date | `Temporal.PlainTime` | Daily schedules, opening hours |
| Date + time without timezone | `Temporal.PlainDateTime` | Floating events ("3pm on the 19th, wherever") |
| A time span | `Temporal.Duration` | TTLs, intervals, elapsed time |

Choosing the right type prevents whole categories of bugs:

```ts
import { Temporal } from "@burglekitt/gmt";

// Birthday — calendar date, no timezone (avoids "birthday shows wrong day in Pacific time")
const birthday = Temporal.PlainDate.from("1990-04-12");

// Event — specific instant in time
const eventAt = Temporal.Instant.from("2026-05-19T15:00:00Z");

// Recurring meeting — wall-clock time bound to a zone
const meeting = Temporal.ZonedDateTime.from("2026-05-19T10:00-04:00[America/New_York]");

// Duration — for arithmetic
const ttl = Temporal.Duration.from({ hours: 24 });
```

## Storage

Store in UTC. The database column should be:
- PostgreSQL: `TIMESTAMP WITH TIME ZONE` (`timestamptz`)
- MySQL: `DATETIME` stored in UTC by convention
- Prisma: `DateTime` (maps to `timestamptz` on Postgres)

Convert between Prisma's `Date` and `Temporal.Instant` at the ORM boundary. Treat Temporal types as canonical inside your application.

```ts
// Reading from Prisma
const invoice = await db.invoice.findUnique({ where: { id } });
const dueAt = Temporal.Instant.fromEpochMilliseconds(invoice.dueDate.getTime());

// Writing to Prisma
await db.invoice.update({
  where: { id },
  data: { dueDate: new Date(dueAt.epochMilliseconds) },
});
```

For calendar dates with no time component, use a `DATE` column and `Temporal.PlainDate`:

```prisma
model User {
  birthday DateTime @db.Date  // stored as a date, not a timestamp
}
```

## API Contracts

Serialize as ISO 8601 strings. Parse and validate with Zod, then convert to Temporal types:

```ts
import { Temporal } from "@burglekitt/gmt";
import { z } from "zod";

const invoiceSchema = z.object({
  id: z.string(),
  dueDate: z.string().transform((s) => Temporal.Instant.from(s)),
  createdAt: z.string().transform((s) => Temporal.Instant.from(s)),
});

type Invoice = z.infer<typeof invoiceSchema>;
// Invoice["dueDate"] is now Temporal.Instant
```

For calendar dates, use `PlainDate`:

```ts
const userSchema = z.object({
  birthday: z.string().transform((s) => Temporal.PlainDate.from(s)),
});
```

## Detecting User Timezone

```ts
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
// "America/New_York", "Europe/London", etc.
```

Store the user's preferred timezone on their profile if they may travel; fall back to browser-detected timezone otherwise.

## Display

Convert to the user's timezone at the edge — in the component, not in storage or transport:

```tsx
import { Temporal } from "@burglekitt/gmt";

interface InvoiceDateProps {
  instant: Temporal.Instant;
  timezone: string;
}

export function InvoiceDate({ instant, timezone }: InvoiceDateProps) {
  const zoned = instant.toZonedDateTimeISO(timezone);
  const formatted = zoned.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  return (
    <time dateTime={instant.toString()}>
      {formatted}
    </time>
  );
}
```

## Arithmetic

Temporal types are immutable — every operation returns a new value:

```ts
import { Temporal } from "@burglekitt/gmt";

const created = Temporal.Instant.from("2026-05-19T15:00:00Z");
const dueIn30 = created.add({ days: 30 });

const today = Temporal.Now.plainDateISO();
const due = Temporal.PlainDate.from("2026-06-18");
const daysUntilDue = today.until(due, { largestUnit: "days" }).days;
const isOverdue = Temporal.PlainDate.compare(today, due) > 0;
```

DST and timezone offsets are handled correctly because Temporal knows about calendars and timezones — manual millisecond math does not.

## Relative Time

For "2 hours ago" style display:

```ts
import { Temporal } from "@burglekitt/gmt";

const elapsed = Temporal.Now.instant().since(invoice.createdAt);
// elapsed is a Temporal.Duration — format with Intl.RelativeTimeFormat
const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
rtf.format(-elapsed.total({ unit: "hour" }), "hour");
// "2 hours ago"
```

## DO NOT

- Use the legacy `Date` object for new code — Temporal is strictly better
- Use `Date.parse` or `new Date("string")` — parse with `Temporal.Instant.from` etc.
- Compare dates with `<` / `>` operators — use `Temporal.Instant.compare` / `Temporal.PlainDate.compare`
- Do millisecond arithmetic — use `.add()` / `.subtract()` / `.until()` / `.since()`
- Mix `Date` and `Temporal` types — convert at the boundary, stay Temporal internally
- Use a timestamp where a calendar date belongs (causes timezone display bugs)
- Trust client-supplied timestamps for security-critical logic — derive on the server

## PRIORITY

```
Temporal types > Date object
UTC storage > Local storage
Display at the edge > Display everywhere
Right type for the concept > Generic timestamp
```

## See Also

- [`../typescript/validation.md`](../typescript/validation.md) — Zod schemas with Temporal parsing
- [`prisma.md`](prisma.md) — Prisma date columns
- [`dependencies.md`](dependencies.md) — when to prefer native APIs
