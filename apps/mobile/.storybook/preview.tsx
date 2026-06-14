import type { Preview } from "storybook/react";
import React from "react";
import { View } from "react-native-css/components";
import "../global.css";
import "./i18n";

const preview: Preview = {
  decorators: [
    (Story) => (
      <View style={{ padding: 16 }}>
        <Story />
      </View>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /date$/i,
      },
    },
    backgrounds: {
      values: [
        { name: "light", value: "#F9FAFB" },
        { name: "dark", value: "#111827" },
        { name: "white", value: "#FFFFFF" },
      ],
    },
  },
};

export default preview;
