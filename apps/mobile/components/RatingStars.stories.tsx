import type { Meta, StoryObj } from "storybook/react";
import { fn } from "storybook/test";
import { RatingStars } from "./RatingStars";

const meta: Meta<typeof RatingStars> = {
  title: "Components/RatingStars",
  component: RatingStars,
  tags: ["autodocs"],
  argTypes: {
    rating: { control: { type: "range", min: 0, max: 5, step: 1 } },
    size: { control: { type: "range", min: 12, max: 40, step: 4 } },
    color: { control: "color" },
  },
};
export default meta;

type Story = StoryObj<typeof RatingStars>;

export const Interactive: Story = {
  args: { rating: 3, onChange: fn() },
};

export const ReadOnly: Story = {
  args: { rating: 4 },
};

export const Empty: Story = {
  args: { rating: 0, onChange: fn() },
};

export const Full: Story = {
  args: { rating: 5 },
};

export const CustomSize: Story = {
  args: { rating: 3, size: 32, color: "#EC4899" },
};
