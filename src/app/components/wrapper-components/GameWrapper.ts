import { Component, ComponentFactory, ComponentFactoryResolver, ComponentRef, Type, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractGameComponent } from '../game-components/abstract-game-component/AbstractGameComponent';
import { GameIncluderComponent } from '../game-components/game-includer/game-includer.component';
import { UserService } from '../../services/UserService';
import { AuthenticationService } from 'src/app/services/AuthenticationService';

import { Move } from '../../jscaip/Move';
import { GameState } from 'src/app/jscaip/GameState';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { assert, display } from 'src/app/utils/utils';
import { GameInfo } from '../normal-component/pick-game/pick-game.component';
import { Player } from 'src/app/jscaip/Player';

export class GameWrapperMessages {

    public static readonly NOT_YOUR_TURN: string = $localize`It is not your turn!`;

    public static readonly NO_CLONING_FEATURE: string = $localize`You cannot clone a game. This feature might be implemented later.`;
}

@Component({ template: '' })
export abstract class GameWrapper {

    public static VERBOSE: boolean = false;

    // component loading
    @ViewChild(GameIncluderComponent)
    public gameIncluder: GameIncluderComponent;

    public gameComponent: AbstractGameComponent<Move, GameState<unknown, unknown>>;

    public userName: string = this.authenticationService.getAuthenticatedUser() != null &&
                              this.authenticationService.getAuthenticatedUser().pseudo // TODO, clean that;

    public players: string[] = [null, null];

    public observerRole: number;

    public canPass: boolean;

    public endGame: boolean = false;

    constructor(protected componentFactoryResolver: ComponentFactoryResolver,
                protected actRoute: ActivatedRoute,
                public router: Router,
                protected userService: UserService,
                protected authenticationService: AuthenticationService)
    {
        display(GameWrapper.VERBOSE, 'GameWrapper.constructed: ' + (this.gameIncluder!=null));
    }
    public getMatchingComponent(compoString: string)
    : Type<AbstractGameComponent<Move, GameState<unknown, unknown>>>
    {
        display(GameWrapper.VERBOSE, 'GameWrapper.getMatchingComponent');
        const gameInfo: GameInfo = GameInfo.ALL_GAMES.find((gameInfo: GameInfo) => gameInfo.urlName === compoString);
        if (gameInfo == null) {
            throw new Error('Unknown Games are unwrappable');
        }
        return gameInfo.component;
    }
    protected afterGameIncluderViewInit(): void {
        display(GameWrapper.VERBOSE, 'GameWrapper.afterGameIncluderViewInit');

        this.createGameComponent();

        this.gameComponent.rules.setInitialBoard();
        // this.gameComponent.board = this.gameComponent.rules.node.gameState.getCopiedBoard();
    }
    protected createGameComponent(): void {
        display(GameWrapper.VERBOSE, 'GameWrapper.createGameComponent');
        assert(this.gameIncluder != null, 'GameIncluder should be present');

        const compoString: string = this.actRoute.snapshot.paramMap.get('compo');
        const component: Type<AbstractGameComponent<Move, GameState<unknown, unknown>>> =
            this.getMatchingComponent(compoString);
        const componentFactory: ComponentFactory<AbstractGameComponent<Move, GameState<unknown, unknown>>> =
            this.componentFactoryResolver.resolveComponentFactory(component);
        const componentRef: ComponentRef<AbstractGameComponent<Move, GameState<unknown, unknown>>> =
            this.gameIncluder.viewContainerRef.createComponent(componentFactory);
        this.gameComponent = <AbstractGameComponent<Move, GameState<unknown, unknown>>>componentRef.instance;
        // Shortent by T<S = Truc>

        this.gameComponent.chooseMove = this.receiveValidMove; // so that when the game component do a move
        // the game wrapper can then act accordingly to the chosen move.
        this.gameComponent.canUserPlay = this.onUserClick; // So that when the game component click
        // the game wrapper can act accordly
        this.gameComponent.isPlayerTurn = this.isPlayerTurn;
        this.gameComponent.cancelMoveOnWrapper = this.onCancelMove; // Mostly for interception by TutorialGameWrapper

        this.gameComponent.observerRole = this.observerRole;
        this.canPass = this.gameComponent.canPass;
    }
    public receiveValidMove: (m: Move, s: GameState<unknown, unknown>, s0: number, s1: number) => Promise<MGPValidation> =
    async(move: Move,
          state: GameState<unknown, unknown>,
          scorePlayerZero: number,
          scorePlayerOne: number): Promise<MGPValidation> =>
    {
        const LOCAL_VERBOSE: boolean = false;
        display(GameWrapper.VERBOSE || LOCAL_VERBOSE, {
            gameWrapper_receiveValidMove_AKA_chooseMove: {
                move,
                state,
                scorePlayerZero,
                scorePlayerOne,
            },
        });
        if (!this.isPlayerTurn()) {
            return MGPValidation.failure(GameWrapperMessages.NOT_YOUR_TURN);
        }
        if (this.endGame) {
            return MGPValidation.failure($localize`The game has ended.`);
        }
        const legality: LegalityStatus = this.gameComponent.rules.isLegal(move, state);
        if (legality.legal.isFailure()) {
            this.gameComponent.cancelMove(legality.legal.getReason());
            return legality.legal;
        }
        this.gameComponent.cancelMoveAttempt();
        await this.onLegalUserMove(move, scorePlayerZero, scorePlayerOne);
        display(GameWrapper.VERBOSE || LOCAL_VERBOSE, 'GameWrapper.receiveValidMove says: valid move legal');
        return MGPValidation.SUCCESS;
    }
    public abstract onLegalUserMove(move: Move, scorePlayerZero: number, scorePlayerOne: number): Promise<void>;

    public onUserClick: (elementName: string) => MGPValidation = (_elementName: string) => {
        // TODO: Not the same logic to use in Online and Local, make abstract
        if (this.observerRole === Player.NONE.value) {
            const message: string = GameWrapperMessages.NO_CLONING_FEATURE;
            return MGPValidation.failure(message);
        }
        if (this.isPlayerTurn()) {
            return MGPValidation.SUCCESS;
        } else {
            return MGPValidation.failure(GameWrapperMessages.NOT_YOUR_TURN);
        }
    }
    public onCancelMove(): void {
        // Non needed by default'
    }
    public isPlayerTurn: () => boolean = () => {
        if (this.observerRole === Player.NONE.value) {
            return false;
        }
        const turn: number = this.gameComponent.rules.node.gameState.turn;
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
            return this.players[indexPlayer] === this.userName ||
                   this.players[indexPlayer] === 'humain';
        } else {
            return true;
        }
    }
    get compo(): AbstractGameComponent<Move, GameState<unknown, unknown>> {
        return this.gameComponent;
    }
}
