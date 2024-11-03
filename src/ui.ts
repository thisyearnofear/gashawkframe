import { colors, createSystem } from "frog/ui";

export const { Box, Heading, Text, VStack, vars } = createSystem({
  colors: {
    ...colors.dark,
    background: "#1a1a1a",
    text100: "#ffffff",
    text200: "#a0a0a0",
    red500: "#ef4444",
    green500: "#22c55e",
  },
  fonts: {
    default: [
      {
        name: "Inter",
        source: "google",
        weight: 400,
      },
      {
        name: "Inter",
        source: "google",
        weight: 600,
      },
    ],
  },
  fontSizes: {
    "16": 16,
    "20": 20,
    "24": 24,
    "32": 32,
    "48": 48,
  },
  units: {
    "0": 0,
    "2": 2,
    "4": 4,
    "8": 8,
    "12": 12,
    "16": 16,
    "20": 20,
    "24": 24,
    "32": 32,
    "40": 40,
    "48": 48,
  },
});
