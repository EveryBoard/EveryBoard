import { NgClass } from '@angular/common';
import { Component } from '@angular/core';

import { PlayerNumberMap } from '@everyboard/games';
import { MGPOptional, MGPValidation, Utils } from '@everyboard/lib';

import { ViewBox } from '../../../components/game-components/GameComponentUtils';
import { ClickHandler } from '../../../components/game-components/game-component/ClickHandler';
import { ScoreName } from '../../../components/game-components/game-component/ScoreName';
import { TriangularGameComponent } from '../../../components/game-components/game-component/TriangularGameComponent';
import { GroupData } from '../../../jscaip/BoardData';
import { Coord } from '../../../jscaip/Coord';
import { TableUtils } from '../../../jscaip/TableUtils';
import { TriangularCheckerBoard } from '../../../jscaip/state/TriangularCheckerBoard';
import { Debug } from '../../../utils/Debug';
import { GoLegalityInformation } from '../AbstractGoRules';
import { GoMove } from '../GoMove';
import { GoPhase } from '../GoPhase';
import { GoPiece } from '../GoPiece';
import { GoState } from '../GoState';

import { TriangularGoHeuristic } from './TriangularGoHeuristic';
import { TriangularGoMoveGenerator } from './TriangularGoMoveGenerator';
import { TriangularGoConfig, TriangularGoRules } from './TriangularGoRules';

@Component({
    selector: 'app-triangular-go',
    templateUrl: './triangular-go.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
    imports: [NgClass],
})
@Debug.log
export class TriangularGoComponent extends TriangularGameComponent<TriangularGoRules,
                                                                   GoMove,
                                                                   GoState,
                                                                   GoPiece,
                                                                   TriangularGoConfig,
                                                                   GoLegalityInformation>
{

    public boardInfo: GroupData<GoPiece>;

    public ko: MGPOptional<Coord> = MGPOptional.empty();

    public last: MGPOptional<Coord> = MGPOptional.empty();

    public captures: Coord[]= [];

    public GoPiece: typeof GoPiece = GoPiece;

    public constructor() {
        super();
        this.setRulesAndNode('TriangularGo');
        this.aiConfig = {
            minimax: [{
                id: 'Territory',
                name: $localize`Territory`,
                heuristic: (): TriangularGoHeuristic => new TriangularGoHeuristic(),
                moveGenerator: (): TriangularGoMoveGenerator => new TriangularGoMoveGenerator(),
            }],
            mcts: [{
                id: 'default',
                name: $localize`MCTS`,
                moveGenerator: (): TriangularGoMoveGenerator => new TriangularGoMoveGenerator(),
            }],
        };
        this.encoder = GoMove.encoder;
        this.canPass = true;
        this.scores = MGPOptional.of(PlayerNumberMap.of(0, 0));
    }

    public override async showLastMove(move: GoMove): Promise<void> {
        this.last = MGPOptional.of(move.coord);
        this.showCaptures();
    }

    public override hideLastMove(): void {
        this.captures = [];
        this.last = MGPOptional.empty();
    }

    public getViewBox(): ViewBox {
        const state: GoState = this.getState();
        const leftmostOccupiedX: number = TableUtils.getLeftmostMatchColumn(state.board, GoPiece.isReachable).get();
        const width: number = state.board[0].length;
        const occupiedWidth: number = width - leftmostOccupiedX;
        const abstractSize: number = occupiedWidth / 2;
        const oddnessOffset: number = 0.5 * this.SPACE_SIZE * (occupiedWidth % 2);
        const evennessOffset: number = leftmostOccupiedX * 0.5 * this.SPACE_SIZE;
        return new ViewBox(
            evennessOffset,
            0,
            (this.SPACE_SIZE * abstractSize) + oddnessOffset,
            this.SPACE_SIZE * state.getHeight(),
        ).expandAll(this.STROKE_WIDTH / 2);
    }

    @ClickHandler((coord: Coord) => '#click-' + coord.x + '-' + coord.y)
    public async onClick(coord: Coord): Promise<MGPValidation> {
        const resultlessMove: GoMove = new GoMove(coord.x, coord.y);
        return this.chooseMove(resultlessMove);
    }

    public override async updateBoard(_triggerAnimation: boolean): Promise<void> {
        const state: GoState = this.getState();
        const phase: GoPhase = state.phase;

        this.board = state.getCopiedBoard();
        this.updateScores();

        this.ko = state.koCoord;
        this.canPass = phase.allowsPass();
    }

    private updateScores(): void {
        this.scores = MGPOptional.of(this.getState().captured);
    }

    protected override getScoreName(): ScoreName {
        return this.getState().phase.getScoreName();
    }

    private showCaptures(): void {
        const previousState: GoState = this.getPreviousState();
        this.captures = [];
        for (const coordAndContent of this.getState().getCoordsAndContents()) {
            const coord: Coord = coordAndContent.coord;
            const wasOccupied: boolean = previousState.getPieceAt(coord).isOccupied();
            const isEmpty: boolean = this.board[coord.y][coord.x] === GoPiece.EMPTY;
            const isNotKo: boolean = this.ko.equalsValue(coord) === false;
            if (wasOccupied && isEmpty && isNotKo) {
                this.captures.push(coord);
            }
        }
    }

    public override async pass(): Promise<MGPValidation> {
        const phase: GoPhase = this.getState().phase;
        if (phase.isPlaying() || phase.isPassed()) {
            return this.onClick(GoMove.PASS.coord);
        }
        Utils.assert(phase.isCounting() || phase.isAccept(),
                     'TriangularGoComponent: pass() must be called only in playing, passed, counting, or accept phases');
        return this.onClick(GoMove.ACCEPT.coord);
    }

    public getPlayerClassAt(coord: Coord): string[] {
        const piece: GoPiece = this.getState().getPieceAt(coord);
        const classes: string[] = [];
        if (this.captures.some((c: Coord) => c.equals(coord))) {
            classes.push('captured-fill');
        }
        if (piece.isOccupied()) {
            classes.push(this.getPlayerClass(piece.player));
        }
        return classes;
    }

    public getTerritoryTriangleTransform(coord: Coord): string {
        let y: number;
        if (this.isUpward(coord)) {
            y = 25;
        } else {
            y = 15;
        }
        return this.getSVGTranslation(20, y) + ' scale(0.6)';
    }

    public isUpward(coord: Coord): boolean {
        return TriangularCheckerBoard.isSpaceDark(coord);
    }

    public isDownward(coord: Coord): boolean {
        return TriangularCheckerBoard.isSpaceDark(coord) === false;
    }

    public getKoTranslationAt(koCoord: Coord): string {
        const koTranslationCoord: Coord = this.getKoTranslationCoordAt(koCoord);
        return this.getSVGTranslationAt(koTranslationCoord);
    }

    private getKoTranslationCoordAt(koCoord: Coord): Coord {
        if (this.isUpward(koCoord)) {
            return this.getTriangleTranslationCoord(koCoord).getNext(new Coord(0, 25));
        } else {
            return this.getTriangleTranslationCoord(koCoord);
        }
    }

}
