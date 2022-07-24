import mongoose from "mongoose";
import mongoose_fuzzy_searching from "mongoose-fuzzy-searching";

const userBookSchema = mongoose.Schema({
  _id: String,
  OL_key: { type: String, required: true },
  user_id: { type: String, require: true },
  coverURL: { type: String, required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  pages: Number,
  subjects: { type: [String], default: [] },

  readingStatus: { type: String, required: true },
  beganReadingTime: Date,
  finishedReadingTime: Date,
  shelf: { type: [String], default: [] },
  quotes: { type: [String], default: [] },
});

userBookSchema.plugin(mongoose_fuzzy_searching, {
  fields: [{ name: "title" }, { name: "author", prefixOnly: true, weight: 2 }],
});
export default mongoose.model("UserBook", userBookSchema);
