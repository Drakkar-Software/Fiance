import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Settings, MapPin, AlertTriangle, PieChart, Users, Calendar, Briefcase, Sparkles, ChevronRight } from "lucide-react-native";
import { differenceInDays, format } from "date-fns";
import { fr } from "date-fns/locale";
import { useWeddingStore } from "@/store/useWeddingStore";
import { useVendorsStore } from "@/store/useVendorsStore";
import { useGuestsStore, computeCounts } from "@/store/useGuestsStore";
import { usePlanningStore } from "@/store/usePlanningStore";
import { useBudgetSummary } from "@/store/useBudgetStore";
import { useIdeasStore } from "@/store/useIdeasStore";
import { ProgressBar } from "@/components/ProgressBar";
import { formatMoney } from "@/components/MoneyDisplay";

export default function DashboardScreen() {
  const router = useRouter();
  const wedding = useWeddingStore((s) => s.wedding);
  const vendors = useVendorsStore((s) => s.vendors);
  const guests = useGuestsStore((s) => s.guests);
  const counts = React.useMemo(() => computeCounts(guests), [guests]);
  const tasks = usePlanningStore((s) => s.tasks);
  const overdueTasks = React.useMemo(
    () => tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "DONE" && t.status !== "CANCELLED"),
    [tasks]
  );
  const urgentTasks = React.useMemo(
    () => tasks.filter((t) => {
      if (!t.dueDate || t.status === "DONE" || t.status === "CANCELLED") return false;
      const days = differenceInDays(new Date(t.dueDate), new Date());
      return days >= 0 && days <= 7;
    }),
    [tasks]
  );
  const criticalUnstarted = React.useMemo(
    () => tasks.filter((t) => {
      if (t.priority !== "CRITICAL" || t.status !== "TODO" || !t.dueDate) return false;
      const days = differenceInDays(new Date(t.dueDate), new Date());
      return days >= 0 && days <= 30;
    }),
    [tasks]
  );
  const completionRate = React.useMemo(() => {
    const active = tasks.filter((t) => t.status !== "CANCELLED");
    if (active.length === 0) return 0;
    const done = active.filter((t) => t.status === "DONE").length;
    return Math.round((done / active.length) * 100);
  }, [tasks]);
  const budget = useBudgetSummary();
  const ideaCount = useIdeasStore((s) => s.ideas.length);

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

  const hasUrgent =
    urgentDeposits.length > 0 ||
    expiringQuotes.length > 0 ||
    criticalUnstarted.length > 0;

  return (
    <ScrollView
      className="flex-1 bg-accent-cream dark:bg-gray-950"
      showsVerticalScrollIndicator={false}
    >
      {/* Header / Countdown */}
      <View
        className="px-6 pt-16 pb-10 relative"
        style={{
          backgroundColor: "#EC4899",
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
        }}
      >
        <Pressable
          onPress={() => router.push("/(tabs)/settings")}
          className="absolute top-16 right-5 w-9 h-9 rounded-full bg-white/15 items-center justify-center"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Settings size={18} color="rgba(255,255,255,0.85)" />
        </Pressable>
        <Text className="text-white/70 text-sm font-medium tracking-wide">
          {wedding?.partner1Name && wedding?.partner2Name
            ? `${wedding.partner1Name} & ${wedding.partner2Name}`
            : "WeddingOS"}
        </Text>
        {daysUntil != null && daysUntil >= 0 ? (
          <View className="mt-3">
            <View className="flex-row items-baseline">
              <Text className="text-white text-6xl font-bold">
                {daysUntil}
              </Text>
              <Text className="text-white/60 text-xl font-medium ml-2">
                jours
              </Text>
            </View>
            <Text className="text-white/60 text-sm mt-1">
              {weddingDate
                ? format(weddingDate, "EEEE d MMMM yyyy", { locale: fr })
                : ""}
            </Text>
          </View>
        ) : daysUntil != null && daysUntil < 0 ? (
          <Text className="text-white text-3xl font-bold mt-3">
            Félicitations !
          </Text>
        ) : (
          <Text className="text-white/90 text-xl font-semibold mt-3">
            Définissez votre date
          </Text>
        )}
        {wedding?.venueName && (
          <View className="flex-row items-center mt-3 bg-white/10 self-start px-3 py-1.5 rounded-full">
            <MapPin size={14} color="rgba(255,255,255,0.8)" />
            <Text className="text-white/80 ml-1.5 text-sm">
              {wedding.venueName}
            </Text>
          </View>
        )}
      </View>

      <View className="px-4 -mt-5">
        {/* Urgent actions */}
        {hasUrgent && (
          <View className="bg-red-50 dark:bg-red-950 rounded-2xl p-4 mb-3 border border-red-100 dark:border-red-900">
            <View className="flex-row items-center mb-2.5">
              <View className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900 items-center justify-center mr-2">
                <AlertTriangle size={14} color="#EF4444" />
              </View>
              <Text className="text-sm font-semibold text-red-700 dark:text-red-300">
                Actions urgentes
              </Text>
            </View>
            {urgentDeposits.map((v) => (
              <View key={v.id} className="flex-row items-center mb-1.5 ml-8">
                <Text className="text-sm text-red-600 dark:text-red-400 flex-1">
                  Acompte {v.name} — échéance{" "}
                  {v.depositDueDate
                    ? format(new Date(v.depositDueDate), "dd/MM")
                    : ""}
                </Text>
              </View>
            ))}
            {expiringQuotes.map((v) => (
              <View key={v.id} className="flex-row items-center mb-1.5 ml-8">
                <Text className="text-sm text-amber-600 dark:text-amber-400 flex-1">
                  Devis {v.name} expire bientôt
                </Text>
              </View>
            ))}
            {criticalUnstarted.map((t) => (
              <View key={t.id} className="flex-row items-center mb-1.5 ml-8">
                <Text className="text-sm text-red-600 dark:text-red-400 flex-1">
                  {t.title}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Budget summary card */}
        <Pressable
          onPress={() => router.push("/(tabs)/budget")}
          className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-3 border border-gray-100 dark:border-gray-800"
        >
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-accent-sage-light dark:bg-emerald-900 items-center justify-center mr-2.5">
                <PieChart size={16} color="#7B9A7B" />
              </View>
              <Text className="text-base font-semibold text-gray-900 dark:text-white">
                Budget
              </Text>
            </View>
            <Text className="text-xs text-gray-400">
              {bookedVendors.length} réservé{bookedVendors.length !== 1 ? "s" : ""}
            </Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-gray-400">Engagé</Text>
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
          {budget.remaining < 0 && (
            <Text className="text-xs text-red-500 mt-2 font-medium">
              Dépassement de {formatMoney(Math.abs(budget.remaining))}
            </Text>
          )}
        </Pressable>

        {/* Guests + Planning row */}
        <View className="flex-row gap-3 mb-3">
          {/* Guests mini card */}
          <Pressable
            onPress={() => router.push("/(tabs)/invites")}
            className="flex-1 bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800"
          >
            <View className="flex-row items-center mb-3">
              <View className="w-8 h-8 rounded-full bg-accent-blush dark:bg-pink-900 items-center justify-center mr-2">
                <Users size={16} color="#E8B4B8" />
              </View>
              <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                Invités
              </Text>
            </View>
            <Text className="text-3xl font-bold text-gray-900 dark:text-white">
              {counts.accepted}
              <Text className="text-lg text-gray-300 dark:text-gray-600 font-normal">
                /{counts.total}
              </Text>
            </Text>
            <Text className="text-xs text-gray-400 mt-1">confirmés</Text>
            {counts.nb_no_table > 0 && (
              <View className="mt-2 bg-amber-50 dark:bg-amber-900 px-2 py-1 rounded-lg self-start">
                <Text className="text-xs text-amber-600 dark:text-amber-300 font-medium">
                  {counts.nb_no_table} sans table
                </Text>
              </View>
            )}
          </Pressable>

          {/* Planning mini card */}
          <Pressable
            onPress={() => router.push("/(tabs)/planning")}
            className="flex-1 bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800"
          >
            <View className="flex-row items-center mb-3">
              <View className="w-8 h-8 rounded-full bg-accent-gold-light dark:bg-amber-900 items-center justify-center mr-2">
                <Calendar size={16} color="#C9956B" />
              </View>
              <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                Planning
              </Text>
            </View>
            <Text className="text-3xl font-bold text-gray-900 dark:text-white">
              {completionRate}
              <Text className="text-lg text-gray-300 dark:text-gray-600 font-normal">
                %
              </Text>
            </Text>
            <Text className="text-xs text-gray-400 mt-1">terminé</Text>
            {overdueTasks.length > 0 && (
              <View className="mt-2 bg-red-50 dark:bg-red-900 px-2 py-1 rounded-lg self-start">
                <Text className="text-xs text-red-500 dark:text-red-300 font-medium">
                  {overdueTasks.length} en retard
                </Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Prestataires summary */}
        <Pressable
          onPress={() => router.push("/(tabs)/prestataires")}
          className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-3 border border-gray-100 dark:border-gray-800"
        >
          <View className="flex-row items-center mb-3">
            <View className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 items-center justify-center mr-2.5">
              <Briefcase size={16} color="#EC4899" />
            </View>
            <Text className="text-base font-semibold text-gray-900 dark:text-white">
              Prestataires
            </Text>
          </View>
          <View className="flex-row">
            <StatPill
              value={vendors.filter((v) => v.status === "BOOKED").length}
              label="Réservés"
              color="#10B981"
            />
            <StatPill
              value={vendors.filter((v) => v.status === "NEGOTIATING").length}
              label="En négo."
              color="#F59E0B"
            />
            <StatPill
              value={vendors.filter((v) => v.status === "QUOTE_RECEIVED").length}
              label="Devis"
              color="#3B82F6"
            />
            <StatPill
              value={vendors.filter((v) => v.status === "PROSPECT").length}
              label="Prospects"
              color="#9CA3AF"
            />
          </View>
        </Pressable>

        {/* Inspirations */}
        <Pressable
          onPress={() => router.push("/(tabs)/idees")}
          className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-3 border border-gray-100 dark:border-gray-800 flex-row items-center"
        >
          <View className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900 items-center justify-center">
            <Sparkles size={20} color="#A855F7" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-base font-semibold text-gray-900 dark:text-white">
              Mes inspirations
            </Text>
            <Text className="text-xs text-gray-400 mt-0.5">
              {ideaCount} idée{ideaCount !== 1 ? "s" : ""} sauvegardée{ideaCount !== 1 ? "s" : ""}
            </Text>
          </View>
          <ChevronRight size={18} color="#C0C0C8" />
        </Pressable>

        {/* Planning progress */}
        {tasks.length > 0 && (
          <Pressable
            onPress={() => router.push("/(tabs)/planning")}
            className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-3 border border-gray-100 dark:border-gray-800"
          >
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-medium text-gray-500">
                Progression du planning
              </Text>
              <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                {tasks.filter((t) => t.status === "DONE").length}/
                {tasks.filter((t) => t.status !== "CANCELLED").length}
              </Text>
            </View>
            <ProgressBar
              value={completionRate}
              max={100}
              showPercentage={false}
            />
            {urgentTasks.length > 0 && (
              <View className="flex-row items-center mt-2.5">
                <View className="w-2 h-2 rounded-full bg-amber-400 mr-1.5" />
                <Text className="text-xs text-amber-500 font-medium">
                  {urgentTasks.length} tâche{urgentTasks.length > 1 ? "s" : ""}{" "}
                  cette semaine
                </Text>
              </View>
            )}
          </Pressable>
        )}
      </View>

      <View className="h-6" />
    </ScrollView>
  );
}

function StatPill({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: string;
}) {
  return (
    <View className="flex-1 items-center">
      <Text className="text-xl font-bold" style={{ color }}>
        {value}
      </Text>
      <Text className="text-[11px] text-gray-400 mt-0.5">{label}</Text>
    </View>
  );
}
