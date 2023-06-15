/* eslint-disable max-lines-per-function */
import { FirstPlayer, ConfigRoom, ConfigRoomDocument, PartStatus, PartType } from 'src/app/domain/ConfigRoom';
import { display } from 'src/app/utils/utils';

export class ConfigRoomServiceMock {

    public static VERBOSE: boolean = false;

    public static emittedsConfigRoom: ConfigRoomDocument[];

    public constructor() {
        display(ConfigRoomServiceMock.VERBOSE, 'ConfigRoomServiceMock.constructor');
    }
    public joinGame(): Promise<void> {
        display(ConfigRoomServiceMock.VERBOSE, 'ConfigRoomServiceMock.joinGame');
        return new Promise((resolve: () => void) => {
            resolve();
        });
    }
    public async cancelJoining(): Promise<void> {
        display(ConfigRoomServiceMock.VERBOSE, 'ConfigRoomServiceMock.cancelJoining');
        return new Promise((resolve: () => void) => {
            resolve();
        }); // DO REAL MOCK
    }
    public readConfigRoomById(partId: string): Promise<ConfigRoom> {
        display(ConfigRoomServiceMock.VERBOSE, 'ConfigRoomServiceMock.readConfigRoomById');
        return new Promise((resolve: (j: ConfigRoom) => void) => {
            resolve({
                candidates: [{ id: '24854rf', name: 'uniqueCandidate' }],
                creator: { id: 'doc-creator', name: 'creator' },
                chosenOpponent: { id: 'uniqueCandidate-doc-id', name: 'uniqueCandidate' },
                firstPlayer: FirstPlayer.CREATOR.value,
                partType: PartType.STANDARD.value,
                typeGame: 'Quarto',
                partStatus: PartStatus.PART_STARTED.value,
                maximalMoveDuration: 60,
                totalPartDuration: 300,
                gameType: 42,
            });
        });
    }
    public async setChosenOpponent(username: string): Promise<void> {
        display(ConfigRoomServiceMock.VERBOSE, 'ConfigRoomServiceMock.setChosenOpponent');
        return new Promise((resolve: () => void) => {
            resolve();
        }); // DO REAL MOCK
    }
    public async deleteConfigRoom(): Promise<void> {
        display(ConfigRoomServiceMock.VERBOSE, 'ConfigRoomServiceMock.deleteConfigRoom');
        return new Promise((resolve: () => void) => {
            resolve();
        }); // DO REAL MOCK
    }
    public async proposeConfig(maximalMoveDuration: number,
                               firstPlayer: string,
                               totalPartDuration: number)
    : Promise<void>
    {
        display(ConfigRoomServiceMock.VERBOSE, 'ConfigRoomServiceMock.proposeConfig');
        return new Promise((resolve: () => void) => {
            resolve();
        }); // DO REAL MOCK
    }
}
