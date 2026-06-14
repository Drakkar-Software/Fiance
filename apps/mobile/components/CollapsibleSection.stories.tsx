import type { Meta, StoryObj } from "storybook/react";
import React from "react";
import { Text } from "react-native-css/components";
import { CollapsibleSection } from "./CollapsibleSection";

const meta: Meta<typeof CollapsibleSection> = {
  title: "Components/CollapsibleSection",
  component: CollapsibleSection,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ width: 380 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof CollapsibleSection>;

export const Expanded: Story = {
  args: {
    title: "Invités confirmés",
    count: 28,
    defaultExpanded: true,
    children: <Text style={{ color: "#6B7280" }}>Contenu de la section ici...</Text>,
  },
};

export const Collapsed: Story = {
  args: {
    title: "Invités en attente",
    count: 10,
    defaultExpanded: false,
    children: <Text style={{ color: "#6B7280" }}>Contenu caché</Text>,
  },
};

export const WithoutCount: Story = {
  args: {
    title: "Notes",
    defaultExpanded: true,
    children: <Text style={{ color: "#6B7280" }}>Section sans compteur</Text>,
  },
};
