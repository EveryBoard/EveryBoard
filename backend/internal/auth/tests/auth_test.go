package auth

import (
	"bytes"
	"context"
	"fmt"
	"net"
	"net/http"
	"os"
	"os/exec"
	"testing"
	"time"

	"github.com/EveryBoard/EveryBoard/internal/auth"
)

func InitializeFirebase(t *testing.T, f auth.FirebaseLike) {
	auth.SetFirebaseClient(f)
	err := auth.InitFirebase()
	if err != nil {
		t.Fatalf("cannot initialize firebase: %v", err)
	}
}

type FirebaseMock struct {
	errorOnInitialization bool
	errorOnTokenVerification bool
	uidToReturnUponVerification string
	errorOnFetch bool
	documentToFetch map[string]interface{}
}

func (f FirebaseMock) Initialize() error {
	if f.errorOnInitialization {
		return fmt.Errorf("firebase initialization error")
	}
	return nil
}

func (f FirebaseMock) Fetch(context context.Context, collection string, path string) (map[string]interface{}, error) {
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
	InitializeFirebase(t, &FirebaseMock{
		errorOnInitialization: false,
		errorOnTokenVerification: true,
		errorOnFetch: false,
	})
	// Token invalid because it is not given in the Sec-WebSocket-Protocol field (which is absent)
	req, err := http.NewRequest("GET", "http://whocares.com", nil)
	if err != nil {
		t.Fatalf("cannot create request: %v", err)
	}
	_, _, err = auth.VerifyTokenAndGetUser(req)
	if err == nil {
		t.Fatalf("should not verify token if it is not given, but it does")
	}

	// Token invalid because it is ill-formatted
	req.Header.Set("Sec-WebSocket-Protocol", "lol")
	_, _, err = auth.VerifyTokenAndGetUser(req)
	if err == nil {
		t.Fatalf("should not verify token if is ill-formatted, but it does")
	}

	// Token invalid because firebase says so
	req.Header.Set("Sec-WebSocket-Protocol", "Authorization, lol.lal.lql")
	_, _, err = auth.VerifyTokenAndGetUser(req)
	if err == nil {
		t.Fatalf("should not verify token if it is ill-formatted, but it does")
	}
}

func TestVerifiedTokenButNoUser(t *testing.T) {
	// Given a user that can't be fetched
	InitializeFirebase(t, &FirebaseMock{
		errorOnInitialization: false,
		errorOnTokenVerification: false,
		uidToReturnUponVerification: "foo",
		errorOnFetch: true,
	})
	req, err := http.NewRequest("GET", "http://whocares.com", nil)
	if err != nil {
		t.Fatalf("cannot create request: %v", err)
	}
	req.Header.Set("Sec-WebSocket-Protocol", "Authorization, lol.lal.lql")
	// When verifying its token and retrieving the user
	_, _, err = auth.VerifyTokenAndGetUser(req)
	// Then it should fail
	if err == nil {
		t.Fatalf("should fail to verify token")
	}
}

func TestTokenVerificationHappyFlow(t *testing.T) {
	// Given a user that will be verified and fetched
	InitializeFirebase(t, &FirebaseMock{
		errorOnInitialization: false,
		errorOnTokenVerification: false,
		uidToReturnUponVerification: "foo-uid",
		errorOnFetch: false,
		documentToFetch: map[string]interface{}{
			"username": "foo",
		},
	})
	req, err := http.NewRequest("GET", "http://whocares.com", nil)
	if err != nil {
		t.Fatalf("cannot create request: %v", err)
	}
	req.Header.Set("Sec-WebSocket-Protocol", "Authorization, lol.lal.lql")
	// When verifying its token and retrieving the user
	uid, user, err := auth.VerifyTokenAndGetUser(req)
	if err != nil {
		t.Fatalf("failed to verify token")
	}
	// Then it should return the uid and user
	if uid != "foo-uid" || user.Username != "foo" {
		t.Fatalf("did not retrieve the correct user")
	}
}

func waitForPort(address string, timeout time.Duration) error {
	deadline := time.Now().Add(timeout)
	for time.Now().Before(deadline) {
		conn, err := net.DialTimeout("tcp", address, time.Second)
		if err == nil {
			conn.Close()
			return nil
		}
		time.Sleep(500 * time.Millisecond)
	}
	return &net.OpError{Op: "dial", Net: "tcp", Err: os.ErrDeadlineExceeded}
}

func startFirebaseEmulator(t *testing.T) *exec.Cmd {
	cmd := exec.Command("npx", "firebase", "emulators:start", "--only", "firestore,auth", "--project", "my-project")
	err := cmd.Start();
	if err != nil {
		t.Fatalf("failed to start Firebase emulator: %v", err)
	}

	err = waitForPort("127.0.0.1:9099", 120*time.Second);
	if err != nil {
		t.Fatalf("failed to wait for Firebase emulator to start: %v", err)
	}

	err = os.Setenv("FIRESTORE_EMULATOR_HOST", "localhost:8080")
	if err != nil {
		t.Fatalf("Cannot set environment variable?! %v", err)
	}
	err = os.Setenv("FIREBASE_AUTH_EMULATOR_HOST", "localhost:9099")
	if err != nil {
		t.Fatalf("Cannot set environment variable?! %v", err)
	}
	return cmd
}

func TestTokenVerificationWithEmulator(t *testing.T) {
	// Given the emulator
	cmd := startFirebaseEmulator(t)
	defer cmd.Process.Signal(os.Interrupt) // close down the emulator at the end of this test
	InitializeFirebase(t, &auth.Firebase{
		UseEmulator: true,
		ProjectID: "my-project",
	})

	req, err := http.NewRequest("GET", "http://whocares.com", nil)
	if err != nil {
		t.Fatalf("cannot create request: %v", err)
	}

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

	_, _, err := auth.VerifyTokenAndGetUser(req)
	if err == nil {
		t.Fatalf("verified token while it should not")
	}
}

func tokenVerificationShouldFailWithIllegalB64Payload(t *testing.T, req *http.Request) {
	// Token is ill-formed because it is not a JWT (not b64-encoded)
	req.Header.Set("Sec-WebSocket-Protocol", "Authorization, not.a.jwt")

	_, _, err := auth.VerifyTokenAndGetUser(req)
	if err == nil {
		t.Fatalf("verified token while it should not")
	}
}

func tokenVerificationShouldFailWithIllegalJsonPayload(t *testing.T, req *http.Request) {
	// Token is ill-formed because it is not a JWT (not b64-encoded json, in particular the second part)
	// Generated with echo 'not-json' | base64, appended to a valid JWT b64-encoded header
	req.Header.Set("Sec-WebSocket-Protocol", "Authorization, yJhbGciOiJub25lIiwidHlwIjoiSldUIn0.bm90LWpzb24K.")

	_, _, err := auth.VerifyTokenAndGetUser(req)
	if err == nil {
		t.Fatalf("verified token while it should not")
	}
}

func tokenVerificationShouldFailWithPayloadWithoutSub(t *testing.T, req *http.Request) {
	// Token is ill-formed because it is missing the 'sub' part
	// Generated with echo '{}' | base64, appended to a valid JWT b64-encoded header
	req.Header.Set("Sec-WebSocket-Protocol", "Authorization, yJhbGciOiJub25lIiwidHlwIjoiSldUIn0.e30K.")

	_, _, err := auth.VerifyTokenAndGetUser(req)
	if err == nil {
		t.Fatalf("verified token while it should not")
	}
}

func tokenVerificationShouldFailWithMissingUser(t *testing.T, req *http.Request) {
	// Token is well-formed, but the user doesn't exist in firestore
	// Generated with echo '{"sub":"foo"}' | base64, appended to a valid JWT b64-encoded header
	req.Header.Set("Sec-WebSocket-Protocol", "Authorization, yJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJmb28ifQo.")

	_, _, err := auth.VerifyTokenAndGetUser(req)
	if err == nil {
		t.Fatalf("verified token while it should not")
	}
}

func addUser(t *testing.T, uid string, username string) {
	url := fmt.Sprintf("http://127.0.0.1:8080/v1/projects/my-project/databases/(default)/documents/users/%s", uid)
	body := fmt.Sprintf(`{"fields":{"username":{"stringValue":"%s"}}}`, username)

	req, err := http.NewRequest("PATCH", url, bytes.NewBuffer([]byte(body)))
	if err != nil {
		t.Fatalf("cannot create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer owner")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("cannot make http request to emulator: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("user creation in firestore failed: %v", resp.StatusCode)
	}
}

func tokenVerificationShouldSucceedWithValidTokenAndUser(t *testing.T, req *http.Request) {
	// Token is well-formed and user exists in firestore
	req.Header.Set("Sec-WebSocket-Protocol", "Authorization, yJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ1c2VyLWlkIn0K.")
	addUser(t, "user-id", "foo")
	// When verifying its token and retrieving the user, but there is no user in the db
	uid, user, err := auth.VerifyTokenAndGetUser(req)

	if err != nil {
		t.Fatalf("failed to verify token: %v", err)
	}
	// Then it should return the uid and user
	if uid != "user-id" || user.Username != "foo" {
		t.Fatalf("did not retrieve the correct user")
	}
}
