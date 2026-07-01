import React from "react";
import { LockScreen as UiLockScreen } from "@fiance/ui/components";

export function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  return (
    <UiLockScreen
      onUnlock={onUnlock}
      labels={{
        title: "Fiancé",
        subtitle: "Entrez votre code PIN",
        errorLabel: "Code incorrect",
        biometricPromptMessage: "Déverrouiller Fiancé",
        biometricCancelLabel: "Utiliser le PIN",
      }}
    />
  );
}
