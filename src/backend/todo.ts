
// class Game {
//
//     public lastUpdateTimestamp: number;
//
//     public constructor(public readonly players: [UserId, UserId]) {
//         this.lastUpdateTimestamp = Date.now();
//     }
//     public getPlayer(userId: UserId): Player {
//         if (this.players[0] === userId) return Player.ZERO;
//         if (this.players[1] === userId) return Player.ONE;
//         throw new Error('User not in the game');
//     }
//     public update(): void {
//         this.lastUpdateTimestamp = Date.now();
//     }
// }
//
// // Cache for useful information on started games
// const games: MGPMap<GameId, Game> = new MGPMap();

// /**
//  * This deletes an unstarted game, its config room, and its chat
//  * It fails when:
//  *   - the request is not issued by the creator
//  *   - the part is already started
//  * TODO: someone else can remove it if the creator has timed out
//  * Performs 1 reads + 3 write.
//  */
// function deleteUnstartedGame(call: Call<GameId, SuccessOrFailure>, callback: Reply<SuccessOrFailure>): Promise<void> {
//     const reply: SuccessOrFailure = new SuccessOrFailure();
//     return tryOrFail(callback, async() => {
//         const gameId: string = call.request.getGameid();
//         const configRoom: ConfigRoom = configRoomDAO.get(gameId); // 1 read
//         if (configRoom.creator.id !== call.request.getIdtoken()) {
//             if (hasTimedOut(configRoom.creator.id)) {
//                 reply.setSuccess(false);
//                 reply.setReason('Only the creator of a game can delete it');
//                 callback(null, reply);
//                 return;
//             }
//         }
//         if (configRoom.partStatus !== PartStatus.PART_CREATED.value ||
//             configRoom.partStatus !== PartStatus.CONFIG_PROPOSED.value)
//         {
//             reply.setSuccess(false);
//             reply.setReason('Only an unstarted game can be deleted');
//             callback(null, reply);
//             return;
//         }
//
//         await chatService.deleteChat(gameId); // 1 write
//         await gameService.deletePart(gameId); // 1 write
//         await configRoomService.deleteConfigRoom(gameId); // 1 write
//
//         reply.setSuccess(true);
//         callback(null, reply);
//     });
// }
//
// /**
//  * This updates the config room
//  * This fails when:
//  *   - the update is not done by the creator
//  * This performs XX reads/writes
//  */
// function updateConfig(call: Call<GameId, SuccessOrFailure>, callback: Reply<SuccessOrFailure>): Promise<void> {
//     // TODO: take the actual update in parameter (json)
//     // Everything can be changed, creator and partStatus which cannot be changed to STARTED / FINISHED
// }
//
// /**
//  * This adds a user to a config room
//  * This fails when:
//  *   - TODO
//  * This performs XX reads/writes
//  */
// function joinConfigRoom(call: Call<GameId, SuccessOrFailure>, callback: Reply<SuccessOrFailure>): Promise<void> {
// }
//
// /**
//  * This removes a user from a config room
//  * This fails whene
//  *   - TODO
//  * This performs XX reads/writes
//  */
// function leaveConfigRoom(call: Call<GameId, SuccessOrFailure>, callback: Reply<SuccessOrFailure>): Promise<void> {
// }
//
// /**
//  * This starts the game by accepting a config
//  * This fails when:
//  *   - the part was not proposed
//  *   - the requester is not the chosen opponent
//  * Performs 1 read and 3 writes.
//  */
// function startGame(call: Call<GameId, SuccessOrFailure>, callback: Reply<SuccessOrFailure>): Promise<void> {
//     const reply: SuccessOrFailure = new SuccessOrFailure();
//     return tryOrFail(callback, reply, async() => {
//         const gameId: string = call.request.getGameId();
//         const configRoom: ConfigRoom = configRoomDAO.get(gameId); // 1 read
//         if (configRoom.partStatus !== PartStatus.CONFIG_PROPOSED.value) {
//             reply.setSuccess(false);
//             reply.setReason('A game must be proposed before being started');
//             callback(null, reply);
//             return;
//         }
//         if (configRoom.chosenOpponent?.id !== call.request.getTokenId()) {
//             reply.setSuccess(false);
//             reply.setReason('A game can only be accepted by the chosen opponent');
//             callback(null, reply);
//             return;
//         }
//         const config: StartingPartConfig = await gameService.acceptConfig(call.request.getGameId(), configRoom); // 3 writes
//         const players: [UserId, UserId] = [config.playerZero.id, config.playerOne.id];
//         const game: Game = new Game(players);
//         games.put(gameId, game);
//
//         reply.setSuccess(true);
//         callback(null, reply);
//     });
// }
//
// /**
//  * This adds a move to a game and increases the turn
//  * Performs 2 writes.
//  */
// function addMove(call: GameIdAndMoveRequest, callback: Reply): void {
//     return tryOrFail(callback, async() => {
//         const gameId: string = call.request.getGameId();
//         await gameEventService.addMove(gameId, player, move);
//     });
//     // TODO
// }
//
// function addRequest(call: GameIdAndRequestRequest, callback: Reply): void {
//     // TODO
// }
//
// function addReply(call: GameIdAndReplyToRequesRequest, callback: Reply): void {
//     // TODO
// }
//
// function addAction(call: GameIdAndActionRequest, callback: Reply): void {
//     // TODO
// }
