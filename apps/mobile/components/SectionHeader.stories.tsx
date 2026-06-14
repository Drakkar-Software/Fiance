import type { Meta, StoryObj } from "storybook/react";
import React from "react";
import { Text, Pressable } from "react-native-css/components";
import { Settings } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

const meta: Meta<typeof SectionHeader> = {
  title: "Components/SectionHeader",
  component: SectionHeader,
  tags: ["autodocs"],
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ width: 400 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof SectionHeader>;

export const TitleOnly: Story = {
  args: { title: "My vendors" },
};

export const WithSubtitle: Story = {
  args: { title: "Budget", subtitle: "15 000 € prévus" },
};

export const WithRightElement: Story = {
  args: {
    title: "Paramètres",
    right: (
      <Pressable>
        <Settings size={18} color="#9CA3AF" />
      </Pressable>
    ),
  },
};

export const WithChildren: Story = {
  args: {
    title: "Invités",
    children: <Text style={{ fontSize: 12, color: "#9CA3AF" }}>Filtrer par statut</Text>,
  },
};
