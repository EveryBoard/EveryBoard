import {Injectable} from '@angular/core';
import {Observable, Subscription} from 'rxjs';

import {PartDAO} from '../../dao/part/PartDAO';

import {ICurrentPart, ICurrentPartId} from '../../domain/icurrentpart';
import {IJoiner} from '../../domain/ijoiner';

import {JoinerService} from '../joiner/JoinerService';
import {ActivesPartsService} from '../actives-parts/ActivesPartsService';
import {ChatService} from '../chat/ChatService';
import {IChat} from '../../domain/ichat';
import {MGPRequest} from '../../domain/request';
import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { ArrayUtils } from 'src/app/collectionlib/arrayutils/ArrayUtils';

@Injectable({
    providedIn: 'root'
})
export class GameService {

    public static VERBOSE: boolean = false;

    private followedPartId: string;

    private followedPartObs: Observable<ICurrentPartId>;

    private followedPartSub: Subscription;

    constructor(private partDao: PartDAO,
                private activesPartsService: ActivesPartsService,
                private joinerService: JoinerService,
                private chatService: ChatService) {
        if (GameService.VERBOSE) console.log("GameService.constructor");
    }
    // on Server Component

    protected createPart(creatorName: string, typeGame: string, chosenPlayer: string): Promise<String> {
        if (GameService.VERBOSE) {
            console.log('GameService.createPart(' + creatorName + ', ' + typeGame + ', ' + chosenPlayer);
        }
        const newPart: ICurrentPart = {
            listMoves: [],
            playerZero: creatorName,
            playerOne: chosenPlayer,
            result: 5, // todo : constantiser ça, bordel
            turn: -1,
            typeGame
        };
        return this.partDao.create(newPart);
    }
    protected createChat(chatId: string): Promise<void> {
        if (GameService.VERBOSE) {
            console.log('GameService.createChat(' + chatId + ')');
        }
        const newChat: IChat = {
            status: 'not implemented',
            messages: []
        };
        return this.chatService.set(chatId, newChat);
    }
    public async createGame(creatorName: string, typeGame: string, chosenPlayer: string): Promise<string> {
        if (GameService.VERBOSE) {
            console.log('GameService.createGame(' + creatorName + ', ' + typeGame + ')');
        }
        const gameId: string = await this.createPart(creatorName, typeGame, chosenPlayer) as string;
        await this.joinerService.createInitialJoiner(creatorName, gameId);
        await this.createChat(gameId); // TODO asynchronous
        return gameId;
    }
    public getActivesPartsObs(): Observable<ICurrentPartId[]> {
        // TODO: désabonnements de sûreté aux autres abonnements activesParts
        if (GameService.VERBOSE) {
            console.log('GameService.getActivesPartsObs');
        }
        this.activesPartsService.startObserving();
        return this.activesPartsService.activesPartsObs;
    }
    public unSubFromActivesPartsObs() {
        if (GameService.VERBOSE) {
            console.log('GameService.unSubFromActivesPartsObs()');
        }
        this.activesPartsService.stopObserving();
    }
    // on Part Creation Component

    private startGameWithConfig(partId: string, joiner: IJoiner): Promise<void> {
        if (GameService.VERBOSE) {
            console.log('GameService.startGameWithConfig(' + partId + ", " + JSON.stringify(joiner));
        }
        let firstPlayer = joiner.creator;
        let secondPlayer = joiner.chosenPlayer;
        if (joiner.firstPlayer === '2' && (Math.random() < 0.5)) {
            joiner.firstPlayer = '1';
            // random
        }
        if (joiner.firstPlayer === '1') {
            // the opposite config is planned
            secondPlayer = joiner.creator;
            firstPlayer = joiner.chosenPlayer;
        }
        const modification = {
            playerZero: firstPlayer,
            playerOne: secondPlayer,
            turn: 0,
            beginning: Date.now()
        };
        return this.partDao.update(partId, modification);
    }
    public async deletePart(partId: string): Promise<void> {
        if (GameService.VERBOSE) {
            console.log('GameService.deletePart(' + partId + ')');
        }
        if (partId == null) {
            throw new Error("Can't delete id for partId = null");
        }
        return this.partDao.delete(partId);
    }
    public async acceptConfig(partId: string, joiner: IJoiner): Promise<void> {
        if (GameService.VERBOSE) {
            console.log('GameService.acceptConfig(' + partId + ", " + JSON.stringify(joiner) + ') + tmp partStatus: ' + joiner.partStatus);
        }
        await this.joinerService.acceptConfig();
        return this.startGameWithConfig(partId, joiner);
    }
    // on OnlineGame Component

    public startObserving(partId: string, callback: (iPart: ICurrentPartId) => void) {
        if (this.followedPartId == null) {
            if (GameService.VERBOSE) {
                console.log('[start watching part ' + partId);
            }
            this.followedPartId = partId;
            this.followedPartObs = this.partDao.getObsById(partId);
            this.followedPartSub = this.followedPartObs
                .subscribe(onFullFilled => callback(onFullFilled));
        } else {
            throw new Error("GameService.startObserving should not be called while already observing a game");
        }
    }
    public resign(partId: string, winner: string): Promise<void> {
        return this.partDao.update(partId, {
            winner: winner,
            result: 1,
            request: null
        }); // resign
    }
    public notifyDraw(partId: string): Promise<void> {
        return this.partDao.update(partId, {
            result: 0,
            request: null
        }); // DRAW CONSTANT
    }
    public notifyTimeout(partId: string, winner: string): Promise<void> {
        return this.partDao.update(partId, {
            winner: winner,
            result: 4,
            request: null
        });
    }
    public notifyVictory(partId: string, winner: string): Promise<void> {
        if (GameService.VERBOSE) console.log("GameService.notifyVictory(" + partId + ", " + winner + ")");
        return this.partDao.update(partId, {
            winner,
            result: 3,
            request: null
        });
    }
    public proposeRematch(partId: string, oberserverRole: 0 | 1): Promise<void> {
        const req: MGPRequest = {code: 6 + oberserverRole};
        return this.partDao.update(partId, {request: req});
    }
    public async acceptRematch(part: ICurrentPartId): Promise<void> {
        if (GameService.VERBOSE) console.log("GameService.acceptRematch(" + JSON.stringify(part) + ")");

        const iJoiner: IJoiner = await this.joinerService.readJoinerById(part.id);
        const rematchId: string = await this.createGame(iJoiner.creator, part.doc.typeGame, iJoiner.chosenPlayer);
        let firstPlayer: string = iJoiner.firstPlayer;
        if (firstPlayer === '2') {
            if (part.doc.playerZero === iJoiner.creator) {
                // the creator started the previous game thank to hazard
                firstPlayer = '1'; // so he won't start this one
            } else {
                firstPlayer = '0';
            }
        } else {
            firstPlayer = firstPlayer === '0' ? '1' : '0';
        }
        const newJoiner: IJoiner = {
            candidatesNames: iJoiner.candidatesNames,
            creator: iJoiner.creator,
            chosenPlayer: iJoiner.chosenPlayer,
            firstPlayer: firstPlayer,
            partStatus: 3, // already started
            maximalMoveDuration: iJoiner.maximalMoveDuration,
            totalPartDuration: iJoiner.totalPartDuration
        };
        const req: MGPRequest = {
            code: 8,
            partId: rematchId,
            typeGame: part.doc.typeGame
        };
        await this.joinerService.updateJoinerById(rematchId, newJoiner);
        return this.partDao.update(part.id, {request: req});
    }
    public async updateDBBoard(encodedMove: number, scorePlayerZero: number, scorePlayerOne: number, partId: string): Promise<void> {
        if (GameService.VERBOSE) console.log("GameService.updateDBBoard(" + encodedMove + ", " + scorePlayerZero + ", " + scorePlayerOne + ", " + partId + ")");

        const part: ICurrentPart = await this.partDao.read(partId); // TODO: optimise this
        const turn: number = part.turn + 1;
        const listMoves: number[] = ArrayUtils.copyArray(part.listMoves);
        listMoves[listMoves.length] = encodedMove;
        await this.partDao.update(partId, {
            listMoves,
            turn,
            scorePlayerZero,
            scorePlayerOne,
        });
        if (GameService.VERBOSE) console.log("GameService.updateDBBoard: over");
        return Promise.resolve();
    }
    public stopObserving() {
        if (GameService.VERBOSE) {
            console.log('GameService.stopObserving();');
        }
        if (this.followedPartId == null) {
            console.log('!!!we already stop watching doc');
        } else {
            if (GameService.VERBOSE) {
                console.log('stopped watching joiner ' + this.followedPartId + ']');
            }
            this.followedPartId = null;
            this.followedPartSub.unsubscribe();
            this.followedPartObs = null;
        }
    }
}