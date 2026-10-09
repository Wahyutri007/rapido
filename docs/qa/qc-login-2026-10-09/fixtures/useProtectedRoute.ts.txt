import { useAuth } from "@/context/AuthContext";
import { useSegments, router } from "expo-router";
import React from "react";

const PUBLIC_ROUTES = ["maintenance", "terms-and-condition"];

export function useProtectedRoute() {
  const { authenticated, isLoading } = useAuth();
  const rawSegments = useSegments();
  const segments = rawSegments as string[];

  React.useEffect(() => {
    if (isLoading) return;

    // Check if we are in onboarding group or specific public route
    const isOnboarding = segments.some(
      (s) =>
        s === "(onboarding)" ||
        s === "login" ||
        s === "onboarding" ||
        s === "register" ||
        s === "otp" ||
        s === "forgot-password" ||
        s === "reset-password" ||
        s === "choose-store",
    );

    const inPublicGroup =
      isOnboarding || segments.some((segment) => PUBLIC_ROUTES.includes(segment));

    // Also allow index route to handle its own redirection logic
    const isIndex =
      segments.length === 0 ||
      (segments.length === 1 && segments[0] === "index");

    if (authenticated && inPublicGroup) {
      // If user is signed in and trying to access auth routes, redirect to home
      if (isOnboarding) {
        requestAnimationFrame(() => {
          router.replace("/(back-office)/home");
        });
      }
    } else if (!authenticated && !inPublicGroup && !isIndex) {
      // If user is not signed in and trying to access protected routes, redirect to login
      requestAnimationFrame(() => {
        router.replace("/(onboarding)/login");
      });
    }
  }, [authenticated, segments, isLoading]);
}
