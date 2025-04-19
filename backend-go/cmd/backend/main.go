package main

import (
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


var upgrader = websocket.Upgrader{
	CheckOrigin:  func(r *http.Request) bool { return true },
	Subprotocols: []string{"access_token"},
}

var subscriptionManager *everyboard.SubscriptionManager

var count = 0

func HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	current := count
	count = count + 1
	log.Println("got new client")
	uid, user, err := everyboard.VerifyTokenAndGetUserFromHeader(r)
	if err != nil {
		log.Println(err)
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}
	minimalUser := &everyboard.MinimalUser{
		ID: uid,
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
		log.Printf("[%v,%v] waiting for message", user.Username, current)
		_, msg, err := connection.ReadMessage()
		if err != nil {
			log.Printf("[%v,%v] error: %v", user.Username, current, err)
			if err == io.EOF || websocket.IsUnexpectedCloseError(err) {
				// WebSocket closed, stop this handler after disconnecting client
				log.Printf("[%v,%v] Disconnect", user.Username, current)
				handlers.ClientLeft()
				break
			}
			// Not a major error, continue receiving messages after ignoring this one
			continue
		}
		log.Printf("<<< [%v,%v] %v", user.Username, current, string(msg))
		messageType, messageData, err := everyboard.DecodeIncomingMessage(msg)
		log.Printf("<<< [%v] %v %v", user.Username, messageType, messageData)
		if err != nil {
			log.Printf("Cannot decode: %v", err)
			everyboard.SendError(connection, everyboard.ErrorUnknownMessage)
			continue
		}
		log.Printf("%v,%v dealin with message", user.Username, current)
		err = handlers.Handle(messageType, messageData)
		log.Printf("%v,%v done", user.Username, current)
		if err != nil {
			log.Printf("Error when handling %v (%v) message: %v", messageType, messageData, err)
		}
	}
}

func main() {
	ReadConfiguration()
	everyboard.InitFirebase(useEmulator, serviceAccountFile, projectId)
	everyboard.InitDatabase("everyboard.db")
	everyboard.InitIdEncoder()
	subscriptionManager = everyboard.NewSubscriptionManager()
	http.HandleFunc("/ws", HandleWebSocket)
	log.Println("Listening on", listenAddr)
	log.Fatal(http.ListenAndServe(listenAddr, nil))
}
