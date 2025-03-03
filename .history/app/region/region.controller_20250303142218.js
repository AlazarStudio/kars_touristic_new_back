import asyncHandler from 'express-async-handler';
import { prisma } from '../prisma.js';

// @desc    Get all regions with pagination, sorting, and filtering
// @route   GET /api/regions
// @access  Private
export const getRegions = asyncHandler(async (req, res) => {
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

  const totalRegions = await prisma.region.count({ where });

  const regions = await prisma.region.findMany({
    where,
    skip: rangeStart,
    take: Math.min(rangeEnd - rangeStart + 1, totalRegions),
    orderBy: { [sortField]: sortOrder },
    include: {
      MultiDayTours: true,
      OneDayTours: true,
      Hotels: true,
      Events: true,
      Places: true,
      AutorTours: true,
    },
  });

  res.set(
    'Content-Range',
    `regions ${rangeStart}-${Math.min(rangeEnd, totalRegions - 1)}/${totalRegions}`
  );
  res.json(regions);
});

// @desc    Get single region by ID
// @route   GET /api/regions/:id
// @access  Private
export const getOneRegion = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const region = await prisma.region.findUnique({
    where: { id: parseInt(id, 10) },
    include: {
      MultiDayTours: true,
      OneDayTours: true,
      Hotels: true,
      Events: true,
      Places: true,
      AutorTours: true,
    },
  });

  if (!region) {
    res.status(404).json({ error: 'Region not found!' });
    return;
  }

  res.json(region);
});

// @desc    Create new region
// @route   POST /api/regions
// @access  Private
export const createRegion = asyncHandler(async (req, res) => {
  const { title, description, img, link } = req.body;

  if (!title || !description || !img || !Array.isArray(img)) {
    res
      .status(400)
      .json({ error: 'Title, description, and img (array) are required' });
    return;
  }

  

  const region = await prisma.region.create({
    data: {
      title,
      description,
      img,
      link,
    },
  });

  res.status(201).json(region);
});

// @desc    Update region
// @route   PUT /api/regions/:id
// @access  Private
export const updateRegion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, img, link } = req.body;

  try {
    const existingRegion = await prisma.region.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!existingRegion) {
      res.status(404).json({ error: 'Region not found!' });
      return;
    }

    const updatedRegion = await prisma.region.update({
      where: { id: parseInt(id, 10) },
      data: {
        title: title ?? existingRegion.title,
        description: description ?? existingRegion.description,
        img: Array.isArray(img) ? img : existingRegion.img,
        link: link ?? existingRegion.link,
      },
    });

    res.json(updatedRegion);
  } catch (error) {
    console.error('Error updating region:', error);
    res.status(500).json({ error: 'Error updating region' });
  }
});

// @desc    Delete region
// @route   DELETE /api/regions/:id
// @access  Private
export const deleteRegion = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.region.delete({
      where: { id: parseInt(id, 10) },
    });

    res.json({ message: 'Region deleted successfully!' });
  } catch (error) {
    console.error('Error deleting region:', error);
    res.status(404).json({ error: 'Region not found!' });
  }
});
