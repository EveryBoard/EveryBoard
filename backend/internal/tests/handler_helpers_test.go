// TODO: ne pas review ce fichier (yet), il est en bonno modification
package internal

import (
	"database/sql/driver"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/gorilla/websocket"

	everyboard "github.com/EveryBoard/EveryBoard/internal"
	"github.com/EveryBoard/EveryBoard/internal/model"
)

func encodeID(t *testing.T, id model.GameID) string {
	encodedId, err := model.EncodeID(id)
	if err != nil {
		t.Fatalf("cannot encode id: %v", err)
	}
	return encodedId
}
func b64(s string) string {
	return base64.RawStdEncoding.EncodeToString([]byte(s))
}

func tokenForUser(uid string) string {
	return fmt.Sprintf("Authorization, %s.%s.", b64("{}"), b64(fmt.Sprintf(`{"sub":"%s"}`, uid)))
}

func EstablishWebSocketConnection(t *testing.T, uid string) *websocket.Conn {
	headers := http.Header{}
	headers.Set("Sec-WebSocket-Protocol", tokenForUser(uid))
	c, resp, err := websocket.DefaultDialer.Dial("ws://localhost:8081/ws", headers)
	if err != nil {
		t.Fatalf("Dial failed: %v (status %v)", err, resp.Status)
	}

	if resp.StatusCode != http.StatusSwitchingProtocols {
		t.Fatalf("Expected 101 Switching Protocols, got %d", resp.StatusCode)
	}

	// We should always receive a first message (about our current game)
	_, _, err = c.ReadMessage()
	if err != nil {
		t.Fatalf("cannot read message: %v", err)
	}

	return c
}

func sendMessage(t *testing.T, c *websocket.Conn, message string) {
	err := c.WriteMessage(websocket.TextMessage, []byte(message))
	if err != nil {
		t.Fatalf("cannot send message: %v", err)
	}
	// Wait a bit to make sure the message was correctly sent
	time.Sleep(100 * time.Millisecond)
}

func readMessage[T interface{}](t *testing.T, c *websocket.Conn, tag string, name string) T {
	done := make(chan struct{})
	var msgType int
	var msg []byte
	var err error

	go func() {
		msgType, msg, err = c.ReadMessage()
		close(done)
	}()
	select {
	case <- time.After(1 * time.Second):
		t.Fatalf("timeout: no message received within 1 second while waiting for message with tag %s", tag)
		panic("failed")
	case <-done:
		if err != nil {
			t.Fatalf("failed to read message: %v", err)
		}

		if msgType == -1 {
			t.Fatal("invalid message type")
		}

		var data []interface{}
		err = json.Unmarshal(msg, &data)
		if err != nil {
			t.Fatalf("failed to unmarshall: %v", err)
		}

		if len(data) < 2 {
			t.Fatalf("not enough elements")
		}

		if gotTag, ok := data[0].(string); !ok || gotTag != tag {
			t.Fatalf("unexpected tag: %v", data[0])
		}

		obj, ok := data[1].(map[string]interface{})
		if !ok {
			t.Fatalf("invalid payload")
		}

		val, ok := obj[name].(T)
		if !ok {
			t.Fatalf("field %q missing or not string", name)
		}

		return val
	}
}

// Wait one second for a message, fail the test if nothing is received
func expectMessage(t *testing.T, c *websocket.Conn, expected string) {
	t.Helper()
	log.Printf("EXPECTED: %s", expected)
	done := make(chan struct{})
	var msgType int
	var msg []byte
	var err error

	go func() {
		msgType, msg, err = c.ReadMessage()
		close(done)
	}()

	select {
	case <-time.After(1 * time.Second):
		t.Fatalf("timeout: no message received within 1 second while waiting for %s", expected)
	case <-done:
		if err != nil {
			t.Fatalf("error when receiving response: %v", err)
		}
		if string(msg) != expected {
			t.Fatalf("response is not the expected one:\nexpected: `%s`\ngot     : `%s`", expected, string(msg))
		}
		if msgType == -1 {
			t.Fatal("invalid message type")
		}
		log.Printf("GOT: %s", expected)
	}
}

func toJSON(t *testing.T, v interface{}) string {
	b, err := json.Marshal(v)
	if err != nil {
		t.Fatalf("cannot convert to JSON: %v", err)
	}
	return string(b)
}

func ExpectMessageSelection(mock sqlmock.Sqlmock, configRoomId model.GameID, messages []model.Message) {
	rows := sqlmock.NewRows(model.MessageRows)
	for _, m := range(messages) {
		rows.AddRow(m.ID, m.GameID, m.Sender.ID, m.Sender.Name, m.Timestamp, m.Content)
	}
	query := `SELECT \* FROM "messages" WHERE game_id = \$1 ORDER BY timestamp ASC`
	mock.ExpectQuery(query).WithArgs(configRoomId).WillReturnRows(rows)
}

func ExpectMessageInsertion(mock sqlmock.Sqlmock, message model.Message) {
	query := `INSERT INTO "messages"`
	mock.ExpectBegin()
	mock.ExpectQuery(query).
		WithArgs(message.GameID, message.Sender.ID, message.Sender.Name, message.Timestamp, message.Content).
		WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))
	mock.ExpectCommit()
}

func ConfigRoomsToRows(configRooms []model.ConfigRoom) *sqlmock.Rows {
	rows := sqlmock.NewRows(model.ConfigRoomRows)
	for _, c := range(configRooms) {
		var opponentId driver.Value = nil
		var opponentName driver.Value = nil
		if c.ChosenOpponent != nil {
			opponentId = c.ChosenOpponent.ID
			opponentName = c.ChosenOpponent.Name
		}
		rows.AddRow(
			c.ID, c.Creator.ID, c.Creator.Name, c.CreatorElo, opponentId, opponentName,

			c.Status, c.FirstPlayer, c.GameType, c.MoveDuration, c.GameDuration, c.RulesConfig, c.GameName,
		)
	}
	return rows
}
func ExpectInGameConfigRoomSelection(mock sqlmock.Sqlmock, configRooms []model.ConfigRoom) {
	rows := ConfigRoomsToRows(configRooms)
	query := `SELECT \* FROM "config_rooms" WHERE status != \$1`
	mock.ExpectQuery(query).WithArgs("Finished").WillReturnRows(rows)
}

func ExpectSpecificConfigRoomSelection(mock sqlmock.Sqlmock, configRoom model.ConfigRoom) {
	rows := ConfigRoomsToRows([]model.ConfigRoom{configRoom})
	query := `SELECT \* FROM "config_rooms" WHERE id = \$1 ORDER BY "config_rooms"\."id" LIMIT \$2`
	mock.ExpectQuery(query).WithArgs(configRoom.ID, 1).WillReturnRows(rows)
}

func ExpectConfigRoomInsertion(mock sqlmock.Sqlmock, configRoom model.ConfigRoom) {
	var opponentId driver.Value = nil
	var opponentName driver.Value = nil
	if configRoom.ChosenOpponent != nil {
		opponentId = configRoom.ChosenOpponent.ID
		opponentName = configRoom.ChosenOpponent.Name
	}
	configRoomValues := []driver.Value{
		configRoom.Creator.ID,
		configRoom.Creator.Name,
		configRoom.CreatorElo,
		opponentId,
		opponentName,
		configRoom.Status,
		configRoom.FirstPlayer,
		configRoom.GameType,
		configRoom.MoveDuration,
		configRoom.GameDuration,
		configRoom.GameName,
	}

	query := `INSERT INTO "config_rooms"`
	mock.ExpectBegin()
	mock.ExpectQuery(query).
		WithArgs(configRoomValues...).
		WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(configRoom.ID))
	mock.ExpectCommit()
}

func ExpectConfigRoomUpdateSelectOpponent(mock sqlmock.Sqlmock, configRoom model.ConfigRoom) {
	var opponentId driver.Value = nil
	var opponentName driver.Value = nil
	if configRoom.ChosenOpponent != nil {
		opponentId = configRoom.ChosenOpponent.ID
		opponentName = configRoom.ChosenOpponent.Name
	}

	query := `UPDATE "config_rooms" SET "chosen_opponent_id"=\$1,"chosen_opponent_name"=\$2 WHERE id = \$3`
	mock.ExpectBegin()
	mock.ExpectExec(query).
		WithArgs(opponentId, opponentName, configRoom.ID).
		WillReturnResult(sqlmock.NewResult(0, 1)) // 1 row affected
	mock.ExpectCommit()
}

func ExpectConfigRoomUpdateProposeConfig(mock sqlmock.Sqlmock, configRoom model.ConfigRoom) {
	query := `UPDATE "config_rooms" SET "status"=\$1,"first_player"=\$2,"game_type"=\$3,"move_duration"=\$4,"game_duration"=\$5,"rules_config"=\$6 WHERE "id" = \$7`
	mock.ExpectBegin()
	mock.ExpectExec(query).
		WithArgs(configRoom.Status, configRoom.FirstPlayer, configRoom.GameType, configRoom.MoveDuration, configRoom.GameDuration, configRoom.RulesConfig, configRoom.ID).
		WillReturnResult(sqlmock.NewResult(0, 1)) // 1 row affected
	mock.ExpectCommit()
}

func ExpectConfigRoomUpdateStatus(mock sqlmock.Sqlmock, configRoom model.ConfigRoom) {
	query := `UPDATE "config_rooms" SET "status"=\$1 WHERE "id" = \$2`
	mock.ExpectBegin()
	mock.ExpectExec(query).
		WithArgs(configRoom.Status, configRoom.ID).
		WillReturnResult(sqlmock.NewResult(0, 1)) // 1 row affected
	mock.ExpectCommit()
}

func ExpectCandidateInsertion(mock sqlmock.Sqlmock, candidate model.Candidate) {
	candidateValues := []driver.Value{
		candidate.GameID,
		candidate.User.ID,
		candidate.User.Name,
		candidate.Elo,
	}
	query := `INSERT INTO "candidates"`
	mock.ExpectBegin()
	mock.ExpectQuery(query).
		WithArgs(candidateValues...).
		WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(candidate.ID))
	mock.ExpectCommit()
}

func GameToDriverValues(game model.Game) []driver.Value {
	return []driver.Value{
		game.GameID,
		game.GameName,
		game.PlayerZero.ID, game.PlayerZero.Name,
		game.PlayerOne.ID, game.PlayerOne.Name,
		game.Result,
		game.Beginning,
	}
}

func ExpectSpecificGameSelection(mock sqlmock.Sqlmock, game model.Game) {
	rows := sqlmock.NewRows(model.GameRows)
	rows.AddRow(GameToDriverValues(game)...)
	query := `SELECT \* FROM "games" WHERE game_id = \$1 ORDER BY "games"."game_id" LIMIT \$2`
	mock.ExpectQuery(query).WithArgs(game.GameID, 1).WillReturnRows(rows)
}

func ExpectGameInsertion(mock sqlmock.Sqlmock, game model.Game) {
	gameValues := []driver.Value{
		game.GameID,
		game.GameName,
		game.PlayerZero.ID, game.PlayerZero.Name,
		game.PlayerOne.ID, game.PlayerOne.Name,
		game.Result,
		game.Beginning,
	}

	query := `INSERT INTO "games"`
	mock.ExpectBegin()
	mock.ExpectExec(query).
		WithArgs(gameValues...).
        WillReturnResult(sqlmock.NewResult(1, 1)) // 1 row inserted
	mock.ExpectCommit()
}

func ExpectGameUpdateSetResult(mock sqlmock.Sqlmock, game model.Game) {
	query := `UPDATE "games" SET "result"=\$1 WHERE "game_id" = \$2`
	mock.ExpectBegin()
	mock.ExpectExec(query).
		WithArgs(game.Result, game.GameID).
		WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectCommit()
}

func EloToDriverValues(elo model.Elo) []driver.Value {
	return []driver.Value{
		elo.ID, elo.User.ID, elo.User.Name,
		elo.GameName, elo.CurrentElo, elo.GamesPlayed,
	}
}

func ExpectEloSelection(mock sqlmock.Sqlmock, userId string, gameName string, elo *model.Elo) {
	rows := sqlmock.NewRows(model.EloRows)
	if elo != nil {
		rows.AddRow(EloToDriverValues(*elo)...)
	}

	query := `SELECT \* FROM "elos" WHERE user_id = \$1 AND game_name = \$2 ORDER BY "elos"\."id" LIMIT \$3`
	mock.ExpectQuery(query).WithArgs(userId, gameName, 1).WillReturnRows(rows)
}

func ExpectEloInsertion(mock sqlmock.Sqlmock, elo model.Elo) {
	query := `INSERT INTO "elos"`
	mock.ExpectBegin()
	mock.ExpectQuery(query).
		WithArgs(EloToDriverValues(elo)[1:]...).
		WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(elo.ID))
	mock.ExpectCommit()
}

func ExpectEloUpdates(mock sqlmock.Sqlmock, firstElo model.Elo, secondElo model.Elo) {
	query := `UPDATE "elos" SET "current_elo"=\$1,"games_played"=\$2 WHERE game_name = \$3 and user_id = \$4`
	mock.ExpectBegin()
	mock.ExpectExec(query).
		WithArgs(firstElo.CurrentElo, firstElo.GamesPlayed, firstElo.GameName, firstElo.User.ID).
		WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectExec(query).
		WithArgs(secondElo.CurrentElo, secondElo.GamesPlayed, secondElo.GameName, secondElo.User.ID).
		WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectCommit()
}

func ExpectCandidateSelection(mock sqlmock.Sqlmock, gameId model.GameID, candidates []model.Candidate) {
	rows := sqlmock.NewRows(model.CandidateRows)
	for _, c := range(candidates) {
		rows.AddRow(c.ID, c.GameID, c.User.ID, c.User.Name, c.Elo)
	}
	query := `SELECT \* FROM "candidates" WHERE game_id = \$1`
	mock.ExpectQuery(query).WithArgs(gameId).WillReturnRows(rows)
}

func CurrentGameToDriverValues(currentGame model.CurrentGame) []driver.Value {
	var opponentId driver.Value = nil
	var opponentName driver.Value = nil
	if currentGame.Opponent != nil {
		opponentId = currentGame.Opponent.ID
		opponentName = currentGame.Opponent.Name
	}

	return []driver.Value{
		currentGame.ID,
		currentGame.User.ID,
		currentGame.User.Name,
		currentGame.GameID,
		currentGame.GameName,
		currentGame.Creator.ID,
		currentGame.Creator.Name,
		opponentId,
		opponentName,
		currentGame.Role,
	}
}

func ExpectCurrentGameInsertion(mock sqlmock.Sqlmock, currentGame model.CurrentGame) {
	query := `INSERT INTO "current_games"`
	mock.ExpectBegin()
	mock.ExpectQuery(query).
		WithArgs(CurrentGameToDriverValues(currentGame)[1:]...).
		WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(currentGame.ID))
	mock.ExpectCommit()
}

func ExpectCurrentGameUpdate(mock sqlmock.Sqlmock, currentGame model.CurrentGame) {
	var opponentId driver.Value = nil
	var opponentName driver.Value = nil
	if currentGame.Opponent != nil {
		opponentId = currentGame.Opponent.ID
		opponentName = currentGame.Opponent.Name
	}
	currentGameValues := []driver.Value{currentGame.GameID, currentGame.GameName, currentGame.Creator.ID, currentGame.Creator.Name, opponentId, opponentName, currentGame.Role, currentGame.User.ID}
	query := `UPDATE "current_games" SET "game_id"=\$1,"game_name"=\$2,"creator_id"=\$3,"creator_name"=\$4,"opponent_id"=\$5,"opponent_name"=\$6,"role"=\$7 WHERE user_id = \$8`
	mock.ExpectBegin()
	mock.ExpectExec(query).
		WithArgs(currentGameValues...).
		WillReturnResult(sqlmock.NewResult(0, 1)) // 1 row affected
	mock.ExpectCommit()
}

func ExpectCurrentGameUpdateAfterStart(mock sqlmock.Sqlmock, currentGame model.CurrentGame) {
	query := `UPDATE "current_games" SET "game_id"=\$1,"game_name"=\$2,"opponent_id"=\$3,"opponent_name"=\$4,"role"=\$5 WHERE user_id = \$6`
	mock.ExpectBegin()
	mock.ExpectExec(query).
		WithArgs(currentGame.GameID, currentGame.GameName, currentGame.Opponent.ID, currentGame.Opponent.Name, currentGame.Role, currentGame.User.ID).
		WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectCommit()
}

func ExpectCurrentGameDelete(mock sqlmock.Sqlmock, userId string) {
	query := `DELETE FROM "current_games" WHERE user_id = \$1`
	mock.ExpectBegin()
	mock.ExpectExec(query).
		WithArgs(userId).
		WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectCommit()
}

func ExpectCurrentGameSelectObservers(mock sqlmock.Sqlmock, gameId model.GameID, currentGames []model.CurrentGame) {
	rows := sqlmock.NewRows(model.CurrentGameRows)
	for _, c := range(currentGames) {
		var opponentId driver.Value = nil
		var opponentName driver.Value = nil
		if c.Opponent != nil {
			opponentId = c.Opponent.ID
			opponentName = c.Opponent.Name
		}
		rows.AddRow(c.ID, c.User.ID, c.User.Name, c.GameID, c.GameName, c.Creator.ID, c.Creator.Name, opponentId, opponentName, c.Role)
	}

	query := `SELECT \* FROM "current_games" WHERE game_id = \$1 and role = 'Observer'`
	mock.ExpectQuery(query).
		WithArgs(gameId).
		WillReturnRows(rows)
}

func ExpectEventInsertion(mock sqlmock.Sqlmock, event model.GameEvent) {
	dataBytes, err := json.Marshal(event.Data)
	if err != nil {
		panic(fmt.Sprintf("failed to marshal event.Data: %v", err))
	}

	query := `INSERT INTO "game_events"`
	mock.ExpectBegin()
	mock.ExpectQuery(query).
		WithArgs(
			event.GameID,
			event.Timestamp, event.User.ID, event.User.Name,
			string(dataBytes)).
		WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(event.ID))
	mock.ExpectCommit()
}

func ExpectEventSelection(mock sqlmock.Sqlmock, gameId model.GameID, events []model.GameEvent) {
	rows := sqlmock.NewRows(model.GameEventRows)
	for _, e := range(events) {
		dataBytes, err := json.Marshal(e.Data)
		if err != nil {
			panic(fmt.Sprintf("failed to marshal event.Data: %v", err))
		}
		rows.AddRow(e.ID, e.GameID, e.Timestamp, e.User.ID, e.User.Name, string(dataBytes))
	}
	query := `SELECT \* FROM "game_events" WHERE game_id = \$1 ORDER BY timestamp ASC`
	mock.ExpectQuery(query).WithArgs(gameId).WillReturnRows(rows)
}

type ScenarioBuilder struct {
	t *testing.T
	mock sqlmock.Sqlmock
	cleanupFunctions []func ()

	connections map[string]*websocket.Conn
	users map[string]model.MinimalUser
	configRooms map[model.GameID]*model.ConfigRoom
	games map[model.GameID]*model.Game
	messages map[model.GameID][]model.Message // messages per game id
	elos map[string]map[string]*model.Elo // user to game name to elo
	currentGames map[string]*model.CurrentGame
	candidates map[model.GameID][]model.Candidate
	events map[model.GameID][]model.GameEvent
	lobbySubscribers []string
	configRoomSubscribers map[model.GameID][]string // map from game id to subscriber ids
	gameSubscribers map[model.GameID][]string
	subscriptions map[string]model.GameID // reverse, map from subscriber id to the game subscribed
}

func NewScenarioBuilder(t *testing.T) ScenarioBuilder {
	everyboard.Now = func() int64 { return 42 }
	everyboard.NowFloat = func() float64 { return 42 }
	everyboard.RandBool = func() bool { return true }

	stopServer, mock := PrepareServer(t)
	return ScenarioBuilder{
		t: t,
		mock: mock,
		cleanupFunctions: []func (){ stopServer },
		connections: make(map[string]*websocket.Conn),
		users: make(map[string]model.MinimalUser),
		configRooms: make(map[model.GameID]*model.ConfigRoom),
		games: make(map[model.GameID]*model.Game),
		messages: make(map[model.GameID][]model.Message),
		elos: make(map[string]map[string]*model.Elo),
		currentGames: make(map[string]*model.CurrentGame),
		candidates: make(map[model.GameID][]model.Candidate),
		events: make(map[model.GameID][]model.GameEvent),
		lobbySubscribers: []string{},
		configRoomSubscribers: make(map[model.GameID][]string),
		gameSubscribers: make(map[model.GameID][]string),
		subscriptions: make(map[string]model.GameID),
	}
}

func (sb ScenarioBuilder) Cleanup() {
	for _, f := range(sb.cleanupFunctions) {
		f()
	}
}

func (sb ScenarioBuilder) EstablishConnection(userId string) string {
	conn := EstablishWebSocketConnection(sb.t, userId)
	sb.connections[userId] = conn
	sb.users[userId] = model.MinimalUser{ID: userId, Name: userId}
	return userId
}

func (sb ScenarioBuilder) getUser(userId string) model.MinimalUser {
	user, ok := sb.users[userId]
	if !ok {
		sb.t.Fatalf("no user: %s", userId)
	}
	return user
}

func (sb ScenarioBuilder) getConnection(userId string) *websocket.Conn {
	conn, ok := sb.connections[userId]
	if !ok {
		sb.t.Fatalf("no connection for: %s", userId)
	}
	return conn
}

func (sb *ScenarioBuilder) SubscribeLobby(userId string) {
	conn := sb.getConnection(userId)
	ExpectMessageSelection(sb.mock, model.GameIDLobby, sb.messages[model.GameIDLobby])
	configRooms := []model.ConfigRoom{}
	for _, c := range(sb.configRooms) {
		if c.Status != model.StatusFinished {
			configRooms = append(configRooms, *c)
		}
	}
	ExpectInGameConfigRoomSelection(sb.mock, configRooms)
	sendMessage(sb.t, conn, `["SubscribeLobby"]`)
	sb.subscriptions[userId] = model.GameIDLobby
	sb.lobbySubscribers = append(sb.lobbySubscribers, userId)
	log.Printf("lobby subscribers: %v", sb.lobbySubscribers)
}

func find(t *testing.T, arr []string, value string) *int {
	for i, v := range(arr) {
		if v == value {
			return &i
		}
	}
	return nil
}

func (sb ScenarioBuilder) removeLobbySubscription(userId string) {
	log.Printf("lobby subscribers: %v", sb.lobbySubscribers)
	idx := find(sb.t, sb.lobbySubscribers, userId)
	if idx == nil {
		sb.t.Fatalf("cannot find subscriber: %s", userId)
		return
	}
	sb.lobbySubscribers = append(sb.lobbySubscribers[0:*idx], sb.lobbySubscribers[*idx+1:]...)
}

func (sb ScenarioBuilder) isSubscribedToConfigRoom(userId string, gameId model.GameID) bool {
	idx := find(sb.t, sb.configRoomSubscribers[gameId], userId)
	return idx != nil
}

func (sb ScenarioBuilder) removeConfigRoomSubscription(userId string, gameId model.GameID) {
	idx := find(sb.t, sb.configRoomSubscribers[gameId], userId)
	if idx == nil {
		sb.t.Fatalf("cannot find subscriber: %s", userId)
		return
	}
	sb.configRoomSubscribers[gameId] = append(sb.configRoomSubscribers[gameId][0:*idx], sb.configRoomSubscribers[gameId][*idx+1:]...)
}

func (sb ScenarioBuilder) removeGameSubscription(userId string, gameId model.GameID) {
	idx := find(sb.t, sb.gameSubscribers[gameId], userId)
	if idx == nil {
		sb.t.Fatalf("cannot find subscriber: %s", userId)
		return
	}
	sb.gameSubscribers[gameId] = append(sb.gameSubscribers[gameId][0:*idx], sb.gameSubscribers[gameId][*idx+1:]...)
}

func (sb ScenarioBuilder) getElo(user model.MinimalUser, gameName string) model.Elo {
	emptyElo := model.Elo{ID: 1, User: user, GameName: gameName, CurrentElo: 0, GamesPlayed: 0}
	elo := emptyElo
	newElo := true

	userElos, ok := sb.elos[user.ID]
	if ok {
		gameElo, ok := userElos[gameName]
		if ok {
			elo = *gameElo
			newElo = false
		} else {
			sb.elos[user.ID][gameName] = &elo
		}
	} else {
		sb.elos[user.ID] = make(map[string]*model.Elo)
	}

	if newElo {
		log.Printf("new elo")
		ExpectEloSelection(sb.mock, user.ID, gameName, nil)
		ExpectEloInsertion(sb.mock, elo)
	} else {
		ExpectEloSelection(sb.mock, user.ID, gameName, &elo)
	}
	return elo
}

func (sb ScenarioBuilder) getNextEloId() uint64 {
	total := 0
	for _, e := range(sb.events) {
		total += len(e)
	}
	return uint64(total+1)
}

func (sb ScenarioBuilder) getConfigRoomSubscribers(gameId model.GameID) []string {
	subscribers, ok := sb.configRoomSubscribers[gameId]
	if !ok {
		subscribers = []string{}
		sb.configRoomSubscribers[gameId] = subscribers
	}
	return subscribers
}

func (sb ScenarioBuilder) getGameSubscribers(gameId model.GameID) []string {
	subscribers, ok := sb.gameSubscribers[gameId]
	if !ok {
		subscribers = []string{}
		sb.gameSubscribers[gameId] = subscribers
	}
	return subscribers
}

func (sb ScenarioBuilder) getSubscribedGameId(userId string) model.GameID {
	subscription, ok := sb.subscriptions[userId]
	if !ok {
		sb.t.Fatalf("no subscription for %s", userId)
	}
	return subscription
}

func (sb ScenarioBuilder) Create(userId string, gameName string) model.GameID {
	user := sb.getUser(userId)
	conn := sb.getConnection(userId)

	elo := sb.getElo(user, gameName)
	configRoom := model.ConfigRoom{
		ID: model.GameID(len(sb.configRooms)+2), // +2 because of lobby
		Creator: user,
		CreatorElo: elo.CurrentElo,
		ChosenOpponent: nil,
		Status: model.StatusCreated,
		FirstPlayer: model.FirstPlayerRandom,
		GameType: model.GameTypeStandard,
		MoveDuration: model.StandardMoveDuration,
		GameDuration: model.StandardGameDuration,
		RulesConfig: json.RawMessage(`null`),
		GameName: gameName,
	}
	ExpectConfigRoomInsertion(sb.mock, configRoom)
	sb.configRooms[configRoom.ID] = &configRoom
	currentGamePlayer := model.CurrentGame{
		ID: uint(len(sb.currentGames)),
		User: user,
		GameID: configRoom.ID,
		GameName: gameName,
		Creator: user,
		Opponent: nil,
		Role: model.UserRoleCreator,
	}
	ExpectCurrentGameInsertion(sb.mock, currentGamePlayer)
	sb.currentGames[userId] = &currentGamePlayer
	sendMessage(sb.t, conn, fmt.Sprintf(`["Create",{"gameName":"%s"}]`, gameName))
	gameId := readMessage[string](sb.t, conn, "GameCreated", "gameId")
	expectMessage(sb.t, conn, fmt.Sprintf(`["CurrentGameUpdate",{"currentGame":%s}]`, toJSON(sb.t, currentGamePlayer)))

	configRoomJSON := toJSON(sb.t, configRoom)
	for _, subscriberId := range(sb.getConfigRoomSubscribers(configRoom.ID)) {
		log.Printf("subscriber to config room: %s", subscriberId)
		expectMessage(sb.t, sb.getConnection(subscriberId), fmt.Sprintf(`["ConfigRoomUpdate",{"gameId":"%s","configRoom":%s}]`, gameId, configRoomJSON))
	}
	for _, subscriberId := range(sb.lobbySubscribers) {
		log.Printf("subscriber to lobby: %s", subscriberId)
		expectMessage(sb.t, sb.getConnection(subscriberId), fmt.Sprintf(`["ConfigRoomUpdate",{"gameId":"%s","configRoom":%s}]`, gameId, configRoomJSON))
	}
	return configRoom.ID
}

func (sb ScenarioBuilder) getCandidates(gameId model.GameID) []model.Candidate {
	candidates, ok := sb.candidates[gameId]
	if !ok {
		return []model.Candidate{}
	}
	return candidates
}

func (sb ScenarioBuilder) getNextCandidateId() uint64 {
	total := 0
	for _, cs := range(sb.candidates) {
		total += len(cs)
	}
	return uint64(total+1)
}

func (sb ScenarioBuilder) addCandidate(candidate model.Candidate) {
	candidates, ok := sb.candidates[candidate.GameID]
	if !ok {
		candidates = []model.Candidate{candidate}
	}
	sb.candidates[candidate.GameID] = append(candidates, candidate)
}

func (sb ScenarioBuilder) removeCandidate(userId string, gameId model.GameID) {
	gameCandidates, ok := sb.candidates[gameId]
	if !ok {
		sb.t.Fatalf("no game candidates for game %d", gameId)
	}

	foundIdx := -1
	for idx, candidate := range(gameCandidates) {
		if candidate.User.ID == userId {
			foundIdx = idx
			break
		}
	}
	if foundIdx == -1 {
		sb.t.Fatalf("no candidates %s for game %d, candidates are: %v", userId, gameId, sb.candidates)
	}

	sb.candidates[gameId] = append(gameCandidates[0:foundIdx], gameCandidates[foundIdx+1:]...)
}

func (sb ScenarioBuilder) addGame(game *model.Game) {
	sb.games[game.GameID] = game
}

func (sb ScenarioBuilder) getNextEventId() uint64 {
	total := 0
	for _, e := range(sb.events) {
		total += len(e)
	}
	return uint64(total+1)
}

func (sb ScenarioBuilder) addEvent(gameId model.GameID, event model.GameEvent) {
	_, ok := sb.events[gameId]
	if !ok {
		sb.events[gameId] = []model.GameEvent{}
	}
	sb.events[gameId] = append(sb.events[gameId], event)
}

func (sb ScenarioBuilder) subscribeConfigRoom(userId string, gameId model.GameID) {
	log.Printf("subscribeConfigRoom with %d: %v", gameId, sb.configRoomSubscribers[gameId])
	sb.subscriptions[userId] = gameId
	subscribers := sb.getConfigRoomSubscribers(gameId)
	sb.configRoomSubscribers[gameId] = append(subscribers, userId)
	log.Printf("subscribeConfigRoom with %d: %v", gameId, sb.configRoomSubscribers[gameId])
}

func (sb ScenarioBuilder) subscribeGame(userId string, gameId model.GameID) {
	sb.subscriptions[userId] = gameId
	subscribers := sb.getGameSubscribers(gameId)
	sb.gameSubscribers[gameId] = append(subscribers, userId)
}

func (sb ScenarioBuilder) getConfigRoom(gameId model.GameID) *model.ConfigRoom {
	configRoom, ok := sb.configRooms[gameId]
	if !ok {
		sb.t.Fatalf("config room does not exist: %d", gameId)
	}
	return configRoom
}

func (sb ScenarioBuilder) getGame(gameId model.GameID) *model.Game {
	game, ok := sb.games[gameId]
	if !ok {
		sb.t.Fatalf("game does not exist: %d", gameId)
	}
	return game
}

func (sb ScenarioBuilder) getMessages(gameId model.GameID) []model.Message {
	messages, ok := sb.messages[gameId]
	if !ok {
		return []model.Message{}
	}
	return messages
}

func (sb ScenarioBuilder) getEvents(gameId model.GameID) []model.GameEvent {
	events, ok := sb.events[gameId]
	if !ok {
		return []model.GameEvent{}
	}
	return events
}

func (sb ScenarioBuilder) SubscribeConfigRoom(userId string, gameId model.GameID) {
	configRoom := sb.getConfigRoom(gameId)
	conn := sb.getConnection(userId)
	user := sb.getUser(userId)

	ExpectSpecificConfigRoomSelection(sb.mock, *configRoom)
	if userId != configRoom.Creator.ID {
		elo := sb.getElo(user, configRoom.GameName)
		candidate := model.Candidate{
			ID: sb.getNextCandidateId(),
			GameID: configRoom.ID,
			User: user,
			Elo: elo.CurrentElo,
		}
		ExpectCandidateInsertion(sb.mock, candidate)
		sb.addCandidate(candidate)
		currentGame := model.CurrentGame{
			ID: uint(len(sb.currentGames)+1),
			User: user,
			GameID: configRoom.ID,
			GameName: configRoom.GameName,
			Creator: configRoom.Creator,
			Opponent: configRoom.ChosenOpponent,
			Role: model.UserRoleCandidate,
		}
		ExpectCurrentGameInsertion(sb.mock, currentGame)
		sb.currentGames[userId] = &currentGame
	}
	candidates := sb.getCandidates(gameId)
	ExpectCandidateSelection(sb.mock, gameId, candidates)

	encodedGameId := encodeID(sb.t, gameId)
	sendMessage(sb.t, conn, fmt.Sprintf(`["SubscribeConfigRoom", {"gameId":"%s"}]`, encodedGameId))
	expectMessage(sb.t, conn, fmt.Sprintf(`["ConfigRoomUpdate",{"gameId":"%s","configRoom":%s}]`, encodedGameId, toJSON(sb.t, configRoom)))

	sb.subscribeConfigRoom(userId, gameId)

	// All subscribers see the candidate appear
	candidateJSON := toJSON(sb.t, user)
	if userId != configRoom.Creator.ID {
		log.Printf("user is not creator, getting subscribers of %d", configRoom.ID)
		for _, subscriber := range(sb.getConfigRoomSubscribers(configRoom.ID)) {
			log.Printf("%s is is a subscriber", subscriber)
			expectMessage(sb.t, sb.getConnection(subscriber),
				fmt.Sprintf(`["CandidateJoined",{"candidate":%s}]`, candidateJSON))
		}
	}

	if userId != configRoom.Creator.ID {
		expectMessage(sb.t, conn, fmt.Sprintf(`["CurrentGameUpdate",{"currentGame":%s}]`, toJSON(sb.t, sb.getCurrentGame(userId))))
	}
}

func (sb ScenarioBuilder) SubscribeGame(userId string, gameId model.GameID) {
	conn := sb.getConnection(userId)
	game := sb.getGame(gameId)
	configRoom := sb.getConfigRoom(gameId)
	user := sb.getUser(userId)

	ExpectSpecificGameSelection(sb.mock, *game)
	isObserver := game.PlayerZero.ID != userId && game.PlayerOne.ID != userId
	if isObserver {
		// user is observer
		ExpectSpecificConfigRoomSelection(sb.mock, *configRoom)
		currentGame := model.CurrentGame{
			ID: 1,
			User: user,
			GameID: configRoom.ID,
			GameName: configRoom.GameName,
			Creator: configRoom.Creator,
			Opponent: configRoom.ChosenOpponent,
			Role: model.UserRoleObserver,
		}
		ExpectCurrentGameInsertion(sb.mock, currentGame)
		sb.currentGames[userId] = &currentGame
	}

	encodedGameId := encodeID(sb.t, gameId)
	ExpectMessageSelection(sb.mock, configRoom.ID, sb.getMessages(configRoom.ID))
	events := sb.getEvents(configRoom.ID)
	ExpectEventSelection(sb.mock, configRoom.ID, events)

	sendMessage(sb.t, conn, fmt.Sprintf(`["SubscribeGame",{"gameId":"%s"}]`, encodedGameId))

	sb.subscribeGame(userId, gameId)

	if isObserver {
		currentGame := sb.getCurrentGame(userId)
		expectMessage(sb.t, conn, fmt.Sprintf(`["CurrentGameUpdate",{"currentGame":%s}]`, toJSON(sb.t, currentGame)))
	}
	expectMessage(sb.t, conn, fmt.Sprintf(`["GameUpdate",{"game":%s}]`, toJSON(sb.t, game)))
	for _, event := range(events) {
		expectMessage(sb.t, conn, fmt.Sprintf(`["GameEvent",{"event":%s,"serverTime":42}]`, toJSON(sb.t, event)))
	}
	syncEvent := model.GameEvent{
		ID: 0,
		GameID: configRoom.ID,
		Timestamp: 42,
		User: user,
		Data: model.EventDataSync,
	}
	expectMessage(sb.t, conn, fmt.Sprintf(`["GameEvent",{"event":%s,"serverTime":42}]`, toJSON(sb.t, syncEvent)))
}

func (sb ScenarioBuilder) Unsubscribe(userId string) {
	log.Printf("unsubscribe: %s", userId)
	conn := sb.getConnection(userId)

	subscription, ok := sb.subscriptions[userId]
	if !ok {
		sb.t.Fatalf("TODO: handle unsubscribed case: error?")
	}

	delete(sb.subscriptions, userId)

	if subscription == model.GameIDLobby {
		// nothing special to do when leaving lobby
		sb.removeLobbySubscription(userId)
	} else if sb.isSubscribedToConfigRoom(userId, subscription) {
		sb.removeConfigRoomSubscription(userId, subscription)
		configRoom := sb.getConfigRoom(subscription)
		ExpectSpecificConfigRoomSelection(sb.mock, *configRoom)
		if configRoom.Creator.ID != userId {
			sb.removeCandidate(userId, subscription)
		}
	} else {
		// Should be subscribed to a game
		sb.removeGameSubscription(userId, subscription)
	}
	sendMessage(sb.t, conn, `["Unsubscribe"]`)
}

func (sb ScenarioBuilder) getCurrentGame(userId string) *model.CurrentGame {
	currentGame, ok := sb.currentGames[userId]
	if !ok {
		sb.t.Fatalf("no current game: %s", userId)
	}
	return currentGame
}

func (sb ScenarioBuilder) getObservers(gameId model.GameID) []model.CurrentGame{
	currentGames := []model.CurrentGame{}
	for _, currentGame := range(sb.currentGames) {
		if (*currentGame).GameID == gameId && currentGame.Role == model.UserRoleObserver {
			currentGames = append(currentGames, *currentGame)
		}
	}
	return currentGames
}

func (sb ScenarioBuilder) SelectOpponent(creator string, opponent string) {
	gameId := sb.getSubscribedGameId(creator)
	connCreator := sb.getConnection(creator)
	connOpponent := sb.getConnection(opponent)
	configRoom := sb.getConfigRoom(gameId)
	userOpponent := sb.getUser(opponent)
	currentGamePlayer := sb.getCurrentGame(creator)
	currentGameOpponent := sb.getCurrentGame(opponent)

	ExpectSpecificConfigRoomSelection(sb.mock, *configRoom)
	configRoom.ChosenOpponent = &userOpponent
	ExpectConfigRoomUpdateSelectOpponent(sb.mock, *configRoom)
	currentGamePlayer.Opponent = &userOpponent
	ExpectCurrentGameUpdate(sb.mock, *currentGamePlayer)
	currentGameOpponent.Opponent = &userOpponent
	currentGameOpponent.Role = model.UserRoleChosenOpponent
	ExpectCurrentGameUpdate(sb.mock, *currentGameOpponent)
	sendMessage(sb.t, connCreator,
		fmt.Sprintf(`["SelectOpponent",{"opponent":%s}]`, toJSON(sb.t, userOpponent)))

	expectMessage(sb.t, connCreator,
		fmt.Sprintf(`["CurrentGameUpdate",{"currentGame":%s}]`, toJSON(sb.t, currentGamePlayer)))
	expectMessage(sb.t, connOpponent,
		fmt.Sprintf(`["CurrentGameUpdate",{"currentGame":%s}]`, toJSON(sb.t, currentGameOpponent)))
	encodedGameId := encodeID(sb.t, gameId)
	configRoomJSON := toJSON(sb.t, configRoom)
	for _, subscriber := range(sb.getConfigRoomSubscribers(configRoom.ID)) {
		expectMessage(sb.t, sb.getConnection(subscriber),
			fmt.Sprintf(`["ConfigRoomUpdate",{"gameId":"%s","configRoom":%s}]`, encodedGameId, configRoomJSON))
	}
}

func (sb ScenarioBuilder) ProposeConfig(userId string, proposal model.ConfigProposal) {
	connPlayer := sb.getConnection(userId)
	gameId := sb.getSubscribedGameId(userId)
	configRoom := sb.getConfigRoom(gameId)
	configRoom.Status = model.StatusConfigProposed
	configRoom.FirstPlayer = model.FirstPlayerCreator
	configRoom.GameType = proposal.GameType
	configRoom.MoveDuration = proposal.MoveDuration
	configRoom.GameDuration = proposal.GameDuration
	configRoom.FirstPlayer = proposal.FirstPlayer
	configRoom.RulesConfig = proposal.RulesConfig
	log.Printf("rules config: %s, %v", configRoom.RulesConfig, configRoom.RulesConfig)

	ExpectSpecificConfigRoomSelection(sb.mock, *configRoom)
	ExpectConfigRoomUpdateProposeConfig(sb.mock, *configRoom)
	sendMessage(sb.t, connPlayer,
		fmt.Sprintf(`["ProposeConfig",{"config":%s}]`, toJSON(sb.t, proposal)))

	encodedGameId := encodeID(sb.t, gameId)
	configRoomJSON := toJSON(sb.t, configRoom)
	for _, subscriber := range(sb.getConfigRoomSubscribers(configRoom.ID)) {
		expectMessage(sb.t, sb.getConnection(subscriber),
			fmt.Sprintf(`["ConfigRoomUpdate",{"gameId":"%s","configRoom":%s}]`, encodedGameId, configRoomJSON))
	}
}

func (sb ScenarioBuilder) ReviewConfig(userId string) {
	connPlayer := sb.getConnection(userId)
	gameId := sb.getSubscribedGameId(userId)
	configRoom := sb.getConfigRoom(gameId)

	ExpectSpecificConfigRoomSelection(sb.mock, *configRoom)
	configRoom.Status = model.StatusCreated
	ExpectConfigRoomUpdateStatus(sb.mock, *configRoom)
	sendMessage(sb.t, connPlayer, `["ReviewConfig"]`)
	encodedGameId := encodeID(sb.t, gameId)
	configRoomJSON := toJSON(sb.t, configRoom)
	for _, subscriber := range(sb.getConfigRoomSubscribers(configRoom.ID)) {
		expectMessage(sb.t, sb.getConnection(subscriber),
			fmt.Sprintf(`["ConfigRoomUpdate",{"gameId":"%s","configRoom":%s}]`, encodedGameId, configRoomJSON))
	}
}

func (sb ScenarioBuilder) AcceptConfig(userId string) {
	gameId := sb.getSubscribedGameId(userId)
	configRoom := sb.getConfigRoom(gameId)
	userCreator := configRoom.Creator
	userOpponent := *configRoom.ChosenOpponent

	ExpectSpecificConfigRoomSelection(sb.mock, *configRoom)
	configRoom.Status = model.StatusStarted
	ExpectConfigRoomUpdateStatus(sb.mock, *configRoom)

	game := model.Game{
		GameID: configRoom.ID,
		GameName: configRoom.GameName,
		PlayerZero: userCreator, // the test needs to make sure that creator is zero
		PlayerOne: userOpponent,
		Result: model.ResultInProgress,
		Beginning: 42,
	}
	ExpectGameInsertion(sb.mock, game)
	sb.addGame(&game)
	eventStartGame := model.GameEvent{
		ID: sb.getNextEventId(),
		GameID: configRoom.ID,
		Timestamp: 42,
		User: userOpponent,
		Data: model.EventDataStartGame,
	}
	ExpectEventInsertion(sb.mock, eventStartGame)
	sb.addEvent(gameId, eventStartGame)
	ExpectCandidateSelection(sb.mock, configRoom.ID, sb.getCandidates(gameId))
	currentGameCreator := sb.getCurrentGame(userCreator.ID)
	currentGameCreator.Role = model.UserRolePlayer
	ExpectCurrentGameUpdate(sb.mock, *currentGameCreator)
	currentGameOpponent := sb.getCurrentGame(userOpponent.ID)
	currentGameOpponent.Role = model.UserRolePlayer
	ExpectCurrentGameUpdate(sb.mock, *currentGameOpponent)

	encodedGameId := encodeID(sb.t, gameId)
	sendMessage(sb.t, sb.getConnection(userId), `["AcceptConfig"]`)
	expectMessage(sb.t, sb.getConnection(userCreator.ID), fmt.Sprintf(`["CurrentGameUpdate",{"currentGame":%s}]`, toJSON(sb.t, currentGameCreator)))
	expectMessage(sb.t, sb.getConnection(userOpponent.ID), fmt.Sprintf(`["CurrentGameUpdate",{"currentGame":%s}]`, toJSON(sb.t, currentGameOpponent)))

	configRoomJSON := toJSON(sb.t, configRoom)
	for _, subscriber := range(sb.getConfigRoomSubscribers(configRoom.ID)) {
		expectMessage(sb.t, sb.getConnection(subscriber),
			fmt.Sprintf(`["ConfigRoomUpdate",{"gameId":"%s","configRoom":%s}]`, encodedGameId, configRoomJSON))
	}
}

func (sb ScenarioBuilder) doEvent(userId string, data model.EventData, eventStr string) {
	conn := sb.getConnection(userId)
	user := sb.getUser(userId)
	gameId := sb.getSubscribedGameId(userId)
	configRoom := sb.getConfigRoom(gameId)

	event := model.GameEvent{
		ID: sb.getNextEventId(),
		GameID: configRoom.ID,
		Timestamp: 42,
		User: user,
		Data: data,
	}

	ExpectEventInsertion(sb.mock, event)
	sb.addEvent(gameId, event)
	sendMessage(sb.t, conn, eventStr)

	eventJSON := toJSON(sb.t, event)
	for _, subscriber := range(sb.getGameSubscribers(configRoom.ID)) {
		log.Printf("%s is exppecting event %v", subscriber, data)
		expectMessage(sb.t, sb.getConnection(subscriber), fmt.Sprintf(`["GameEvent",{"event":%s,"serverTime":42}]`, eventJSON))
	}
}

func (sb ScenarioBuilder) Move(userId string, move json.RawMessage) {
	data := model.EventDataMove(move)
	sb.doEvent(userId, data, fmt.Sprintf(`["Move",{"move":%s}]`, toJSON(sb.t, move)))
}

func (sb ScenarioBuilder) ProposeDraw(userId string) {
	data := model.EventDataRequest(model.PropositionDraw)
	sb.doEvent(userId, data, `["Propose",{"proposition":"Draw"}]`)
}

func (sb ScenarioBuilder) AcceptDraw(userId string) {
	user := sb.getUser(userId)
	gameId := sb.getSubscribedGameId(userId)
	configRoom := sb.getConfigRoom(gameId)
	game := sb.getGame(gameId)

	data := model.EventDataReplyAccept(model.PropositionDraw, nil)
	eventStr := `["Accept",{"proposition":"Draw"}]`
	conn := sb.getConnection(userId)
	event := model.GameEvent{
		ID: sb.getNextEventId(),
		GameID: configRoom.ID,
		Timestamp: 42,
		User: user,
		Data: data,
	}
	ExpectEventInsertion(sb.mock, event)

	ExpectSpecificConfigRoomSelection(sb.mock, *configRoom)
	ExpectSpecificGameSelection(sb.mock, *game)
	game.Result = model.ResultAgreedDrawByZero
	ExpectGameUpdateSetResult(sb.mock, *game)
	eventEndGame := model.GameEvent{
	 	ID: sb.getNextEventId(),
	 	GameID: configRoom.ID,
	 	Timestamp: 42,
	 	User: user,
	 	Data: model.EventDataEndGame,
	}
	ExpectEventInsertion(sb.mock, eventEndGame)
	var opponent model.MinimalUser
	if game.PlayerZero.ID == userId {
		opponent = game.PlayerOne
	} else {
		opponent = game.PlayerZero
	}
	eloUser := sb.getElo(user, configRoom.GameName)
	eloOpponent := sb.getElo(opponent, configRoom.GameName)
	eloUser.GamesPlayed += 1
	eloOpponent.GamesPlayed += 1
	newEloUser, newEloOpponent := everyboard.ComputeNewElos(eloUser, eloOpponent, true)
	eloUser.CurrentElo = newEloUser.CurrentElo
	eloOpponent.CurrentElo = newEloOpponent.CurrentElo
	ExpectEloUpdates(sb.mock, eloUser, eloOpponent)
	configRoom.Status = model.StatusFinished
	ExpectConfigRoomUpdateStatus(sb.mock, *configRoom)
	ExpectCurrentGameDelete(sb.mock, user.ID)
	ExpectCurrentGameDelete(sb.mock, opponent.ID)
	ExpectCurrentGameSelectObservers(sb.mock, configRoom.ID, sb.getObservers(configRoom.ID))
	for _, subscriber := range(sb.getGameSubscribers(configRoom.ID)) {
		if subscriber != user.ID && subscriber != opponent.ID {
			ExpectCurrentGameDelete(sb.mock, sb.getUser(subscriber).ID)
			delete(sb.currentGames, subscriber)
		}
	}

	sb.addEvent(gameId, event)
	sendMessage(sb.t, conn, eventStr)

	eventJSON := toJSON(sb.t, event)
	for _, subscriber := range(sb.getGameSubscribers(configRoom.ID)) {
		expectMessage(sb.t, sb.getConnection(subscriber), fmt.Sprintf(`["GameEvent",{"event":%s,"serverTime":42}]`, eventJSON))
	}

	for _, subscriber := range(sb.getGameSubscribers(configRoom.ID)) {
		expectMessage(sb.t, sb.getConnection(subscriber), `["CurrentGameUpdate",{"currentGame":null}]`)
	}
	gameJSON := toJSON(sb.t, game)
	eventEndGameJSON := toJSON(sb.t, eventEndGame)
	for _, subscriber := range(sb.getGameSubscribers(configRoom.ID)) {
		conn := sb.getConnection(subscriber)
		expectMessage(sb.t, conn, fmt.Sprintf(`["GameUpdate",{"game":%s}]`, gameJSON))
		expectMessage(sb.t, conn, fmt.Sprintf(`["GameEvent",{"event":%s,"serverTime":42}]`, eventEndGameJSON))
	}
}

func (sb ScenarioBuilder) Resign(userId string) {
	user := sb.getUser(userId)
	gameId := sb.getSubscribedGameId(userId)
	configRoom := sb.getConfigRoom(gameId)
	game := sb.getGame(gameId)

	ExpectSpecificConfigRoomSelection(sb.mock, *configRoom)
	ExpectSpecificGameSelection(sb.mock, *game)
	if game.PlayerZero.ID == userId {
		game.Result = model.ResultResignOfZero
	} else {
		game.Result = model.ResultResignOfOne
	}
	ExpectGameUpdateSetResult(sb.mock, *game)
	eventEndGame := model.GameEvent{
	 	ID: sb.getNextEventId(),
	 	GameID: configRoom.ID,
	 	Timestamp: 42,
	 	User: user,
	 	Data: model.EventDataEndGame,
	}
	ExpectEventInsertion(sb.mock, eventEndGame)
	var opponent model.MinimalUser
	if game.PlayerZero.ID == userId {
		opponent = game.PlayerOne
	} else {
		opponent = game.PlayerZero
	}
	eloUser := sb.getElo(user, configRoom.GameName)
	eloOpponent := sb.getElo(opponent, configRoom.GameName)
	eloUser.GamesPlayed += 1
	eloOpponent.GamesPlayed += 1
	newEloUser, newEloOpponent := everyboard.ComputeNewElos(eloUser, eloOpponent, true)
	eloUser.CurrentElo = newEloUser.CurrentElo
	eloOpponent.CurrentElo = newEloOpponent.CurrentElo
	ExpectEloUpdates(sb.mock, eloUser, eloOpponent)
	configRoom.Status = model.StatusFinished
	ExpectConfigRoomUpdateStatus(sb.mock, *configRoom)
	ExpectCurrentGameDelete(sb.mock, user.ID)
	ExpectCurrentGameDelete(sb.mock, opponent.ID)
	ExpectCurrentGameSelectObservers(sb.mock, configRoom.ID, sb.getObservers(configRoom.ID))
	for _, subscriber := range(sb.getGameSubscribers(configRoom.ID)) {
		if subscriber != user.ID && subscriber != opponent.ID {
			ExpectCurrentGameDelete(sb.mock, sb.getUser(subscriber).ID)
			delete(sb.currentGames, subscriber)
		}
	}

	sendMessage(sb.t, sb.getConnection(userId), `["Resign"]`)

	for _, subscriber := range(sb.getGameSubscribers(configRoom.ID)) {
		expectMessage(sb.t, sb.getConnection(subscriber), `["CurrentGameUpdate",{"currentGame":null}]`)
	}
	gameJSON := toJSON(sb.t, game)
	eventEndGameJSON := toJSON(sb.t, eventEndGame)
	for _, subscriber := range(sb.getGameSubscribers(configRoom.ID)) {
		conn := sb.getConnection(subscriber)
		expectMessage(sb.t, conn, fmt.Sprintf(`["GameUpdate",{"game":%s}]`, gameJSON))
		expectMessage(sb.t, conn, fmt.Sprintf(`["GameEvent",{"event":%s,"serverTime":42}]`, eventEndGameJSON))
	}
}
