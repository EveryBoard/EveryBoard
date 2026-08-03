package config

import (
	"fmt"
	"os"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/auth"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type Configuration struct {
	Firebase auth.FirebaseLike
	Database gorm.Dialector

	ListenAddr string
	Origin     string
	WebhookURL string
}

// Read reads server configuration from environment variables. It validates the
// pieces that can be checked before runtime dependencies are initialized.
func Read() (*Configuration, error) {
	firebase := &auth.Firebase{
		UseEmulator:        os.Getenv("USE_EMULATOR") != "no",
		ProjectID:          os.Getenv("PROJECT_ID"),
		ServiceAccountFile: os.Getenv("SERVICE_ACCOUNT"),
	}
	var database gorm.Dialector
	if os.Getenv("DATABASE_TYPE") == "postgres" {
		databaseDsn := os.Getenv("DATABASE_DSN")
		if databaseDsn == "" {
			return nil, fmt.Errorf("for postgres, you must provide a database DSN through the DATABASE_DSN environment variable")
		}
		database = postgres.Open(databaseDsn)
	} else {
		databaseDsn := os.Getenv("DATABASE_DSN")
		if databaseDsn == "" {
			databaseDsn = "everyboard.db"
		}
		database = sqlite.Open(databaseDsn)
	}

	config := &Configuration{
		Firebase:   firebase,
		Origin:     os.Getenv("ALLOW_ORIGIN"),
		ListenAddr: os.Getenv("LISTEN_ADDR"),
		Database:   database,
		WebhookURL: os.Getenv("DISCORD_WEBHOOK_URL"),
	}
	if config.ListenAddr == "" {
		config.ListenAddr = ":8081"
	}

	if config.Origin == "" {
		return nil, fmt.Errorf("origin is not set. Use ALLOW_ORIGIN environment variable")
	}

	return config, nil
}
