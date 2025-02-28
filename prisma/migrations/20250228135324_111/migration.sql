-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Region" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "img" TEXT[],
    "link" TEXT NOT NULL,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MultiDayTours" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "transport" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "timeToStart" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "minNumPeople" TEXT NOT NULL,
    "maxNumPeople" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "addInfo" TEXT NOT NULL,
    "img" TEXT[],
    "tourDates" TEXT[],
    "bookingType" TEXT NOT NULL,
    "places" TEXT[],
    "checklists" TEXT[],
    "regionId" INTEGER NOT NULL,

    CONSTRAINT "MultiDayTours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InfoByDays" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "multiDayTourId" INTEGER NOT NULL,

    CONSTRAINT "InfoByDays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OneDayTours" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "transport" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "timeToStart" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "minNumPeople" TEXT NOT NULL,
    "maxNumPeople" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "addInfo" TEXT NOT NULL,
    "img" TEXT[],
    "tourDates" TEXT[],
    "bookingType" TEXT NOT NULL,
    "places" TEXT[],
    "checklists" TEXT[],
    "regionId" INTEGER NOT NULL,

    CONSTRAINT "OneDayTours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InfoByDay" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "oneDayToursId" INTEGER,

    CONSTRAINT "InfoByDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutorTours" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "transport" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "timeToStart" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "minNumPeople" TEXT NOT NULL,
    "maxNumPeople" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "addInfo" TEXT NOT NULL,
    "img" TEXT[],
    "tourDates" TEXT[],
    "bookingType" TEXT NOT NULL,
    "places" TEXT[],
    "checklists" TEXT[],
    "regionId" INTEGER NOT NULL,

    CONSTRAINT "AutorTours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InfoByDaysAutor" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "autorToursId" INTEGER,

    CONSTRAINT "InfoByDaysAutor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hotel" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "hotelType" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "numStars" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "addInfo" TEXT NOT NULL,
    "img" TEXT[],
    "links" TEXT[],
    "regionId" INTEGER NOT NULL,

    CONSTRAINT "Hotel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comfort" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "hotelId" INTEGER NOT NULL,

    CONSTRAINT "Comfort_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Places" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "links" TEXT NOT NULL,
    "img" TEXT[],
    "regionId" INTEGER,

    CONSTRAINT "Places_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "infoPlaces" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "placeId" INTEGER NOT NULL,

    CONSTRAINT "infoPlaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Events" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "img" TEXT[],
    "regionId" INTEGER,

    CONSTRAINT "Events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_login_key" ON "User"("login");

-- AddForeignKey
ALTER TABLE "MultiDayTours" ADD CONSTRAINT "MultiDayTours_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InfoByDays" ADD CONSTRAINT "InfoByDays_multiDayTourId_fkey" FOREIGN KEY ("multiDayTourId") REFERENCES "MultiDayTours"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OneDayTours" ADD CONSTRAINT "OneDayTours_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InfoByDay" ADD CONSTRAINT "InfoByDay_oneDayToursId_fkey" FOREIGN KEY ("oneDayToursId") REFERENCES "OneDayTours"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutorTours" ADD CONSTRAINT "AutorTours_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InfoByDaysAutor" ADD CONSTRAINT "InfoByDaysAutor_autorToursId_fkey" FOREIGN KEY ("autorToursId") REFERENCES "AutorTours"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hotel" ADD CONSTRAINT "Hotel_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comfort" ADD CONSTRAINT "Comfort_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Places" ADD CONSTRAINT "Places_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "infoPlaces" ADD CONSTRAINT "infoPlaces_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Places"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Events" ADD CONSTRAINT "Events_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;
