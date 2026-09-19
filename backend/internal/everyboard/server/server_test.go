package server

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestCors(t *testing.T) {
	server := New("127.0.0.1:0", "*", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}), gameStoreStub{})

	request := httptest.NewRequest(http.MethodOptions, "/ws", nil)
	recorder := httptest.NewRecorder()

	server.Handler.ServeHTTP(recorder, request)

	assert.Contains(t, []int{http.StatusOK, http.StatusNoContent}, recorder.Code, "unexpected CORS status")
	assert.Equal(t, "*", recorder.Header().Get("Access-Control-Allow-Origin"), "invalid Access-Control-Allow-Origin")
	assert.Empty(t, recorder.Header().Get("Access-Control-Allow-Credentials"), "wildcard CORS must not allow credentials")
}

func TestVersion(t *testing.T) {
	server := New("127.0.0.1:0", "*", http.NotFoundHandler(), gameStoreStub{})
	request := httptest.NewRequest(http.MethodGet, "/version", nil)
	recorder := httptest.NewRecorder()

	server.Handler.ServeHTTP(recorder, request)

	require.Equal(t, http.StatusOK, recorder.Code)
	require.Equal(t, Version, recorder.Body.String())
}
