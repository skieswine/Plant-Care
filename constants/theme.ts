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

// Cool neutral "night" dark — intentionally NOT green-tinted, so it reads
// clearly as night mode and stays distinct from the warm-green nature theme.
export const darkTheme: ThemeColors = {
  background: '#0B0F12',      // Cool near-black charcoal
  surface: '#151A1E',         // Neutral slate surface cards
  surfaceSecondary: '#1E252A',// Highlight elements in dark cards
  surfaceTertiary: '#2A333A', // Subtle dark card separations
  primary: '#34D399',         // Glowing emerald mint accent (brand)
  primaryLight: '#6EE7B7',    // Light mint
  primaryDark: '#059669',     // Deeper mint green
  text: '#ECF1F4',            // Cool soft off-white
  textSecondary: '#94A1A8',   // Cool slate gray
  textMuted: '#566169',       // Dim slate
  border: '#2A343B',          // Neutral slate border
  borderLight: '#1A2126',     // Thin dark separation
  tabBar: '#151A1E',          // Flat dark tabbar
  header: '#0B0F12',          // Dark header matching screen
  urgent: '#F87171',          // Coral pink-red
  warning: '#FBBF24',         // Warm sun amber
  shelf: '#8C6239',           // Rich walnut wood
  shelfBorder: '#604324',      // Deep wood outline
  shelfSupport: '#4A321A',    // Iron support
  inputBg: '#151A1E',         // Dark inputs
  chipBg: '#1E252A',          // Slate dark chips
  chipActiveBg: '#34D399',    // Glowing mint active chip
  modalOverlay: 'rgba(0,0,0,0.65)', // Deep shadow modal backdrop
};

// Warm, organic light-green theme — a "natural" feel distinct from the
// crisp white light theme and the cool dark theme.
export const natureTheme: ThemeColors = {
  background: '#EAF2E6',      // Soft moss green
  surface: '#F6FAF3',         // Warm off-white with green tint
  surfaceSecondary: '#DEEAD7',// Sage highlight
  surfaceTertiary: '#CCDFC3', // Deeper moss separations
  primary: '#2E6B4F',         // Rich forest green
  primaryLight: '#3FA66B',    // Fresh leaf green
  primaryDark: '#1C4633',     // Deep pine
  text: '#16271C',            // Deep forest charcoal
  textSecondary: '#3D5446',   // Mossy gray-green
  textMuted: '#7B927F',       // Soft sage
  border: '#CFE0C6',          // Natural moss border
  borderLight: '#DEEAD7',     // Thin sage separator
  tabBar: '#F6FAF3',          // Warm tabbar
  header: '#EAF2E6',          // Header matching screen
  urgent: '#D7503E',          // Earthy terracotta red
  warning: '#E0992E',         // Warm honey amber
  shelf: '#B98C57',           // Natural walnut wood
  shelfBorder: '#8F6A3D',      // Wood shadow
  shelfSupport: '#6E4F2A',    // Dark wood bracket
  inputBg: '#FFFFFF',         // Clean input field
  chipBg: '#DEEAD7',          // Sage chip background
  chipActiveBg: '#2E6B4F',    // Forest active chip
  modalOverlay: 'rgba(22,39,28,0.35)', // Soft mossy dim
};
