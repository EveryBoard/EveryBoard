package main

import (
	"log"
	"net/http"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/app"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/config"
)

func main() {
	configuration, err := config.Read()
	if err != nil {
		log.Fatalf("Error upon reading configuration: %v", err)
	}
	log.Println("Preparing EveryBoard...")
	server, err := app.Prepare(configuration, app.NewDependencies())
	if err != nil {
		log.Fatalf("Error when preparing server: %v", err)
	}
	log.Println("All good, ready to play games?")
	err = server.ListenAndServe()
	if err != nil && err != http.ErrServerClosed {
		log.Fatalf("Error when running server: %v", err)
	}
}
