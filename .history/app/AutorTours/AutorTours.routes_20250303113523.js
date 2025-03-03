import express from 'express';
// import { protect } from '../middleware/auth.middleware.js';
import {
  createAutorTour,
  deleteAutorTour,
  getAutorTours,
  getOneAutorTour,
  updateAutorTour,
} from './AutorTours.controller.js';

const router = express.Router();

router.route('/').post(createAutorTour).get(getAutorTours);

router.route('/:id').get(getOneAutorTour).put(updateAutorTour).delete(deleteAutorTour);

export default router;
