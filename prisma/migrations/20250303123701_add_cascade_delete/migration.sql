-- DropForeignKey
ALTER TABLE "InfoByDays" DROP CONSTRAINT "InfoByDays_multiDayTourId_fkey";

-- AddForeignKey
ALTER TABLE "InfoByDays" ADD CONSTRAINT "InfoByDays_multiDayTourId_fkey" FOREIGN KEY ("multiDayTourId") REFERENCES "MultiDayTours"("id") ON DELETE CASCADE ON UPDATE CASCADE;
