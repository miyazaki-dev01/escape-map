package main

import (
  "os"
  "strings"
  "time"

  "github.com/gin-contrib/cors"
  "github.com/gin-gonic/gin"
)

func main() {
  port := os.Getenv("PORT")
  if port == "" {
    port = "8080"
  }

  allowOriginEnv := os.Getenv("ALLOW_ORIGIN")
  if allowOriginEnv == "" {
    allowOriginEnv = "http://localhost:3000"
  }
  allowOrigins := strings.Split(allowOriginEnv, ",")

  r := gin.Default()
  r.Use(cors.New(cors.Config{
    AllowOrigins:     allowOrigins,
    AllowMethods:     []string{"GET"},
    AllowHeaders:     []string{"Content-Type"},
    AllowCredentials: true,
    MaxAge:           12 * time.Hour,
  }))

  r.GET("/test", func(c *gin.Context) {
    c.JSON(200, gin.H{"message": "Hello, World!"})
  })

  r.Run(":" + port)
}