package server

import (
	"fmt"
	"net/http"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/apperror"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/auth"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/handler"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/logger"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/model"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/protocol"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/store"
	"github.com/gorilla/websocket"
)

const Version = "1.0.1"

func (config *Configuration) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	uid, user, err := auth.VerifyTokenAndGetUser(r)
	if err != nil {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}
	minimalUser := model.MinimalUser{
		ID:   uid,
		Name: user.Username,
	}

	connection, err := config.upgrader.Upgrade(w, r, nil)
	if err != nil {
		logger.Error.Printf("WebSocket upgrade error: %v", err)
		return
	}
	defer connection.Close()

	connection.SetReadLimit(32768) // 32KB limit to prevent DoS

	config.Connections.AddConnection(minimalUser, connection)
	defer config.Connections.RemoveConnection(minimalUser, connection)

	handlers := handler.New(connection, minimalUser, config.Store, config.Connections, config.Subscriptions)
	currentGame, err := config.Store.GetCurrentGame(minimalUser)
	if err != nil {
		logger.Error.Printf("cannot get current game: %v", err)
		return
	}
	handlers.BroadcastToUser(minimalUser, protocol.CurrentGameUpdateMessage{
		CurrentGame: currentGame,
	})

	for {
		_, msg, err := connection.ReadMessage()
		if err != nil {
			logger.Info.Printf("[%v] Disconnect", user.Username)
			errLeft := handlers.ClientLeft()
			if errLeft != nil {
				logger.Error.Printf("Error when disconnecting client: %v", errLeft)
			}
			break
		}
		logger.Debug.Printf("<<< [%v] %v", user.Username, string(msg))
		messageType, messageData, err := protocol.DecodeIncomingMessage(msg)
		if err != nil {
			handlers.SendError(apperror.ErrorUnknownMessage)
			continue
		}
		handlers.Handle(messageType, messageData)
	}
}

func cors(origin string, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, HEAD, PATCH, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
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

func Prepare(config *Configuration) (*http.Server, error) {
	auth.SetFirebaseClient(config.Firebase)
	err := auth.InitFirebase()
	if err != nil {
		return nil, fmt.Errorf("error initializing firebase: %v", err)
	}
	if config.Store == nil {
		logger.Info.Printf("Initializing DB")
		store, err := store.InitDatabase(config.Database)
		if err != nil {
			return nil, fmt.Errorf("error initializing database: %v", err)
		}
		config.Store = store
	}

	config.upgrader = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return config.Origin == "*" || r.Header.Get("Origin") == config.Origin
		},
		Subprotocols: []string{"Authorization"},
	}
	mux := http.NewServeMux()
	mux.Handle("/ws", cors(config.Origin, config))
	mux.Handle("/version", showVersion)
	return &http.Server{
		Addr:    config.ListenAddr,
		Handler: mux,
	}, nil
}
