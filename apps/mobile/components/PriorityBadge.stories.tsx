import type { Meta, StoryObj } from "storybook/react";
import React from "react";
import { View } from "react-native-css/components";
import { PriorityBadge } from "./PriorityBadge";

const meta: Meta<typeof PriorityBadge> = {
  title: "Components/PriorityBadge",
  component: PriorityBadge,
  tags: ["autodocs"],
  argTypes: {
    priority: {
      control: "radio",
      options: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
    },
  },
};
export default meta;

type Story = StoryObj<typeof PriorityBadge>;

export const Low: Story = {
  args: { priority: "LOW" },
};

export const Medium: Story = {
  args: { priority: "MEDIUM" },
};

export const High: Story = {
  args: { priority: "HIGH" },
};

export const Critical: Story = {
  args: { priority: "CRITICAL" },
};

export const AllPriorities: Story = {
  render: () => (
    <View style={{ flexDirection: "row", gap: 8 }}>
      <PriorityBadge priority="LOW" />
      <PriorityBadge priority="MEDIUM" />
      <PriorityBadge priority="HIGH" />
      <PriorityBadge priority="CRITICAL" />
    </View>
  ),
};
