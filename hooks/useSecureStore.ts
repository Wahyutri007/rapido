import React from "react"
import * as SecureStore from "@/lib/storage"

export default function useSecureStore<T>(key: string, defaultValue: T) {
  const [value, setValue] = React.useState<T>(defaultValue)

  React.useEffect(() => {
    async function loadValue() {
      try {
        const storedValue = await SecureStore.getItemAsync(key)
        if (storedValue) {
          setValue(JSON.parse(storedValue))
        }
      } catch (error) {
        console.error("Error loading value from SecureStore:", error)
      }
    }

    loadValue()
  }, [key])

  const saveValue = async (newValue: T) => {
    try {
      await SecureStore.setItemAsync(key, JSON.stringify(newValue))
      setValue(newValue)
    } catch (error) {
      console.error("Error saving value to SecureStore:", error)
    }
  }

  return [value, saveValue] as const
}

export function useSecureStoreState<T>(key: string, defaultValue: T) {
  const [value, setValue] = React.useState<T>(defaultValue);
  const isLoaded = React.useRef(false); // Track if the value has been loaded

  // Load the value from SecureStore on mount
  React.useEffect(() => {
    async function loadValue() {
      try {
        const storedValue = await SecureStore.getItemAsync(key);
        if (storedValue) {
          setValue(JSON.parse(storedValue));
        }
        isLoaded.current = true; // Mark as loaded
      } catch (error) {
        console.error("Error loading value from SecureStore:", error);
      }
    }

    if (!isLoaded.current) {
      loadValue();
    }
  }, [key]);

  // Save the value to SecureStore whenever it changes
  React.useEffect(() => {
    if (!isLoaded.current) return; // Avoid saving before the initial load

    async function saveValue() {
      try {
        await SecureStore.setItemAsync(key, JSON.stringify(value));
      } catch (error) {
        console.error("Error saving value to SecureStore:", error);
      }
    }

    saveValue();
  }, [key, value]);

  return [value, setValue] as const;
}