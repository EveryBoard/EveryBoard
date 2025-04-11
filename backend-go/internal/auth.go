package internal

import (
	"context"
	"net/http"
	"strings"
	"fmt"
	"encoding/base64"
	"encoding/json"
)

type User struct {
	Username string `json:"username"`
}

func FetchUserDocument(uid string) (*User, error) {
	docRef := FirestoreClient.Collection("users").Doc(uid)
	docSnapshot, err := docRef.Get(context.Background())
	if err != nil {
		return nil, fmt.Errorf("failed to fetch user document: %v", err)
	}

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
		return "", nil, fmt.Errorf("No authorization header")
	}

	parts := strings.SplitN(authorizationHeader, ",", 2)
	if len(parts) != 2 || strings.TrimSpace(parts[0]) != "Authorization" {
		return "", nil, fmt.Errorf("Invalid authorization header")
	}
	token := strings.TrimSpace(parts[1])

	var uid string
	if UseEmulator {
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
			return "", nil, fmt.Errorf("Missing 'sub' part of token")
		}

		uid = sub;
	} else {
		verifiedToken, err := AuthClient.VerifyIDToken(r.Context(), token)
		if err != nil {
			return "", nil, err
		}

		sub, ok := verifiedToken.Claims["sub"].(string)
		if !ok {
			return "", nil, fmt.Errorf("Missing 'sub' part of token")
		}
		uid = sub
	}

	// TODO: most of the time, we likely don't need the user document, maybe only fetch it when needed? Also, we could cache them as the username cannot change
	user, err := FetchUserDocument(uid)
	return uid, user, err
}
