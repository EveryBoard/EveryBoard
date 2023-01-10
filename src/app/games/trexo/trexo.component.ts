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
import { Localized } from 'src/app/utils/LocaleUtils';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { CoordXYZ } from 'src/app/jscaip/CoordXYZ';

export class TrexoComponentFailure {

    public static readonly NO_WAY_TO_DROP_IT_HERE: Localized = () => $localize`There is no way to put a piece there!`;
}
interface PieceOnBoard {

    isDroppedPiece: boolean;

    move: MGPOptional<TrexoMove>;
}
@Component({
    selector: 'app-trexo',
    templateUrl: './trexo.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class TrexoComponent extends RectangularGameComponent<TrexoRules, TrexoMove, TrexoState, TrexoSpace> {

    public static VERBOSE: boolean = false;
    public static readonly OFFSET_RATIO: number = 0.4;
    public static readonly HORIZONTAL_WIDTH_RATIO: number = 1.2;
    public static readonly PIECE_HEIGHT_RATIO: number = 0.4;
    public readonly LEFT: number = (- this.STROKE_WIDTH / 2) + (TrexoComponent.OFFSET_RATIO * this.SPACE_SIZE);
    public readonly UP: number = - this.STROKE_WIDTH / 2;
    public readonly WIDTH: number =
        (TrexoState.SIZE * this.SPACE_SIZE) * (TrexoComponent.HORIZONTAL_WIDTH_RATIO + TrexoComponent.OFFSET_RATIO);
    public readonly HEIGHT: number =
        (TrexoState.SIZE * this.SPACE_SIZE) + this.STROKE_WIDTH;
    public static SPACE_SIZE: number;

    public TrexoComponent: typeof TrexoComponent = TrexoComponent;

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
        this.updateBoard();
    }
    public updateBoard(): void {
        const state: TrexoState = this.getState();
        this.board = state.getCopiedBoard();
        this.currentOpponentClass = this.getPlayerClass(state.getCurrentOpponent());
        this.possibleMoves = this.rules.getLegalMoves(state);
        this.victoryCoords = TrexoRules.getVictoriousCoords(state);
        this.pieceOnBoard = this.getMoveHistory();
    }
    private getMoveHistory(): PieceOnBoard[][][] {
        const initialValue: PieceOnBoard = {
            isDroppedPiece: false,
            move: MGPOptional.empty(),
        };
        const moveByCoord: PieceOnBoard[][][] =
            ArrayUtils.createTriTable(1, TrexoState.SIZE, TrexoState.SIZE, initialValue);
        let node: TrexoNode = this.rules.node;
        while (node.move.isPresent()) {
            const move: TrexoMove = node.move.get();
            // So one piece is only own by one coord
            this.addMoveToArray(node, move, moveByCoord);
            node = node.mother.get();
        }
        return moveByCoord;
    }
    private addMoveToArray(node: TrexoNode, move: TrexoMove, moveByCoord: PieceOnBoard[][][]) {
        const height: number = node.gameState.getPieceAt(move.zero).height - 1;
        const initialValue: PieceOnBoard = {
            isDroppedPiece: false,
            move: MGPOptional.empty(),
        };
        while (moveByCoord.length <= height) {
            moveByCoord.push(ArrayUtils.createTable(TrexoState.SIZE, TrexoState.SIZE, initialValue));
        }
        moveByCoord[height][move.zero.y][move.zero.x] = {
            move: MGPOptional.of(move),
            isDroppedPiece: false,
        };
        moveByCoord[height][move.one.y][move.one.x] = {
            move: MGPOptional.of(move),
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
        this.pieceOnBoard[z][y][x] = { isDroppedPiece: false, move: MGPOptional.empty() };
    }
    private selectPiece(clicked: Coord): MGPValidation {
        if (this.possibleMoves.some((move: TrexoMove) => move.coord.equals(clicked))) {
            this.droppedPiece = MGPOptional.of(clicked);
            this.possibleNextClicks = this.getPossibleNextClicks(clicked);
            const pieceHeight: number = this.getState().getPieceAt(clicked).height;
            if (pieceHeight >= this.pieceOnBoard.length) {
                const initialValue: PieceOnBoard = {
                    isDroppedPiece: false,
                    move: MGPOptional.empty(),
                };
                this.pieceOnBoard.push(ArrayUtils.createTable(TrexoState.SIZE, TrexoState.SIZE, initialValue));
            }
            this.pieceOnBoard[pieceHeight][clicked.y][clicked.x] = {
                isDroppedPiece: true,
                move: MGPOptional.empty(),
            };
            return MGPValidation.SUCCESS;
        } else {
            return this.cancelMove(TrexoComponentFailure.NO_WAY_TO_DROP_IT_HERE());
        }
    }
    private getPossibleNextClicks(coord: Coord): Coord[] {
        const potentiallyStartedMove: TrexoMove[] = this.possibleMoves.filter((move: TrexoMove) => {
            return move.coord.equals(coord);
        });
        return potentiallyStartedMove.map((move: TrexoMove) => move.end);
    }
    public cancelMoveAttempt(): void {
        this.droppedPiece = MGPOptional.empty();
        this.possibleNextClicks = [];
        this.updateBoard();
    }
    public getPieceClasses(x: number, y: number): string[] {
        const piece: Coord = new Coord(x, y);
        const pieceOwner: PlayerOrNone = this.getState().getPieceAt(piece).owner;
        const classes: string[] = [this.getPlayerClass(pieceOwner)];
        for (const victoryCoord of this.victoryCoords) {
            if (victoryCoord.equals(piece)) {
                classes.push('victory-stroke');
                break;
            }
        }
        if (this.rules.node.move.isPresent()) {
            const lastMove: TrexoMove = this.rules.node.move.get();
            if (lastMove.coord.equals(piece) || lastMove.end.equals(piece)) {
                classes.push('last-move-stroke');
            }
        }
        return classes;
    }
    public getDroppedPieceId(): string {
        const player: string = this.getState().getCurrentOpponent() === Player.ZERO ? 'piece_zero' : 'piece_one';
        const dropped: Coord = this.droppedPiece.get();
        return player + '_' + dropped.x + '_' + dropped.y;
    }
    public getPieceTranslate(x: number, y: number): string {
        let z: number = this.getState().getPieceAtXY(x, y).height;
        if (this.droppedPiece.equalsValue(new Coord(x, y))) {
            z += 1;
        }
        return this.getTranslate(x, y, z);
    }
    /**
     * @param x the x coord on the state of the piece to draw
     * @param y the x coord on the state of the piece to draw
     * @returns the coord(x, y) of the upper left parallelogram to draw on the SVG;
     */
    private static getCoordTranslate(x: number, y: number, z: number): Coord {
        const SPACE_WIDTH: number = this.SPACE_SIZE * this.HORIZONTAL_WIDTH_RATIO;
        const SPACE_HEIGHT: number = this.SPACE_SIZE;
        const SPACE_OFFSET: number = TrexoComponent.OFFSET_RATIO * this.SPACE_SIZE;
        const numberOfOffset: number = TrexoState.SIZE - y;
        const xBase: number = (x * SPACE_WIDTH) + (numberOfOffset * SPACE_OFFSET);
        const yBase: number = (y * SPACE_HEIGHT) - (TrexoComponent.PIECE_HEIGHT_RATIO * this.SPACE_SIZE * (z - 1));
        return new Coord(xBase, yBase);
    }
    public getTranslate(x: number, y: number, z: number): string { // TODOTODO: mettre en commun code avec Lasca
        const coordTransform: Coord = TrexoComponent.getCoordTranslate(x, y, z);
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
        const RHOMBUS_WIDTH: number = TrexoComponent.SPACE_SIZE * TrexoComponent.HORIZONTAL_WIDTH_RATIO;
        const RHOMBUS_HEIGHT: number = TrexoComponent.SPACE_SIZE;
        const RHOMBUS_OFFSET: number = TrexoComponent.OFFSET_RATIO * TrexoComponent.SPACE_SIZE;
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
    public getCoordXYZ(x: number, y: number, z: number): CoordXYZ {
        return new CoordXYZ(x, y, z);
    }
    public getDroppedPieceCoord(): CoordXYZ {
        const x: number = this.droppedPiece.get().x;
        const y: number = this.droppedPiece.get().y;
        const z: number = this.getState().getPieceAtXY(x, y).height + 1;
        return this.getCoordXYZ(x, y, z);
    }
}
