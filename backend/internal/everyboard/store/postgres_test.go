package store

import (
	"fmt"
	"net/url"
	"os"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// This helper creates a postgres store, useful for doing integration testing
// These tests are run when POSTGRES_TEST_DSN is set as an environment variable, pointing to a postgres deployment.
// If the environment variable is not set, the test will be skipped.
func postgresTestStore(t *testing.T) *GORMStore {
	t.Helper()
	dsn := os.Getenv("POSTGRES_TEST_DSN")
	if dsn == "" {
		t.Skip("POSTGRES_TEST_DSN is not configured")
	}

	// Tests will be run in a unique schema that will be removed after the test
	schema := fmt.Sprintf("everyboard_test_%d", time.Now().UnixNano())
	adminDB, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	require.NoError(t, err, "cannot connect to postgres")
	require.NoError(t, adminDB.Exec("CREATE SCHEMA "+schema).Error, "cannot create test schema")
	var database *GORMStore
	t.Cleanup(func() {
		if database != nil {
			testSQLDB, dbErr := database.DB().DB()
			require.NoError(t, dbErr, "cannot access postgres test connection")
			require.NoError(t, testSQLDB.Close(), "cannot close postgres test connection")
		}
		require.NoError(t, adminDB.Exec("DROP SCHEMA "+schema+" CASCADE").Error, "cannot drop test schema")
		adminSQLDB, dbErr := adminDB.DB()
		require.NoError(t, dbErr, "cannot access postgres admin connection")
		require.NoError(t, adminSQLDB.Close(), "cannot close postgres admin connection")
	})

	testDatabaseURL, err := url.Parse(dsn)
	require.NoError(t, err, "cannot parse postgres test DSN")
	query := testDatabaseURL.Query()
	query.Set("search_path", schema)
	testDatabaseURL.RawQuery = query.Encode()
	database, err = InitDatabase(postgres.Open(testDatabaseURL.String()))
	require.NoError(t, err, "cannot initialize postgres test schema")

	return database
}
