import React from "react";
import { Link as routerLink } from "react-router-dom";
import { Flex, Link, Text, Icon, Center } from "@chakra-ui/react";

const NavItem = ({ label, path = "/browse", icon, tab }) => {
  return (
    <Link as={routerLink} to={path} w='100%' color='gray.300' role='group' _hover={{ textDecoration: "none" }} _focus={{ outline: "none" }}>
      <Flex>
        <Center>
          <Icon
            as={icon}
            transition='color 0.1s'
            _groupHover={{ color: "orangeMain" }}
            _groupActive={{ color: "orangeDim" }}
            color={tab === label ? "orangeMain" : "inherit"}
            fontSize='3xl'
            mr='12px'
          />
        </Center>
        <Text
          transition='color 0.1s'
          _groupHover={{ color: "gray.50" }}
          _groupActive={{ color: "gray.50" }}
          color={tab === label ? "white" : "inherit"}
          fontSize='lg'
        >
          {label}
        </Text>
      </Flex>
    </Link>
  );
};

export default NavItem;
