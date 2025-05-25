package model

import (
	"encoding/json"
	"testing"
	"reflect"
)

func ExpectMarshallingToWork[T interface{}](t *testing.T, object T, expectedJSON string) {
	t.Helper()

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

	// And when unmarshalling it
	var objectAgain T
	err = json.Unmarshal([]byte(expectedJSON), &objectAgain);
	if err != nil {
		t.Fatalf("deserialization failed: %v", err)
	}

	// Then it should match the expected object
	// We need to check it with deep equality in case there are pointers due to nullable values
	if !reflect.DeepEqual(objectAgain, object) {
		t.Errorf("deserialized object does not match the expected one: got %v", objectAgain)
	}
}
