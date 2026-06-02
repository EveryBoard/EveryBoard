package config

import (
	"github.com/stretchr/testify/require"
	"os"
	"testing"

	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
)

func TestReadConfigurationSqliteWithoutDsn(t *testing.T) {
	os.Clearenv()
	t.Setenv("USE_EMULATOR", "yes")
	t.Setenv("PROJECT_ID", "my-project")
	t.Setenv("DATABASE_TYPE", "sqlite")
	t.Setenv("ALLOW_ORIGIN", "*")

	config, err := Read()
	require.NoError(t, err, "error when reading the configuration")
	sqliteDialector, ok := config.Database.(*sqlite.Dialector)
	require.True(t, ok, "not a sqlite database")
	require.Equal(t, "everyboard.db", sqliteDialector.DSN, "database name should be everyboard.db")
}

func TestReadConfigurationSqliteWithDsn(t *testing.T) {
	os.Clearenv()
	t.Setenv("USE_EMULATOR", "yes")
	t.Setenv("PROJECT_ID", "my-project")
	t.Setenv("DATABASE_TYPE", "sqlite")
	databaseName := "foo.db"
	t.Setenv("DATABASE_DSN", databaseName)
	t.Setenv("ALLOW_ORIGIN", "*")

	config, err := Read()
	require.NoError(t, err, "error when reading the configuration")
	sqliteDialector, ok := config.Database.(*sqlite.Dialector)
	require.True(t, ok, "not a sqlite database")
	require.Equal(t, databaseName, sqliteDialector.DSN, "database name should be %s", databaseName)
}

func TestReadConfiguarationPostgresWithoutDsn(t *testing.T) {
	os.Clearenv()
	t.Setenv("USE_EMULATOR", "yes")
	t.Setenv("PROJECT_ID", "my-project")
	t.Setenv("DATABASE_TYPE", "postgres")
	t.Setenv("ALLOW_ORIGIN", "*")

	_, err := Read()
	require.Error(t, err, "error when reading the configuration")
}

func TestReadConfigurationPostgresWithDsn(t *testing.T) {
	os.Clearenv()
	t.Setenv("USE_EMULATOR", "yes")
	t.Setenv("PROJECT_ID", "my-project")
	t.Setenv("DATABASE_TYPE", "postgres")
	dsn := "postgresql://postgres:secret@localhost:5432/testdb?sslmode=disable"
	t.Setenv("DATABASE_DSN", dsn)
	t.Setenv("ALLOW_ORIGIN", "*")

	config, err := Read()
	require.NoError(t, err, "error when reading the configuration")
	postgresDialector, ok := config.Database.(*postgres.Dialector)
	require.True(t, ok, "not a postgres database")
	require.Equal(t, dsn, postgresDialector.DSN, "database name should be %s", dsn)
}

func TestReadConfigurationWithoutOrigin(t *testing.T) {
	os.Clearenv()
	t.Setenv("USE_EMULATOR", "yes")
	t.Setenv("PROJECT_ID", "my-project")
	t.Setenv("DATABASE_TYPE", "sqlite")

	_, err := Read()
	require.Error(t, err, "error when reading the configuration")
}

func TestReadConfigurationWithOrigin(t *testing.T) {
	os.Clearenv()
	t.Setenv("USE_EMULATOR", "yes")
	t.Setenv("PROJECT_ID", "my-project")
	t.Setenv("DATABASE_TYPE", "sqlite")
	t.Setenv("ALLOW_ORIGIN", "everyboard.org")

	config, err := Read()
	require.NoError(t, err, "error when reading the configuration")
	require.Equal(t, "everyboard.org", config.Origin, "origin improperly set")
}

func TestReadConfigurationWithoutListenAddr(t *testing.T) {
	os.Clearenv()
	t.Setenv("USE_EMULATOR", "yes")
	t.Setenv("PROJECT_ID", "my-project")
	t.Setenv("DATABASE_TYPE", "sqlite")
	t.Setenv("ALLOW_ORIGIN", "*")

	config, err := Read()
	require.NoError(t, err, "error when reading the configuration")
	require.Equal(t, ":8081", config.ListenAddr, "listen address improperly set")
}

func TestReadConfigurationWithListenAddr(t *testing.T) {
	os.Clearenv()
	t.Setenv("USE_EMULATOR", "yes")
	t.Setenv("PROJECT_ID", "my-project")
	t.Setenv("DATABASE_TYPE", "sqlite")
	t.Setenv("ALLOW_ORIGIN", "*")
	t.Setenv("LISTEN_ADDR", "localhost:1234")

	config, err := Read()
	require.NoError(t, err, "error when reading the configuration")
	require.Equal(t, "localhost:1234", config.ListenAddr, "listen address improperly set")
}
