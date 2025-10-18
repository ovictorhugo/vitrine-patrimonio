export function getVersion() {
    return import.meta.env.VITE_APP_VERSION || "Unknown Version";
  }