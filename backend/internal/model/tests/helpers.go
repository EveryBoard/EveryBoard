package model

import (
	"encoding/json"
	"testing"
)

func TestMarshal[T comparable](t *testing.T, object T, expectedJSON string) {
	t.Helper()

	// Given some object

	// When mashalling it
	data, err := json.Marshal(object)
	if err != nil {
		t.Fatalf("failed to marshal: %v", err)
	}

	// Then it should provide the expected JSON
	if string(data) != expectedJSON {
		t.Errorf("serializing Message does not provide the expected JSON: got %s", string(data))
	}

	// And when unmarshalling it
	var objectAgain T
	err = json.Unmarshal([]byte(expectedJSON), &objectAgain);
	if err != nil {
		t.Fatalf("deserialization failed: %v", err)
	}

	// Then it should match the expected object
	if objectAgain != object {
		t.Errorf("deserialized object does not match the expected one: got %v", objectAgain)
	}
}
