import { ConfigRoomDAO } from 'src/app/dao/ConfigRoomDAO';
import { MinimalUser } from 'src/app/domain/MinimalUser';
import { Part } from 'src/app/domain/Part';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { JSONValue } from 'src/app/utils/utils';
import { Injectable } from '@angular/core';
import { ConnectedUserService } from '../ConnectedUserService';
import { ConfigRoom, PartStatus } from 'src/app/domain/ConfigRoom';

@Injectable({ providedIn: 'root' })
export class BackendServiceMock {

    public constructor(public readonly configRoomDAO: ConfigRoomDAO,
                       public readonly connectedUserService: ConnectedUserService) {}

    public async createGame(gameName: string): Promise<string> {
        throw new Error('createGame not mocked')
    }

    public async getGameName(gameId: string): Promise<MGPOptional<string>> {
        throw new Error('getGameName not mocked')
    }

    public async getGame(gameId: string): Promise<Part> {
        throw new Error('BackendServiceMock.getGame should be mocked');
    }

    public async deleteGame(gameId: string): Promise<void> {
        return this.configRoomDAO.delete(gameId);
    }

    public async acceptConfig(gameId: string): Promise<void> {
        throw new Error('acceptConfig not mocked')
    }

    public async resign(gameId: string): Promise<void> {
        throw new Error('resign not mocked')
    }

    public async notifyTimeout(gameId: string, winner: MinimalUser, loser: MinimalUser): Promise<void> {
        throw new Error('notifyTimeout not mocked')
    }

    public async proposeDraw(gameId: string): Promise<void> {
        throw new Error('proposeDraw not mocked')
    }

    public async acceptDraw(gameId: string): Promise<void> {
        throw new Error('acceptDraw not mocked')
    }

    public async refuseDraw(gameId: string): Promise<void> {
        throw new Error('refuseDraw not mocked')
    }

    public async proposeRematch(gameId: string): Promise<void> {
        throw new Error('proposeRematch not mocked')
    }

    public async acceptRematch(gameId: string): Promise<void> {
        throw new Error('acceptRematch not mocked')
    }

    public async rejectRematch(gameId: string): Promise<void> {
        throw new Error('rejectRematch not mocked')
    }

    public async askTakeBack(gameId: string): Promise<void> {
        throw new Error('askTakeBack not mocked')
    }

    public async acceptTakeBack(gameId: string): Promise<void> {
        throw new Error('acceptTakeBack not mocked')
    }

    public async refuseTakeBack(gameId: string): Promise<void> {
        throw new Error('refuseTakeBack not mocked')
    }

    public async addGlobalTime(gameId: string): Promise<void> {
        throw new Error('addGlobalTime not mocked')
    }

    public async addTurnTime(gameId: string): Promise<void> {
        throw new Error('addTurnTime not mocked')
    }

    public async endTurn(gameId: string, scores: MGPOptional<PlayerNumberMap>): Promise<void> {
        throw new Error('endTurn not mocked')
    }

    public async draw(gameId: string, scores: MGPOptional<PlayerNumberMap>): Promise<void> {
        throw new Error('draw not mocked')
    }

    public async victory(gameId: string,
                         scores: MGPOptional<PlayerNumberMap>,
                         winner: MinimalUser,
                         loser: MinimalUser)
    : Promise<void>
    {
        throw new Error('victory not mocked')
    }

    public async move(gameId: string,
                      move: JSONValue,
                      scores: MGPOptional<PlayerNumberMap>)
    : Promise<void>
    {
        throw new Error('move not mocked')
    }

    public async moveAndEnd(gameId: string,
                            move: JSONValue,
                            scores: MGPOptional<PlayerNumberMap>,
                            winner: PlayerOrNone)
    : Promise<void>
    {
        throw new Error('moveAndEnd not mocked')
    }

    public async getServerTime(): Promise<number> {
        return 0;
    }

    public async joinGame(gameId: string): Promise<MGPValidation> {
        const configRoom: MGPOptional<ConfigRoom> = await this.configRoomDAO.read(gameId);
        if (configRoom.isAbsent()) {
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
