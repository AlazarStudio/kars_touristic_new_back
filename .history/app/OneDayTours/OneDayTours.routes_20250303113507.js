import express from 'express';
// import { protect } from '../middleware/auth.middleware.js';
import {
  createOneDayTour,
  deleteOneDayTour,
  getOneDayTours,
  getOneOneDayTour,
  updateOneDayTour,
} from './neDayTours.controller.js';

const router = express.Router();

router.route('/').post(createOneDayTour).get(getOneDayTours);

router.route('/:id').get(getOneOneDayTour).put(updateOneDayTour).delete(deleteOneDayTour);

export default router;
