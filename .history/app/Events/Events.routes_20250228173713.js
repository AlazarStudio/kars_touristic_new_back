import express from 'express';
// import { protect } from '../middleware/auth.middleware.js';
import {
  createEvent,
  deleteEvent,
  getEvents,
  getOneEvent,
  updateEvent,
} from './events.controller.js';

const router = express.Router();

router.route('/').post(createEvent).get(getEvents);

router.route('/:id').get(getOneEvent).put(updateEvent).delete(deleteEvent);

export default router;
