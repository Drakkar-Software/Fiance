import React from "react";
import { LockScreen as SeahorseLockScreen } from "@drakkar.software/seahorse/components";

export function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  return (
    <SeahorseLockScreen
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
