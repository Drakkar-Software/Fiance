import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { differenceInDays, format } from "date-fns";
import { fr } from "date-fns/locale";
import { useWeddingStore } from "@/store/useWeddingStore";
import { useVendorsStore } from "@/store/useVendorsStore";
import { useGuestsStore } from "@/store/useGuestsStore";
import { usePlanningStore } from "@/store/usePlanningStore";
import { useIdeasStore } from "@/store/useIdeasStore";
import { useBudgetSummary } from "@/store/useBudgetStore";
import { ProgressBar } from "@/components/ProgressBar";
import { formatMoney } from "@/components/MoneyDisplay";

export default function DashboardScreen() {
  const router = useRouter();
  const wedding = useWeddingStore((s) => s.wedding);
  const vendors = useVendorsStore((s) => s.vendors);
  const guests = useGuestsStore((s) => s.guests);
  const counts = useGuestsStore((s) => s.getCounts());
  const tasks = usePlanningStore((s) => s.tasks);
  const overdueTasks = usePlanningStore((s) => s.getOverdueTasks());
  const urgentTasks = usePlanningStore((s) => s.getUrgentTasks());
  const criticalUnstarted = usePlanningStore((s) => s.getCriticalUnstarted());
  const completionRate = usePlanningStore((s) => s.getCompletionRate());
  const recentIdeas = useIdeasStore((s) => s.getRecentIdeas(4));
  const budget = useBudgetSummary();

  const weddingDate = wedding?.weddingDate
    ? new Date(wedding.weddingDate)
    : null;
  const daysUntil = weddingDate
    ? differenceInDays(weddingDate, new Date())
    : null;

  const bookedVendors = vendors.filter((v) => v.status === "BOOKED");

  // Urgent actions
  const urgentDeposits = vendors.filter((v) => {
    if (!v.depositDueDate || v.depositPaid) return false;
    const days = differenceInDays(new Date(v.depositDueDate), new Date());
    return days >= 0 && days <= 7;
  });

  const expiringQuotes = vendors.filter((v) => {
    if (!v.validityDate || v.status === "BOOKED" || v.status === "CANCELLED")
      return false;
    const days = differenceInDays(new Date(v.validityDate), new Date());
    return days >= 0 && days <= 7;
  });

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-950">
      {/* Header / Countdown */}
      <View className="bg-primary-500 px-6 pt-16 pb-8 rounded-b-3xl">
        <Text className="text-white/80 text-base">
          {wedding?.partner1Name && wedding?.partner2Name
            ? `${wedding.partner1Name} & ${wedding.partner2Name}`
            : "WeddingOS"}
        </Text>
        {daysUntil != null && daysUntil >= 0 ? (
          <View className="mt-2">
            <Text className="text-white text-5xl font-bold">
              J-{daysUntil}
            </Text>
            <Text className="text-white/80 mt-1">
              {weddingDate
                ? format(weddingDate, "EEEE d MMMM yyyy", { locale: fr })
                : ""}
            </Text>
          </View>
        ) : daysUntil != null && daysUntil < 0 ? (
          <Text className="text-white text-3xl font-bold mt-2">
            Félicitations !
          </Text>
        ) : (
          <Text className="text-white text-2xl font-bold mt-2">
            Définissez votre date de mariage
          </Text>
        )}
        {wedding?.venueName && (
          <View className="flex-row items-center mt-2">
            <Ionicons name="location" size={16} color="rgba(255,255,255,0.7)" />
            <Text className="text-white/70 ml-1">{wedding.venueName}</Text>
          </View>
        )}
      </View>

      <View className="px-4 -mt-4">
        {/* Budget summary card */}
        <Pressable
          onPress={() => router.push("/(tabs)/budget")}
          className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm mb-4"
        >
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-semibold text-gray-900 dark:text-white">
              Budget
            </Text>
            <Text className="text-sm text-gray-500">
              {bookedVendors.length} prestataire
              {bookedVendors.length !== 1 ? "s" : ""} réservé
              {bookedVendors.length !== 1 ? "s" : ""}
            </Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-gray-500">Engagé</Text>
            <Text className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatMoney(budget.totalEngaged)} /{" "}
              {formatMoney(budget.budgetTarget)}
            </Text>
          </View>
          <ProgressBar
            value={budget.totalEngaged}
            max={budget.budgetTarget}
            colorScheme="budget"
            showPercentage={false}
          />
          {budget.isEstimate && (
            <Text className="text-xs text-blue-500 mt-2">
              Estimation (aucun RSVP confirmé)
            </Text>
          )}
        </Pressable>

        {/* Guests summary card */}
        <Pressable
          onPress={() => router.push("/(tabs)/invites")}
          className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm mb-4"
        >
          <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">
            Invités
          </Text>
          <View className="flex-row justify-between">
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-emerald-500">
                {counts.accepted}
              </Text>
              <Text className="text-xs text-gray-500">Acceptés</Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-amber-500">
                {counts.pending}
              </Text>
              <Text className="text-xs text-gray-500">En attente</Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-red-500">
                {counts.declined}
              </Text>
              <Text className="text-xs text-gray-500">Déclinés</Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                {counts.total}
              </Text>
              <Text className="text-xs text-gray-500">Total</Text>
            </View>
          </View>
          {counts.total > 0 && (
            <View className="mt-3">
              <ProgressBar
                value={counts.response_rate}
                max={100}
                label="Taux de réponse"
              />
            </View>
          )}
          {counts.nb_no_table > 0 && (
            <Text className="text-xs text-amber-500 mt-2">
              {counts.nb_no_table} invité
              {counts.nb_no_table > 1 ? "s" : ""} accepté
              {counts.nb_no_table > 1 ? "s" : ""} sans table
            </Text>
          )}
        </Pressable>

        {/* Planning summary card */}
        <Pressable
          onPress={() => router.push("/(tabs)/planning")}
          className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm mb-4"
        >
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-semibold text-gray-900 dark:text-white">
              Planning
            </Text>
            <Text className="text-sm text-gray-500">
              {completionRate}% terminé
            </Text>
          </View>
          <ProgressBar
            value={completionRate}
            max={100}
            showPercentage={false}
          />
          <View className="flex-row mt-3 gap-4">
            {overdueTasks.length > 0 && (
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-red-500 mr-1.5" />
                <Text className="text-sm text-red-500">
                  {overdueTasks.length} en retard
                </Text>
              </View>
            )}
            {urgentTasks.length > 0 && (
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-amber-500 mr-1.5" />
                <Text className="text-sm text-amber-500">
                  {urgentTasks.length} urgent
                  {urgentTasks.length > 1 ? "es" : "e"}
                </Text>
              </View>
            )}
          </View>
        </Pressable>

        {/* Urgent actions */}
        {(urgentDeposits.length > 0 ||
          expiringQuotes.length > 0 ||
          criticalUnstarted.length > 0) && (
          <View className="bg-red-50 dark:bg-red-950 rounded-2xl p-4 mb-4">
            <Text className="text-base font-semibold text-red-700 dark:text-red-300 mb-3">
              Actions urgentes
            </Text>
            {urgentDeposits.map((v) => (
              <View key={v.id} className="flex-row items-center mb-2">
                <Ionicons name="alert-circle" size={16} color="#EF4444" />
                <Text className="text-sm text-red-600 dark:text-red-400 ml-2 flex-1">
                  Acompte {v.name} — échéance{" "}
                  {v.depositDueDate
                    ? format(new Date(v.depositDueDate), "dd/MM")
                    : ""}
                </Text>
              </View>
            ))}
            {expiringQuotes.map((v) => (
              <View key={v.id} className="flex-row items-center mb-2">
                <Ionicons name="time" size={16} color="#F59E0B" />
                <Text className="text-sm text-amber-600 dark:text-amber-400 ml-2 flex-1">
                  Devis {v.name} expire bientôt
                </Text>
              </View>
            ))}
            {criticalUnstarted.map((t) => (
              <View key={t.id} className="flex-row items-center mb-2">
                <Ionicons name="warning" size={16} color="#EF4444" />
                <Text className="text-sm text-red-600 dark:text-red-400 ml-2 flex-1">
                  {t.title}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Prestataires summary */}
        <Pressable
          onPress={() => router.push("/(tabs)/prestataires")}
          className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm mb-4"
        >
          <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">
            Prestataires
          </Text>
          <View className="flex-row justify-between">
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-emerald-500">
                {vendors.filter((v) => v.status === "BOOKED").length}
              </Text>
              <Text className="text-xs text-gray-500">Réservés</Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-amber-500">
                {vendors.filter((v) => v.status === "NEGOTIATING").length}
              </Text>
              <Text className="text-xs text-gray-500">En négo.</Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-blue-500">
                {vendors.filter((v) => v.status === "QUOTE_RECEIVED").length}
              </Text>
              <Text className="text-xs text-gray-500">Devis reçus</Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-gray-500">
                {vendors.filter((v) => v.status === "PROSPECT").length}
              </Text>
              <Text className="text-xs text-gray-500">Prospects</Text>
            </View>
          </View>
        </Pressable>

        {/* Quick access */}
        <View className="flex-row flex-wrap gap-3 mb-8">
          {[
            { label: "Prestataires", icon: "briefcase" as const, route: "/(tabs)/prestataires" },
            { label: "Invités", icon: "people" as const, route: "/(tabs)/invites" },
            { label: "Planning", icon: "calendar" as const, route: "/(tabs)/planning" },
            { label: "Idées", icon: "sparkles" as const, route: "/(tabs)/idees" },
            { label: "Budget", icon: "pie-chart" as const, route: "/(tabs)/budget" },
            { label: "Réglages", icon: "settings" as const, route: "/(tabs)/settings" },
          ].map((item) => (
            <Pressable
              key={item.label}
              onPress={() => router.push(item.route as any)}
              className="bg-white dark:bg-gray-900 rounded-xl p-4 items-center shadow-sm"
              style={{ width: "30%" }}
            >
              <Ionicons name={item.icon} size={24} color="#EC4899" />
              <Text className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
