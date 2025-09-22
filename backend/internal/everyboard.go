package internal

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/EveryBoard/EveryBoard/internal/auth"
	"github.com/EveryBoard/EveryBoard/internal/model"
	"github.com/EveryBoard/EveryBoard/internal/utils"
	"github.com/gorilla/websocket"
	"gorm.io/gorm"
	"gorm.io/driver/sqlite"
	"gorm.io/driver/postgres"
)

type Configuration struct {
	Firebase auth.FirebaseLike
	IDEncoder model.IDEncoder
	Database gorm.Dialector

	ListenAddr string
	Origin string
	upgrader websocket.Upgrader
}

// ReadConfiguration reads the configuration of the server through environment
// variables. Does sanity checks and stops if any configuration is invalid. Some
// more checks will be done when the components are initialized.
func ReadConfiguration() (*Configuration, error) {
	firebase := &auth.Firebase{
		UseEmulator: os.Getenv("USE_EMULATOR") != "no",
		ProjectID: os.Getenv("PROJECT_ID"),
		ServiceAccountFile: os.Getenv("SERVICE_ACCOUNT"),
	}
	var database gorm.Dialector
	log.Printf("database type is: %s", os.Getenv("DATABASE_TYPE"))
	if os.Getenv("DATABASE_TYPE") == "postgres" {
		databaseDsn := os.Getenv("DATABASE_DSN")
		log.Printf("using postgres with %s", databaseDsn)
		if databaseDsn == "" {
			return nil, fmt.Errorf("For postgres, you must provide a database DSN through the DATABASE_DSN environment variable")
		}
		database = postgres.Open(databaseDsn)
	} else {
		// defaults to sqlite with everyboard.db
		databaseDsn := os.Getenv("DATABASE_DSN")
		log.Printf("using sqlite with %s", databaseDsn)
		if databaseDsn == "" {
			databaseDsn = "everyboard.db"
		}
		database = sqlite.Open(databaseDsn)
	}

	config := &Configuration{
		Firebase: firebase,
		IDEncoder: &model.SqidsEncoder{},
		Origin: os.Getenv("ALLOW_ORIGIN"),
		ListenAddr: os.Getenv("LISTEN_ADDR"),
		Database: database,
	}
	if config.ListenAddr == "" {
		// No listen address provided, default to :8081
		config.ListenAddr = ":8081"
	}

	if config.Origin == "" {
		return nil, fmt.Errorf("Origin is not set. Use ALLOW_ORIGIN environment variable")
	}

	// The other elements of the config will be checked by the respective packages that need them
	return config, nil
}

func (config Configuration) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	log.Println("Got a request")
	uid, user, err := auth.VerifyTokenAndGetUser(r)
	if err != nil {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}
	log.Println("Got a token")
	minimalUser := model.MinimalUser{
		ID: uid,
		Name: user.Username,
	}

	connection, err := config.upgrader.Upgrade(w, r, http.Header{"Sec-WebSocket-Protocol": {"Authorization"}})
	if err != nil {
		utils.Errorf("WebSocket upgrade error: %v", err)
		return
	}
	defer connection.Close()
	log.Println("Upgraded connection")

	Connections.AddConnection(minimalUser, connection)
	defer Connections.RemoveConnection(minimalUser, connection)

	handlers := Handlers{connection: connection, user: minimalUser}
	currentGame, err := model.GetCurrentGame(minimalUser)
	if err != nil {
		utils.Errorf("cannot get current game: %v", err)
		return
	}
	log.Println("Sending first message!")
	handlers.broadcastToUser(minimalUser, model.CurrentGameUpdateMessage{
		CurrentGame: currentGame,
	})

	for {
		log.Println("[server] reading message")
		_, msg, err := connection.ReadMessage()
		log.Printf("[server] message: %s, error: %v", msg, err)
		if err != nil {
			log.Printf("[server] error: %v", err)
			if err == io.EOF || websocket.IsUnexpectedCloseError(err) {
				// WebSocket closed, stop this handler after disconnecting client
				log.Printf("[%v] Disconnect", user.Username)
				err = handlers.ClientLeft()
				if err != nil  {
					utils.Errorf("Error when disconnecting client: %w", err)
				}
				break
			}
			// Not a major error, continue receiving messages after ignoring this one
			continue
		}
		log.Printf("\033[33m<<< [%v] %v\033[0m", user.Username, string(msg))
		messageType, messageData, err := model.DecodeIncomingMessage(msg)
		log.Printf("messageType: [%s], messageData: [%v]", messageType, messageData)
		if err != nil {
			log.Printf("error: %v", err)
			err = handlers.error(model.ErrorUnknownMessage)
			if err != nil {
				utils.Errorf("Error when sending error to client: %v", err)
			}
			continue
		}
		err = handlers.handle(messageType, messageData)
		if err != nil {
			utils.Errorf("Error when handling %v (%v) message: %v", messageType, messageData, err)
		}
	}
}

// Public for testing purposes
var Subscriptions SubscriptionManager[*websocket.Conn]
var Connections ConnectionManager[*websocket.Conn]

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

func Prepare(config Configuration) (*http.Server, error) {
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
	err = model.InitDatabase(config.Database)
	if err != nil {
		return nil, fmt.Errorf("error initializing database: %v", err)
	}
	log.Println("DB successfully updated")
	Subscriptions = NewSubscriptionManager[*websocket.Conn]()
	Connections = NewConnectionManager[*websocket.Conn]()

	config.upgrader = websocket.Upgrader{
		CheckOrigin:  func(r *http.Request) bool {
			return config.Origin == "*" || r.Header.Get("Origin") == config.Origin;
		},
		Subprotocols: []string{"access_token"},
	}
	mux := http.NewServeMux()
	mux.Handle("/ws", cors(config.Origin, config))
	return &http.Server{
		Addr: config.ListenAddr,
		Handler: mux,
	}, nil
}
