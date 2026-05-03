import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { HexagonalGameComponent } from 'src/app/components/game-components/game-component/HexagonalGameComponent';
import { HexaLayout } from 'src/app/jscaip/HexaLayout';
import { PointyHexaOrientation } from 'src/app/jscaip/HexaOrientation';

import { MGPOptional, MGPValidation, Utils } from '@everyboard/lib';

import { ViewBox } from '../../../components/game-components/GameComponentUtils';
import { ScoreName } from '../../../components/game-components/game-component/GameComponent';
import { MCTS } from '../../../jscaip/AI/MCTS';
import { GroupData } from '../../../jscaip/BoardData';
import { Coord } from '../../../jscaip/Coord';
import { PlayerNumberMap } from '../../../jscaip/PlayerMap';
import { Debug } from '../../../utils/Debug';
import { GoLegalityInformation } from '../AbstractGoRules';
import { GoMove } from '../GoMove';
import { GoPhase } from '../GoPhase';
import { GoPiece } from '../GoPiece';
import { GoState } from '../GoState';

import { HexagonalGoMinimax } from './HexagonalGoMinimax';
import { HexagonalGoMoveGenerator } from './HexagonalGoMoveGenerator';
import { HexagonalGoConfig, HexagonalGoRules } from './HexagonalGoRules';

@Component({
    selector: 'app-hexagonal-go',
    templateUrl: './hexagonal-go.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
    imports: [NgClass],
})
@Debug.log
export class HexagonalGoComponent extends HexagonalGameComponent<HexagonalGoRules,
                                                                 GoMove,
                                                                 GoState,
                                                                 GoPiece,
                                                                 HexagonalGoConfig,
                                                                 GoLegalityInformation>
{

    public boardInfo: GroupData<GoPiece>;

    public ko: MGPOptional<Coord> = MGPOptional.empty();

    public last: MGPOptional<Coord> = MGPOptional.empty();

    public captures: Coord[]= [];

    public GoPiece: typeof GoPiece = GoPiece;

    public constructor() {
        super();
        this.setRulesAndNode('HexagonalGo');
        this.availableAIs = [
            new HexagonalGoMinimax(),
            new MCTS($localize`MCTS`, new HexagonalGoMoveGenerator(), this.rules),
        ];
        this.encoder = GoMove.encoder;
        this.canPass = true;
        this.scores = MGPOptional.of(PlayerNumberMap.of(0, 0));
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

    public override async showLastMove(move: GoMove): Promise<void> {
        this.last = MGPOptional.of(move.coord);
        this.showCaptures();
    }

    public override hideLastMove(): void {
        this.captures = [];
        this.last = MGPOptional.empty();
    }

    public getViewBox(): ViewBox {
        return ViewBox.fromHexa(
            this.getState().allCoords(),
            this.hexaLayout,
            this.STROKE_WIDTH,
        )
            .expandAbove(this.SPACE_SIZE)
            .expandBelow(this.SPACE_SIZE);
    }

    public async onClick(coord: Coord): Promise<MGPValidation> {
        const x: number = coord.x;
        const y: number = coord.y;
        const clickValidity: MGPValidation = await this.canUserPlay('#click-' + x + '-' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const resultlessMove: GoMove = new GoMove(x, y);
        return this.chooseMove(resultlessMove);
    }

    public override async updateBoard(_triggerAnimation: boolean): Promise<void> {
        const state: GoState = this.getState();
        const phase: GoPhase = state.phase;

        this.hexaBoard = state.getCopiedBoard();
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
            const isEmpty: boolean = this.hexaBoard[coord.y][coord.x] === GoPiece.EMPTY;
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
                     'HexagonalGoComponent: pass() must be called only in playing, passed, counting, or accept phases');
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

    public getTerritoryHexagonalTransform(): string {
        return 'scale(0.6) ';
    }

    public getHexaDiagonalPoints(): string {
        return this.hexaLayout.getHexaDiagonalPoints();
    }

}
