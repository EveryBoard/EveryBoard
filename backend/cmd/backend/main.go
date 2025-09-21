package main

import (
	"log"
	"net/http"

	everyboard "github.com/EveryBoard/EveryBoard/internal"
)

func main() {
	config, err := everyboard.ReadConfiguration()
	if err != nil {
		log.Fatalf("Error upon reading configuration: %v", err)
	}
	log.Println("Preparing EveryBoard...")
	server, err := everyboard.Prepare(*config)
	if err != nil {
		log.Fatalf("Error when preparing server: %v", err)
	}
	log.Println("All good, ready to play games?")
	err = server.ListenAndServe()
	if err != nil && err != http.ErrServerClosed {
		log.Fatalf("Error when running server: %v", err)
	}
}
