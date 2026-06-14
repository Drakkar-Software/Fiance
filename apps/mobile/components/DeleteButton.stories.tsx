import type { Meta, StoryObj } from "storybook/react";
import { fn } from "storybook/test";
import { DeleteButton } from "./DeleteButton";

const meta: Meta<typeof DeleteButton> = {
  title: "Components/DeleteButton",
  component: DeleteButton,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof DeleteButton>;

export const Default: Story = {
  args: { label: "Supprimer cet invité", onPress: fn() },
};

export const DeleteVendor: Story = {
  args: { label: "Supprimer ce prestataire", onPress: fn() },
};
