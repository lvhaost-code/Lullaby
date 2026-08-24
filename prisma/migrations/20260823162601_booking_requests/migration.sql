-- CreateTable
CREATE TABLE "BookingRequest" (
    "id" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "pickupDate" TEXT NOT NULL,
    "returnDate" TEXT NOT NULL,
    "note" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingRequestItem" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "BookingRequestItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookingRequest_status_idx" ON "BookingRequest"("status");

-- CreateIndex
CREATE INDEX "BookingRequestItem_requestId_idx" ON "BookingRequestItem"("requestId");

-- AddForeignKey
ALTER TABLE "BookingRequestItem" ADD CONSTRAINT "BookingRequestItem_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "BookingRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
