import { ConfigRoomDAO } from 'src/app/dao/ConfigRoomDAO';
import { MinimalUser } from 'src/app/domain/MinimalUser';
import { MGPOptional, MGPValidation } from '@everyboard/lib';
import { Injectable } from '@angular/core';
import { ConnectedUserService } from '../ConnectedUserService';
import { ConfigRoom, FirstPlayer, PartStatus, PartType } from 'src/app/domain/ConfigRoom';
import { ConfigRoomService, ConfigRoomServiceFailure } from '../ConfigRoomService';
import { RulesConfig } from 'src/app/jscaip/RulesConfigUtil';

@Injectable({ providedIn: 'root' })
export class ConfigRoomServiceMock extends ConfigRoomService {

    public constructor(configRoomDAO: ConfigRoomDAO,
                       connectedUserService: ConnectedUserService) {
        super(configRoomDAO, connectedUserService);
    }

    public override async joinGame(gameId: string): Promise<MGPValidation> {
        const configRoom: MGPOptional<ConfigRoom> = await this.configRoomDAO.read(gameId);
        if (configRoom.isAbsent()) {
            return MGPValidation.failure(ConfigRoomServiceFailure.GAME_DOES_NOT_EXIST());
        } else {
            const candidate: MinimalUser = this.connectedUserService.user.get().toMinimalUser();
            // Creator is not a candidate
            if (configRoom.get().creator.id !== candidate.id) {
                await this.configRoomDAO.subCollectionDAO(gameId, 'candidates').set(candidate.id, candidate);
            }
            return MGPValidation.SUCCESS;
        }
    }

    public override async removeCandidate(gameId: string, candidateId: string): Promise<void> {
        await this.configRoomDAO.subCollectionDAO(gameId, 'candidates').delete(candidateId);
    }

    public override async proposeConfig(gameId: string,
                                        partType: PartType,
                                        maximalMoveDuration: number,
                                        firstPlayer: FirstPlayer,
                                        totalPartDuration: number,
                                        rulesConfig: MGPOptional<RulesConfig>)
    : Promise<void>
    {
        const config: Partial<ConfigRoom> = {
            partStatus: PartStatus.CONFIG_PROPOSED.value,
            partType: partType.value,
            maximalMoveDuration,
            totalPartDuration,
            firstPlayer: firstPlayer.value,
            rulesConfig: rulesConfig.getOrElse({}),
        };
        await this.configRoomDAO.update(gameId, config);
    }

    public override async selectOpponent(gameId: string, opponent: MinimalUser): Promise<void> {
        await this.configRoomDAO.update(gameId, { chosenOpponent: opponent });
    }

    public override async reviewConfig(gameId: string): Promise<void> {
        await this.configRoomDAO.update(gameId, { partStatus: PartStatus.PART_CREATED.value });
    }

    public override async reviewConfigAndRemoveChosenOpponent(gameId: string): Promise<void> {
        await this.configRoomDAO.update(gameId, { chosenOpponent: null, partStatus: PartStatus.PART_CREATED.value });
    }

}
