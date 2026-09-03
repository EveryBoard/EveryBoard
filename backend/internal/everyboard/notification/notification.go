package notification

import "github.com/EveryBoard/EveryBoard/internal/everyboard/model"

// Notifier reports committed game lifecycle changes. Implementations must not
// block callers; notifications are operational side effects, not game state.
type Notifier interface {
	GameStarted(game model.Game)
	GameFinished(game model.Game)
}

type Noop struct{}

func (Noop) GameStarted(model.Game)  {}
func (Noop) GameFinished(model.Game) {}
