import {ComponentFactory, ComponentFactoryResolver, ComponentRef, Type, ViewChild, ViewContainerRef } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AbstractGameComponent} from './AbstractGameComponent';
import {GameIncluderComponent} from './game-includer/game-includer.component';
import {UserService} from '../../services/user/UserService';

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
import { SiamComponent } from './siam/siam.component';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { SaharaComponent } from './sahara/sahara.component';

export abstract class GameWrapper {

    public static VERBOSE = true;

    // component loading
    @ViewChild(GameIncluderComponent, {static: false})
    public gameIncluder: GameIncluderComponent;

    public gameComponent: AbstractGameComponent<Move, GamePartSlice, LegalityStatus>;

    public userName: string = this.authenticationService.getAuthenticatedUser().pseudo;

    public players: string[] = [this.userName, this.userName];

    public observerRole: number;

    public canPass: boolean;

    public endGame: boolean = false;

    constructor(protected componentFactoryResolver: ComponentFactoryResolver,
                protected actRoute: ActivatedRoute,
                protected router: Router,
                protected userService: UserService,
                protected authenticationService: AuthenticationService,
                ) {
        if (GameWrapper.VERBOSE) {
            console.log('GameWrapper.constructed: ' + (this.gameIncluder!=null));
        }
    }
    public getMatchingComponent(compoString: string): Type<AbstractGameComponent<Move, GamePartSlice, LegalityStatus>> {
        if (GameWrapper.VERBOSE) {
            console.log('GameWrapper.getMatchingComponent: '+(this.gameIncluder!=null));
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
            case 'Sahara':
                return SaharaComponent;
            case 'Siam':
                return SiamComponent;
            case 'Tablut':
                return TablutComponent;
            default:
                throw new Error("Unknown Games are unwrappable");
        }
    }
    protected afterGameIncluderViewInit() {
        if (GameWrapper.VERBOSE) {
            console.log('GameWrapper.afterGameIncluderViewInit');
        }
        this.createGameComponent();
        // this.resetGameDatas();
        // should be some kind of session-scope

        this.gameComponent.rules.setInitialBoard();
        this.gameComponent.board = this.gameComponent.rules.node.gamePartSlice.getCopiedBoard();
    }
    protected createGameComponent() {
        if (GameWrapper.VERBOSE) console.log('GameWrapper.loadGameComponent: '+(this.gameIncluder!=null));

        const compoString: string = this.actRoute.snapshot.paramMap.get('compo');
        const component: Type<AbstractGameComponent<Move, GamePartSlice, LegalityStatus>>
            = this.getMatchingComponent(compoString);
        const componentFactory: ComponentFactory<AbstractGameComponent<Move, GamePartSlice, LegalityStatus>>
            = this.componentFactoryResolver.resolveComponentFactory(component);
        const componentRef: ComponentRef<AbstractGameComponent<Move, GamePartSlice, LegalityStatus>>
            = this.gameIncluder.viewContainerRef.createComponent(componentFactory);
        //      = this.viewContainerRef.createComponent(componentFactory);
        this.gameComponent = <AbstractGameComponent<Move, GamePartSlice, LegalityStatus>>componentRef.instance; // Shortent by T<S = Truc>
        this.gameComponent.chooseMove = this.receiveChildData; // so that when the game component do a move
        // the game wrapper can then act accordingly to the chosen move.
        this.gameComponent.observerRole = this.observerRole;
        this.canPass = this.gameComponent.canPass;
    }
    public receiveChildData = (move: Move, slice: GamePartSlice, scorePlayerZero: number, scorePlayerOne: number): boolean => {
        if (!this.isPlayerTurn()) {
            if (GameWrapper.VERBOSE) {
                console.log('GameWrapper.receiveChildData says: not your turn');
            }
            return false;
        }
        if (GameWrapper.VERBOSE) console.log("GameWrapper.receiveChildData about to ask node if endGame");
        if (this.gameComponent.rules.node.isEndGame()) {
            if (GameWrapper.VERBOSE) {
                console.log('GameWrapper.receiveChildData says: part is finished');
            }
            return false;
        }
        if (GameWrapper.VERBOSE) console.log("GameWrapper.receiveChildData says: about to call Rules.isLegal");
        if (!this.gameComponent.rules.isLegal(move, slice)) {
            if (GameWrapper.VERBOSE) {
                console.log('GameWrapper.receiveChildData says: move illegal');
            }
            return false;
        }
        if (GameWrapper.VERBOSE) {
            console.log('GameWrapper.receiveChildData says: board about to update');
        }
        const validMoveResult: boolean = this.gameComponent.rules.isLegal(move, slice).legal;
        if (!validMoveResult) {
            if (GameWrapper.VERBOSE) {
                console.log('GameWrapper.receiveChildData says: move is illegal, not going to transmit that');
            }
            return false;
        }
        const legalMoveSubmissionResult: boolean = this.onValidUserMove(move, scorePlayerZero, scorePlayerOne);
        if (GameWrapper.VERBOSE) console.log("GameWrapper.receiveChildData says: valid move result = " + legalMoveSubmissionResult);
        return legalMoveSubmissionResult;
    }
    public abstract onValidUserMove(move: Move, scorePlayerZero: number, scorePlayerOne: number): boolean;

    public isPlayerTurn() {
        const indexPlayer = this.gameComponent.rules.node.gamePartSlice.turn % 2;
        if (GameWrapper.VERBOSE) console.log("It is player "+ indexPlayer+ "'s turn ('"+this.players[indexPlayer]+"') and you are "+this.userName)
        return this.players[indexPlayer] === this.userName;
    }
}