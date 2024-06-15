import { Component } from '@angular/core';
import { MGPOptional, MGPValidation } from '@everyboard/lib';
import { HexagonalGameComponent } from 'src/app/components/game-components/game-component/HexagonalGameComponent';
import { Coord } from 'src/app/jscaip/Coord';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { HexaLayout } from 'src/app/jscaip/HexaLayout';
import { PointyHexaOrientation } from 'src/app/jscaip/HexaOrientation';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { MCTS } from 'src/app/jscaip/AI/MCTS';
import { HexagonalConnectionConfig, HexagonalConnectionRules } from './HexagonalConnectionRules';
import { HexagonalConnectionMove } from './HexagonalConnectionMove';
import { HexagonalConnectionState } from './HexagonalConnectionState';
import { HexagonalConnectionAlignmentHeuristic } from './HexagonalConnectionAlignmentHeuristic';
import { HexagonalConnectionMoveGenerator } from './HexagonalConnectionMoveGenerator';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { ViewBox } from 'src/app/components/game-components/GameComponentUtils';

@Component({
    selector: 'app-hexagonal-connection',
    templateUrl: './hexagonal-connection.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class HexagonalConnectionComponent extends HexagonalGameComponent<HexagonalConnectionRules,
                                                                         HexagonalConnectionMove,
                                                                         HexagonalConnectionState,
                                                                         FourStatePiece,
                                                                         HexagonalConnectionConfig>
{
    public droppedCoords: Coord[] = [];

    public lastMoved: Coord[] = [];

    public victoryCoords: Coord[] = [];

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.setRulesAndNode('HexagonalConnection');
        this.availableAIs = [
            new Minimax('Alignement Minimax',
                        this.rules,
                        new HexagonalConnectionAlignmentHeuristic(),
                        new HexagonalConnectionMoveGenerator()),
            new MCTS($localize`MCTS`,
                     new HexagonalConnectionMoveGenerator(),
                     this.rules),
        ];
        this.encoder = HexagonalConnectionMove.encoder;
        this.SPACE_SIZE = 30;
        this.setHexaLayout();
    }

    private setHexaLayout(): void {
        const halfStroke: number = this.STROKE_WIDTH / 2;
        const configSize: number = Math.floor(this.getState().getWidth() / 2);
        this.hexaLayout = new HexaLayout(this.SPACE_SIZE,
                                         //  new Coord(0.5 * this.SPACE_SIZE * configSize,
                                         //    this.SPACE_SIZE + halfStroke),
                                         new Coord((- this.STROKE_WIDTH * 1.5 * (configSize + 1)) + (Math.sqrt(2) * this.SPACE_SIZE),
                                                   this.SPACE_SIZE + halfStroke),
                                         PointyHexaOrientation.INSTANCE);
    }

    public getViewBox(): ViewBox {
        const abstractSize: number = this.getState().getWidth();
        console.log(abstractSize)
        const pieceSize: number = this.SPACE_SIZE * 1.5;
        const size: number = (this.SPACE_SIZE * 0.5) + (abstractSize * pieceSize);
        const configSize: number = Math.floor(abstractSize / 2);
        return new ViewBox(configSize * this.SPACE_SIZE, 0, size, size + this.STROKE_WIDTH);
    }

    public async updateBoard(_triggerAnimation: boolean): Promise<void> {
        this.setHexaLayout();
        const state: HexagonalConnectionState = this.getState();
        this.hexaBoard = state.getCopiedBoard();
        const config: MGPOptional<HexagonalConnectionConfig> = this.getConfig();
        this.victoryCoords = HexagonalConnectionRules.getVictoriousCoords(state, config);
    }

    public override async showLastMove(move: HexagonalConnectionMove): Promise<void> {
        this.lastMoved = move.coords.toList();
    }

    public override hideLastMove(): void {
        this.lastMoved = [];
    }

    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = await this.canUserPlay('#click-' + x + '-' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const totalDrop: number = this.getConfig().get().numberOfDrops;
        const clickedCoord: Coord = new Coord(x, y);
        if (this.getState().turn === 0) {
            const move: HexagonalConnectionMove = HexagonalConnectionMove.of([clickedCoord]);
            return this.chooseMove(move);
        } else {
            if (this.getState().getPieceAt(clickedCoord).isPlayer()) {
                return this.cancelMove(RulesFailure.MUST_CLICK_ON_EMPTY_SQUARE());
            } else if (this.droppedCoords.some((c: Coord) => c.equals(clickedCoord))) {
                return this.cancelMove();
            } else {
                this.droppedCoords = this.droppedCoords.concat(clickedCoord);
                if (this.droppedCoords.length === totalDrop) {
                    const move: HexagonalConnectionMove = HexagonalConnectionMove.of(this.droppedCoords);
                    return this.chooseMove(move);
                } else {
                    return MGPValidation.SUCCESS;
                }
            }
        }
    }

    public getSquareClasses(x: number, y: number): string[] {
        const coord: Coord = new Coord(x, y);
        const owner: PlayerOrNone = this.getState().getPieceAt(coord).getPlayer();
        const classes: string[] = [];
        classes.push(this.getPlayerClass(owner));
        if (this.victoryCoords.some((c: Coord) => c.equals(coord))) {
            classes.push('victory-stroke');
        }
        if (this.lastMoved.some((c: Coord) => c.equals(coord))) {
            classes.push('last-move-stroke');
        }
        return classes;
    }

    public override cancelMoveAttempt(): void {
        this.droppedCoords = [];
    }

    public isPiece(x: number, y: number): boolean {
        const coord: Coord = new Coord(x, y);
        const piece: FourStatePiece = this.getState().getPieceAt(coord);
        return piece.isPlayer();
    }

    public isBoard(piece: FourStatePiece): boolean {
        return piece.isReachable();
    }

}
