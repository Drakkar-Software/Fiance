import type { Meta, StoryObj } from "storybook/react";
import { DeadlineChip } from "./DeadlineChip";

const today = new Date();
const addDays = (d: Date, n: number) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r.toISOString().split("T")[0];
};

const meta: Meta<typeof DeadlineChip> = {
  title: "Components/DeadlineChip",
  component: DeadlineChip,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof DeadlineChip>;

export const Today: Story = {
  args: { date: addDays(today, 0) },
};

export const Overdue: Story = {
  args: { date: addDays(today, -5) },
};

export const ThisWeek: Story = {
  args: { date: addDays(today, 3) },
};

export const ThisMonth: Story = {
  args: { date: addDays(today, 20) },
};

export const FarFuture: Story = {
  args: { date: addDays(today, 90) },
};
