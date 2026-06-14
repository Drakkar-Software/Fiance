import type { Meta, StoryObj } from "storybook/react";
import { fn } from "storybook/test";
import { SegmentedControl } from "./SegmentedControl";

const meta: Meta<typeof SegmentedControl> = {
  title: "Components/SegmentedControl",
  component: SegmentedControl,
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

type Story = StoryObj<typeof SegmentedControl>;

export const TwoSegments: Story = {
  args: {
    segments: [
      { key: "list", label: "Liste" },
      { key: "table", label: "Table" },
    ],
    activeKey: "list",
    onSelect: fn(),
  },
};

export const ThreeSegments: Story = {
  args: {
    segments: [
      { key: "all", label: "Tous" },
      { key: "pending", label: "En attente" },
      { key: "done", label: "Terminé" },
    ],
    activeKey: "all",
    onSelect: fn(),
  },
};
