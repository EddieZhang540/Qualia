import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { store } from "./app/store";
import { Provider } from "react-redux";
import { theme } from "./theme";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <ChakraProvider theme={theme}>
        <Provider store={store}>
          <App />
        </Provider>
      </ChakraProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);
