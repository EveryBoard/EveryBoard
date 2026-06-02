package server

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestCors(t *testing.T) {
	srv := New("127.0.0.1:0", "*", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	req := httptest.NewRequest(http.MethodOptions, "/ws", nil)
	rr := httptest.NewRecorder()

	srv.Handler.ServeHTTP(rr, req)

	assert.Contains(t, []int{http.StatusOK, http.StatusNoContent}, rr.Code, "unexpected CORS status")
	assert.Equal(t, "*", rr.Header().Get("Access-Control-Allow-Origin"), "invalid Access-Control-Allow-Origin")
	assert.Empty(t, rr.Header().Get("Access-Control-Allow-Credentials"), "wildcard CORS must not allow credentials")
}

func TestVersion(t *testing.T) {
	srv := New("127.0.0.1:0", "*", http.NotFoundHandler())
	req := httptest.NewRequest(http.MethodGet, "/version", nil)
	rr := httptest.NewRecorder()

	srv.Handler.ServeHTTP(rr, req)

	require.Equal(t, http.StatusOK, rr.Code)
	require.Equal(t, Version, rr.Body.String())
}
