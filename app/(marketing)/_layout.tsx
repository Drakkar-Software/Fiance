import { ScrollView } from "react-native-css/components";
import { Slot } from "expo-router";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export default function MarketingLayout() {
  return (
    <ScrollView className="flex-1 bg-accent-cream">
      <MarketingNav />
      <Slot />
      <MarketingFooter />
    </ScrollView>
  );
}
