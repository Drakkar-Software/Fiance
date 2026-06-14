import type { Meta, StoryObj } from "storybook/react";
import { fn } from "storybook/test";
import { FilterTabs } from "./FilterTabs";

const meta: Meta<typeof FilterTabs> = {
  title: "Components/FilterTabs",
  component: FilterTabs,
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

type Story = StoryObj<typeof FilterTabs>;

export const WithCounts: Story = {
  args: {
    tabs: [
      { key: "all", label: "Tous", count: 42 },
      { key: "accepted", label: "Confirmés", count: 28 },
      { key: "pending", label: "En attente", count: 10 },
      { key: "declined", label: "Déclinés", count: 4 },
    ],
    activeKey: "all",
    onSelect: fn(),
  },
};

export const WithoutCounts: Story = {
  args: {
    tabs: [
      { key: "preparation", label: "Préparation" },
      { key: "agenda", label: "Agenda" },
      { key: "day-of", label: "Jour J" },
    ],
    activeKey: "preparation",
    onSelect: fn(),
  },
};
