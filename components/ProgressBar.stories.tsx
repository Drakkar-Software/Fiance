import type { Meta, StoryObj } from "storybook/react";
import { ProgressBar } from "./ProgressBar";

const meta: Meta<typeof ProgressBar> = {
  title: "Components/ProgressBar",
  component: ProgressBar,
  tags: ["autodocs"],
  argTypes: {
    colorScheme: { control: "radio", options: ["default", "budget"] },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 300 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof ProgressBar>;

export const Default: Story = {
  args: { value: 65, max: 100, label: "Invités confirmés" },
};

export const Complete: Story = {
  args: { value: 100, max: 100, label: "Terminé" },
};

export const Empty: Story = {
  args: { value: 0, max: 100, label: "Pas encore commencé" },
};

export const BudgetHealthy: Story = {
  args: { value: 8000, max: 15000, label: "Budget", colorScheme: "budget" },
};

export const BudgetWarning: Story = {
  args: { value: 14000, max: 15000, label: "Budget", colorScheme: "budget" },
};

export const BudgetOverflow: Story = {
  args: { value: 18000, max: 15000, label: "Budget", colorScheme: "budget" },
};

export const NoLabel: Story = {
  args: { value: 42, max: 100, showPercentage: false },
};
