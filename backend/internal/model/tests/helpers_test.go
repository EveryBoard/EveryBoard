package model

import (
	"encoding/json"
	"reflect"
	"testing"
)

func ExpectMarshallingToWorkBothWays[T any](t *testing.T, object T, expectedJSON string) {
	t.Helper()

	ExpectMarshallingToWork(t, object, expectedJSON)
	ExpectUnmarshallingToWork(t, expectedJSON, object)
}

func ExpectMarshallingToWork[T any](t *testing.T, object T, expectedJSON string) {
	// Given some object (`object`)

	// When mashalling it
	data, err := json.Marshal(object)
	if err != nil {
		t.Fatalf("failed to marshal: %v", err)
	}

	// Then it should provide the expected JSON
	if string(data) != expectedJSON {
		t.Errorf("serializing does not provide the expected JSON: got %s", string(data))
	}
}

func ExpectUnmarshallingToWork[T any](t *testing.T, validJSON string, object T) {
	// Given some string containing a valid json
	// When unmarshalling it
	var objectAgain T
	err := json.Unmarshal([]byte(validJSON), &objectAgain)
	if err != nil {
		t.Fatalf("deserialization failed: %v", err)
	}

	// Then it should match the expected object
	// We need to check it with deep equality in case there are pointers due to nullable values
	if !reflect.DeepEqual(objectAgain, object) {
		t.Errorf("deserialized object does not match the expected one: got %v", objectAgain)
	}
}

func ExpectMarshallingToFail[T any](t *testing.T, object T, input string) {
	err := json.Unmarshal([]byte(input), &object)
	if err == nil {
		t.Errorf("succesfully unmarshaled while it should not, with %v, got %v", input, object)
	}
}
