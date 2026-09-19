package apperror

type BackendError struct {
	Msg string `json:"reason"`
}

func (e BackendError) Error() string {
	return e.Msg
}

var (
	ErrorInternal          BackendError = BackendError{Msg: "internal-error"}
	ErrorInvalidData       BackendError = BackendError{Msg: "invalid-data"}
	ErrorAlreadySubscribed BackendError = BackendError{Msg: "already-subscribed"}
	ErrorNotSubscribed     BackendError = BackendError{Msg: "not-subscribed"}
	ErrorUnknownMessage    BackendError = BackendError{Msg: "unknown-message"}
	ErrorGameDoesNotExist  BackendError = BackendError{Msg: "game-does-not-exist"}
	ErrorNotAllowed        BackendError = BackendError{Msg: "not-allowed"}
	ErrorUnknownGame       BackendError = BackendError{Msg: "unknown-game"}
)
