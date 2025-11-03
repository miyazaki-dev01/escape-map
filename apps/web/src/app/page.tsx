"use client";

import { useState } from "react";

type ApiResponse = {
  message: string;
  time: string;
};

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    setRes(null);

    try {
      const r = await fetch(`${apiBase}/test`, {
        method: "GET",
        cache: "no-store",
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const json = (await r.json()) as ApiResponse;
      setRes(json);
    } catch (e: any) {
      setError(e?.message ?? "unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
        API 疎通テスト
      </h1>

      <button
        onClick={handleClick}
        disabled={loading}
        style={{
          padding: "10px 16px",
          borderRadius: 8,
          border: "1px solid #ddd",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "取得中..." : "バックエンドからメッセージ取得"}
      </button>

      <div style={{ marginTop: 16 }}>
        {error && (
          <p style={{ color: "crimson" }}>
            エラー: <code>{error}</code>
          </p>
        )}
        {res && (
          <pre
            style={{
              background: "#f6f6f6",
              padding: 12,
              borderRadius: 8,
              overflowX: "auto",
            }}
          >
            {JSON.stringify(res, null, 2)}
          </pre>
        )}
      </div>
    </main>
  );
}
