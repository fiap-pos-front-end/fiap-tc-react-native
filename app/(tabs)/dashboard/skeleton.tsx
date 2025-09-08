import { SafeAreaView, StyleSheet, View, Animated, Easing } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { useRef, useEffect } from "react";

export function DashboardSkeleton() {
  const shimmerAnims = [
    useRef(new Animated.Value(-1)).current,
    useRef(new Animated.Value(-1)).current,
    useRef(new Animated.Value(-1)).current,
    useRef(new Animated.Value(-1)).current,
  ];

  const createLoop = (anim: Animated.Value, delay = 0) => {
    return Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(anim, {
          toValue: -1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    );
  };

  useEffect(() => {
    createLoop(shimmerAnims[0], 0).start();
    createLoop(shimmerAnims[1], 0).start();
    createLoop(shimmerAnims[2], 0).start();
    createLoop(shimmerAnims[3], 0).start();
  }, []);

  const SkeletonBlock = ({ style, anim }: { style: any; anim: Animated.Value }) => {
    const translateX = anim.interpolate({
      inputRange: [-1, 1],
      outputRange: [-300, 300],
    });

    return (
      <View style={[styles.skeletonBase, style]}>
        <Animated.View
          style={[
            styles.shimmer,
            {
              transform: [{ translateX }, { rotate: "15deg" }],
            },
          ]}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.content}>
        <SkeletonBlock style={styles.skeletonHeader} anim={shimmerAnims[0]} />
        <View style={styles.cardsContainer}>
          <SkeletonBlock style={styles.skeletonCard} anim={shimmerAnims[1]} />
          <SkeletonBlock style={styles.skeletonCard} anim={shimmerAnims[2]} />
          <SkeletonBlock style={styles.skeletonCard} anim={shimmerAnims[3]} />
          <SkeletonBlock style={styles.skeletonButton} anim={shimmerAnims[1]} />
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { flex: 1, padding: 20 },
  skeletonBase: {
    overflow: "hidden",
    backgroundColor: "#cccccc",
    borderRadius: 8,
  },
  shimmer: {
    position: "absolute",
    top: -20,
    left: 0,
    height: "350%",
    width: 100,
    backgroundColor: "#d6d6d6",
    opacity: 0.3,
  },
  skeletonHeader: {
    height: 20,
    width: "60%",
    borderRadius: 8,
    marginBottom: 30,
    alignSelf: "center",
  },
  cardsContainer: { flex: 1, gap: 20 },
  skeletonCard: {
    height: 100,
    borderRadius: 16,
    backgroundColor: "#cccccc",
  },
  skeletonButton: {
    height: 50,
    borderRadius: 12,
    backgroundColor: "#cccccc",
    marginTop: 20,
  },
});
