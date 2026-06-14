import type { Meta, StoryObj } from "storybook/react";
import { fn } from "storybook/test";
import { StatusSelector } from "./StatusSelector";

const meta: Meta<typeof StatusSelector> = {
  title: "Components/StatusSelector",
  component: StatusSelector,
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

type Story = StoryObj<typeof StatusSelector>;

export const RsvpStatus: Story = {
  args: {
    options: [
      { key: "PENDING", label: "En attente", color: "#F59E0B" },
      { key: "ACCEPTED", label: "Accepté", color: "#10B981" },
      { key: "DECLINED", label: "Décliné", color: "#EF4444" },
      { key: "MAYBE", label: "Peut-être", color: "#3B82F6" },
    ],
    activeKey: "PENDING",
    onSelect: fn(),
  },
};

export const VendorStatus: Story = {
  args: {
    options: [
      { key: "PROSPECT", label: "Prospect", color: "#9CA3AF" },
      { key: "QUOTE_RECEIVED", label: "Devis reçu", color: "#3B82F6" },
      { key: "NEGOTIATING", label: "Négociation", color: "#F59E0B" },
      { key: "BOOKED", label: "Réservé", color: "#10B981" },
    ],
    activeKey: "BOOKED",
    onSelect: fn(),
  },
};
