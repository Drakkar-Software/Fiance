import type { Meta, StoryObj } from "storybook/react";
import { fn } from "storybook/test";
import { HorizontalChipSelect } from "./HorizontalChipSelect";

const meta: Meta<typeof HorizontalChipSelect> = {
  title: "Components/HorizontalChipSelect",
  component: HorizontalChipSelect,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ width: 400 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof HorizontalChipSelect>;

export const Default: Story = {
  args: {
    options: [
      { key: "all", label: "Tous" },
      { key: "venue", label: "Lieu" },
      { key: "catering", label: "Traiteur" },
      { key: "photo", label: "Photo" },
      { key: "music", label: "Musique" },
    ],
    activeKey: "all",
    onSelect: fn(),
  },
};

export const FewOptions: Story = {
  args: {
    options: [
      { key: "yes", label: "Oui" },
      { key: "no", label: "Non" },
    ],
    activeKey: "yes",
    onSelect: fn(),
  },
};
