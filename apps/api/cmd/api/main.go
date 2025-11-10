package main

import (
	"encoding/json"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
)

// Supabase の health_checks 1行分
type HealthRow struct {
	ID        string    `json:"id"`
	Status    string    `json:"status"`
	Note      *string   `json:"note"`
	CreatedAt time.Time `json:"created_at"`
}

func main() {
	// --- 環境変数（最低限） ---
	supabaseURL := os.Getenv("SUPABASE_URL")
	svcKey := os.Getenv("SUPABASE_SERVICE_ROLE_KEY")

	// ポートは未設定なら 8080
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// --- Gin 初期化 ---
	r := gin.Default()
	_ = r.SetTrustedProxies(nil) // プロキシ未設定の警告を抑止

	// 1) 動作確認用エンドポイント: /test-message
	r.GET("/test-message", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "Hello from API!",
			"time":    time.Now().Format(time.RFC3339),
		})
	})

	// 2) Supabase 経由で health_checks の最新1件を返す: /supabase-health
	r.GET("/supabase-health", func(c *gin.Context) {
		// 必須ENVが無ければ 500
		if supabaseURL == "" || svcKey == "" {
			c.Status(http.StatusInternalServerError)
			return
		}

		// PostgREST で最新1件を取得
		req, _ := http.NewRequest(
			http.MethodGet,
			supabaseURL+"/rest/v1/health_checks?select=*&order=created_at.desc&limit=1",
			nil,
		)
		req.Header.Set("apikey", svcKey)
		req.Header.Set("Authorization", "Bearer "+svcKey)

		res, err := http.DefaultClient.Do(req)
		if err != nil || res.StatusCode >= 400 {
			c.Status(http.StatusBadGateway) // Supabase 側でエラー
			return
		}
		defer res.Body.Close()

		var rows []HealthRow
		_ = json.NewDecoder(res.Body).Decode(&rows)
		if len(rows) == 0 {
			c.Status(http.StatusNotFound) // データなし
			return
		}
		c.JSON(http.StatusOK, rows[0])
	})

	// サーバ起動（全インターフェースで待受）
	_ = r.Run("0.0.0.0:" + port)
}
