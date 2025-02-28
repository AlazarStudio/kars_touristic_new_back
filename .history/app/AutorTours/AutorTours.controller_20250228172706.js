import asyncHandler from 'express-async-handler';
import { prisma } from '../prisma.js';

// @desc    Get all one-day tours with pagination, sorting, and filtering
// @route   GET /api/onedaytours
// @access  Private
export const getOneDayTours = asyncHandler(async (req, res) => {
  const { range, sort, filter } = req.query;

  const rangeStart = range ? JSON.parse(range)[0] : 0;
  const rangeEnd = range ? JSON.parse(range)[1] : rangeStart + 10;

  const sortField = sort ? JSON.parse(sort)[0] : 'createdAt';
  const sortOrder = sort ? JSON.parse(sort)[1].toLowerCase() : 'desc';

  const filters = filter ? JSON.parse(filter) : {};

  const where = Object.keys(filters).reduce((acc, field) => {
    const value = filters[field];
    if (Array.isArray(value)) {
      acc[field] = { in: value };
    } else if (typeof value === 'string') {
      acc[field] = { contains: value, mode: 'insensitive' };
    } else {
      acc[field] = { equals: value };
    }
    return acc;
  }, {});

  const totalTours = await prisma.oneDayTours.count({ where });

  const oneDayTours = await prisma.oneDayTours.findMany({
    where,
    skip: rangeStart,
    take: Math.min(rangeEnd - rangeStart + 1, totalTours),
    orderBy: { [sortField]: sortOrder },
    include: {
      region: true, // Привязка к региону
      InfoByDay: true, // Привязка информации о днях
    },
  });

  res.set(
    'Content-Range',
    `oneDayTours ${rangeStart}-${Math.min(rangeEnd, totalTours - 1)}/${totalTours}`
  );
  res.json(oneDayTours);
});

// @desc    Get single one-day tour by ID
// @route   GET /api/onedaytours/:id
// @access  Private
export const getOneOneDayTour = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const oneDayTour = await prisma.oneDayTours.findUnique({
    where: { id: parseInt(id, 10) },
    include: {
      region: true,
      InfoByDay: true,
    },
  });

  if (!oneDayTour) {
    res.status(404).json({ error: 'One-day tour not found!' });
    return;
  }

  res.json(oneDayTour);
});

// @desc    Create new one-day tour
// @route   POST /api/onedaytours
// @access  Private
export const createOneDayTour = asyncHandler(async (req, res) => {
  const {
    title,
    transport,
    duration,
    timeToStart,
    type,
    level,
    minNumPeople,
    maxNumPeople,
    price,
    addInfo,
    img,
    tourDates,
    bookingType,
    places,
    checklists,
    regionId,
    InfoByDay, // массив дней с информацией
  } = req.body;

  if (!title || !img || !Array.isArray(img) || !regionId) {
    res.status(400).json({ error: 'Title, img (array), and regionId are required' });
    return;
  }

  const oneDayTour = await prisma.oneDayTours.create({
    data: {
      title,
      transport,
      duration,
      timeToStart,
      type,
      level,
      minNumPeople,
      maxNumPeople,
      price,
      addInfo,
      img,
      tourDates,
      bookingType,
      places,
      checklists,
      region: { connect: { id: parseInt(regionId, 10) } },
      InfoByDay: InfoByDay
        ? { create: InfoByDay.map((day) => ({ title: day.title, description: day.description })) }
        : undefined,
    },
  });

  res.status(201).json(oneDayTour);
});

// @desc    Update one-day tour
// @route   PUT /api/onedaytours/:id
// @access  Private
export const updateOneDayTour = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    title,
    transport,
    duration,
    timeToStart,
    type,
    level,
    minNumPeople,
    maxNumPeople,
    price,
    addInfo,
    img,
    tourDates,
    bookingType,
    places,
    checklists,
    regionId,
  } = req.body;

  try {
    const existingTour = await prisma.oneDayTours.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!existingTour) {
      res.status(404).json({ error: 'One-day tour not found!' });
      return;
    }

    const updatedTour = await prisma.oneDayTours.update({
      where: { id: parseInt(id, 10) },
      data: {
        title: title ?? existingTour.title,
        transport: transport ?? existingTour.transport,
        duration: duration ?? existingTour.duration,
        timeToStart: timeToStart ?? existingTour.timeToStart,
        type: type ?? existingTour.type,
        level: level ?? existingTour.level,
        minNumPeople: minNumPeople ?? existingTour.minNumPeople,
        maxNumPeople: maxNumPeople ?? existingTour.maxNumPeople,
        price: price ?? existingTour.price,
        addInfo: addInfo ?? existingTour.addInfo,
        img: Array.isArray(img) ? img : existingTour.img,
        tourDates: Array.isArray(tourDates) ? tourDates : existingTour.tourDates,
        bookingType: bookingType ?? existingTour.bookingType,
        places: Array.isArray(places) ? places : existingTour.places,
        checklists: Array.isArray(checklists) ? checklists : existingTour.checklists,
        region: regionId ? { connect: { id: parseInt(regionId, 10) } } : existingTour.region,
      },
    });

    res.json(updatedTour);
  } catch (error) {
    console.error('Error updating one-day tour:', error);
    res.status(500).json({ error: 'Error updating one-day tour' });
  }
});

// @desc    Delete one-day tour
// @route   DELETE /api/onedaytours/:id
// @access  Private
export const deleteOneDayTour = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.oneDayTours.delete({
      where: { id: parseInt(id, 10) },
    });

    res.json({ message: 'One-day tour deleted successfully!' });
  } catch (error) {
    console.error('Error deleting one-day tour:', error);
    res.status(404).json({ error: 'One-day tour not found!' });
  }
});
