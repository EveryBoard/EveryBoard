package protocol

import (
	"encoding/json"
	"testing"
)

func ExpectMarshallingToWork[T any](t *testing.T, object T, expectedJSON string) {
	t.Helper()

	data, err := json.Marshal(object)
	if err != nil {
		t.Errorf("failed to marshal: %v", err)
	}
	if string(data) != expectedJSON {
		t.Errorf("serializing does not provide the expected JSON: got %s", string(data))
	}
}
