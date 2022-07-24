import mongoose from "mongoose";

const publicationReviewSchema = mongoose.Schema({
  title: String,
  author: String,
  OL_key: Number,
  total_ratings: { type: Number, default: 0 },
  num_ratings: { type: Number, default: 0 },
  reviews: [String],
});

export default mongoose.model("PublicationReview", publicationReviewSchema);
