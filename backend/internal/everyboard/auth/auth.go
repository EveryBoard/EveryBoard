package auth

import (
	"context"
	"fmt"
	"net/http"
	"strings"
)

type User struct {
	Username string `json:"username"`
	IsBot    bool   `json:"-"`
	// User may have other fields, but we don't care about them
}

func FetchUserDocument(context context.Context, uid string) (*User, error) {
	return FetchUserDocumentWithClient(firebaseClient, context, uid)
}

func FetchUserDocumentWithClient(client FirebaseLike, context context.Context, uid string) (*User, error) {
	doc, err := client.Fetch(context, "users", uid)
	if err != nil {
		return nil, err
	}
	username, ok := doc["username"].(string)
	if !ok {
		return nil, fmt.Errorf("user document does not contain a string 'username'")
	}
	isBot, ok := doc["isBot"].(bool)
	if !ok {
		isBot = false
	}
	return &User{Username: username, IsBot: isBot}, nil
}

func VerifyTokenAndGetUser(r *http.Request) (string, *User, error) {
	return VerifyTokenAndGetUserWithClient(firebaseClient, r)
}

func VerifyTokenAndGetUserWithClient(client FirebaseLike, r *http.Request) (string, *User, error) {
	authorizationHeader := r.Header.Get("Sec-WebSocket-Protocol")
	if authorizationHeader == "" {
		return "", nil, fmt.Errorf("no authorization header")
	}

	parts := strings.SplitN(authorizationHeader, ",", 2)
	if len(parts) != 2 || strings.TrimSpace(parts[0]) != "Authorization" {
		return "", nil, fmt.Errorf("invalid authorization header")
	}
	token := strings.TrimSpace(parts[1])

	uid, err := client.VerifyToken(r.Context(), token)
	if err != nil {
		return "", nil, err
	}

	user, err := FetchUserDocumentWithClient(client, r.Context(), uid)
	return uid, user, err
}
