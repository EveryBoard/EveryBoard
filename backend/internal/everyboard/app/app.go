package app

import (
	"fmt"
	"net/http"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/config"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/logger"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/notification"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/server"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/session"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/store"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/transport/ws"
	"github.com/gorilla/websocket"
)

type Dependencies struct {
	Store         store.Store
	Subscriptions *session.SubscriptionManager[*websocket.Conn]
	Connections   *session.ConnectionManager[*websocket.Conn]
	Notifier      notification.Notifier
}

func NewDependencies() Dependencies {
	subscriptions := session.NewSubscriptionManager[*websocket.Conn]()
	connections := session.NewConnectionManager[*websocket.Conn]()
	return Dependencies{
		Subscriptions: &subscriptions,
		Connections:   &connections,
	}
}

func Prepare(cfg *config.Configuration, dependencies Dependencies) (*http.Server, error) {
	if err := cfg.Firebase.Initialize(); err != nil {
		return nil, fmt.Errorf("error initializing firebase: %v", err)
	}
	if dependencies.Store == nil {
		logger.Info.Printf("Initializing DB")
		initializedStore, err := store.InitDatabase(cfg.Database)
		if err != nil {
			return nil, fmt.Errorf("error initializing database: %v", err)
		}
		dependencies.Store = initializedStore
	}
	if dependencies.Subscriptions == nil || dependencies.Connections == nil {
		defaults := NewDependencies()
		if dependencies.Subscriptions == nil {
			dependencies.Subscriptions = defaults.Subscriptions
		}
		if dependencies.Connections == nil {
			dependencies.Connections = defaults.Connections
		}
	}
	if dependencies.Notifier == nil {
		if cfg.WebhookURL == "" {
			dependencies.Notifier = notification.Noop{}
		} else {
			notifier, err := notification.NewWebhook(cfg.WebhookURL)
			if err != nil {
				return nil, fmt.Errorf("error initializing webhook: %v", err)
			}
			dependencies.Notifier = notifier
		}
	}

	websocketHandler := ws.New(ws.Dependencies{
		Firebase:      cfg.Firebase,
		Store:         dependencies.Store,
		Subscriptions: dependencies.Subscriptions,
		Connections:   dependencies.Connections,
		Origin:        cfg.Origin,
		Notifier:      dependencies.Notifier,
	})
	return server.New(cfg.ListenAddr, cfg.Origin, websocketHandler), nil
}
