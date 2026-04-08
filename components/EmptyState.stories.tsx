import type { Meta, StoryObj } from "storybook/react";
import { fn } from "storybook/test";
import { Users, Calendar, Heart } from "lucide-react";
import { EmptyState } from "./EmptyState";

const meta: Meta<typeof EmptyState> = {
  title: "Components/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof EmptyState>;

export const WithAction: Story = {
  args: {
    icon: Users,
    title: "Aucun invité",
    description: "Commencez par ajouter vos invités à la liste.",
    actionLabel: "Ajouter un invité",
    onAction: fn(),
  },
};

export const WithoutAction: Story = {
  args: {
    icon: Calendar,
    title: "Aucune tâche",
    description: "Toutes vos tâches sont terminées !",
  },
};

export const Minimal: Story = {
  args: {
    icon: Heart,
    title: "Rien à afficher",
  },
};
