// constants/theme.ts
export type ThemeColors = {
  background: string;
  surface: string;
  surfaceSecondary: string;
  surfaceTertiary: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderLight: string;
  tabBar: string;
  header: string;
  urgent: string;
  warning: string;
  shelf: string;
  shelfBorder: string;
  shelfSupport: string;
  inputBg: string;
  chipBg: string;
  chipActiveBg: string;
  modalOverlay: string;
};

export const lightTheme: ThemeColors = {
  background: '#FAFBF9',      // Softer stone/cream with sage undertone
  surface: '#FFFFFF',         // Crisp clean white cards
  surfaceSecondary: '#F1F6F3',// Soft sage green highlights
  surfaceTertiary: '#E5EDE8', // Natural light moss borders
  primary: '#1B4D3E',         // Deep forest green accent
  primaryLight: '#2ECC71',    // Vibrant organic green
  primaryDark: '#0F2C23',     // Very dark green
  text: '#0D1F1A',            // Deep charcoal with green hue
  textSecondary: '#4A5D57',   // Organic gray-green
  textMuted: '#8E9E99',       // Soft dust sage
  border: '#DFE5E1',          // Clean light borders
  borderLight: '#EDF1EE',     // Very thin separator lines
  tabBar: '#FFFFFF',          // Clean tabbar
  header: '#FAFBF9',          // Header background matching screen
  urgent: '#E63946',          // Premium crimson red
  warning: '#FFB703',         // Warm organic amber
  shelf: '#C59B62',           // Natural warm walnut wood
  shelfBorder: '#9C733E',      // Wood texture shadow
  shelfSupport: '#7D592C',    // Cast iron or dark wood bracket
  inputBg: '#FFFFFF',         // Clean input field
  chipBg: '#F1F6F3',          // Soft background for secondary chips
  chipActiveBg: '#1B4D3E',    // Selected chip background
  modalOverlay: 'rgba(13,31,26,0.3)', // Soft dimming shadow
};

export const darkTheme: ThemeColors = {
  background: '#090D0A',      // Obsidian forest dark
  surface: '#111713',         // Slate dark green surface cards
  surfaceSecondary: '#19221C',// Highlight elements in dark cards
  surfaceTertiary: '#222F27', // Subtle dark card separations
  primary: '#34D399',         // Glowing emerald mint
  primaryLight: '#6EE7B7',    // Light mint
  primaryDark: '#059669',     // Deeper mint green
  text: '#ECFDF5',            // Soft bright off-white mint
  textSecondary: '#8E9E99',   // Light dust sage
  textMuted: '#4E5F5A',       // Dim charcoal sage
  border: '#223027',          // Slate organic dark border
  borderLight: '#151E19',     // Thin dark separation
  tabBar: '#111713',          // Flat dark tabbar
  header: '#090D0A',          // Dark header matching screen
  urgent: '#F87171',          // Coral pink-red
  warning: '#FBBF24',         // Warm sun amber
  shelf: '#8C6239',           // Rich walnut wood
  shelfBorder: '#604324',      // Deep wood outline
  shelfSupport: '#4A321A',    // Iron support
  inputBg: '#111713',         // Dark inputs
  chipBg: '#19221C',          // Slate dark chips
  chipActiveBg: '#34D399',    // Glowing mint active chip
  modalOverlay: 'rgba(0,0,0,0.65)', // Deep shadow modal backdrop
};
