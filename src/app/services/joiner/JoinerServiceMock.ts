import { IJoinerId } from "src/app/domain/ijoiner";
import { JoinerDAO } from "src/app/dao/joiner/JoinerDAO";

export class JoinerServiceMock {

    public static VERBOSE: boolean = false;

    public static emittedsJoiner: IJoinerId[];

    public constructor(private joinerDAO: JoinerDAO) {
        if (JoinerServiceMock.VERBOSE) console.log("JoinerServiceMock.constructor");
    }
    public joinGame(): Promise<void> {
        if (JoinerServiceMock.VERBOSE) console.log("JoinerServiceMock.joinGame");
        return new Promise(resolve => { resolve(); });
    }
    public stopObserving() {
        if (JoinerServiceMock.VERBOSE) console.log("JoinerServiceMock.stopObserving");
        // this.emittedsJoiner = [];
        // TODO stop all timeout
        return;
    }
    public startObserving(jId: string, callback: (iJ: IJoinerId) => void) {
        if (JoinerServiceMock.VERBOSE) console.log("JoinerServiceMock.startObserving");
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
    public async cancelJoining(): Promise<void> {
        if (JoinerServiceMock.VERBOSE) console.log("JoinerServiceMock.cancelJoining");
        return new Promise(resolve => { resolve(); }); // DO REAL MOCK
    }
    public readJoinerById(partId: string) {
        if (JoinerServiceMock.VERBOSE) console.log("JoinerServiceMock.readJoinerById");
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
    public async setChosenPlayer(pseudo: string): Promise<void> {
        if (JoinerServiceMock.VERBOSE) console.log("JoinerServiceMock.setChosenPlayer");
        return new Promise(resolve => { resolve(); }); // DO REAL MOCK
    }
    public async deleteJoiner(): Promise<void> {
        if (JoinerServiceMock.VERBOSE) console.log("JoinerServiceMock.deleteJoiner");
        return new Promise(resolve => { resolve(); }); // DO REAL MOCK
    }
    public async proposeConfig(maximalMoveDuration: number, firstPlayer: string, totalPartDuration: number): Promise<void> {
        if (JoinerServiceMock.VERBOSE) console.log("JoinerServiceMock.proposeConfig");
        return new Promise(resolve => { resolve(); }); // DO REAL MOCK
    }
};