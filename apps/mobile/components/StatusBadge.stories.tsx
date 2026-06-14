import type { Meta, StoryObj } from "storybook/react";
import { StatusBadge } from "./StatusBadge";

const meta: Meta<typeof StatusBadge> = {
  title: "Components/StatusBadge",
  component: StatusBadge,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "radio", options: ["sm", "md"] },
    color: { control: "color" },
  },
};
export default meta;

type Story = StoryObj<typeof StatusBadge>;

export const Default: Story = {
  args: { label: "Confirmé", color: "#10B981" },
};

export const Pending: Story = {
  args: { label: "En attente", color: "#F59E0B" },
};

export const Declined: Story = {
  args: { label: "Décliné", color: "#EF4444" },
};

export const Medium: Story = {
  args: { label: "Réservé", color: "#3B82F6", size: "md" },
};
