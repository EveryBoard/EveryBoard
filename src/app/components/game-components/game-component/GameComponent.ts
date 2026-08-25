import {
    ChangeDetectorRef,
    computed,
    inject,
    signal,
    Signal,
    WritableSignal,
} from '@angular/core';

import { Encoder, MGPOptional, MGPValidation, Utils } from '@everyboard/lib';

import { AIConfig } from '../../../jscaip/AI/AIConfig';
import { GameNode } from '../../../jscaip/AI/GameNode';
import { Coord3D } from '../../../jscaip/Coord3D';
import { Move } from '../../../jscaip/Move';
import { Orthogonal } from '../../../jscaip/Orthogonal';
import { Player, PlayerOrNone } from '../../../jscaip/Player';
import { PlayerNumberMap } from '../../../jscaip/PlayerMap';
import { SuperRules } from '../../../jscaip/Rules';
import { EmptyRulesConfig, RulesConfig } from '../../../jscaip/RulesConfigUtil';
import { GameState } from '../../../jscaip/state/GameState';
import { MessageDisplayer } from '../../../services/MessageDisplayer';
import { Debug } from '../../../utils/Debug';
import { GameInfo } from '../../normal-component/pick-game/GameInfo';
import { TutorialStep } from '../../wrapper-components/tutorial-game-wrapper/TutorialStep';
import { ViewBox } from '../GameComponentUtils';
import { BaseGameComponent } from '../base-game-component/BaseGameComponent';

import { AnyFunction, CLICK_HANDLERS, ClickNamer, MoveInterceptor } from './ClickHandler';
import { ScoreName } from './ScoreName';


/**
 * All method are to be implemented by the "final" GameComponent classes
 * Except chooseMove which must be set by the GameWrapper
 * (since OnlineGameWrapper and LocalGameWrapper will not give the same action to do when a move is done)
 */
@Debug.log
export abstract class GameComponent<R extends SuperRules<M, S, C, L>,
                                    M extends Move,
                                    S extends GameState,
                                    C extends RulesConfig = EmptyRulesConfig,
                                    L = void>
    extends BaseGameComponent
{

    private readonly messageDisplayer: MessageDisplayer = inject(MessageDisplayer);

    protected readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

    public encoder: Encoder<M>;

    public Player: typeof Player = Player;

    public PlayerOrNone: typeof PlayerOrNone = PlayerOrNone;

    public Coord3D: typeof Coord3D = Coord3D;

    public rules: R;

    public node: GameNode<M, S>;

    protected config: C;

    public aiConfig: AIConfig<M, S, C> = {
        minimax: [],
        mcts: [],
    };

    public canPass: boolean = false;

    public scores: MGPOptional<PlayerNumberMap> = MGPOptional.empty();

    public imagesLocation: string = 'assets/images/';

    public hasAsymmetricBoard: boolean = false;

    // Will contain, once the wrapper change the userRole, the valid orientation (180° when you play Player.ONE)
    public rotation: string = '';

    public tutorial: TutorialStep[];

    public isPlayerTurn: () => boolean;

    /**
     * Called by the game component when the user creates a move
     */
    public chooseMove: (move: M) => Promise<MGPValidation>;

    public canUserPlay: (element: string) => Promise<MGPValidation>;

    public cancelMoveOnWrapper: (reason?: string) => void;

    // This is where the player is seeing the board from.
    private pointOfView: Player = Player.ZERO;

    // This is true when the view is interactive, e.g., to display clickable pieces
    protected interactive: boolean = false;

    public animationOngoing: boolean = false;

    public state: S;

    private readonly gameViewBoxRevision: WritableSignal<number> = signal(0);

    public readonly viewBox: Signal<ViewBox> = computed(() => {
        this.gameViewBoxRevision();
        return this.computeViewBox();
    });

    public readonly viewBoxString: Signal<string> = computed(() => this.viewBox().toSVGString());

    public constructor(urlName: string) {
        super();
        this.setRulesAndNode(urlName);
    }

    protected abstract computeViewBox(): ViewBox;

    public setClickInterceptor(interceptor: MoveInterceptor): void {
        const proto: {
            [key: string]: AnyFunction;
            [key: typeof CLICK_HANDLERS]: Map<string, ClickNamer>;
        } = Object.getPrototypeOf(this);
        const handlers: Map<string, ClickNamer> = proto[CLICK_HANDLERS] ?? new Map();
        const self: { [key: string]: AnyFunction } = this as unknown as { [key: string]: AnyFunction };
        for (const [key, moveMapper] of handlers) {
            self[key] = interceptor(
                proto[key].bind(this),
                moveMapper,
            );
        }
    }

    public hasScores(): boolean {
        return this.scores.isPresent();
    }

    public getScore(player: Player): number {
        return this.scores.get().get(player);
    }

    protected getScoreName(): ScoreName {
        // This can be redefined in games where we don't talk about points
        return ScoreName.POINTS;
    }

    public getScoreString(player: Player): string {
        return this.getScoreName().getString(this.getScore(player));
    }

    public getPointOfView(): Player {
        return this.pointOfView;
    }

    public setPointOfView(pointOfView: Player): void {
        this.pointOfView = pointOfView;
        if (this.hasAsymmetricBoard) {
            this.rotation = 'rotate(' + (pointOfView.getValue() * 180) + ')';
        }
        this.cdr.markForCheck();
    }

    public setInteractive(interactive: boolean): void {
        this.interactive = interactive;
        this.cdr.markForCheck();
    }

    public isInteractive(): boolean {
        return this.interactive;
    }

    /**
     * Put the view back where it was before move attempt.
     * Note: cancelMoveAttempt only hide the move attempt but does not show last move again
     * @param reason: the reason of the cancellation, this message will be toasted if present.
     */
    public async cancelMove(reason?: string): Promise<MGPValidation> {
        this.cancelMoveAttempt();
        this.cancelMoveOnWrapper(reason);
        if (this.node.previousMove.isPresent()) {
            await this.showLastMove(this.node.previousMove.get());
        }
        if (reason == null) {
            return MGPValidation.SUCCESS;
        } else {
            this.messageDisplayer.gameMessage(reason);
            return MGPValidation.failure(reason);
        }
    }

    /**
     * Hide the move attempt.
     * Does not show again the previous move.
     * If you need to put the component right where it was before move attempt: call cancelMove
     */
    public cancelMoveAttempt(): void {
        // Override if move takes more than one click.
    }

    public async updateBoardAndRedraw(triggerAnimation: boolean): Promise<void> {
        await this.updateBoard(triggerAnimation);
        this.refreshViewBox();
        this.cdr.detectChanges();
    }

    public async showLastMoveAndRedraw(): Promise<void> {
        const move: M = this.node.previousMove.get();
        await this.showLastMove(move);
        this.refreshViewBox();
        this.cdr.detectChanges();
    }

    protected refreshViewBox(): void {
        this.gameViewBoxRevision.update((revision: number) => revision + 1);
    }

    public abstract updateBoard(triggerAnimation: boolean): Promise<void>;

    public async pass(): Promise<MGPValidation> {
        const gameName: string = this.constructor.name;
        const error: string = `pass() called on a game that does not redefine it`;
        return Utils.logError('GameComponent', error, { gameName });
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
        Utils.assert(this.node.parent.isPresent(), 'getPreviousState called with no previous state');
        return this.node.parent.get().gameState;
    }

    protected abstract showLastMove(move: M): Promise<void>;

    public abstract hideLastMove(): void;

    private setRulesAndNode(urlName: string): void {
        const gameInfo: GameInfo = GameInfo.getByUrlName(urlName).get();
        const defaultConfig: C = gameInfo.getRulesConfig() as C;

        this.rules = gameInfo.rules as R;
        this.node = this.rules.getInitialNode(defaultConfig);
        this.tutorial = gameInfo.tutorial.tutorial;
    }

    public getConfig(): C {
        return this.config;
    }

    public setConfig(config: C): void {
        this.config = config;
        this.cdr.markForCheck();
    }

    public getArrowTransform(boardWidth: number, boardHeight: number, orthogonal: Orthogonal): string {
        // The triangle that forms the arrow head will be wrapped inside a square
        // The board will be considered here as a 3x3 on which we place the triangle in (tx, ty)
        let tx: number;
        let ty: number;
        switch (orthogonal) {
            case Orthogonal.UP:
                tx = 1;
                ty = 0;
                break;
            case Orthogonal.DOWN:
                tx = 1;
                ty = 2;
                break;
            case Orthogonal.LEFT:
                tx = 0;
                ty = 1;
                break;
            default:
                Utils.expectToBe(orthogonal, Orthogonal.RIGHT);
                tx = 2;
                ty = 1;
                break;
        }
        const scale: string = `scale( ${ boardWidth / 300} ${ boardHeight / 300 } )`;
        const realX: number = tx * 100;
        const realY: number = ty * 100;
        const translation: string = this.getSVGTranslation(realX, realY);
        const angle: number = orthogonal.getAngle();
        const rotation: string = 'rotate(' + angle + ' 50 50)';
        return [scale, translation, rotation].join(' ');
    }

}
