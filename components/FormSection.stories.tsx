import type { Meta, StoryObj } from "storybook/react";
import React, { useState } from "react";
import { fn } from "storybook/test";
import { SectionTitle, FormCard, InputRow, ToggleRow, ChipSelect } from "./FormSection";

const meta: Meta = {
  title: "Components/FormSection",
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

export const SectionTitleStory: StoryObj = {
  name: "SectionTitle",
  render: () => <SectionTitle>Informations générales</SectionTitle>,
};

export const FormCardStory: StoryObj = {
  name: "FormCard",
  render: () => (
    <FormCard>
      <InputRow
        label="Nom"
        value="Dupont"
        onChangeText={fn()}
        placeholder="Nom de famille"
      />
      <InputRow
        label="Prénom"
        value="Marie"
        onChangeText={fn()}
        placeholder="Prénom"
      />
    </FormCard>
  ),
};

export const InputRowStory: StoryObj = {
  name: "InputRow",
  render: () => (
    <FormCard>
      <InputRow
        label="Nom du lieu"
        value=""
        onChangeText={fn()}
        placeholder="Ex: Château de Versailles"
      />
    </FormCard>
  ),
};

export const ToggleRowStory: StoryObj = {
  name: "ToggleRow",
  render: () => (
    <FormCard>
      <ToggleRow label="Hébergement sur place" value={true} onToggle={fn()} />
      <ToggleRow label="Transport nécessaire" value={false} onToggle={fn()} />
    </FormCard>
  ),
};

export const ChipSelectStory: StoryObj = {
  name: "ChipSelect",
  render: () => (
    <ChipSelect
      options={["CEREMONY", "COCKTAIL", "FULL", "BOTH_DAYS"] as const}
      value={"FULL" as const}
      onChange={fn()}
      labels={{
        CEREMONY: "Cérémonie",
        COCKTAIL: "Cocktail",
        FULL: "Complet",
        BOTH_DAYS: "2 jours",
      }}
    />
  ),
};

export const CompleteForm: StoryObj = {
  name: "Complete Form",
  render: () => (
    <>
      <SectionTitle>Invité</SectionTitle>
      <FormCard>
        <InputRow
          label="Nom"
          value="Dupont"
          onChangeText={fn()}
          placeholder="Nom"
        />
        <InputRow
          label="Prénom"
          value="Marie"
          onChangeText={fn()}
          placeholder="Prénom"
        />
        <ToggleRow label="Enfant" value={false} onToggle={fn()} />
      </FormCard>
      <SectionTitle>Invitation</SectionTitle>
      <ChipSelect
        options={["CEREMONY", "COCKTAIL", "FULL"] as const}
        value={"FULL" as const}
        onChange={fn()}
        labels={{
          CEREMONY: "Cérémonie",
          COCKTAIL: "Cocktail",
          FULL: "Complet",
        }}
      />
    </>
  ),
};
