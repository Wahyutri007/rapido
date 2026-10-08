import {
  Form,
  FormControl,
  FormField,
  FormInput,
  FormItem,
  FormLabel,
  FormMessage,
  FormSelect,
  SelectItemProps,
} from "@/components/common/Form";
import Text from "@/components/common/Text";
import { Button, ButtonGroup, ButtonText } from "@/components/ui/button";
import { STORE_ITEMS } from "@/constants/data/manage/store";
import { ChooseStoreSchema, chooseStoreSchema } from "@/schema/choose-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useGlobalSearchParams } from "expo-router";
import React from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";

function ChooseStoreView() {
  const form = useForm({
    resolver: zodResolver(chooseStoreSchema),
  });

  const [storeList, setStoreList] = React.useState<SelectItemProps[]>([]);

  React.useEffect(() => {
    // * Simulate fetching store list
    const stores = STORE_ITEMS;

    setStoreList(
      stores.map((store) => ({
        value: store.id,
        label: store.name,
      })),
    );
  }, []);

  function handleSubmit(data: ChooseStoreSchema) {
    router.replace("/home");

    // router.push({
    //   pathname: "/choose-store/pin",
    //   params: {
    //     storeId: data.store,
    //   },
    // });
  }

  return (
    <View className="grow px-8 pb-8 pt-5">
      <Form {...form}>
        <FormField
          control={form.control}
          name="store"
          render={() => (
            <FormItem>
              <FormLabel>Toko</FormLabel>
              <FormControl>
                <FormSelect data={storeList} placeholder="Pilih Toko" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </Form>
      <ButtonGroup className="mt-auto">
        <Button size="xl" onPress={form.handleSubmit(handleSubmit)}>
          <ButtonText size="md">Pilih Toko</ButtonText>
        </Button>
      </ButtonGroup>
    </View>
  );
}

function AddStoreView() {
  function handleCreateStore() {
    router.push("/choose-store/create");
  }

  return (
    <View className="grow items-center justify-center">
      <View className="items-center">
        <Text className="text-gray-900" w="semibold">
          Daftar toko belum ada
        </Text>
        <Text className="mt-4 text-xs text-muted">
          Yah, toko-mu belum terdaftar sama sekali
        </Text>
        <ButtonGroup className="mt-6">
          <Button size="xl" variant="outline" onPress={handleCreateStore}>
            <ButtonText size="md">Buat Toko</ButtonText>
          </Button>
        </ButtonGroup>
      </View>
    </View>
  );
}

export default function ChooseStoreScreen() {
  const params = useGlobalSearchParams();

  const [isStoreAdded, setIsStoreAdded] = React.useState(false);

  React.useEffect(() => {
    // * Simulate a store got added

    if (params?.storeId) {
      setIsStoreAdded(true);
    }
  }, [params]);

  function handleSelectStore() {}

  return (
    <View className="grow bg-white">
      {!isStoreAdded ? <AddStoreView /> : <ChooseStoreView />}
    </View>
  );
}
