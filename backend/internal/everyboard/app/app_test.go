package app

import (
	"context"
	"fmt"
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
	return fmt.Errorf("forced firebase failure")
}

type firebaseMock struct {
}

func (f firebaseMock) Initialize() error {
	return nil
}

func (f firebaseMock) Fetch(context context.Context, collection string, path string) (map[string]interface{}, error) {
	return map[string]interface{}{"username": path}, nil
}

func (f firebaseMock) VerifyToken(context context.Context, token string) (string, error) {
	return "user", nil
}

type failingDialector struct {
	gorm.Dialector
}

func (d failingDialector) Initialize(db *gorm.DB) error {
	return fmt.Errorf("forced dialector failure")
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
