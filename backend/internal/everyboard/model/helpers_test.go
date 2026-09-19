package model

import (
	"encoding/json"
	"github.com/stretchr/testify/assert"
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
	assert.Nil(t, err, "failed to marshal")

	// Then it should provide the expected JSON
	assert.Equal(t, expectedJSON, string(data), "serializing does not provide the expected JSON")
}

func ExpectUnmarshallingToWork[T any](t *testing.T, validJSON string, object T) {
	// Given some string containing a valid json
	// When unmarshalling it
	var objectAgain T
	err := json.Unmarshal([]byte(validJSON), &objectAgain)
	assert.Nil(t, err, "deserialization failed")

	// Then it should match the expected object
	// We need to check it with deep equality in case there are pointers due to nullable values
	assert.True(t, reflect.DeepEqual(objectAgain, object), "deserialized object does not match the expected one: got %v", objectAgain)
}

func ExpectMarshallingToFail[T any](t *testing.T, object T) {
	_, err := json.Marshal(object)
	assert.Error(t, err, "expected marshaling to fail")
}

func ExpectUnmarshallingToFail[T any](t *testing.T, object T, input string) {
	err := json.Unmarshal([]byte(input), &object)
	assert.Error(t, err, "expected unmarshaling to fail")
}
