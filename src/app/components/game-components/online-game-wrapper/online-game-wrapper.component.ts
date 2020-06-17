import { Component, ComponentFactoryResolver, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { GameService } from 'src/app/services/game/GameService';
import { UserService } from 'src/app/services/user/UserService';
import { JoinerService } from 'src/app/services/joiner/JoinerService';

import { Move } from '../../../jscaip/Move';
import { ICurrentPart, ICurrentPartId, PICurrentPart } from '../../../domain/icurrentpart';
import { CountDownComponent } from '../../normal-component/count-down/count-down.component';
import { PartCreationComponent } from '../../normal-component/part-creation/part-creation.component';
import { IJoueurId, IJoueur } from '../../../domain/iuser';
import { MGPRequest } from '../../../domain/request';
import { GameWrapper } from '../GameWrapper';
import { FirebaseCollectionObserver } from 'src/app/dao/FirebaseCollectionObserver';
import { IJoiner } from 'src/app/domain/ijoiner';

@Component({
    selector: 'app-game-wrapper',
    templateUrl: './online-game-wrapper.component.html',
    styleUrls: ['./online-game-wrapper.component.css']
})
export class OnlineGameWrapperComponent extends GameWrapper implements OnInit, OnDestroy {

    public static VERBOSE: boolean = false;

    @ViewChild('partCreation', {static: false}) partCreation: PartCreationComponent;

    // GameWrapping's Template
    @ViewChild('chronoZeroGlobal', {static: false}) chronoZeroGlobal: CountDownComponent;
    @ViewChild('chronoOneGlobal', {static: false}) chronoOneGlobal: CountDownComponent;
    @ViewChild('chronoZeroLocal', {static: false}) chronoZeroLocal: CountDownComponent;
    @ViewChild('chronoOneLocal', {static: false}) chronoOneLocal: CountDownComponent;

    // link between GameWrapping's template and remote opponent
    currentPart: ICurrentPart;
    currentPartId: string;
    public gameStarted: boolean = false;
    opponent: IJoueurId = null;
    currentPlayer: string;

    rematchProposed: boolean = null;
    opponentProposedRematch: boolean = null;

    maximalMoveDuration: number; // TODO: rendre inutile, remplacé par l'instance d'ICurrentPartId
    totalPartDuration: number; // TODO: rendre inutile, remplacé par l'instance d'ICurrentPartId

    gameBeginningTime: number;

    protected userSub: Subscription;
    protected observedPartSubscription: Subscription;
    protected opponentSubscription: () => void;

    constructor(componentFactoryResolver: ComponentFactoryResolver,
                actRoute: ActivatedRoute,
                router: Router,
                userService: UserService,
                authenticationService: AuthenticationService,
                private gameService: GameService,
                private joinerService: JoinerService) { ///////////// TODO: see readJoiner
        super(componentFactoryResolver, actRoute, router, userService, authenticationService);
        if (OnlineGameWrapperComponent.VERBOSE) {
            console.log("OnlineGameWrapperComponent constructed");
        }
    }
    public ngOnInit() {
        if (OnlineGameWrapperComponent.VERBOSE) console.log('OnlineGameWrapperComponent.ngOnInit');

        this.currentPartId = this.actRoute.snapshot.paramMap.get('id');
        this.userSub = this.authenticationService.getJoueurObs()
            .subscribe(user => this.userName = user.pseudo);
    }
    public resetGameDatas() {
        if (OnlineGameWrapperComponent.VERBOSE) {
            console.log('OnlineGame.resetGameDatas');
        }
        this.players = null; // TODO: rendre inutile, remplacé par l'instance d'ICurrentPart

        this.gameStarted = false;
        this.endGame = false;
        this.opponent = null;

        this.canPass = null;
        this.rematchProposed = null;
        this.opponentProposedRematch = null;
        this.currentPartId = this.actRoute.snapshot.paramMap.get('id');
    }
    public startGame(iJoiner: IJoiner) {
        if (OnlineGameWrapperComponent.VERBOSE) console.log('OnlineGameWrapperComponent.startGame');

        if (iJoiner == null) throw new Error("Cannot start Game of empty joiner doc");

        if (this.gameStarted === true) {
            throw new Error("Should not start already started game");
        }
        this.gameStarted = true;
        setTimeout(() => {
            // the small waiting is there to make sur that the chronos are charged by view
            this.afterGameIncluderViewInit();
            this.startPart(); // NEWLY
        }, 1);
    }
    protected async startPart(): Promise<void> {
        if (OnlineGameWrapperComponent.VERBOSE) console.log("OnlineGameWrapperComponent.startPart");

        const iJoiner: IJoiner = await this.joinerService.readJoinerById(this.currentPartId);
        // TODO: make those data sent by partCreationComponent who already know this
        this.maximalMoveDuration = iJoiner.maximalMoveDuration * 1000;
        this.totalPartDuration = iJoiner.totalPartDuration * 1000;
        if (OnlineGameWrapperComponent.VERBOSE) {
            console.log('Starting game chrono called once');
        }
        this.startGameChronos(this.totalPartDuration, this.totalPartDuration, 0);
        // TODO: recharger une page dont les deux joueurs étaient partis
        this.gameService.startObserving(this.currentPartId, iPart => {
            this.onCurrentPartUpdate(iPart);
        });
        return Promise.resolve();
    }
    protected spotDifferenceBetweenUpdateAndCurrentData(update: ICurrentPart): PICurrentPart {
        const difference: PICurrentPart = {};
        if (update == null || this.currentPart == null) {
            if (OnlineGameWrapperComponent.VERBOSE) {
                console.log('update : ' + JSON.stringify(update));
                console.log('current: ' + JSON.stringify(this.currentPartId));
            }
            return {};
        }
        if (update.typeGame !== this.currentPart.typeGame) {
            difference.typeGame = update.typeGame;
        }
        if (update.playerZero !== this.currentPart.playerZero) {
            difference.playerZero = update.playerZero;
        }
        if (update.turn !== this.currentPart.turn) {
            difference.turn = update.turn;
        }
        if (update.playerOne !== this.currentPart.playerOne) {
            difference.playerOne = update.playerOne;
        }
        if (update.beginning !== this.currentPart.beginning) {
            difference.beginning = update.beginning;
        }
        if (update.result !== this.currentPart.result) {
            difference.result = update.result;
        }
        if (update.listMoves !== this.currentPart.listMoves) {
            difference.listMoves = update.listMoves;
        }
        if (update.request !== this.currentPart.request) {
            difference.request = update.request;
        }
        return difference;
    }
    protected onCurrentPartUpdate(updatedICurrentPart: ICurrentPartId) {
        if (OnlineGameWrapperComponent.VERBOSE) {
            console.log("OnlineGameWrapperComponent.onCurrentPartUpdate:");
            console.log({ before: this.currentPart, then: updatedICurrentPart });
        }
        const part: ICurrentPart = updatedICurrentPart.doc;
        if (OnlineGameWrapperComponent.VERBOSE) {
            console.log('part updated !');
            console.log({ difference: this.spotDifferenceBetweenUpdateAndCurrentData(part)});
        }
        this.currentPart = part;
        if (this.players == null || this.opponent == null) { // TODO: voir à supprimer ce sparadra
            if (OnlineGameWrapperComponent.VERBOSE) {
                console.log('part update : let\'s set players datas');
            }
            this.setPlayersDatas(part);
        }
        if (part.request != null) {
            this.onRequest(part.request);
        }
        // fonctionne pour l'instant avec la victoire normale, l'abandon, et le timeout !
        if ([0, 1, 3, 4].includes(part.result)) {
            this.endGame = true;
            this.stopCountdowns();
            if (part.result === 0) { // match nul
                if (OnlineGameWrapperComponent.VERBOSE) {
                    console.log('match nul means winner = ' + part.winner);
                }
                // this.winner = null;
            // } else { // victory
            //     this.winner = part.winner;
            }
        }
        const listMoves = part.listMoves;
        // this.turn = part.turn;

        const nbPlayedMoves = listMoves.length;
        let currentPartTurn: number;
        let updateIsMove = false;
        if (OnlineGameWrapperComponent.VERBOSE) {
            console.log('Before = part.turn = ' + part.turn);
            console.log('Before = this...gamePartSlice.turn = ' + this.gameComponent.rules.node.gamePartSlice.turn);
            console.log('Before = nbPlayedMoves = ' + nbPlayedMoves);
        }
        while (this.gameComponent.rules.node.gamePartSlice.turn < nbPlayedMoves) {
            currentPartTurn = this.gameComponent.rules.node.gamePartSlice.turn;
            const chosenMove = this.gameComponent.decodeMove(listMoves[currentPartTurn]);
            const correctDBMove: boolean = this.gameComponent.rules.choose(chosenMove);
            updateIsMove = true;
            if (!correctDBMove) {
                throw new Error('We received an incorrect db move !' + chosenMove + ' and ' + listMoves);
            }
            // NEWLY :
            if (this.gameComponent.rules.node.isEndGame()) {
                if (this.gameComponent.rules.node.ownValue === 0) {
                    this.notifyDraw();
                } else this.notifyVictory();
            }

        }
        this.gameComponent.updateBoard();
        this.currentPlayer = this.players[this.gameComponent.rules.node.gamePartSlice.turn % 2];
        if (OnlineGameWrapperComponent.VERBOSE) {
            console.log('After = part.turn = ' + part.turn);
            console.log('After = this...gamePartSlice.turn = ' + this.gameComponent.rules.node.gamePartSlice.turn);
            console.log('After = nbPlayedMoves = ' + nbPlayedMoves);
        }
        if ((!this.endGame) && updateIsMove) {
            if (OnlineGameWrapperComponent.VERBOSE) {
                console.log('cdc::new move turn:' + part.turn + ', ' + this.gameComponent.rules.node.gamePartSlice.turn + '==' + nbPlayedMoves);
            }
            const firstPlayedTurn = 0; // TODO: cette endroit pourrait être appellé à un mouvement qui n'est pas le 0
            // (reprise de partie après double perte de connection...)
            if (part.turn === (firstPlayedTurn + 1)) {
                this.startGameChronos(this.totalPartDuration, this.totalPartDuration, part.turn % 2 === 0 ? 0 : 1);
            } else {
                this.startCountdownFor(part.turn % 2 === 0 ? 0 : 1);
            }
        }
        if (!updateIsMove) {
            if (OnlineGameWrapperComponent.VERBOSE) {
                console.log('cette update n\'est pas un mouvement ! ');
            }
        }
    }
    public notifyDraw() {
        this.endGame = true;
        this.gameService.notifyDraw(this.currentPartId);
    }
    public notifyTimeoutVictory(victoriousPlayer: string) {
        this.endGame = true;
        this.currentPart.winner = victoriousPlayer; // oldly in this.winner var
        this.gameService.notifyTimeout(this.currentPartId, victoriousPlayer);
    }
    public notifyVictory() {
        // Previous line is wrong, assume that last player who notice the victory is the victorious, wrong as fuck
        let victoriousPlayer: string;
        if (this.gameComponent.rules.node.ownValue === Number.MAX_SAFE_INTEGER) {
            victoriousPlayer = this.players[1];
        } else if (this.gameComponent.rules.node.ownValue === Number.MIN_SAFE_INTEGER) {
            victoriousPlayer = this.players[0];
        } else {
            throw new Error('How the fuck did you notice victory?');
        }
        this.endGame = true;
        this.currentPart.winner = victoriousPlayer;
        this.gameService.notifyVictory(this.currentPartId, victoriousPlayer);
    }
    protected onRequest(request: MGPRequest) {
        switch (request.code) {
            case 6: // 0 propose un rematch
                this.rematchProposed = true;
                if (this.observerRole === 1) {
                    if (OnlineGameWrapperComponent.VERBOSE) {
                        console.log('ton adversaire te propose une revanche, 1');
                    }
                    this.opponentProposedRematch = true;
                }
                break;
            case 7: // 1 propose un rematch
                this.rematchProposed = true;
                if (this.observerRole === 0) {
                    if (OnlineGameWrapperComponent.VERBOSE) {
                        console.log('ton adversaire te propose une revanche, 0');
                    }
                    this.opponentProposedRematch = true;
                }
                break;
            case 8: // rematch accepted
                if (OnlineGameWrapperComponent.VERBOSE) {
                    console.log('Rematch accepted !');
                }
                this.router
                    .navigate(['/' + request.typeGame + '/' + request.partId])
                    .then(onSuccess => {
                        this.ngOnDestroy();
                        this.resetGameDatas();
                        this.startGame(null);
                    });
                break;
            default:
                alert('there was an error : ' + JSON.stringify(request) + ' has ' + request.code);
                break;
        }
    }
    public setPlayersDatas(updatedICurrentPart: ICurrentPart) {
        if (OnlineGameWrapperComponent.VERBOSE) {
            console.log('GameWrapper.setPlayersDatas(' + JSON.stringify(updatedICurrentPart) + ')');
        }
        this.players = [
            updatedICurrentPart.playerZero,
            updatedICurrentPart.playerOne];
        this.observerRole = 2;
        this.gameBeginningTime = updatedICurrentPart.beginning;
        let opponentName = '';
        if (this.players[0] === this.userName) {
            this.observerRole = 0;
            opponentName = this.players[1];
        } else if (this.players[1] === this.userName) {
            this.observerRole = 1;
            opponentName = this.players[0];
        }
        if (opponentName !== '') {
            const callback: FirebaseCollectionObserver<IJoueur> = new FirebaseCollectionObserver();
            callback.onDocumentCreated = (foundUser: IJoueurId[]) => {
                this.opponent = foundUser[0];
            };
            this.opponentSubscription =
                this.userService.observeUserByPseudo(opponentName, callback); // TODO: CHECK IF USEFULL OR NOT WITH NEW WAY TO DETECT DISCONNECTION
        }
    }
    public onValidUserMove(move: Move, scorePlayerZero: number, scorePlayerOne: number): boolean {
        this.updateDBBoard(move, scorePlayerZero, scorePlayerOne);
        return true;
    }
    public updateDBBoard(move: Move, scorePlayerZero: number, scorePlayerOne: number) {
        if (OnlineGameWrapperComponent.VERBOSE) {
            console.log('let\'s update db board');
        }
        const encodedMove: number = this.gameComponent.encodeMove(move);
        this.gameService.updateDBBoard(encodedMove, scorePlayerZero, scorePlayerOne, this.currentPartId);
    }
    public resign() {
        const victoriousOpponent = this.players[(this.observerRole + 1) % 2];
        this.gameService.resign(this.currentPartId, victoriousOpponent);
    }
    public reachedOutOfTime(player: 0 | 1) {
        if (OnlineGameWrapperComponent.VERBOSE) console.log("OnlineGameWrapperComponent.reachedOutOfTime(" + player + ")");
        if (player === this.observerRole) {
            // the player has run out of time, he'll notify his own defeat by time
            this.notifyTimeoutVictory(this.opponent.doc.pseudo);
        } else {
            // the other player has timeout
            if (!this.endGame) {
                this.notifyTimeoutVictory(this.userName);
                this.endGame = true;
            }
        }
    }
    public pass() {
        alert("Should not be there, call the coder ! Must be overrid");
        throw new Error("Method 'pass' must be overridden if used");
    }
    public acceptRematch() {
        if (this.observerRole === 0 || this.observerRole === 1) {
            const currentPartId: ICurrentPartId = {
                id: this.currentPartId,
                doc: this.currentPart
            };
            this.gameService.acceptRematch(currentPartId);
        }
    }
    public proposeRematch() {
        if (this.observerRole === 0 || this.observerRole === 1) {
            this.gameService.proposeRematch(this.currentPartId, this.observerRole);
        }
    }
    private startGameChronos(durationZero: number, durationOne: number, player: 0 | 1) {
        if (OnlineGameWrapperComponent.VERBOSE) {
            console.log('og:cdc:: first turn of ' + player);
        }
        if (player === 0) {
            this.chronoZeroGlobal.start(durationZero);
            this.chronoZeroLocal.start(this.maximalMoveDuration);
            this.chronoOneGlobal.pause(); // TODO : remove more intelligently
            this.chronoOneLocal.stop(); // that means with ifPreviousMoveHasBeenDone
        } else {
            this.chronoOneGlobal.start(durationOne);
            this.chronoOneLocal.start(this.maximalMoveDuration);
            this.chronoZeroGlobal.pause();
            this.chronoZeroLocal.stop();
        }
    }
    private startCountdownFor(player: 0 | 1) {
        if (OnlineGameWrapperComponent.VERBOSE) {
            console.log('og:cdc:: startCountdownFor ' + player);
        }
        if (player === 0) {
            this.chronoZeroGlobal.resume();
            this.chronoZeroLocal.start(this.maximalMoveDuration);
            this.chronoOneGlobal.pause();
            this.chronoOneLocal.stop();
        } else {
            this.chronoZeroGlobal.pause();
            this.chronoZeroLocal.stop();
            this.chronoOneGlobal.resume();
            this.chronoOneLocal.start(this.maximalMoveDuration);
        }
    }
    private stopCountdowns() {
        if (OnlineGameWrapperComponent.VERBOSE) {
            console.log('cdc::stop count downs');
        }
        this.chronoZeroGlobal.stop();
        this.chronoZeroLocal.stop();
        this.chronoOneGlobal.stop();
        this.chronoOneLocal.stop();
    }
    public ngOnDestroy() {
        if (this.userSub && this.userSub.unsubscribe) {
            this.userSub.unsubscribe();
        }
        if (this.gameStarted === true) {
            // console.log('vous quittez un composant d\'une partie : unSub Part');
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