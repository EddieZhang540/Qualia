import UserBook from "../models/userBook.js";
import { updateUserStat } from "../controllers/userStats.js";
import { UNFINISHED_TO_FINISHED, FINISHED_TO_UNFINISHED, UNFINISHED_TO_UNFINISHED } from "../utils/bookStatusConstants.js";

export const getUserBook = async (req, res) => {
  const userBookID = req.params;
  try {
    const userBookRecord = await UserBook.findOne({ _id: userBookID.user_id + userBookID.OL_key }).lean();
    res.status(200).json(userBookRecord);
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }
};

export const searchUserBooks = async (req, res) => {
  const userBookID = req.params;
  const { q, status, sort } = req.query;
  try {
    const userBooksRecord = await UserBook.fuzzySearch(q).where("user_id").equals(userBookID.user_id).or(status).sort(sort);
    res.status(200).json(userBooksRecord);
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }
};

export const putUserBook = async (req, res) => {
  if (!req.userId) return res.status(401).json({ message: "User not authenticated" });

  const userBookID = req.params;
  const userBookData = req.body;
  try {
    let originalRecord = await UserBook.findOneAndUpdate({ _id: userBookID.user_id + userBookID.OL_key }, userBookData, { upsert: true }).lean();
    res.status(200).send("OK");

    if (originalRecord) {
      if (userBookData?.readingStatus === "Finished") {
        await updateUserStat(userBookID.user_id, userBookData, false, UNFINISHED_TO_FINISHED, originalRecord.readingStatus, "Finished");
      } else if (originalRecord.readingStatus === "Finished") {
        originalRecord = {
          ...originalRecord,
          finishedReadingTime:
            originalRecord.finishedReadingTime.getFullYear() + "-" + (originalRecord.finishedReadingTime.getMonth() + 1 + "").padStart(2, "0"),
        };
        await updateUserStat(userBookID.user_id, originalRecord, true, FINISHED_TO_UNFINISHED, "Finished", userBookData.readingStatus);
      } else {
        await updateUserStat(userBookID.user_id, userBookData, false, UNFINISHED_TO_UNFINISHED, originalRecord.readingStatus, userBookData.readingStatus);
      }
    } else {
      await updateUserStat(userBookID.user_id, userBookData, false);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }
};

export const deleteUserBook = async (req, res) => {
  if (!req.userId) return res.status(401).json({ message: "User not authenticated" });

  const userBookID = req.params;
  try {
    let originalRecord = await UserBook.findOneAndDelete({ _id: userBookID.user_id + userBookID.OL_key }).lean();
    res.status(200).json("OK");

    if (originalRecord?.readingStatus === "Finished") {
      originalRecord = {
        ...originalRecord,
        finishedReadingTime: originalRecord.finishedReadingTime.getFullYear() + "-" + (originalRecord.finishedReadingTime.getMonth() + 1 + "").padStart(2, "0"),
      };
    }
    await updateUserStat(userBookID.user_id, originalRecord, true);
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }
};
