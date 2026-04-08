import type { Meta, StoryObj } from "storybook/react";
import { fn } from "storybook/test";
import { SearchBar } from "./SearchBar";

const meta: Meta<typeof SearchBar> = {
  title: "Components/SearchBar",
  component: SearchBar,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ width: 350 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof SearchBar>;

export const Empty: Story = {
  args: {
    value: "",
    onChangeText: fn(),
    placeholder: "Rechercher un invité...",
  },
};

export const WithValue: Story = {
  args: {
    value: "Marie",
    onChangeText: fn(),
    placeholder: "Rechercher un invité...",
  },
};
