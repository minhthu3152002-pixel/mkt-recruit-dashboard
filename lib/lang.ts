import { cookies } from "next/headers";
import type { Lang } from "./i18n";

// Đọc ngôn ngữ từ cookie (server). Client mirror sang localStorage + cookie.
// Dùng cookies() nên route thành dynamic — nhưng getDataset() vẫn được
// unstable_cache giữ 600s nên không bắn thêm request Sheets.
export function getLang(): Lang {
  return cookies().get("lang")?.value === "ko" ? "ko" : "vi";
}
