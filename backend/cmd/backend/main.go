package main

import (
	"log"
	"os"

	everyboard "github.com/EveryBoard/EveryBoard/internal"
)

// readConfiguration reads the configuration of the server through environment variables.
// Does sanity checks and stops if any configuration is invalid.
func readConfiguration() everyboard.Configuration {
	config := everyboard.Configuration{
		GameListFile: "games.txt",
		Database: "everyboard.db",
	}

	config.ListenAddr = os.Getenv("LISTEN_ADDR")
	if config.ListenAddr == "" {
		config.ListenAddr = ":8081"
	}

	config.UseEmulator = os.Getenv("USE_EMULATOR") != ""

	config.ProjectID = os.Getenv("PROJECT_ID")
	if config.ProjectID == "" {
		log.Fatal("Project ID is not set. Use PROJECT_ID environment variable")
	}

	config.Origin = os.Getenv("ALLOW_ORIGIN")
	if config.Origin == "" {
		log.Fatal("Origin is not set. Use ALLOW_ORIGIN environment variable")
	}

	if config.UseEmulator {
		err := os.Setenv("FIRESTORE_EMULATOR_HOST", "localhost:8080")
		if err != nil {
			log.Fatalf("Cannot set environment variable?! %v", err)
		}
		err = os.Setenv("FIREBASE_AUTH_EMULATOR_HOST", "localhost:9099")
		if err != nil {
			log.Fatalf("Cannot set environment variable?! %v", err)
		}
	} else {
		config.ServiceAccountFile = os.Getenv("SERVICE_ACCOUNT")
		if config.ServiceAccountFile == "" {
			log.Fatal("Service account file is not set. Use SERVICE_ACCOUNT environment variable")
		}
		if _, err := os.Stat(config.ServiceAccountFile); os.IsNotExist(err) {
			log.Fatalf("Service account file does not exists: %s", config.ServiceAccountFile)
		}
	}

	return config
}

func main() {
	everyboard.Run(readConfiguration())
}
