"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

// API /api/test-message の戻り値
type ApiResponse = { message: string; time: string };

// health_checks の1行
type HealthRow = {
  id: string;
  status: string;
  note: string | null;
  created_at: string; // ISO 文字列
};

// JST表示用
const fmtJst = (iso?: string) =>
  iso
    ? new Intl.DateTimeFormat("ja-JP", {
        timeZone: "Asia/Tokyo",
        dateStyle: "medium",
        timeStyle: "medium",
      }).format(new Date(iso))
    : "";

export default function Home() {
  // 1) APIメッセージ
  const [msgLoading, setMsgLoading] = useState(false);
  const [msgRes, setMsgRes] = useState<ApiResponse | null>(null);
  const [msgErr, setMsgErr] = useState<string | null>(null);

  // 2) フロント直で Supabase 参照
  const [sbLoading, setSbLoading] = useState(false);
  const [sbRow, setSbRow] = useState<HealthRow | null>(null);
  const [sbErr, setSbErr] = useState<string | null>(null);

  // 3) API 経由で Supabase 参照
  const [apiSbLoading, setApiSbLoading] = useState(false);
  const [apiSbRow, setApiSbRow] = useState<HealthRow | null>(null);
  const [apiSbErr, setApiSbErr] = useState<string | null>(null);

  // 1) APIの疎通（/api/test-message -> rewrites で Go API へ）
  const getApiMessage = async () => {
    setMsgLoading(true);
    setMsgErr(null);
    setMsgRes(null);
    try {
      const r = await fetch("/api/test-message", { cache: "no-store" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setMsgRes((await r.json()) as ApiResponse);
    } catch (e: any) {
      setMsgErr(e?.message ?? "unknown error");
    } finally {
      setMsgLoading(false);
    }
  };

  // 2) フロント直で Supabase から最新1件を取得
  const getSupabaseDirect = async () => {
    setSbLoading(true);
    setSbErr(null);
    setSbRow(null);
    try {
      const { data, error } = await supabase
        .from("health_checks")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1);
      if (error) throw error;
      setSbRow(data?.[0] ?? null);
      if (!data?.[0]) setSbErr("データが見つかりませんでした");
    } catch (e: any) {
      setSbErr(e?.message ?? "unknown error");
    } finally {
      setSbLoading(false);
    }
  };

  // 3) API 経由で Supabase から最新1件を取得
  const getSupabaseViaApi = async () => {
    setApiSbLoading(true);
    setApiSbErr(null);
    setApiSbRow(null);
    try {
      const r = await fetch("/api/supabase-health", { cache: "no-store" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setApiSbRow((await r.json()) as HealthRow);
    } catch (e: any) {
      setApiSbErr(e?.message ?? "unknown error");
    } finally {
      setApiSbLoading(false);
    }
  };

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 40 }}>
        疎通テスト
      </h1>

      {/* 1) APIメッセージ */}
      <section style={{ marginBottom: 50 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>
          API（/api/test-message）
        </h2>
        <button
          onClick={getApiMessage}
          disabled={msgLoading}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "1px solid #ddd",
            cursor: msgLoading ? "not-allowed" : "pointer",
          }}
        >
          {msgLoading ? "取得中..." : "API からメッセージ取得"}
        </button>
        <div style={{ marginTop: 12 }}>
          {msgErr && (
            <p style={{ color: "crimson" }}>
              エラー: <code>{msgErr}</code>
            </p>
          )}
          {msgRes && (
            <pre
              style={{
                background: "#f6f6f6",
                padding: 12,
                borderRadius: 8,
                overflowX: "auto",
              }}
            >
              {JSON.stringify(msgRes, null, 2)}
            </pre>
          )}
        </div>
      </section>

      {/* 2) フロント直で Supabase 参照 */}
      <section style={{ marginBottom: 50 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>
          Supabase（フロントから直 / 最新1件）
        </h2>
        <button
          onClick={getSupabaseDirect}
          disabled={sbLoading}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "1px solid #ddd",
            cursor: sbLoading ? "not-allowed" : "pointer",
          }}
        >
          {sbLoading ? "取得中..." : "Supabase から取得（直）"}
        </button>
        <div style={{ marginTop: 12 }}>
          {sbErr && (
            <p style={{ color: "crimson" }}>
              エラー: <code>{sbErr}</code>
            </p>
          )}
          {sbRow && (
            <pre
              style={{
                background: "#f6f6f6",
                padding: 12,
                borderRadius: 8,
                overflowX: "auto",
              }}
            >
              {JSON.stringify(
                { ...sbRow, created_at_jst: fmtJst(sbRow.created_at) },
                null,
                2
              )}
            </pre>
          )}
        </div>
      </section>

      {/* 3) API 経由で Supabase 参照 */}
      <section>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>
          Supabase（API 経由 / 最新1件）
        </h2>
        <button
          onClick={getSupabaseViaApi}
          disabled={apiSbLoading}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "1px solid #ddd",
            cursor: apiSbLoading ? "not-allowed" : "pointer",
          }}
        >
          {apiSbLoading ? "取得中..." : "Supabase から取得（API経由）"}
        </button>
        <div style={{ marginTop: 12 }}>
          {apiSbErr && (
            <p style={{ color: "crimson" }}>
              エラー: <code>{apiSbErr}</code>
            </p>
          )}
          {apiSbRow && (
            <pre
              style={{
                background: "#f6f6f6",
                padding: 12,
                borderRadius: 8,
                overflowX: "auto",
              }}
            >
              {JSON.stringify(
                { ...apiSbRow, created_at_jst: fmtJst(apiSbRow.created_at) },
                null,
                2
              )}
            </pre>
          )}
        </div>
      </section>
    </main>
  );
}
