import type { Meta, StoryObj } from "storybook/react";
import React from "react";
import { fn } from "storybook/test";
import { Bell, Lock, Wifi } from "lucide-react";
import { ToggleCard } from "./ToggleCard";

const meta: Meta<typeof ToggleCard> = {
  title: "Components/ToggleCard",
  component: ToggleCard,
  tags: ["autodocs"],
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ width: 380 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof ToggleCard>;

export const Enabled: Story = {
  args: {
    icon: <Bell size={22} color="#EC4899" />,
    title: "Notifications",
    subtitle: "Recevoir des rappels",
    enabled: true,
    onToggle: fn(),
  },
};

export const Disabled: Story = {
  args: {
    icon: <Wifi size={22} color="#9CA3AF" />,
    title: "Synchronisation",
    subtitle: "Sauvegarde automatique",
    enabled: false,
    onToggle: fn(),
  },
};

export const DisabledState: Story = {
  args: {
    icon: <Lock size={22} color="#9CA3AF" />,
    title: "Fonctionnalité premium",
    enabled: false,
    onToggle: fn(),
    disabled: true,
  },
};
