// export const API = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:5255";
export const API = process.env.EXPO_PUBLIC_API_URL && process.env.EXPO_PUBLIC_API_URL.length > 0
  ? process.env.EXPO_PUBLIC_API_URL
  : "http://localhost:5255";
