import React from "react";
import { Text, Flex, VStack, WrapItem, IconButton, Menu, MenuButton, MenuList, MenuItem, MenuDivider, MenuGroup } from "@chakra-ui/react";
import { RiMoreLine } from "react-icons/ri";

import BookStatusChanger from "./BookStatusChanger";

const UserBookCard = ({ book }) => {
  const { OL_key, coverURL, title, author, pages, subjects, isRecommendation, beganReadingTime, finishedReadingTime } = book;

  return (
    <WrapItem pl='5px' pr='27px' py='20px'>
      <Flex flexDir='column' align='center' role='group'>
        <Flex
          bgImage={`url(${coverURL})`}
          bgSize='100% 100%'
          opacity={isRecommendation ? "0.6" : "inherit"}
          minW='180px'
          maxW='180px'
          h='260px'
          borderRadius='5px'
        >
          {!isRecommendation ? (
            <Menu gutter='0' closeOnSelect={false} autoSelect={false}>
              {({ isOpen, onClose }) => (
                <>
                  <MenuButton
                    as={IconButton}
                    display='none'
                    m='10px'
                    ml='auto'
                    size='sm'
                    aria-label='Details'
                    borderRadius='25px'
                    icon={<RiMoreLine />}
                    _groupHover={{ display: "inherit" }}
                    _focus={{ outline: "none" }}
                  ></MenuButton>
                  <MenuList display='none' _groupHover={{ display: "inherit" }} onMouseLeave={() => onClose()} w='3xs'>
                    {beganReadingTime || finishedReadingTime ? (
                      <>
                        <MenuGroup title='Details'>
                          {beganReadingTime ? <MenuItem>{`You began reading on: ${beganReadingTime.split("T")[0].replace("-", ", ")}`} </MenuItem> : null}
                          {finishedReadingTime ? (
                            <MenuItem>{`You finished reading on: ${finishedReadingTime.split("T")[0].replace("-", ", ")}`}</MenuItem>
                          ) : null}
                        </MenuGroup>
                        <MenuDivider />
                      </>
                    ) : null}
                    <MenuGroup title='Number of pages (average)'>
                      <MenuItem>{pages}</MenuItem>
                    </MenuGroup>
                  </MenuList>
                </>
              )}
            </Menu>
          ) : null}
        </Flex>
        <VStack spacing='0' pt='20px' mb='10px'>
          <Text noOfLines={2} w='220px' align='center' fontWeight='bold'>
            {title}
          </Text>
          <Text isTruncated w='220px' align='center'>
            By {author}
          </Text>
          {isRecommendation ? (
            <Text fontSize='15px' textColor='gray.400'>
              Recommended for you
            </Text>
          ) : null}
        </VStack>
        <BookStatusChanger OL_key={OL_key} coverURL={coverURL} title={title} author={author} pages={pages} subjects={subjects} />
      </Flex>
    </WrapItem>
  );
};

export default UserBookCard;
