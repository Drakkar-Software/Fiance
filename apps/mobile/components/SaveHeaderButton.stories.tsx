import type { Meta, StoryObj } from "storybook/react";
import { fn } from "storybook/test";
import { SaveHeaderButton } from "./SaveHeaderButton";

const meta: Meta<typeof SaveHeaderButton> = {
  title: "Components/SaveHeaderButton",
  component: SaveHeaderButton,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof SaveHeaderButton>;

export const Enabled: Story = {
  args: { label: "Enregistrer", enabled: true, onPress: fn() },
};

export const Disabled: Story = {
  args: { label: "Enregistrer", enabled: false, onPress: fn() },
};
