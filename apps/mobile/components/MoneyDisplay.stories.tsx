import type { Meta, StoryObj } from "storybook/react";
import { MoneyDisplay } from "./MoneyDisplay";

const meta: Meta<typeof MoneyDisplay> = {
  title: "Components/MoneyDisplay",
  component: MoneyDisplay,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "radio", options: ["sm", "md", "lg"] },
  },
};
export default meta;

type Story = StoryObj<typeof MoneyDisplay>;

export const Default: Story = {
  args: { amount: 15000 },
};

export const Small: Story = {
  args: { amount: 500, size: "sm" },
};

export const Large: Story = {
  args: { amount: 25000, size: "lg" },
};

export const Dynamic: Story = {
  args: { amount: 3200, isDynamic: true },
};

export const USD: Story = {
  args: { amount: 10000, currency: "USD" },
};
