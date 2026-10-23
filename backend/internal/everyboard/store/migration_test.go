package store

import (
	"testing"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/model"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type legacyCandidate struct {
	ID       uint64 `gorm:"primaryKey"`
	GameID   model.GameID
	UserID   string
	UserName string
	Elo      float64 `gorm:"not null"`
}

func (legacyCandidate) TableName() string {
	return "candidates"
}

func TestMigrateCandidatesRemovesLegacyColumns(t *testing.T) {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	require.NoError(t, err, "cannot initialize legacy db")
	testMigrateCandidatesRemovesLegacyColumns(t, db)
}

func TestPostgresMigrateCandidatesRemovesLegacyColumns(t *testing.T) {
	db, err := gorm.Open(postgresTestDialector(t), &gorm.Config{})
	require.NoError(t, err, "cannot initialize legacy postgres db")
	t.Cleanup(func() {
		sqlDB, dbErr := db.DB()
		require.NoError(t, dbErr, "cannot access postgres test connection")
		require.NoError(t, sqlDB.Close(), "cannot close postgres test connection")
	})
	testMigrateCandidatesRemovesLegacyColumns(t, db)
}

func testMigrateCandidatesRemovesLegacyColumns(t *testing.T, db *gorm.DB) {
	t.Helper()
	require.NoError(t, db.AutoMigrate(&legacyCandidate{}), "cannot create legacy candidates table")
	require.NoError(t, db.Create(&legacyCandidate{
		GameID:   12,
		UserID:   "foo",
		UserName: "Foo",
		Elo:      42,
	}).Error, "cannot create legacy candidate")

	require.NoError(t, migrateCandidates(db), "cannot migrate candidates")
	require.NoError(t, migrateCandidates(db), "candidate migration should be idempotent")
	for _, column := range []string{"user_id", "user_name", "elo"} {
		assert.False(t, db.Migrator().HasColumn("candidates", column),
			"legacy candidate column %s still exists", column)
	}
	for _, column := range model.CandidateRows {
		assert.True(t, db.Migrator().HasColumn("candidates", column),
			"current candidate column %s is missing", column)
	}

	var candidate model.Candidate
	require.NoError(t, db.First(&candidate, 1).Error, "cannot read migrated candidate")
	assert.Equal(t, model.GameID(12), candidate.GameID)
	assert.Equal(t, model.MinimalUser{ID: "foo", Name: "Foo"}, candidate.PlayerInfo.User)
	assert.InDelta(t, 42.0, candidate.PlayerInfo.Elo, 0.000001)

	store := &GORMStore{db: db}
	err := store.AddCandidate(
		&model.ConfigRoom{ID: 13},
		model.MinimalUser{ID: "bar", Name: "Bar"},
		84,
		nil,
	)
	require.NoError(t, err, "cannot add candidate after migration")
}
