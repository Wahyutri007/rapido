import { Colors } from "@/constants/Colors";
import { State } from "@/types";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import React from "react";
import { Animated, Easing, View } from "react-native";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
} from "../ui/actionsheet";
import Text from "./Text";

export function useLoadingAction({
  successMessage = "Selesai!",
  loadingMessage = "Sedang memproses.",
}: {
  successMessage?: string;
  loadingMessage?: string;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  async function load(callback: () => Promise<void>) {
    setIsOpen(true);
    setIsLoading(true);

    await callback();

    setIsLoading(false);
  }

  async function close() {
    setIsOpen(false);
    setIsLoading(true);
  }

  const returnData = {
    loadingMessage,
    successMessage,
    loadingState: [isLoading, setIsLoading] as State<boolean>,
    openState: [isOpen, setIsOpen] as State<boolean>,
  };

  // Return the data in 2 ways for compatibility
  return {
    ...returnData,
    load,
    close,

    actionData: returnData,
  };
}

// * This is unsafe
export type LoadingActionData = {
  loadingState?: State<boolean>;
  openState?: State<boolean>;
  loadingMessage?: string;
  successMessage?: string;
};

export type LoadingActionProps = LoadingActionData & {
  onClose?: () => void;

  actionData?: LoadingActionData;
};

export default function LoadingAction(props: LoadingActionProps) {
  const {
    loadingState,
    openState,
    onClose,
    loadingMessage = "Sedang memproses.",
    successMessage = "Selesai!",

    actionData,
  } = props;

  const [isOpen, setIsOpen] = actionData?.openState ?? openState ?? [];
  const [isLoading, setIsLoading] =
    actionData?.loadingState ?? loadingState ?? [];

  if (!setIsOpen || !setIsLoading) {
    throw new Error(
      "LoadingAction: setIsOpen and setIsLoading are required in actionData or openState and loadingState.",
    );
  }

  const rotationValue = React.useRef(new Animated.Value(0)).current;
  const rotationAnimation = React.useRef<Animated.CompositeAnimation | null>(
    null,
  );

  React.useEffect(() => {
    if (isLoading && isOpen) {
      rotationAnimation.current = Animated.loop(
        Animated.timing(rotationValue, {
          toValue: 1,
          duration: 1000, // 1 second
          useNativeDriver: true, // For better performance
          easing: Easing.linear,
        }),
      );
      rotationAnimation.current.start();
    } else {
      rotationAnimation.current?.stop();

      setTimeout(() => {
        rotationValue.setValue(0); // Reset the animation
      }, 50);
    }

    return () => {
      rotationAnimation.current?.stop();
    };
  }, [isLoading, rotationValue, isOpen]);

  const rotateInterpolate = rotationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  function handleClose() {
    if (!isLoading) {
      onClose?.() ?? setIsOpen?.(false);
    }
  }

  return (
    <Actionsheet isOpen={isOpen} onClose={handleClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="p-8">
        <View
          style={{ height: 180 }}
          className="items-center justify-center gap-4"
        >
          {!isLoading ? (
            <>
              <Feather name="check" size={64} color={Colors.primary} />
              <Text className="text-zinc-700" w="medium">
                {actionData?.successMessage ?? successMessage}
              </Text>
            </>
          ) : (
            <>
              <Animated.View
                style={{ transform: [{ rotate: rotateInterpolate }] }}
              >
                <AntDesign name="loading2" size={64} color={Colors.primary} />
              </Animated.View>
              <Text className="text-zinc-700" w="medium">
                {actionData?.loadingMessage ?? loadingMessage}
              </Text>
            </>
          )}
        </View>
      </ActionsheetContent>
    </Actionsheet>
  );
}
