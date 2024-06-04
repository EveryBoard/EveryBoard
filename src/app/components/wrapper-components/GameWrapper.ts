import { Component, ComponentRef, Type, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConnectedUserService } from 'src/app/services/ConnectedUserService';
import { Move } from '../../jscaip/Move';
import { Comparable, MGPFallible, MGPOptional, MGPValidation, Utils } from '@everyboard/lib';
import { GameInfo } from '../normal-component/pick-game/pick-game.component';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { Localized } from 'src/app/utils/LocaleUtils';
import { AbstractGameComponent, BaseWrapperComponent } from '../game-components/game-component/GameComponent';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { RulesConfig, RulesConfigUtils } from 'src/app/jscaip/RulesConfigUtil';
import { RulesConfigDescription } from './rules-configuration/RulesConfigDescription';

export class GameWrapperMessages {

    public static readonly NOT_YOUR_TURN: Localized = () => $localize`It is not your turn!`;

    public static readonly GAME_HAS_ENDED: Localized = () => $localize`This game has ended.`;

    public static NO_MATCHING_GAME(gameName: string): string {
        return $localize`This game (${gameName}) does not exist.`;
    }

}

@Component({ template: '' })
export abstract class GameWrapper<P extends Comparable> extends BaseWrapperComponent {

    // This holds the #board html element
    @ViewChild('board', { read: ViewContainerRef })
    public boardRef: ViewContainerRef | null = null;

    public gameComponent: AbstractGameComponent;

    public players: MGPOptional<P>[] = [MGPOptional.empty(), MGPOptional.empty()];

    /**
     * The role of the player, i.e., ZERO if we are the first player, ONE if we are the second player,
     * and NONE if we are observing
     */
    public role: PlayerOrNone = PlayerOrNone.NONE;

    public endGame: boolean = false;

    private isMoveAttemptOngoing: boolean = false;

    public Player: typeof Player = Player;

    public rulesConfigDescription: MGPOptional<RulesConfigDescription<RulesConfig>> = MGPOptional.empty();

    public constructor(activatedRoute: ActivatedRoute,
                       protected readonly connectedUserService: ConnectedUserService,
                       protected readonly router: Router,
                       protected readonly messageDisplayer: MessageDisplayer)
    {
        super(activatedRoute);
    }

    private getMatchingComponent(gameName: string): MGPOptional<Type<AbstractGameComponent>> {
        const optionalGameInfo: MGPOptional<GameInfo> =
            MGPOptional.ofNullable(GameInfo.ALL_GAMES().find((gameInfo: GameInfo) => gameInfo.urlName === gameName));
        return optionalGameInfo.map((gameInfo: GameInfo) => gameInfo.component);
    }

    /**
     * This method is to be called only after view init.
     * It will create the game component and initialize its node.
     * It returns true if successful, or false if this is not a valid game.
     */
    protected async createMatchingGameComponent(): Promise<boolean> {
        console.log('createMatching')
        const componentType: MGPOptional<Type<AbstractGameComponent>> =
            await this.getMatchingComponentAndNavigateOutIfAbsent();
        if (componentType.isPresent()) {
            console.log('creating matching game component')
            await this.createGameComponent(componentType.get());
            const config: MGPOptional<RulesConfig> = await this.getConfig();
            console.log('setting config to')
            console.log(config)
            this.gameComponent.config = config;
            this.gameComponent.node = this.gameComponent.rules.getInitialNode(config);
            await this.setRole(this.role);
            console.log('drawing')
            console.log('updating board')
            await this.gameComponent.updateBoard(false);
            console.log('redraw')
            this.gameComponent.redraw();
            return true;
        } else {
            return false;
        }
    }

    private async getMatchingComponentAndNavigateOutIfAbsent(): Promise<MGPOptional<Type<AbstractGameComponent>>> {
        const gameName: string = this.getGameName();
        const component: MGPOptional<Type<AbstractGameComponent>> = this.getMatchingComponent(gameName);
        if (component.isAbsent()) {
            await this.router.navigate(['/notFound', GameWrapperMessages.NO_MATCHING_GAME(gameName)], { skipLocationChange: true });
            return MGPOptional.empty();
        } else {
            return component;
        }
    }

    private async createGameComponent(component: Type<AbstractGameComponent>): Promise<void> {
        Utils.assert(this.boardRef != null, 'Board element should be present');

        console.log('creating game component')
        const componentRef: ComponentRef<AbstractGameComponent> =
            Utils.getNonNullable(this.boardRef).createComponent(component);
        this.gameComponent = componentRef.instance;

        console.log('binding stuff')
        // chooseMove is called by the game component when a move is done
        this.gameComponent.chooseMove = (m: Move): Promise<MGPValidation> => {
            // the game wrapper can then act accordingly to the chosen move.
            return this.receiveValidMove(m);
        };
        console.log('1')
        // canUserPlay is called upon a click by the user
        this.gameComponent.canUserPlay = (elementName: string): Promise<MGPValidation> => {
            return this.canUserPlay(elementName);
        };
        console.log('2')
        this.gameComponent.isPlayerTurn = (): boolean => {
            return this.isPlayerTurn();
        };
        console.log('3')
        // Mostly for interception by TutorialGameWrapper
        this.gameComponent.cancelMoveOnWrapper = (reason?: string): Promise<void> => {
            return this.onCancelMove(reason);
        };
        console.log('4')
    }

    public async setRole(role: PlayerOrNone): Promise<void> {
        this.role = role;
        if (role.isNone()) {
            this.gameComponent.setPointOfView(Player.ZERO);
        } else {
            this.gameComponent.setPointOfView(role);
        }
        await this.showCurrentState(false); // Trigger redrawing of the board (might need to be rotated 180°)
    }

    public async setInteractive(interactive: boolean, updateBoard: boolean = true): Promise<void> {
        const interactivityChanged: boolean = this.gameComponent.isInteractive() !== interactive;
        if (interactivityChanged) {
            this.gameComponent.setInteractive(interactive);
            if (updateBoard) {
                await this.gameComponent.updateBoard(false);
                this.gameComponent.redraw();
            }
        }
    }

    public async receiveValidMove(move: Move): Promise<MGPValidation> {
        const config: MGPOptional<RulesConfig> = await this.getConfig();
        const legality: MGPFallible<unknown> =
            this.gameComponent.rules.isLegal(move, this.gameComponent.node.gameState, config);
        if (legality.isFailure()) {
            await this.gameComponent.cancelMove(legality.getReason());
            return MGPValidation.ofFallible(legality);
        }
        this.gameComponent.cancelMoveAttempt();
        this.isMoveAttemptOngoing = false;
        await this.onLegalUserMove(move);
        return MGPValidation.SUCCESS;
    }

    public abstract onLegalUserMove(move: Move, scores?: [number, number]): Promise<void>;

    public async onCancelMove(_reason?: string): Promise<void> {
        this.isMoveAttemptOngoing = false;
    }

    public abstract getPlayer(): P;

    public async getConfig(): Promise<MGPOptional<RulesConfig>> {
        console.log('GW.getConfig')
        const gameName: string = this.getGameName();
        return RulesConfigUtils.getGameDefaultConfig(gameName);
    }

    public async canUserPlay(_clickedElementName: string): Promise<MGPValidation> {
        if (this.isPlayerTurn() === false) {
            return MGPValidation.failure(GameWrapperMessages.NOT_YOUR_TURN());
        }
        if (this.endGame) {
            return MGPValidation.failure(GameWrapperMessages.GAME_HAS_ENDED());
        }
        if (this.isMoveAttemptOngoing === false) {
            // It is the first click
            this.gameComponent.hideLastMove();
            this.isMoveAttemptOngoing = true;
        }
        return MGPValidation.SUCCESS;
    }

    public isPlayerTurn(): boolean {
        if (this.role.isNone()) {
            return false;
        }
        if (this.gameComponent == null) {
            // This can happen if called before the component has been set up
            return false;
        }
        const turn: number = this.gameComponent.getTurn();
        const indexPlayer: number = turn % 2;
        const player: P = this.getPlayer();
        if (this.players[indexPlayer].isPresent()) {
            return this.players[indexPlayer].equalsValue(player);
        } else {
            return true;
        }
    }

    public getBoardHighlight(): string[] {
        if (this.endGame) {
            return ['endgame-bg'];
        } else if (this.isPlayerTurn()) {
            const turn: number = this.gameComponent.getTurn();
            return ['player' + (turn % 2) + '-bg'];
        } else {
            return [];
        }
    }

    /**
     * Called when there is a need to put the current board to original state, meaning:
     *     1. ongoing move attempt must be canceled (cancelMoveAttempt)
     *     2. any previous move must be hidden (hideLastMove)
     *     3. after the board is changed, we now show the correct previous move (showLastMove)
     * @param triggerAnimation a boolean set to true if there is a need to trigger the animation of the last move
     */
    protected async showCurrentState(triggerAnimation: boolean): Promise<void> {
        this.gameComponent.cancelMoveAttempt();
        this.gameComponent.hideLastMove();
        if (this.gameComponent.node.previousMove.isPresent()) {
            await this.gameComponent.updateBoard(triggerAnimation);
            const move: Move = this.gameComponent.node.previousMove.get();
            const config: MGPOptional<RulesConfig> = await this.getConfig();
            await this.gameComponent.showLastMove(move, config);
            this.gameComponent.redraw();
        } else {
            // We have no previous move to animate
            await this.gameComponent.updateBoard(false);
            this.gameComponent.redraw();
        }
    }

    /**
     * Used when a new move is done:
     *     1. by user click, locally
     *     2. by opponent online
     *     3. by the AI
     * @param triggerAnimation a boolean set to true if there is a need to trigger the animation of the last move
     */
    protected async showNewMove(triggerAnimation: boolean): Promise<void> {
        await this.gameComponent.updateBoard(triggerAnimation);
        this.gameComponent.redraw();
        const lastMove: Move = this.gameComponent.node.previousMove.get();
        const config: MGPOptional<RulesConfig> = await this.getConfig();
        await this.gameComponent.showLastMove(lastMove, config);
        this.gameComponent.redraw();
    }

    public getRulesConfigDescription(): MGPOptional<RulesConfigDescription<RulesConfig>> {
        const gameName: string = this.getGameName();
        return this.getRulesConfigDescriptionByName(gameName);
    }

    private getRulesConfigDescriptionByName(gameName: string): MGPOptional<RulesConfigDescription<RulesConfig>> {
        const gameInfos: MGPOptional<GameInfo> = GameInfo.getByUrlName(gameName);
        if (gameInfos.isAbsent()) {
            return MGPOptional.empty();
        } else {
            return gameInfos.get().getRulesConfigDescription();
        }
    }
}
