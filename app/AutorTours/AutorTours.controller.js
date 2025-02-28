import asyncHandler from 'express-async-handler';
import { prisma } from '../prisma.js';

// @desc    Get all author tours with pagination, sorting, and filtering
// @route   GET /api/autortours
// @access  Private
export const getAutorTours = asyncHandler(async (req, res) => {
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

  const totalTours = await prisma.autorTours.count({ where });

  const autorTours = await prisma.autorTours.findMany({
    where,
    skip: rangeStart,
    take: Math.min(rangeEnd - rangeStart + 1, totalTours),
    orderBy: { [sortField]: sortOrder },
    include: {
      region: true, // Привязка к региону
      InfoByDaysAutor: true, // Привязка информации по дням тура
    },
  });

  res.set(
    'Content-Range',
    `autorTours ${rangeStart}-${Math.min(rangeEnd, totalTours - 1)}/${totalTours}`
  );
  res.json(autorTours);
});

// @desc    Get single author tour by ID
// @route   GET /api/autortours/:id
// @access  Private
export const getOneAutorTour = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const autorTour = await prisma.autorTours.findUnique({
    where: { id: parseInt(id, 10) },
    include: {
      region: true,
      InfoByDaysAutor: true,
    },
  });

  if (!autorTour) {
    res.status(404).json({ error: 'Author tour not found!' });
    return;
  }

  res.json(autorTour);
});

// @desc    Create new author tour
// @route   POST /api/autortours
// @access  Private
export const createAutorTour = asyncHandler(async (req, res) => {
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
    InfoByDaysAutor, // массив дней с информацией
  } = req.body;

  if (!title || !img || !Array.isArray(img) || !regionId) {
    res.status(400).json({ error: 'Title, img (array), and regionId are required' });
    return;
  }

  const autorTour = await prisma.autorTours.create({
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
      InfoByDaysAutor: InfoByDaysAutor
        ? { create: InfoByDaysAutor.map((day) => ({ title: day.title, description: day.description })) }
        : undefined,
    },
  });

  res.status(201).json(autorTour);
});

// @desc    Update author tour
// @route   PUT /api/autortours/:id
// @access  Private
export const updateAutorTour = asyncHandler(async (req, res) => {
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
    const existingTour = await prisma.autorTours.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!existingTour) {
      res.status(404).json({ error: 'Author tour not found!' });
      return;
    }

    const updatedTour = await prisma.autorTours.update({
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
    console.error('Error updating author tour:', error);
    res.status(500).json({ error: 'Error updating author tour' });
  }
});

// @desc    Delete author tour
// @route   DELETE /api/autortours/:id
// @access  Private
export const deleteAutorTour = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.autorTours.delete({
      where: { id: parseInt(id, 10) },
    });

    res.json({ message: 'Author tour deleted successfully!' });
  } catch (error) {
    console.error('Error deleting author tour:', error);
    res.status(404).json({ error: 'Author tour not found!' });
  }
});
