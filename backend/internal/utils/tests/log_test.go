package internal

import (
	"bytes"
	"log"
	"strings"
	"testing"

	utils "github.com/EveryBoard/EveryBoard/internal/utils"
)

func TestErrorf(t *testing.T) {
	var buf bytes.Buffer
	log.SetOutput(&buf)
	defer log.SetOutput(nil)

	// When printing an error
	utils.Errorf("This is an error: %s", "something went wrong")

	// Then the result should be printed in color
	output := buf.String()
	expected := utils.Red + "This is an error: something went wrong" + utils.Reset

	if !strings.Contains(output, expected) {
		t.Errorf("Expected log output to contain: %q, but got: %q", expected, output)
	}
}
