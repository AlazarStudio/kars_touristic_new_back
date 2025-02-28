import asyncHandler from 'express-async-handler';
import { prisma } from '../prisma.js';

// @desc    Get all hotels with pagination, sorting, and filtering
// @route   GET /api/hotels
// @access  Private
export const getHotels = asyncHandler(async (req, res) => {
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

  const totalHotels = await prisma.hotel.count({ where });

  const hotels = await prisma.hotel.findMany({
    where,
    skip: rangeStart,
    take: Math.min(rangeEnd - rangeStart + 1, totalHotels),
    orderBy: { [sortField]: sortOrder },
    include: {
      region: true, // Привязка к региону
      comforts: true, // Подключение удобств
    },
  });

  res.set(
    'Content-Range',
    `hotels ${rangeStart}-${Math.min(rangeEnd, totalHotels - 1)}/${totalHotels}`
  );
  res.json(hotels);
});

// @desc    Get single hotel by ID
// @route   GET /api/hotels/:id
// @access  Private
export const getOneHotel = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const hotel = await prisma.hotel.findUnique({
    where: { id: parseInt(id, 10) },
    include: {
      region: true,
      comforts: true,
    },
  });

  if (!hotel) {
    res.status(404).json({ error: 'Hotel not found!' });
    return;
  }

  res.json(hotel);
});

// @desc    Create new hotel
// @route   POST /api/hotels
// @access  Private
export const createHotel = asyncHandler(async (req, res) => {
  const {
    title,
    city,
    hotelType,
    address,
    numStars,
    description,
    addInfo,
    img,
    links,
    regionId,
    comforts, // Массив удобств
  } = req.body;

  if (!title || !city || !regionId || !img || !Array.isArray(img)) {
    res
      .status(400)
      .json({ error: 'Title, city, regionId, and img (array) are required' });
    return;
  }

  const hotel = await prisma.hotel.create({
    data: {
      title,
      city,
      hotelType,
      address,
      numStars,
      description,
      addInfo,
      img,
      links,
      region: { connect: { id: parseInt(regionId, 10) } },
      comforts: comforts
        ? {
            create: comforts.map((comfort) => ({
              title: comfort.title,
              description: comfort.description,
            })),
          }
        : undefined,
    },
  });

  res.status(201).json(hotel);
});

// @desc    Update hotel
// @route   PUT /api/hotels/:id
// @access  Private
export const updateHotel = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    title,
    city,
    hotelType,
    address,
    numStars,
    description,
    addInfo,
    img,
    links,
    regionId,
  } = req.body;

  try {
    const existingHotel = await prisma.hotel.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!existingHotel) {
      res.status(404).json({ error: 'Hotel not found!' });
      return;
    }

    const updatedHotel = await prisma.hotel.update({
      where: { id: parseInt(id, 10) },
      data: {
        title: title ?? existingHotel.title,
        city: city ?? existingHotel.city,
        hotelType: hotelType ?? existingHotel.hotelType,
        address: address ?? existingHotel.address,
        numStars: numStars ?? existingHotel.numStars,
        description: description ?? existingHotel.description,
        addInfo: addInfo ?? existingHotel.addInfo,
        img: Array.isArray(img) ? img : existingHotel.img,
        links: Array.isArray(links) ? links : existingHotel.links,
        region: regionId
          ? { connect: { id: parseInt(regionId, 10) } }
          : existingHotel.region,
      },
    });

    res.json(updatedHotel);
  } catch (error) {
    console.error('Error updating hotel:', error);
    res.status(500).json({ error: 'Error updating hotel' });
  }
});

// @desc    Delete hotel
// @route   DELETE /api/hotels/:id
// @access  Private
export const deleteHotel = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.hotel.delete({
      where: { id: parseInt(id, 10) },
    });

    res.json({ message: 'Hotel deleted successfully!' });
  } catch (error) {
    console.error('Error deleting hotel:', error);
    res.status(404).json({ error: 'Hotel not found!' });
  }
});
