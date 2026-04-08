import type { Meta, StoryObj } from "storybook/react";
import React from "react";
import { Text } from "react-native";
import { fn } from "storybook/test";
import { Camera, MapPin, ChevronRight } from "lucide-react";
import { IconCard } from "./IconCard";

const meta: Meta<typeof IconCard> = {
  title: "Components/IconCard",
  component: IconCard,
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

type Story = StoryObj<typeof IconCard>;

export const Basic: Story = {
  args: {
    icon: <Camera size={22} color="#EC4899" />,
    title: "Photographe",
    subtitle: "Studio Lumière",
  },
};

export const WithRight: Story = {
  args: {
    icon: <MapPin size={22} color="#7B9A7B" />,
    title: "Lieu de réception",
    subtitle: "Château de Versailles",
    right: <ChevronRight size={20} color="#D1D5DB" />,
  },
};

export const Pressable: Story = {
  args: {
    icon: <Camera size={22} color="#EC4899" />,
    title: "Photographe",
    subtitle: "Cliquez pour voir les détails",
    onPress: fn(),
  },
};

export const WithChildren: Story = {
  args: {
    icon: <Camera size={22} color="#EC4899" />,
    title: "Photographe",
    subtitle: "Studio Lumière",
    children: (
      <Text style={{ marginTop: 8, fontSize: 12, color: "#9CA3AF" }}>
        Contenu supplémentaire ici
      </Text>
    ),
  },
};
