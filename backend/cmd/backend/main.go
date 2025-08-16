package main

import (
	"log"

	everyboard "github.com/EveryBoard/EveryBoard/internal"
)

func main() {
	config, err := everyboard.ReadConfiguration()
	if err != nil {
		log.Fatalf("Error upon reading configuration: %v", err)
	}
	err = everyboard.Run(*config)
	if err != nil {
		log.Fatalf("Error: %v", err)
	}
}
