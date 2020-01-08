import {ComponentFactory, ComponentFactoryResolver, ComponentRef, Type, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AbstractGameComponent} from './AbstractGameComponent';
import {GameIncluderComponent} from './game-includer/game-includer.component';
import {UserService} from '../../services/UserService';

import {Move} from '../../jscaip/Move';
import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';

import {ReversiComponent} from './reversi/reversi.component';
import {TablutComponent} from './tablut/tablut.component';
import {QuartoComponent} from './quarto/quarto.component';
import {P4Component} from './p4/p4.component';
import {AwaleComponent} from './awale/awale.component';
import {GoComponent} from './go/go.component';
import { EncapsuleComponent } from './encapsule/encapsule.component';
import { MinimaxTestingComponent } from './minimax-testing/minimax-testing.component';

export abstract class GameWrapper {

    static VERBOSE = false;

    // component loading
    @ViewChild(GameIncluderComponent) gameCompo: GameIncluderComponent;
    protected componentInstance: AbstractGameComponent<Move, GamePartSlice, LegalityStatus>;

    userName: string = this.userService.getCurrentUser();

    players: string[] = [this.userName, this.userName];

    observerRole: number;

    canPass: boolean;

    constructor(protected componentFactoryResolver: ComponentFactoryResolver,
                protected actRoute: ActivatedRoute,
                protected router: Router,
                protected userService: UserService) {
        if (GameWrapper.VERBOSE) {
            console.log('GameWrapper.constructed');
        }
    }

    getMatchingComponent(compoString: string): Type<AbstractGameComponent<Move, GamePartSlice, LegalityStatus>> { // TODO figure out the difference with Type<any>
        if (GameWrapper.VERBOSE) {
            console.log('GameWrapper.getMatchingComponent');
        }
        switch (compoString) {
            case 'Awale':
                return AwaleComponent;
            case 'Encapsule':
                return EncapsuleComponent;
            case 'Go':
                return GoComponent;
            case 'MinimaxTesting':
                return MinimaxTestingComponent;
            case 'P4':
                return P4Component;
            case 'Quarto':
                return QuartoComponent;
            case 'Reversi':
                return ReversiComponent;
            case 'Tablut':
                return TablutComponent;
            default:
                this.router.navigate(['/error']);
                return null;
        }
    }

    protected afterGameComponentViewProbablyInit() {
        if (GameWrapper.VERBOSE) {
            console.log('GameWrapper.afterGameComponentViewProbablyInit');
        }
        this.loadGameComponent();
        // this.resetGameDatas();
        // should be some kind of session-scope

        this.componentInstance.rules.setInitialBoard();
        this.componentInstance.board = this.componentInstance.rules.node.gamePartSlice.getCopiedBoard();

    }

    protected loadGameComponent() {
        if (GameWrapper.VERBOSE) {
            console.log('Loading now game component');
            console.log('gameCompo: ', this.gameCompo);
        }
        const compoString: string = this.actRoute.snapshot.paramMap.get('compo');
        const component = this.getMatchingComponent(compoString);
        const componentFactory: ComponentFactory<any> = this.componentFactoryResolver.resolveComponentFactory(component);
        const componentRef: ComponentRef<any> = this.gameCompo.viewContainerRef.createComponent(componentFactory);
        this.componentInstance = <AbstractGameComponent<Move, GamePartSlice, LegalityStatus>>componentRef.instance;
        this.componentInstance.chooseMove = this.receiveChildData; // so that when the game component do a move
        // the game wrapper can then act accordingly to the chosen move.
        this.componentInstance.observerRole = this.observerRole; // TODO: fix, tell "undefined"
        this.canPass = this.componentInstance.canPass;
    }

    receiveChildData = (move: Move, slice: GamePartSlice, scorePlayerZero: number, scorePlayerOne: number): boolean => {
        if (!this.isPlayerTurn()) {
            if (GameWrapper.VERBOSE) {
                console.log('GameWrapper.receiveChildData says: not your turn'); // todo : réactive notification
            }
            return false;
        }
        if (GameWrapper.VERBOSE) console.log("GameWrapper.receiveChildData about to ask node if endGame");
        if (this.componentInstance.rules.node.isEndGame()) {
            if (GameWrapper.VERBOSE) {
                console.log('GameWrapper.receiveChildData says: part is finished');
            }
            return false;
        }
        if (GameWrapper.VERBOSE) console.log("GameWrapper.receiveChildData says: about to call Rules.isLegal");
        if (!this.componentInstance.rules.isLegal(move, slice)) {
            if (GameWrapper.VERBOSE) {
                console.log('GameWrapper.receiveChildData says: move illegal');
            }
            return false;
        }
        if (GameWrapper.VERBOSE) {
            console.log('GameWrapper.receiveChildData says: board about to update');
        }
        this.onValidUserMove(move, scorePlayerZero, scorePlayerOne);
        return true;
    }

    abstract onValidUserMove(move: Move, scorePlayerZero: number, scorePlayerOne: number);

    public isPlayerTurn() {
        const indexPlayer = this.componentInstance.rules.node.gamePartSlice.turn % 2;
        return this.players[indexPlayer] === this.userName;
    }
}