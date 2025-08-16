package internal

import (
	"io"
	"log"
	"net/http"

	"gorm.io/driver/sqlite"
	"github.com/EveryBoard/EveryBoard/internal/auth"
	"github.com/EveryBoard/EveryBoard/internal/model"
	"github.com/EveryBoard/EveryBoard/internal/utils"
	"github.com/gorilla/websocket"
)

type Configuration struct {
	GameListFile string
	UseEmulator bool
	ServiceAccountFile string
	ProjectID string
	Database string
	ListenAddr string
	Origin string
	upgrader websocket.Upgrader
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

func Run(config Configuration) {
	log.Println("Starting EveryBoard...")
	auth.SetFirebaseClient(&auth.Firebase{
		UseEmulator: config.UseEmulator,
		ProjectID: config.ProjectID,
		ServiceAccountFile: config.ServiceAccountFile,
	})
	err := auth.InitFirebase()
	if err != nil {
		log.Fatalf("error: %v", err)
	}
	model.SetIDEncoder(&model.SqidsEncoder{})
	err = model.InitEncoder()
	if err != nil {
		log.Fatalf("error: %v", err)
	}
	err = model.InitDatabase(sqlite.Open(config.Database)) // TODO: change to postgres
	if err != nil {
		log.Fatalf("error: %v", err)
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
	log.Fatal(http.ListenAndServe(config.ListenAddr, nil))
}
