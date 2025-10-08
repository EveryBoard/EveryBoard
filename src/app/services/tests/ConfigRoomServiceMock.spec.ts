import { Subscription } from 'rxjs';

import { MGPOptional, Utils } from '@everyboard/lib';

import { ConfigProposal, ConfigRoom } from 'src/app/domain/ConfigRoom';
import { AbstractConfigRoomService } from '../ConfigRoomService';
import { MinimalUser } from 'src/app/domain/MinimalUser';

export class ConfigRoomServiceMock extends AbstractConfigRoomService {

    private subscribedCallback: MGPOptional<{
        configRoomUpdate: (configRoom: ConfigRoom) => void,
        candidateJoined: (candidate: MinimalUser) => void,
        candidateLeft: (candidate: MinimalUser) => void,
        error: (reason: string) => void,
    }> = MGPOptional.empty();

    public override async join(gameId: string,
                               configRoomUpdate: (configRoom: ConfigRoom) => void,
                               configRoomDeleted: (gameId: string) => void,
                               candidateJoined: (candidate: MinimalUser) => void,
                               candidateLeft: (candidate: MinimalUser) => void,
                               error: (reason: string) => void)
    : Promise<Subscription> {
        this.subscribedCallback = MGPOptional.of({
            configRoomUpdate,
            configRoomDeleted,
            candidateJoined,
            candidateLeft,
            error,
        });
        return new Subscription(() => {
            this.subscribedCallback = MGPOptional.empty();
        });
    }

    public override async proposeConfig(proposal: ConfigProposal): Promise<void> {
    }

    public override async selectOpponent(opponent: MinimalUser): Promise<void> {
    }

    public override async reviewConfig(): Promise<void> {
    }

    public override async acceptConfig(): Promise<void> {
    }

    public mockConfigRoomUpdate(configRoom: ConfigRoom): void {
        Utils.assert(this.subscribedCallback.isPresent(), 'ConfigRoomServiceMock should be subscribed');
        this.subscribedCallback.get().configRoomUpdate(configRoom);
    }

    public mockCandidateJoined(candidate: MinimalUser): void {
        Utils.assert(this.subscribedCallback.isPresent(), 'ConfigRoomServiceMock should be subscribed');
        this.subscribedCallback.get().candidateJoined(candidate);
    }

    public mockCandidateLeft(candidate: MinimalUser): void {
        Utils.assert(this.subscribedCallback.isPresent(), 'ConfigRoomServiceMock should be subscribed');
        this.subscribedCallback.get().candidateLeft(candidate);
    }

    public mockError(reason: string): void {
        Utils.assert(this.subscribedCallback.isPresent(), 'ConfigRoomServiceMock should be subscribed');
        this.subscribedCallback.get().error(reason);
    }
}
