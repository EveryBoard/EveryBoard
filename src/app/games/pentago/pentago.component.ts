import { Component } from '@angular/core';
import { RectangularGameComponent }
    from 'src/app/components/game-components/rectangular-game-component/RectangularGameComponent';
import { Coord } from 'src/app/jscaip/Coord';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { PentagoMinimax } from './PentagoMinimax';
import { PentagoMove } from './PentagoMove';
import { PentagoRules } from './PentagoRules';
import { PentagoState } from './PentagoState';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { PentagoTutorial } from './PentagoTutorial';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { Utils } from 'src/app/utils/utils';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { GameStatus } from 'src/app/jscaip/GameStatus';

interface ArrowInfo {
    path: string;
    blockIndex: number;
    clockwise: boolean;
}

@Component({
    selector: 'app-pentago',
    templateUrl: './pentago.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class PentagoComponent extends RectangularGameComponent<PentagoRules,
                                                               PentagoMove,
                                                               PentagoState,
                                                               PlayerOrNone>
{
    public readonly BLOCK_WIDTH: number;
    public readonly BLOCK_SEPARATION: number;
    public readonly DIAGONAL_BAR_OFFSET: number;

    public arrows: ArrowInfo[] = [];
    public victoryCoords: Coord[] = [];
    public canSkipRotation: boolean;
    public currentDrop: MGPOptional<Coord> = MGPOptional.empty();

    public movedBlock: MGPOptional<number> = MGPOptional.empty();
    public lastDrop: MGPOptional<Coord> = MGPOptional.empty();
    public lastRotation: MGPOptional<ArrowInfo> = MGPOptional.empty();

    public ARROWS: ArrowInfo[];

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.rules = PentagoRules.get();
        this.node = this.rules.getInitialNode();
        this.availableMinimaxes = [
            new PentagoMinimax(this.rules, 'PentagoMinimax'),
        ];
        this.encoder = PentagoMove.encoder;
        this.tutorial = new PentagoTutorial().tutorial;
        this.BLOCK_WIDTH = (3 * this.SPACE_SIZE) + (2 * this.STROKE_WIDTH);
        this.BLOCK_SEPARATION = (this.BLOCK_WIDTH + 2 * this.STROKE_WIDTH);
        this.DIAGONAL_BAR_OFFSET = Math.cos(Math.PI / 4) * 0.75 * this.SPACE_SIZE;
        this.ARROWS = this.generateArrowsCoord();
        void this.updateBoard();
    }
    public async updateBoard(): Promise<void> {
        this.board = this.getState().getCopiedBoard();
        this.victoryCoords = this.rules.getVictoryCoords(this.getState());
        this.lastDrop = MGPOptional.empty();
        this.lastRotation = MGPOptional.empty();
    }
    public override async showLastMove(move: PentagoMove): Promise<void> {
        this.cancelMoveAttempt();
        this.movedBlock = move.blockTurned;
        const localCoord: Coord = new Coord(move.coord.x % 3 - 1, move.coord.y % 3 - 1);
        if (move.blockTurned.isPresent()) {
            this.showLastRotation(move);
            if (localCoord.equals(new Coord(0, 0)) === false && this.coordBelongToBlock(move)) {
                return this.showLastDrop(move, localCoord);
            }
        }
        this.lastDrop = MGPOptional.of(move.coord);
    }
    private showLastRotation(lastMove: PentagoMove): void {
        if (lastMove.blockTurned.isPresent()) {
            const blockIndex: number = lastMove.blockTurned.get();
            const lastArrow: ArrowInfo = this.ARROWS.filter((arrow: ArrowInfo) => {
                return arrow.blockIndex === blockIndex &&
                       arrow.clockwise === lastMove.turnedClockwise;
            })[0];
            this.lastRotation = MGPOptional.of(lastArrow);
        }
    }
    private showLastDrop(lastMove: PentagoMove, localCoord: Coord): void {
        // This half will calculate the new coordinate of last turn dropped coord
        // (which is encoded in its pre-rotation coord)
        // Note, this is a local coord for each 3x3 block, so a coord between (0, 0) and (2, 2)
        let postRotation: Coord;
        if (lastMove.turnedClockwise) {
            postRotation = Utils.getNonNullable(PentagoState.ROTATION_MAP.find((value: [Coord, Coord]) => {
                return value[0].equals(localCoord);
            }))[1];
        } else {
            postRotation = Utils.getNonNullable(PentagoState.ROTATION_MAP.find((value: [Coord, Coord]) => {
                return value[1].equals(localCoord);
            }))[0];
        }
        // This half translate this local coord to its final coord
        // so the central coord (1, 1) of the low-right block is moved in (1 + 4, 1 + 4)
        const turnedBlockIndex: number = lastMove.blockTurned.get();
        const cx: number = turnedBlockIndex % 2 === 0 ? 1 : 4;
        const cy: number = turnedBlockIndex < 2 ? 1 : 4;
        const turnedBlockCenterCoord: Coord = new Coord(cx, cy);
        postRotation = postRotation.getNext(turnedBlockCenterCoord, 1);
        this.lastDrop = MGPOptional.of(postRotation);
    }
    private coordBelongToBlock(lastMove: PentagoMove): boolean {
        const lastMoveBlockY: number = lastMove.coord.y < 3 ? 0 : 1;
        const lastMoveBlockX: number = lastMove.coord.x < 3 ? 0 : 1;
        const lastMoveBlockIndex: number = lastMoveBlockY * 2 + lastMoveBlockX;
        return lastMove.blockTurned.equalsValue(lastMoveBlockIndex);
    }
    public hidePreviousMove(): void {
        this.lastDrop = MGPOptional.empty();
        this.movedBlock = MGPOptional.empty();
        this.lastRotation = MGPOptional.empty();
        this.victoryCoords = [];
    }
    private generateArrowsCoord(): ArrowInfo[] {
        const B2: number = 2 * this.BLOCK_SEPARATION;
        const z0: number = 0;
        const C2: number = this.SPACE_SIZE;
        const D1: number = B2 - C2;
        const C4: number = 2 * C2;
        const C1: number = 0.5 * this.SPACE_SIZE;
        const path0: string = 'M ' + C1 + ' ' + z0 + ' q  ' + C2 + ' -' + C2 + '  ' + C4 + '  ' + z0;
        const path1: string = 'M ' + z0 + ' ' + C1 + ' q -' + C2 + '  ' + C2 + '  ' + z0 + '  ' + C4;
        const path2: string = 'M ' + B2 + ' ' + C1 + ' q  ' + C2 + '  ' + C2 + '  ' + z0 + '  ' + C4;
        const path3: string = 'M ' + D1 + ' ' + z0 + ' q -' + C2 + ' -' + C2 + ' -' + C4 + '  ' + z0;
        const path4: string = 'M ' + z0 + ' ' + D1 + ' q -' + C2 + ' -' + C2 + '  ' + z0 + ' -' + C4;
        const path5: string = 'M ' + C1 + ' ' + B2 + ' q  ' + C2 + '  ' + C2 + '  ' + C4 + '  ' + z0;
        const path6: string = 'M ' + D1 + ' ' + B2 + ' q -' + C2 + '  ' + C2 + ' -' + C4 + '  ' + z0;
        const path7: string = 'M ' + B2 + ' ' + D1 + ' q  ' + C2 + ' -' + C2 + '  ' + z0 + ' -' + C4;
        return [
            { path: path0, blockIndex: 0, clockwise: true },
            { path: path1, blockIndex: 0, clockwise: false },
            { path: path2, blockIndex: 1, clockwise: true },
            { path: path3, blockIndex: 1, clockwise: false },
            { path: path4, blockIndex: 2, clockwise: true },
            { path: path5, blockIndex: 2, clockwise: false },
            { path: path6, blockIndex: 3, clockwise: true },
            { path: path7, blockIndex: 3, clockwise: false },
        ];
    }
    public override cancelMoveAttempt(): void {
        this.arrows = [];
        this.currentDrop = MGPOptional.empty();
        this.canSkipRotation = false;
    }
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = await this.canUserPlay('#click_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        this.hidePreviousMove();
        if (this.board[y][x].isPlayer()) {
            return this.cancelMove(RulesFailure.MUST_LAND_ON_EMPTY_SPACE());
        }
        const drop: PentagoMove = PentagoMove.rotationless(x, y);
        const state: PentagoState = this.getState();
        const postDropState: PentagoState = state.applyLegalDrop(drop);
        if (postDropState.neutralBlocks.length === 4) {
            return this.chooseMove(drop, state);
        }
        const gameStatus: GameStatus = this.rules.getGameStatus(this.node);
        this.canSkipRotation = postDropState.neutralBlocks.length > 0 && gameStatus.isEndGame === false;
        this.currentDrop = MGPOptional.of(new Coord(x, y));
        this.displayArrows(postDropState.neutralBlocks);
        return MGPValidation.SUCCESS;
    }
    public getCenter(xOrY: number): number {
        const block: number = xOrY < 3 ? 0 : this.BLOCK_SEPARATION;
        return block + (2 * this.STROKE_WIDTH) + (((xOrY % 3) + 0.5) * this.SPACE_SIZE);
    }
    public displayArrows(neutralBlocks: number[]): void {
        this.arrows = [];
        for (let blockIndex: number = 0; blockIndex < 4; blockIndex++) {
            if (neutralBlocks.includes(blockIndex) === false) {
                const arrows: ArrowInfo[] = this.ARROWS.filter((arrow: ArrowInfo) => {
                    return arrow.blockIndex === blockIndex;
                });
                this.arrows = this.arrows.concat(arrows);
            }
        }
    }
    public getBlockClasses(x: number, y: number): string[] {
        const blockIndex: number = x + 2 * y;
        if (this.movedBlock.equalsValue(blockIndex)) {
            return ['last-move-stroke'];
        }
        return [];
    }
    public getSquareClasses(x: number, y: number): string[] {
        const classes: string[] = [];
        const player: string = this.getPlayerClass(this.board[y][x]);
        classes.push(player);
        if (this.lastDrop.equalsValue(new Coord(x, y))) {
            classes.push('last-move-stroke');
        }
        return classes;
    }
    public async rotate(arrow: ArrowInfo): Promise<MGPValidation> {
        const clockwise: string = arrow.clockwise ? 'clockwise' : 'counterclockwise';
        const clickValidity: MGPValidation = await this.canUserPlay('#rotate_' + arrow.blockIndex + '_' + clockwise);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const currentDrop: Coord = this.currentDrop.get();
        const move: PentagoMove =
            PentagoMove.withRotation(currentDrop.x, currentDrop.y, arrow.blockIndex, arrow.clockwise);
        return this.chooseMove(move, this.getState());
    }
    public async skipRotation(): Promise<MGPValidation> {
        const clickValidity: MGPValidation = await this.canUserPlay('#skipRotation');
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const currentDrop: Coord = this.currentDrop.get();
        const drop: PentagoMove = PentagoMove.rotationless(currentDrop.x, currentDrop.y);
        return this.chooseMove(drop, this.getState());
    }
}
