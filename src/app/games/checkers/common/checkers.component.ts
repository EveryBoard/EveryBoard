import { computed, signal, Signal, WritableSignal } from '@angular/core';

import { MGPOptional, MGPValidation, Set, Utils } from '@everyboard/lib';

import { ViewBox } from '../../../components/game-components/GameComponentUtils';
import { ClickHandler } from '../../../components/game-components/game-component/ClickHandler';
import { ScoreName } from '../../../components/game-components/game-component/ScoreName';
import { ModeConfig } from '../../../components/game-components/parallelogram-game-component/ModeConfig';
import { ParallelogramGameComponent } from '../../../components/game-components/parallelogram-game-component/ParallelogramGameComponent';
import { Coord } from '../../../jscaip/Coord';
import { Player } from '../../../jscaip/Player';
import { RulesFailure } from '../../../jscaip/RulesFailure';

import { AbstractCheckersRules, CheckersConfig } from './AbstractCheckersRules';
import { CheckersControlHeuristic } from './CheckersControlHeuristic';
import { CheckersControlPlusDominationHeuristic } from './CheckersControlPlusDominationHeuristic';
import { CheckersFailure } from './CheckersFailure';
import { CheckersMove } from './CheckersMove';
import { CheckersMoveGenerator } from './CheckersMoveGenerator';
import { CheckersScoreHeuristic } from './CheckersScoreHeuristic';
import { CheckersPiece, CheckersStack, CheckersState } from './CheckersState';

export abstract class CheckersComponent<R extends AbstractCheckersRules>
    extends ParallelogramGameComponent<R,
                                       CheckersMove,
                                       CheckersState,
                                       CheckersStack,
                                       CheckersConfig>
{
    public readonly THICKNESS: number = 40;
    public readonly mode: Signal<ModeConfig> = signal({
        horizontalWidthRatio: 1.2,
        offsetRatio: 0.4,
        pieceHeightRatio: 1,
        parallelogramHeight: 100,
    });

    public readonly constructedState: WritableSignal<MGPOptional<CheckersState>> =
        signal(MGPOptional.empty());

    private readonly boardSize: Signal<Coord> = computed(() => {
        const state: CheckersState = this.constructedState().get();
        return new Coord(state.getWidth(), state.getHeight());
    });

    public readonly basicWidth: Signal<number> = computed(() =>
        this.boardSize().x * this.mode().parallelogramHeight,
    );

    public readonly basicHeight: Signal<number> = computed(() =>
        this.boardSize().y * this.mode().parallelogramHeight,
    );

    private currentMoveClicks: Coord[] = [];
    private lastCaptures: Coord[] = [];
    private lastMoved: Coord[] = [];
    public possibleClicks: Set<Coord> = new Set();
    private selectedStack: MGPOptional<Coord> = MGPOptional.empty();
    private capturedCoords: Coord[] = []; // Only the coords capture by active player during this turn
    private flownOverCoords: Coord[] = []; // Coord that where flown over during ongoing turn
    private legalMoves: CheckersMove[] = [];
    protected moveGenerator: CheckersMoveGenerator = new CheckersMoveGenerator(this.rules);

    protected override computeViewBox(): ViewBox {
        const h: number = this.boardSize().y;
        const boardOffset: number = h * this.mode().offsetRatio * this.mode().parallelogramHeight;
        const width: number = (this.basicWidth() * this.mode().horizontalWidthRatio) + boardOffset + this.STROKE_WIDTH;
        const height: number = this.basicHeight() + this.THICKNESS + this.STROKE_WIDTH + this.SPACE_SIZE;
        return new ViewBox(-this.STROKE_WIDTH / 2, -this.SPACE_SIZE, width, height);
    }

    public override setRulesAndNode(urlName: string): void {
        super.setRulesAndNode(urlName);
        this.aiConfig = {
            minimax: [
                {
                    id: 'Score',
                    name: $localize`Score`,
                    heuristic: (): CheckersScoreHeuristic => new CheckersScoreHeuristic(),
                    moveGenerator: (): CheckersMoveGenerator => this.moveGenerator,
                },
                {
                    id: 'Control and Domination',
                    name: $localize`Control and Domination`,
                    heuristic: (): CheckersControlPlusDominationHeuristic => {
                        return new CheckersControlPlusDominationHeuristic(this.rules);
                    },
                    moveGenerator: (): CheckersMoveGenerator => this.moveGenerator,
                },
                {
                    id: 'Control',
                    name: $localize`Control`,
                    heuristic: (): CheckersControlHeuristic => new CheckersControlHeuristic(this.rules),
                    moveGenerator: (): CheckersMoveGenerator => this.moveGenerator,
                },
            ],
            mcts: [{
                id: 'default',
                name: $localize`MCTS`,
                moveGenerator: (): CheckersMoveGenerator => this.moveGenerator,
            }],
        };
        this.encoder = CheckersMove.encoder;
        this.hasAsymmetricBoard = true;
    }

    private setConstructedState(state: CheckersState): void {
        this.constructedState.set(MGPOptional.of(state));
    }

    protected override getScoreName(): ScoreName {
        if (this.config.canStackPieces) {
            return ScoreName.STACKS_UNDER_CONTROL;
        } else {
            return ScoreName.PIECES_UNDER_CONTROL;
        }
    }

    public override async updateBoard(_triggerAnimation: boolean): Promise<void> {
        this.setConstructedState(this.getState());
        this.legalMoves = this.moveGenerator.getListMoves(this.node, this.config);
        this.scores = MGPOptional.of(this.constructedState().get().getScores());
        this.showPossibleClicks();
    }

    public getSquareClass(x: number, y: number): string[] {
        const coord: Coord = new Coord(x, y);
        const classes: string[] = [];
        if (this.capturedCoords.concat(this.lastCaptures).some((c: Coord) => c.equals(coord))) {
            classes.push('captured-fill');
        }
        const flownOverCoords: Coord[] = this.currentMoveClicks.concat(this.lastMoved.concat(this.flownOverCoords));
        if (flownOverCoords.some((c: Coord) => c.equals(coord))) {
            classes.push('moved-fill');
        }
        return classes;
    }

    public getPieceClasses(x: number, y: number, z: number): string[] {
        const coord: Coord = new Coord(x, y);
        const square: CheckersStack = this.constructedState().get().getPieceAt(coord);
        const max: number = square.getStackSize() - 1;
        const piece: CheckersPiece = square.get(max - z);
        const classes: string[] = [this.getPlayerClass(piece.player)];
        if (this.selectedStack.equalsValue(coord)) {
            classes.push('selected-stroke');
        }
        return classes;
    }

    public isPiecePromoted(x: number, y: number, z: number): boolean {
        const coord: Coord = new Coord(x, y);
        const square: CheckersStack = this.constructedState().get().getPieceAt(coord);
        const max: number = square.getStackSize() - 1;
        const piece: CheckersPiece = square.get(max - z);
        return piece.isPromoted;
    }

    protected override async showLastMove(move: CheckersMove): Promise<void> {
        this.lastCaptures = [];
        this.lastMoved = [];
        for (let i: number = 0; i < move.coords.length - 1; i++) {
            const start: Coord = move.coords[i];
            const end: Coord = move.coords[i + 1];
            this.lastMoved.push(start);
            for (const coord of start.getCoordsToward(end)) {
                const isCapture: boolean = move.isStep === false &&
                    this.getPreviousState().getPieceAt(coord).isOccupied();
                if (isCapture) {
                    this.lastCaptures.push(coord);
                } else {
                    this.lastMoved.push(coord);
                }
            }
        }
        this.lastMoved.push(move.getEndingCoord());
    }

    private showPossibleClicks(): void {
        this.possibleClicks = new Set();
        if (this.interactive) {
            for (const validMove of this.legalMoves) {
                const numberOfClicks: number = this.currentMoveClicks.length;
                if (numberOfClicks < validMove.coords.length) {
                    const possibleCoord: Coord = validMove.coords[numberOfClicks];
                    if (CheckersMove.getRelation(this.currentMoveClicks, validMove.coords) === 'PREFIX') {
                        this.possibleClicks = this.possibleClicks.addElement(possibleCoord);
                    }
                }
            }
        }
    }

    public override hideLastMove(): void {
        this.lastCaptures = [];
        this.lastMoved = [];
    }

    @ClickHandler((x: number, y: number) => `#coord-${ x }-${ y }`)
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clickedCoord: Coord = new Coord(x, y);
        const clickedSpace: CheckersStack = this.constructedState().get().getPieceAt(clickedCoord);
        const opponent: Player = this.constructedState().get().getCurrentOpponent();
        if (clickedSpace.isCommandedBy(opponent)) {
            return this.cancelMove(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT());
        }
        if (this.currentMoveClicks.length === 0) {
            return this.trySelectingPiece(clickedCoord);
        } else {
            return this.moveClick(clickedCoord);
        }
    }

    public override cancelMoveAttempt(): void {
        this.setConstructedState(this.getState());
        this.currentMoveClicks = [];
        this.capturedCoords = [];
        this.flownOverCoords = [];
        this.selectedStack = MGPOptional.empty();
        this.showPossibleClicks();
    }

    private async moveClick(clicked: Coord): Promise<MGPValidation> {
        const start: Coord = this.currentMoveClicks[0];
        if (clicked.equals(start) && this.possibleClicks.contains(clicked) === false) {
            return this.cancelMove();
        }
        const clickedSpace: CheckersStack = this.constructedState().get().getPieceAt(clicked);
        const player: Player = this.constructedState().get().getCurrentPlayer();
        if (clickedSpace.isCommandedBy(player)) {
            this.cancelMoveAttempt();
            return this.trySelectingPiece(clicked);
        }
        if (this.possibleClicks.contains(clicked) === false) {
            return this.cancelMove(this.getClickFailureReason(clicked));
        }

        const lastCoord: Coord = this.currentMoveClicks[this.currentMoveClicks.length - 1];
        const steppedOver: Coord[] = lastCoord.getCoordsToward(clicked);
        for (const coord of steppedOver) {
            if (this.constructedState().get().getPieceAt(coord).isOccupied()) {
                this.capturedCoords.push(coord);
            } else {
                this.flownOverCoords.push(coord);
            }
        }

        this.currentMoveClicks.push(clicked);
        const matchingMove: MGPOptional<CheckersMove> = this.getMatchingLegalMove();
        if (matchingMove.isPresent()) {
            return this.chooseMove(matchingMove.get());
        } else {
            this.showPossibleClicks();
            this.applyPartialCapture();
            return MGPValidation.SUCCESS;
        }
    }

    private getClickFailureReason(clicked: Coord): string {
        const lastSegmentStart: Coord = this.currentMoveClicks[this.currentMoveClicks.length - 1];
        const stack: CheckersStack = this.constructedState().get().getPieceAt(lastSegmentStart);
        const isSimpleJump: boolean = this.currentMoveClicks.length === 1;
        const stateWithoutStarting: CheckersState = this.getState().remove(this.currentMoveClicks[0]);
        const validation: MGPValidation = this.rules.getSubMoveValidity(
            stack, isSimpleJump, lastSegmentStart, clicked, stateWithoutStarting, this.getConfig(),
        );
        if (validation.isFailure()) {
            return validation.getReason();
        }
        const attemptedMove: CheckersMove = this.getMoveAttemptEndingAt(clicked);
        const moveValidity: MGPValidation = this.rules.isLegal(attemptedMove, this.getState(), this.getConfig());
        Utils.assert(moveValidity.isFailure(), 'A move absent from possibleClicks should be illegal');
        return moveValidity.getReason();
    }

    private getMoveAttemptEndingAt(clicked: Coord): CheckersMove {
        const clickedCoords: Coord[] = this.currentMoveClicks.concat(clicked);
        if (clickedCoords.length === 2 && this.doesMoveAttemptCapture(clicked) === false) {
            return CheckersMove.fromStep(clickedCoords[0], clickedCoords[1]);
        } else {
            return CheckersMove.fromCapture(clickedCoords);
        }
    }

    private doesMoveAttemptCapture(clicked: Coord): boolean {
        const start: Coord = this.currentMoveClicks[0];
        const steppedOver: Coord[] = start.getCoordsToward(clicked);
        return steppedOver.some((coord: Coord) => this.getState().getPieceAt(coord).isOccupied());
    }

    private getMatchingLegalMove(): MGPOptional<CheckersMove> {
        const currentMove: CheckersMove = CheckersMove.fromCapture(this.currentMoveClicks);
        for (const move of this.legalMoves) {
            if (move.equals(currentMove)) {
                return MGPOptional.of(move);
            }
        }
        return MGPOptional.empty();
    }

    private applyPartialCapture(): void {
        const currentMove: CheckersMove = CheckersMove.fromCapture(this.currentMoveClicks);
        this.setConstructedState(this.rules.applyMove(currentMove, this.getState(), this.getConfig()));
    }

    private async trySelectingPiece(clicked: Coord): Promise<MGPValidation> {
        const clickedSpace: CheckersStack = this.constructedState().get().getPieceAt(clicked);
        if (clickedSpace.isEmpty()) {
            return this.cancelMove(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY());
        } else {
            return this.selectPiece(clicked);
        }
    }

    private async selectPiece(coord: Coord): Promise<MGPValidation> {
        this.selectedStack = MGPOptional.of(coord);
        if (this.legalMoves.some((move: CheckersMove) => move.getStartingCoord().equals(coord))) {
            this.currentMoveClicks = [coord];
            this.showPossibleClicks();
            return MGPValidation.SUCCESS;
        } else {
            return this.cancelMove(CheckersFailure.THIS_PIECE_CANNOT_MOVE());
        }
    }

    public getTranslationAtXYZ(x: number, y: number, z: number): string {
        const adaptedCoord: Coord = this.adaptXY(x, y);
        const coordTransform: Coord = this.getCoordTranslation(adaptedCoord.x, adaptedCoord.y, z, this.mode());
        return this.getSVGTranslationAt(coordTransform);
    }

    private adaptXY(x: number, y: number): Coord {
        if (this.getPointOfView() === Player.ONE) {
            const maxX: number = this.getState().getWidth() - 1;
            const maxY: number = this.getState().getHeight() - 1;
            return new Coord(maxX - x, maxY - y);
        } else {
            return new Coord(x, y);
        }
    }

    public readonly parallelogramPoints: Signal<string> = computed(() => {
        return this.getParallelogramCoords(this.mode())
            .map((coord: Coord) => coord.x + ', ' + coord.y)
            .join(' ');
    });

    private readonly parallelogramCenter: Signal<Coord> = computed(() => {
        const coords: Coord[] = this.getParallelogramCoords(this.mode());
        return this.getParallelogramCenterOf(coords[0], coords[1], coords[2], coords[3]);
    });

    /**
     * @returns the center of the parallelogram delineated by four points, @param a, @param b, @param c, and @param d
     */
    private getParallelogramCenterOf(a: Coord, b: Coord, c: Coord, d: Coord): Coord {
        const maxX: number = Math.max(a.x, b.x, c.x, d.x);
        const maxY: number = Math.max(a.y, b.y, c.y, d.y);
        const minX: number = Math.min(a.x, b.x, c.x, d.x);
        const minY: number = Math.min(a.y, b.y, c.y, d.y);
        const x: number = (maxX - minX) / 2;
        const y: number = (maxY - minY) / 2;
        return new Coord(x, y);
    }

    public readonly rightEdge: Signal<string> = computed(() => {
        const width: number = this.basicWidth() * this.mode().horizontalWidthRatio;
        const offset: number = this.basicHeight() * this.mode().offsetRatio;
        const x0: number = offset + width;
        const y0: number = 0;
        const x1: number = offset + width;
        const y1: number = this.THICKNESS;
        const x2: number = width;
        const y2: number = this.basicHeight() + this.THICKNESS;
        const x3: number = width;
        const y3: number = this.basicHeight();
        return [x0, y0, x1, y1, x2, y2, x3, y3].join(' ');
    });

    public getPieceTranslation(z: number): string {
        // We want the piece to be in the center of the parallelogram, here are its coords
        const cy: number = this.parallelogramCenter().y;
        // We want to center the full piece, which is width=80, height=45, so here are it's center
        // See the define to confirm these
        const pieceCy: number = (50 + 15) / 2;
        // We the need "pieceCx + offsetX" to equal "cx"
        // and "pieceCy + offsetY" to equal "cy", so :
        const offsetY: number = cy - pieceCy;
        // Each piece on the Z axis will be higher, here is how much (see the define to confirm)
        const pieceHeight: number = this.SPACE_SIZE * 0.15;
        return this.getSVGTranslation(0, offsetY - (z * pieceHeight));
    }

}
