import PublicationReview from '../models/publicationReview.js';

export const createPublicationReview = async (req, res) => {
  try {
    const publicationReviewData = req.body;
    const result = await PublicationReview.create(publicationReviewData);
  } catch (error) {
    res.status(400).json({ error: error });
  }
};

export const getPublicationReviews = (req, res) => {
  res.send(`Here are all publication reviews: `);
};
