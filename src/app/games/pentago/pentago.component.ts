import { Component } from '@angular/core';
import { RectangularGameComponent }
    from 'src/app/components/game-components/rectangular-game-component/RectangularGameComponent';
import { Coord } from 'src/app/jscaip/Coord';
import { Vector } from 'src/app/jscaip/Direction';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus } from 'src/app/jscaip/Rules';
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

@Component({
    selector: 'app-pentago',
    templateUrl: './pentago.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class PentagoComponent extends RectangularGameComponent<PentagoRules,
                                                               PentagoMove,
                                                               PentagoState,
                                                               Player>
{
    public readonly BLOCK_WIDTH: number;
    public readonly BLOCK_SEPARATION: number;
    public readonly DIAGONAL_BAR_OFFSET: number;

    public arrows: [string, number, boolean][] = [];
    public victoryCoords: Coord[] = [];
    public canSkipRotation: boolean;
    public currentDrop: MGPOptional<Coord>;

    public movedBlock: MGPOptional<number>;
    public lastDrop: MGPOptional<Coord>;

    public ARROWS: [string, number, boolean][];

    constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.rules = new PentagoRules(PentagoState);
        this.availableMinimaxes = [
            new PentagoMinimax(this.rules, 'PentagoMinimax'),
        ];
        this.encoder = PentagoMove.encoder;
        this.tutorial = new PentagoTutorial().tutorial;
        this.BLOCK_WIDTH = (3 * this.SPACE_SIZE) + (2 * this.STROKE_WIDTH);
        this.BLOCK_SEPARATION = (this.BLOCK_WIDTH + 2 * this.STROKE_WIDTH);
        this.DIAGONAL_BAR_OFFSET = Math.cos(Math.PI / 4) * 0.75 * this.SPACE_SIZE;
        this.ARROWS = this.generateArrowsCoord();
        this.updateBoard();
    }
    public updateBoard(): void {
        this.board = this.rules.node.gameState.getCopiedBoard();
        this.victoryCoords = this.rules.getVictoryCoords(this.rules.node.gameState);
        this.showLastMove();
    }
    public showLastMove(): void {
        const lastMoveOptional: MGPOptional<PentagoMove> = this.rules.node.move;
        this.cancelMoveAttempt();
        if (lastMoveOptional.isAbsent()) {
            this.hidePreviousMove();
        } else {
            const lastMove: PentagoMove = lastMoveOptional.get();
            this.movedBlock = lastMove.blockTurned;
            const localCoord: Coord = new Coord(lastMove.coord.x % 3 - 1, lastMove.coord.y % 3 - 1);
            if (lastMove.blockTurned.isPresent() &&
                localCoord.equals(new Coord(0, 0)) === false &&
                this.coordBelongToBlock(lastMove))
            {
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
                const b: number = lastMove.blockTurned.get();
                const bx: number = b % 2 === 0 ? 1 : 4;
                const by: number = b < 2 ? 1 : 4;
                postRotation = postRotation.getNext(new Vector(bx, by), 1);
                this.lastDrop = MGPOptional.of(postRotation);
            } else {
                this.lastDrop = MGPOptional.of(lastMove.coord);
            }
        }
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
        this.victoryCoords = [];
    }
    private generateArrowsCoord(): [string, number, boolean][] {
        const B: number = 2 * this.BLOCK_SEPARATION;
        const C: number = this.SPACE_SIZE;
        const c: number = 0.5 * this.SPACE_SIZE;
        return [
            ['M ' + c + ' 0 q ' + C + ' -' + C + ' ' + (2 * C) + ' 0', 0, true],
            ['M 0 ' + c + ' q -' + C + ' ' + C + ' 0 ' + (2 * C), 0, false],
            ['M ' + B + ' ' + c + ' q ' + C + ' ' + C + ' 0 ' + (2 * C), 1, true],
            ['M ' + (B - c) + ' 0 q -' + C + ' -' + C + ' -' + (2 * C) + ' 0', 1, false],
            ['M 0 ' + (B - c) + ' q -' + C + ' -' + C + ' 0 -' + (2 * C), 2, true],
            ['M ' + c + ' ' + B + ' q ' + C + ' ' + C + ' ' + (2 * C) + ' 0', 2, false],
            ['M ' + (B - c) + ' ' + B + ' q -' + C + ' ' + C + ' -' + (2 * C) + ' 0', 3, true],
            ['M ' + B + ' ' + (B - c) + '  q ' + C + ' -' + C + ' 0 -' + (2 * C), 3, false],
        ];
    }
    public cancelMoveAttempt(): void {
        this.arrows = [];
        this.currentDrop = MGPOptional.empty();
        this.canSkipRotation = false;
    }
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#click_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        if (this.board[y][x] !== Player.NONE) {
            return this.cancelMove(RulesFailure.MUST_LAND_ON_EMPTY_SPACE());
        }
        const drop: PentagoMove = PentagoMove.rotationless(x, y);
        const state: PentagoState = this.rules.node.gameState;
        const postDropState: PentagoState = state.applyLegalDrop(drop);
        if (postDropState.neutralBlocks.length === 4) {
            return this.chooseMove(drop, state);
        }
        const gameStatus: GameStatus = this.rules.getGameStatus(this.rules.node);
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
                const arrows: [string, number, boolean][] = this.ARROWS.filter((arrow: [string, number, boolean]) => {
                    return arrow[1] === blockIndex;
                });
                this.arrows = this.arrows.concat(arrows);
            }
        }
    }
    public getBlockClasses(x: number, y: number): string[] {
        const blockIndex: number = x + 2 * y;
        if (this.movedBlock.equalsValue(blockIndex)) {
            return ['moved'];
        }
        return [];
    }
    public getSquareClasses(x: number, y: number): string[] {
        const classes: string[] = [];
        const player: string = this.getPlayerClass(this.board[y][x]);
        classes.push(player);
        if (this.lastDrop.equalsValue(new Coord(x, y))) {
            classes.push('last-move');
        }
        return classes;
    }
    public async rotate(arrow: [string, number, boolean]): Promise<MGPValidation> {
        const clockwise: string = arrow[2] ? 'clockwise' : 'counterclockwise';
        const clickValidity: MGPValidation = this.canUserPlay('#rotate_' + arrow[1] + '_' + clockwise);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const currentDrop: Coord = this.currentDrop.get();
        const move: PentagoMove = PentagoMove.withRotation(currentDrop.x, currentDrop.y, arrow[1], arrow[2]);
        return this.chooseMove(move, this.rules.node.gameState);
    }
    public async skipRotation(): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#skipRotation');
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const currentDrop: Coord = this.currentDrop.get();
        const drop: PentagoMove = PentagoMove.rotationless(currentDrop.x, currentDrop.y);
        return this.chooseMove(drop, this.rules.node.gameState);
    }
}
