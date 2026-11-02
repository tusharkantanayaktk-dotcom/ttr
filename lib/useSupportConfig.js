"use client";

import { useState, useEffect } from "react";
import { SUPPORT_CONFIG, formatSupportConfig } from "@/lib/config";

let cachedConfig = null;
let fetchPromise = null;
const listeners = new Set();

function fetchConfig() {
  if (fetchPromise) return fetchPromise;

  fetchPromise = fetch("/api/support-config")
    .then((res) => res.json())
    .then((json) => {
      if (json?.success && json?.data) {
        cachedConfig = formatSupportConfig(json.data);
        listeners.forEach((listener) => listener(cachedConfig));
      }
      return cachedConfig;
    })
    .catch((err) => {
      console.error("Failed to fetch support config:", err);
      return cachedConfig || SUPPORT_CONFIG;
    })
    .finally(() => {
      fetchPromise = null;
    });

  return fetchPromise;
}

export function updateSupportConfigCache(newValues) {
  const formatted = formatSupportConfig(newValues);
  cachedConfig = formatted;
  listeners.forEach((listener) => listener(formatted));
}

export function useSupportConfig() {
  const [config, setConfig] = useState(cachedConfig || SUPPORT_CONFIG);

  useEffect(() => {
    // If cache was already populated by another component, sync immediately
    if (cachedConfig) {
      setConfig(cachedConfig);
    }

    const listener = (newConfig) => {
      setConfig(newConfig);
    };

    listeners.add(listener);

    // Fetch latest config from server
    fetchConfig();

    return () => {
      listeners.delete(listener);
    };
  }, []);

  return config;
}

export default useSupportConfig;
