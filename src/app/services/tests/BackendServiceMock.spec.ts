import { ConfigRoomDAO } from 'src/app/dao/ConfigRoomDAO';
import { MinimalUser } from 'src/app/domain/MinimalUser';
import { Action, GameEvent, MGPResult, Part, RequestType } from 'src/app/domain/Part';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';
import { JSONValue, MGPOptional, MGPValidation, Utils } from '@everyboard/lib';
import { Injectable } from '@angular/core';
import { ConnectedUserService } from '../ConnectedUserService';
import { ConfigRoom, FirstPlayer, PartStatus, PartType } from 'src/app/domain/ConfigRoom';
import { PartDAO } from 'src/app/dao/PartDAO';
import { ChatDAO } from 'src/app/dao/ChatDAO';

@Injectable({ providedIn: 'root' })
export class BackendServiceMock {

    public constructor(public readonly configRoomDAO: ConfigRoomDAO,
                       public readonly partDAO: PartDAO,
                       public readonly chatDAO: ChatDAO,
                       public readonly connectedUserService: ConnectedUserService) {}

    public async createGame(gameName: string): Promise<string> {
        const creator: MinimalUser = this.connectedUserService.user.get().toMinimalUser();
        const game: Part = {
            typeGame: gameName,
            playerZero: creator,
            turn: -1,
            result: MGPResult.UNACHIEVED.value,
            beginning: null,
        };
        // Write 1: create the game
        const gameId: string = await this.partDAO.create(game);
        // Write 2: create the config room
        const configRoom: ConfigRoom = {
            creator,
            firstPlayer: FirstPlayer.RANDOM.value,
            chosenOpponent: null,
            partStatus: PartStatus.PART_CREATED.value,
            partType: PartType.STANDARD.value,
            maximalMoveDuration: 2*60,
            totalPartDuration: 30*60,
            rulesConfig: {},
        };
        await this.configRoomDAO.set(gameId, configRoom);
        // Write 3: create the chat
        await this.chatDAO.set(gameId, {});
        return gameId;
    }

    public async getGameName(gameId: string): Promise<MGPOptional<string>> {
        // Read 1: get only the game name
        const game: MGPOptional<Part> = await this.partDAO.read(gameId);
        return game.map((g: Part) => g.typeGame);
    }

    public async getGame(gameId: string): Promise<Part> {
        // Read 1: get the game
        return (await this.partDAO.read(gameId)).get();
    }

    public async deleteGame(gameId: string): Promise<void> {
        // Write 1: delete the game
        await this.partDAO.delete(gameId);
        // Write 2: delete the chat
        await this.chatDAO.delete(gameId);
        // Write 3: delete the configRoom
        await this.configRoomDAO.delete(gameId);
    }

    public async acceptConfig(gameId: string): Promise<void> {
        // Read 1: retrieve the config room
        const configRoom: ConfigRoom = (await this.configRoomDAO.read(gameId)).get();
        // Write 1: accept the config room
        await this.configRoomDAO.update(gameId, { partStatus: PartStatus.PART_STARTED.value });
        // Write 2: start the game
        await this.partDAO.update(gameId, {
            playerZero: configRoom.creator,
            playerOne: Utils.getNonNullable(configRoom.chosenOpponent),
            turn: 0,
            beginning: Date.now(),
        });
        const user: MinimalUser = this.connectedUserService.user.get().toMinimalUser();
        const start: GameEvent = {
            eventType: 'Action',
            action: 'StartGame',
            user,
            time: Date.now(),
        };
        // Write 3: add a start action
        await this.partDAO.subCollectionDAO(gameId, 'events').create(start);
    }

    public async resign(gameId: string): Promise<void> {
        const user: MinimalUser = this.connectedUserService.user.get().toMinimalUser();
        // Read 1: retrieve the game
        const game: Part = (await this.partDAO.read(gameId)).get();
        const playerZero: MinimalUser = game.playerZero;
        const playerOne: MinimalUser = Utils.getNonNullable(game.playerOne);
        const winner: MinimalUser = user.id === playerZero.id ? playerOne : playerZero;
        // Write 1: end the game
        const update: Partial<Part> = {
            result: MGPResult.RESIGN.value,
            winner,
            loser: user,
        };
        await this.partDAO.update(gameId, update);
        // Write 2: add the end action
        await this.action(gameId, 'EndGame');
    }

    public async notifyTimeout(gameId: string, winner: MinimalUser, loser: MinimalUser): Promise<void> {
        // Read 1: retrieve the game
        // Not needed here
        // Write 1: end the game
        await this.partDAO.update(gameId, {
            winner,
            loser,
            result: MGPResult.TIMEOUT.value,
        });
        // Write 2: add the end action
        await this.action(gameId, 'EndGame');
    }

    private async request(gameId: string, requestType: RequestType): Promise<void> {
        const user: MinimalUser = this.connectedUserService.user.get().toMinimalUser();
        const event: GameEvent = {
            eventType: 'Request',
            requestType,
            user,
            time: Date.now(),
        };
        await this.partDAO.subCollectionDAO(gameId, 'events').create(event);
    }

    private async accept(gameId: string, requestType: RequestType): Promise<void> {
        const user: MinimalUser = this.connectedUserService.user.get().toMinimalUser();
        const event: GameEvent = {
            eventType: 'Reply',
            requestType,
            reply: 'Accept',
            user,
            time: Date.now(),
        };
        await this.partDAO.subCollectionDAO(gameId, 'events').create(event);
    }

    private async reject(gameId: string, requestType: RequestType): Promise<void> {
        const user: MinimalUser = this.connectedUserService.user.get().toMinimalUser();
        const event: GameEvent = {
            eventType: 'Reply',
            requestType,
            reply: 'Reject',
            user,
            time: Date.now(),
        };
        await this.partDAO.subCollectionDAO(gameId, 'events').create(event);
    }

    private async action(gameId: string, action: Action): Promise<void> {
        const user: MinimalUser = this.connectedUserService.user.get().toMinimalUser();
        const event: GameEvent = {
            eventType: 'Action',
            action,
            user,
            time: Date.now(),
        };
        await this.partDAO.subCollectionDAO(gameId, 'events').create(event);
    }

    public async proposeDraw(gameId: string): Promise<void> {
        return this.request(gameId, 'Draw');
    }

    public async acceptDraw(gameId: string): Promise<void> {
        const user: MinimalUser = this.connectedUserService.user.get().toMinimalUser();
        const game: Part = (await this.partDAO.read(gameId)).get();
        // Write 1: add response
        await this.accept(gameId, 'Draw');
        let result: MGPResult;
        if (game.playerZero.id === user.id) {
            result = MGPResult.AGREED_DRAW_BY_ZERO;
        } else {
            result = MGPResult.AGREED_DRAW_BY_ONE;
        }
        const update: Partial<Part> = { result: result.value };
        // Write 2: end the game
        await this.partDAO.update(gameId, update);
        // Write 3: add the end event
        await this.action(gameId, 'EndGame');
    }

    public async refuseDraw(gameId: string): Promise<void> {
        return this.reject(gameId, 'Draw');
    }

    public async proposeRematch(gameId: string): Promise<void> {
        return this.request(gameId, 'Rematch');
    }

    public async acceptRematch(gameId: string): Promise<void> {
        return this.accept(gameId, 'Rematch');
    }

    public async rejectRematch(gameId: string): Promise<void> {
        return this.reject(gameId, 'Rematch');
    }

    public async askTakeBack(gameId: string): Promise<void> {
        return this.request(gameId, 'TakeBack');
    }

    public async acceptTakeBack(gameId: string): Promise<void> {
        return this.accept(gameId, 'TakeBack');
    }

    public async refuseTakeBack(gameId: string): Promise<void> {
        return this.reject(gameId, 'TakeBack');
    }

    public async addGlobalTime(gameId: string): Promise<void> {
        return this.action(gameId, 'AddGlobalTime');
    }

    public async addTurnTime(gameId: string): Promise<void> {
        return this.action(gameId, 'AddTurnTime');
    }

    private addWinnerIfNeeded(update: Partial<Part>, game: Part, winnerIfEnd: MGPOptional<PlayerOrNone>)
    : Partial<Part>
    {
        if (winnerIfEnd.isPresent()) {
            const winnerPlayer: PlayerOrNone = winnerIfEnd.get();
            if (winnerPlayer.isPlayer()) {
                let winner: MinimalUser;
                let loser: MinimalUser;
                if (winnerPlayer === Player.ZERO) {
                    winner = game.playerZero;
                    loser = Utils.getNonNullable(game.playerOne);
                } else {
                    winner = Utils.getNonNullable(game.playerOne);
                    loser = game.playerZero;
                }
                return {
                    ...update,
                    result: MGPResult.VICTORY.value,
                    winner,
                    loser,
                };
            } else {
                return {
                    ...update,
                    result: MGPResult.HARD_DRAW.value,
                };
            }
        } else {
            return update;
        }
    }
    private async moveAndMaybeEnd(gameId: string,
                                  move: JSONValue,
                                  scores: MGPOptional<PlayerNumberMap>,
                                  winnerIfEnd: MGPOptional<PlayerOrNone>)
    : Promise<void> {
        const user: MinimalUser = this.connectedUserService.user.get().toMinimalUser();
        const event: GameEvent = {
            eventType: 'Move',
            user,
            time: Date.now(),
            move,
        };
        await this.partDAO.subCollectionDAO(gameId, 'events').create(event);
        const game: Part = (await this.partDAO.read(gameId)).get();
        let update: Partial<Part> = {
            turn: game.turn + 1,
        };
        if (scores.isPresent()) {
            update = {
                ...update,
                scorePlayerZero: scores.get().get(Player.ZERO),
                scorePlayerOne: scores.get().get(Player.ONE),
            };
        }
        update = this.addWinnerIfNeeded(update, game, winnerIfEnd);
        await this.partDAO.update(gameId, update);
        if (winnerIfEnd.isPresent()) {
            await this.action(gameId, 'EndGame');
        }
    }

    public async move(gameId: string,
                      move: JSONValue,
                      scores: MGPOptional<PlayerNumberMap>)
    : Promise<void>
    {
        return this.moveAndMaybeEnd(gameId, move, scores, MGPOptional.empty());
    }

    public async moveAndEnd(gameId: string,
                            move: JSONValue,
                            scores: MGPOptional<PlayerNumberMap>,
                            winner: PlayerOrNone)
    : Promise<void>
    {
        return this.moveAndMaybeEnd(gameId, move, scores, MGPOptional.of(winner));
    }

    public async getServerTime(): Promise<number> {
        return Date.now();
    }

    public async joinGame(gameId: string): Promise<MGPValidation> {
        const configRoom: MGPOptional<ConfigRoom> = await this.configRoomDAO.read(gameId);
        if (configRoom.isAbsent()) {
            // TODO: here
            return MGPValidation.failure('Game does not exist');
        } else {
            const candidate: MinimalUser = this.connectedUserService.user.get().toMinimalUser();
            // Creator is not a candidate
            if (configRoom.get().creator.id !== candidate.id) {
                await this.configRoomDAO.subCollectionDAO(gameId, 'candidates').set(candidate.id, candidate);
            }
            return MGPValidation.SUCCESS;
        }
    }

    public async removeCandidate(gameId: string, candidateId: string): Promise<void> {
        await this.configRoomDAO.subCollectionDAO(gameId, 'candidates').delete(candidateId);
    }

    public async proposeConfig(gameId: string, config: Partial<ConfigRoom>): Promise<void> {
        await this.configRoomDAO.update(gameId, config);
    }

    public async selectOpponent(gameId: string, opponent: MinimalUser): Promise<void> {
        await this.configRoomDAO.update(gameId, { chosenOpponent: opponent });
    }

    public async reviewConfig(gameId: string): Promise<void> {
        await this.configRoomDAO.update(gameId, { partStatus: PartStatus.PART_CREATED.value });
    }

    public async reviewConfigAndRemoveChosenOpponent(gameId: string): Promise<void> {
        await this.configRoomDAO.update(gameId, { chosenOpponent: null, partStatus: PartStatus.PART_CREATED.value });
    }
}
