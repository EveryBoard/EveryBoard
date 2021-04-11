import { Component, ComponentFactoryResolver, OnDestroy, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, Event } from '@angular/router';

import { Subscription } from 'rxjs';

import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { GameService } from 'src/app/services/game/GameService';
import { UserService } from 'src/app/services/user/UserService';

import { Move } from '../../../jscaip/Move';
import { ICurrentPart, ICurrentPartId, Part, MGPResult } from '../../../domain/icurrentpart';
import { CountDownComponent } from '../../normal-component/count-down/count-down.component';
import { PartCreationComponent } from '../../normal-component/part-creation/part-creation.component';
import { IJoueurId, IJoueur } from '../../../domain/iuser';
import { IMGPRequest, RequestCode } from '../../../domain/request';
import { GameWrapper } from '../GameWrapper';
import { FirebaseCollectionObserver } from 'src/app/dao/FirebaseCollectionObserver';
import { IJoiner } from 'src/app/domain/ijoiner';
import { ChatComponent } from '../../normal-component/chat/chat.component';
import { Player } from 'src/app/jscaip/player/Player';
import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';
import { assert, display, JSONValue } from 'src/app/utils/collection-lib/utils';
import { getDiff, getDiffChangesNumber, ObjectDifference } from 'src/app/utils/object-utils/ObjectUtils';

export class UpdateType {

    public static readonly PRE_START_DOC: UpdateType = new UpdateType('PRE_START_DOC');

    public static readonly STARTING_DOC: UpdateType = new UpdateType('STARTING_DOC');

    public static readonly DOUBLON: UpdateType = new UpdateType('DOUBLON');

    public static readonly MOVE: UpdateType = new UpdateType('MOVE');

    public static readonly REQUEST: UpdateType = new UpdateType('REQUEST');

    public static readonly END_GAME: UpdateType = new UpdateType('END_GAME');

    private constructor(public readonly value: string) {}
}
@Component({
    selector: 'app-online-game-wrapper',
    templateUrl: './online-game-wrapper.component.html',
    styleUrls: ['./online-game-wrapper.component.css'],
})
export class OnlineGameWrapperComponent extends GameWrapper implements OnInit, AfterViewInit, OnDestroy {
    public static VERBOSE: boolean = false;

    @ViewChild('partCreation')
    public partCreation: PartCreationComponent;

    @ViewChild('chatComponent')
    public chatComponent: ChatComponent;

    // GameWrapping's Template
    @ViewChild('chronoZeroGlobal') public chronoZeroGlobal: CountDownComponent;
    @ViewChild('chronoOneGlobal') public chronoOneGlobal: CountDownComponent;
    @ViewChild('chronoZeroLocal') public chronoZeroLocal: CountDownComponent;
    @ViewChild('chronoOneLocal') public chronoOneLocal: CountDownComponent;

    // link between GameWrapping's template and remote opponent
    public currentPart: Part;
    public currentPartId: string;
    public gameStarted: boolean = false;
    public opponent: IJoueurId = null;
    public currentPlayer: string;

    public rematchProposed: boolean = null;
    public opponentProposedRematch: boolean = null;

    public maximalMoveDuration: number; // TODO: rendre inutile, remplacé par l'instance d'ICurrentPartId
    public totalPartDuration: number; // TODO: rendre inutile, remplacé par l'instance d'ICurrentPartId

    public gameBeginningTime: number; // TODO: rendre inutile, remplacé par l'instance d'ICurrentPartId

    private hasUserPlayed: [boolean, boolean] = [false, false];

    protected routerEventsSub: Subscription;
    protected userSub: Subscription;
    protected observedPartSubscription: Subscription;
    protected opponentSubscription: () => void;

    constructor(componentFactoryResolver: ComponentFactoryResolver,
                actRoute: ActivatedRoute,
                router: Router,
                userService: UserService,
                authenticationService: AuthenticationService,
                private gameService: GameService) {
        super(componentFactoryResolver, actRoute, router, userService, authenticationService);
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent constructed');
    }
    private extractPartIdFromURL(): string {
        return this.actRoute.snapshot.paramMap.get('id');
    }
    private extractGameTypeFromURL(): string {
        // url is ["play", "game-name", "part-id"]
        return this.actRoute.snapshot.paramMap.get('compo');
    }
    private async redirectIfPartIsInvalid(): Promise<void> {
        const gameType: string = this.extractGameTypeFromURL();
        const partValidity: MGPValidation =
            await this.gameService.getPartValidity(this.currentPartId, gameType);
        if (partValidity.isFailure()) {
            let page: string;
            if (partValidity.reason === 'WRONG_GAME_TYPE') {
                page = '/enfantDCul';
            } else {
                page = '/notFound';
            }
            this.routerEventsSub.unsubscribe();
            this.router.navigate([page]);
        }
    }
    private async setCurrentPartIdOrRedirect(): Promise<void> {
        this.currentPartId = this.extractPartIdFromURL();
        await this.redirectIfPartIsInvalid();
    }
    public async ngOnInit(): Promise<void> {
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.ngOnInit');

        this.routerEventsSub = this.router.events.subscribe(async(ev: Event) => {
            if (ev instanceof NavigationEnd) {
                await this.setCurrentPartIdOrRedirect();
            }
        });
        await this.setCurrentPartIdOrRedirect();
        this.userSub = this.authenticationService.getJoueurObs()
            .subscribe((user: { pseudo: string, verified: boolean}) => this.userName = user.pseudo);
    }
    public ngAfterViewInit(): void {
        /* this.chat.changes.subscribe((comps: QueryList<ElementRef>) => {
            this.chatVisibility = comps.first.nativeElement.firstChild.visible;
        });*/
    }
    public getChatHeight(): string {
        if (this.chatComponent == null || this.chatComponent.visible === true) return '40%';
        else return '10%';
    }
    public getGameHeight(): string {
        if (this.chatComponent == null || this.chatComponent.visible === true) return '60%';
        else return '90%';
    }
    public resetGameDatas(): void {
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGame.resetGameDatas');

        this.players = null; // TODO: rendre inutile, remplacé par l'instance d'ICurrentPart

        this.gameStarted = false;
        this.endGame = false;
        this.opponent = null;

        this.canPass = null;
        this.rematchProposed = null;
        this.opponentProposedRematch = null;
        this.currentPartId = this.actRoute.snapshot.paramMap.get('id');
    }
    public startGame(iJoiner: IJoiner): void {
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.startGame');

        if (iJoiner == null) throw new Error('Cannot start Game of empty joiner doc');
        this.maximalMoveDuration = iJoiner.maximalMoveDuration * 1000;
        this.totalPartDuration = iJoiner.totalPartDuration * 1000;

        if (this.gameStarted === true) {
            throw new Error('Should not start already started game');
        }
        this.gameStarted = true;
        setTimeout(() => {
            // the small waiting is there to make sur that the chronos are charged by view
            this.afterGameIncluderViewInit();
            this.startPart(); // NEWLY
        }, 1);
    }
    protected async startPart(): Promise<void> {
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.startPart');

        // TODO: don't start count down for Observer.
        this.gameService.startObserving(this.currentPartId, (iPart: ICurrentPartId) => {
            this.onCurrentPartUpdate(iPart);
        });
        return Promise.resolve();
    }
    protected onCurrentPartUpdate(update: ICurrentPartId): void {
        const part: ICurrentPart = update.doc;
        display(OnlineGameWrapperComponent.VERBOSE || true, { OnlineGameWrapperComponent_onCurrentPartUpdate: {
            before: this.currentPart,
            then: update.doc,
            before_part_turn: part.turn,
            before_slice_turn: this.gameComponent.rules.node.gamePartSlice.turn,
            nbPlayedMoves: part.listMoves.length,
        } });
        const updateType: UpdateType = this.getUpdateType(part);
        this.currentPart = Part.of(part);
        display(true, 'OnlineGameWrapperComponent.onCurrentPartUpdate: UpdateType.' + updateType.value);
        switch (updateType) {
            case UpdateType.REQUEST:
                return this.onRequest(part.request);
            case UpdateType.DOUBLON:
                return;
            case UpdateType.END_GAME:
                return this.checkEndgames();
                // TODO: might no longer be checkEndGame but "do"EndGame
            case UpdateType.MOVE:
                return this.doNewMoves(part);
            case UpdateType.PRE_START_DOC:
                return;
            case UpdateType.STARTING_DOC:
                this.setChronos();
                this.setPlayersDatas(part);
                return this.startCountDownFor(Player.ZERO);
            default:
                throw new Error('Unexpected update type ' + updateType);
        }
    }
    public getUpdateType(update: ICurrentPart): UpdateType {
        const currentPart: ICurrentPart = this.currentPart ? this.currentPart.copy() : null;
        const diff: ObjectDifference = getDiff(currentPart, update);
        console.log({ diff })
        const nbDiffs: number = getDiffChangesNumber(diff);
        if (diff == null || nbDiffs === 0) {
            return UpdateType.DOUBLON;
        }
        if (update.request) {
            return UpdateType.REQUEST;
        }
        if (diff.modified['listMoves'] && diff.modified['turn']) {
            if (nbDiffs === 2) {
                return UpdateType.MOVE;
            }
            if (nbDiffs === 3) {
                if (diff.removed['request'] ||
                    diff.modified['scorePlayerOne'] ||
                    diff.modified['scorePlayerZero'])
                {
                    return UpdateType.MOVE;
                }
            }
            if (nbDiffs === 4) {
                if ((diff.added['scorePlayerOne'] != null && diff.added['scorePlayerZero'] != null) ||
                    (diff.modified['scorePlayerOne'] != null && diff.modified['scorePlayerZero'] != null))
                {
                    return UpdateType.MOVE;
                }
            }
        }
        if (update.beginning == null) {
            return UpdateType.PRE_START_DOC;
        }
        if (update.beginning != null && update.listMoves.length === 0) {
            return UpdateType.STARTING_DOC;
        }
        if (update['result'] != null) { // TODO: non nullable result
            return UpdateType.END_GAME;
        }
        throw new Error('Unexpected update: ' + JSON.stringify(diff));
    }
    public setChronos(): void {
        display(OnlineGameWrapperComponent.VERBOSE, 'onlineGameWrapperComponent.setChronos()');
        this.chronoZeroGlobal.setDuration(this.totalPartDuration);
        this.chronoOneGlobal.setDuration(this.totalPartDuration);

        this.chronoZeroLocal.setDuration(this.maximalMoveDuration);
        this.chronoOneLocal.setDuration(this.maximalMoveDuration);
    }
    private didUserPlay(player: Player): boolean {
        return this.hasUserPlayed[player.value];
    }
    private doNewMoves(part: ICurrentPart) {
        this.switchPlayer();
        let currentPartTurn: number;
        const listMoves: number[] = part.listMoves;
        while (this.gameComponent.rules.node.gamePartSlice.turn < listMoves.length) {
            currentPartTurn = this.gameComponent.rules.node.gamePartSlice.turn;
            const chosenMove: Move = this.gameComponent.decodeMove(listMoves[currentPartTurn]);
            const correctDBMove: boolean = this.gameComponent.rules.choose(chosenMove);
            if (correctDBMove === false) {
                const message: string = 'We received an incorrect db move: ' +
                                         chosenMove.toString() + ' in ' + listMoves + ' at turn ' + currentPartTurn;
                throw new Error(message);
            }
        }
        this.currentPlayer = this.players[this.gameComponent.rules.node.gamePartSlice.turn % 2];
        this.gameComponent.updateBoard();
    }
    private switchPlayer(): void {
        const part: ICurrentPart = this.currentPart.copy();
        const currentPlayer: Player = part.turn % 2 === 0 ? Player.ZERO : Player.ONE;
        const currentEnnemy: Player = part.turn % 2 === 0 ? Player.ONE : Player.ZERO;
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.doNewMoves');
        if (this.didUserPlay(currentPlayer)) {
            display(OnlineGameWrapperComponent.VERBOSE,
                    'OnlineGameWrapperComponent.onCurrentPartUpdate: changing current player');
            this.resumeCountDownFor(currentPlayer);
        } else {
            this.startCountDownFor(currentPlayer);
        }
        if (this.didUserPlay(currentEnnemy)) {
            this.pauseCountDownsFor(currentEnnemy);
        }
    }
    private checkEndgames() {
        // fonctionne pour l'instant avec la victoire normale, l'abandon, et le timeout !
        const currentPart: ICurrentPart = this.currentPart.copy();
        const player: Player = this.currentPart.copy().turn % 2 === 0 ? Player.ZERO : Player.ONE;
        this.endGame = true;
        if (MGPResult.VICTORY.toInterface().value === currentPart.result.value) {
            this.doNewMoves(this.currentPart.copy());
            this.stopCountdownsFor(player);
        } else if ([MGPResult.DRAW, MGPResult.RESIGN, MGPResult.TIMEOUT]
            .some((result: MGPResult) => result.toInterface().value === currentPart.result.value)) {
            display(OnlineGameWrapperComponent.VERBOSE, 'endGame est true et winner est ' + currentPart.winner);
            this.stopCountdownsFor(player);
        } else {
            assert(false, 'Should not be here');
        }
    }
    public notifyDraw(encodedMove: JSONValue, scorePlayerZero: number, scorePlayerOne: number): void {
        this.endGame = true;
        this.gameService.updateDBBoard(this.currentPartId, encodedMove, scorePlayerZero, scorePlayerOne, true);
    }
    public notifyTimeoutVictory(victoriousPlayer: string): void {
        console.log('TIMEOUT IN FAVOR OF ' + victoriousPlayer)
        this.endGame = true;

        const wonPart: ICurrentPart = this.currentPart.copy();
        wonPart.winner = victoriousPlayer;
        this.currentPart = Part.of(wonPart);

        this.gameService.notifyTimeout(this.currentPartId, victoriousPlayer);
    }
    public notifyVictory(encodedMove: JSONValue, scorePlayerZero: number, scorePlayerOne: number): void {
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.notifyVictory');
        let winner: string;
        if (this.gameComponent.rules.node.ownValue === Number.MAX_SAFE_INTEGER) {
            winner = this.players[1];
        } else if (this.gameComponent.rules.node.ownValue === Number.MIN_SAFE_INTEGER) {
            winner = this.players[0];
        } else {
            throw new Error('How the fuck did you notice victory?');
        }
        this.endGame = true;

        const wonPart: ICurrentPart = this.currentPart.copy();
        wonPart.winner = winner;
        this.currentPart = Part.of(wonPart);

        this.gameService.updateDBBoard(this.currentPartId, encodedMove, scorePlayerZero, scorePlayerOne, false, winner);
    }
    public canAskTakeBack(): boolean {
        if (this.currentPart == null) {
            return false;
        }
        const currentPart: ICurrentPart = this.currentPart.copy();
        if (this.observerRole === 2) return false;
        else if (currentPart.turn <= this.observerRole) return false;
        else if (this.observerRole === 0 &&
                 currentPart.request &&
                 currentPart.request.code === RequestCode.ONE_REFUSED_TAKE_BACK.toInterface().code) {
            return false;
        } else if (this.observerRole === 1 &&
                 currentPart.request &&
                 currentPart.request.code === RequestCode.ZERO_REFUSED_TAKE_BACK.toInterface().code) {
            return false;
        } else if (this.getTakeBackRequester() === Player.NONE) return true;
        else return false;
    }
    public isOpponentWaitingForTakeBackResponse(): boolean {
        const takeBackRequester: Player = this.getTakeBackRequester();
        if (takeBackRequester === Player.ONE && this.observerRole === 0) return true;
        if (takeBackRequester === Player.ZERO && this.observerRole === 1) return true;
        return false;
    }
    private getTakeBackRequester(): Player {
        if (this.currentPart == null) {
            return Player.NONE;
        }
        const request: IMGPRequest = this.currentPart.copy().request;
        if (request == null) {
            return Player.NONE;
        } else if (request.code === RequestCode.ZERO_ASKED_TAKE_BACK.toInterface().code) {
            return Player.ZERO;
        } else if (request.code === RequestCode.ONE_ASKED_TAKE_BACK.toInterface().code) {
            return Player.ONE;
        } else {
            return Player.NONE;
        }
    }
    protected onRequest(request: IMGPRequest): void {
        display(OnlineGameWrapperComponent.VERBOSE, 'dans OnlineGameWrapper.onRequest(' + request.code + ')');
        switch (request.code) {
            case RequestCode.ONE_ASKED_TAKE_BACK.toInterface().code:
                break;
            case RequestCode.ZERO_ASKED_TAKE_BACK.toInterface().code:
                break;
            case RequestCode.ONE_REFUSED_TAKE_BACK.toInterface().code:
                break;
            case RequestCode.ZERO_REFUSED_TAKE_BACK.toInterface().code:
                break;
            case RequestCode.ZERO_ACCEPTED_TAKE_BACK.toInterface().code:
                this.takeBackFor(Player.ONE);
                break;
            case RequestCode.ONE_ACCEPTED_TAKE_BACK.toInterface().code:
                this.takeBackFor(Player.ZERO);
                break;
            case RequestCode.ZERO_PROPOSED_REMATCH.toInterface().code: // 0 propose un rematch
                this.rematchProposed = true;
                if (this.observerRole === 1) {
                    display(OnlineGameWrapperComponent.VERBOSE, 'ton adversaire te propose une revanche, 1');
                    this.opponentProposedRematch = true;
                }
                break;
            case RequestCode.ONE_PROPOSED_REMATCH.toInterface().code: // 1 propose un rematch
                this.rematchProposed = true;
                if (this.observerRole === 0) {
                    display(OnlineGameWrapperComponent.VERBOSE, 'ton adversaire te propose une revanche, 0');
                    this.opponentProposedRematch = true;
                }
                break;
            case RequestCode.REMATCH_ACCEPTED.toInterface().code: // rematch accepted
                this.router
                    .navigate(['/' + request.typeGame + '/' + request.partId])
                    .then((onSuccess) => {
                        this.ngOnDestroy();
                        this.resetGameDatas();
                        this.startGame(null);
                    });
                break;
            default:
                throw new Error('there was an error : ' + JSON.stringify(request) + ' had ' + request.code + ' value');
        }
    }
    private takeBackFor(player: Player) {
        this.gameComponent.rules.node = this.gameComponent.rules.node.mother;
        if (this.gameComponent.rules.node.gamePartSlice.turn % 2 !== player.value) {
            // Second time to make sure it end up on player's turn
            this.gameComponent.rules.node = this.gameComponent.rules.node.mother;
        } else {
            this.switchPlayer();
        }
        this.gameComponent.updateBoard();
    }
    public setPlayersDatas(updatedICurrentPart: ICurrentPart): void {
        display(OnlineGameWrapperComponent.VERBOSE, { OnlineGameWrapper_setPlayersDatas: updatedICurrentPart });
        this.players = [
            updatedICurrentPart.playerZero,
            updatedICurrentPart.playerOne];
        assert(updatedICurrentPart.playerOne != null, 'should not setPlayersDatas when players data is not received');
        this.currentPlayer = this.players[updatedICurrentPart.turn % 2];
        this.gameBeginningTime = updatedICurrentPart.beginning;
        let opponentName: string = '';
        if (this.players[0] === this.userName) {
            this.observerRole = 0;
            opponentName = this.players[1];
        } else if (this.players[1] === this.userName) {
            this.observerRole = 1;
            opponentName = this.players[0];
        } else {
            this.observerRole = 2;
        }
        if (opponentName !== '') {
            const onDocumentCreated: (foundUser: IJoueurId[]) => void = (foundUser: IJoueurId[]) => {
                this.opponent = foundUser[0];
            };
            const onDocumentModified: (modifiedUsers: IJoueurId[]) => void = (modifiedUsers: IJoueurId[]) => {
                console.log({ modifiedUsers });
                this.opponent = modifiedUsers[0];
            };
            const onDocumentDeleted: (deletedUsers: IJoueurId[]) => void = (deletedUsers: IJoueurId[]) => {
                throw new Error('OnlineGameWrapper: Opponent was deleted, what sorcery is this: ' +
                                JSON.stringify(deletedUsers));
            };
            const callback: FirebaseCollectionObserver<IJoueur> =
                new FirebaseCollectionObserver(onDocumentCreated,
                                               onDocumentModified,
                                               onDocumentDeleted);
            this.opponentSubscription =
                this.userService.observeUserByPseudo(opponentName, callback);
            // TODO: CHECK IF USEFULL OR NOT WITH NEW WAY TO DETECT DISCONNECTION
        }
    }
    public async onLegalUserMove(move: Move, scorePlayerZero: number, scorePlayerOne: number): Promise<void> {
        display(OnlineGameWrapperComponent.VERBOSE, 'dans OnlineGameWrapperComponent.onLegalUserMove');
        if (this.isOpponentWaitingForTakeBackResponse()) {
            this.gameComponent.message('You must answer to take back request');
        } else {
            return this.updateDBBoard(move, scorePlayerZero, scorePlayerOne);
        }
    }
    public async updateDBBoard(move: Move, scorePlayerZero: number, scorePlayerOne: number): Promise<void> {
        const encodedMove: JSONValue = this.gameComponent.encodeMove(move);
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.updateDBBoard(' + move.toString() +
                                                    ', ' + scorePlayerZero + ', ' + scorePlayerOne + ')');
        this.gameComponent.rules.choose(move);
        if (this.gameComponent.rules.node.isEndGame()) {
            if (this.gameComponent.rules.node.ownValue === 0) {
                this.notifyDraw(encodedMove, scorePlayerZero, scorePlayerOne);
            } else {
                this.notifyVictory(encodedMove, scorePlayerZero, scorePlayerOne);
            }
        } else {
            return this.gameService.updateDBBoard(this.currentPartId, encodedMove, scorePlayerZero, scorePlayerOne);
        }
    }
    public resign(): void {
        const victoriousOpponent: string = this.players[(this.observerRole + 1) % 2];
        this.gameService.resign(this.currentPartId, victoriousOpponent);
    }
    public reachedOutOfTime(player: 0 | 1): void {
        display(OnlineGameWrapperComponent.VERBOSE, 'OnlineGameWrapperComponent.reachedOutOfTime(' + player + ')');
        this.stopCountdownsFor(Player.of(player));
        if (player === this.observerRole) {
            // the player has run out of time, he'll notify his own defeat by time
            this.notifyTimeoutVictory(this.opponent.doc.pseudo);
        } else {
            if (!this.endGame) {
                // the other player has timed out
                this.notifyTimeoutVictory(this.userName);
                this.endGame = true;
            } else {
                display(true, 'time might be better handled in the future');
            }
        }
    }
    public acceptRematch(): void {
        if (this.observerRole === 0 || this.observerRole === 1) {
            const currentPartId: ICurrentPartId = {
                id: this.currentPartId,
                doc: this.currentPart.copy(),
            };
            this.gameService.acceptRematch(currentPartId);
        }
    }
    public proposeRematch(): void {
        if (this.observerRole === 0 || this.observerRole === 1) {
            this.gameService.proposeRematch(this.currentPartId, this.observerRole);
        }
    }
    public askTakeBack(): void {
        const player: Player = Player.of(this.observerRole);
        this.gameService.askTakeBack(this.currentPartId, player);
    }
    public acceptTakeBack(): void {
        const player: Player = Player.of(this.observerRole);
        this.gameService.acceptTakeBack(this.currentPartId, this.currentPart.copy(), player);
    }
    public refuseTakeBack(): void {
        const player: Player = Player.of(this.observerRole);
        this.gameService.refuseTakeBack(this.currentPartId, player);
    }
    private startCountDownFor(player: Player) {
        display(OnlineGameWrapperComponent.VERBOSE || true,
                'dans OnlineGameWrapperComponent.startCountDownFor(' + player.toString() +
                ') (turn ' + this.currentPart.turn + ')');
        this.hasUserPlayed[player.value] = true;
        if (player === Player.ZERO) {
            this.chronoZeroGlobal.start();
            this.chronoZeroLocal.start();
        } else {
            this.chronoOneGlobal.start();
            this.chronoOneLocal.start();
        }
    }
    private resumeCountDownFor(player: Player): void {
        display(OnlineGameWrapperComponent.VERBOSE || true,
                'dans OnlineGameWrapperComponent.resumeCountDownFor(' + player.toString() +
                ') (turn ' + this.currentPart.turn + ')');

        if (player === Player.ZERO) {
            this.chronoZeroGlobal.resume();
            this.chronoZeroLocal.setDuration(this.maximalMoveDuration);
            this.chronoZeroLocal.start();
        } else {
            this.chronoOneGlobal.resume();
            this.chronoOneLocal.setDuration(this.maximalMoveDuration);
            this.chronoOneLocal.start();
        }
    }
    public pauseCountDownsFor(player: Player): void {
        display(OnlineGameWrapperComponent.VERBOSE || true,
                'dans OnlineGameWrapperComponent.pauseCountDownFor(' + player.value +
                ') (turn ' + this.currentPart.turn + ')');
        if (player === Player.ZERO) {
            this.chronoZeroGlobal.pause();
            this.chronoZeroLocal.stop();
        } else {
            this.chronoOneGlobal.pause();
            this.chronoOneLocal.stop();
        }
    }
    private stopCountdownsFor(player: Player) {
        display(OnlineGameWrapperComponent.VERBOSE || true,
                'cdc::stopCountDownsFor(' + player.toString() +
                ') (turn ' + this.currentPart.copy().turn + ')');

        if (player === Player.ZERO) {
            this.chronoZeroGlobal.stop();
            this.chronoZeroLocal.stop();
        } else {
            this.chronoOneGlobal.stop();
            this.chronoOneLocal.stop();
        }
    }
    public ngOnDestroy(): void {
        if (this.routerEventsSub && this.routerEventsSub.unsubscribe) {
            this.routerEventsSub.unsubscribe();
        }
        if (this.userSub && this.userSub.unsubscribe) {
            this.userSub.unsubscribe();
        }
        if (this.gameStarted === true) {
            if (this.observedPartSubscription && this.observedPartSubscription.unsubscribe) {
                this.observedPartSubscription.unsubscribe();
            }
            if (this.opponentSubscription) {
                this.opponentSubscription();
            }
            this.gameService.stopObserving();
        }
    }
}
