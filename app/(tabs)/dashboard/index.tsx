import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
  Animated
} from "react-native";
import React from "react";
import { Dimensions, ScrollView } from "react-native";
import {
  StackedBarChart,
  PieChart,
} from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useDashboard } from "@/contexts/DashboardContext";
import { useState, useRef, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { DashboardSkeleton } from "@/app/(tabs)/dashboard/skeleton";


export default function DashboardScreen() {
  const router = useRouter();
  const { dashboardData, loading, error } = useDashboard();
  const [showBalance, setShowBalance] = useState(false);
  const { getUserName } = useAuthContext();

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get("window").width;

 const dataStackedBar = {
    labels: dashboardData.getByCategory.map(
      (item) => `${item.icon} ${item.categoryName}`
    ),
    legend: [],
    data: dashboardData.getByCategory.map(
      (item) => [item.income, item.expense]
    ),
    barColors: ["#28a745", "#dc3545"],
  };
  
  const dataPie = [
    {
      name: "Despesas",
      population: dashboardData?.monthlyExpense ?? 0,
      color: "#dc3545",
    },
    {
      name: "Receita",
      population: dashboardData?.monthlyIncome ?? 0,
      color: "#28a745",
    },
  ];

  const toggleBalance = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowBalance((prev) => !prev);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.centeredContainer}>
          <ThemedText style={styles.errorText}>Erro: {error}</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
          <ThemedView style={styles.content}>
            <ThemedView style={styles.header}>
              <ThemedText style={styles.subtitle}>
                Olá {getUserName() ?? "Usuário"}, seja bem vindo(a) de volta
              </ThemedText>
            </ThemedView>
            
              <ThemedView style={styles.cardsContainer}>
                <ThemedView style={styles.balanceCard}>
                  <View style={styles.balanceHeader}>
                    <ThemedText style={styles.balanceLabel}>Saldo Atual</ThemedText>
                    <TouchableOpacity onPress={toggleBalance}>
                      <Ionicons
                        name={showBalance ? "eye-off" : "eye"}
                        size={22}
                        color="#fff"
                      />
                    </TouchableOpacity>
                  </View>

                  <Animated.View style={{ opacity: fadeAnim }}>
                    <ThemedText
                      style={[
                        styles.balanceValue,
                        !showBalance && styles.hiddenBalance,
                      ]}
                    >
                      {showBalance
                        ? formatCurrency(dashboardData.currentBalance)
                        : "* * * *"}
                    </ThemedText>
                  </Animated.View>
                </ThemedView>

                <Animated.View style={[styles.card,{transform: [{ scale }],opacity: opacity,}]}>
                  <ThemedText style={styles.cardLabel}>Balanço do Mês</ThemedText>
                  <ThemedView style={{ flexDirection: "row", alignItems: "center", padding: 8 }}>
                    <PieChart
                      data={dataPie}
                      width={screenWidth * 0.5}
                      height={220}
                      accessor="population"
                      backgroundColor="transparent"
                      paddingLeft='45'
                      chartConfig={{
                        color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
                      }}
                      absolute
                      hasLegend={false}
                    />

                    <ThemedView style={{ marginLeft: 10, flex: 1, justifyContent: "center" }}>
                      {dataPie.map((item, index) => (
                        <ThemedView
                          key={index}
                          style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}
                        >
                          <View
                            style={{
                              width: 14,
                              height: 14,
                              borderRadius: 8,
                              backgroundColor: item.color,
                              marginRight: 8,
                            }}
                          />
                          <ThemedText> {`${item.name}:\n ${formatCurrency(item.population)}`} </ThemedText>
                        </ThemedView>
                      ))}
                    </ThemedView>
                  </ThemedView>
                </Animated.View>

                <Animated.View style={[styles.card, { transform: [{ scale }], opacity: opacity,}]}
                >
                  <ThemedText style={styles.cardLabel}>Comparativo por Categoria Mensal</ThemedText>
                  <StackedBarChart
                    style={{ marginVertical: 8, padding: 0}}
                    data={dataStackedBar}
                    width={screenWidth - 100}
                    height={250}
                    chartConfig={{
                      backgroundColor: "#ffffff",
                      backgroundGradientFrom: "#ffffff",
                      backgroundGradientTo: "#ffffff",
                      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    }}
                   hideLegend={true}
                   fromZero
                   yLabelsOffset={1}
                  />
                  <ThemedView style={{  flexDirection: "row", gap:50, marginLeft: 10, flex: 1, justifyContent: "center" }}>
                      {dataPie.map((item, index) => (
                        <ThemedView key={index}style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                          <View
                            style={{
                              width: 14,
                              height: 14,
                              borderRadius: 8,
                              backgroundColor: item.color,
                              marginRight: 8,
                            }}
                          />
                          <ThemedText> {`${item.name}`} </ThemedText>
                        </ThemedView>
                      ))}
                    </ThemedView>
                </Animated.View>

                <TouchableOpacity
                  style={styles.button}
                  onPress={() => router.push("/dashboard/details")}
                >
                  <ThemedText style={styles.buttonText}>Ver Detalhes</ThemedText>
                </TouchableOpacity>
              </ThemedView>
          </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
 container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  cardsContainer: {
    flex: 1,
    gap: 20,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  cardValue: {
    fontSize: 28,
    fontWeight: "bold",
  },
  balance: {
    color: "#28a745",
  },
  income: {
    color: "#28a745",
  },
  expense: {
    color: "#dc3545",
  },
  button: {
    backgroundColor: "#007bff",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  loadingText: {
    textAlign: "center",
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    color: "#dc3545",
    fontSize: 16,
    textAlign: "center",
  },
  clearButton: {
    alignItems: "center",
    padding: 12,
  },
  clearButtonText: {
    color: "#dc3545",
    fontSize: 16,
    fontWeight: "500",
  },
  seedButton: {
    alignItems: "center",
    padding: 12,
  },
  seedButtonText: {
    color: "#007bff",
    fontSize: 16,
    fontWeight: "500",
  },
  balanceCard: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: "#004A85",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    minWidth: 160,
    textAlign: "left",
  },
  hiddenBalance: {
    letterSpacing: 5,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  itemsContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  itemIcon: {
    fontSize: 24,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  noDataContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noData: {
    textAlign: "center",
    color: "#6c757d",
    fontStyle: "italic",
    fontSize: 16,
  },
});
