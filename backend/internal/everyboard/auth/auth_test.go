package auth

import (
	"bytes"
	"context"
	"fmt"
	"github.com/stretchr/testify/require"
	"net"
	"net/http"
	"os"
	"os/exec"
	"testing"
	"time"
)

func InitializeFirebaseForTest(t *testing.T, f FirebaseLike) {
	t.Helper()
	SetFirebaseClient(f)
	err := InitFirebase()
	require.NoError(t, err, "cannot initialize firebase")
}

type FirebaseMock struct {
	errorOnInitialization       bool
	errorOnTokenVerification    bool
	uidToReturnUponVerification string
	errorOnFetch                bool
	documentToFetch             map[string]any
}

func (f FirebaseMock) Initialize() error {
	if f.errorOnInitialization {
		return fmt.Errorf("firebase initialization error")
	}
	return nil
}

func (f FirebaseMock) Fetch(context context.Context, collection string, path string) (map[string]any, error) {
	if f.errorOnFetch {
		return nil, fmt.Errorf("firebase fetch error")
	}
	return f.documentToFetch, nil
}

func (f FirebaseMock) VerifyToken(context context.Context, token string) (string, error) {
	if f.errorOnTokenVerification {
		return "", fmt.Errorf("firebase token verification error")
	}
	return f.uidToReturnUponVerification, nil
}

func TestVerificationOfInvalidToken(t *testing.T) {
	InitializeFirebaseForTest(t, &FirebaseMock{
		errorOnInitialization:    false,
		errorOnTokenVerification: true,
		errorOnFetch:             false,
	})
	// Token invalid because it is not given in the Sec-WebSocket-Protocol field (which is absent)
	req, err := http.NewRequest("GET", "http://whocares.com", nil)
	require.NoError(t, err, "cannot create request")
	_, _, err = VerifyTokenAndGetUser(req)
	require.Error(t, err, "expected token verification to fail")

	// Token invalid because it is ill-formatted
	req.Header.Set("Sec-WebSocket-Protocol", "lol")
	_, _, err = VerifyTokenAndGetUser(req)
	require.Error(t, err, "expected token verification to fail")

	// Token invalid because firebase says so
	req.Header.Set("Sec-WebSocket-Protocol", "Authorization, lol.lal.lql")
	_, _, err = VerifyTokenAndGetUser(req)
	require.Error(t, err, "expected token verification to fail")
}

func TestVerifiedTokenButNoUser(t *testing.T) {
	// Given a user that can't be fetched
	InitializeFirebaseForTest(t, &FirebaseMock{
		errorOnInitialization:       false,
		errorOnTokenVerification:    false,
		uidToReturnUponVerification: "foo",
		errorOnFetch:                true,
	})
	req, err := http.NewRequest("GET", "http://whocares.com", nil)
	require.NoError(t, err, "cannot create request")
	req.Header.Set("Sec-WebSocket-Protocol", "Authorization, lol.lal.lql")
	// When verifying its token and retrieving the user
	_, _, err = VerifyTokenAndGetUser(req)
	// Then it should fail
	require.Error(t, err, "expected authentication error")
}

func TestTokenVerificationHappyFlow(t *testing.T) {
	// Given a user that will be verified and fetched
	InitializeFirebaseForTest(t, &FirebaseMock{
		errorOnInitialization:       false,
		errorOnTokenVerification:    false,
		uidToReturnUponVerification: "foo-uid",
		errorOnFetch:                false,
		documentToFetch: map[string]any{
			"username": "foo",
		},
	})
	req, err := http.NewRequest("GET", "http://whocares.com", nil)
	require.NoError(t, err, "cannot create request")
	req.Header.Set("Sec-WebSocket-Protocol", "Authorization, lol.lal.lql")
	// When verifying its token and retrieving the user
	uid, user, err := VerifyTokenAndGetUser(req)
	require.NoError(t, err, "failed to verify token")
	// Then it should return the uid and user
	require.Equal(t, "foo-uid", uid, "did not retrieve the correct user")
	require.Equal(t, "foo", user.Username, "did not retrieve the correct user")
}

func TestTokenVerificationBotHappyFlow(t *testing.T) {
	// Given a user who is actually a bot
	InitializeFirebaseForTest(t, &FirebaseMock{
		errorOnInitialization:       false,
		errorOnTokenVerification:    false,
		uidToReturnUponVerification: "bot-uid",
		errorOnFetch:                false,
		documentToFetch: map[string]any{
			"username": "everybot",
			"isBot": true,
		},
	})
	req, err := http.NewRequest("GET", "http://whocares.com", nil)
	require.NoError(t, err, "cannot create request")
	req.Header.Set("Sec-WebSocket-Protocol", "Authorization, lol.lal.lql")
	// When verifying its token and retrieving the user
	uid, user, err := VerifyTokenAndGetUser(req)
	require.NoError(t, err, "failed to verify token")
	// Then it should return the uid and user, as well as the fact that this is a bot
	require.Equal(t, "bot-uid", uid, "did not retrieve the correct user")
	require.Equal(t, "everybot", user.Username, "did not retrieve the correct user")
	require.Equal(t, true, user.IsBot, "did not retrieve the fact that user is a bot")
}

func waitForPort(address string, timeout time.Duration) error {
	deadline := time.Now().Add(timeout)
	for time.Now().Before(deadline) {
		conn, err := net.DialTimeout("tcp", address, time.Second)
		if err == nil {
			return conn.Close()
		}
		time.Sleep(500 * time.Millisecond)
	}
	return &net.OpError{Op: "dial", Net: "tcp", Err: os.ErrDeadlineExceeded}
}

func startFirebaseEmulator(t *testing.T) {
	cmd := exec.Command("npx", "firebase", "emulators:start", "--only", "firestore,auth", "--project", "my-project")
	err := cmd.Start()
	require.NoError(t, err, "failed to start Firebase emulator")

	t.Cleanup(func() {
		if cmd.Process == nil {
			return
		}

		_ = cmd.Process.Signal(os.Interrupt)

		done := make(chan error, 1)
		go func() {
			done <- cmd.Wait()
		}()

		select {
		case <-done:
		case <-time.After(5 * time.Second):
			_ = cmd.Process.Kill()
			<-done
		}
	})

	err = waitForPort("127.0.0.1:9099", 30*time.Second)
	require.NoError(t, err, "failed to wait for Firebase emulator to start")

	t.Setenv("FIRESTORE_EMULATOR_HOST", "localhost:8080")
	t.Setenv("FIREBASE_AUTH_EMULATOR_HOST", "localhost:9099")
}

func TestTokenVerificationWithEmulator(t *testing.T) {
	// Given the emulator
	startFirebaseEmulator(t)
	 InitializeFirebaseForTest(t, &Firebase{
		UseEmulator: true,
		ProjectID:   "my-project",
	})

	req, err := http.NewRequest("GET", "http://whocares.com", nil)
	require.NoError(t, err, "cannot create request")

	// When verifying the token
	// Then it should fail if any of the conditions are not satisfied
	tokenVerificationShouldFailWithIllFormedToken(t, req)
	tokenVerificationShouldFailWithIllegalB64Payload(t, req)
	tokenVerificationShouldFailWithIllegalJsonPayload(t, req)
	tokenVerificationShouldFailWithPayloadWithoutSub(t, req)
	tokenVerificationShouldFailWithMissingUser(t, req)

	// And it should succeed if all is good
	tokenVerificationShouldSucceedWithValidTokenAndUser(t, req)
}

func tokenVerificationShouldFailWithIllFormedToken(t *testing.T, req *http.Request) {
	// Token is ill-formed because it is not a JWT (missing the dots)
	req.Header.Set("Sec-WebSocket-Protocol", "Authorization, notajwt")

	_, _, err := VerifyTokenAndGetUser(req)
	require.Error(t, err, "expected token verification to fail")
}

func tokenVerificationShouldFailWithIllegalB64Payload(t *testing.T, req *http.Request) {
	// Token is ill-formed because it is not a JWT (not b64-encoded)
	req.Header.Set("Sec-WebSocket-Protocol", "Authorization, not.a.jwt")

	_, _, err := VerifyTokenAndGetUser(req)
	require.Error(t, err, "expected token verification to fail")
}

func tokenVerificationShouldFailWithIllegalJsonPayload(t *testing.T, req *http.Request) {
	// Token is ill-formed because it is not a JWT (not b64-encoded json, in particular the second part)
	// Generated with echo "not-json" | base64, appended to a valid JWT b64-encoded header
	req.Header.Set("Sec-WebSocket-Protocol", "Authorization, yJhbGciOiJub25lIiwidHlwIjoiSldUIn0.bm90LWpzb24K.")

	_, _, err := VerifyTokenAndGetUser(req)
	require.Error(t, err, "expected token verification to fail")
}

func tokenVerificationShouldFailWithPayloadWithoutSub(t *testing.T, req *http.Request) {
	// Token is ill-formed because it is missing the "sub" part
	// Generated with echo "{}" | base64, appended to a valid JWT b64-encoded header
	req.Header.Set("Sec-WebSocket-Protocol", "Authorization, yJhbGciOiJub25lIiwidHlwIjoiSldUIn0.e30K.")

	_, _, err := VerifyTokenAndGetUser(req)
	require.Error(t, err, "expected token verification to fail")
}

func tokenVerificationShouldFailWithMissingUser(t *testing.T, req *http.Request) {
	// Token is well-formed, but the user doesn't exist in firestore
	// Generated with echo "{\"sub\":\"foo\"}" | base64, appended to a valid JWT b64-encoded header
	req.Header.Set("Sec-WebSocket-Protocol", "Authorization, yJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJmb28ifQo.")

	_, _, err := VerifyTokenAndGetUser(req)
	require.Error(t, err, "expected token verification to fail")
}

func addUser(t *testing.T, uid string, username string) {
	url := fmt.Sprintf("http://127.0.0.1:8080/v1/projects/my-project/databases/(default)/documents/users/%s", uid)
	body := fmt.Sprintf(`{"fields":{"username":{"stringValue":"%s"}}}`, username)

	req, err := http.NewRequest("PATCH", url, bytes.NewBuffer([]byte(body)))
	require.NoError(t, err, "cannot create request")
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer owner")

	resp, err := http.DefaultClient.Do(req)
	require.NoError(t, err, "cannot make http request")
	defer resp.Body.Close()

	require.Equal(t, http.StatusOK, resp.StatusCode, "user creation in firestore failed")
}

func tokenVerificationShouldSucceedWithValidTokenAndUser(t *testing.T, req *http.Request) {
	// Token is well-formed and user exists in firestore
	req.Header.Set("Sec-WebSocket-Protocol", "Authorization, yJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ1c2VyLWlkIn0K.")
	addUser(t, "user-id", "foo")
	// When verifying its token and retrieving the user
	uid, user, err := VerifyTokenAndGetUser(req)

	require.NoError(t, err, "failed to verify token")
	// Then it should return the uid and user
	require.Equal(t, "user-id", uid, "did not retrieve the correct user")
	require.Equal(t, "foo", user.Username, "did not retrieve the correct user")
}
