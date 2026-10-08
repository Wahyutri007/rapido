import React from "react";

const ContainerSizingContext = React.createContext<
  | {
      containers: Record<string, number>;
      setContainer: (key: string, width: number) => void;
    }
  | undefined
>(undefined);

export function useContainerSizing() {
  const context = React.useContext(ContainerSizingContext);
  if (!context) {
    throw new Error(
      "useContainerSizing must be used within a ContainerSizingProvider",
    );
  }
  return context;
}

export default function ContainerSizingProvider({
  children,
}: React.PropsWithChildren) {
  const [containers, setContainers] = React.useState<Record<string, number>>(
    {},
  );

  const setContainer = React.useCallback((key: string, width: number) => {
    setContainers((prev) => ({
      ...prev,
      [key]: width,
    }));
  }, []);

  return (
    <ContainerSizingContext.Provider value={{ containers, setContainer }}>
      {children}
    </ContainerSizingContext.Provider>
  );
}
