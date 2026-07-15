import { useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { useTranslation } from "react-i18next";

function randomIndex(length: number, avoid: number | null): number {
  if (length <= 1) return 0;
  let index = Math.floor(Math.random() * length);
  if (index === avoid) index = (index + 1) % length;
  return index;
}

/** Picks a random tip on mount and again each time the app comes to the foreground. */
export function useWeddingTip() {
  const { t } = useTranslation("tips");
  const items = t("items", { returnObjects: true }) as string[];
  const eyebrow = t("eyebrow");
  const indexRef = useRef<number | null>(null);
  const [index, setIndex] = useState(() => randomIndex(items.length, null));
  indexRef.current = index;

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") setIndex(randomIndex(items.length, indexRef.current));
    });
    return () => sub.remove();
  }, [items.length]);

  const next = () => setIndex(randomIndex(items.length, indexRef.current));

  return { tip: items[index] ?? "", eyebrow, next };
}
