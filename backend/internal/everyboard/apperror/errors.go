package apperror

type BackendError struct {
	Msg string `json:"reason"`
}

func (e BackendError) Error() string {
	return e.Msg
}

var (
	ErrorInternal          = BackendError{Msg: "internal-error"}
	ErrorInvalidData       = BackendError{Msg: "invalid-data"}
	ErrorAlreadySubscribed = BackendError{Msg: "already-subscribed"}
	ErrorNotSubscribed     = BackendError{Msg: "not-subscribed"}
	ErrorUnknownMessage    = BackendError{Msg: "unknown-message"}
	ErrorGameDoesNotExist  = BackendError{Msg: "game-does-not-exist"}
	ErrorNotAllowed        = BackendError{Msg: "not-allowed"}
	ErrorUnknownGame       = BackendError{Msg: "unknown-game"}
)
