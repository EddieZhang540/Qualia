import axios from "axios";
import React, { useState, useEffect } from "react";
import {
  READ_LATER,
  CURRENTLY_READING,
  FINISHED,
  SUGGEST_BY_AUTHOR,
  SUGGEST_BY_GENRE,
  suggestionSubjectDefaultFilter,
  suggestionAuthorDefaultFilter,
} from "../utils/shelfConstants";
import {
  Flex,
  Spinner,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  ButtonGroup,
  Button,
  Link,
  RadioGroup,
  Radio,
  Text,
  Wrap,
  WrapItem,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
} from "@chakra-ui/react";
import Select from "react-select";
import "../scroll.css";
import { FiSearch } from "react-icons/fi";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "../features/user/userSlice";
import { flushUserBooks, selectFetchBooks } from "../features/userBook/userBookSlice";
import { searchUserBooksAPI, getUserStatsAPI } from "../api/index";
import qs from "qs";
import { useHistory } from "react-router-dom";
import UserBookCard from "./UserBookCard";
import { filterSubjectsOnSearch } from "../utils/filterSubjects";

const Shelf = () => {
  const sortOptions = [
    { value: "title", label: "Title" },
    { value: "author", label: "Author" },
    { value: "beganReadingTime", label: "Date began reading" },
    { value: "finishedReadingTime", label: "Date finished reading" },
  ];
  const user = useSelector(selectUser);
  const history = useHistory();
  const dispatch = useDispatch();
  const newBookOLKey = useSelector(selectFetchBooks);
  const toast = useToast();

  const [query, setQuery] = useState("");
  const [searchForStatus, setSearchForStatus] = useState([{ readingStatus: READ_LATER }, { readingStatus: CURRENTLY_READING }, { readingStatus: FINISHED }]);
  const [sortBy, setSortBy] = useState({ title: "asc" });
  const [submitSearch, setSubmitSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userBookResults, setUserBookResults] = useState();
  const [sortedBooks, setSortedBooks] = useState([[], [], []]);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);

  // search
  useEffect(() => {
    const getAllBooks = async () => {
      if (submitSearch && !loading) {
        setSubmitSearch(false);
        setLoading(true);
        let parsedUserBookResults = [[], [], []];
        try {
          const searchRequest = qs.stringify({ q: query, status: searchForStatus, sort: sortBy });
          const response = await searchUserBooksAPI(user.userInfo._id, searchRequest);
          for (const book of response.data) {
            if (!book.confidenceScore || book.confidenceScore > 5.5) {
              const getStatusIndex = (e) => (e === READ_LATER ? 0 : e === CURRENTLY_READING ? 1 : 2);
              parsedUserBookResults[getStatusIndex(book.readingStatus)].push(<UserBookCard key={book._id} book={book} />);
            }
          }
          console.log(response);
        } catch (error) {
          console.log(error);
          toast({
            title: "Something went wrong, please try again later",
            status: "error",
            position: "top",
            duration: 3000,
          });
        }
        setLoading(false);
        if (parsedUserBookResults[0].length || parsedUserBookResults[1].length || parsedUserBookResults[2].length) {
          setUserBookResults(null);
          setSortedBooks(parsedUserBookResults);
        } else if (!(searchForStatus[0].readingStatus || searchForStatus[1].readingStatus || searchForStatus[2].readingStatus)) {
          setSortedBooks([[], [], []]);
          setUserBookResults(<Flex py='8px' key='-1'>{`Choose a category to begin browsing your personal shelf`}</Flex>);
        } else if (!query) {
          setSortedBooks([[], [], []]);
          setUserBookResults(
            <Flex py='8px' key='-1'>
              Nothing on this shelf yet! Look for a book in&nbsp;
              <Link
                onClick={() => {
                  history.push("/Browse");
                }}
                color={"orangeDim"}
              >
                Browse
              </Link>
              ?
            </Flex>
          );
        } else {
          setSortedBooks([[], [], []]);
          setUserBookResults(<Flex py='8px' key='-1'>{`No results related to "${query}" found`}</Flex>);
        }
      }
    };
    getAllBooks();
  }, [user, submitSearch, loading, query, searchForStatus, sortBy, history, toast]);

  const getRecommendation = async (suggestMode) => {
    if (!recommendationsLoading) {
      setRecommendationsLoading(true);
      try {
        let books;
        const { data: responseUserData } = await getUserStatsAPI(user.userInfo._id);
        if (suggestMode === SUGGEST_BY_GENRE) {
          let subjectFilter = suggestionSubjectDefaultFilter;
          const latestMonth = responseUserData.monthlyPages.length;
          if (latestMonth > 0) {
            const subjectsSearchList = filterSubjectsOnSearch(
              responseUserData.monthlySubjectDistributionCumulative[latestMonth - 1].distribution.map((d) => d.subject)
            );
            subjectFilter += `${subjectsSearchList.slice(0, 1).map((s) => ` AND "${s}"`)}`;
            subjectFilter += ` AND (${subjectsSearchList
              .slice(1, 3)
              .map((s) => `"${s}"`)
              .join(" OR ")})`;
            console.log(subjectFilter);
          }
          books = await axios.get(`https://openlibrary.org/search.json?q=subject:(${subjectFilter})&page=1`);
        } else if (suggestMode === SUGGEST_BY_AUTHOR) {
          let authorFilter = suggestionAuthorDefaultFilter;
          const numAuthors = responseUserData.authorDistribution.length;
          if (numAuthors > 0) {
            const authorSearchList = responseUserData.authorDistribution.slice(0, 2);
            authorFilter = authorSearchList.map((d) => `"${d.author}"`).join(" OR ");
          }
          books = await axios.get(`https://openlibrary.org/search.json?q=author:(${authorFilter})&page=1`);
        }
        if (books) {
          const docs = books.data?.docs;
          const publicationsSearchResult = [];
          const searchRequest = qs.stringify({
            q: "",
            status: [{ readingStatus: READ_LATER }, { readingStatus: CURRENTLY_READING }, { readingStatus: FINISHED }],
            sort: { title: "asc" },
          });
          const { data: responseBookData } = await searchUserBooksAPI(user.userInfo._id, searchRequest);
          let bookCount = 0;
          for (const book of docs) {
            const bookAlreadyAdded = responseBookData.find((b) => b.OL_key === book.key.split("/")[2] || b.title === book.title);
            const bookAlreadyRecommended = recommendations.find((b) => b.OL_key === book.key.split("/")[2] || b.title === book.title);
            if (
              book.author_name &&
              book.cover_i &&
              book.subject &&
              !book.title?.includes("/") &&
              (book.id_goodreads || book.id_amazon || book.isbn?.length > 10) &&
              !bookAlreadyAdded &&
              !bookAlreadyRecommended
            ) {
              console.log(book);
              publicationsSearchResult.push({
                key: book.key,
                OL_key: book.key.split("/")[2],
                coverURL: `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`,
                title: book.title,
                author: book.author_name[0],
                pages: book.number_of_pages_median,
                subjects: book.subject?.slice(0, 50),
                isRecommendation: true,
              });
              bookCount++;
            }
            if (bookCount > 7) break;
          }
          setRecommendations(publicationsSearchResult);
        } else setRecommendations([]);
      } catch (error) {
        console.log(error);
        toast({
          title: "Something went wrong, please try again later",
          status: "error",
          position: "top",
          duration: 3000,
        });
      }
      setRecommendationsLoading(false);
    }
  };

  // init/on change to searchForStatus/sortBy/status
  useEffect(() => {
    setSubmitSearch(true);
  }, [searchForStatus, sortBy]);
  useEffect(() => {
    if (newBookOLKey) {
      setSubmitSearch(true);
      setRecommendations(recommendations.filter((b) => b.OL_key !== newBookOLKey)); // remove newly added book from recommendations list
      dispatch(flushUserBooks());
    }
  }, [dispatch, newBookOLKey, recommendations]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setUserBookResults();
    setSortedBooks([[], [], []]);
    setSubmitSearch(true);
  };

  return (
    <Flex w='100%' h='100%' direction='column'>
      <form onSubmit={handleSearch}>
        <InputGroup mr='10px'>
          <InputRightElement
            children={<IconButton _focus={{ outline: "none" }} borderRadius='20' variant='ghost' onClick={() => handleSearch()} icon={<FiSearch />} />}
          />
          <Input
            _focus={{ outline: "none", boxShadow: "md" }}
            placeholder='Search by title, author, or subjects...'
            onChange={(e) => {
              setQuery(e.target.value);
            }}
          />
        </InputGroup>
      </form>

      <Flex justify='space-between'>
        <ButtonGroup my='10px' colorScheme='orange' size='sm' spacing='10px'>
          <Button
            borderRadius='20px'
            variant={searchForStatus[0].readingStatus ? "solid" : "outline"}
            onClick={() => {
              setSearchForStatus(
                searchForStatus[0].readingStatus
                  ? [{ readingStatus: "" }, ...searchForStatus.slice(1, 3)]
                  : [{ readingStatus: READ_LATER }, ...searchForStatus.slice(1, 3)]
              );
            }}
          >
            {READ_LATER}
          </Button>
          <Button
            borderRadius='20px'
            variant={searchForStatus[1].readingStatus ? "solid" : "outline"}
            onClick={() => {
              setSearchForStatus(
                searchForStatus[1].readingStatus
                  ? [searchForStatus[0], { readingStatus: "" }, searchForStatus[2]]
                  : [searchForStatus[0], { readingStatus: CURRENTLY_READING }, searchForStatus[2]]
              );
            }}
          >
            {CURRENTLY_READING}
          </Button>
          <Button
            borderRadius='20px'
            variant={searchForStatus[2].readingStatus ? "solid" : "outline"}
            onClick={() => {
              setSearchForStatus(
                searchForStatus[2].readingStatus
                  ? [...searchForStatus.slice(0, 2), { readingStatus: "" }]
                  : [...searchForStatus.slice(0, 2), { readingStatus: FINISHED }]
              );
            }}
          >
            {FINISHED}
          </Button>
        </ButtonGroup>

        {sortedBooks[0].length || sortedBooks[1].length || sortedBooks[2].length ? (
          <Flex align='center'>
            <Text fontWeight='bold' mr='5px'>
              Sort by
            </Text>

            <Select
              styles={{
                menu: (base) => ({
                  ...base,
                  width: "max-content",
                  minWidth: "100%",
                }),
              }}
              theme={(theme) => ({
                ...theme,
                colors: {
                  ...theme.colors,
                  primary25: "#FFC498",
                  primary50: "#D77A33",
                  primary75: "#D77A33",
                  primary: "#D77A33",
                },
              })}
              value={{ value: Object.keys(sortBy)[0], label: sortOptions.filter((e) => e.value === Object.keys(sortBy)[0])[0].label }}
              onChange={(e) => {
                setSortBy({ [e.value]: Object.values(sortBy)[0] });
              }}
              options={sortOptions}
            />

            <Text fontWeight='bold' mx='10px'>
              Ordered by
            </Text>
            <RadioGroup
              colorScheme='orange'
              value={Object.values(sortBy)[0]}
              onChange={(e) => {
                setSortBy({ [Object.keys(sortBy)[0]]: e });
              }}
            >
              <Radio value='asc' mr='10px'>
                Ascending
              </Radio>
              <Radio value='desc'>Descending</Radio>
            </RadioGroup>
          </Flex>
        ) : null}
      </Flex>

      <Flex
        h='100%'
        overflowY='scroll'
        overflowX='hidden'
        align='center'
        flexDir='column'
        pt='10px'
        className={!(sortedBooks[0].length || sortedBooks[1].length || sortedBooks[2].length) ? "hideScroll" : null}
      >
        {userBookResults ? (
          userBookResults
        ) : (
          <Accordion defaultIndex={[0, 1, 2]} allowMultiple w='97%'>
            {(sortedBooks[0].length || sortedBooks[2].length) &&
            searchForStatus[0].readingStatus &&
            Object.keys(sortBy)[0] !== "beganReadingTime" &&
            Object.keys(sortBy)[0] !== "finishedReadingTime" ? (
              <AccordionItem>
                <AccordionButton _focus={{ outline: "none" }}>
                  <Flex textAlign='left'>{READ_LATER}</Flex>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb='20px'>
                  <Wrap>
                    {sortedBooks[0]}
                    {recommendations.map((b) => (
                      <UserBookCard key={b.key} book={b}></UserBookCard>
                    ))}
                    {sortedBooks[2].length ? (
                      <WrapItem pl='5px' pr='25px' py='20px'>
                        <Flex flexDir='column' align='center' minW='220px' maxW='220px'>
                          <Menu>
                            <MenuButton
                              as={Button}
                              minW='180px'
                              maxW='180px'
                              h='260px'
                              outline='2px dashed'
                              outlineColor='orange.500'
                              colorScheme='orange'
                              borderRadius='10px'
                              whiteSpace='normal'
                              fontSize='lg'
                              bgColor='inherit'
                              textColor='orange.500'
                              _hover={{ bgColor: "orange.500", textColor: "white" }}
                              _active={{ bgColor: "orange.600", textColor: "white" }}
                              disabled={recommendationsLoading}
                            >
                              <Flex flexDir='column' align='center'>
                                {recommendationsLoading ? <Spinner size='xl' mb='20px' /> : <Icon as={AiOutlinePlusCircle} fontSize='50px' mb='20px' />}
                                {recommendationsLoading
                                  ? "Fetching recommendations for you..."
                                  : recommendations.length
                                  ? "Get some more recommendations!"
                                  : "Get some recommendations!"}
                              </Flex>
                            </MenuButton>
                            <MenuList>
                              <MenuItem
                                onClick={async () => {
                                  await getRecommendation(SUGGEST_BY_AUTHOR);
                                }}
                                icon={<Icon color='orange.700' fontSize='23px' mr='-5px' as={FiSearch} />}
                              >
                                by your frequently read authors
                              </MenuItem>
                              <MenuItem
                                onClick={async () => {
                                  await getRecommendation(SUGGEST_BY_GENRE);
                                }}
                                icon={<Icon color='orange.700' fontSize='23px' mr='-5px' as={FiSearch} />}
                              >
                                by your frequently read genres
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        </Flex>
                      </WrapItem>
                    ) : null}
                  </Wrap>
                </AccordionPanel>
              </AccordionItem>
            ) : null}

            {sortedBooks[1].length && Object.keys(sortBy)[0] !== "finishedReadingTime" ? (
              <AccordionItem>
                <AccordionButton _focus={{ outline: "none" }}>
                  <Flex textAlign='left'>{CURRENTLY_READING}</Flex>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb='20px'>
                  <Wrap>{sortedBooks[1]}</Wrap>
                </AccordionPanel>
              </AccordionItem>
            ) : null}

            {sortedBooks[2].length ? (
              <AccordionItem>
                <AccordionButton _focus={{ outline: "none" }}>
                  <Flex textAlign='left'>{FINISHED}</Flex>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb='20px'>
                  <Wrap>{sortedBooks[2]}</Wrap>
                </AccordionPanel>
              </AccordionItem>
            ) : null}
          </Accordion>
        )}
        <Flex py='6px'>{loading ? <Spinner size='xl' /> : null}</Flex>
      </Flex>
    </Flex>
  );
};

export default Shelf;
