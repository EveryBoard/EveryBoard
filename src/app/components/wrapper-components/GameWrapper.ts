import { Component, ComponentFactory, ComponentFactoryResolver, ComponentRef, Type, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameIncluderComponent } from '../game-components/game-includer/game-includer.component';
import { AuthenticationService } from 'src/app/services/AuthenticationService';

import { Move } from '../../jscaip/Move';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { assert, display } from 'src/app/utils/utils';
import { GameInfo } from '../normal-component/pick-game/pick-game.component';
import { Player } from 'src/app/jscaip/Player';
import { Localized } from 'src/app/utils/LocaleUtils';
import { AbstractGameComponent } from '../game-components/game-component/GameComponent';
import { AbstractGameState } from 'src/app/jscaip/GameState';

export class GameWrapperMessages {

    public static readonly NOT_YOUR_TURN: Localized = () => $localize`It is not your turn!`;

    public static readonly NO_CLONING_FEATURE: Localized = () => $localize`You cannot clone a game. This feature might be implemented later.`;
}

@Component({ template: '' })
export abstract class GameWrapper {

    public static VERBOSE: boolean = false;

    // component loading
    @ViewChild(GameIncluderComponent)
    public gameIncluder: GameIncluderComponent;

    public gameComponent: AbstractGameComponent;

    public players: string[] = [null, null];

    public observerRole: number;

    public canPass: boolean;

    public endGame: boolean = false;

    constructor(protected componentFactoryResolver: ComponentFactoryResolver,
                protected actRoute: ActivatedRoute,
                protected authenticationService: AuthenticationService) {
        display(GameWrapper.VERBOSE, 'GameWrapper.constructed: ' + (this.gameIncluder!=null));
    }
    public getMatchingComponent(compoString: string) : Type<AbstractGameComponent> {
        display(GameWrapper.VERBOSE, 'GameWrapper.getMatchingComponent');
        const gameInfo: GameInfo = GameInfo.ALL_GAMES().find((gameInfo: GameInfo) => gameInfo.urlName === compoString);
        assert(gameInfo != null, 'Unknown Games are unwrappable');
        return gameInfo.component;
    }
    protected afterGameIncluderViewInit(): void {
        display(GameWrapper.VERBOSE, 'GameWrapper.afterGameIncluderViewInit');

        this.createGameComponent();

        this.gameComponent.rules.setInitialBoard();
    }
    protected createGameComponent(): void {
        display(GameWrapper.VERBOSE, 'GameWrapper.createGameComponent');
        assert(this.gameIncluder != null, 'GameIncluder should be present');

        const compoString: string = this.actRoute.snapshot.paramMap.get('compo');
        const component: Type<AbstractGameComponent> = this.getMatchingComponent(compoString);
        const componentFactory: ComponentFactory<AbstractGameComponent> =
            this.componentFactoryResolver.resolveComponentFactory(component);
        const componentRef: ComponentRef<AbstractGameComponent> =
            this.gameIncluder.viewContainerRef.createComponent(componentFactory);
        this.gameComponent = <AbstractGameComponent>componentRef.instance;
        // Shortent by T<S = Truc>

        this.gameComponent.chooseMove = // so that when the game component do a move
            (m: Move, s: AbstractGameState, s0: number, s1: number): Promise<MGPValidation> => {
                return this.receiveValidMove(m, s, s0, s1);
            };
        // the game wrapper can then act accordingly to the chosen move.
        this.gameComponent.canUserPlay =
            // So that when the game component click
            (elementName: string): MGPValidation => {
                return this.onUserClick(elementName);
            };
        // the game wrapper can act accordly
        this.gameComponent.isPlayerTurn = (): boolean => {
            return this.isPlayerTurn();
        };
        this.gameComponent.cancelMoveOnWrapper =
            // Mostly for interception by TutorialGameWrapper
            (reason?: string): void => {
                this.onCancelMove(reason);
            };

        this.gameComponent.observerRole = this.observerRole;
        this.canPass = this.gameComponent.canPass;
    }
    public async receiveValidMove(move: Move,
                                  state: AbstractGameState,
                                  scorePlayerZero: number,
                                  scorePlayerOne: number): Promise<MGPValidation>
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
            return MGPValidation.failure(GameWrapperMessages.NOT_YOUR_TURN());
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

    public onUserClick(_elementName: string): MGPValidation {
        // TODO: Not the same logic to use in Online and Local, make abstract
        if (this.observerRole === Player.NONE.value) {
            const message: string = GameWrapperMessages.NO_CLONING_FEATURE();
            return MGPValidation.failure(message);
        }
        if (this.isPlayerTurn()) {
            return MGPValidation.SUCCESS;
        } else {
            return MGPValidation.failure(GameWrapperMessages.NOT_YOUR_TURN());
        }
    }
    public onCancelMove(_reason: string): void {
        // Not needed by default'
    }
    public isPlayerTurn(): boolean {
        if (this.observerRole === Player.NONE.value) {
            return false;
        }
        const turn: number = this.gameComponent.rules.node.gameState.turn;
        const indexPlayer: number = turn % 2;
        const username: string = this.getPlayerName();
        display(GameWrapper.VERBOSE, { isPlayerTurn: {
            turn,
            players: this.players,
            username,
            observer: this.observerRole,
            areYouPlayer: (this.players[indexPlayer] && this.players[indexPlayer] === username),
            isThereAPlayer: this.players[indexPlayer],
        } });
        if (this.players[indexPlayer]) {
            return this.players[indexPlayer] === username;
        } else {
            return true;
        }
    }
    public abstract getPlayerName(): string

}
