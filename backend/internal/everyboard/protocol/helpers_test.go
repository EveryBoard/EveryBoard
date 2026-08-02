package protocol

import (
	"encoding/json"
	"github.com/stretchr/testify/assert"
	"testing"
)

func ExpectMarshallingToWork[T any](t *testing.T, object T, expectedJSON string) {
	t.Helper()

	data, err := json.Marshal(object)
	assert.Nil(t, err, "failed to marshal")
	assert.Equal(t, expectedJSON, string(data), "serializing does not provide the expected JSON")
}
