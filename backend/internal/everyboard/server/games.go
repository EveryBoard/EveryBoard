package server

import (
	"encoding/json"
	"net/http"
	"net/url"
	"strings"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/model"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/store"
)

type gameEntry struct {
	model.Game
	URL string `json:"url"`
}

func gamesHandler(frontendURL string, gameStore store.GameStore) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.Header().Set("Allow", http.MethodGet)
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}

		games, err := gameStore.ListGames()
		if err != nil {
			http.Error(w, "could not list games", http.StatusInternalServerError)
			return
		}

		entries := make([]gameEntry, 0, len(games))
		for _, game := range games {
			encodedID, err := model.EncodeID(game.GameID)
			if err != nil {
				http.Error(w, "could not encode game id", http.StatusInternalServerError)
				return
			}
			gameURL := strings.TrimRight(frontendURL, "/") + "/play/" +
				url.PathEscape(game.GameName) + "/" + url.PathEscape(encodedID)
			entries = append(entries, gameEntry{Game: game, URL: gameURL})
		}

		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(entries); err != nil {
			return
		}
	})
}
