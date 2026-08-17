package notification

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/logger"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/model"
)

const queueSize = 16

type webhookPayload struct {
	Content string `json:"content"`
	// Allowed mentions is a field required for discord's webhooks
	AllowedMentions allowedMentions `json:"allowed_mentions"`
}

type allowedMentions struct {
	Parse []string `json:"parse"`
}

type Webhook struct {
	client      *http.Client
	endpoint    string
	frontendURL string
	queue       chan webhookPayload
}

func NewWebhook(endpoint string, frontendURL string) (*Webhook, error) {
	parsed, err := url.Parse(endpoint)
	if err != nil || (parsed.Scheme != "http" && parsed.Scheme != "https") || parsed.Host == "" {
		return nil, fmt.Errorf("invalid webhook URL")
	}
	frontend, err := url.Parse(frontendURL)
	if err != nil || (frontend.Scheme != "http" && frontend.Scheme != "https") || frontend.Host == "" {
		return nil, fmt.Errorf("invalid frontend URL")
	}
	return newWebhook(&http.Client{Timeout: 5 * time.Second}, endpoint, frontendURL), nil
}

func newWebhook(client *http.Client, endpoint string, frontendURL string) *Webhook {
	w := &Webhook{
		client:      client,
		endpoint:    endpoint,
		frontendURL: strings.TrimRight(frontendURL, "/"),
		queue:       make(chan webhookPayload, queueSize),
	}
	go w.run()
	return w
}

func (w *Webhook) GameStarted(game model.Game) {
	w.enqueue(webhookPayload{Content: fmt.Sprintf(
		"Game started! %s vs. %s on %s. [Observe the game](%s).",
		game.PlayerZero.Name, game.PlayerOne.Name, game.GameName, w.observeURL(game),
	), AllowedMentions: allowedMentions{Parse: []string{}}})
}

func (w *Webhook) GameFinished(game model.Game) {
	w.enqueue(webhookPayload{Content: fmt.Sprintf(
		"Game finished! %s on %s.",
		resultSummary(game), game.GameName,
	), AllowedMentions: allowedMentions{Parse: []string{}}})
}

func (w *Webhook) observeURL(game model.Game) string {
	gameID, err := model.EncodeID(game.GameID)
	if err != nil {
		logger.Error.Printf("cannot encode game ID for webhook notification: %v", err)
		return w.frontendURL
	}
	return fmt.Sprintf("%s/play/%s/%s", w.frontendURL, url.PathEscape(game.GameName), gameID)
}

func resultSummary(game model.Game) string {
	if game.Result.IsVictoryOfZero() {
		return fmt.Sprintf("%s won against %s", game.PlayerZero.Name, game.PlayerOne.Name)
	}
	if game.Result.IsVictoryOfOne() {
		return fmt.Sprintf("%s won against %s", game.PlayerOne.Name, game.PlayerZero.Name)
	}
	return fmt.Sprintf("%s and %s drew", game.PlayerZero.Name, game.PlayerOne.Name)
}

func (w *Webhook) enqueue(payload webhookPayload) {
	select {
	case w.queue <- payload:
	default:
		logger.Error.Printf("webhook notification dropped: queue is full")
	}
}

func (w *Webhook) run() {
	for payload := range w.queue {
		if err := w.publish(payload); err != nil {
			logger.Error.Printf("cannot publish webhook notification: %v", err)
		}
	}
}

func (w *Webhook) publish(payload webhookPayload) error {
	logger.Debug.Printf("Webhook publish: %s", payload.Content)
	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	req, err := http.NewRequest(http.MethodPost, w.endpoint, bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := w.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	_, _ = io.Copy(io.Discard, resp.Body)
	if resp.StatusCode < http.StatusOK || resp.StatusCode >= http.StatusMultipleChoices {
		return fmt.Errorf("webhook returned HTTP %d", resp.StatusCode)
	}
	return nil
}
