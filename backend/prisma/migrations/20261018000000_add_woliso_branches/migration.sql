CREATE TABLE "branches" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Ethiopia',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

INSERT INTO "branches" ("id", "name", "city", "region", "country", "updatedAt")
VALUES
    ('00000000-0000-4000-8000-000000000001', 'Woliso Hotel - Branch No. 1', 'Woliso', 'Oromia', 'Ethiopia', CURRENT_TIMESTAMP),
    ('00000000-0000-4000-8000-000000000002', 'Woliso Hotel - Branch No. 2', 'Woliso', 'Oromia', 'Ethiopia', CURRENT_TIMESTAMP);

CREATE UNIQUE INDEX "branches_name_key" ON "branches"("name");

ALTER TABLE "rooms" ADD COLUMN "branchId" TEXT;

UPDATE "rooms"
SET "branchId" = '00000000-0000-4000-8000-000000000001';

ALTER TABLE "rooms" ALTER COLUMN "branchId" SET NOT NULL;

DROP INDEX "rooms_roomNumber_key";

CREATE UNIQUE INDEX "rooms_branchId_roomNumber_key" ON "rooms"("branchId", "roomNumber");
CREATE INDEX "rooms_branchId_idx" ON "rooms"("branchId");

ALTER TABLE "rooms"
ADD CONSTRAINT "rooms_branchId_fkey"
FOREIGN KEY ("branchId") REFERENCES "branches"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payments" ALTER COLUMN "currency" SET DEFAULT 'ETB';
ALTER TABLE "payments" ALTER COLUMN "method" SET DEFAULT 'CASH';
