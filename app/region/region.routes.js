import express from 'express';
// import { protect } from '../middleware/auth.middleware.js';
import {
  createRegion,
  deleteRegion,
  getRegions,
  getOneRegion,
  updateRegion,
} from './region.controller.js';

const router = express.Router();

router.route('/').post(createRegion).get(getRegions);

router.route('/:id').get(getOneRegion).put(updateRegion).delete(deleteRegion);

export default router;
