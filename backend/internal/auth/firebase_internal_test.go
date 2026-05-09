package auth

import (
	"context"
	"testing"
)

func TestFirebaseInitializeFailures(t *testing.T) {
	t.Run("EmulatorMissingProjectID", func(t *testing.T) {
		f := &Firebase{
			UseEmulator: true,
			ProjectID:   "",
		}
		err := f.Initialize()
		if err == nil {
			t.Fatal("expected error when ProjectID is missing in emulator mode")
		}
	})

	t.Run("NoEmulatorMissingServiceAccount", func(t *testing.T) {
		f := &Firebase{
			UseEmulator:        false,
			ServiceAccountFile: "",
		}
		err := f.Initialize()
		if err == nil {
			t.Fatal("expected error when ServiceAccountFile is missing in non-emulator mode")
		}
	})

	t.Run("NoEmulatorInvalidServiceAccount", func(t *testing.T) {
		f := &Firebase{
			UseEmulator:        false,
			ServiceAccountFile: "non-existent-file.json",
		}
		err := f.Initialize()
		if err == nil {
			t.Fatal("expected error when ServiceAccountFile does not exist")
		}
	})
}

func TestVerifyTokenEdgeCases(t *testing.T) {
	f := &Firebase{
		UseEmulator: true,
		ProjectID:   "test-project",
	}

	t.Run("InvalidTokenFormat", func(t *testing.T) {
		_, err := f.VerifyToken(nil, "invalid-token")
		if err == nil {
			t.Fatal("expected error for invalid token format")
		}
	})

	t.Run("InvalidPayloadEncoding", func(t *testing.T) {
		_, err := f.VerifyToken(nil, "header.invalid_base64!.signature")
		if err == nil {
			t.Fatal("expected error for invalid payload encoding")
		}
	})

	t.Run("InvalidPayloadJSON", func(t *testing.T) {
		// "bm90LWpzb24K" is "not-json\n" in base64
		_, err := f.VerifyToken(nil, "header.bm90LWpzb24K.signature")
		if err == nil {
			t.Fatal("expected error for invalid payload JSON")
		}
	})

	t.Run("MissingSubClaim", func(t *testing.T) {
		// "e30K" is "{}\n" in base64
		_, err := f.VerifyToken(nil, "header.e30K.signature")
		if err == nil {
			t.Fatal("expected error for missing 'sub' claim")
		}
	})
}

func TestFetchUserDocumentEdgeCases(t *testing.T) {
	t.Run("MissingUsername", func(t *testing.T) {
		mock := &FirebaseMockLocal{
			documentToFetch: map[string]interface{}{},
		}
		SetFirebaseClient(mock)
		_, err := fetchUserDocument(context.Background(), "user1")
		if err == nil {
			t.Fatal("expected error for missing username")
		}
	})

	t.Run("InvalidUsernameType", func(t *testing.T) {
		mock := &FirebaseMockLocal{
			documentToFetch: map[string]interface{}{
				"username": 123,
			},
		}
		SetFirebaseClient(mock)
		_, err := fetchUserDocument(context.Background(), "user1")
		if err == nil {
			t.Fatal("expected error for non-string username")
		}
	})
}

type FirebaseMockLocal struct {
	documentToFetch map[string]interface{}
}

func (f *FirebaseMockLocal) Initialize() error { return nil }
func (f *FirebaseMockLocal) Fetch(ctx context.Context, coll, path string) (map[string]interface{}, error) {
	return f.documentToFetch, nil
}
func (f *FirebaseMockLocal) VerifyToken(ctx context.Context, token string) (string, error) {
	return "user-id", nil
}
