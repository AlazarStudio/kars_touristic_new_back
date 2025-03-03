import asyncHandler from 'express-async-handler';
import { prisma } from '../prisma.js';

// @desc    Get all multi-day tours with pagination, sorting, and filtering
// @route   GET /api/multidaytours
// @access  Private
// ✅ Получение всех туров с сортировкой по `order`
export const getMultiDayTours = asyncHandler(async (req, res) => {
  const { range, sort, filter } = req.query;

  const rangeStart = range ? JSON.parse(range)[0] : 0;
  const rangeEnd = range ? JSON.parse(range)[1] : rangeStart + 10;

  const sortField = sort ? JSON.parse(sort)[0] : 'order';
  const sortOrder = sort ? JSON.parse(sort)[1].toLowerCase() : 'asc';

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

  const totalTours = await prisma.multiDayTours.count({ where });

  const multiDayTours = await prisma.multiDayTours.findMany({
    where,
    skip: rangeStart,
    take: Math.min(rangeEnd - rangeStart + 1, totalTours),
    orderBy: [{ order: 'asc' }, { [sortField]: sortOrder }],
    include: {
      region: true,
      infoByDays: true,
    },
  });

  res.set(
    'Content-Range',
    `multiDayTours ${rangeStart}-${Math.min(rangeEnd, totalTours - 1)}/${totalTours}`
  );
  res.json(multiDayTours);
});

// @desc    Get single multi-day tour by ID
// @route   GET /api/multidaytours/:id
// @access  Private
export const getOneMultiDayTour = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const multiDayTour = await prisma.multiDayTours.findUnique({
    where: { id: parseInt(id, 10) },
    include: {
      region: true,
      infoByDays: true,
    },
  });

  if (!multiDayTour) {
    res.status(404).json({ error: 'Multi-day tour not found!' });
    return;
  }

  res.json(multiDayTour);
});

// @desc    Create new multi-day tour
// @route   POST /api/multidaytours
// @access  Private
export const createMultiDayTour = asyncHandler(async (req, res) => {
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
    infoByDays = [],
  } = req.body;

  if (!title || !img || !Array.isArray(img) || !regionId) {
    res
      .status(400)
      .json({ error: 'Title, img (array), and regionId are required' });
    return;
  }

  const images = img.map((image) =>
    typeof image === 'object' && image.rawFile?.path
      ? `/uploads/${image.rawFile.path}`
      : image
  );

  // Получаем максимальное значение `order`, чтобы новый тур добавился в конец списка
  const maxOrder = await prisma.multiDayTours.aggregate({
    _max: { order: true },
  });

  const multiDayTour = await prisma.multiDayTours.create({
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
      img: images,
      tourDates: Array.isArray(tourDates) ? tourDates : [],
      bookingType: bookingType || 'default',
      places: Array.isArray(places) ? places : [],
      checklists: Array.isArray(checklists) ? checklists : [],
      region: { connect: { id: parseInt(regionId, 10) } },
      order: (maxOrder._max.order || 0) + 1, // Новый тур получит следующий order
      infoByDays: {
        create: infoByDays.map((day) => ({
          title: day.title,
          description: day.description,
        })),
      },
    },
    include: {
      infoByDays: true,
    },
  });

  res.status(201).json(multiDayTour);
});

// @desc    Update multi-day tour
// @route   PUT /api/multidaytours/:id
// @access  Private
export const updateMultiDayTour = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, transport, duration, price, order } = req.body;

  try {
    const existingTour = await prisma.multiDayTours.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!existingTour) {
      res.status(404).json({ error: 'Multi-day tour not found!' });
      return;
    }

    const updatedTour = await prisma.multiDayTours.update({
      where: { id: parseInt(id, 10) },
      data: {
        title: title ?? existingTour.title,
        transport: transport ?? existingTour.transport,
        duration: duration ?? existingTour.duration,
        price: price ?? existingTour.price,
        order: order ?? existingTour.order, // Обновляем order
      },
    });

    res.json(updatedTour);
  } catch (error) {
    console.error('Error updating tour:', error);
    res.status(500).json({ error: 'Error updating tour' });
  }
});

// @desc    Update order of multi-day tours
// @route   PUT /api/multidaytours/order
// @access  Private
export const updateMultiDayToursOrder = asyncHandler(async (req, res) => {
  const { orderedTours } = req.body;

  if (!Array.isArray(orderedTours)) {
    return res.status(400).json({ error: 'Invalid data format' });
  }

  try {
    const updatePromises = orderedTours.map((tour, index) =>
      prisma.multiDayTours.update({
        where: { id: parseInt(tour.id, 10) },
        data: { order: index }, // Обновляем поле `order`
      })
    );

    await Promise.all(updatePromises);
    res.json({ message: 'Multi-day tours order updated successfully!' });
  } catch (error) {
    console.error('Error updating tour order:', error);
    res.status(500).json({ error: 'Error updating tour order' });
  }
});

// @desc    Delete multi-day tour
// @route   DELETE /api/multidaytours/:id
// @access  Private
export const deleteMultiDayTour = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.multiDayTours.delete({
      where: { id: parseInt(id, 10) },
    });

    res.json({ message: 'Multi-day tour deleted successfully!' });
  } catch (error) {
    console.error('Error deleting tour:', error);
    res.status(404).json({ error: 'Multi-day tour not found!' });
  }
});
