import Card from "@/components/common/Card";
import { EEntypo, EIonicons, StoreIcon } from "@/components/icons";
import {
  Button,
  ButtonGroup,
  ButtonIcon,
  ButtonText,
} from "@/components/ui/button";
import React from "react";

export default function Filters() {
  return (
    <Card className="flex-row gap-3">
      <ButtonGroup className="flex-1">
        <Button className="w-full justify-start" variant="muted">
          <ButtonIcon as={StoreIcon} size="sm" />
          <ButtonText>Semua Toko</ButtonText>
          <ButtonIcon
            as={EEntypo}
            name="chevron-down"
            size="sm"
            className="ml-auto"
          />
        </Button>
      </ButtonGroup>
      <ButtonGroup className="flex-1">
        <Button className="w-full justify-start" variant="muted">
          <ButtonIcon as={EIonicons} name="calendar-clear" size="sm" />
          <ButtonText>Hari Ini</ButtonText>
          <ButtonIcon
            as={EEntypo}
            name="chevron-down"
            size="sm"
            className="ml-auto"
          />
        </Button>
      </ButtonGroup>
    </Card>
  );
}