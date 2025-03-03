import express from 'express';
// import { protect } from '../middleware/auth.middleware.js';
import {
  createPlace,
  deletePlace,
  getPlaces,
  getOnePlace,
  updatePlace,
} from './Places.controller.js';

const router = express.Router();

router.route('/').post(createPlace).get(getPlaces);

router.route('/:id').get(getOnePlace).put(updatePlace).delete(deletePlace);

export default router;
