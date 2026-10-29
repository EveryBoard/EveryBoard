package app

import (
	"context"
	"errors"
	"testing"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/auth"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/config"
	"github.com/stretchr/testify/require"
	"gorm.io/gorm"
)

type failingFirebase struct {
	auth.Firebase
}

func (f failingFirebase) Initialize() error {
	return errors.New("forced firebase failure")
}

type firebaseMock struct {
}

func (f firebaseMock) Initialize() error {
	return nil
}

func (f firebaseMock) Fetch(_ context.Context, _ string, path string) (map[string]any, error) {
	return map[string]any{"username": path}, nil
}

func (f firebaseMock) VerifyToken(_ context.Context, _ string) (string, error) {
	return "user", nil
}

type failingDialector struct {
	gorm.Dialector
}

func (d failingDialector) Initialize(_ *gorm.DB) error {
	return errors.New("forced dialector failure")
}

func TestPrepareFailures(t *testing.T) {
	t.Run("FirebaseFailure", func(t *testing.T) {
		cfg := &config.Configuration{
			Firebase: failingFirebase{},
			Origin:   "*",
		}
		_, err := Prepare(cfg, NewDependencies())
		require.Error(t, err, "error when preparing the server")
	})

	t.Run("DatabaseFailure", func(t *testing.T) {
		cfg := &config.Configuration{
			Firebase: firebaseMock{},
			Database: failingDialector{},
			Origin:   "*",
		}

		_, err := Prepare(cfg, NewDependencies())
		require.Error(t, err, "error when preparing the server")
	})
}
