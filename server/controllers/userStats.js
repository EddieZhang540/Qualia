import UserStat from "../models/userStat.js";
import {
  READ_LATER,
  CURRENTLY_READING,
  FINISHED,
  UNFINISHED_TO_FINISHED,
  FINISHED_TO_UNFINISHED,
  UNFINISHED_TO_UNFINISHED,
} from "../utils/bookStatusConstants.js";
import { cloneDeep as _cloneDeep } from "lodash-es";

export const updateUserStat = async (user_id, userBookData, deleteBook, changeStatus, oldStatus, newStatus) => {
  try {
    let userStatDoc = await UserStat.findOne({ user_id });
    if (changeStatus === UNFINISHED_TO_FINISHED) {
      if (oldStatus === READ_LATER) userStatDoc.totalBooksReadLater -= 1;
      else userStatDoc.totalBooksCurrentlyReading -= 1;
      userStatDoc.totalBooks += 1;
      userStatDoc.totalPages += userBookData.pages;
    } else if (changeStatus === FINISHED_TO_UNFINISHED) {
      userStatDoc.totalBooks -= 1;
      userStatDoc.totalPages -= userBookData.pages;
      if (newStatus === READ_LATER) userStatDoc.totalBooksReadLater += 1;
      else userStatDoc.totalBooksCurrentlyReading += 1;
    } else if (changeStatus === UNFINISHED_TO_UNFINISHED) {
      if (oldStatus === READ_LATER) userStatDoc.totalBooksReadLater -= 1;
      else userStatDoc.totalBooksCurrentlyReading -= 1;
      if (newStatus === READ_LATER) userStatDoc.totalBooksReadLater += 1;
      else userStatDoc.totalBooksCurrentlyReading += 1;
    } else if (!deleteBook) {
      if (userBookData.readingStatus === READ_LATER) userStatDoc.totalBooksReadLater += 1;
      else if (userBookData.readingStatus === CURRENTLY_READING) userStatDoc.totalBooksCurrentlyReading += 1;
      else {
        userStatDoc.totalBooks += 1;
        userStatDoc.totalPages += userBookData.pages;
      }
    } else {
      if (userBookData.readingStatus === READ_LATER) userStatDoc.totalBooksReadLater -= 1;
      else if (userBookData.readingStatus === CURRENTLY_READING) userStatDoc.totalBooksCurrentlyReading -= 1;
      else {
        userStatDoc.totalBooks -= 1;
        userStatDoc.totalPages -= userBookData.pages;
      }
    }

    if (userBookData.readingStatus === FINISHED) {
      const authorDistEntry = userStatDoc.authorDistribution.findIndex((e) => e.author === userBookData.author);
      if (!deleteBook) {
        if (authorDistEntry >= 0) {
          userStatDoc.authorDistribution.push({ author: userBookData.author, frequency: userStatDoc.authorDistribution[authorDistEntry].frequency + 1 });
          userStatDoc.authorDistribution.splice(authorDistEntry, 1);
        } else {
          userStatDoc.authorDistribution.push({ author: userBookData.author, frequency: 1 });
        }
      } else {
        if (userStatDoc.authorDistribution[authorDistEntry].frequency > 1) {
          userStatDoc.authorDistribution.push({ author: userBookData.author, frequency: userStatDoc.authorDistribution[authorDistEntry].frequency - 1 });
        }
        userStatDoc.authorDistribution.splice(authorDistEntry, 1);
      }
      userStatDoc.authorDistribution.sort((entryA, entryB) => entryB.frequency - entryA.frequency);

      const userBookFinishedParsed = userBookData.finishedReadingTime.split("-");
      const userBookFinishedMonth = userBookFinishedParsed[0] + "_" + userBookFinishedParsed[1];

      const monthlyPagesEntry = userStatDoc.monthlyPages.findIndex((e) => e.month === userBookFinishedMonth);
      if (!deleteBook) {
        if (monthlyPagesEntry >= 0) {
          userStatDoc.monthlyPages.push({ month: userBookFinishedMonth, count: userStatDoc.monthlyPages[monthlyPagesEntry].count + userBookData.pages });
          userStatDoc.monthlyPages.splice(monthlyPagesEntry, 1);
        } else {
          userStatDoc.monthlyPages.push({ month: userBookFinishedMonth, count: userBookData.pages });
        }
      } else {
        if (userStatDoc.monthlyPages[monthlyPagesEntry].count > userBookData.pages) {
          userStatDoc.monthlyPages.push({ month: userBookFinishedMonth, count: userStatDoc.monthlyPages[monthlyPagesEntry].count - userBookData.pages });
        }
        userStatDoc.monthlyPages.splice(monthlyPagesEntry, 1);
      }
      userStatDoc.monthlyPages.sort((entryA, entryB) => {
        if (entryA.month < entryB.month) {
          return -1;
        } else if (entryA.month > entryB.month) {
          return 1;
        } else {
          return 0;
        }
      });
      let monthlyPagesAcc = 0;
      let newMonthlyPagesCumulative = [];
      for (let i = 0; i < userStatDoc.monthlyPages.length; i++) {
        monthlyPagesAcc += userStatDoc.monthlyPages[i].count;
        newMonthlyPagesCumulative.push({ month: userStatDoc.monthlyPages[i].month, count: monthlyPagesAcc });
      }
      userStatDoc.monthlyPagesCumulative = newMonthlyPagesCumulative;

      const monthlySubjectDistEntry = userStatDoc.monthlySubjectDistribution.findIndex((e) => e.month === userBookFinishedMonth);
      if (userBookData.subjects.length) {
        if (!deleteBook) {
          if (monthlySubjectDistEntry >= 0) {
            let newDistribution = userStatDoc.monthlySubjectDistribution[monthlySubjectDistEntry].distribution;
            for (let i = 0; i < userBookData.subjects.length; i++) {
              const s = userBookData.subjects[i];
              const distIndex = newDistribution.findIndex((e) => e.subject === s);
              if (distIndex >= 0) {
                newDistribution.push({ subject: s, frequency: newDistribution[distIndex].frequency + 1 });
                newDistribution.splice(distIndex, 1);
              } else {
                newDistribution.push({ subject: s, frequency: 1 });
              }
            }

            userStatDoc.monthlySubjectDistribution.push({
              month: userBookFinishedMonth,
              distribution: newDistribution,
            });
            userStatDoc.monthlySubjectDistribution[userStatDoc.monthlySubjectDistribution.length - 1].distribution.sort(
              (entryA, entryB) => entryB.frequency - entryA.frequency
            );
            userStatDoc.monthlySubjectDistribution.splice(monthlySubjectDistEntry, 1);
          } else {
            userStatDoc.monthlySubjectDistribution.push({
              month: userBookFinishedMonth,
              distribution: userBookData.subjects.map((s) => ({ subject: s, frequency: 1 })),
            });
          }
        } else {
          let newDistribution = [];
          for (let i = 0; i < userStatDoc.monthlySubjectDistribution[monthlySubjectDistEntry].distribution.length; i++) {
            const e = userStatDoc.monthlySubjectDistribution[monthlySubjectDistEntry].distribution[i];
            if (userBookData.subjects.includes(e.subject)) {
              if (e.frequency > 1) {
                newDistribution.push({ subject: e.subject, frequency: e.frequency - 1 });
              }
            } else {
              newDistribution.push({ subject: e.subject, frequency: e.frequency });
            }
          }
          if (newDistribution.length) {
            userStatDoc.monthlySubjectDistribution.push({
              month: userBookFinishedMonth,
              distribution: newDistribution,
            });
            userStatDoc.monthlySubjectDistribution[userStatDoc.monthlySubjectDistribution.length - 1].distribution.sort(
              (entryA, entryB) => entryB.frequency - entryA.frequency
            );
          }
          userStatDoc.monthlySubjectDistribution.splice(monthlySubjectDistEntry, 1);
        }
        userStatDoc.monthlySubjectDistribution.sort((entryA, entryB) => {
          if (entryA.month < entryB.month) {
            return -1;
          } else if (entryA.month > entryB.month) {
            return 1;
          } else {
            return 0;
          }
        });
        let monthlySubjectDistributionAcc = [];
        let newMonthlySubjectDistribution = [];
        for (let i = 0; i < userStatDoc.monthlySubjectDistribution.length; i++) {
          for (let j = 0; j < userStatDoc.monthlySubjectDistribution[i].distribution.length; j++) {
            const s = userStatDoc.monthlySubjectDistribution[i].distribution[j].subject;
            const distIndex = monthlySubjectDistributionAcc.findIndex((e) => e.subject === s);
            if (distIndex >= 0) {
              monthlySubjectDistributionAcc.push({
                subject: s,
                frequency: monthlySubjectDistributionAcc[distIndex].frequency + userStatDoc.monthlySubjectDistribution[i].distribution[j].frequency,
              });
              monthlySubjectDistributionAcc.splice(distIndex, 1);
            } else {
              monthlySubjectDistributionAcc.push({ subject: s, frequency: userStatDoc.monthlySubjectDistribution[i].distribution[j].frequency });
            }
          }
          monthlySubjectDistributionAcc.sort((entryA, entryB) => entryB.frequency - entryA.frequency);

          newMonthlySubjectDistribution.push({
            month: userStatDoc.monthlySubjectDistribution[i].month,
            distribution: _cloneDeep(monthlySubjectDistributionAcc),
          });
        }

        userStatDoc.monthlySubjectDistributionCumulative = newMonthlySubjectDistribution;
      }
    }

    await UserStat.updateOne({ user_id }, userStatDoc);
  } catch (error) {
    console.log(error);
  }
};

export const getUserStats = async (req, res) => {
  const { user_id } = req.params;
  try {
    const userStatDoc = await UserStat.findOne({ user_id }).lean();
    res.status(200).json(userStatDoc);
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }
};
