package handler

import (
	"github.com/stretchr/testify/assert"
	"testing"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/apperror"
)

func TestRecoverMiddleware(t *testing.T) {
	err := RecoverMiddleware("testuser", func() error {
		panic("something went wrong")
	})
	assert.Equal(t, apperror.ErrorInternal, err, "expected ErrorInternal")
}
