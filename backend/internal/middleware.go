package internal

import (
	"runtime/debug"

	"github.com/EveryBoard/EveryBoard/internal/model"
	"github.com/EveryBoard/EveryBoard/internal/utils"
)

// RecoverMiddleware handles panics in message handlers to prevent server crashes
func RecoverMiddleware(username string, f func() error) (err error) {
	defer func() {
		if r := recover(); r != nil {
			utils.DefaultLogger.Errorf("Panic in handler for user %s: %v\nStack trace:\n%s", username, r, debug.Stack())
			err = model.ErrorInternal
		}
	}()
	return f()
}
