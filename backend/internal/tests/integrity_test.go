package internal

import (
	"sync"
	"testing"
	"time"

	"github.com/EveryBoard/EveryBoard/internal/model"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gorm.io/driver/sqlite"
)

func TestCreateGame_RaceCondition(t *testing.T) {
	store, err := model.InitDatabase(sqlite.Open(":memory:"))
	require.NoError(t, err)

	user := model.MinimalUser{ID: "user1", Name: "User 1"}
	gameName := "p4"

	// Simulate concurrent game creation requests
	const numRequests = 20
	var wg sync.WaitGroup
	wg.Add(numRequests)

	errors := make(chan error, numRequests)

	for i := 0; i < numRequests; i++ {
		go func(id int) {
			defer wg.Done()
			
			err := store.Transaction(func(s model.Store) error {
				cg, err := s.GetCurrentGame(user)
				if err != nil {
					return err
				}
				if cg != nil {
					return model.ErrorAlreadySubscribed
				}

				// Small delay to increase overlapping
				time.Sleep(10 * time.Millisecond)

				cr, err := s.CreateConfigRoom(user, gameName)
				if err != nil {
					return err
				}

				return s.SetCurrentGame(&model.CurrentGame{
					UserID:   user.ID,
					UserName: user.Name,
					GameID:   cr.ID,
					GameName: gameName,
					Creator:  user,
					Role:     model.UserRoleCreator,
				})
			})
			if err != nil {
				errors <- err
			}
		}(i)
	}

	wg.Wait()
	close(errors)

	errCount := 0
	for err := range errors {
		t.Logf("Request failed with error: %v", err)
		assert.Equal(t, model.ErrorAlreadySubscribed, err)
		errCount++
	}

	// Count how many games were actually created
	var configRooms []model.ConfigRoom
	err = store.ApplyToConfigRooms(func(cr model.ConfigRoom) error {
		if cr.Creator.ID == user.ID {
			configRooms = append(configRooms, cr)
		}
		return nil
	})
	require.NoError(t, err)

	numSuccess := numRequests - errCount
	
	t.Logf("Successful creations: %d", numSuccess)
	t.Logf("Games in DB: %d", len(configRooms))

	// We WANT len(configRooms) to be 1 and numSuccess to be 1.
	// In the current buggy state, both might be > 1.
	assert.Equal(t, 1, len(configRooms), "Should only have created one game")
	assert.Equal(t, 1, numSuccess, "Should only have one successful creation")
}
