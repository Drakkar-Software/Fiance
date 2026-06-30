import { Platform, Share } from "react-native";
import { toast } from "@/lib/toast/sonner";

/**
 * Cross-platform share helper.
 * On web: uses navigator.share if available, otherwise copies to clipboard and shows a toast.
 * On native: uses the system share sheet.
 */
export async function shareLink(url: string, message: string, copiedText: string): Promise<void> {
  if (Platform.OS === "web") {
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        // message already ends with the url (from the i18n template), so do NOT
        // also pass `url` as a separate field — share targets concatenate them,
        // producing a duplicate url that pollutes the #fragment of the first link.
        await navigator.share({ text: message });
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        toast.success(copiedText);
      }
    } catch {
      // dismissed or not permitted
    }
  } else {
    try {
      await Share.share({ message, url });
    } catch {
      // dismissed
    }
  }
}
