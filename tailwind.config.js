/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        // Noto Sans KR를 사용할 계획이면 expo-font로 로딩 후 여기 이름을 맞춰줍니다.
        sans: ["NotoSansKR", "System"],
      },
      colors: {
        // light
        background: "#ffffff",
        foreground: "#131313", // oklch(0.145 0 0) 근사
        card: "#ffffff",
        "card-foreground": "#131313",
        popover: "#ffffff",
        "popover-foreground": "#131313",
        primary: "#030213",
        "primary-foreground": "#ffffff",
        secondary: "#f2f2f7", // oklch(0.95 0.0058 264.53) 근사
        "secondary-foreground": "#030213",
        muted: "#ececf0",
        "muted-foreground": "#717182",
        accent: "#e9ebef",
        "accent-foreground": "#030213",
        destructive: "#d4183d",
        "destructive-foreground": "#ffffff",
        border: "rgba(0,0,0,0.1)",
        input: "transparent",
        "input-background": "#f3f3f5",
        "switch-background": "#cbced4",
        ring: "#b5b5b5",
        // dark
        // NativeWind는 다크 토큰을 별도 색상으로 만들거나, 다크 상태에서만 쓰는 클래스로 분기합니다.
        // 필요 시 'background-dark' 같은 별도 키로 확장해두고 dark: 프리픽스로 사용해도 됩니다.
      },
      borderRadius: {
        md: "10px", // var(--radius)=0.625rem
      },
    },
  },
  plugins: [],
};
