import { NextResponse } from "next/server";
import { debugMarketingTabs } from "@/lib/sheets";

// Route DEBUG tạm: dò dữ liệu thô các tab Marketing (header + 3 dòng đầu / lỗi đọc).
// Dùng: /api/debug-sheets?key=debug  — xoá file này sau khi soi xong.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  const key = new URL(req.url).searchParams.get("key");
  if (key !== "debug") {
    return NextResponse.json({ error: "thêm ?key=debug để chạy" }, { status: 401 });
  }
  try {
    const data = await debugMarketingTabs();
    return NextResponse.json(data, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? String(e) }, { status: 500 });
  }
}
