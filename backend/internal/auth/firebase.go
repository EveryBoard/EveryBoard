package auth

import (
	"context"
	"log"
	"fmt"
	"os"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"google.golang.org/api/option"
)

var useEmulator bool
var authClient *auth.Client
var firestoreClient *firestore.Client

func InitFirebase(useEmulatorValue bool, serviceAccountFile string, projectID string) {
	var app *firebase.App
	var err error
	for _, env := range os.Environ() {
		fmt.Println(env)
	}
	if useEmulatorValue {
		conf := &firebase.Config{ProjectID: projectID}
		app, err = firebase.NewApp(context.Background(), conf)
	} else {
		opts := option.WithCredentialsFile(serviceAccountFile)
		app, err = firebase.NewApp(context.Background(), nil, opts)
		data, err := os.ReadFile(serviceAccountFile)
		if err != nil {
			log.Fatal(err)
		}
		fmt.Println(string(data))
	}
	log.Printf("app: %v", app)
	if err != nil {
		log.Fatalf("Failed to initialize Firebase App: %v", err)
	}

	authClient, err = app.Auth(context.Background())
	if err != nil {
		log.Fatalf("Failed to initialize Auth client: %v", err)
	}

	firestoreClient, err = app.Firestore(context.Background())
	if err != nil {
		log.Fatalf("Failed to initialize Firestore client: %v", err)
	}

	useEmulator = useEmulatorValue
}
