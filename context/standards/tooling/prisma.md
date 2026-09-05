# Prisma

## Purpose

Prisma is the ORM of choice for TypeScript backend work. It provides type-safe database access with generated types derived from the schema.

## Key Principles

- Schema is the source of truth — all types are generated from it
- Use generated Prisma types directly — do not duplicate them as DTOs
- Use `prisma.$transaction` for multi-step operations that must succeed or fail together
- Validate external input before passing to Prisma

## Schema Conventions

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  role      Role     @default(MEMBER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  invoices  Invoice[]

  @@map("users")  // snake_case table name
}

model Invoice {
  id        String        @id @default(cuid())
  title     String
  amount    Decimal       @db.Decimal(10, 2)
  status    InvoiceStatus @default(DRAFT)
  dueDate   DateTime
  userId    String
  user      User          @relation(fields: [userId], references: [id])
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt

  @@map("invoices")
}

enum Role {
  ADMIN
  MEMBER
  VIEWER
}

enum InvoiceStatus {
  DRAFT
  OPEN
  PAID
  VOID
}
```

## Conventions

- Use `cuid()` or `uuid()` for IDs — not auto-increment integers (avoids enumeration)
- Always include `createdAt` and `updatedAt` with `@default(now())` and `@updatedAt`
- Use `@@map` to keep table names snake_case while model names are PascalCase
- Use `Decimal` for monetary values — never `Float`

## Client Singleton

```ts
// lib/db.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

## Using Generated Types

```ts
import type { Invoice, User, InvoiceStatus } from "@prisma/client";

// Use Prisma's utility types for partial shapes
import type { Prisma } from "@prisma/client";

type InvoiceWithUser = Prisma.InvoiceGetPayload<{
  include: { user: true };
}>;
```

## Migrations

```bash
# Create a migration from schema changes
pnpm prisma migrate dev --name add_invoice_notes

# Apply migrations in production
pnpm prisma migrate deploy

# Reset development database
pnpm prisma migrate reset

# Regenerate the Prisma client after schema change
pnpm prisma generate
```

## Transactions

```ts
const [user, invoice] = await db.$transaction([
  db.user.create({ data: userData }),
  db.invoice.create({ data: { ...invoiceData, userId: user.id } }),
]);

// For dependent operations
await db.$transaction(async (tx) => {
  const user = await tx.user.create({ data: userData });
  const invoice = await tx.invoice.create({
    data: { ...invoiceData, userId: user.id },
  });
  return { user, invoice };
});
```

## DO NOT

- Expose the Prisma client directly to API route handlers — wrap in a service layer
- Use raw `$queryRaw` without parameterized inputs (SQL injection risk)
- Store monetary values as `Float`
- Duplicate Prisma types as hand-written DTOs

## See Also

- [`../typescript/validation.md`](../typescript/validation.md) — Zod alongside generated Prisma types
- [`dates.md`](dates.md) — DateTime columns and timezone handling
- [`../typescript/error-handling.md`](../typescript/error-handling.md) — wrapping database errors
- [`../security/api-security.md`](../security/api-security.md) — SQL injection prevention
