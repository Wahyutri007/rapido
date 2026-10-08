import { IMAGES } from "@/assets/images"
import Entypo from "@expo/vector-icons/Entypo"
import Constants from "expo-constants"
import { router } from "expo-router"
import React from "react"
import { Image, View } from "react-native"
import BouncyPressable from "@/components/common/BouncyPressable"

export default function Header({
  back = false,
}: {
  back?: boolean | (() => void);
}) {
  function handleBackPress() {
    if (typeof back === "function") {
      back();
      return;
    }
    
    if (router.canGoBack()) {
      router.back();
    }
  }

  return (
    <>
      <View
        className="bg-white"
        style={{ height: Constants.statusBarHeight }}
      />
      <View className="relative h-24 justify-center bg-white">
        <Image
          source={IMAGES.logo_256_transparent}
          className="mx-auto h-full"
          resizeMode="contain"
        />

        {back && (
          <BouncyPressable
            className="absolute left-6 size-10 items-center justify-center rounded-full"
            onPress={handleBackPress}
            ripple="borderless"
            hapticType="light"
          >
            <Entypo name="chevron-left" size={24} color="black" />
          </BouncyPressable>
        )}
      </View>
    </>
  );
}
