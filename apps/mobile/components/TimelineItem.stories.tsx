import type { Meta, StoryObj } from "storybook/react";
import React from "react";
import { View, Text } from "react-native-css/components";
import { fn } from "storybook/test";
import { Circle, CheckCircle2 } from "lucide-react";
import { TimelineItem } from "./TimelineItem";

const meta: Meta<typeof TimelineItem> = {
  title: "Components/TimelineItem",
  component: TimelineItem,
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

type Story = StoryObj<typeof TimelineItem>;

export const Default: Story = {
  args: {
    left: <CheckCircle2 size={24} color="#10B981" />,
    children: (
      <View>
        <Text style={{ fontWeight: "600", color: "#111827" }}>Réserver le lieu</Text>
        <Text style={{ fontSize: 12, color: "#9CA3AF" }}>Fait le 15 mars</Text>
      </View>
    ),
  },
};

export const WithConnector: Story = {
  args: {
    left: <Circle size={24} color="#D1D5DB" />,
    showConnector: true,
    children: (
      <View style={{ paddingBottom: 16 }}>
        <Text style={{ fontWeight: "600", color: "#111827" }}>Choisir le traiteur</Text>
        <Text style={{ fontSize: 12, color: "#9CA3AF" }}>À faire avant juin</Text>
      </View>
    ),
  },
};

export const Pressable: Story = {
  args: {
    left: <Circle size={24} color="#F59E0B" />,
    onPress: fn(),
    children: (
      <View>
        <Text style={{ fontWeight: "600", color: "#111827" }}>Envoyer les faire-part</Text>
        <Text style={{ fontSize: 12, color: "#9CA3AF" }}>Cliquez pour voir</Text>
      </View>
    ),
  },
};
