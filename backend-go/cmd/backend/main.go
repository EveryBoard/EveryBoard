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
		os.Setenv("FIRESTORE_EMULATOR_HOST", "localhost:8080")
		os.Setenv("FIREBASE_AUTH_EMULATOR_HOST", "localhost:9099")
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

func HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	user, err := everyboard.VerifyTokenAndGetUserFromHeader(r)
	if err != nil {
		log.Println(err)
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	connection, err := upgrader.Upgrade(w, r, http.Header{"Sec-WebSocket-Protocol": {"Authorization"}})
	if err != nil {
		log.Println("WebSocket upgrade error:", err)
		return
	}
	defer connection.Close()

	log.Printf("User %s connected", user.Username)

	for {
		_, msg, err := connection.ReadMessage()
		if err != nil {
			log.Println("error?")
			if err == io.EOF || websocket.IsUnexpectedCloseError(err) {
				log.Println("client closed connection")
				break
			}
			log.Println("Read error:", err)
			continue
		}
		log.Printf("Message from %s: %s", user.Username, msg)
	}
}

func main() {
	ReadConfiguration()
	everyboard.InitFirebase(useEmulator, serviceAccountFile, projectId)
	http.HandleFunc("/ws", HandleWebSocket)
	log.Println("Listening on", listenAddr)
	log.Fatal(http.ListenAndServe(listenAddr, nil))
}
