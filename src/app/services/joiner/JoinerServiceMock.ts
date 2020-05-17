import { IJoinerId } from "src/app/domain/ijoiner";

export class JoinerServiceMock {

    public static JOINERS = {
        JOINER_INITIAL: {
            id: 'joinerId',
            joiner: {
                candidatesNames: [],
                creator: 'creator',
                chosenPlayer: '', // TODO: Make optional
                firstPlayer: '0', // TODO: Make optional AND enum
                partStatus: 0
            }
        },
        JOINER_WITH_FIRST_CANDIDATE: {
            id: 'joinerId',
            joiner: {
                candidatesNames: ['firstCandidate'],
                creator: 'creator',
                chosenPlayer: '', // TODO: Make optional
                firstPlayer: '0', // TODO: Make optional AND enum
                partStatus: 0
            }
        },
        JOINER_WITH_SECOND_CANDIDATE: {
            id: 'joinerId',
            joiner: {
                candidatesNames: ['firstCandidate', 'secondCandidate'],
                creator: 'creator',
                chosenPlayer: '', // TODO: Make optional
                firstPlayer: '0', // TODO: Make optional AND enum
                partStatus: 0
            }
        },
        JOINER_WITH_CHOSEN_PLAYER: {
            id: 'joinerId',
            joiner: {
                candidatesNames: ['firstCandidate', 'secondCandidate'],
                creator: 'creator',
                chosenPlayer: 'firstCandidate', // TODO: Make optional
                firstPlayer: '0', // TODO: Make optional AND enum
                partStatus: 1
            }
        }
    };
    public static emittedsJoiner: IJoinerId[];

    public joinGame(): Promise<void> {
        return new Promise(resolve => { resolve(); });
    }
    public stopObserving() {
        return;
    }
    public startObserving(jId: string, callback: (iJ: IJoinerId) => void) {
        let i: number = 0;
        while (i<JoinerServiceMock.emittedsJoiner.length) {
            setTimeout(
                (index: number) => callback(JoinerServiceMock.emittedsJoiner[index]),
                1000*(i+1),
                i
            );
            i++;
        }
    }
    public cancelJoining() {
        return new Promise(resolve => { resolve(); });
    }
    public readJoinerById(partId: string) {
        return new Promise(resolve => {
            resolve({candidatesNames: ["uniqueCandidate"],
                creator: "creator",
                chosenPlayer: "uniqueCandidate",
                firstPlayer: "0",
                partStatus: "3",
                maximalMoveDuration: 60,
                totalPartDuration: 300,
                gameType: 42
            });
        });
    }
};