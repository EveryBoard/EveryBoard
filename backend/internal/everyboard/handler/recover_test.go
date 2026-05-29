package handler

import (
	"testing"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/apperror"
)

func TestRecoverMiddleware(t *testing.T) {
	err := RecoverMiddleware("testuser", func() error {
		panic("something went wrong")
	})
	if err != apperror.ErrorInternal {
		t.Errorf("expected ErrorInternal, got %v", err)
	}
}
