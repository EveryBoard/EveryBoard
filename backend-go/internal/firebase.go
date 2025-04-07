package internal

import (
	"context"
	"log"


	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"google.golang.org/api/option"

)

var UseEmulator bool
var AuthClient *auth.Client
var FirestoreClient *firestore.Client

func InitFirebase(useEmulator bool, serviceAccountFile string, projectID string) {
	var app *firebase.App
	var err error
	if useEmulator {
		conf := &firebase.Config{ProjectID: projectID}
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
	AuthClient = authClient

	firestoreClient, err := app.Firestore(context.Background())
	if err != nil {
		log.Fatalf("Failed to initialize Firestore client: %v", err)
	}
	FirestoreClient = firestoreClient

	UseEmulator = useEmulator
}
