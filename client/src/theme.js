import { extendTheme } from "@chakra-ui/react";

// Chakra theme extension
export const theme = extendTheme({
  colors: {
    jet: "#393743",
    backdrop: "#FCF8F4",
    logoPurple: "#6c5c94",
    orangeMain: "#E7B894",
    orangeDim: "#BC8962",
    orangeDark: "#BA7B4A",
    highlightCyan: "#00A6A6",
    gray: {
      50: "#F3F2F2",
      100: "#DDDBDA",
      200: "#C7C4C2",
      300: "#B1ADAA",
      400: "#9A9692",
      500: "#84807B",
      600: "#6A6662",
      700: "#4F4D4A",
      800: "#353331",
      900: "#1A1A19",
    },
    orange: {
      50: "#fbe2cf",
      100: "#fadbc3",
      200: "#f9d4b7",
      300: "#f7c59f",
      400: "#f6be93",
      500: "#dda57a",
      600: "#c4926c",
      700: "#ac805f",
      800: "#936e51",
      900: "#7b5c44",
    },
    green: {
      50: "#EDF7F4",
      100: "#CEE9E0",
      200: "#AEDACB",
      300: "#8FCCB7",
      400: "#6FBEA3",
      500: "#50AF8F",
      600: "#408C72",
      700: "#306956",
      800: "#204639",
      900: "#10231D",
    },
    blue: {
      50: "#EBF1FA",
      100: "#C6D8F0",
      200: "#A2BEE7",
      300: "#7EA5DD",
      400: "#598CD4",
      500: "#3573CA",
      600: "#2A5CA2",
      700: "#204579",
      800: "#152E51",
      900: "#0B1728",
    },
  },
  styles: {
    global: {
      "html, body": {
        fontSize: "17px",
      },
    },
  },
});
