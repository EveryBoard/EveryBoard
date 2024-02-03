import { MinimalUser } from "src/app/domain/MinimalUser";
import { Part } from "src/app/domain/Part";
import { PlayerOrNone } from "src/app/jscaip/Player";
import { PlayerNumberMap } from "src/app/jscaip/PlayerMap";
import { MGPOptional } from "src/app/utils/MGPOptional";
import { MGPValidation } from "src/app/utils/MGPValidation";
import { JSONValue } from "src/app/utils/utils";

export class BackendServiceMock {


    public async createGame(gameName: string): Promise<string> {
        return 'gameId';
    }

    public async getGameName(gameId: string): Promise<MGPOptional<string>> {
        return MGPOptional.empty();
    }

    public async getGame(gameId: string): Promise<Part> {
        throw new Error('BackendServiceMock.getGame should be mocked');
    }

    public async deleteGame(gameId: string): Promise<void> {
    }

    public async acceptConfig(gameId: string): Promise<void> {
    }

    public async resign(gameId: string): Promise<void> {
    }

    public async notifyTimeout(gameId: string, winner: MinimalUser, loser: MinimalUser): Promise<void> {
    }

    public async proposeDraw(gameId: string): Promise<void> {
    }

    public async acceptDraw(gameId: string): Promise<void> {
    }

    public async refuseDraw(gameId: string): Promise<void> {
    }

    public async proposeRematch(gameId: string): Promise<void> {
    }

    public async acceptRematch(gameId: string): Promise<void> {
    }

    public async rejectRematch(gameId: string): Promise<void> {
    }

    public async askTakeBack(gameId: string): Promise<void> {
    }

    public async acceptTakeBack(gameId: string): Promise<void> {
    }

    public async refuseTakeBack(gameId: string): Promise<void> {
    }

    public async addGlobalTime(gameId: string): Promise<void> {
    }

    public async addTurnTime(gameId: string): Promise<void> {
    }

    public async endTurn(gameId: string, scores: MGPOptional<PlayerNumberMap>): Promise<void> {
    }

    public async draw(gameId: string, scores: MGPOptional<PlayerNumberMap>): Promise<void> {
    }

    public async victory(gameId: string,
                         scores: MGPOptional<PlayerNumberMap>,
                         winner: MinimalUser,
                         loser: MinimalUser)
    : Promise<void>
    {
    }

    public async move(gameId: string,
                      move: JSONValue,
                      scores: MGPOptional<PlayerNumberMap>)
    : Promise<void>
    {
    }

    public async moveAndEnd(gameId: string,
                            move: JSONValue,
                            scores: MGPOptional<PlayerNumberMap>,
                            winner: PlayerOrNone)
    : Promise<void>
    {
    }

    public async getServerTime(): Promise<number> {
        return 0;
    }

    public async joinGame(gameId: string): Promise<MGPValidation> {
        return MGPValidation.failure('not mocked');
    }

    public async removeCandidate(gameId: string, candidateId: string): Promise<void> {
    }

    public async proposeConfig(gameId: string, config: JSONValue): Promise<void> {
    }

    public async selectOpponent(gameId: string, opponent: MinimalUser): Promise<void> {
    }

    public async reviewConfig(gameId: string): Promise<void> {
    }

    public async reviewConfigAndRemoveChosenOpponent(gameId: string): Promise<void> {
    }
}
