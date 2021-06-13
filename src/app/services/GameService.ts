import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { PartDAO } from '../dao/PartDAO';
import { MGPResult, ICurrentPartId, IPart, Part } from '../domain/icurrentpart';
import { FirstPlayer, IJoiner, PartStatus } from '../domain/ijoiner';
import { JoinerService } from './JoinerService';
import { ActivesPartsService } from './ActivesPartsService';
import { ChatService } from './ChatService';
import { IChat } from '../domain/ichat';
import { Request } from '../domain/request';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { Player } from 'src/app/jscaip/Player';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { assert, display, JSONValueWithoutArray } from 'src/app/utils/utils';
import { Router } from '@angular/router';
import { AuthenticationService, AuthUser } from './AuthenticationService';
import { MessageDisplayer } from './message-displayer/MessageDisplayer';

@Injectable({
    providedIn: 'root',
})
export class GameService implements OnDestroy {
    public static VERBOSE: boolean = false;

    private followedPartId: string;

    private followedPartObs: Observable<ICurrentPartId>;

    private followedPartSub: Subscription;

    private userNameSub: Subscription;

    private userName: string;

    constructor(private partDao: PartDAO,
                public activesPartsService: ActivesPartsService,
                public joinerService: JoinerService,
                private chatService: ChatService,
                private router: Router,
                private messageDisplayer: MessageDisplayer,
                private authenticationService: AuthenticationService) {
        display(GameService.VERBOSE, 'GameService.constructor');
        this.userNameSub = this.authenticationService.getJoueurObs()
            .subscribe((joueur: AuthUser) => {
                if (joueur == null) this.userName = null;
                else this.userName = joueur.pseudo;
            });
    }
    public async createGameAndRedirectOrShowError(game: string): Promise<boolean> {
        if (this.canCreateGame(this.userName)) {
            const gameId: string = await this.createGame(this.userName, game, '');
            // create Part and Joiner
            this.router.navigate(['/play/' + game, gameId]);
            return true;
        } else {
            this.messageDisplayer.infoMessage(`Vous avez déjà une partie en cours. Terminez la ou annulez la d'abord !`);
            this.router.navigate(['/server']);
            return false;
        }
    }
    public ngOnDestroy(): void {
        if (this.userNameSub) {
            this.userNameSub.unsubscribe();
        }
    }

    public async getPartValidity(partId: string, gameType: string): Promise<MGPValidation> {
        const part: IPart = await this.partDao.read(partId);
        if (part == null) {
            return MGPValidation.failure('UNEXISTANT_PART');
        }
        if (part.typeGame === gameType) {
            return MGPValidation.SUCCESS;
        } else {
            return MGPValidation.failure('WRONG_GAME_TYPE');
        }
    }
    protected createPart(creatorName: string, typeGame: string, chosenPlayer: string): Promise<string> {
        display(GameService.VERBOSE,
                'GameService.createPart(' + creatorName + ', ' + typeGame + ', ' + chosenPlayer + ')');

        const newPart: IPart = {
            typeGame,
            playerZero: creatorName,
            playerOne: chosenPlayer,
            turn: -1,
            result: MGPResult.UNACHIEVED.value,
            listMoves: [],
        };
        return this.partDao.create(newPart);
    }
    protected createChat(chatId: string): Promise<void> {
        display(GameService.VERBOSE, 'GameService.createChat(' + chatId + ')');

        const newChat: IChat = {
            status: 'not implemented',
            messages: [],
        };
        return this.chatService.set(chatId, newChat);
    }
    public async createGame(creatorName: string, typeGame: string, chosenPlayer: string): Promise<string> {
        display(GameService.VERBOSE, 'GameService.createGame(' + creatorName + ', ' + typeGame + ')');

        const gameId: string = await this.createPart(creatorName, typeGame, chosenPlayer) as string;
        await this.joinerService.createInitialJoiner(creatorName, gameId);
        await this.createChat(gameId); // TODO asynchronous
        return gameId;
    }
    public canCreateGame(creator: string): boolean {
        return this.activesPartsService.hasActivePart(creator) === false;
    }
    public getActivesPartsObs(): Observable<ICurrentPartId[]> {
        // TODO: désabonnements de sûreté aux autres abonnements activesParts
        display(GameService.VERBOSE, 'GameService.getActivesPartsObs');

        this.activesPartsService.startObserving();
        return this.activesPartsService.activesPartsObs;
    }
    public unSubFromActivesPartsObs(): void {
        display(GameService.VERBOSE, 'GameService.unSubFromActivesPartsObs()');

        this.activesPartsService.stopObserving();
    }
    // on Part Creation Component

    private startGameWithConfig(partId: string, joiner: IJoiner): Promise<void> {
        display(GameService.VERBOSE, 'GameService.startGameWithConfig(' + partId + ', ' + JSON.stringify(joiner));

        let whoStarts: FirstPlayer = FirstPlayer.of(joiner.firstPlayer);
        if (whoStarts === FirstPlayer.RANDOM) {
            if (Math.random() < 0.5) {
                whoStarts = FirstPlayer.CREATOR;
            } else {
                whoStarts = FirstPlayer.CHOSEN_PLAYER;
            }
        }
        let playerZero: string;
        let playerOne: string;
        if (whoStarts === FirstPlayer.CREATOR) {
            playerZero = joiner.creator;
            playerOne = joiner.chosenPlayer;
        } else {
            playerZero = joiner.chosenPlayer;
            playerOne = joiner.creator;
        }
        const modification: Partial<IPart> = {
            playerZero,
            playerOne,
            turn: 0,
            beginning: Date.now(),
        };
        return this.partDao.update(partId, modification);
    }
    public async deletePart(partId: string): Promise<void> {
        display(GameService.VERBOSE, 'GameService.deletePart(' + partId + ')');

        if (partId == null) {
            throw new Error('Can\'t delete id for partId = null');
        }
        return this.partDao.delete(partId);
    }
    public async acceptConfig(partId: string, joiner: IJoiner): Promise<void> {
        display(GameService.VERBOSE, { gameService_acceptConfig: { partId, joiner } });

        await this.joinerService.acceptConfig();
        return this.startGameWithConfig(partId, joiner);
    }
    // on OnlineGame Component

    public startObserving(partId: string, callback: (iPart: ICurrentPartId) => void): void {
        if (this.followedPartId == null) {
            display(GameService.VERBOSE, '[start watching part ' + partId);

            this.followedPartId = partId;
            this.followedPartObs = this.partDao.getObsById(partId);
            this.followedPartSub = this.followedPartObs
                .subscribe((onFullFilled: ICurrentPartId) => callback(onFullFilled));
        } else {
            throw new Error('GameService.startObserving should not be called while already observing a game');
        }
    }
    public resign(partId: string, winner: string, loser: string): Promise<void> {
        return this.partDao.update(partId, {
            winner,
            loser,
            result: MGPResult.RESIGN.value,
            request: null,
        }); // resign
    }
    public notifyTimeout(partId: string, winner: string, loser: string): Promise<void> {
        return this.partDao.update(partId, {
            winner,
            loser,
            result: MGPResult.TIMEOUT.value,
            request: null, // TODO: check line use
        });
    }
    public sendRequest(partId: string, request: Request): Promise<void> {
        return this.partDao.update(partId, { request });
    }
    public proposeDraw(partId: string, player: Player): Promise<void> {
        return this.sendRequest(partId, Request.drawProposed(player));
    }
    public acceptDraw(partId: string): Promise<void> {
        return this.partDao.update(partId, {
            result: MGPResult.DRAW.value,
            request: null,
        });
    }
    public refuseDraw(partId: string, player: Player): Promise<void> {
        return this.sendRequest(partId, Request.drawRefused(player));
    }
    public proposeRematch(partId: string, player: Player): Promise<void> {
        return this.sendRequest(partId, Request.rematchProposed(player));
    }
    public async acceptRematch(part: ICurrentPartId): Promise<void> {
        display(GameService.VERBOSE, 'GameService.acceptRematch(' + JSON.stringify(part) + ')');

        const iJoiner: IJoiner = await this.joinerService.readJoinerById(part.id);
        const rematchId: string = await this.createGame(iJoiner.creator, part.doc.typeGame, iJoiner.chosenPlayer);
        let firstPlayer: FirstPlayer;
        if (part.doc.playerZero === iJoiner.creator) {
            firstPlayer = FirstPlayer.CHOSEN_PLAYER; // so he won't start this one
        } else {
            firstPlayer = FirstPlayer.CREATOR;
        }
        const newJoiner: IJoiner = {
            candidates: iJoiner.candidates,
            creator: iJoiner.creator,
            chosenPlayer: iJoiner.chosenPlayer,
            firstPlayer: firstPlayer.value,
            partStatus: PartStatus.PART_STARTED.value,
            maximalMoveDuration: iJoiner.maximalMoveDuration,
            totalPartDuration: iJoiner.totalPartDuration,
        };
        await this.joinerService.updateJoinerById(rematchId, newJoiner);
        return this.sendRequest(part.id, Request.rematchAccepted(part.doc.typeGame, rematchId));
    }
    public askTakeBack(partId: string, player: Player): Promise<void> {
        return this.sendRequest(partId, Request.takeBackAsked(player));
    }
    public async acceptTakeBack(id: string, part: Part, observerRole: Player): Promise<void> {
        assert(observerRole !== Player.NONE, 'Illegal for observer to make request');
        assert(part.doc.request.data['player'] !== observerRole.value, 'Illegal to accept your own request.');

        const request: Request = Request.takeBackAccepted(observerRole);
        let listMoves: JSONValueWithoutArray[] = part.doc.listMoves.slice(0, part.doc.listMoves.length - 1);
        if (listMoves.length % 2 === observerRole.value) {
            // Deleting a second move
            listMoves = listMoves.slice(0, listMoves.length - 1);
        }
        return await this.partDao.update(id, {
            request,
            listMoves,
            turn: listMoves.length,
        });
    }
    public refuseTakeBack(id: string, observerRole: Player): Promise<void> {
        assert(observerRole !== Player.NONE, 'Illegal for observer to make request');

        const request: Request = Request.takeBackRefused(observerRole);
        return this.partDao.update(id, {
            request,
        });
    }
    public stopObserving(): void {
        display(GameService.VERBOSE, 'GameService.stopObserving();');

        if (this.followedPartId == null) {
            throw new Error('!!! GameService.stopObserving: we already stop watching doc');
        } else {
            display(GameService.VERBOSE, 'stopped watching joiner ' + this.followedPartId + ']');

            this.followedPartId = null;
            this.followedPartSub.unsubscribe();
            this.followedPartObs = null;
        }
    }
    public async updateDBBoard(
        partId: string,
        encodedMove: JSONValueWithoutArray,
        scorePlayerZero: number,
        scorePlayerOne: number,
        notifyDraw?: boolean,
        winner?: string,
        loser?: string,
    ): Promise<void> {
        display(GameService.VERBOSE, { gameService_updateDBBoard: {
            partId, encodedMove, scorePlayerZero, scorePlayerOne, notifyDraw, winner } });

        const part: IPart = await this.partDao.read(partId); // TODO: optimise this
        const turn: number = part.turn + 1;
        const listMoves: JSONValueWithoutArray[] = ArrayUtils.copyImmutableArray(part.listMoves);
        listMoves[listMoves.length] = encodedMove;
        let update: Partial<IPart> = {
            listMoves,
            turn,
            scorePlayerZero,
            scorePlayerOne,
            request: null,
        };
        if (winner != null) {
            update = {
                ...update,
                winner,
                loser,
                result: MGPResult.VICTORY.value,
            };
        } else if (notifyDraw) {
            update = {
                ...update,
                result: MGPResult.DRAW.value,
            };
        }
        return await this.partDao.update(partId, update);
    }

}
