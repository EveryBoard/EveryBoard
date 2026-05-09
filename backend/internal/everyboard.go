package internal

import (
	"fmt"
	"net/http"
	"os"

	"github.com/EveryBoard/EveryBoard/internal/auth"
	"github.com/EveryBoard/EveryBoard/internal/model"
	"github.com/EveryBoard/EveryBoard/internal/utils"
	"github.com/gorilla/websocket"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

const Version = "1.0.1"

type Configuration struct {
	Firebase      auth.FirebaseLike
	IDEncoder     model.IDEncoder
	Database      gorm.Dialector
	Store         model.Store
	Subscriptions *SubscriptionManager[*websocket.Conn]
	Connections   *ConnectionManager[*websocket.Conn]

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

	subscriptions := NewSubscriptionManager[*websocket.Conn]()
	connections := NewConnectionManager[*websocket.Conn]()
	config := &Configuration{
		Firebase:      firebase,
		IDEncoder:     &model.SqidsEncoder{},
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
		utils.DefaultLogger.Errorf("WebSocket upgrade error: %v", err)
		return
	}
	defer connection.Close()

	connection.SetReadLimit(32768) // 32KB limit to prevent DoS

	config.Connections.AddConnection(minimalUser, connection)
	defer config.Connections.RemoveConnection(minimalUser, connection)

	handlers := Handlers{
		connection:    connection,
		user:          minimalUser,
		store:         config.Store,
		connections:   config.Connections,
		subscriptions: config.Subscriptions,
	}
	currentGame, err := config.Store.GetCurrentGame(minimalUser)
	if err != nil {
		utils.DefaultLogger.Errorf("cannot get current game: %v", err)
		return
	}
	handlers.broadcastToUser(minimalUser, model.CurrentGameUpdateMessage{
		CurrentGame: currentGame,
	})

	for {
		_, msg, err := connection.ReadMessage()
		if err != nil {
			utils.DefaultLogger.Infof("[%v] Disconnect", user.Username)
			errLeft := handlers.clientLeft()
			if errLeft != nil {
				utils.DefaultLogger.Errorf("Error when disconnecting client: %v", errLeft)
			}
			break
		}
		utils.DefaultLogger.Debugf("<<< [%v] %v", user.Username, string(msg))
		messageType, messageData, err := model.DecodeIncomingMessage(msg)
		if err != nil {
			handlers.sendError(model.ErrorUnknownMessage)
			continue
		}
		err = handlers.handle(messageType, messageData)
		if err != nil {
			// Error already logged in handlers.handle if it's not a BackendError
			// Continue loop to receive next message
		}
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
	model.SetIDEncoder(config.IDEncoder)
	err = model.InitEncoder()
	if err != nil {
		return nil, fmt.Errorf("error initializing encoder: %v", err)
	}
	if config.Store == nil {
		utils.DefaultLogger.Infof("Initializing DB")
		store, err := model.InitDatabase(config.Database)
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
