import {Injectable} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {IJoiner, IJoinerId, PIJoiner} from '../../domain/ijoiner';
import {JoinerDAO} from '../../dao/joiner/JoinerDAO';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class JoinerService {

    public static VERBOSE: boolean = false;
    public static IN_TESTING: boolean = false;

    private observedJoinerId: string;
    private observedJoinerObs: Observable<IJoinerId>;
    private observedJoinerSub: Subscription;

    constructor(private joinerDao: JoinerDAO) {
        if (environment.test && !JoinerService.IN_TESTING) throw new Error("NO JOINER SERVICE IN TEST");
    }
    public startObserving(joinerId: string, callback: (iJoiner: IJoinerId) => void) {
        if (this.observedJoinerId == null) {
            if (JoinerService.VERBOSE) {
                console.log('[start observing joiner ' + joinerId);
            }
            this.observedJoinerId = joinerId;
            this.observedJoinerObs = this.joinerDao.getObservable(joinerId);
            this.observedJoinerSub = this.observedJoinerObs
                .subscribe(onFullFilled => callback(onFullFilled));
        } else {
            throw new Error("JoinerService.startObserving should not be called while already observing a joiner");
        }
    }
    public async joinGame(partId: string, userName: string): Promise<void> {
        if (JoinerService.VERBOSE) {
            console.log('JoinerService.joinGame(' + partId + ', ' + userName + ')');
        }
        const joiner: IJoiner = await this.joinerDao.read(partId);
        if (!joiner) {
            throw new Error("No Joiner Received from DAO");
        }
        const joinerList: string[] = joiner.candidatesNames;
        if (userName === joiner.creator || joinerList.includes(userName)) {
            throw new Error("JoinerService.joinGame was called by a user already in the game");
        } else {
            joinerList[joinerList.length] = userName;
            return this.joinerDao.update(partId, {candidatesNames: joinerList});
        }
    }
    public async cancelJoining(userName: string): Promise<void> {
        if (JoinerService.VERBOSE) {
            console.log('JoinerService.cancelJoining(' + userName + '); this.observedJoinerId =' + this.observedJoinerId);
        }
        if (this.observedJoinerId == null) {
            throw new Error('cannot cancel joining when not observing a joiner');
        }
        const joiner: IJoiner = await this.joinerDao.read(this.observedJoinerId);
        if (joiner == null) {
            throw new Error('DAO Did not found a joiner with id ' + this.observedJoinerId);
        } else {
            const joinersList: string[] = joiner.candidatesNames;
            const indexLeaver: number = joinersList.indexOf(userName);
            let chosenPlayer: string = joiner.chosenPlayer;
            let partStatus: number = joiner.partStatus;
            if (indexLeaver >= 0) { // candidate including chosenPlayer
                joinersList.splice(indexLeaver, 1);
            } else {
                throw new Error("someone that was not candidate just left the chat");
            }
            if (joiner.chosenPlayer === userName) {
                // if the chosenPlayer leave, we're back to partStatus 0 (waiting for a chosenPlayer)
                chosenPlayer = '';
                partStatus = 0;
            }
            const modification: PIJoiner = {
                chosenPlayer: chosenPlayer,
                partStatus: partStatus,
                candidatesNames: joinersList
            };
            await this.joinerDao.update(this.observedJoinerId, modification);
        }
    }
    public async deleteJoiner(): Promise<void> {
        if (JoinerService.VERBOSE) {
            console.log('JoinerService.deleteJoiner(); this.observedJoinerId = ' + this.observedJoinerId);
        }
        if (this.observedJoinerId == null) {
            throw new Error('observed joiner id is null');
        }
        return this.joinerDao.delete(this.observedJoinerId);
    }
    public async setChosenPlayer(chosenPlayerPseudo: string): Promise<void> {
        if (JoinerService.VERBOSE) {
            console.log('JoinerService.setChosenPlayer(' + chosenPlayerPseudo + ')');
        }
        let joiner: IJoiner = await this.joinerDao.read(this.observedJoinerId);
        const candidatesNames: string[] = joiner.candidatesNames;
        const chosenPlayerIndex = candidatesNames.indexOf(chosenPlayerPseudo);
        if (chosenPlayerIndex < 0 ) throw new Error("Chosen player is not in the chat");

        // if user is still present, take him off the candidate list
        candidatesNames.splice(chosenPlayerIndex, 1);
        const oldChosenPlayer: string = joiner.chosenPlayer;
        if (oldChosenPlayer !== '') {
            // if there is a previous chosenPlayer, put him in the candidates list
            candidatesNames.push(oldChosenPlayer);
            // so he don't just disappear
        }
        return this.joinerDao.update(this.observedJoinerId, {
            partStatus: 1,
            candidatesNames,
            chosenPlayer: chosenPlayerPseudo
        });
    }
    public unselectChosenPlayer() {
        throw new Error("JoinerService.unselectChosenPlayer: TODO");
    }
    public proposeConfig(maximalMoveDuration: number, firstPlayer: string, totalPartDuration: number): Promise<void> {
        if (JoinerService.VERBOSE) {
            console.log('JoinerService.proposeConfig(' + maximalMoveDuration + ', ' + firstPlayer + ', ' + totalPartDuration + ')');
            console.log('this.followedJoinerId: ' + this.observedJoinerId);
        }
        return this.joinerDao.update(this.observedJoinerId, {
            partStatus: 2,
            // timeoutMinimalDuration: timeout,
            maximalMoveDuration: maximalMoveDuration,
            totalPartDuration: totalPartDuration,
            firstPlayer: firstPlayer
        });
    }
    public acceptConfig(): Promise<void> {
        if (this.observedJoinerId == null) {
            console.log('BUG GOING TO HAPPEND cause acceptConfig when no observing Joiner !!');
        }
        // console.log('JoinerService :: let s accept config from ' + this.followedJoinerId);
        return this.joinerDao
            .update(this.observedJoinerId, {partStatus: 3});
    }
    public stopObserving() {
        if (JoinerService.VERBOSE) {
            console.log('JoinerService.stopObserving(); // this.observedJoinerId = ' + this.observedJoinerId);
        }
        if (this.observedJoinerId == null) {
            if (JoinerService.VERBOSE) { // TODO: make an exception for this
                console.log('!!!we already stop watching doc');
            }
        } else {
            this.observedJoinerId = null;
            this.observedJoinerSub.unsubscribe();
            this.observedJoinerObs = null;
        }
    }
    // DELEGATE

    public readJoinerById(partId: string): Promise<IJoiner> {
        if (JoinerService.VERBOSE) {
            console.log('JoinerService.readJoinerById(' + partId + ')');
        }
        return this.joinerDao.read(partId);
    }
    public set(partId: string, joiner: IJoiner): Promise<void> {
        if (JoinerService.VERBOSE) {
            console.log('JoinerService.set(' + partId + ', ' + JSON.stringify(joiner) + ')');
        }
        return this.joinerDao.set(partId, joiner);
    }
    public updateJoinerById(partId: string, update: PIJoiner): Promise<void> {
        if (JoinerService.VERBOSE) {
            console.log('JoinerService.updateJoinerById(' + partId + ', ' + JSON.stringify(update) + ')');
        }
        return this.joinerDao.update(partId, update);
    }
}