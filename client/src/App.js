import React, { useState, useEffect } from "react";
import { Switch, Route, Redirect, useLocation, useHistory } from "react-router-dom";
import decode from "jwt-decode";
import PillPity from "pill-pity";
import logo from "./logo.svg";
import { Flex, Heading, Divider, Spacer, Button, Text, Avatar, Center, Img, IconButton, SlideFade, Link, Icon } from "@chakra-ui/react";
import { RiSearchLine, RiBookLine, RiUserLine, RiLogoutBoxLine, RiMenuLine } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { selectUser, newSession, logOut, handleUnauthorizedAction } from "./features/user/userSlice";
import { pillPityPatterns } from "./utils/pillPityPatterns";

import PublicationsBrowser from "./components/PublicationsBrowser";
import Shelf from "./components/Shelf";
import NavItem from "./components/NavItem";
import AuthButtons from "./components/AuthButtons";
import Summary from "./components/Summary";

function App() {
  const history = useHistory();
  const dispatch = useDispatch();
  const userFromStore = useSelector(selectUser);
  const currentTab = useLocation().pathname;
  const currentTabName = currentTab.substring(1, 2).toUpperCase() + currentTab.substring(2);
  const userFromLocal = JSON.parse(localStorage.getItem("userProfile"));
  const [showSideBar, setShowSideBar] = useState(true);

  useEffect(() => {
    if (userFromLocal) {
      if (!userFromStore) {
        // Place token into store if user already logged in
        dispatch(newSession(userFromLocal));
      } else if (userFromLocal.token && decode(userFromLocal.token).exp * 1000 < new Date().getTime()) {
        // Log out if token expired
        dispatch(logOut());
        history.push("/browse");
      }
    }
  }, [dispatch, history, userFromLocal, userFromStore]);

  const handleLogOut = () => {
    dispatch(logOut());
    history.push("/browse");
  };

  return (
    <Flex overflow='hidden' bg='backdrop'>
      {/* Navbar */}
      {showSideBar ? (
        <SlideFade in={showSideBar} unmountOnExit>
          <Flex h='100vh' style={{ filter: "drop-shadow(5px 8px 5px rgba(0, 0, 0, 0.5))" }}>
            <PillPity
              pattern={pillPityPatterns[4]}
              as={Flex}
              h='98%'
              minW={["100vw", "310px"]}
              direction='column'
              alignItems='center'
              bgColor='jet'
              color='white'
              style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 95%, 0 100%)" }}
            >
              <Flex mt='5vh' mb='4vh' ml='-10%'>
                <Center>
                  <Img w='75px' h='75px' mr='10px' src={logo} />
                  <Heading size='xl'>Qualia</Heading>
                </Center>
              </Flex>
              <Divider />
              <Flex w='100%' h='70%' direction='column' mt='15px'>
                <Button variant='unstyled' ml='35px' mt='12px' _focus={{ outline: "none" }}>
                  <NavItem label='Browse' path='/browse' icon={RiSearchLine} tab={currentTabName} />
                </Button>
                <Button variant='unstyled' ml='35px' mt='12px' _focus={{ outline: "none" }} onClick={() => dispatch(handleUnauthorizedAction(history))}>
                  <NavItem label='Shelf' path='/shelf' icon={RiBookLine} tab={currentTabName} />
                </Button>
                <Button variant='unstyled' ml='35px' mt='12px' _focus={{ outline: "none" }} onClick={() => dispatch(handleUnauthorizedAction(history))}>
                  <NavItem label='Summary' path='/summary' icon={RiUserLine} tab={currentTabName} />
                </Button>
                <Button
                  variant='unstyled'
                  ml='35px'
                  mt='12px'
                  _focus={{ outline: "none" }}
                  visibility={["inherit", "inherit", "hidden"]}
                  icon={<RiMenuLine fontSize='20px' />}
                  onClick={() => setShowSideBar(false)}
                >
                  <Link w='100%' color='gray.300' role='group' _hover={{ textDecoration: "none" }} _focus={{ outline: "none" }}>
                    <Flex>
                      <Center>
                        <Icon
                          as={RiMenuLine}
                          transition='color 0.1s'
                          _groupHover={{ color: "orangeMain" }}
                          _groupActive={{ color: "orangeDim" }}
                          fontSize='3xl'
                          mr='12px'
                        />
                      </Center>
                      <Text transition='color 0.1s' _groupHover={{ color: "gray.50" }} _groupActive={{ color: "gray.50" }} fontSize='lg'>
                        Hide sidebar
                      </Text>
                    </Flex>
                  </Link>
                </Button>
                <Spacer />
                {userFromStore ? (
                  <SlideFade in={userFromStore} unmountOnExit>
                    <Button variant='unstyled' ml='35px' _focus={{ outline: "none" }} onClick={() => handleLogOut()}>
                      <NavItem label='Logout' icon={RiLogoutBoxLine} />
                    </Button>
                  </SlideFade>
                ) : null}
              </Flex>
            </PillPity>
          </Flex>
        </SlideFade>
      ) : null}

      {/* Right column */}
      <Flex w='100%' h='100vh' direction='column' px='60px' pt='35px'>
        {/* Header */}
        <Flex w='100%' h='10%' pb='20px' align='center'>
          <IconButton
            visibility={["inherit", "inherit", "hidden"]}
            mr={["10px", "10px", "-35px"]}
            icon={<RiMenuLine fontSize='20px' />}
            onClick={() => setShowSideBar(true)}
          />
          <Text fontSize='3xl' fontWeight='bold'>
            {currentTabName}
          </Text>
          <Spacer />
          {userFromStore ? (
            <SlideFade in={userFromStore} unmountOnExit>
              <Flex>
                <Center>
                  <Avatar name={userFromStore.userInfo.userName} />
                  <Text fontSize='xl' pl='12px' pr='20px'>
                    {userFromStore.userInfo.userName}
                  </Text>
                </Center>
              </Flex>
            </SlideFade>
          ) : (
            <AuthButtons />
          )}
        </Flex>
        {/* Content */}
        <Flex w='100%' h='90%' direction='column'>
          <Switch>
            <Route exact path='/'>
              <Redirect to='/browse' />
            </Route>
            <Route path='/browse'>
              <PublicationsBrowser />
            </Route>
            <Route path='/shelf'>{userFromStore ? <Shelf /> : null}</Route>
            <Route path='/summary'>{userFromStore ? <Summary /> : null}</Route>
          </Switch>
        </Flex>
      </Flex>
    </Flex>
  );
}

export default App;
