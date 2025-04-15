package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/websocket"

	everyboard "github.com/EveryBoard/EveryBoard/internal"
)

var (
	useEmulator        bool
	serviceAccountFile string
	listenAddr         string
	projectId          string
)

// ReadConfiguration reads the configuration of the server through environment variables.
// Does sanity checks and stops if any configuration is invalid.
func ReadConfiguration() {
	listenAddr = os.Getenv("LISTEN_ADDR")
	if listenAddr == "" {
		listenAddr = ":8081"
	}

	useEmulator = os.Getenv("USE_EMULATOR") != ""
	log.Println("useEmulator: ", useEmulator)

	projectId = os.Getenv("PROJECT_ID")
	if projectId == "" {
		log.Fatal("Project ID is not set. Use PROJECT_ID environment variable")
	}

	if useEmulator {
		err := os.Setenv("FIRESTORE_EMULATOR_HOST", "localhost:8080")
		if err != nil {
			log.Fatalf("Cannot set environment variable?! %v", err)
		}
		err = os.Setenv("FIREBASE_AUTH_EMULATOR_HOST", "localhost:9099")
		if err != nil {
			log.Fatalf("Cannot set environment variable?! %v", err)
		}


	} else {
		serviceAccountFile = os.Getenv("SERVICE_ACCOUNT")
		if serviceAccountFile == "" {
			log.Fatal("Service account file is not set. Use SERVICE_ACCOUNT environment variable")
		}
		if _, err := os.Stat(serviceAccountFile); os.IsNotExist(err) {
			log.Fatalf("Service account file does not exists: %s", serviceAccountFile)
		}
	}
}


func GetStringMessageArgument(messageData map[string]interface{}, key string) (string, error) {
	v, ok := messageData[key]
	if ok == false {
		return "", fmt.Errorf("Missing data")
	}
	asString, ok := v.(string)
	if ok == false {
		return "", fmt.Errorf("Invalid data")
	}
	return asString, nil
}

var upgrader = websocket.Upgrader{
	CheckOrigin:  func(r *http.Request) bool { return true },
	Subprotocols: []string{"access_token"},
}

var subscriptionManager *everyboard.SubscriptionManager

func HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	uid, user, err := everyboard.VerifyTokenAndGetUserFromHeader(r)
	if err != nil {
		log.Println(err)
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}
	minimalUser := &everyboard.MinimalUser{
		Id: uid,
		Name: user.Username,
	}

	connection, err := upgrader.Upgrade(w, r, http.Header{"Sec-WebSocket-Protocol": {"Authorization"}})
	if err != nil {
		log.Println("WebSocket upgrade error:", err)
		return
	}
	defer connection.Close()

	handlers := everyboard.NewHandlers(connection, subscriptionManager, minimalUser)

	for {
		_, msg, err := connection.ReadMessage()
		if err != nil {
			if err == io.EOF || websocket.IsUnexpectedCloseError(err) {
				// WebSocket closed, stop this handler after disconnecting client
				log.Printf("[%v] Disconnect", user.Username)
				subscriptionManager.Unsubscribe(connection)
				break
			}
			// Not a major error, continue receiving messages after ignoring this one
			continue
		}
		messageType, messageData, err := everyboard.DecodeIncomingMessage(msg)
		log.Printf("<<< [%v] %v", user.Username, messageType)
		if err != nil {
			log.Printf("Cannot decode: %v", err)
			everyboard.SendError(connection, everyboard.UnknownMessage)
			continue
		}
		switch (messageType) {
		case "SubscribeLobby":
			handlers.SubscribeToLobby()
		case "Unsubscribe":
			subscriptionManager.Unsubscribe(connection)
		case "ChatSend":
			content, err := GetStringMessageArgument(messageData, "message")
			if err != nil {
				everyboard.SendError(connection, everyboard.UnknownMessage)
			} else {
				handlers.ChatSend(content)
			}
		case "Create":
			gameName, err := GetStringMessageArgument(messageData, "gameName")
			if err != nil {
				everyboard.SendError(connection, everyboard.UnknownMessage)
			} else {
				handlers.CreateGame(gameName)
			}
		default:
			everyboard.SendError(connection, everyboard.UnknownMessage)
		}

	}
}

func main() {
	ReadConfiguration()
	everyboard.InitFirebase(useEmulator, serviceAccountFile, projectId)
	everyboard.InitDatabase("everyboard.db")
	subscriptionManager = everyboard.NewSubscriptionManager()
	http.HandleFunc("/ws", HandleWebSocket)
	log.Println("Listening on", listenAddr)
	log.Fatal(http.ListenAndServe(listenAddr, nil))
}
