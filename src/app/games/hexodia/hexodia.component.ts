import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { MGPValidation } from '@everyboard/lib';

import { ViewBox } from '../../components/game-components/GameComponentUtils';
import { ClickHandler } from '../../components/game-components/game-component/ClickHandler';
import { HexagonalGameComponent } from '../../components/game-components/game-component/HexagonalGameComponent';
import { Coord } from '../../jscaip/Coord';
import { FourStatePiece } from '../../jscaip/FourStatePiece';
import { HexaLayout } from '../../jscaip/HexaLayout';
import { PointyHexaOrientation } from '../../jscaip/HexaOrientation';
import { PlayerOrNone } from '../../jscaip/Player';
import { RulesFailure } from '../../jscaip/RulesFailure';
import { FourStatePieceGameStateWithTable } from '../../jscaip/state/FourStatePieceGameStateWithTable';

import { HexodiaAlignmentHeuristic } from './HexodiaAlignmentHeuristic';
import { HexodiaMove } from './HexodiaMove';
import { HexodiaMoveGenerator } from './HexodiaMoveGenerator';
import { HexodiaConfig, HexodiaRules } from './HexodiaRules';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-hexodia',
    templateUrl: './hexodia.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
    imports: [NgClass],
})
export class HexodiaComponent extends HexagonalGameComponent<HexodiaRules,
                                                             HexodiaMove,
                                                             FourStatePieceGameStateWithTable,
                                                             FourStatePiece,
                                                             HexodiaConfig>
{
    public droppedCoords: Coord[] = [];

    public lastMoved: Coord[] = [];

    public victoryCoords: Coord[] = [];

    public constructor() {
        super('Hexodia');
        this.aiConfig = {
            minimax: [{
                id: 'Alignment',
                name: $localize`Alignment`,
                heuristic: (): HexodiaAlignmentHeuristic => new HexodiaAlignmentHeuristic(),
                moveGenerator: (): HexodiaMoveGenerator => new HexodiaMoveGenerator(),
            }],
            mcts: [{
                id: 'default',
                name: $localize`MCTS`,
                moveGenerator: (): HexodiaMoveGenerator => new HexodiaMoveGenerator(),
            }],
        };
        this.encoder = HexodiaMove.encoder;
        this.SPACE_SIZE = 30;
        this.setHexaLayout();
    }

    private setHexaLayout(): void {
        const halfStroke: number = this.STROKE_WIDTH / 2;
        const configSize: number = Math.floor(this.getState().getWidth() / 2);
        const hexaLayoutStartX: number =
            (- halfStroke * (configSize + 1)) + (Math.sqrt(2) * this.SPACE_SIZE);
        const hexaLayoutStartY: number = this.SPACE_SIZE + halfStroke;
        const hexaLayoutStartingCoord: Coord = new Coord(hexaLayoutStartX, hexaLayoutStartY);
        this.hexaLayout = new HexaLayout(this.SPACE_SIZE,
                                         hexaLayoutStartingCoord,
                                         PointyHexaOrientation.INSTANCE);
    }

    protected override computeViewBox(): ViewBox {
        const abstractSize: number = this.getState().getWidth();
        const pieceSize: number = this.SPACE_SIZE * 1.5;
        const size: number = (this.SPACE_SIZE * 0.5) + (abstractSize * pieceSize);
        const configSize: number = Math.floor(abstractSize / 2);
        const halfStroke: number = this.STROKE_WIDTH / 2;
        const left: number = ((configSize - 1) * (this.SPACE_SIZE - halfStroke)) - (1.25 * this.STROKE_WIDTH);
        const width: number = size + (1.75 * configSize * this.STROKE_WIDTH);
        const height: number = size + this.STROKE_WIDTH;
        return new ViewBox(left, 0, width, height);
    }

    public override async updateBoard(_triggerAnimation: boolean): Promise<void> {
        const state: FourStatePieceGameStateWithTable = this.getState();
        this.hexaBoard = state.getCopiedBoard();
        const config: HexodiaConfig = this.config();
        this.victoryCoords = HexodiaRules.getVictoriousCoords(state, config);
    }

    protected override async showLastMove(move: HexodiaMove): Promise<void> {
        this.lastMoved = move.coords.toList();
    }

    public override hideLastMove(): void {
        this.lastMoved = [];
    }

    @ClickHandler((coord: Coord) => '#click-' + coord.x + '-' + coord.y)
    public async onClick(coord: Coord): Promise<MGPValidation> {
        const totalDrop: number = this.config().numberOfDrops;
        if (this.getState().turn === 0) {
            const move: HexodiaMove = HexodiaMove.of([coord]);
            return this.chooseMove(move);
        } else {
            if (this.getState().getPieceAt(coord).isPlayer()) {
                return this.cancelMove(RulesFailure.MUST_CLICK_ON_EMPTY_SQUARE());
            } else if (this.droppedCoords.some((c: Coord) => c.equals(coord))) {
                return this.cancelMove();
            } else {
                this.droppedCoords = this.droppedCoords.concat(coord);
                if (this.droppedCoords.length === totalDrop) {
                    const move: HexodiaMove = HexodiaMove.of(this.droppedCoords);
                    return this.chooseMove(move);
                } else {
                    return MGPValidation.SUCCESS;
                }
            }
        }
    }

    public getSquareClassesAt(coord: Coord): string[] {
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

    public isReachable(piece: FourStatePiece): boolean {
        return piece.isReachable();
    }

}
