package main

import (
  "os"

  "github.com/gin-gonic/gin"
)

func main() {
  port := os.Getenv("PORT")
  if port == "" {
    port = "8080"
  }

  r := gin.New()
	r.Use(gin.Recovery())

  r.GET("/test", func(c *gin.Context) {
    c.JSON(200, gin.H{"message": "Hello World!"})
  })

  r.Run("0.0.0.0:" + port)
}