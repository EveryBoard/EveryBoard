package server

import (
	"fmt"
	"os"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/auth"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/session"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/store"
	"github.com/gorilla/websocket"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type Configuration struct {
	Firebase      auth.FirebaseLike
	Database      gorm.Dialector
	Store         store.Store
	Subscriptions *session.SubscriptionManager[*websocket.Conn]
	Connections   *session.ConnectionManager[*websocket.Conn]

	ListenAddr string
	Origin     string
	upgrader   websocket.Upgrader
}

// ReadConfiguration reads the configuration of the server through environment
// variables. Does sanity checks and stops if any configuration is invalid. Some
// more checks will be done when the components are initialized.
func ReadConfiguration() (*Configuration, error) {
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
		// defaults to sqlite with everyboard.db
		databaseDsn := os.Getenv("DATABASE_DSN")
		if databaseDsn == "" {
			databaseDsn = "everyboard.db"
		}
		database = sqlite.Open(databaseDsn)
	}

	subscriptions := session.NewSubscriptionManager[*websocket.Conn]()
	connections := session.NewConnectionManager[*websocket.Conn]()
	config := &Configuration{
		Firebase:      firebase,
		Origin:        os.Getenv("ALLOW_ORIGIN"),
		ListenAddr:    os.Getenv("LISTEN_ADDR"),
		Database:      database,
		Subscriptions: &subscriptions,
		Connections:   &connections,
	}
	if config.ListenAddr == "" {
		// No listen address provided, default to :8081
		config.ListenAddr = ":8081"
	}

	if config.Origin == "" {
		return nil, fmt.Errorf("origin is not set. Use ALLOW_ORIGIN environment variable")
	}

	// The other elements of the config will be checked by the respective packages that need them
	return config, nil
}
