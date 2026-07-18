import type { Config } from "tailwindcss";

// Sistema de diseño "RetroVault":
// - Base casi negra (evita el típico near-black genérico usando un azul-carbón, no gris puro)
// - Acento primario: cian fósforo (pantalla CRT encendida)
// - Acento secundario: magenta arcade (para CTAs de compra / favoritos)
// - Ámbar para ratings y clasificaciones de edad
// - Tipografía: display condensada + mono "terminal" para metadatos (etiqueta de cartucho)
const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        carbon: {
          950: "#080A10",
          900: "#0B0E14",
          800: "#12161F",
          700: "#1A2030",
          600: "#252C40",
        },
        phosphor: {
          DEFAULT: "#5EEAD4",
          soft: "#A7F3EA",
          dim: "#1F4A45",
        },
        arcade: {
          DEFAULT: "#FF3D7E",
          dim: "#4A1530",
        },
        amber: {
          DEFAULT: "#F2B84B",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: {
        scanlines:
          "repeating-linear-gradient(0deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 1px, transparent 1px, transparent 3px)",
        "cartridge-glow":
          "radial-gradient(circle at top left, rgba(94,234,212,0.12), transparent 60%)",
      },
      boxShadow: {
        "phosphor-glow": "0 0 0 1px rgba(94,234,212,0.25), 0 0 24px rgba(94,234,212,0.15)",
        "arcade-glow": "0 0 0 1px rgba(255,61,126,0.3), 0 0 24px rgba(255,61,126,0.18)",
      },
      borderRadius: {
        cartridge: "0.375rem 0.375rem 0.125rem 0.125rem",
      },
    },
  },
  plugins: [],
};

export default config;
