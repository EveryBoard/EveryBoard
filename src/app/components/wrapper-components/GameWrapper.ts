import { Component, ComponentRef, Type, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConnectedUserService } from 'src/app/services/ConnectedUserService';
import { Move } from '../../jscaip/Move';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Utils } from 'src/app/utils/utils';
import { GameInfo } from '../normal-component/pick-game/pick-game.component';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { Localized } from 'src/app/utils/LocaleUtils';
import { AbstractGameComponent, BaseWrapperComponent } from '../game-components/game-component/GameComponent';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { Comparable } from 'src/app/utils/Comparable';
import { RulesConfig, RulesConfigUtils } from 'src/app/jscaip/RulesConfigUtil';
import { RulesConfigDescription } from './rules-configuration/RulesConfigDescription';

export class GameWrapperMessages {

    public static readonly NOT_YOUR_TURN: Localized = () => $localize`It is not your turn!`;

    public static readonly GAME_HAS_ENDED: Localized = () => $localize`This game has ended.`;

    public static readonly CANNOT_PLAY_AS_OBSERVER: Localized = () => $localize`You are an observer in this game, you cannot play.`;

    public static readonly MUST_ANSWER_REQUEST: Localized = () => $localize`You must answer your opponent's request.`;

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

    public Player: typeof Player = Player;

    public constructor(activatedRoute: ActivatedRoute,
                       protected readonly connectedUserService: ConnectedUserService,
                       protected readonly router: Router,
                       protected readonly messageDisplayer: MessageDisplayer)
    {
        super(activatedRoute);
    }

    private getMatchingComponent(gameName: string): MGPOptional<Type<AbstractGameComponent>> {
        const gameInfo: MGPOptional<GameInfo> =
            MGPOptional.ofNullable(GameInfo.ALL_GAMES().find((gameInfo: GameInfo) => gameInfo.urlName === gameName));
        return gameInfo.map((gameInfo: GameInfo) => gameInfo.component);
    }

    /**
     * This method is to be called only after view init.
     * It will create the game component and initialize its node.
     * It returns true if succesful, or false if this is not a valid game.
     */
    protected async createMatchingGameComponent(): Promise<boolean> {
        const componentType: MGPOptional<Type<AbstractGameComponent>> =
            await this.getMatchingComponentAndNavigateOutIfAbsent();
        if (componentType.isPresent()) {
            const rulesConfig: MGPOptional<RulesConfig> = await this.getConfig();
            await this.createGameComponent(componentType.get());
            this.gameComponent.node = this.gameComponent.rules.getInitialNode(rulesConfig);
            await this.gameComponent.updateBoard(false);
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

        const componentRef: ComponentRef<AbstractGameComponent> =
            Utils.getNonNullable(this.boardRef).createComponent(component);
        this.gameComponent = componentRef.instance;

        // chooseMove is called by the game component when a move is done
        this.gameComponent.chooseMove = (m: Move): Promise<MGPValidation> => {
            // the game wrapper can then act accordingly to the chosen move.
            return this.receiveValidMove(m);
        };
        // canUserPlay is called upon a click by the user
        this.gameComponent.canUserPlay = (elementName: string): Promise<MGPValidation> => {
            return this.canUserPlay(elementName);
        };
        this.gameComponent.isPlayerTurn = (): boolean => {
            return this.isPlayerTurn();
        };
        // Mostly for interception by TutorialGameWrapper
        this.gameComponent.cancelMoveOnWrapper = (reason?: string): Promise<void> => {
            return this.onCancelMove(reason);
        };
        console.log('gameWrapper.createGameComponent set', this.role.toString())
        await this.setRole(this.role);
    }

    public async setRole(role: PlayerOrNone): Promise<void> {
        console.log('le setRoleDeLaRolage', role.toString())
        this.role = role;
        if (role === PlayerOrNone.NONE) {
            this.gameComponent.setPointOfView(Player.ZERO);
        } else {
            this.gameComponent.setPointOfView(role as Player);
        }
        await this.updateBoardAndShowLastMove(false); // Trigger redrawing of the board (might need to be rotated 180°)
    }

    public async receiveValidMove(move: Move): Promise<MGPValidation> {
        const config: MGPOptional<RulesConfig> = this.gameComponent.node.config;
        // TODO FOR REVIEW: so here we rely on the NODE's config
        // instead of the one that the component fetched from the user then put inside the node
        // So actually the async MyWrapper.getConfig() is (at least for (O & L)GWCs)) awaiting the user's config
        // Then put it in the node, after that we could always fetch via wrapper.component.node ?
        const legality: MGPFallible<unknown> =
            this.gameComponent.rules.getLegality(move, this.gameComponent.node.gameState, config);
        if (legality.isFailure()) {
            await this.gameComponent.cancelMove(legality.getReason());
            return MGPValidation.ofFallible(legality);
        }
        this.gameComponent.cancelMoveAttempt();
        await this.onLegalUserMove(move);
        return MGPValidation.SUCCESS;
    }

    public abstract onLegalUserMove(move: Move, scores?: [number, number]): Promise<void>;

    public abstract onCancelMove(_reason?: string): Promise<void>;

    public abstract getPlayer(): P;

    public async getConfig(): Promise<MGPOptional<RulesConfig>> {
        const gameName: string = this.getGameName();
        return RulesConfigUtils.getGameDefaultConfig(gameName);
    }

    public async canUserPlay(_clickedElementName: string): Promise<MGPValidation> {
        if (this.role === PlayerOrNone.NONE) {
            const message: string = GameWrapperMessages.CANNOT_PLAY_AS_OBSERVER();
            return MGPValidation.failure(message);
        }
        if (this.isPlayerTurn() === false) {
            return MGPValidation.failure(GameWrapperMessages.NOT_YOUR_TURN());
        }
        if (this.endGame) {
            return MGPValidation.failure(GameWrapperMessages.GAME_HAS_ENDED());
        }
        return MGPValidation.SUCCESS;
    }

    public isPlayerTurn(): boolean {
        if (this.role === PlayerOrNone.NONE) {
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

    protected async updateBoardAndShowLastMove(triggerAnimation: boolean): Promise<void> {
        this.gameComponent.cancelMoveAttempt();
        this.gameComponent.hideLastMove();
        await this.gameComponent.updateBoard(triggerAnimation);
        if (this.gameComponent.node.previousMove.isPresent()) {
            const move: Move = this.gameComponent.node.previousMove.get();
            await this.gameComponent.showLastMove(move);
        }
    }

    public getRulesConfigDescription(): MGPOptional<RulesConfigDescription> {
        const gameName: string = this.getGameName();
        return this.getRulesConfigDescriptionByName(gameName);
    }

    public getRulesConfigDescriptionByName(gameName: string): MGPOptional<RulesConfigDescription> {
        const gameInfos: MGPOptional<GameInfo> = GameInfo.getByUrlName(gameName);
        if (gameInfos.isAbsent()) {
            return MGPOptional.empty();
        } else {
            return gameInfos.get().getRulesConfigDescription();
        }
    }
}
