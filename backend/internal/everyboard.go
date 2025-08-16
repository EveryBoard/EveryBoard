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
	if os.Getenv("DATABASE_TYPE") == "postgres" {
		databaseDsn := os.Getenv("DATABASE_DSN")
		if databaseDsn == "" {
			return nil, fmt.Errorf("For postgres, you must provide a database DSN through the DATABASE_DSN environment variable")
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


	config := &Configuration{
		Firebase: firebase,
		IDEncoder: &model.SqidsEncoder{},
		Origin: os.Getenv("ALLOW_ORIGIN"),
		ListenAddr: os.Getenv("LISTEN_ADDR"),
		Database: database,
	}
	err := config.Validate()
	if err != nil {
		return nil, fmt.Errorf("Invalid configuration: %v", err)
	}

	return config, nil
}

func (config Configuration) Validate() error {
	if config.ListenAddr == "" {
		// No listen address provided, default to :8081
		config.ListenAddr = ":8081"
	}

	if config.Origin == "" {
		fmt.Errorf("Origin is not set. Use ALLOW_ORIGIN environment variable")
	}

	// The other elements of the config will be checked by the respective packages that need them

	return nil // All good
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

	connectionManager.AddConnection(minimalUser, connection)
	defer connectionManager.RemoveConnection(minimalUser, connection)

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
		_, msg, err := connection.ReadMessage()
		if err != nil {
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
		log.Printf("<<< [%v] %v", user.Username, string(msg))
		messageType, messageData, err := model.DecodeIncomingMessage(msg)
		if err != nil {
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

var subscriptionManager SubscriptionManager[*websocket.Conn]
var connectionManager ConnectionManager[*websocket.Conn]

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

func Run(config Configuration) error {
	log.Println("Starting EveryBoard...")
	auth.SetFirebaseClient(config.Firebase)
	err := auth.InitFirebase()
	if err != nil {
		fmt.Errorf("error initializing firebase: %v", err)
	}
	model.SetIDEncoder(config.IDEncoder)
	err = model.InitEncoder()
	if err != nil {
		fmt.Errorf("error initializing encoder: %v", err)
	}
	err = model.InitDatabase(config.Database)
	if err != nil {
		fmt.Errorf("error initializing database: %v", err)
	}
	subscriptionManager = NewSubscriptionManager[*websocket.Conn]()
	connectionManager = NewConnectionManager[*websocket.Conn]()

	config.upgrader = websocket.Upgrader{
		CheckOrigin:  func(r *http.Request) bool {
			return config.Origin == "*" || r.Header.Get("Origin") == config.Origin;
		},
		Subprotocols: []string{"access_token"},
	}
	http.Handle("/ws", cors(config.Origin, config))
	log.Println("All good, ready to play games?")
	return http.ListenAndServe(config.ListenAddr, nil)
}
