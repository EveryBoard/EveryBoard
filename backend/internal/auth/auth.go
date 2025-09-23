package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
)

type User struct {
	Username string `json:"username"`
	// User may have other fields, but we don't care about them
}

func fetchUserDocument(context context.Context, uid string) (*User, error) {
	doc, err := firebaseClient.Fetch(context, "users", uid)
	if err != nil {
		return nil, err
	}
	data, err := json.Marshal(doc)
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

func VerifyTokenAndGetUser(r *http.Request) (string, *User, error) {
	authorizationHeader := r.Header.Get("Sec-WebSocket-Protocol")
	if authorizationHeader == "" {
		return "", nil, fmt.Errorf("no authorization header")
	}

	parts := strings.SplitN(authorizationHeader, ",", 2)
	if len(parts) != 2 || strings.TrimSpace(parts[0]) != "Authorization" {
		return "", nil, fmt.Errorf("invalid authorization header")
	}
	token := strings.TrimSpace(parts[1])

	uid, err := firebaseClient.VerifyToken(r.Context(), token)
	if err != nil {
		return "", nil, err
	}

	user, err := fetchUserDocument(r.Context(), uid)
	return uid, user, err
}
