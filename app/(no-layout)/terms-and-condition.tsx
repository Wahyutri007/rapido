import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import { Button, ButtonGroup } from "@/components/ui/button";
import { useRegistrationStore } from "@/store/registration";
import { route } from "@/lib/utils";
import { router } from "expo-router";
import React from "react";
import { View } from "react-native";
import Markdown from "react-native-markdown-display";
import { OTHER_ASSETS } from "@/assets/other";
// import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";

export default function TermsAndConditionScreen() {
  const setTncAccepted = useRegistrationStore((state) => state.setTncAccepted);
  const [content, setContent] = React.useState("");

  React.useEffect(() => {
    async function loadTerms() {
      // try {
      //   const asset = Asset.fromModule(OTHER_ASSETS.tnc);
      //   await asset.downloadAsync();
      //   if (asset.localUri) {
      //     const text = await FileSystem.readAsStringAsync(asset.localUri);
      //     setContent(text);
      //   }
      // } catch (error) {
      //   console.error("Failed to load terms:", error);
      // }
    }

    loadTerms();
  }, []);

  function handleAccept() {
    setTncAccepted(true);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(route("/register/wizard"));
    }
  }

  return (
    <>
      <Wrapper hasActionButton>
        <View className="grow p-8">
          <Markdown>{content}</Markdown>
        </View>
      </Wrapper>

      <ButtonGroup className="absolute bottom-8 w-full px-8">
        <Button size="xl" onPress={handleAccept}>
          <Text className="text-base text-white" w="semibold">
            Setuju
          </Text>
        </Button>
      </ButtonGroup>
    </>
  );
}
