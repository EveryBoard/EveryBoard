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

type migration struct {
	name  string
	model any
}

func autoMigrate(db *gorm.DB, migrations ...migration) error {
	for _, migration := range migrations {
		if err := db.AutoMigrate(migration.model); err != nil {
			return fmt.Errorf("cannot initialize DB (AutoMigrate %s): %v", migration.name, err)
		}
	}
	return nil
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

	err = autoMigrate(db, migration{"model.ConfigRoom", &model.ConfigRoom{}})
	if err != nil {
		return nil, err
	}

	// Create first config room, which is actually the lobby
	result := db.First(&model.ConfigRoom{}, "id = ?", model.GameIDLobby)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		// The ID of the lobby will be the first available id, hence 1 (We can't
		// set it ourselves otherwise the "autoIncrement" feature of postgresql
		// will be confused and try to allocate 1 as the next id)
		lobby := model.ConfigRoom{
			Creator:     model.MinimalUser{},
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

	err = autoMigrate(db,
		migration{"model.Message", &model.Message{}},
		migration{"model.Elo", &model.Elo{}},
		migration{"model.Candidate", &model.Candidate{}},
		migration{"model.Game", &model.Game{}},
		migration{"model.GameEvent", &model.GameEvent{}},
		migration{"model.CurrentGame", &model.CurrentGame{}},
	)
	if err != nil {
		return nil, err
	}
	result = db.Exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_current_games_user_id ON current_games (user_id)")
	if result.Error != nil {
		return nil, fmt.Errorf("cannot initialize DB (Create current-game user index): %v", result.Error)
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
