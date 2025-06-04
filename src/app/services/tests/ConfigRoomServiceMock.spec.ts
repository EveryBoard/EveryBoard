import { Subscription } from 'rxjs';

import { ConfigProposal, ConfigRoom } from 'src/app/domain/ConfigRoom';
import { AbstractConfigRoomService } from '../ConfigRoomService';
import { MinimalUser } from 'src/app/domain/MinimalUser';

export class ConfigRoomServiceMock extends AbstractConfigRoomService {

    public override async join(gameId: string,
                               configRoomUpdate: (configRoom: ConfigRoom) => void,
                               candidateJoined: (candidate: MinimalUser) => void,
                               candidateLeft: (candidate: MinimalUser) => void,
                               error: (reason: string) => void)
    : Promise<Subscription> {
        // TODO: store values so that we can send mocked stuff
        return new Subscription();
    }

    public override async proposeConfig(proposal: ConfigProposal): Promise<void> {
    }

    public override async selectOpponent(opponent: MinimalUser): Promise<void> {
    }

    public override async reviewConfig(): Promise<void> {
    }

    public override async acceptConfig(): Promise<void> {
    }
}
