import { Platform, Share } from "react-native";
import { toast } from "sonner-native";

/**
 * Cross-platform share helper.
 * On web: uses navigator.share if available, otherwise copies to clipboard and shows a toast.
 * On native: uses the system share sheet.
 */
export async function shareLink(url: string, message: string, copiedText: string): Promise<void> {
  if (Platform.OS === "web") {
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ url, text: message });
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
