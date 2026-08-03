package notification

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/logger"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/model"
)

const queueSize = 16

type webhookPayload struct {
	Content         string          `json:"content"`
	// Allowed mentions is a field required for discord's webhooks
	AllowedMentions allowedMentions `json:"allowed_mentions"`
}

type allowedMentions struct {
	Parse []string `json:"parse"`
}

type Webhook struct {
	client   *http.Client
	endpoint string
	queue    chan webhookPayload
}

func NewWebhook(endpoint string) (*Webhook, error) {
	parsed, err := url.Parse(endpoint)
	if err != nil || (parsed.Scheme != "http" && parsed.Scheme != "https") || parsed.Host == "" {
		return nil, fmt.Errorf("invalid webhook URL")
	}
	return newWebhook(&http.Client{Timeout: 5 * time.Second}, endpoint), nil
}

func newWebhook(client *http.Client, endpoint string) *Webhook {
	w := &Webhook{
		client:   client,
		endpoint: endpoint,
		queue:    make(chan webhookPayload, queueSize),
	}
	go w.run()
	return w
}

func (w *Webhook) GameStarted(game model.Game) {
	w.enqueue(webhookPayload{Content: fmt.Sprintf(
		"**%s game started** — %s vs %s (game %d)",
		game.GameName, game.PlayerZero.Name, game.PlayerOne.Name, game.GameID,
	), AllowedMentions: allowedMentions{Parse: []string{}}})
}

func (w *Webhook) GameFinished(game model.Game) {
	w.enqueue(webhookPayload{Content: fmt.Sprintf(
		"**%s game finished** — %s vs %s: %s (game %d)",
		game.GameName, game.PlayerZero.Name, game.PlayerOne.Name, game.Result, game.GameID,
	), AllowedMentions: allowedMentions{Parse: []string{}}})
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
