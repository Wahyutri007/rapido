import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import CardList, {
  CardListGap,
  CardListGroup,
  CardListItem,
  CardListSeparator,
  CardListTitle,
} from "@/components/custom/CardList";
import { Input, InputField } from "@/components/ui/input";
import React from "react";
import { View } from "react-native";

function ShiftDetails() {
  return (
    <CardList>
      <CardListTitle title="Detail Shift" />
      <CardListItem label="Toko" value="Warung Jomblo" />
      <CardListItem label="Karyawan" value="Ari Ariani" />
      <CardListItem label="Jabatan" value="Merchant Admin" />
      <CardListItem label="Mulai Shift" value="11 Maret 2026 - 13.14" />
      <CardListItem label="Item Terjual" value="3" />
      <CardListItem label="Tambahan yang terjual" value="0" />
      <CardListItem label="Pengembalian Item" value="0" />
      <CardListItem label="Pengembalian Tambahan" value="0" />
      <CardListGap />
    </CardList>
  );
}

function CashManagement() {
  return (
    <CardList>
      <CardListTitle title="Manajemen Kas Tunai" />
      <CardListItem label="Kas Awal" value="Rp 200.000" />
      <CardListItem label="Pemasukan" value="Rp 200.000" />
      <CardListItem label="Pemasukan Lainnya" value="Rp 200.000" />
      <CardListItem label="Pengeluaran" value="Rp 200.000" />
      <CardListItem label="Kas Akhir" value="Rp 135.000">
        Rp 135.000
      </CardListItem>
      <View className="flex-row items-center justify-between">
        <Text className="p-4 text-xs text-zinc-800" w="medium">
          Uang Tunai di Kas
        </Text>
        <View className="w-1/2 pr-4">
          <Input size="sm" variant="outline" className="pl-0">
            <InputField
              size="2xs"
              className="text-xs"
              placeholder="Rp. 50.000"
            />
          </Input>
        </View>
      </View>
      <CardListItem label="Selisih" value="Rp 10.000" important />

      <CardListGap />
    </CardList>
  );
}

function SoldItem() {
  return (
    <CardList className="gap-5">
      <CardListTitle title="Item Terjual" />

      <CardListGroup className="gap-2">
        <CardListItem label="Makanan" important />
        <CardListItem label="Ayam Geprek (1)" value="Rp 20.000" />
        <CardListItem label="Ayam; Kambin Dada BBQ (2)" value="Rp 56.000" />
      </CardListGroup>

      <CardListGroup className="gap-2">
        <CardListItem label="Minuman" important />
        <CardListItem label="Minuman (1)" value="Rp 20.000" />
      </CardListGroup>

      <CardListGroup className="gap-2">
        <CardListItem label="Pengembalian" important />
        <CardListItem
          label="Ayam Geprek (1)"
          value="-Rp 20.000"
          variant="negative"
        />
      </CardListGroup>

      <CardListGap />
    </CardList>
  );
}

function SoldExtras() {
  return (
    <CardList className="gap-5">
      <CardListTitle title="Tambahan Terjual" />

      <CardListGroup className="gap-2">
        <CardListItem label="Add On" important />
        <CardListItem label="Telur (1)" value="Rp 5.000" />
        <CardListItem label="Nasi Putih (2)" value="Rp 7.000" />
      </CardListGroup>

      <CardListGroup className="gap-2">
        <CardListItem label="Saus" important />
        <CardListItem label="Minuman (1)" value="Rp 20.000" />
      </CardListGroup>

      <CardListGroup className="gap-2">
        <CardListItem label="Pengembalian" important />
        <CardListItem
          label="Cream Cheese (2)"
          value="-Rp 20.000"
          variant="negative"
        />
      </CardListGroup>

      <CardListGap />
    </CardList>
  );
}

function ExtraCosts() {
  return (
    <CardList>
      <CardListTitle title="Biaya Tambahan & Pajak" />

      <CardListItem label="Biaya Tambahan" important />
      <CardListItem label="Service (2%)" value="Rp 20.000" />

      <CardListGap className="-my-1" />

      <CardListItem label="Pajak" important />
      <CardListItem label="PPN (12%)" value="Rp 20.000" />

      <CardListGap />
    </CardList>
  );
}

function Discounts() {
  return (
    <CardList>
      <CardListTitle title="Potongan" />
      <CardListItem label="Diskon" important />
      <CardListItem label="Diskon VVIP (100%)" value="-Rp 20.000" />
      <CardListItem label="Total Diskon" value="-Rp 20.000" important />

      <CardListGap className="-my-1" />

      <CardListItem label="Promo" important />
      <CardListItem label="Promo Akhir Tahun (2)" value="-Rp 20.000" />
      <CardListItem label="Total Promo" value="-Rp 20.000" important />

      <CardListGap className="-my-1" />

      <CardListItem label="Voucher" important />
      <CardListItem label="Voucher A" value="-Rp 10.000" />
      <CardListItem label="Voucher B" value="-Rp 10.000" />
      <CardListItem label="Total Voucher" value="-Rp 10.000" important />

      <CardListGap />
    </CardList>
  );
}

function OrderType() {
  return (
    <CardList>
      <CardListTitle title="Rincian Tipe Pesanan" />
      <CardListItem label="Dine In" value="Rp 350.000" important />
      <CardListSeparator />
      <CardListItem label="Take Away" value="Rp 350.000" important />
      <CardListSeparator />
      <CardListItem label="Delivery" value="Rp 350.000" important />
      <CardListGap />
    </CardList>
  );
}

function PaymentMethod() {
  return (
    <CardList>
      <CardListTitle title="Metode Pembayaran" />

      <CardListItem label="Tunai" important />
      <CardListItem label="Penjualan" value="Rp 35.000" />
      <CardListItem label="Pengembalian" value="-Rp 10.000" />
      <CardListItem label="Total" value="Rp 20.000" important />

      <CardListGap className="my-0" />

      <CardListItem label="QRIS" important />
      <CardListItem label="Penjualan" value="Rp 35.000" />
      <CardListItem label="Pengembalian" value="-Rp 10.000" />
      <CardListItem label="Total" value="Rp 20.000" important />

      <CardListSeparator />

      <CardListItem
        label="Total Transaksi"
        value="+Rp 79.000"
        variant="positive"
        important
      />

      <CardListGap />
    </CardList>
  );
}

export default function ShiftReportScreen() {
  return (
    <Wrapper className="bg-white">
      <View className="gap-6 px-4 py-6">
        <ShiftDetails />
        <CashManagement />
        <SoldItem />
        <SoldExtras />
        <ExtraCosts />
        <Discounts />
        <OrderType />
        <PaymentMethod />
      </View>
    </Wrapper>
  );
}
