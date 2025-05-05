package internal

import (
	"io"
	"log"
	"net/http"

	"github.com/EveryBoard/EveryBoard/internal/auth"
	"github.com/EveryBoard/EveryBoard/internal/model"
	"github.com/gorilla/websocket"
)

type Configuration struct {
	GameListFile string
	UseEmulator bool
	ServiceAccountFile string
	ProjectID string
	Database string
	ListenAddr string
}

var upgrader = websocket.Upgrader{
	CheckOrigin:  func(r *http.Request) bool { return true },
	Subprotocols: []string{"access_token"},
}

func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	uid, user, err := auth.VerifyTokenAndGetUserFromHeader(r)
	if err != nil {
		log.Println(err)
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}
	minimalUser := model.MinimalUser{
		ID: uid,
		Name: user.Username,
	}

	connection, err := upgrader.Upgrade(w, r, http.Header{"Sec-WebSocket-Protocol": {"Authorization"}})
	if err != nil {
		log.Println("WebSocket upgrade error:", err)
		return
	}
	defer connection.Close()

	handlers := newHandlers(connection, subscriptionManager, connectionManager, minimalUser)
	currentGame := model.GetCurrentGame(minimalUser)
	handlers.broadcastToUser(minimalUser, CurrentGameUpdateMessage{
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
					log.Printf("Error when disconnecting client: %v", err)
				}
				break
			}
			// Not a major error, continue receiving messages after ignoring this one
			continue
		}
		log.Printf("<<< [%v] %v", user.Username, string(msg))
		messageType, messageData, err := model.DecodeIncomingMessage(msg)
		if err != nil {
			log.Printf("Cannot decode: %v", err)
			err = handlers.error(ErrorUnknownMessage)
			if err != nil {
				log.Printf("Error when sending error to client: %v", err)
			}
			continue
		}
		err = handlers.handle(messageType, messageData)
		if err != nil {
			log.Printf("Error when handling %v (%v) message: %v", messageType, messageData, err)
		}
	}
}

var subscriptionManager *SubscriptionManager
var connectionManager *ConnectionManager

func Run(config Configuration) {
	log.Println(config)
	initGameList(config.GameListFile)
	auth.InitFirebase(config.UseEmulator, config.ServiceAccountFile, config.ProjectID)
	model.InitDatabase(config.Database)
	model.InitIdEncoder()
	subscriptionManager = newSubscriptionManager()
	connectionManager = newConnectionManager()
	http.HandleFunc("/ws", handleWebSocket)
	log.Fatal(http.ListenAndServe(config.ListenAddr, nil))
}
