import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Heading,
  Button,
  ButtonGroup,
  Stack,
  Text,
  FormControl,
  FormLabel,
  InputGroup,
  Input,
  InputRightElement,
  Link,
  Icon,
  StackDivider,
  Modal,
  useDisclosure,
  ModalOverlay,
  ModalContent,
  FormErrorMessage,
} from "@chakra-ui/react";
import { GrFormView, GrFormViewHide } from "react-icons/gr";
import { logInAPI, signUpAPI } from "../api/index";
import { useDispatch, useSelector } from "react-redux";
import { newSession, selectAuthVisibility, setAuthPopUp } from "../features/user/userSlice";

const AuthButtons = () => {
  const { isOpen: isSignUpOpen, onOpen: onSignUpOpen, onClose: onSignUpClose } = useDisclosure();
  const { isOpen: isLogInOpen, onOpen: onLogInOpen, onClose: onLogInClose } = useDisclosure();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const authVisibility = useSelector(selectAuthVisibility);

  useEffect(() => {
    if (authVisibility) {
      onLogInOpen();
      dispatch(setAuthPopUp(false));
    }
  }, [authVisibility, dispatch, onLogInOpen]);

  const {
    register: registerSignUpField,
    handleSubmit: handleSignUpSubmit,
    setError: setSignUpError,
    formState: { errors: errorsSignUp },
  } = useForm();
  const {
    register: registerLogInField,
    handleSubmit: handleLogInSubmit,
    setError: setLogInError,
    formState: { errors: errorsLogIn },
  } = useForm();

  const handleSignUp = async (e) => {
    try {
      setLoading(true);
      const response = await signUpAPI(e);
      setLoading(false);
      dispatch(newSession(response.data));
      onSignUpClose();
    } catch (error) {
      setLoading(false);
      const errorStatus = error.response.status;
      if (errorStatus % 100 === 5) {
        setSignUpError("userName", { message: "Something went wrong on our end, please try again later" });
      } else if (errorStatus === 400) {
        setSignUpError("email", { message: "An account with this email already exists, log in?" });
      } else {
        console.log(error);
      }
    }
  };
  const handleLogIn = async (e) => {
    try {
      setLoading(true);
      const response = await logInAPI(e);
      setLoading(false);
      dispatch(newSession(response.data));
      onLogInClose();
    } catch (error) {
      setLoading(false);
      const errorStatus = error.response.status;
      if (errorStatus % 100 === 5) {
        setLogInError("email", { message: "Something went wrong on our end, please try again later" });
      } else if (errorStatus === 401) {
        setLogInError("password", { message: "Incorrect password" });
      } else if (errorStatus === 404) {
        setLogInError("email", { message: "This account does not exist, please sign up first" });
      } else {
        console.log(error);
      }
    }
  };

  return (
    <ButtonGroup spacing='0px'>
      <Button onClick={onLogInOpen} fontSize='xl' size='lg' variant='ghost' colorScheme='gray' _focus={{ outline: "none" }}>
        Log in
      </Button>
      <Button onClick={onSignUpOpen} fontSize='xl' size='lg' variant='ghost' colorScheme='orange' _focus={{ outline: "none" }}>
        Sign up
      </Button>
      {/* Sign up modal */}
      <Modal isOpen={isSignUpOpen} onClose={onSignUpClose}>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSignUpSubmit(handleSignUp)}>
            <Stack spacing={4} p={8}>
              <Heading textAlign={"center"}>Sign up</Heading>
              <StackDivider />
              <FormControl id='userName' isRequired isInvalid={errorsSignUp.userName}>
                <FormLabel>User name</FormLabel>
                <Input {...registerSignUpField("userName", { required: "Please enter a user name" })} />
                <FormErrorMessage>{errorsSignUp.userName ? errorsSignUp.userName.message : null}</FormErrorMessage>
              </FormControl>
              <FormControl id='email' isRequired isInvalid={errorsSignUp.email}>
                <FormLabel>Email</FormLabel>
                <Input type='email' {...registerSignUpField("email", { required: "Please enter an email" })} />
                <FormErrorMessage>{errorsSignUp.email ? errorsSignUp.email.message : null}</FormErrorMessage>
              </FormControl>
              <FormControl id='password' isRequired isInvalid={errorsSignUp.password}>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input type={showPassword ? "text" : "password"} {...registerSignUpField("password", { required: "Please enter a password" })} />
                  <InputRightElement h={"full"}>
                    <Button variant={"ghost"} onClick={() => setShowPassword((showPassword) => !showPassword)}>
                      {showPassword ? <Icon fontSize='25px' as={GrFormView} /> : <Icon fontSize='25px' as={GrFormViewHide} />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{errorsSignUp.password ? errorsSignUp.password.message : null}</FormErrorMessage>
              </FormControl>
              <StackDivider />
              <Button isLoading={loading} type='submit' size='lg' colorScheme='orange'>
                Sign up
              </Button>
              <Text align={"center"}>
                Already have an account?{" "}
                <Link
                  onClick={() => {
                    onSignUpClose();
                    onLogInOpen();
                  }}
                  color={"orangeDim"}
                >
                  Log in
                </Link>
              </Text>
            </Stack>
          </form>
        </ModalContent>
      </Modal>
      {/* Log in modal */}
      <Modal isOpen={isLogInOpen} onClose={onLogInClose}>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleLogInSubmit(handleLogIn)}>
            <Stack spacing={4} p={8}>
              <Heading textAlign={"center"}>Log in</Heading>
              <StackDivider />
              <FormControl id='email' isInvalid={errorsLogIn.email}>
                <FormLabel>Email</FormLabel>
                <Input type='email' {...registerLogInField("email", { required: "Please enter your email" })} />
                <FormErrorMessage>{errorsLogIn.email ? errorsLogIn.email.message : null}</FormErrorMessage>
              </FormControl>
              <FormControl id='password' isInvalid={errorsLogIn.password}>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input type={showPassword ? "text" : "password"} {...registerLogInField("password", { required: "Please enter your password" })} />
                  <InputRightElement h={"full"}>
                    <Button variant={"ghost"} onClick={() => setShowPassword((showPassword) => !showPassword)}>
                      {showPassword ? <Icon fontSize='25px' as={GrFormView} /> : <Icon fontSize='25px' as={GrFormViewHide} />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{errorsLogIn.password ? errorsLogIn.password.message : null}</FormErrorMessage>
              </FormControl>
              <StackDivider />
              <Button isLoading={loading} type='submit' size='lg' colorScheme='orange'>
                Log in
              </Button>
              <Text align={"center"}>
                Don't have an account?{" "}
                <Link
                  onClick={() => {
                    onLogInClose();
                    onSignUpOpen();
                  }}
                  color={"orangeDim"}
                >
                  Sign up
                </Link>
              </Text>
            </Stack>
          </form>
        </ModalContent>
      </Modal>
    </ButtonGroup>
  );
};

export default AuthButtons;
