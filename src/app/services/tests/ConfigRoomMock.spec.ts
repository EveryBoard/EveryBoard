/* eslint-disable max-lines-per-function */
import { FirstPlayer, ConfigRoom, ConfigRoomDocument, PartStatus, PartType } from 'src/app/domain/ConfigRoom';
import { Debug } from 'src/app/utils/utils';

@Debug.log
export class ConfigRoomServiceMock {

    public static emittedsConfigRoom: ConfigRoomDocument[];

    public joinGame(): Promise<void> {
        return new Promise((resolve: () => void) => {
            resolve();
        });
    }
    public async cancelJoining(): Promise<void> {
        return new Promise((resolve: () => void) => {
            resolve();
        }); // DO REAL MOCK
    }
    public readConfigRoomById(partId: string): Promise<ConfigRoom> {
        return new Promise((resolve: (j: ConfigRoom) => void) => {
            resolve({
                creator: { id: 'doc-creator', name: 'creator' },
                chosenOpponent: { id: 'uniqueCandidate-doc-id', name: 'uniqueCandidate' },
                firstPlayer: FirstPlayer.CREATOR.value,
                partType: PartType.STANDARD.value,
                partStatus: PartStatus.PART_STARTED.value,
                maximalMoveDuration: 60,
                totalPartDuration: 300,
                rulesConfig: {},
            });
        });
    }
    public async setChosenOpponent(username: string): Promise<void> {
        return new Promise((resolve: () => void) => {
            resolve();
        }); // DO REAL MOCK
    }
    public async deleteConfigRoom(): Promise<void> {
        return new Promise((resolve: () => void) => {
            resolve();
        }); // DO REAL MOCK
    }
    public async proposeConfig(maximalMoveDuration: number,
                               firstPlayer: string,
                               totalPartDuration: number)
    : Promise<void>
    {
        return new Promise((resolve: () => void) => {
            resolve();
        }); // DO REAL MOCK
    }
}
