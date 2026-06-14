import type { Meta, StoryObj } from "storybook/react";
import { fn } from "storybook/test";
import { Plus, Pencil } from "lucide-react";
import { FAB } from "./FAB";

const meta: Meta<typeof FAB> = {
  title: "Components/FAB",
  component: FAB,
  tags: ["autodocs"],
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ position: "relative", height: 120, width: 120 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof FAB>;

export const Default: Story = {
  args: { onPress: fn(), icon: Plus },
};

export const EditIcon: Story = {
  args: { onPress: fn(), icon: Pencil },
};
