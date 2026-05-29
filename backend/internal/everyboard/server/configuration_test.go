package server

import (
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

	config, err := ReadConfiguration()
	if err != nil {
		t.Fatalf("error when reading the configuration: %v", err)
	}
	sqliteDialector, ok := config.Database.(*sqlite.Dialector)
	if !ok {
		t.Fatalf("not a sqlite database")
	}
	if sqliteDialector.DSN != "everyboard.db" {
		t.Fatalf("database name should be everyboard.db but is %s", sqliteDialector.DSN)
	}
}

func TestReadConfigurationSqliteWithDsn(t *testing.T) {
	os.Clearenv()
	t.Setenv("USE_EMULATOR", "yes")
	t.Setenv("PROJECT_ID", "my-project")
	t.Setenv("DATABASE_TYPE", "sqlite")
	databaseName := "foo.db"
	t.Setenv("DATABASE_DSN", databaseName)
	t.Setenv("ALLOW_ORIGIN", "*")

	config, err := ReadConfiguration()
	if err != nil {
		t.Fatalf("error when reading the configuration: %v", err)
	}
	sqliteDialector, ok := config.Database.(*sqlite.Dialector)
	if !ok {
		t.Fatalf("not a sqlite database")
	}
	if sqliteDialector.DSN != databaseName {
		t.Fatalf("database name should be %s but is %s", databaseName, sqliteDialector.DSN)
	}
}

func TestReadConfiguarationPostgresWithoutDsn(t *testing.T) {
	os.Clearenv()
	t.Setenv("USE_EMULATOR", "yes")
	t.Setenv("PROJECT_ID", "my-project")
	t.Setenv("DATABASE_TYPE", "postgres")
	t.Setenv("ALLOW_ORIGIN", "*")

	_, err := ReadConfiguration()
	if err == nil {
		t.Fatalf("configuration with postgres and no dsn should be invalid")
	}
}

func TestReadConfigurationPostgresWithDsn(t *testing.T) {
	os.Clearenv()
	t.Setenv("USE_EMULATOR", "yes")
	t.Setenv("PROJECT_ID", "my-project")
	t.Setenv("DATABASE_TYPE", "postgres")
	dsn := "postgresql://postgres:secret@localhost:5432/testdb?sslmode=disable"
	t.Setenv("DATABASE_DSN", dsn)
	t.Setenv("ALLOW_ORIGIN", "*")

	config, err := ReadConfiguration()
	if err != nil {
		t.Fatalf("error when reading the configuration: %v", err)
	}
	postgresDialector, ok := config.Database.(*postgres.Dialector)
	if !ok {
		t.Fatalf("not a postgres database")
	}
	if postgresDialector.DSN != dsn {
		t.Fatalf("database name should be %s but is %s", dsn, postgresDialector.DSN)
	}
}

func TestReadConfigurationWithoutOrigin(t *testing.T) {
	os.Clearenv()
	t.Setenv("USE_EMULATOR", "yes")
	t.Setenv("PROJECT_ID", "my-project")
	t.Setenv("DATABASE_TYPE", "sqlite")

	_, err := ReadConfiguration()
	if err == nil {
		t.Fatalf("configuration without AllowOrigin should be incorrect but is not")
	}
}

func TestReadConfigurationWithOrigin(t *testing.T) {
	os.Clearenv()
	t.Setenv("USE_EMULATOR", "yes")
	t.Setenv("PROJECT_ID", "my-project")
	t.Setenv("DATABASE_TYPE", "sqlite")
	t.Setenv("ALLOW_ORIGIN", "everyboard.org")

	config, err := ReadConfiguration()
	if err != nil {
		t.Fatalf("error when reading the configuration: %v", err)
	}
	if config.Origin != "everyboard.org" {
		t.Fatalf("origin improperly set")
	}
}

func TestReadConfigurationWithoutListenAddr(t *testing.T) {
	os.Clearenv()
	t.Setenv("USE_EMULATOR", "yes")
	t.Setenv("PROJECT_ID", "my-project")
	t.Setenv("DATABASE_TYPE", "sqlite")
	t.Setenv("ALLOW_ORIGIN", "*")

	config, err := ReadConfiguration()
	if err != nil {
		t.Fatalf("error when reading the configuration: %v", err)
	}
	if config.ListenAddr != ":8081" {
		t.Fatalf("listen address improperly set")
	}
}

func TestReadConfigurationWithListenAddr(t *testing.T) {
	os.Clearenv()
	t.Setenv("USE_EMULATOR", "yes")
	t.Setenv("PROJECT_ID", "my-project")
	t.Setenv("DATABASE_TYPE", "sqlite")
	t.Setenv("ALLOW_ORIGIN", "*")
	t.Setenv("LISTEN_ADDR", "localhost:1234")

	config, err := ReadConfiguration()
	if err != nil {
		t.Fatalf("error when reading the configuration: %v", err)
	}
	if config.ListenAddr != "localhost:1234" {
		t.Fatalf("listen address improperly set")
	}
}
