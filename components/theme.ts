// Token màu dùng chung cho chart + badge + icon (chỉ phần nhìn, không đụng logic).
export const PINK = "#ec2c69";
export const BLUE = "#2f6bff";

export const CHANNEL_COLOR: Record<string, string> = {
  meta: "#2f6bff",
  linkedin: "#0a66c2",
  itviec: "#ec2c69",
  topdev: "#f97316",
  free: "#22c55e",
};
export const chColor = (ch: string) => CHANNEL_COLOR[ch] ?? "#2f6bff";

// Gradient tròn cho icon thẻ KPI
export type Tone = "pink" | "blue" | "green" | "orange";
export const TONE_GRADIENT: Record<Tone, string> = {
  pink: "linear-gradient(135deg,#ff5b8f 0%,#ec2c69 100%)",
  blue: "linear-gradient(135deg,#5b8bff 0%,#2f6bff 100%)",
  green: "linear-gradient(135deg,#4ade80 0%,#16a34a 100%)",
  orange: "linear-gradient(135deg,#fdba74 0%,#f97316 100%)",
};
