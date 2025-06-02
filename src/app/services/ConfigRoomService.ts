import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';

import { MGPOptional } from '@everyboard/lib';

import { FirstPlayer, ConfigRoom, PartType } from '../domain/ConfigRoom';
import { MinimalUser } from '../domain/MinimalUser';
import { RulesConfig } from '../jscaip/RulesConfigUtil';
import { BackendService, BackendMessage } from './BackendService';
import { Debug } from '../utils/Debug';
import { Localized } from '../utils/LocaleUtils';

export class ConfigRoomServiceFailure {
    public static readonly GAME_DOES_NOT_EXIST: Localized = () => $localize`This game does not exist!`;
}

@Injectable({
    providedIn: 'root',
})
@Debug.log
export class ConfigRoomService {

    public constructor(private readonly backendService: BackendService)
    {
    }

    public async join(gameId: string,
                      configRoomUpdate: (configRoom: ConfigRoom) => void,
                      candidateJoined: (candidate: MinimalUser) => void,
                      candidateLeft: (candidate: MinimalUser) => void,
                      error: (reason: string) => void)
    : Promise<Subscription>
    {
        const gameSubscription: Subscription = await this.backendService.subscribeToConfigRoom(gameId);
        const configRoomSubscription: Subscription =
            this.backendService.setCallback('ConfigRoomUpdate', (message: BackendMessage): void => {
                configRoomUpdate(message.getArgument('configRoom'));
            });
        const candidateJoinedSubscription: Subscription =
            this.backendService.setCallback('CandidateJoined', (message: BackendMessage): void => {
                candidateJoined(message.getArgument('candidate'));
            });
        const candidateLeftSubscription: Subscription =
            this.backendService.setCallback('CandidateLeft', (message: BackendMessage): void => {
                candidateLeft(message.getArgument('candidate'));
            });
        const errorSubscription: Subscription =
            this.backendService.setCallback('Error', (message: BackendMessage): void => {
                error(message.getArgument('reason'));
            });
        return new Subscription(() => {
            configRoomSubscription.unsubscribe();
            candidateJoinedSubscription.unsubscribe();
            candidateLeftSubscription.unsubscribe();
            errorSubscription.unsubscribe();
            gameSubscription.unsubscribe();
        });
    }

    /** Propose a config to the opponent */
    public async proposeConfig(partType: PartType,
                               maximalMoveDuration: number,
                               firstPlayer: FirstPlayer,
                               totalPartDuration: number,
                               rulesConfig: MGPOptional<RulesConfig>)
    : Promise<void>
    {
        const config: Partial<ConfigRoom> = {
            partType: partType.value,
            maximalMoveDuration,
            totalPartDuration,
            firstPlayer: firstPlayer.value,
            rulesConfig: rulesConfig.getOrElse({}),
        };
        await this.backendService.send(['ProposeConfig', { config }]);
    }

    /** Select an opponent */
    public async selectOpponent(opponent: MinimalUser): Promise<void> {
        await this.backendService.send(['SelectOpponent', { opponent }]);
    }

    /** Review a config proposed to the opponent */
    public async reviewConfig(): Promise<void> {
        await this.backendService.send(['ReviewConfig']);
    }

    /** Accept a game config */
    public async acceptConfig(): Promise<void> {
        await this.backendService.send(['AcceptConfig']);
    }

}
