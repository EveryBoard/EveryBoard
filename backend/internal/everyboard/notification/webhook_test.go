package notification

import (
	"encoding/json"
	"io"
	"net/http"
	"strings"
	"testing"
	"time"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/model"
	"github.com/stretchr/testify/require"
)

func TestWebhookPublishesGameLifecycle(t *testing.T) {
	requests := make(chan *http.Request, 2)
	payloads := make(chan webhookPayload, 2)
	client := &http.Client{Transport: roundTripperFunc(func(r *http.Request) (*http.Response, error) {
		var payload webhookPayload
		require.NoError(t, json.NewDecoder(r.Body).Decode(&payload))
		requests <- r.Clone(r.Context())
		payloads <- payload
		return &http.Response{
			StatusCode: http.StatusNoContent,
			Body:       io.NopCloser(strings.NewReader("")),
			Header:     make(http.Header),
		}, nil
	})}

	notifier := newWebhook(client, "https://discord.com/api/webhooks/id/token", "https://everyboard.org")
	game := model.Game{
		GameID:     42,
		GameName:   "P4",
		PlayerZero: model.MinimalUser{Name: "Alice"},
		PlayerOne:  model.MinimalUser{Name: "Bob"},
		Result:     model.ResultResignOfOne,
	}
	notifier.GameStarted(game)
	notifier.GameFinished(game)

	for _, expected := range []string{
		"Game started! Alice vs. Bob on P4. [Observe the game](https://everyboard.org/play/P4/JgaEB).",
		"Game finished! Alice won against Bob on P4.",
	} {
		select {
		case req := <-requests:
			require.Equal(t, http.MethodPost, req.Method)
			require.Equal(t, "application/json", req.Header.Get("Content-Type"))
			payload := <-payloads
			require.Equal(t, expected, payload.Content)
			require.Empty(t, payload.AllowedMentions.Parse)
		case <-time.After(time.Second):
			t.Fatal("timed out waiting for webhook request")
		}
	}
}

func TestWebhookPublishesBotDisplayNames(t *testing.T) {
	// Given a notifier and a game played by bots
	payloads := make(chan webhookPayload, 2)
	client := &http.Client{Transport: roundTripperFunc(func(r *http.Request) (*http.Response, error) {
		var payload webhookPayload
		require.NoError(t, json.NewDecoder(r.Body).Decode(&payload))
		payloads <- payload
		return &http.Response{
			StatusCode: http.StatusNoContent,
			Body:       io.NopCloser(strings.NewReader("")),
			Header:     make(http.Header),
		}, nil
	})}
	notifier := newWebhook(client, "https://discord.com/api/webhooks/id/token", "https://everyboard.org")
	game := model.Game{
		GameID:   42,
		GameName: "P4",
		PlayerZero: model.MinimalUser{
			Name: "bot-account-zero",
		},
		PlayerZeroBotIdentifier: &model.BotIdentifier{DisplayName: "Perfect P4"},
		PlayerOne: model.MinimalUser{
			Name: "bot-account-one",
		},
		PlayerOneBotIdentifier: &model.BotIdentifier{DisplayName: "MCTS P4"},
		Result:                 model.ResultResignOfOne,
	}

	// When the game starts and finishes
	notifier.GameStarted(game)
	notifier.GameFinished(game)

	// Then both notifications use the bot display names
	for _, expected := range []string{
		"Game started! Perfect P4 vs. MCTS P4 on P4. [Observe the game](https://everyboard.org/play/P4/JgaEB).",
		"Game finished! Perfect P4 won against MCTS P4 on P4.",
	} {
		select {
		case payload := <-payloads:
			require.Equal(t, expected, payload.Content)
		case <-time.After(time.Second):
			t.Fatal("timed out waiting for webhook request")
		}
	}
}

type roundTripperFunc func(*http.Request) (*http.Response, error)

func (f roundTripperFunc) RoundTrip(request *http.Request) (*http.Response, error) {
	return f(request)
}

func TestNewWebhookRejectsInvalidURL(t *testing.T) {
	_, err := NewWebhook("not a URL", "https://everyboard.org")
	require.Error(t, err)
}

func TestNewWebhookRejectsInvalidFrontendURL(t *testing.T) {
	_, err := NewWebhook("https://discord.com/api/webhooks/id/token", "not a URL")
	require.Error(t, err)
}
