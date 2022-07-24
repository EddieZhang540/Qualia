import React from "react";
import { Image, Text, Flex, VStack, Wrap, WrapItem } from "@chakra-ui/react";
import BookStatusChanger from "./BookStatusChanger";

const PublicationCard = ({ OL_key, coverURL, title, author, pages, subjects }) => {
  return (
    <Flex my='12px'>
      <Wrap spacing='10px'>
        <WrapItem>
          <Image src={coverURL} minW='110px' maxW='110px' h='160px' />
          <VStack spacing='0px' pt={[0, null, null, "10px"]} px='20px'>
            <Text isTruncated minW={["3xs", null, null, "md"]} maxW={["3xs", null, null, "md"]} fontSize='lg' fontWeight='bold' py='4px'>
              {title}
            </Text>
            <Text isTruncated minW={["3xs", null, null, "md"]} maxW={["3xs", null, null, "md"]}>
              By {author}
            </Text>
          </VStack>
        </WrapItem>
        <WrapItem>
          <Flex h='100%' align='center'>
            <BookStatusChanger OL_key={OL_key} coverURL={coverURL} title={title} author={author} pages={pages} subjects={subjects} />
          </Flex>
        </WrapItem>
      </Wrap>
    </Flex>
  );
};

export default PublicationCard;
