import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect, beforeAll } from "vitest";
import { parseAndRestore } from "@fiance/sdk";
import { WEDDING_SAMPLES, getSampleBackupJson } from "@/samples";
import { BACKUP_VERSION } from "@/samples/shared";

const samplesDir = join(__dirname, "..", "samples");

describe("wedding samples", () => {
  beforeAll(() => {
    for (const sample of WEDDING_SAMPLES) {
      writeFileSync(
        join(samplesDir, `${sample.id}.json`),
        `${getSampleBackupJson(sample.id)}\n`,
        "utf8",
      );
    }
  });
  it("exports three sample weddings", () => {
    expect(WEDDING_SAMPLES.map((s) => s.id)).toEqual(["small", "medium", "big"]);
  });

  for (const sample of WEDDING_SAMPLES) {
    it(`${sample.id} backup is valid v${BACKUP_VERSION} data`, () => {
      expect(sample.backup.version).toBe(BACKUP_VERSION);
      const json = getSampleBackupJson(sample.id);
      const snapshot = parseAndRestore(json);
      expect(typeof snapshot).not.toBe("string");
      if (typeof snapshot === "string") return;

      expect(snapshot.wedding?.partner1Name).toBeTruthy();
      expect(snapshot.guests.length).toBe(sample.guestCount);
      expect(snapshot.vendors.length).toBeGreaterThan(0);
      expect(snapshot.tasks.length).toBeGreaterThan(0);
      expect(snapshot.accommodations.length).toBeGreaterThan(0);
      expect(snapshot.gifts.length).toBeGreaterThan(0);
      expect(snapshot.ideaCollections.length).toBeGreaterThan(0);
      expect(snapshot.ideas.length).toBeGreaterThan(0);
      expect(snapshot.communications.length).toBeGreaterThan(0);
      expect(snapshot.dayOfItems.length).toBeGreaterThan(0);
      expect(snapshot.agendaEvents.length).toBeGreaterThan(0);
    });
  }
});
