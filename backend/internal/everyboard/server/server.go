package server

import (
	"net/http"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/store"
)

const Version = "1.0.3.2"

func cors(origin string, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if origin == "*" {
			w.Header().Set("Access-Control-Allow-Origin", "*")
		} else if requestOrigin := r.Header.Get("Origin"); requestOrigin == origin {
			w.Header().Set("Access-Control-Allow-Origin", requestOrigin)
			w.Header().Set("Access-Control-Allow-Credentials", "true")
		}
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, HEAD, PATCH, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Authorization")
		w.Header().Set("Access-Control-Max-Age", "86400")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

var showVersion = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte(Version))
})

func New(listenAddr string, origin string, websocketHandler http.Handler, gameStore store.GameStore) *http.Server {
	mux := http.NewServeMux()
	mux.Handle("/ws", cors(origin, websocketHandler))
	mux.Handle("/version", showVersion)
	mux.Handle("/api/games", cors(origin, gamesHandler(origin, gameStore)))
	return &http.Server{
		Addr:    listenAddr,
		Handler: mux,
	}
}
