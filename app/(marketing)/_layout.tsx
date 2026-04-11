import { View, ScrollView } from "react-native-css/components";
import { Slot } from "expo-router";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export default function MarketingLayout() {
  return (
    <View style={{ flex: 1, overflow: "visible" }}>
      <MarketingNav />
      <ScrollView style={{ flex: 1 }} className="bg-accent-cream">
        <Slot />
        <MarketingFooter />
      </ScrollView>
    </View>
  );
}
