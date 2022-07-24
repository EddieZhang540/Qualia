import axios from "axios";
import "../scroll.css";
import React, { useState, useEffect } from "react";
import PublicationCard from "./PublicationCard";
import { Spinner, IconButton, Input, InputGroup, InputRightElement, StackDivider, VStack, Flex, useToast } from "@chakra-ui/react";
import { FiSearch } from "react-icons/fi";

const PublicationsBrowser = () => {
  const toast = useToast();
  const [publicationsList, setPublicationsList] = useState([]);
  const [searchPageNumber, setSearchPageNumber] = useState(1);
  const [searchQuery, setSearchQuery] = useState();
  const [submitSearch, setSubmitSearch] = useState(false);
  const [loading, setLoading] = useState(false);

  const searchPublications = async () => {
    if (searchPageNumber > 0 && searchQuery && !loading) {
      if (searchPageNumber < 15) {
        setLoading(true);
        try {
          const books = await axios.get(`https://openlibrary.org/search.json?q=${searchQuery}&page=${searchPageNumber}`);
          const docs = books.data.docs;
          const publicationsSearchResult = [];
          for (const book of docs) {
            if (
              book.author_name &&
              book.cover_i &&
              book.subject &&
              !book.title.includes("/") &&
              (book.id_goodreads || book.id_amazon || book.isbn?.length > 10)
            ) {
              publicationsSearchResult.push(
                <PublicationCard
                  key={book.key}
                  OL_key={book.key.split("/")[2]}
                  coverURL={`https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`}
                  title={book.title}
                  author={book.author_name[0]}
                  pages={book.number_of_pages_median}
                  subjects={book.subject?.slice(0, 50)}
                />
              );
            }
          }
          if (publicationsSearchResult.length > 0) {
            // more results found
            setPublicationsList([...publicationsList, ...publicationsSearchResult]);
            setSearchPageNumber(searchPageNumber + 1);
          } else if (searchPageNumber === 1) {
            // page 1 is empty - no results
            setPublicationsList(<Flex py='8px' key='-1'>{`No results related to "${searchQuery}" found`}</Flex>);
            setSearchPageNumber(-1);
          } else if (docs.length > 0) {
            // page n is empty - load next page
            setSearchPageNumber(searchPageNumber + 1);
          } else {
            // page n is empty, reached final page
            setPublicationsList([...publicationsList, <Flex py='8px' key='-1'>{`No more results related to "${searchQuery}"`}</Flex>]);
            setSearchPageNumber(-1);
          }
        } catch (error) {
          toast({
            title: "Something went wrong, please try again later",
            status: "error",
            position: "top",
            duration: 3000,
          });
        }
        setLoading(false);
      } else {
        // reached cutoff
        setPublicationsList([...publicationsList, <Flex py='8px' key='-1'>{`No more results related to "${searchQuery}"`}</Flex>]);
        setSearchPageNumber(-1);
      }
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setPublicationsList([]);
    setSearchPageNumber(1);
    setSubmitSearch(!submitSearch);
  };

  const handleScroll = (e) => {
    if (e.target.scrollHeight - e.target.scrollTop >= e.target.clientHeight) {
      setSubmitSearch(!submitSearch);
    }
  };

  useEffect(() => {
    searchPublications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitSearch]);

  return (
    <Flex w='100%' h='100%' direction='column'>
      <form onSubmit={handleSearch}>
        <Flex>
          <InputGroup>
            <InputRightElement
              children={<IconButton _focus={{ outline: "none" }} borderRadius='20' variant='ghost' onClick={handleSearch} icon={<FiSearch />} />}
            />
            <Input
              _focus={{ outline: "none", boxShadow: "md" }}
              placeholder='Search by title, author, or subjects...'
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
            />
          </InputGroup>
        </Flex>
      </form>

      <VStack h='100%' overflowY='scroll' overflowX='hidden' onScroll={handleScroll} className={!publicationsList.length ? "hideScroll" : null}>
        <VStack divider={<StackDivider />}>{publicationsList}</VStack>
        <Flex py='6px'>{loading ? <Spinner size='xl' /> : null}</Flex>
      </VStack>
    </Flex>
  );
};

export default PublicationsBrowser;
