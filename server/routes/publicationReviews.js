import express from 'express';
import { getPublicationReviews, createPublicationReview } from '../controllers/publicationReviews.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/', createPublicationReview);
router.get('/', getPublicationReviews);

export default router;
