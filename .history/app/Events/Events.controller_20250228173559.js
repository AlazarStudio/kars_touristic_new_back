import asyncHandler from 'express-async-handler';
import { prisma } from '../prisma.js';

// @desc    Get all places with pagination, sorting, and filtering
// @route   GET /api/places
// @access  Private
export const getPlaces = asyncHandler(async (req, res) => {
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

  const totalPlaces = await prisma.places.count({ where });

  const places = await prisma.places.findMany({
    where,
    skip: rangeStart,
    take: Math.min(rangeEnd - rangeStart + 1, totalPlaces),
    orderBy: { [sortField]: sortOrder },
    include: {
      region: true, // Привязка к региону
      infoPlaces: true, // Привязка информации о местах
    },
  });

  res.set(
    'Content-Range',
    `places ${rangeStart}-${Math.min(rangeEnd, totalPlaces - 1)}/${totalPlaces}`
  );
  res.json(places);
});

// @desc    Get single place by ID
// @route   GET /api/places/:id
// @access  Private
export const getOnePlace = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const place = await prisma.places.findUnique({
    where: { id: parseInt(id, 10) },
    include: {
      region: true,
      infoPlaces: true,
    },
  });

  if (!place) {
    res.status(404).json({ error: 'Place not found!' });
    return;
  }

  res.json(place);
});

// @desc    Create new place
// @route   POST /api/places
// @access  Private
export const createPlace = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    links,
    img,
    regionId,
    infoPlaces, // Массив описаний
  } = req.body;

  if (!title || !description || !links || !img || !Array.isArray(img)) {
    res
      .status(400)
      .json({
        error: 'Title, description, links, and img (array) are required',
      });
    return;
  }

  const place = await prisma.places.create({
    data: {
      title,
      description,
      links,
      img,
      region: regionId
        ? { connect: { id: parseInt(regionId, 10) } }
        : undefined,
      infoPlaces: infoPlaces
        ? {
            create: infoPlaces.map((info) => ({
              title: info.title,
              description: info.description,
            })),
          }
        : undefined,
    },
  });

  res.status(201).json(place);
});

// @desc    Update place
// @route   PUT /api/places/:id
// @access  Private
export const updatePlace = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, links, img, regionId } = req.body;

  try {
    const existingPlace = await prisma.places.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!existingPlace) {
      res.status(404).json({ error: 'Place not found!' });
      return;
    }

    const updatedPlace = await prisma.places.update({
      where: { id: parseInt(id, 10) },
      data: {
        title: title ?? existingPlace.title,
        description: description ?? existingPlace.description,
        links: links ?? existingPlace.links,
        img: Array.isArray(img) ? img : existingPlace.img,
        region: regionId
          ? { connect: { id: parseInt(regionId, 10) } }
          : existingPlace.region,
      },
    });

    res.json(updatedPlace);
  } catch (error) {
    console.error('Error updating place:', error);
    res.status(500).json({ error: 'Error updating place' });
  }
});

// @desc    Delete place
// @route   DELETE /api/places/:id
// @access  Private
export const deletePlace = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.places.delete({
      where: { id: parseInt(id, 10) },
    });

    res.json({ message: 'Place deleted successfully!' });
  } catch (error) {
    console.error('Error deleting place:', error);
    res.status(404).json({ error: 'Place not found!' });
  }
});
