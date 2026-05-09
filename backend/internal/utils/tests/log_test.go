package internal

import (
	"bytes"
	"log"
	"strings"
	"testing"

	utils "github.com/EveryBoard/EveryBoard/internal/utils"
)

func TestLoggerErrorf(t *testing.T) {
	var buf bytes.Buffer
	log.SetOutput(&buf)
	defer log.SetOutput(nil)

	// When printing an error
	utils.DefaultLogger.Errorf("This is an error: %s", "something went wrong")

	// Then the result should be printed in color
	output := buf.String()
	expected := "[ERROR] This is an error: something went wrong"

	if !strings.Contains(output, expected) {
		t.Errorf("Expected log output to contain: %q, but got: %q", expected, output)
	}
}
