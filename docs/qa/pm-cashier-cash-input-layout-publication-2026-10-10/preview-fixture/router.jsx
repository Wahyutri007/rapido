import React from "react";
import { Pressable } from "react-native";
export const router={replace:entry=>globalThis.__cashFixture.routes.push(entry),canGoBack:()=>true,back:()=>globalThis.__cashFixture.routes.push('back')};
export const useLocalSearchParams=()=>globalThis.__cashFixture.params;
export const useGlobalSearchParams=()=>globalThis.__cashFixture.params;
export const useIsFocused=()=>globalThis.__cashFixture.focused;
export const Link=props=><Pressable {...props}/>;
