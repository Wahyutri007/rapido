import Text from "@/components/common/Text";
import OfferList from "@/components/feature/cart/OfferList";
import { Button, ButtonGroup, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { OFFER_ITEMS } from "@/constants/data/offer";
import useCustomRouter from "@/hooks/useCustomRouter";
import useSearchParamState from "@/hooks/useSearchParamState";
import { Nullable } from "@/types";
import React from "react";
import { View } from "react-native";

export default function OfferScreen() {
  const { params, replaceWithParams } = useCustomRouter();

  return (
    <View className="grow bg-zinc-50">
      <View className="px-5 pt-5">
        <Input size="xl" variant="outline">
          <InputField placeholder="Masukkan promo atau kode promo di sini" />
        </Input>
      </View>
      <View className="mt-3">
        <OfferList data={OFFER_ITEMS} />
      </View>
      <ButtonGroup className="mt-auto px-5 pb-5">
        <Button size="xl" onPress={() => replaceWithParams("/cart")}>
          <ButtonText size="md">
            {params?.selectedOffer ? "Gunakan" : "Lanjutkan Tanpa Penawaran"}
          </ButtonText>
        </Button>
      </ButtonGroup>
    </View>
  );
}
