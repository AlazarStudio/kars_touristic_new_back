import express from 'express';
import {
  createMultiDayTour,
  deleteMultiDayTour,
  getMultiDayTours,
  getOneMultiDayTour,
  updateMultiDayTour,
  updateMultiDayToursOrder, // Новый обработчик
} from './ultiDayTours.controller.js';

const router = express.Router();

router.route('/').post(createMultiDayTour).get(getMultiDayTours);
router.route('/order').put(updateMultiDayToursOrder); // Новый маршрут для сортировки туров
router.route('/:id').get(getOneMultiDayTour).put(updateMultiDayTour).delete(deleteMultiDayTour);

export default router;
