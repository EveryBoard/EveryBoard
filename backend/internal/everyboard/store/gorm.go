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
			return fmt.Errorf("cannot initialize DB (AutoMigrate %s): %w", migration.name, err)
		}
	}
	return nil
}

func migrateCandidates(db *gorm.DB) error {
	if err := db.AutoMigrate(&model.Candidate{}); err != nil {
		return fmt.Errorf("cannot initialize DB (AutoMigrate model.Candidate): %w", err)
	}

	legacyColumns := []struct {
		legacy  string
		current string
	}{
		{legacy: "user_id", current: "player_id"},
		{legacy: "user_name", current: "player_name"},
		{legacy: "elo", current: "player_elo"},
		{legacy: "bot_identifier", current: "player_bot_identifier"},
	}
	for _, columns := range legacyColumns {
		if !db.Migrator().HasColumn("candidates", columns.legacy) {
			continue
		}
		result := db.Exec(fmt.Sprintf(
			"UPDATE candidates SET %s = %s WHERE %s IS NULL",
			columns.current,
			columns.legacy,
			columns.current,
		))
		if result.Error != nil {
			return fmt.Errorf("cannot migrate candidates column %s: %w", columns.legacy, result.Error)
		}
		if err := db.Migrator().DropColumn(&model.Candidate{}, columns.legacy); err != nil {
			return fmt.Errorf("cannot remove legacy candidates column %s: %w", columns.legacy, err)
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
		return nil, fmt.Errorf("failed to connect to DB: %w", err)
	}

	if _, ok := dialector.(*sqlite.Dialector); ok {
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
			Creator:     model.PlayerInfo{User: model.MinimalUser{}, Elo: 0},
			Status:      model.StatusFinished,
			FirstPlayer: model.FirstPlayerRandom,
			GameType:    model.GameTypeStandard,
			RulesConfig: nil,
			GameName:    "lobby",
		}
		result := db.Create(&lobby)
		if result.Error != nil {
			return nil, fmt.Errorf("cannot initialize DB (Create lobby): %w", result.Error)
		}
	}

	err = autoMigrate(db,
		migration{"model.Message", &model.Message{}},
		migration{"model.Elo", &model.Elo{}},
		migration{"model.Game", &model.Game{}},
		migration{"model.GameEvent", &model.GameEvent{}},
		migration{"model.CurrentGame", &model.CurrentGame{}},
	)
	if err != nil {
		return nil, err
	}
	if err = migrateCandidates(db); err != nil {
		return nil, err
	}
	result = db.Exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_current_games_user_id ON current_games (user_id)")
	if result.Error != nil {
		return nil, fmt.Errorf("cannot initialize DB (Create current-game user index): %w", result.Error)
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
