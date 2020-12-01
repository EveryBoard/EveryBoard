import { IJoinerId } from "src/app/domain/ijoiner";
import { JoinerDAO } from "src/app/dao/joiner/JoinerDAO";
import { display } from "src/app/collectionlib/utils";

export class JoinerServiceMock {

    public static VERBOSE: boolean = false;

    public static emittedsJoiner: IJoinerId[];

    public constructor(private joinerDAO: JoinerDAO) {
        display(JoinerServiceMock.VERBOSE, "JoinerServiceMock.constructor");
    }
    public joinGame(): Promise<void> {
        display(JoinerServiceMock.VERBOSE, "JoinerServiceMock.joinGame");
        return new Promise(resolve => { resolve(); });
    }
    public stopObserving() {
        display(JoinerServiceMock.VERBOSE, "JoinerServiceMock.stopObserving");
        // this.emittedsJoiner = [];
        // TODO stop all timeout
        return;
    }
    public startObserving(jId: string, callback: (iJ: IJoinerId) => void) {
        display(JoinerServiceMock.VERBOSE, "JoinerServiceMock.startObserving");
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
        display(JoinerServiceMock.VERBOSE, "JoinerServiceMock.cancelJoining");
        return new Promise(resolve => { resolve(); }); // DO REAL MOCK
    }
    public readJoinerById(partId: string) {
        display(JoinerServiceMock.VERBOSE, "JoinerServiceMock.readJoinerById");
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
        display(JoinerServiceMock.VERBOSE, "JoinerServiceMock.setChosenPlayer");
        return new Promise(resolve => { resolve(); }); // DO REAL MOCK
    }
    public async deleteJoiner(): Promise<void> {
        display(JoinerServiceMock.VERBOSE, "JoinerServiceMock.deleteJoiner");
        return new Promise(resolve => { resolve(); }); // DO REAL MOCK
    }
    public async proposeConfig(maximalMoveDuration: number, firstPlayer: string, totalPartDuration: number): Promise<void> {
        display(JoinerServiceMock.VERBOSE, "JoinerServiceMock.proposeConfig");
        return new Promise(resolve => { resolve(); }); // DO REAL MOCK
    }
};