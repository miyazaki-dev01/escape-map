import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/:path*"],
};

export default function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const user = process.env.BASIC_AUTH_USERNAME || "";
  const pass = process.env.BASIC_AUTH_PASSWORD || "";

  // dev ドメインは素通し（例: dev.escape-map.jp）
  if (host.startsWith("dev.")) return NextResponse.next();

  // Basic認証が有効でない場合はスキップ
  if (process.env.PROTECT_BASIC !== "true") return NextResponse.next();

  // 環境変数の設定がない場合はスキップ
  if (!user || !pass) return NextResponse.next();

  // Basic認証のチェック
  const basicAuth = req.headers.get("authorization");
  if (basicAuth) {
    const authValue = basicAuth.split(" ")[1];
    const [basicUser, basicPass] = atob(authValue).split(":");

    if (basicUser === user && basicPass === pass) {
      return NextResponse.next();
    }
  }

  // Basic認証に失敗した場合は401を返す
  return new NextResponse("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Secure Area"',
    },
  });
}
