package auth

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
)

type User struct {
	Username string `json:"username"`
	// User may have other fields, but we don't care about them
}

func fetchUserDocument(uid string) (*User, error) {
	log.Println("reference to doc")
	docRef := firestoreClient.Collection("users").Doc(uid)
	log.Println("getting snapshot")
	docSnapshot, err := docRef.Get(context.Background())
	if err != nil {
		return nil, fmt.Errorf("failed to fetch user document: %v", err)
	}
	log.Println("got snapshot")

	data, err := json.Marshal(docSnapshot.Data())
	if err != nil {
		return nil, fmt.Errorf("cannot encode user: %v", err)
	}
	var user User
	err = json.Unmarshal(data, &user)
	if err != nil {
		return nil, fmt.Errorf("cannot decode user: %v", err)
	}
	return &user, nil
}

func VerifyTokenAndGetUserFromHeader(r *http.Request) (string, *User, error) {
	authorizationHeader := r.Header.Get("Sec-WebSocket-Protocol")
	if authorizationHeader == "" {
		return "", nil, fmt.Errorf("no authorization header")
	}

	parts := strings.SplitN(authorizationHeader, ",", 2)
	if len(parts) != 2 || strings.TrimSpace(parts[0]) != "Authorization" {
		return "", nil, fmt.Errorf("invalid authorization header")
	}
	token := strings.TrimSpace(parts[1])

	var uid string
	if useEmulator {
		log.Println("In emulator mode")
		tokenParts := strings.Split(token, ".")
		if len(tokenParts) != 3 {
			return "", nil, fmt.Errorf("invalid token format")
		}

		payloadBytes, err := base64.RawURLEncoding.DecodeString(tokenParts[1])
		if err != nil {
			return "", nil, err
		}

		var claims map[string]interface{}
		if err := json.Unmarshal(payloadBytes, &claims); err != nil {
			return "", nil, err
		}

		sub, ok := claims["sub"].(string)
		if !ok {
			return "", nil, fmt.Errorf("missing 'sub' part of token")
		}

		uid = sub
	} else {
		log.Println("Verifying token")
		verifiedToken, err := authClient.VerifyIDToken(r.Context(), token)
		if err != nil {
			return "", nil, err
		}
		log.Println("Token verified")

		log.Println("%v", verifiedToken.Claims)
		user_id, ok := verifiedToken.Claims["user_id"].(string)
		if !ok {
			return "", nil, fmt.Errorf("missing 'user_id' part of token")
		}
		uid = user_id
	}

	log.Println("Fetching user document")
	user, err := fetchUserDocument(uid)
	log.Println("Got it")
	return uid, user, err
}
