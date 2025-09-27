package internal

import (
	"database/sql/driver"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/gorilla/websocket"

	everyboard "github.com/EveryBoard/EveryBoard/internal"
	"github.com/EveryBoard/EveryBoard/internal/model"
	"github.com/EveryBoard/EveryBoard/internal/utils"
)

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
	configRooms map[model.GameID]model.ConfigRoom
	messages map[model.GameID][]model.Message // messages per game id
	elos map[string]map[string]model.Elo // user to game name to elo
	currentGames []model.CurrentGame
	candidates map[model.GameID][]model.Candidate
	subscribers map[model.GameID]utils.Set[string] // map from game id to subscriber ids
	subscriptions map[string]model.GameID // reverse, map from subscriber id to the game subscribed
}

func NewScenarioBuilder(t *testing.T) ScenarioBuilder {
		everyboard.Now = func() int64 {
		return 42
	}
	everyboard.NowFloat = func() float64 {
		return 42.
	}

	stopServer, mock := PrepareServer(t)
	return ScenarioBuilder{
		t: t,
		mock: mock,
		cleanupFunctions: []func (){ stopServer },
		connections: make(map[string]*websocket.Conn),
		users: make(map[string]model.MinimalUser),
		configRooms: make(map[model.GameID]model.ConfigRoom),
		messages: make(map[model.GameID][]model.Message),
		elos: make(map[string]map[string]model.Elo),
		currentGames: []model.CurrentGame{},
		candidates: make(map[model.GameID][]model.Candidate),
		subscribers: make(map[model.GameID]utils.Set[string]),
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

func (sb ScenarioBuilder) SubscribeLobby(userId string) {
	conn := sb.getConnection(userId)
	ExpectMessageSelection(sb.mock, model.GameIDLobby, sb.messages[model.GameIDLobby])
	configRooms := []model.ConfigRoom{}
	for _, c := range(sb.configRooms) {
		if c.Status != model.StatusFinished {
			configRooms = append(configRooms, c)
		}
	}
	ExpectInGameConfigRoomSelection(sb.mock, configRooms)
	sendMessage(sb.t, conn, `["SubscribeLobby"]`)
	sb.subscribe(userId, model.GameIDLobby)
}

func (sb ScenarioBuilder) getElo(user model.MinimalUser, gameName string) model.Elo {
	emptyElo := model.Elo{ID: 1, User: user, GameName: gameName, CurrentElo: 0, GamesPlayed: 0}
	elo := emptyElo
	newElo := true

	userElos, ok := sb.elos[user.ID]
	if ok {
		gameElo, ok := userElos[gameName]
		if ok {
			elo = gameElo
			newElo = false
		}
	}

	if newElo {
		ExpectEloSelection(sb.mock, user.ID, gameName, nil)
		ExpectEloInsertion(sb.mock, elo)
	} else {
		ExpectEloSelection(sb.mock, user.ID, gameName, &elo)
	}
	return elo
}

func (sb ScenarioBuilder) getSubscribers(gameId model.GameID) *utils.Set[string] {
	subscribers, ok := sb.subscribers[gameId]
	if !ok {
		emptySet := utils.NewSet[string]()
		return &emptySet
	} else {
		return &subscribers
	}
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
	sb.configRooms[configRoom.ID] = configRoom
	currentGamePlayer := model.CurrentGame{
		ID: uint(len(sb.elos)),
		User: user,
		GameID: configRoom.ID,
		GameName: gameName,
		Creator: user,
		Opponent: nil,
		Role: model.UserRoleCreator,
	}
	ExpectCurrentGameInsertion(sb.mock, currentGamePlayer)
	sendMessage(sb.t, conn, fmt.Sprintf(`["Create",{"gameName":"%s"}]`, gameName))
	gameId := readMessage[string](sb.t, conn, "GameCreated", "gameId")
	currentGamePlayerJSON, err := json.Marshal(currentGamePlayer)
	if err != nil {
		sb.t.Fatalf("cannot marshal: %v", err)
	}
	expectMessage(sb.t, conn, fmt.Sprintf(`["CurrentGameUpdate",{"currentGame":%s}]`, string(currentGamePlayerJSON)))

	configRoomJSON, err := json.Marshal(configRoom)
	if err != nil {
		sb.t.Fatalf("cannot marshal: %v", err)
	}
	for subscriberId, _ := range(*sb.getSubscribers(configRoom.ID)) {
		conn, ok := sb.connections[subscriberId]
		if !ok {
			sb.t.Fatalf("unexpected missing connection for %s", subscriberId)
		}
		expectMessage(sb.t, conn, fmt.Sprintf(`["ConfigRoomUpdate",{"gameId":"%s","configRoom":%s}]`, gameId, string(configRoomJSON)))
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

func (sb ScenarioBuilder) subscribe(userId string, gameId model.GameID) {
	sb.subscriptions[userId] = gameId
	sb.getSubscribers(gameId).Add(userId)
}

func (sb ScenarioBuilder) SubscribeConfigRoom(userId string, gameId model.GameID) {
	configRoom, ok := sb.configRooms[gameId]
	if !ok {
		sb.t.Fatalf("config room does not exist: %d", gameId)
	}
	conn, ok := sb.connections[userId]
	if !ok {
		sb.t.Fatalf("no connection for user: %s", userId)
	}
	user, ok := sb.users[userId]
	if !ok {
		sb.t.Fatalf("no user: %s", userId)
	}

	ExpectSpecificConfigRoomSelection(sb.mock, configRoom)
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
	}
	candidates := sb.getCandidates(gameId)
	ExpectCandidateSelection(sb.mock, gameId, candidates)


	encodedGameId, err := model.EncodeID(gameId)
	if err != nil {
		sb.t.Fatalf("cannot encode id: %v", err)
	}
	sendMessage(sb.t, conn, fmt.Sprintf(`["SubscribeConfigRoom", {"gameId":"%s"}]`, encodedGameId))
	configRoomJSON, err := json.Marshal(configRoom)
	if err != nil {
		sb.t.Fatalf("cannot marshal: %v", err)
	}
	expectMessage(sb.t, conn, fmt.Sprintf(`["ConfigRoomUpdate",{"gameId":"%s","configRoom":%s}]`, encodedGameId, string(configRoomJSON)))

	sb.subscribe(userId, configRoom.ID)
}

func (sb ScenarioBuilder) Unsubscribe(userId string) {
	conn := sb.getConnection(userId)
	sendMessage(sb.t, conn, `["Unsubscribe"]`)
	subscription, ok := sb.subscriptions[userId]
	if !ok {
		sb.t.Fatalf("TODO: handle unsubscribed case: error?")
	}

	delete(sb.subscriptions, userId)
	sb.subscribers[model.GameIDLobby].Remove(userId)
	if subscription != model.GameIDLobby {
		sb.t.Fatalf("TODO: remove from candidate and notify other subscribers")
	}
}
