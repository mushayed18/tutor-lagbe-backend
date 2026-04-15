-- CreateTable
CREATE TABLE "HireRelation" (
    "id" TEXT NOT NULL,
    "tutorId" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "tuitionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HireRelation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HireRelation_tutorId_parentId_idx" ON "HireRelation"("tutorId", "parentId");

-- CreateIndex
CREATE UNIQUE INDEX "HireRelation_tutorId_tuitionId_key" ON "HireRelation"("tutorId", "tuitionId");

-- AddForeignKey
ALTER TABLE "HireRelation" ADD CONSTRAINT "HireRelation_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HireRelation" ADD CONSTRAINT "HireRelation_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HireRelation" ADD CONSTRAINT "HireRelation_tuitionId_fkey" FOREIGN KEY ("tuitionId") REFERENCES "Tuition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
