import express from 'express';
// import { protect } from '../middleware/auth.middleware.js';
import {
  createMultiDayTour,
  deleteMultiDayTour,
  getMultiDayTours,
  getOneMultiDayTour,
  updateMultiDayTour,
} from './multiDayTours.controller.js';

const router = express.Router();

router.route('/').post(createMultiDayTour).get(getMultiDayTours);

router.route('/:id').get(getOneMultiDayTour).put(updateMultiDayTour).delete(deleteMultiDayTour);

export default router;
