package main

import (
	"context"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"fmt"
	"encoding/base64"
    "encoding/json"

	"github.com/gorilla/websocket"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"cloud.google.com/go/firestore"
	"google.golang.org/api/option"
)

var (
	useEmulator bool
	serviceAccountFile string
	listenAddr string
	projectId string
)

// ReadConfiguration reads the configuration of the server through environment variables.
// Does sanity checks and stops if any configuration is invalid.
func ReadConfiguration() {
	listenAddr = os.Getenv("LISTEN_ADDR")
	if listenAddr == "" {
		listenAddr = ":8081"
	}

	useEmulator = os.Getenv("WITH_EMULATOR") != ""
	log.Println("useEmulator: ", useEmulator)

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

		projectId = os.Getenv("PROJECT_ID")
		if projectId == "" {
			log.Fatal("Project ID is not set. Use PROJECT_ID environment variable")
		}
	}
}

var (
	firebaseAuthClient     *auth.Client
	firebaseFirestoreClient *firestore.Client
)

func InitFirebase() {
	var app *firebase.App
	var err error
	if useEmulator {
		conf := &firebase.Config{ProjectID: "my-project"} // TODO: from config
		app, err = firebase.NewApp(context.Background(), conf)
	} else {
		app, err = firebase.NewApp(context.Background(), nil, option.WithCredentialsFile(serviceAccountFile))
	}
    if err != nil {
        log.Fatalf("Failed to initialize Firebase App: %v", err)
    }

    authClient, err := app.Auth(context.Background())
    if err != nil {
        log.Fatalf("Failed to initialize Auth client: %v", err)
    }
	firebaseAuthClient = authClient

    firestoreClient, err := app.Firestore(context.Background())
    if err != nil {
        log.Fatalf("Failed to initialize Firestore client: %v", err)
    }
	firebaseFirestoreClient = firestoreClient
}

type User struct {
	Username string `json:"username"`
}

func FetchUserDocument(uid string) (*User, error) {
	log.Println("fetching", uid)
    docRef := firebaseFirestoreClient.Collection("users").Doc(uid)
    docSnapshot, err := docRef.Get(context.Background())
    if err != nil {
        return nil, fmt.Errorf("failed to fetch user document: %v", err)
    }

	data, err := json.Marshal(docSnapshot.Data())
	var user User
	err = json.Unmarshal(data, &user)
	if err != nil {
		return nil, fmt.Errorf("cannot decode user: %v", err)
	}
	return &user, nil
}

func VerifyTokenAndGetUserFromHeader(r *http.Request) (*User, error) {
	authorizationHeader := r.Header.Get("Sec-WebSocket-Protocol")
	if authorizationHeader == "" {
		return nil, fmt.Errorf("No authorization header")
	}

	parts := strings.SplitN(authorizationHeader, ",", 2)
	if len(parts) != 2 || strings.TrimSpace(parts[0]) != "Authorization" {
		return nil, fmt.Errorf("Invalid authorization header")
	}
	token := strings.TrimSpace(parts[1])

	var uid string
	if useEmulator {
		tokenParts := strings.Split(token, ".")
		if len(tokenParts) != 3 {
			return nil, fmt.Errorf("invalid token format")
		}

		payloadBytes, err := base64.RawURLEncoding.DecodeString(tokenParts[1])
		if err != nil {
			return nil, err
		}

		var claims map[string]interface{}
		if err := json.Unmarshal(payloadBytes, &claims); err != nil {
			return nil, err
		}

		sub, ok := claims["sub"].(string)
		if !ok {
			return nil, fmt.Errorf("Missing 'sub' part of token")
		}

		uid = sub;
	} else {
		verifiedToken, err := firebaseAuthClient.VerifyIDToken(r.Context(), token)
		if err != nil {
			return nil, err
		}

		sub, ok := verifiedToken.Claims["sub"].(string)
		if !ok {
			return nil, fmt.Errorf("Missing 'sub' part of token")
		}
		uid = sub
	}

	return FetchUserDocument(uid)
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
	Subprotocols: []string{"access_token"},
}

func HandleWebSocket(w http.ResponseWriter, r *http.Request) {

	user, err := VerifyTokenAndGetUserFromHeader(r)
	if err != nil {
		log.Println(err)
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return;
	}
	log.Println(user.Username)
	log.Println("verified!")

	connection, err := upgrader.Upgrade(w, r, http.Header{"Sec-WebSocket-Protocol": {"token (TODO: not in a string)"}})
	if err != nil {
		log.Println("WebSocket upgrade error:", err)
		return
	}
	defer connection.Close()

	// log.Printf("User %s connected: %+v", uid, user)

	for {
		_, msg, err := connection.ReadMessage()
		log.Println("msg: ", msg)
		if err != nil {
			if err == io.EOF || websocket.IsUnexpectedCloseError(err) {
				break
			}
			log.Println("Read error:", err)
			continue
		}
		// log.Printf("Message from %s: %s", uid, msg)
	}
}

func main() {
	ReadConfiguration()
	InitFirebase()
	http.HandleFunc("/ws", HandleWebSocket)
	log.Println("Listening on", listenAddr)
	log.Fatal(http.ListenAndServe(listenAddr, nil))
}
