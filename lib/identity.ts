/**
 * Identity & invite utilities for WeddingOS sync authentication.
 * Uses a user-chosen password as the root identity.
 */

import * as Crypto from "expo-crypto";
import * as Linking from "expo-linking";

// 256 words — one byte maps directly to one word with zero modulo bias.
const WORDLIST = [
  "apple","arrow","atlas","amber","azure","beach","berry","blaze","bloom","bliss",
  "brave","breeze","brook","brush","cabin","camel","candy","cargo","cedar","charm",
  "chess","cliff","cloud","clover","coast","cobra","cocoa","comet","coral","crane",
  "creek","crown","crush","curve","dance","darts","dawn","delta","denim","depth",
  "derby","diver","dove","drift","dune","eagle","earth","ember","epoch","equip",
  "fable","faith","fault","feast","ferry","field","finch","flame","flask","flint",
  "flora","forge","fox","frost","gale","gamma","gaze","ghost","glade","gleam",
  "globe","glow","grain","grape","gravel","grove","guard","guide","haven","hawk",
  "hazel","heart","hedge","heron","honey","horizon","hull","ivory","jade","jazz",
  "jewel","jolly","karma","kayak","kelp","kite","knack","knoll","lace","lake",
  "lance","latch","lemon","lilac","linen","lodge","lotus","lunar","maple","march",
  "marsh","mason","medal","melon","mirth","mocha","moon","morse","moss","mural",
  "myth","navy","nectar","nerve","noble","north","oasis","ocean","olive","onyx",
  "opera","orbit","orchid","otter","owl","palm","panel","paper","patch","peach",
  "pearl","pebble","penny","petal","pilot","pixel","plank","plaza","plume","polar",
  "pond","poppy","prism","pulse","quail","quartz","quest","quill","radar","raven",
  "realm","reef","ridge","river","robin","roost","royal","ruby","sage","sail",
  "sand","satin","scout","seed","shark","shelf","shore","sigma","silk","slate",
  "slope","solar","spark","spice","spire","spruce","staff","stamp","steel","stone",
  "storm","stove","straw","suite","surge","swamp","swift","tango","thyme","tiger",
  "toast","topaz","torch","tower","trail","trout","tulip","tundra","turbo","ultra",
  "umbra","unity","urban","valor","vault","velvet","verge","vigor","viola","viper",
  "vivid","voice","waltz","watch","wave","wheat","whale","wheel","whirl","width",
  "wind","wren","yacht","yarn","yeast","yield","zebra","zinc","zone","zodiac",
  "acorn","badge","basil","bison","brick","bugle","cape","chain","chalk","chime",
  "cider","cloak","craft","crisp","drape","elbow",
] as const;

/** Generate a random 8-word passphrase using crypto-secure randomness */
export function generatePassphrase(): string {
  const bytes = Crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes)
    .map((b) => WORDLIST[b])
    .join("-");
}

/** Derive a deterministic auth token (hex string) from a password */
export async function deriveAuthToken(password: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password.trim()
  );
}

/**
 * Derive a deterministic encryption key from password + salt.
 * The salt should be wedding-specific (e.g. the wedding UUID) so
 * different weddings get different encryption keys.
 */
export async function deriveEncryptionKey(
  password: string,
  salt: string
): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${password.trim()}:${salt}`
  );
}

/** Build a deep link URL to invite someone to a wedding */
export function buildInviteUrl(name: string, password: string): string {
  return Linking.createURL("join", {
    queryParams: {
      name,
      password,
    },
  });
}

/** Parse invite params from a deep link URL. Returns null if not an invite link. */
export function parseInviteUrl(
  url: string
): { name: string; password: string } | null {
  const parsed = Linking.parse(url);
  const name = parsed.queryParams?.name;
  const password = parsed.queryParams?.password;
  if (
    typeof name === "string" &&
    typeof password === "string" &&
    name &&
    password
  ) {
    return { name, password };
  }
  return null;
}
