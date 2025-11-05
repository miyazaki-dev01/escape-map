FROM golang:1.25-alpine

WORKDIR /workspace/apps/api

COPY apps/api/go.mod .
COPY apps/api/go.sum .

RUN go mod download
