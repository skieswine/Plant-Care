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
  background: '#D4E5C9',      // Clearly green sage/eucalyptus backdrop
  surface: '#E4F0DA',         // Green-tinted cards (NOT white) — distinct from light theme
  surfaceSecondary: '#C7DCB6',// Deeper sage highlight
  surfaceTertiary: '#B2CE9C', // Mossy separations
  primary: '#256B47',         // Rich forest green
  primaryLight: '#3FA66B',    // Fresh leaf green
  primaryDark: '#163F2A',     // Deep pine
  text: '#13251A',            // Deep forest charcoal
  textSecondary: '#395344',   // Mossy gray-green
  textMuted: '#6C8A6F',       // Soft sage
  border: '#AEC99A',          // Natural moss border
  borderLight: '#C7DCB6',     // Sage separator
  tabBar: '#E4F0DA',          // Green-tinted tabbar
  header: '#D4E5C9',          // Header matching screen
  urgent: '#CE4A36',          // Earthy terracotta red
  warning: '#D88E26',         // Warm honey amber
  shelf: '#B98C57',           // Natural walnut wood
  shelfBorder: '#8F6A3D',      // Wood shadow
  shelfSupport: '#6E4F2A',    // Dark wood bracket
  inputBg: '#F1F8EA',         // Soft green-white input
  chipBg: '#C7DCB6',          // Sage chip background
  chipActiveBg: '#256B47',    // Forest active chip
  modalOverlay: 'rgba(19,37,26,0.4)', // Mossy dim
};
