import type { Meta, StoryObj } from "storybook/react";
import React from "react";
import { fn } from "storybook/test";
import { Users, Euro, Calendar } from "lucide-react";
import { StatCard } from "./StatCard";

const meta: Meta<typeof StatCard> = {
  title: "Components/StatCard",
  component: StatCard,
  tags: ["autodocs"],
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ width: 200 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof StatCard>;

export const WithTotal: Story = {
  args: {
    icon: <Users size={18} color="#EC4899" />,
    label: "Invités",
    value: 28,
    total: 42,
  },
};

export const WithUnit: Story = {
  args: {
    icon: <Euro size={18} color="#C9956B" />,
    label: "Budget",
    value: 15000,
    unit: " €",
  },
};

export const WithFooter: Story = {
  args: {
    icon: <Calendar size={18} color="#7B9A7B" />,
    label: "Jours restants",
    value: 120,
    footer: "15 septembre 2026",
  },
};

export const Pressable: Story = {
  args: {
    icon: <Users size={18} color="#EC4899" />,
    label: "Invités",
    value: 28,
    total: 42,
    onPress: fn(),
  },
};
