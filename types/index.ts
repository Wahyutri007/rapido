import React from "react";
import Svg from "react-native-svg";
import * as DocumentPicker from "expo-document-picker";
import { Href } from "expo-router";
import { ImageRequireSource } from "react-native";

export type State<T> = [T, React.Dispatch<React.SetStateAction<T>>];

export type IconProps = Omit<React.ComponentProps<typeof Svg>, "size" | "color"> & {
  size?: number | string;
  color?: string;
  className?: string;
};

// Existing uploaded assets may predate SDK 57's lastModified metadata.
export type SingleDocumentPickerResult = Omit<
  DocumentPicker.DocumentPickerAsset,
  "lastModified"
> & {
  lastModified?: number;
};

export type Nullable<T> = T | null | undefined;

export type AlertActionProps = {
  openState: State<boolean>;
  onConfirm?: () => void;
};

export type SelectItemProps<T = string> = {
  value: T;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: string;
  disabled?: boolean;
};
