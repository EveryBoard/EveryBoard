import { Component } from '@angular/core';
import { TrexoPiece, TrexoPieceStack, TrexoState } from './TrexoState';
import { TrexoRules } from './TrexoRules';
import { TrexoMinimax } from './TrexoMinimax';
import { ModeConfig, ParallelogramGameComponent } from 'src/app/components/game-components/parallelogram-game-component/ParallelogramGameComponent';
import { TrexoMove } from 'src/app/games/trexo/TrexoMove';
import { Coord } from 'src/app/jscaip/Coord';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { TrexoTutorial } from './TrexoTutorial';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { Coord3D } from 'src/app/jscaip/Coord3D';
import { TrexoFailure } from './TrexoFailure';
import { Direction } from 'src/app/jscaip/Direction';

interface PieceOnBoard {

    isDroppedPiece: boolean;

    isPossibleClick: boolean;

    move: MGPOptional<TrexoMove>;
}
type ModeType = '2D' | '3D';


@Component({
    selector: 'app-trexo',
    templateUrl: './trexo.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class TrexoComponent extends ParallelogramGameComponent<TrexoRules, TrexoMove, TrexoState, TrexoPieceStack> {

    public static VERBOSE: boolean = false;
    public static STROKE_WIDTH: number;
    private static readonly INITIAL_PIECE_ON_BOARD: PieceOnBoard = {
        isDroppedPiece: false,
        isPossibleClick: false,
        move: MGPOptional.empty(),
    };
    public static modeMap: Record<ModeType, ModeConfig> = {
        '2D': {
            offsetRatio: 0,
            horizontalWidthRatio: 1,
            pieceHeightRatio: 0,
            parallelogramHeight: 100,
            abstractBoardSize: 10,
        },
        '3D': {
            offsetRatio: 0.4,
            horizontalWidthRatio: 1.2,
            pieceHeightRatio: 0.2,
            parallelogramHeight: 100,
            abstractBoardSize: 10,
        },
    };
    public TrexoComponent: typeof TrexoComponent = TrexoComponent;
    public readonly left: number = - this.STROKE_WIDTH / 2;
    public Coord3D: typeof Coord3D = Coord3D;
    public up: number = 0;
    public width: number;
    public height: number;
    public mode: ModeConfig;
    public chosenMode: ModeType = '3D';

    public victoryCoords: Coord[] = [];

    public droppedPiece: MGPOptional<Coord> = MGPOptional.empty();
    public possibleNextClicks: Coord[] = [];
    public possibleMoves: TrexoMove[] = [];
    public pieceOnBoard: PieceOnBoard[][][] = [];

    public currentOpponentClass: string = 'player1';
    public currentPlayerClass: string = 'player0';

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.rules = TrexoRules.get();
        this.node = this.rules.getInitialNode();
        this.availableAIs = [
            new TrexoMinimax(),
        ];
        this.encoder = TrexoMove.encoder;
        this.tutorial = new TrexoTutorial().tutorial;
        TrexoComponent.STROKE_WIDTH = this.STROKE_WIDTH;
        this.switchToMode('3D');
        this.updateBoard();
    }
    public switchToMode(mode: ModeType): void {
        this.chosenMode = mode;
        this.width = this.getViewBoxWidth();
        this.up = this.getViewBoxUp();
        this.height = this.getViewBoxHeight();
        this.mode = TrexoComponent.modeMap[mode];
    }
    private getViewBoxWidth(): number {
        const mode3D: ModeConfig = TrexoComponent.modeMap['3D'];
        const boardWidth: number = TrexoState.SIZE;
        const widification: number = mode3D.horizontalWidthRatio + mode3D.offsetRatio;
        const spaceWidth3D: number = this.SPACE_SIZE * widification;
        if (this.chosenMode === '2D') {
            return ((boardWidth + 1) * this.SPACE_SIZE) + (2 * this.STROKE_WIDTH);
        } else {
            return (boardWidth * spaceWidth3D) + this.STROKE_WIDTH;
        }
    }
    private getViewBoxHeight(): number {
        const stroke: number = this.STROKE_WIDTH;
        const boardHeight: number = TrexoState.SIZE * this.SPACE_SIZE;
        if (this.chosenMode === '2D') {
            return boardHeight;
        } else {
            const pieceBonus: number = this.getHigherStackHeight();
            return stroke + boardHeight + pieceBonus;
        }
    }
    private getViewBoxUp(): number {
        if (this.chosenMode === '2D') {
            return 0;
        } else {
            const stackHeight: number = this.getHigherStackHeight();
            const stroke: number = this.STROKE_WIDTH / 2;
            return - (stroke + stackHeight);
        }
    }
    private getHigherStackHeight(): number {
        const mode: ModeConfig = TrexoComponent.modeMap[this.chosenMode];
        const maxZ: number = this.pieceOnBoard.length + 1;
        const pieceBonus: number = maxZ * mode.pieceHeightRatio * this.SPACE_SIZE;
        return pieceBonus;
    }
    public updateBoard(): void {
        const state: TrexoState = this.getState();
        this.board = state.getCopiedBoard();
        this.currentOpponentClass = this.getPlayerClass(state.getCurrentOpponent());
        this.currentPlayerClass = this.getPlayerClass(state.getCurrentPlayer());
        this.possibleMoves = this.rules.getLegalMoves(state);
        this.victoryCoords = TrexoRules.getVictoriousCoords(state);
        this.pieceOnBoard = this.get3DBoard();
        this.height = this.getViewBoxHeight();
        this.up = this.getViewBoxUp();
    }
    private get3DBoard(): PieceOnBoard[][][] {
        const moveByCoord: PieceOnBoard[][][] =
            ArrayUtils.create3DTable(1, TrexoState.SIZE, TrexoState.SIZE, TrexoComponent.INITIAL_PIECE_ON_BOARD);
        let maxZ: number = 1;
        for (let z: number = 0; z <= maxZ; z++) {
            for (const stack of this.getState().toMap()) {
                const coord: Coord = stack.key;
                const stackHeight: number = stack.value.getHeight();
                maxZ = Math.max(maxZ, stackHeight);
                if (z < stackHeight) {
                    const move: TrexoMove = this.extractMoveFromState(coord.x, coord.y, z);
                    this.addMoveToArray(z, move, moveByCoord);
                }
            }
        }
        return moveByCoord;
    }
    private extractMoveFromState(x: number, y: number, z: number): TrexoMove {
        const piece: TrexoPiece = this.getState().getPieceAtXYZ(x, y, z);
        const pieceCoord: Coord = new Coord(x, y);
        let otherCoord: Coord = new Coord(-2, -2); // Will get erased
        for (const dir of Direction.ORTHOGONALS) {
            const neighborCoord: Coord = pieceCoord.getNext(dir);
            if (neighborCoord.isInRange(TrexoState.SIZE, TrexoState.SIZE)) {
                const neighborStack: TrexoPieceStack = this.getState().getPieceAt(neighborCoord);
                if (neighborStack.getHeight() > z) {
                    const neighborPiece: TrexoPiece = neighborStack.getPieceAt(z);
                    if (neighborPiece.tileId === piece.tileId) {
                        otherCoord = neighborCoord;
                    }
                }
            }
        }
        if (piece.owner === Player.ZERO) {
            return TrexoMove.from(pieceCoord, otherCoord).get();
        } else {
            return TrexoMove.from(otherCoord, pieceCoord).get();
        }
    }
    private addMoveToArray(height: number, move: TrexoMove, moveByCoord: PieceOnBoard[][][]): void {
        while (moveByCoord.length <= height) {
            moveByCoord.push(ArrayUtils.createTable(TrexoState.SIZE,
                                                    TrexoState.SIZE,
                                                    TrexoComponent.INITIAL_PIECE_ON_BOARD));
        }
        moveByCoord[height][move.getZero().y][move.getZero().x] = {
            isDroppedPiece: false,
            isPossibleClick: false,
            move: MGPOptional.of(move),
        };
        moveByCoord[height][move.getOne().y][move.getOne().x] = {
            isDroppedPiece: false,
            isPossibleClick: false,
            move: MGPOptional.of(move),
        };
    }
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#space_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const clicked: Coord = new Coord(x, y);
        if (this.droppedPiece.isPresent()) {
            const dropped: Coord = this.droppedPiece.get();
            if (this.droppedPiece.equalsValue(clicked)) {
                this.cancelMoveAttempt();
                return MGPValidation.SUCCESS;
            }
            if (this.possibleNextClicks.some((c: Coord) => c.equals(clicked))) {
                const isPlayerZero: boolean = this.getState().getCurrentPlayer() === Player.ZERO;
                const first: Coord = isPlayerZero ? clicked : dropped;
                const second: Coord = isPlayerZero ? dropped : clicked;
                const move: TrexoMove = TrexoMove.from(first, second).get();
                return this.chooseMove(move);
            } else {
                this.deselectPiece();
            }
        }
        return this.selectPiece(clicked);
    }
    private deselectPiece(): void {
        const z: number = this.getState().getPieceAt(this.droppedPiece.get()).getHeight();
        const y: number = this.droppedPiece.get().y;
        const x: number = this.droppedPiece.get().x;
        this.pieceOnBoard[z][y][x] = TrexoComponent.INITIAL_PIECE_ON_BOARD;
        for (const nextClick of this.possibleNextClicks) {
            this.pieceOnBoard[z][nextClick.y][nextClick.x].isPossibleClick = false;
        }
    }
    private selectPiece(clicked: Coord): MGPValidation {
        if (this.possibleMoves.some((move: TrexoMove) => move.getZero().equals(clicked))) {
            const pieceHeight: number = this.getState().getPieceAt(clicked).getHeight();
            if (pieceHeight >= this.pieceOnBoard.length) {
                this.pieceOnBoard.push(ArrayUtils.createTable(TrexoState.SIZE,
                                                              TrexoState.SIZE,
                                                              TrexoComponent.INITIAL_PIECE_ON_BOARD));
            }
            this.showDroppedPieceAndIndicators(clicked, pieceHeight);
            return MGPValidation.SUCCESS;
        } else {
            return this.cancelMove(TrexoFailure.NO_WAY_TO_DROP_IT_HERE());
        }
    }
    private showDroppedPieceAndIndicators(dropped: Coord, pieceHeight: number): void {
        this.droppedPiece = MGPOptional.of(dropped);
        this.possibleNextClicks = this.getPossibleNextClicks(dropped);
        for (const possibleNextClick of this.possibleNextClicks) {
            this.pieceOnBoard[pieceHeight][possibleNextClick.y][possibleNextClick.x] = {
                isDroppedPiece: false,
                isPossibleClick: true,
                move: MGPOptional.empty(),
            };
        }
        this.pieceOnBoard[pieceHeight][dropped.y][dropped.x] = {
            isDroppedPiece: true,
            isPossibleClick: false,
            move: MGPOptional.empty(),
        };
    }
    private getPossibleNextClicks(coord: Coord): Coord[] {
        const potentiallyStartedMove: TrexoMove[] = this.possibleMoves.filter((move: TrexoMove) => {
            return move.getZero().equals(coord);
        });
        return potentiallyStartedMove.map((move: TrexoMove) => move.getOne());
    }
    public override cancelMoveAttempt(): void {
        this.droppedPiece = MGPOptional.empty();
        this.possibleNextClicks = [];
        this.updateBoard();
    }
    public getPieceClasses(x: number, y: number, z: number): string[] {
        const piece: Coord = new Coord(x, y);
        const pieceOwner: PlayerOrNone = this.getState().getPieceAtXYZ(x, y, z).owner;
        let classes: string[] = [this.getPlayerClass(pieceOwner)];
        classes = classes.concat(this.getSpaceClasses(x, y));
        for (const victoryCoord of this.victoryCoords) {
            if (victoryCoord.equals(piece)) {
                classes.push('victory-stroke');
                break;
            }
        }
        if (this.node.move.isPresent()) {
            const lastMove: TrexoMove = this.node.move.get();
            if (lastMove.getZero().equals(piece) || lastMove.getOne().equals(piece)) {
                classes.push('last-move-stroke');
            }
        }
        return classes;
    }
    public getSpaceClasses(x: number, y: number): string[] {
        for (const boardLayer of this.pieceOnBoard) {
            if (boardLayer[y][x].isPossibleClick) {
                return ['darker'];
            }
        }
        return [];
    }
    public getTranslate(x: number, y: number, z: number): string {
        const mode: ModeConfig = TrexoComponent.modeMap[this.chosenMode];
        const coordTransform: Coord = this.getCoordTranslate(x, y, z, mode);
        const translate: string = 'translate(' + coordTransform.x + ' ' + coordTransform.y + ')';
        return translate;
    }
    public getParallelogramPoints(): string {
        const coords: Coord[] = this.getParallelogramCoordsForTrexo();
        return coords.map((coord: Coord) => {
            return coord.x + ' ' + coord.y;
        }).join(' ');
    }
    /**
     * @returns a list of concrete coord for the parallelogram, with (0, 0) as left and upper coord
     */
    private getParallelogramCoordsForTrexo(): Coord[] {
        const mode: ModeConfig = TrexoComponent.modeMap[this.chosenMode];
        return this.getParallelogramCoords(mode);
    }
    public get3DSwitcherTransform(): string {
        const mode3D: ModeConfig = TrexoComponent.modeMap['3D'];
        const widness: number = mode3D.horizontalWidthRatio + mode3D.offsetRatio;
        const scale: string = ' scale(' + (1 / widness) + ')';
        const verticalUnWideness: number = (1 - (1 / widness)) / 2;
        const xTranslate: number = (10 + mode3D.offsetRatio) * mode3D.parallelogramHeight;
        const yTranslate: number = (9 + verticalUnWideness) * mode3D.parallelogramHeight;
        const translate: string = 'translate(' + xTranslate + ', ' + yTranslate + ')';
        return translate + scale;
    }
}
