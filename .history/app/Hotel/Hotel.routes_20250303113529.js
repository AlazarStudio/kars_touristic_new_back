import express from 'express';
// import { protect } from '../middleware/auth.middleware.js';
import {
  createHotel,
  deleteHotel,
  getHotels,
  getOneHotel,
  updateHotel,
} from './Hotel.controller.js';

const router = express.Router();

router.route('/').post(createHotel).get(getHotels);

router.route('/:id').get(getOneHotel).put(updateHotel).delete(deleteHotel);

export default router;
