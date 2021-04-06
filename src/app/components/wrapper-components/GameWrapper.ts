import { Component, ComponentFactory, ComponentFactoryResolver, ComponentRef, Type, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractGameComponent } from './AbstractGameComponent';
import { GameIncluderComponent } from '../game-components/game-includer/game-includer.component';
import { UserService } from '../../services/user/UserService';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';

import { Move } from '../../jscaip/Move';
import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';

import { AwaleComponent } from '../game-components/awale/awale.component';
import { CoerceoComponent } from '../game-components/coerceo/coerceo.component';
import { DvonnComponent } from '../game-components/dvonn/dvonn.component';
import { EncapsuleComponent } from '../game-components/encapsule/encapsule.component';
import { EpaminondasComponent } from '../game-components/epaminondas/epaminondas.component';
import { GipfComponent } from '../game-components/gipf/gipf.component';
import { GoComponent } from '../game-components/go/go.component';
import { KamisadoComponent } from '../game-components/kamisado/kamisado.component';
import { MinimaxTestingComponent } from '../game-components/minimax-testing/minimax-testing.component';
import { P4Component } from '../game-components/p4/p4.component';
import { PylosComponent } from '../game-components/pylos/pylos.component';
import { QuartoComponent } from '../game-components/quarto/quarto.component';
import { QuixoComponent } from '../game-components/quixo/quixo.component';
import { ReversiComponent } from '../game-components/reversi/reversi.component';
import { SaharaComponent } from '../game-components/sahara/sahara.component';
import { SiamComponent } from '../game-components/siam/siam.component';
import { SixComponent } from '../game-components/six/six.component';
import { TablutComponent } from '../game-components/tablut/tablut.component';

import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';
import { display } from 'src/app/utils/collection-lib/utils';

@Component({ template: '' })
export abstract class GameWrapper {
    public static VERBOSE: boolean = false;

    // component loading
    @ViewChild(GameIncluderComponent)
    public gameIncluder: GameIncluderComponent;

    public gameComponent: AbstractGameComponent<Move, GamePartSlice, LegalityStatus>;

    public userName: string = this.authenticationService.getAuthenticatedUser().pseudo;

    public players: string[] = [null, null];

    public observerRole: number; // TODO: change into Player

    public canPass: boolean;

    public endGame: boolean = false;

    constructor(protected componentFactoryResolver: ComponentFactoryResolver,
                protected actRoute: ActivatedRoute,
                protected router: Router,
                protected userService: UserService,
                protected authenticationService: AuthenticationService,
    ) {
        display(GameWrapper.VERBOSE, 'GameWrapper.constructed: ' + (this.gameIncluder!=null));
    }
    public getMatchingComponent(compoString: string): Type<AbstractGameComponent<Move, GamePartSlice, LegalityStatus>> {
        display(GameWrapper.VERBOSE, 'GameWrapper.getMatchingComponent');

        switch (compoString) {
            case 'Awale':
                return AwaleComponent;
            case 'Coerceo':
                return CoerceoComponent;
            case 'Dvonn':
                return DvonnComponent;
            case 'Encapsule':
                return EncapsuleComponent;
            case 'Epaminondas':
                return EpaminondasComponent;
            case 'Go':
                return GoComponent;
            case 'Gipf':
                return GipfComponent;
            case 'Kamisado':
                return KamisadoComponent;
            case 'MinimaxTesting':
                return MinimaxTestingComponent;
            case 'P4':
                return P4Component;
            case 'Pylos':
                return PylosComponent;
            case 'Quarto':
                return QuartoComponent;
            case 'Quixo':
                return QuixoComponent;
            case 'Reversi':
                return ReversiComponent;
            case 'Sahara':
                return SaharaComponent;
            case 'Siam':
                return SiamComponent;
            case 'Six':
                return SixComponent;
            case 'Tablut':
                return TablutComponent;
            default:
                throw new Error('Unknown Games are unwrappable');
        }
    }
    protected afterGameIncluderViewInit(): void {
        display(GameWrapper.VERBOSE, 'GameWrapper.afterGameIncluderViewInit');

        this.createGameComponent();

        this.gameComponent.rules.setInitialBoard();
        this.gameComponent.board = this.gameComponent.rules.node.gamePartSlice.getCopiedBoard();
    }
    protected createGameComponent(): void {
        display(GameWrapper.VERBOSE, 'GameWrapper.createGameComponent');
        display(GameWrapper.VERBOSE && this.gameIncluder == null, 'GameIncluder should be present');

        const compoString: string = this.actRoute.snapshot.paramMap.get('compo');
        const component: Type<AbstractGameComponent<Move, GamePartSlice, LegalityStatus>> =
            this.getMatchingComponent(compoString);
        const componentFactory: ComponentFactory<AbstractGameComponent<Move, GamePartSlice, LegalityStatus>> =
            this.componentFactoryResolver.resolveComponentFactory(component);
        const componentRef: ComponentRef<AbstractGameComponent<Move, GamePartSlice, LegalityStatus>> =
            this.gameIncluder.viewContainerRef.createComponent(componentFactory);
        this.gameComponent = <AbstractGameComponent<Move, GamePartSlice, LegalityStatus>>componentRef.instance;
        // Shortent by T<S = Truc>

        this.gameComponent.chooseMove = this.receiveValidMove; // so that when the game component do a move
        // the game wrapper can then act accordingly to the chosen move.
        this.gameComponent.canUserPlay = this.onUserClick; // So that when the game component click
        // the game wrapper can act accordly
        this.gameComponent.isPlayerTurn = this.isPlayerTurn();
        this.gameComponent.cancelMoveOnWrapper = this.onCancelMove; // Mostly for interception by DidacticialGameWrapper

        this.gameComponent.observerRole = this.observerRole;
        this.canPass = this.gameComponent.canPass;
    }
    public receiveValidMove: (m: Move, s: GamePartSlice, s0: number, s1: number) => Promise<MGPValidation> =
    async(
        move: Move,
        slice: GamePartSlice,
        scorePlayerZero: number,
        scorePlayerOne: number): Promise<MGPValidation> =>
    {
        const LOCAL_VERBOSE: boolean = false;
        display(GameWrapper.VERBOSE || LOCAL_VERBOSE, {
            gameWrapper_receiveValidMove_AKA_chooseMove: {
                move,
                slice,
                scorePlayerZero,
                scorePlayerOne,
            },
        });
        if (!this.isPlayerTurn()) {
            return MGPValidation.failure('It is not your turn.');
        }
        if (this.endGame) {
            return MGPValidation.failure('Game is finished.');
        }
        const legality: LegalityStatus = this.gameComponent.rules.isLegal(move, slice);
        if (legality.legal.isFailure()) {
            this.gameComponent.cancelMove(legality.legal.getReason());
            return legality.legal;
        }
        await this.onLegalUserMove(move, scorePlayerZero, scorePlayerOne);
        display(GameWrapper.VERBOSE || LOCAL_VERBOSE, 'GameWrapper.receiveValidMove says: valid move legal');
        return MGPValidation.SUCCESS;
    }
    public abstract onLegalUserMove(move: Move, scorePlayerZero: number, scorePlayerOne: number): Promise<void>;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public onUserClick: (elementName: string) => MGPValidation = (elementName: string) => {
        // TODO: Not the same logic to use in Online and Local, make abstract
        if (this.observerRole > 1) {
            const message: string = 'cloning feature will be added soon. Meanwhile, you can\'t click on the board';
            return MGPValidation.failure(message);
        }
        if (this.isPlayerTurn()) {
            return MGPValidation.SUCCESS;
        } else {
            return MGPValidation.failure('It is not your turn');
        }
    }
    public onCancelMove(): void {
        // Non needed by default'
    }
    public isPlayerTurn(): boolean {
        if (this.observerRole > 1) {
            return false;
        }
        const turn: number = this.gameComponent.rules.node.gamePartSlice.turn;
        const indexPlayer: number = turn % 2;
        display(GameWrapper.VERBOSE, { isPlayerTurn: {
            turn,
            players: this.players,
            username: this.userName,
            observer: this.observerRole,
            areYouPlayer: (this.players[indexPlayer] && this.players[indexPlayer] === this.userName),
            isThereAPlayer: this.players[indexPlayer],
        } });
        if (this.players[indexPlayer]) {
            return this.players[indexPlayer] === this.userName;
        } else {
            return true;
        }
    }
    get compo(): AbstractGameComponent<Move, GamePartSlice, LegalityStatus> {
        return this.gameComponent;
    }
}
