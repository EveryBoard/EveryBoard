package auth

import (
	"context"
	"log"

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
	conf := &firebase.Config{ProjectID: projectID}
	if useEmulatorValue {
		app, err = firebase.NewApp(context.Background(), conf)
	} else {
		app, err = firebase.NewApp(context.Background(), conf, option.WithCredentialsFile(serviceAccountFile))
	}
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
