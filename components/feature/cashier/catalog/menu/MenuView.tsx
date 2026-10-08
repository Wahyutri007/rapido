import Text from "@/components/common/Text";
import { CardListSeparator } from "@/components/custom/CardList";
import { CATEGORY_ITEMS } from "@/constants/data/category";
import { useContainerSizing } from "@/context/ContainerSizingContext";
import useSearchParamState from "@/hooks/useSearchParamState";
import { cn } from "@/lib/utils";
import { MenuItemProps } from "@/types/ui/add/menu";
import React from "react";
import { FlatList, View } from "react-native";
import { MenuItemGrid, MenuItemList } from "./MenuItem";

type MenuItemViewProps = {
  data?: MenuItemProps[] | null;
  defaultView?: "popular" | "all";
  layout?: "grid" | "list";
};

type LayoutViewProps = {
  filteredData?: MenuItemProps[] | null;
  search?: string;
  category?: string;
};

function GridView({ filteredData, search, category }: LayoutViewProps) {
  return filteredData && filteredData.length > 0 ? (
    filteredData.map((item, index) => (
      <MenuItemGrid key={index} index={index} data={item} />
    ))
  ) : search || category ? (
    <Text className="mx-auto text-center text-sm">
      Tidak ada produk yang ditemukan
    </Text>
  ) : (
    <Text className="mx-auto text-center">
      Silahkan cari produk yang ingin dipesan
    </Text>
  );
}

function ListView({ filteredData, search, category }: LayoutViewProps) {
  return filteredData && filteredData.length > 0 ? (
    <FlatList
      data={filteredData}
      keyExtractor={(item) => item.id}
      scrollEnabled={false}
      renderItem={({ item, index }) => (
        <MenuItemList key={index} index={index} data={item} />
      )}
      ItemSeparatorComponent={() => <CardListSeparator className="my-4" />}
    />
  ) : search || category ? (
    <Text className="mx-auto text-center text-sm">
      Tidak ada produk yang ditemukan
    </Text>
  ) : (
    <Text className="mx-auto text-center">
      Silahkan cari produk yang ingin dipesan
    </Text>
  );
}

export default function MenuView(props: MenuItemViewProps) {
  const { data, defaultView = "all", layout = "grid" } = props;

  const [search] = useSearchParamState("search", "");
  const [category] = useSearchParamState("category", "Semua");

  const { containers, setContainer } = useContainerSizing();

  const filteredData = data?.filter((item) => {
    if (defaultView === "popular" && search === "") {
      return item.popular;
    }

    if (category !== "Semua") {
      const categoryId = CATEGORY_ITEMS.find(
        (cat) => cat.name === category,
      )?.id;

      return item.category_id === categoryId;
    }

    return item.name.toLowerCase().includes(search?.toLowerCase() ?? "");
  });

  return (
    <View
      className={cn("flex-1", {
        "flex-row flex-wrap": layout === "grid",
      })}
      onLayout={(e) => setContainer("menu", e.nativeEvent.layout.width)}
    >
      {layout === "grid" ? (
        <GridView
          filteredData={filteredData}
          search={search}
          category={category}
        />
      ) : (
        <ListView
          filteredData={filteredData}
          search={search}
          category={category}
        />
      )}
    </View>
  );
}
