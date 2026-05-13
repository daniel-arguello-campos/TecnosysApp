export default {
    darkMode: "class",
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
            },
            colors: {
                ink: {
                    50: "#f7f8fb",
                    100: "#eef1f6",
                    500: "#667085",
                    700: "#344054",
                    900: "#111827",
                    950: "#07111f",
                },
                brand: {
                    50: "#ecfeff",
                    100: "#cffafe",
                    500: "#06b6d4",
                    600: "#0891b2",
                    700: "#0e7490",
                },
                accent: {
                    500: "#f59e0b",
                    600: "#d97706",
                },
            },
            boxShadow: {
                soft: "0 18px 45px rgba(15, 23, 42, 0.10)",
            },
        },
    },
    plugins: [],
};
