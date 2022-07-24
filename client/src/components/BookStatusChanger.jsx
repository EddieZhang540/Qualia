import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { READ_LATER, CURRENTLY_READING, FINISHED } from "../utils/shelfConstants";
import {
  Text,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Icon,
  FormControl,
  FormLabel,
  Flex,
  Input,
  ButtonGroup,
  useToast,
  FormErrorMessage,
} from "@chakra-ui/react";
import { AiFillCaretDown } from "react-icons/ai";
import { BsBookmarkPlus, BsBookmarkStar, BsBookmarkCheck, BsBookmarkPlusFill, BsBookmarkStarFill, BsBookmarkCheckFill } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { selectUser, handleUnauthorizedAction } from "../features/user/userSlice";
import { setFetchBooks } from "../features/userBook/userBookSlice";
import { deleteUserBookAPI, getUserBookAPI, putUserBookAPI } from "../api/index";
import { filterSubjectsFromOL } from "../utils/filterSubjects";

const BookStatusChanger = ({ OL_key, coverURL, title, author, pages, subjects }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const user = useSelector(selectUser);
  const today = new Date();
  const toast = useToast();

  const [currentUserBook, setCurrentUserBook] = useState({});
  const [beganReadingDate, setBeganReadingDate] = useState("");
  const [finishedReadingDate, setFinishedReadingDate] = useState("");
  const [currentlyReadingPopup, setCurrentlyReadingPopup] = useState(false);
  const [finishedPopup, setFinishedPopup] = useState(false);
  const [updateBookStatus, setUpdateBookStatus] = useState(false);

  const beganReadingDatetime = new Date(beganReadingDate);
  const finishedReadingDatetime = new Date(finishedReadingDate);
  const beganReadingError =
    beganReadingDatetime > today || (finishedPopup && beganReadingDatetime > finishedReadingDatetime) ? "Please enter a valid date" : "";
  const finishedReadingError =
    finishedReadingDatetime > today || (finishedPopup && beganReadingDatetime > finishedReadingDatetime) ? "Please enter a valid date" : "";

  // fetch/init book records
  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await getUserBookAPI(user.userInfo._id, OL_key);
        if (response.data) {
          setCurrentUserBook({ ...response.data, subjects: filterSubjectsFromOL(response.data.subjects) });
          setBeganReadingDate(response.data.beganReadingTime?.split("T")[0]);
          setFinishedReadingDate(response.data.finishedReadingTime?.split("T")[0]);
        } else {
          setCurrentUserBook({
            OL_key,
            user_id: user.userInfo._id,
            coverURL,
            title,
            author,
            pages,
            subjects: filterSubjectsFromOL(subjects),
          });
        }
      } catch (error) {
        console.log(error);
        toast({
          title: "Something went wrong, please try again later",
          status: "error",
          position: "top",
          duration: 3000,
        });
      }
    };
    if (user) {
      fetchBook();
    } else {
      setCurrentUserBook({});
    }
  }, [OL_key, author, coverURL, pages, subjects, title, toast, user]);

  // update book status
  const handleStatusChange = async (newStatus) => {
    if (currentUserBook.readingStatus === newStatus) {
      setCurrentlyReadingPopup(false);
      setFinishedPopup(false);
      setCurrentUserBook({ ...currentUserBook, readingStatus: null });
      await deleteUserBookAPI(user.userInfo._id, OL_key);
      toast({
        title: `Removed ${title.length > 17 ? title.substring(0, 17) + "... " : title} from your shelf`,
        status: "info",
        position: "top",
        duration: 7000,
      });
    } else {
      if (newStatus === READ_LATER) {
        setCurrentlyReadingPopup(false);
        setFinishedPopup(false);
        setCurrentUserBook({ ...currentUserBook, readingStatus: newStatus, beganReadingTime: null, finishedReadingTime: null });
        setUpdateBookStatus(true);
      } else if (newStatus === CURRENTLY_READING) {
        setCurrentlyReadingPopup(true);
        setFinishedPopup(false);
      } else {
        setFinishedPopup(true);
        setCurrentlyReadingPopup(false);
      }
    }
  };
  useEffect(() => {
    const updateBook = async () => {
      await putUserBookAPI(user.userInfo._id, OL_key, currentUserBook);
      setUpdateBookStatus(false);
      toast({
        title: `Set ${title.length > 17 ? title.substring(0, 17) + "... " : title} to ${currentUserBook.readingStatus}`,
        description:
          currentUserBook.readingStatus === READ_LATER
            ? "(Make sure to read it, OK?)"
            : currentUserBook.readingStatus === CURRENTLY_READING
            ? "Enjoy!"
            : "Hope you liked it!",
        status: "success",
        position: "top",
        duration: 7000,
      });
      dispatch(setFetchBooks(OL_key));
    };
    if (user && currentUserBook.readingStatus && updateBookStatus) {
      updateBook();
    }
  }, [OL_key, user, dispatch, currentUserBook, toast, updateBookStatus, title]);

  return (
    <Menu gutter='0' closeOnSelect={false}>
      <MenuButton
        as={Button}
        colorScheme={currentUserBook?.readingStatus ? "yellow" : "green"}
        rightIcon={<AiFillCaretDown />}
        onClick={() => dispatch(handleUnauthorizedAction(history))}
      >
        {currentUserBook?.readingStatus ? "Change status" : "Add to shelf"}
      </MenuButton>
      <MenuList>
        <MenuItem
          onClick={() => handleStatusChange(READ_LATER)}
          icon={
            <Icon
              color={currentUserBook?.readingStatus === READ_LATER ? "orangeDim" : "inherit"}
              fontSize='26px'
              as={currentUserBook?.readingStatus === READ_LATER ? BsBookmarkPlusFill : BsBookmarkPlus}
            />
          }
        >
          <Text>{READ_LATER}</Text>
        </MenuItem>
        <MenuItem
          onClick={() => handleStatusChange(CURRENTLY_READING)}
          icon={
            <Icon
              color={currentUserBook?.readingStatus === CURRENTLY_READING || currentlyReadingPopup ? "orangeDim" : "inherit"}
              fontSize='26px'
              as={currentUserBook?.readingStatus === CURRENTLY_READING ? BsBookmarkStarFill : BsBookmarkStar}
            />
          }
        >
          <Text>{CURRENTLY_READING}</Text>
        </MenuItem>
        {currentlyReadingPopup ? (
          <Flex pb='5px' px='20px'>
            <form
              onSubmit={() => {
                setCurrentlyReadingPopup(false);
                setCurrentUserBook({
                  ...currentUserBook,
                  readingStatus: CURRENTLY_READING,
                  beganReadingTime: beganReadingDate,
                  finishedReadingTime: null,
                });
                setUpdateBookStatus(true);
              }}
            >
              <FormControl isRequired isInvalid={beganReadingError}>
                <FormLabel requiredIndicator>Start date</FormLabel>
                <Input type='date' value={beganReadingDate} onChange={(e) => setBeganReadingDate(e.target.value)} />
                <FormErrorMessage>{beganReadingError}</FormErrorMessage>
              </FormControl>
              <ButtonGroup mt='20px' spacing='7px'>
                <Button type='submit' colorScheme='orange' disabled={beganReadingError}>
                  {currentUserBook?.readingStatus ? "Update" : "Submit"}
                </Button>
                <Button onClick={() => setCurrentlyReadingPopup(false)}>Cancel</Button>
              </ButtonGroup>
            </form>
          </Flex>
        ) : null}
        <MenuItem
          onClick={() => handleStatusChange(FINISHED)}
          icon={
            <Icon
              color={currentUserBook?.readingStatus === FINISHED || finishedPopup ? "orangeDim" : "inherit"}
              fontSize='26px'
              as={currentUserBook?.readingStatus === FINISHED ? BsBookmarkCheckFill : BsBookmarkCheck}
            />
          }
        >
          <Text>{FINISHED}</Text>
        </MenuItem>
        {finishedPopup ? (
          <Flex pb='5px' px='20px'>
            <form
              onSubmit={() => {
                setFinishedPopup(false);
                setCurrentUserBook({
                  ...currentUserBook,
                  readingStatus: FINISHED,
                  beganReadingTime: beganReadingDate,
                  finishedReadingTime: finishedReadingDate,
                });
                setUpdateBookStatus(true);
              }}
            >
              <FormControl isRequired isInvalid={beganReadingError}>
                <FormLabel requiredIndicator>Start date</FormLabel>
                <Input type='date' value={beganReadingDate} onChange={(e) => setBeganReadingDate(e.target.value)} />
                <FormErrorMessage>{beganReadingError}</FormErrorMessage>
              </FormControl>
              <FormControl isRequired mt='15px' isInvalid={finishedReadingError}>
                <FormLabel requiredIndicator>Finished date</FormLabel>
                <Input type='date' value={finishedReadingDate} onChange={(e) => setFinishedReadingDate(e.target.value)} />
                <FormErrorMessage>{finishedReadingError}</FormErrorMessage>
              </FormControl>
              <ButtonGroup mt='20px' spacing='7px'>
                <Button type='submit' colorScheme='orange' disabled={beganReadingError || finishedReadingError}>
                  {currentUserBook?.readingStatus ? "Update" : "Submit"}
                </Button>
                <Button onClick={() => setFinishedPopup(false)}>Cancel</Button>
              </ButtonGroup>
            </form>
          </Flex>
        ) : null}
      </MenuList>
    </Menu>
  );
};

export default BookStatusChanger;
