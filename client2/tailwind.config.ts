// Phụ trách phần tinh gọn: Tân. Chỉ quét các trang và component còn dùng.
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  plugins: [],
};

export default config;
