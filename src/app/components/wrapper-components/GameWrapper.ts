import { Component, ComponentFactory, ComponentFactoryResolver, ComponentRef, Type, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameIncluderComponent } from '../game-components/game-includer/game-includer.component';
import { AuthenticationService } from 'src/app/services/AuthenticationService';
import { Move } from '../../jscaip/Move';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { assert, display, Utils } from 'src/app/utils/utils';
import { GameInfo } from '../normal-component/pick-game/pick-game.component';
import { Player } from 'src/app/jscaip/Player';
import { Localized } from 'src/app/utils/LocaleUtils';
import { AbstractGameComponent } from '../game-components/game-component/GameComponent';
import { GameState } from 'src/app/jscaip/GameState';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPOptional } from 'src/app/utils/MGPOptional';

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

    public players: MGPOptional<string>[] = [MGPOptional.empty(), MGPOptional.empty()];

    public observerRole: number;

    public canPass: boolean;

    public endGame: boolean = false;

    constructor(protected componentFactoryResolver: ComponentFactoryResolver,
                protected actRoute: ActivatedRoute,
                protected authenticationService: AuthenticationService) {
        display(GameWrapper.VERBOSE, 'GameWrapper.constructed: ' + (this.gameIncluder != null));
    }
    public getMatchingComponent(gameName: string) : Type<AbstractGameComponent> {
        display(GameWrapper.VERBOSE, 'GameWrapper.getMatchingComponent');
        const gameInfo: MGPOptional<GameInfo> =
            MGPOptional.ofNullable(GameInfo.ALL_GAMES().find((gameInfo: GameInfo) => gameInfo.urlName === gameName));
        assert(gameInfo.isPresent(), 'Unknown Games are unwrappable');
        return gameInfo.get().component;
    }
    protected afterGameIncluderViewInit(): void {
        display(GameWrapper.VERBOSE, 'GameWrapper.afterGameIncluderViewInit');
        this.createGameComponent();
        this.gameComponent.rules.setInitialBoard();
    }
    protected createGameComponent(): void {
        display(GameWrapper.VERBOSE, 'GameWrapper.createGameComponent');
        assert(this.gameIncluder != null, 'GameIncluder should be present');

        const compoString: string = Utils.getNonNullable(this.actRoute.snapshot.paramMap.get('compo'));
        const component: Type<AbstractGameComponent> = this.getMatchingComponent(compoString);
        const componentFactory: ComponentFactory<AbstractGameComponent> =
            this.componentFactoryResolver.resolveComponentFactory(component);
        const componentRef: ComponentRef<AbstractGameComponent> =
            this.gameIncluder.viewContainerRef.createComponent(componentFactory);
        this.gameComponent = componentRef.instance;

        this.gameComponent.chooseMove = // so that when the game component do a move
            (m: Move, s: GameState, scores?: [number, number]): Promise<MGPValidation> => {
                return this.receiveValidMove(m, s, scores);
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
                                  state: GameState,
                                  scores?: [number, number]): Promise<MGPValidation>
    {
        const LOCAL_VERBOSE: boolean = false;
        display(GameWrapper.VERBOSE || LOCAL_VERBOSE,
                { gameWrapper_receiveValidMove_AKA_chooseMove: { move, state, scores } });
        if (!this.isPlayerTurn()) {
            return MGPValidation.failure(GameWrapperMessages.NOT_YOUR_TURN());
        }
        if (this.endGame) {
            return MGPValidation.failure($localize`The game has ended.`);
        }
        const legality: MGPFallible<unknown> = this.gameComponent.rules.isLegal(move, state);
        if (legality.isFailure()) {
            this.gameComponent.cancelMove(legality.getReason());
            return MGPValidation.ofFallible(legality);
        }
        this.gameComponent.cancelMoveAttempt();
        await this.onLegalUserMove(move, scores);
        display(GameWrapper.VERBOSE || LOCAL_VERBOSE, 'GameWrapper.receiveValidMove says: valid move legal');
        return MGPValidation.SUCCESS;
    }
    public abstract onLegalUserMove(move: Move, scores?: [number, number]): Promise<void>;

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
    public onCancelMove(_reason?: string): void {
        // Not needed by default'
    }
    public isPlayerTurn(): boolean {
        if (this.observerRole === Player.NONE.value) {
            return false;
        }
        if (this.gameComponent == null) {
            // This can happen if called before the component has been set up
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
            areYouPlayer: (this.players[indexPlayer].equalsValue(username)),
            isThereAPlayer: this.players[indexPlayer],
        } });
        if (this.players[indexPlayer].isPresent()) {
            return this.players[indexPlayer].equalsValue(username);
        } else {
            return true;
        }
    }
    public abstract getPlayerName(): string

    public getBoardHighlight(): string[] {
        if (this.endGame) {
            return ['endgame-bg'];
        }
        if (this.isPlayerTurn()) {
            const turn: number = this.gameComponent.rules.node.gameState.turn;
            return ['player' + (turn % 2) + '-bg'];
        }
        return [];
    }
}
