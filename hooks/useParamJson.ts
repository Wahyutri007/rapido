import { useLocalSearchParams } from "expo-router"

export function useParamJson<T>(param: string): T | null {
  const params = useLocalSearchParams()

  try {
    const parsed = JSON.parse(params[param] as string) as T
    return parsed
  } catch (error) {
    return null
  }
}