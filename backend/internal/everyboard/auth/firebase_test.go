package auth

import (
	"context"
	"github.com/stretchr/testify/require"
	"testing"
)

type FirebaseMockLocal struct {
	documentToFetch map[string]any
}

func (f *FirebaseMockLocal) Initialize() error { return nil }
func (f *FirebaseMockLocal) Fetch(ctx context.Context, coll, path string) (map[string]any, error) {
	return f.documentToFetch, nil
}
func (f *FirebaseMockLocal) VerifyToken(ctx context.Context, token string) (string, error) {
	return "user-id", nil
}

func TestFirebaseInitializeFailures(t *testing.T) {
	t.Run("EmulatorMissingProjectID", func(t *testing.T) {
		f := &Firebase{
			UseEmulator: true,
			ProjectID:   "",
		}
		err := f.Initialize()
		require.Error(t, err, "expected Firebase initialization to fail without project id in emulator mode")
	})

	t.Run("NoEmulatorMissingServiceAccount", func(t *testing.T) {
		f := &Firebase{
			UseEmulator:        false,
			ServiceAccountFile: "",
		}
		err := f.Initialize()
		require.Error(t, err, "expected Firebase initialization to fail without service account file")
	})

	t.Run("NoEmulatorInvalidServiceAccount", func(t *testing.T) {
		f := &Firebase{
			UseEmulator:        false,
			ServiceAccountFile: "non-existent-file.json",
		}
		err := f.Initialize()
		require.Error(t, err, "expected Firebase initialization to fail with missing service account file")
	})
}

func TestVerifyTokenEdgeCases(t *testing.T) {
	f := &Firebase{
		UseEmulator: true,
		ProjectID:   "test-project",
	}

	t.Run("InvalidTokenFormat", func(t *testing.T) {
		_, err := f.VerifyToken(t.Context(), "invalid-token")
		require.Error(t, err, "expected invalid token format to fail verification")
	})

	t.Run("InvalidPayloadEncoding", func(t *testing.T) {
		_, err := f.VerifyToken(t.Context(), "header.invalid_base64!.signature")
		require.Error(t, err, "expected invalid token payload encoding to fail verification")
	})

	t.Run("InvalidPayloadJSON", func(t *testing.T) {
		// "bm90LWpzb24K" is "not-json\n" in base64
		_, err := f.VerifyToken(t.Context(), "header.bm90LWpzb24K.signature")
		require.Error(t, err, "expected invalid token payload JSON to fail verification")
	})

	t.Run("MissingSubClaim", func(t *testing.T) {
		// "e30K" is "{}\n" in base64
		_, err := f.VerifyToken(t.Context(), "header.e30K.signature")
		require.Error(t, err, "expected token without sub claim to fail verification")
	})
}

func TestFetchUserDocumentEdgeCases(t *testing.T) {
	t.Run("MissingUsername", func(t *testing.T) {
		InitializeFirebaseForTest(t, &FirebaseMockLocal{
			documentToFetch: map[string]any{},
		})
		_, err := FetchUserDocument(t.Context(), "user1")
		require.Error(t, err, "expected user document without username to fail")
	})

	t.Run("InvalidUsernameType", func(t *testing.T) {
		InitializeFirebaseForTest(t, &FirebaseMockLocal{
			documentToFetch: map[string]any{
				"username": 123,
			},
		})
		_, err := FetchUserDocument(context.Background(), "user1")
		require.Error(t, err, "expected user document with non-string username to fail")
	})
}
