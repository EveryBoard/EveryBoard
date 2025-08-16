package auth

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"strings"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"google.golang.org/api/option"
)

type FirebaseLike interface {
	// We need to be able to initialize it
	Initialize() error
	// We need to fetch some document; which is returned as a map from string to
	// values of any type, which will eventually get deserialized The context is
	// linking what is done here with the request being handled; this is a go
	// concept that allows for example to cancel the firestore request in case
	// the client that made the initial request has left.
	Fetch(context context.Context, collection string, path string) (map[string]interface{}, error)
	// Verify an identity token and returns the user id that it corresponds to.
	// If it's not a valid token, it returns an error instead.
	VerifyToken(context context.Context, token string) (string, error)
}

// This is the interface to firebase
var firebaseClient FirebaseLike

// Change the interface to firebase, for testing purposes
func SetFirebaseClient(client FirebaseLike) {
	firebaseClient = client
}

// Initialize the firebase client
func InitFirebase() error {
	return firebaseClient.Initialize()
}

type Firebase struct {
	UseEmulator bool
	ProjectID string
	ServiceAccountFile string
	auth *auth.Client
	firestore *firestore.Client
}

func (f *Firebase) Initialize() error {
	var app *firebase.App
	var err error
	if f.UseEmulator {
		conf := &firebase.Config{ProjectID: f.ProjectID}
		app, err = firebase.NewApp(context.Background(), conf)
		if err != nil {
			return fmt.Errorf("cannot initialize firebase with emulator: %v", err)
		}
	} else {
		opts := option.WithCredentialsFile(f.ServiceAccountFile)
		app, err = firebase.NewApp(context.Background(), nil, opts)
		if err != nil {
			return fmt.Errorf("cannot connect to firebase: %v", err)
		}
	}

	authClient, err := app.Auth(context.Background())
	if err != nil {
		return fmt.Errorf("cannot setup firebase auth: %v", err)
	}

	firestoreClient, err := app.Firestore(context.Background())
	if err != nil {
		return fmt.Errorf("cannot setup firebase firestore: %v", err)
	}

	f.auth = authClient
	f.firestore = firestoreClient
	return nil
}

func (f Firebase) Fetch(context context.Context, collection string, path string) (map[string]interface{}, error) {
	docRef := f.firestore.Collection(collection).Doc(path)
	docSnapshot, err := docRef.Get(context)
	if err != nil {
		return nil, fmt.Errorf("cannot fetch document: %v", err)
	}
	return docSnapshot.Data(), nil
}

func (f Firebase) VerifyToken(context context.Context, token string) (string, error) {
	if f.UseEmulator {
		// It would be too nice if the emulator behaved like firebase... But it doesn't.
		// So we need to manually check the token that is created by the emulator.
		tokenParts := strings.Split(token, ".")
		if len(tokenParts) != 3 {
			return "", fmt.Errorf("invalid token format") // token must be 3 parts (header, payload, signature) separated by dots
		}

		// We only care here about the second part, which contains the payload
		payloadBytes, err := base64.RawURLEncoding.DecodeString(tokenParts[1])
		if err != nil {
			return "", fmt.Errorf("invalid payload encoding") // payload is not a b64 string
		}

		var claims map[string]interface{}
		err = json.Unmarshal(payloadBytes, &claims)
		if err != nil {
			return "", fmt.Errorf("invalid payload") // payload cannot be decoded as a map
		}

		sub, ok := claims["sub"].(string)
		if !ok {
			return "", fmt.Errorf("missing 'sub' part of token")
		}
		return sub, nil
	} else {
		verifiedToken, err := f.auth.VerifyIDToken(context, token)
		if err != nil {
			return "", fmt.Errorf("invalid token: %v", err)
		}
		user_id, ok := verifiedToken.Claims["user_id"].(string)
		if !ok {
			return "", fmt.Errorf("missing 'user_id' part of token")
		}
		return user_id, err
	}
}
