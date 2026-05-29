package store

import (
	"errors"
	"fmt"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/model"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	gormLogger "gorm.io/gorm/logger"
)

func wrapError(ctx string, err error) error {
	if err == nil {
		return nil
	}
	return fmt.Errorf("error in %s: %w", ctx, err)
}

type GORMStore struct {
	db *gorm.DB
}

// Initialize the database given a dialector, which will either be in-memory
// SQLite for testing (sqlite.Open(":memory:")) or another DB for production (e.g., postgres.Open("some-dsn").)
func InitDatabase(dialector gorm.Dialector) (*GORMStore, error) {
	db, err := gorm.Open(dialector, &gorm.Config{
		Logger:         gormLogger.Default.LogMode(gormLogger.Silent), // we will log errors ourselves
		TranslateError: true,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to DB: %v", err)
	}

	switch dialector.(type) {
	case *sqlite.Dialector:
		// In case we have sqlite, we only want one connection. Otherwise, this renders tests flaky.
		sqlDB, _ := db.DB()
		sqlDB.SetMaxOpenConns(1)
		sqlDB.SetMaxIdleConns(1)
	}

	err = db.AutoMigrate(&model.ConfigRoom{})
	if err != nil {
		return nil, fmt.Errorf("cannot initialize DB (AutoMigrate model.ConfigRoom): %v", err)
	}

	// Create first config room, which is actually the lobby
	result := db.First(&model.ConfigRoom{}, "id = ?", model.GameIDLobby)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		// The ID of the lobby will be the first available id, hence 1 (We can't
		// set it ourselves otherwise the "autoIncrement" feature of postgresql
		// will be confused and try to allocate 1 as the next id)
		lobby := model.ConfigRoom{
			Creator:     model.MinimalUser{Name: "", ID: ""},
			CreatorElo:  0,
			Status:      model.StatusFinished,
			FirstPlayer: model.FirstPlayerRandom,
			GameType:    model.GameTypeStandard,
			RulesConfig: nil,
			GameName:    "lobby",
		}
		result := db.Create(&lobby)
		if result.Error != nil {
			return nil, fmt.Errorf("cannot initialize DB (Create lobby): %v", result.Error)
		}
	}

	err = db.AutoMigrate(&model.Message{})
	if err != nil {
		return nil, fmt.Errorf("cannot initialize DB (AutoMigrate model.Message): %v", err)
	}

	err = db.AutoMigrate(&model.Elo{})
	if err != nil {
		return nil, fmt.Errorf("cannot initialize DB (AutoMigrate model.Elo): %v", err)
	}

	err = db.AutoMigrate(&model.Candidate{})
	if err != nil {
		return nil, fmt.Errorf("cannot initialize DB (AutoMigrate model.Candidate): %v", err)
	}

	err = db.AutoMigrate(&model.Game{})
	if err != nil {
		return nil, fmt.Errorf("cannot initialize DB (AutoMigrate model.Game): %v", err)
	}

	err = db.AutoMigrate(&model.GameEvent{})
	if err != nil {
		return nil, fmt.Errorf("cannot initialize DB (AutoMigrate model.GameEvent): %v", err)
	}

	err = db.AutoMigrate(&model.CurrentGame{})
	if err != nil {
		return nil, fmt.Errorf("cannot initialize DB: %v (AutoMigrate model.CurrentGame)", err)
	}
	return &GORMStore{db}, nil
}

func (s *GORMStore) DB() *gorm.DB {
	return s.db
}

func (s *GORMStore) Transaction(f func(store Store) error) error {
	return s.db.Transaction(func(db *gorm.DB) error {
		store := &GORMStore{db}
		return f(store)
	})
}
