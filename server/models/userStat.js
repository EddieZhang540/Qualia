import mongoose from "mongoose";

const userStatSchema = mongoose.Schema({
  user_id: String,
  totalBooks: { type: Number, default: 0 },
  totalBooksReadLater: { type: Number, default: 0 },
  totalBooksCurrentlyReading: { type: Number, default: 0 },
  totalPages: { type: Number, default: 0 },
  authorDistribution: [{ author: String, frequency: Number }],
  monthlyPages: [{ month: String, count: Number }],
  monthlySubjectDistribution: [{ month: String, distribution: [{ subject: String, frequency: Number }] }],
  monthlyPagesCumulative: [{ month: String, count: Number }],
  monthlySubjectDistributionCumulative: [{ month: String, distribution: [{ subject: String, frequency: Number }] }],
});

export default mongoose.model("UserStat", userStatSchema);
