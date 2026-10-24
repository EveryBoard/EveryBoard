package protocol

import (
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func ExpectMarshallingToWork[T any](t *testing.T, object T, expectedJSON string) {
	t.Helper()

	data, err := json.Marshal(object)
	require.NoError(t, err, "failed to marshal")
	assert.JSONEq(t, expectedJSON, string(data), "serializing does not provide the expected JSON")
}
