import { useState, useEffect } from 'react';

interface Preferences {
  vibrationEnabled: boolean;
  milestoneAlertsEnabled: boolean;
  activeDhikrId: number | null;
  currentCount: number; // Storing temporary count in case app reloads
}

const defaultPreferences: Preferences = {
  vibrationEnabled: true,
  milestoneAlertsEnabled: true,
  activeDhikrId: null,
  currentCount: 0,
};

export function usePreferences() {
  const [prefs, setPrefs] = useState<Preferences>(() => {
    try {
      const item = window.localStorage.getItem('tasbeeh_prefs');
      return item ? { ...defaultPreferences, ...JSON.parse(item) } : defaultPreferences;
    } catch (error) {
      return defaultPreferences;
    }
  });

  const updatePrefs = (newPrefs: Partial<Preferences>) => {
    setPrefs((prev) => {
      const updated = { ...prev, ...newPrefs };
      window.localStorage.setItem('tasbeeh_prefs', JSON.stringify(updated));
      return updated;
    });
  };

  return { prefs, updatePrefs };
}

// Utility to convert numbers to Arabic format
export function toArabicNumerals(num: number | string): string {
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().replace(/[0-9]/g, (w) => arabicNumbers[parseInt(w)]);
}
