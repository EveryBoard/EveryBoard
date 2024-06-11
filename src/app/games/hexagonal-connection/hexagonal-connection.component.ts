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
import { HexagonalConnectionDrops, HexagonalConnectionFirstMove, HexagonalConnectionMove } from './HexagonalConnectionMove';
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
    public droppedCoord: MGPOptional<Coord> = MGPOptional.empty();

    public lastMoved: Coord[] = [];

    public victoryCoords: Coord[] = [];

    public getViewBox(): ViewBox {
        return new ViewBox(-120, 0, 600, 600);
    }

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
        this.hexaLayout = new HexaLayout(this.SPACE_SIZE,
                                         new Coord(- 8 * this.SPACE_SIZE, 2 * this.SPACE_SIZE),
                                         PointyHexaOrientation.INSTANCE);
    }

    public async updateBoard(_triggerAnimation: boolean): Promise<void> {
        const state: HexagonalConnectionState = this.getState();
        this.hexaBoard = state.getCopiedBoard();
        const config: MGPOptional<HexagonalConnectionConfig> = this.getConfig();
        this.victoryCoords = HexagonalConnectionRules.getVictoriousCoords(state, config);
    }

    public override async showLastMove(move: HexagonalConnectionMove): Promise<void> {
        if (move instanceof HexagonalConnectionFirstMove) {
            this.lastMoved = [move.coord];
        } else {
            this.lastMoved = [move.getFirst(), move.getSecond()];
        }
    }

    public override hideLastMove(): void {
        this.lastMoved = [];
    }

    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = await this.canUserPlay('#click-' + x + '-' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const clickedCoord: Coord = new Coord(x, y);
        if (this.getState().turn === 0) {
            const move: HexagonalConnectionMove = HexagonalConnectionFirstMove.of(clickedCoord);
            return this.chooseMove(move);
        } else {
            if (this.getState().getPieceAt(clickedCoord).isPlayer()) {
                return this.cancelMove(RulesFailure.MUST_CLICK_ON_EMPTY_SQUARE());
            } else if (this.droppedCoord.isPresent()) {
                if (this.droppedCoord.equalsValue(clickedCoord)) {
                    return this.cancelMove();
                } else {
                    const move: HexagonalConnectionMove =
                        HexagonalConnectionDrops.of(this.droppedCoord.get(), clickedCoord);
                    return this.chooseMove(move);
                }
            } else {
                this.droppedCoord = MGPOptional.of(clickedCoord);
                return MGPValidation.SUCCESS;
            }
        }
    }

    public getSquareClasses(x: number, y: number): string[] {
        const coord: Coord = new Coord(x, y);
        const owner: PlayerOrNone = this.getState().getPieceAt(coord).getPlayer();
        const classes: string[] = [];
        if (this.droppedCoord.equalsValue(coord)) {
            classes.push(this.getPlayerClass(this.getState().getCurrentPlayer()));
            classes.push('highlighted-stroke');
        } else {
            classes.push(this.getPlayerClass(owner));
            if (this.victoryCoords.some((c: Coord) => c.equals(coord))) {
                classes.push('victory-stroke');
            }
            if (this.lastMoved.some((c: Coord) => c.equals(coord))) {
                classes.push('last-move-stroke');
            }
        }
        return classes;
    }

    public getPieceClasses(x: number, y: number): string[] {
        return [];
    }

    public override cancelMoveAttempt(): void {
        this.droppedCoord = MGPOptional.empty();
    }

    public isPiece(x: number, y: number): boolean {
        const coord: Coord = new Coord(x, y);
        const piece: FourStatePiece = this.getState().getPieceAt(coord);
        if (piece.isPlayer()) {
            return true;
        } else if (this.droppedCoord.equalsValue(coord)) {
            return true;
        } else {
            return false;
        }
    }

    public isBoard(piece: FourStatePiece): boolean {
        return piece.isReachable();
    }

}
