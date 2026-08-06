package handler

import (
	"github.com/EveryBoard/EveryBoard/internal/everyboard/apperror"
	"runtime/debug"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/logger"
)

// RecoverMiddleware handles panics in message handlers to prevent server crashes
func RecoverMiddleware(username string, f func() error) (err error) {
	defer func() {
		if r := recover(); r != nil {
			logger.Error.Printf("Panic in handler for user %s: %v\nStack trace:\n%s", username, r, debug.Stack())
			err = apperror.ErrorInternal
		}
	}()
	return f()
}
