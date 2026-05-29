package main

import (
	"log"
	"net/http"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/server"
)

func main() {
	config, err := server.ReadConfiguration()
	if err != nil {
		log.Fatalf("Error upon reading configuration: %v", err)
	}
	log.Println("Preparing EveryBoard...")
	srv, err := server.Prepare(config)
	if err != nil {
		log.Fatalf("Error when preparing server: %v", err)
	}
	log.Println("All good, ready to play games?")
	err = srv.ListenAndServe()
	if err != nil && err != http.ErrServerClosed {
		log.Fatalf("Error when running server: %v", err)
	}
}
