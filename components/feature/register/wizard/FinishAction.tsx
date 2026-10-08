import Text from "@/components/common/Text";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
} from "@/components/ui/actionsheet";
import { Colors } from "@/constants/Colors";
import { wait } from "@/lib/utils";
import { State } from "@/types";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import React from "react";
import { Animated, Easing, View } from "react-native";

export default function FinishAction({ state }: { state: State<boolean> }) {
  const [open, setOpen] = state;

  const [loading, setLoading] = React.useState(true);

  const [rotationValue] = React.useState(() => new Animated.Value(0));

  React.useEffect(() => {
    const animateRotation = Animated.loop(
      Animated.timing(rotationValue, {
        toValue: 1,
        duration: 1000, // 1 second
        useNativeDriver: true, // For better performance
        easing: Easing.linear,
      }),
    );

    animateRotation.start();

    return () => {
      animateRotation.stop();
    };
  }, [rotationValue]);

  React.useEffect(() => {
    let cancelled = false;
    async function handleLoading() {
      // * Simulate a network request or some processing time

      await wait(2000);
      if (cancelled) return;

      setLoading(false);

      await wait(1000);
      if (cancelled) return;

      setOpen(false);
      setLoading(true);
      router.replace("/(back-office)/home");
    }

    if (open) handleLoading();
    return () => {
      cancelled = true;
    };
  }, [open, setOpen]);

  const rotateInterpolate = rotationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Actionsheet isOpen={open} onClose={() => {
      setOpen(false);
      setLoading(true);
    }}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="p-8">
        <View
          style={{ height: 180 }}
          className="items-center justify-center gap-4"
        >
          {!loading ? (
            <>
              <Feather name="check" size={64} color={Colors.primary} />
              <Text className="text-zinc-700" w="medium">
                Data pendaftaran berhasil diisi.
              </Text>
            </>
          ) : (
            <>
              <Animated.View
                style={{ transform: [{ rotate: rotateInterpolate }] }}
              >
                <AntDesign name="loading" size={64} color={Colors.primary} />
              </Animated.View>
              <Text className="text-zinc-700" w="medium">
                Sedang memproses data pendaftaran anda.
              </Text>
            </>
          )}
        </View>
      </ActionsheetContent>
    </Actionsheet>
  );
}
