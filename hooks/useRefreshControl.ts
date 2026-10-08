import React from "react";

/**
 * @description A custom hook to neatly manage refresh control state and behavior.
 * @param refetch A function that refetches data when called.
 * @returns
 */
export default function useRefreshControl(refetch: () => Promise<unknown>) {
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return {
    refreshing,
    onRefresh,
  };
}
