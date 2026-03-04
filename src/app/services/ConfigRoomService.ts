import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';

import { ConfigRoom, ConfigProposal } from '../domain/ConfigRoom';
import { MinimalUser } from '../domain/MinimalUser';
import { Debug } from '../utils/Debug';

import { BackendService, BackendMessage } from './BackendService';

export abstract class AbstractConfigRoomService {
    public abstract join(gameId: string,
                         configRoomUpdate: (configRoom: ConfigRoom) => void,
                         configRoomDeleted: () => void,
                         candidateJoined: (candidate: MinimalUser) => void,
                         candidateLeft: (candidate: MinimalUser) => void,
                         error: (reason: string) => void)
    : Promise<Subscription>;

    public abstract proposeConfig(proposal: ConfigProposal): Promise<void>;

    public abstract selectOpponent(opponent: MinimalUser): Promise<void>;

    public abstract reviewConfig(): Promise<void>;

    public abstract acceptConfig(): Promise<void>;
}

@Injectable({
    providedIn: 'root',
})
@Debug.log
export class ConfigRoomService extends AbstractConfigRoomService {

    public constructor(private readonly backendService: BackendService) {
        super();
    }

    public override async join(gameId: string,
                               configRoomUpdate: (configRoom: ConfigRoom) => void,
                               configRoomDeleted: () => void,
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
        const configRoomDeletionSubscription: Subscription =
            this.backendService.setCallback('ConfigRoomDeleted', (_message: BackendMessage): void => {
                configRoomDeleted();
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
            configRoomDeletionSubscription.unsubscribe();
            candidateJoinedSubscription.unsubscribe();
            candidateLeftSubscription.unsubscribe();
            errorSubscription.unsubscribe();
            gameSubscription.unsubscribe();
        });
    }

    /** Propose a config to the opponent */
    public override async proposeConfig(proposal: ConfigProposal): Promise<void> {
        await this.backendService.send(['ProposeConfig', { config: proposal }]);
    }

    /** Select an opponent */
    public override async selectOpponent(opponent: MinimalUser): Promise<void> {
        await this.backendService.send(['SelectOpponent', { opponent }]);
    }

    /** Review a config proposed to the opponent */
    public override async reviewConfig(): Promise<void> {
        await this.backendService.send(['ReviewConfig']);
    }

    /** Accept a game config */
    public override async acceptConfig(): Promise<void> {
        await this.backendService.send(['AcceptConfig']);
    }

}
