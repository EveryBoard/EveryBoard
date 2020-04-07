import {Injectable} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {IJoiner, IJoinerId, PIJoiner} from '../../domain/ijoiner';
import {JoinerDAO} from '../../dao/JoinerDAO';

@Injectable({
    providedIn: 'root'
})
export class JoinerService {

    static VERBOSE = false;

    private followedJoinerId: string;
    private followedJoinerObs: Observable<IJoinerId>;
    private followedJoinerSub: Subscription;

    constructor(private joinerDao: JoinerDAO) {
    }
    public startObserving(joinerId: string, callback: (iJoiner: IJoinerId) => void) {
        if (this.followedJoinerId == null) {
            if (JoinerService.VERBOSE) {
                console.log('[start watching joiner ' + joinerId);
            }
            this.followedJoinerId = joinerId;
            this.followedJoinerObs = this.joinerDao.getObservable(joinerId);
            this.followedJoinerSub = this.followedJoinerObs
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
        if (!joinerList.includes(userName) &&
            (userName !== joiner.creator)) {
            joinerList[joinerList.length] = userName;
            return this.joinerDao.update(partId, {candidatesNames: joinerList});
        } else {
            // the user was already in the lobby/joining Part
            return;
        }
    }
    public cancelJoining(userName: string): Promise<void> {
        if (JoinerService.VERBOSE) {
            console.log('JoinerService.cancelJoining(' + userName + '); this.followedJoinerId =' + this.followedJoinerId);
        }
        return new Promise((resolve, reject) => {
            if (this.followedJoinerId == null) {
                console.log('cannot cancel joining when not following a joiner');
                reject();
            } else {
                this.joinerDao
                    .read(this.followedJoinerId)
                    .then(joiner => {
                        if (joiner == null) {
                            reject(joiner);
                        } else {
                            const joinersList: string[] = joiner.candidatesNames;
                            const indexLeaver = joinersList.indexOf(userName);
                            let chosenPlayer = joiner.chosenPlayer;
                            let partStatus = joiner.partStatus;
                            if (indexLeaver >= 0) {
                                joinersList.splice(indexLeaver, 1);
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
                            this.joinerDao
                                .update(this.followedJoinerId, modification)
                                .then(onFullFilled => resolve(onFullFilled))
                                .catch(onRejected => reject(onRejected));
                        }
                    })
                    .catch(onRejected => reject(onRejected));
            }
        });
    }
    public deleteJoiner(): Promise<void> {
        if (JoinerService.VERBOSE) {
            console.log('JoinerService.deleteJoiner(); this.followedJoinerId = ' + this.followedJoinerId);
        }
        return new Promise((resolve, reject) => {
            if (this.followedJoinerId == null) {
                console.log('followed joiner id is null');
                reject();
            }
            this.joinerDao
                .delete(this.followedJoinerId)
                .then(onFullFilled => resolve(onFullFilled))
                .catch(onRejected => reject(onRejected));
        });
    }
    public async setChosenPlayer(chosenPlayerPseudo: string): Promise<void> {
        if (JoinerService.VERBOSE) {
            console.log('JoinerService.setChosenPlayer(' + chosenPlayerPseudo + ')');
        }
        let joiner: IJoiner = await this.joinerDao.read(this.followedJoinerId);
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
        return this.joinerDao.update(this.followedJoinerId, {
            partStatus: 1,
            candidatesNames,
            chosenPlayer: chosenPlayerPseudo
        });
    }
    public proposeConfig(maximalMoveDuration: number, firstPlayer: string, totalPartDuration: number): Promise<void> {
        if (JoinerService.VERBOSE) {
            console.log('JoinerService.proposeConfig(' + maximalMoveDuration + ', ' + firstPlayer + ', ' + totalPartDuration + ')');
            console.log('this.followedJoinerId: ' + this.followedJoinerId);
        }
        return this.joinerDao.update(this.followedJoinerId, {
            partStatus: 2,
            // timeoutMinimalDuration: timeout,
            maximalMoveDuration: maximalMoveDuration,
            totalPartDuration: totalPartDuration,
            firstPlayer: firstPlayer
        });
    }
    public acceptConfig(): Promise<void> {
        if (this.followedJoinerId == null) {
            console.log('BUG GOING TO HAPPEND cause acceptConfig when no observing Joiner !!');
        }
        // console.log('JoinerService :: let s accept config from ' + this.followedJoinerId);
        return this.joinerDao
            .update(this.followedJoinerId, {partStatus: 3});
    }
    public stopObserving() {
        if (JoinerService.VERBOSE) {
            console.log('JoinerService.stopObserving(); // this.followedJoinerId = ' + this.followedJoinerId);
        }
        if (this.followedJoinerId == null) {
            if (JoinerService.VERBOSE) { // TODO: make an exception for this
                console.log('!!!we already stop watching doc');
            }
        } else {
            this.followedJoinerId = null;
            this.followedJoinerSub.unsubscribe();
            this.followedJoinerObs = null;
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