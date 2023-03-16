import { Component } from '@angular/core';
import { TrexoSpace, TrexoState } from './TrexoState';
import { TrexoNode, TrexoRules } from './TrexoRules';
import { TrexoMinimax } from './TrexoMinimax';
import { RectangularGameComponent } from '../../components/game-components/rectangular-game-component/RectangularGameComponent';
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

interface PieceOnBoard {

    isDroppedPiece: boolean;

    isPossibleClick: boolean;

    move: MGPOptional<TrexoMove>;
}
type ModeType = '2D' | '3D';

export interface ModeConfig {

    OFFSET_RATIO: number;

    HORIZONTAL_WIDTH_RATIO: number;

    PIECE_HEIGHT_RATIO: number;
}

@Component({
    selector: 'app-trexo',
    templateUrl: './trexo.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class TrexoComponent extends RectangularGameComponent<TrexoRules, TrexoMove, TrexoState, TrexoSpace> {

    public static VERBOSE: boolean = false;
    public static SPACE_SIZE: number;
    public static STROKE_WIDTH: number;
    private static readonly INITIAL_PIECE_ON_BOARD: PieceOnBoard = {
        isDroppedPiece: false,
        isPossibleClick: false,
        move: MGPOptional.empty(),
    };
    public static modeMap: Record<ModeType, ModeConfig> = {
        '2D': {
            OFFSET_RATIO: 0,
            HORIZONTAL_WIDTH_RATIO: 1,
            PIECE_HEIGHT_RATIO: 0,
        },
        '3D': {
            OFFSET_RATIO: 0.4,
            HORIZONTAL_WIDTH_RATIO: 1.2,
            PIECE_HEIGHT_RATIO: 0.2,
        },
    };
    public TrexoComponent: typeof TrexoComponent = TrexoComponent;
    public readonly left: number = - this.STROKE_WIDTH / 2;
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

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.rules = TrexoRules.get();
        this.availableMinimaxes = [
            new TrexoMinimax(this.rules, 'TrexoMinimax'),
        ];
        this.encoder = TrexoMove.encoder;
        this.tutorial = new TrexoTutorial().tutorial;
        TrexoComponent.SPACE_SIZE = this.SPACE_SIZE;
        TrexoComponent.STROKE_WIDTH = this.STROKE_WIDTH;
        this.switchToMode('3D');
        this.updateBoard();
    }
    public switchToMode(mode: ModeType): void {
        this.chosenMode = mode;
        this.width = this.getWidth();
        this.up = this.getUp();
        this.height = this.getHeight();
        this.mode = TrexoComponent.modeMap[mode];
    }
    private getWidth(): number {
        const mode3D: ModeConfig = TrexoComponent.modeMap['3D'];
        const boardWidth: number = TrexoState.SIZE;
        const widification: number = mode3D.HORIZONTAL_WIDTH_RATIO + mode3D.OFFSET_RATIO;
        const spaceWidth3D: number = this.SPACE_SIZE * widification;
        if (this.chosenMode === '2D') {
            return ((boardWidth + 1) * this.SPACE_SIZE) + (2 * this.STROKE_WIDTH);
        } else {
            return (boardWidth * spaceWidth3D) + this.STROKE_WIDTH;
        }
    }
    private getHeight(): number {
        const stroke: number = this.STROKE_WIDTH;
        const boardHeight: number = TrexoState.SIZE * this.SPACE_SIZE;
        if (this.chosenMode === '2D') {
            return boardHeight;
        } else {
            const pieceBonus: number = this.getHigherStackHeight();
            return stroke + boardHeight + pieceBonus;
        }
    }
    private getUp(): number {
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
        const pieceBonus: number = maxZ * mode.PIECE_HEIGHT_RATIO * this.SPACE_SIZE;
        return pieceBonus;
    }
    public updateBoard(): void {
        const state: TrexoState = this.getState();
        this.board = state.getCopiedBoard();
        this.currentOpponentClass = this.getPlayerClass(state.getCurrentOpponent());
        this.possibleMoves = this.rules.getLegalMoves(state);
        this.victoryCoords = TrexoRules.getVictoriousCoords(state);
        this.pieceOnBoard = this.get3DBoard();
        this.height = this.getHeight();
        this.up = this.getUp();
    }
    private get3DBoard(): PieceOnBoard[][][] {
        const moveByCoord: PieceOnBoard[][][] =
            ArrayUtils.create3DTable(1, TrexoState.SIZE, TrexoState.SIZE, TrexoComponent.INITIAL_PIECE_ON_BOARD);
        let node: TrexoNode = this.rules.node;
        while (node.move.isPresent()) {
            const move: TrexoMove = node.move.get();
            // So one piece is only owned by one coord
            this.addMoveToArray(node, move, moveByCoord);
            node = node.mother.get();
        }
        return moveByCoord;
    }
    private addMoveToArray(node: TrexoNode, move: TrexoMove, moveByCoord: PieceOnBoard[][][]): void {
        const height: number = node.gameState.getPieceAt(move.first).height - 1;
        while (moveByCoord.length <= height) {
            moveByCoord.push(ArrayUtils.createTable(TrexoState.SIZE,
                                                    TrexoState.SIZE,
                                                    TrexoComponent.INITIAL_PIECE_ON_BOARD));
        }
        moveByCoord[height][move.first.y][move.first.x] = {
            move: MGPOptional.of(move),
            isPossibleClick: false,
            isDroppedPiece: false,
        };
        moveByCoord[height][move.second.y][move.second.x] = {
            move: MGPOptional.of(move),
            isPossibleClick: false,
            isDroppedPiece: false,
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
                return this.chooseMove(move, this.getState());
            } else {
                this.deselectPiece();
            }
        }
        return this.selectPiece(clicked);
    }
    private deselectPiece(): void {
        const z: number = this.getState().getPieceAt(this.droppedPiece.get()).height;
        const y: number = this.droppedPiece.get().y;
        const x: number = this.droppedPiece.get().x;
        this.pieceOnBoard[z][y][x] = TrexoComponent.INITIAL_PIECE_ON_BOARD;
        for (const nextClick of this.possibleNextClicks) {
            this.pieceOnBoard[z][nextClick.y][nextClick.x].isPossibleClick = false;
        }
    }
    private selectPiece(clicked: Coord): MGPValidation {
        if (this.possibleMoves.some((move: TrexoMove) => move.first.equals(clicked))) {
            const pieceHeight: number = this.getState().getPieceAt(clicked).height;
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
            return move.first.equals(coord);
        });
        return potentiallyStartedMove.map((move: TrexoMove) => move.second);
    }
    public cancelMoveAttempt(): void {
        this.droppedPiece = MGPOptional.empty();
        this.possibleNextClicks = [];
        this.updateBoard();
    }
    public getPieceClasses(x: number, y: number): string[] {
        const piece: Coord = new Coord(x, y);
        const pieceOwner: PlayerOrNone = this.getState().getPieceAt(piece).owner;
        let classes: string[] = [this.getPlayerClass(pieceOwner)];
        classes = classes.concat(this.getSpaceClasses(x, y));
        for (const victoryCoord of this.victoryCoords) {
            if (victoryCoord.equals(piece)) {
                classes.push('victory-stroke');
                break;
            }
        }
        if (this.rules.node.move.isPresent()) {
            const lastMove: TrexoMove = this.rules.node.move.get();
            if (lastMove.first.equals(piece) || lastMove.second.equals(piece)) {
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
    /**
     * @param x the x coord on the state of the piece to draw
     * @param y the y coord on the state of the piece to draw
     * @returns the coord(x, y) of the upper left parallelogram to draw on the SVG;
     */
    private static getCoordTranslate(x: number, y: number, z: number, mode: ModeConfig): Coord {
        const SPACE_WIDTH: number = this.SPACE_SIZE * mode.HORIZONTAL_WIDTH_RATIO;
        const SPACE_HEIGHT: number = this.SPACE_SIZE;
        const SPACE_OFFSET: number = mode.OFFSET_RATIO * this.SPACE_SIZE;
        const numberOfOffset: number = TrexoState.SIZE - y;
        const xBase: number = (x * SPACE_WIDTH) + (numberOfOffset * SPACE_OFFSET);
        const yBase: number = (y * SPACE_HEIGHT) - (mode.PIECE_HEIGHT_RATIO * this.SPACE_SIZE * z);
        return new Coord(xBase, yBase);
    }
    public getTranslate(x: number, y: number, z: number): string { // TODOTODO: mettre en commun code avec Lasca
        const mode: ModeConfig = TrexoComponent.modeMap[this.chosenMode];
        const coordTransform: Coord = TrexoComponent.getCoordTranslate(x, y, z, mode);
        const translate: string = 'translate(' + coordTransform.x + ' ' + coordTransform.y + ')';
        return translate;
    }
    public getRhombusPoints(): string {
        const coords: Coord[] = this.getRhombusCoords();
        return coords.map((coord: Coord) => {
            return coord.x + ' ' + coord.y;
        }).join(' ');
    }
    /**
     * @param width the abstract width of the rhombus
     * @param height the abstract height of the rhombus
     * @returns a list of concrete coord for the rhombus, with (0, 0) as lefter and upper coord
     */
    private getRhombusCoords(): Coord[] { // TODOTODO: mettre en commun code avec Lasca
        const mode: ModeConfig = TrexoComponent.modeMap[this.chosenMode];
        const RHOMBUS_WIDTH: number = TrexoComponent.SPACE_SIZE * mode.HORIZONTAL_WIDTH_RATIO;
        const RHOMBUS_HEIGHT: number = TrexoComponent.SPACE_SIZE;
        const RHOMBUS_OFFSET: number = mode.OFFSET_RATIO * TrexoComponent.SPACE_SIZE;
        const x1: number = RHOMBUS_WIDTH;
        const y1: number = 0;
        const x2: number = RHOMBUS_WIDTH - RHOMBUS_OFFSET;
        const y2: number = RHOMBUS_HEIGHT;
        const x3: number = - RHOMBUS_OFFSET;
        const y3: number = RHOMBUS_HEIGHT;
        return [
            new Coord(0, 0),
            new Coord(x1, y1),
            new Coord(x2, y2),
            new Coord(x3, y3),
        ];
    }
    public getCoord3D(x: number, y: number, z: number): Coord3D {
        return new Coord3D(x, y, z);
    }
    public get3DSwitcherTransform(): string {
        const mode3D: ModeConfig = TrexoComponent.modeMap['3D'];
        const widness: number = mode3D.HORIZONTAL_WIDTH_RATIO + mode3D.OFFSET_RATIO;
        const scale: string = ' scale(' + (1 / widness) + ')';
        const verticalUnWideness: number = (1 - (1 / widness)) / 2;
        const xTranslate: number = (10 + mode3D.OFFSET_RATIO) * this.SPACE_SIZE;
        const yTranslate: number = (9 + verticalUnWideness) * this.SPACE_SIZE;
        const translate: string = 'translate(' + xTranslate + ', ' + yTranslate + ')';
        return translate + scale;
    }
}
