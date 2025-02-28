import asyncHandler from 'express-async-handler';
import { prisma } from '../prisma.js';

// @desc    Get all events with pagination, sorting, and filtering
// @route   GET /api/events
// @access  Private
export const getEvents = asyncHandler(async (req, res) => {
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

  const totalEvents = await prisma.events.count({ where });

  const events = await prisma.events.findMany({
    where,
    skip: rangeStart,
    take: Math.min(rangeEnd - rangeStart + 1, totalEvents),
    orderBy: { [sortField]: sortOrder },
    include: {
      Region: true, // Привязка к региону
    },
  });

  res.set(
    'Content-Range',
    `events ${rangeStart}-${Math.min(rangeEnd, totalEvents - 1)}/${totalEvents}`
  );
  res.json(events);
});

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Private
export const getOneEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const event = await prisma.events.findUnique({
    where: { id: parseInt(id, 10) },
    include: {
      Region: true,
    },
  });

  if (!event) {
    res.status(404).json({ error: 'Event not found!' });
    return;
  }

  res.json(event);
});

// @desc    Create new event
// @route   POST /api/events
// @access  Private
export const createEvent = asyncHandler(async (req, res) => {
  const { title, description, link, img, regionId } = req.body;

  if (!title || !description || !img || !Array.isArray(img)) {
    res.status(400).json({ error: 'Title, description, and img (array) are required' });
    return;
  }

  const event = await prisma.events.create({
    data: {
      title,
      description,
      link,
      img,
      Region: regionId ? { connect: { id: parseInt(regionId, 10) } } : undefined,
    },
  });

  res.status(201).json(event);
});

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private
export const updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, link, img, regionId } = req.body;

  try {
    const existingEvent = await prisma.events.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!existingEvent) {
      res.status(404).json({ error: 'Event not found!' });
      return;
    }

    const updatedEvent = await prisma.events.update({
      where: { id: parseInt(id, 10) },
      data: {
        title: title ?? existingEvent.title,
        description: description ?? existingEvent.description,
        link: link ?? existingEvent.link,
        img: Array.isArray(img) ? img : existingEvent.img,
        Region: regionId ? { connect: { id: parseInt(regionId, 10) } } : existingEvent.Region,
      },
    });

    res.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Error updating event' });
  }
});

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
export const deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.events.delete({
      where: { id: parseInt(id, 10) },
    });

    res.json({ message: 'Event deleted successfully!' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(404).json({ error: 'Event not found!' });
  }
});
