/* eslint-disable max-lines-per-function */
import { FirstPlayer, Joiner, JoinerDocument, PartStatus, PartType } from 'src/app/domain/Joiner';
import { JoinerDAO } from 'src/app/dao/JoinerDAO';
import { display } from 'src/app/utils/utils';

export class JoinerServiceMock {
    public static VERBOSE: boolean = false;

    public static emittedsJoiner: JoinerDocument[];

    public constructor(private readonly joinerDAO: JoinerDAO) {
        display(JoinerServiceMock.VERBOSE, 'JoinerServiceMock.constructor');
    }
    public joinGame(): Promise<void> {
        display(JoinerServiceMock.VERBOSE, 'JoinerServiceMock.joinGame');
        return new Promise((resolve: () => void) => {
            resolve();
        });
    }
    public async cancelJoining(): Promise<void> {
        display(JoinerServiceMock.VERBOSE, 'JoinerServiceMock.cancelJoining');
        return new Promise((resolve: () => void) => {
            resolve();
        }); // DO REAL MOCK
    }
    public readJoinerById(partId: string): Promise<Joiner> {
        display(JoinerServiceMock.VERBOSE, 'JoinerServiceMock.readJoinerById');
        return new Promise((resolve: (j: Joiner) => void) => {
            resolve({
                candidates: ['uniqueCandidate'],
                creator: 'creator',
                chosenPlayer: 'uniqueCandidate',
                firstPlayer: FirstPlayer.CREATOR.value,
                partType: PartType.STANDARD.value,
                partStatus: PartStatus.PART_STARTED.value,
                maximalMoveDuration: 60,
                totalPartDuration: 300,
                gameType: 42,
            });
        });
    }
    public async setChosenPlayer(username: string): Promise<void> {
        display(JoinerServiceMock.VERBOSE, 'JoinerServiceMock.setChosenPlayer');
        return new Promise((resolve: () => void) => {
            resolve();
        }); // DO REAL MOCK
    }
    public async deleteJoiner(): Promise<void> {
        display(JoinerServiceMock.VERBOSE, 'JoinerServiceMock.deleteJoiner');
        return new Promise((resolve: () => void) => {
            resolve();
        }); // DO REAL MOCK
    }
    public async proposeConfig(maximalMoveDuration: number,
                               firstPlayer: string,
                               totalPartDuration: number)
    : Promise<void>
    {
        display(JoinerServiceMock.VERBOSE, 'JoinerServiceMock.proposeConfig');
        return new Promise((resolve: () => void) => {
            resolve();
        }); // DO REAL MOCK
    }
}
