import { ActivatedRoute } from '@angular/router';

import { Move } from '../../../jscaip/Move';
import { SuperRules } from '../../../jscaip/Rules';
import { Component } from '@angular/core';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { Encoder } from 'src/app/utils/Encoder';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { TutorialStep } from '../../wrapper-components/tutorial-game-wrapper/TutorialStep';
import { GameState } from 'src/app/jscaip/GameState';
import { Debug, Utils } from 'src/app/utils/utils';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { ErrorLoggerService } from 'src/app/services/ErrorLoggerService';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { GameNode } from 'src/app/jscaip/AI/GameNode';
import { AI, AIOptions } from 'src/app/jscaip/AI/AI';
import { EmptyRulesConfig, RulesConfig } from 'src/app/jscaip/RulesConfigUtil';
import { GameInfo } from '../../normal-component/pick-game/pick-game.component';
import { Coord } from 'src/app/jscaip/Coord';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';

abstract class BaseComponent {

    /**
     * Gets the CSS class for a player color
     */
    public getPlayerClass(player: PlayerOrNone): string {
        switch (player) {
            case Player.ZERO: return 'player0-fill';
            case Player.ONE: return 'player1-fill';
            default:
                Utils.expectToBe(player, PlayerOrNone.NONE);
                return '';
        }
    }

}

/**
 * Define some methods that are useful to have in game components.
 * We can't define these in GameComponent itself, as they are required
 * by sub components which themselves are not GameComponent subclasses
 */
export abstract class BaseGameComponent extends BaseComponent {

    public SPACE_SIZE: number = 100;

    public readonly STROKE_WIDTH: number = 8;

    public readonly SMALL_STROKE_WIDTH: number = 2;

    // Make ArrayUtils available in game components
    public ArrayUtils: typeof ArrayUtils = ArrayUtils;

    public getSVGTranslation(x: number, y: number): string {
        return 'translate(' + x + ', ' + y + ')';
    }
}

export abstract class BaseWrapperComponent extends BaseComponent {

    public constructor(public readonly activatedRoute: ActivatedRoute) {
        super();
    }

    protected getGameName(): string {
        return Utils.getNonNullable(this.activatedRoute.snapshot.paramMap.get('compo'));
    }

}

/**
 * All method are to be implemented by the "final" GameComponent classes
 * Except chooseMove which must be set by the GameWrapper
 * (since OnlineGameWrapper and LocalGameWrapper will not give the same action to do when a move is done)
 */
@Component({
    template: '',
    styleUrls: ['./game-component.scss'],
})
@Debug.log
export abstract class GameComponent<R extends SuperRules<M, S, C, L>,
                                    M extends Move,
                                    S extends GameState,
                                    C extends RulesConfig = EmptyRulesConfig,
                                    L = void>
    extends BaseGameComponent
{
    public encoder: Encoder<M>;

    public Player: typeof Player = Player;

    public rules: R;

    public node: GameNode<M, S>;

    public config: MGPOptional<C> = MGPOptional.empty();

    public availableAIs: AI<M, S, AIOptions, C>[];

    public canPass: boolean = false;

    public scores: MGPOptional<PlayerNumberMap> = MGPOptional.empty();

    public imagesLocation: string = 'assets/images/';

    public hasAsymmetricBoard: boolean = false;

    // Will contain, once the wrapper change the userRole, the valid orientation (180° when you play Player.ONE)
    public rotation: string = '';

    public tutorial: TutorialStep[];

    public isPlayerTurn: () => boolean;

    public chooseMove: (move: M) => Promise<MGPValidation>;

    public canUserPlay: (element: string) => Promise<MGPValidation>;

    public cancelMoveOnWrapper: (reason?: string) => void;

    // This is where the player is seeing the board from.
    private pointOfView: Player = Player.ZERO;

    // This is true when the view is interactive, e.g., to display clickable pieces
    protected interactive: boolean = false;

    public animationOngoing: boolean = false;

    public constructor(public readonly messageDisplayer: MessageDisplayer) {
        super();
    }

    public getPointOfView(): Player {
        return this.pointOfView;
    }

    public setPointOfView(pointOfView: Player): void {
        this.pointOfView = pointOfView;
        if (this.hasAsymmetricBoard) {
            this.rotation = 'rotate(' + (pointOfView.getValue() * 180) + ')';
        }
    }

    public setInteractive(interactive: boolean): void {
        this.interactive = interactive;
    }

    public isInteractive(): boolean {
        return this.interactive;
    }

    public async cancelMove(reason?: string): Promise<MGPValidation> {
        this.cancelMoveAttempt();
        this.cancelMoveOnWrapper(reason);
        if (this.node.previousMove.isPresent()) {
            await this.showLastMove(this.node.previousMove.get(), this.getConfig());
        }
        if (reason == null) {
            return MGPValidation.SUCCESS;
        } else {
            this.messageDisplayer.gameMessage(reason);
            return MGPValidation.failure(reason);
        }
    }

    public cancelMoveAttempt(): void {
        // Override if need be
    }

    public abstract updateBoard(triggerAnimation: boolean): Promise<void>;

    public async pass(): Promise<MGPValidation> {
        const gameName: string = this.constructor.name;
        const error: string = `pass() called on a game that does not redefine it`;
        return ErrorLoggerService.logError('GameComponent', error, { gameName });
    }

    public getTurn(): number {
        return this.node.gameState.turn;
    }

    public getCurrentPlayer(): Player {
        return this.node.gameState.getCurrentPlayer();
    }

    public getCurrentOpponent(): Player {
        return this.node.gameState.getCurrentOpponent();
    }

    public getState(): S {
        return this.node.gameState;
    }

    public getPreviousState(): S {
        return this.node.parent.get().gameState;
    }

    public abstract showLastMove(move: M, config: MGPOptional<C>): Promise<void>;

    public abstract hideLastMove(): void;

    protected setRulesAndNode(urlName: string): void {
        const gameInfo: GameInfo = GameInfo.getByUrlName(urlName).get();
        const defaultConfig: MGPOptional<C> = gameInfo.getRulesConfig() as MGPOptional<C>;

        this.rules = gameInfo.rules as R;
        this.node = this.rules.getInitialNode(defaultConfig);
        this.tutorial = gameInfo.tutorial.tutorial;
    }

    protected getConfig(): MGPOptional<C> {
        return this.config;
    }

    /**
     * Gives the translation transform for coordinate x, y, based on SPACE_SIZE
     */
    public getTranslation(coord: Coord): string {
        return this.getTranslationXY(coord.x, coord.y);
    }

    public getTranslationXY(coordX: number, coordY: number): string {
        const svgX: number = coordX * this.SPACE_SIZE;
        const svgY: number = coordY * this.SPACE_SIZE;
        return `translate(${svgX} ${svgY})`;
    }

}

export abstract class AbstractGameComponent extends GameComponent<SuperRules<Move,
                                                                             GameState,
                                                                             RulesConfig,
                                                                             unknown>,
                                                                  Move,
                                                                  GameState,
                                                                  RulesConfig,
                                                                  unknown>
{
}
