import { NgClass } from '@angular/common';
import { Component } from '@angular/core';

import { Coord } from '@everyboard/games';
import { FourStatePiece } from '@everyboard/games';
import { Player } from '@everyboard/games';
import { SaharaCapturedThenCapturedFreedomThenAllFreedomsHeuristic } from '@everyboard/games';
import { SaharaFailure } from '@everyboard/games';
import { SaharaFreedomHeuristic } from '@everyboard/games';
import { SaharaMobilityHeuristic } from '@everyboard/games';
import { SaharaMove } from '@everyboard/games';
import { SaharaMoveGenerator } from '@everyboard/games';
import { SaharaRules } from '@everyboard/games';
import { SaharaState } from '@everyboard/games';
import { MGPFallible, MGPOptional, MGPValidation } from '@everyboard/lib';

import { ViewBox } from '../../components/game-components/GameComponentUtils';
import { ClickHandler } from '../../components/game-components/game-component/ClickHandler';
import { TriangularGameComponent } from '../../components/game-components/game-component/TriangularGameComponent';

@Component({
    selector: 'app-sahara',
    templateUrl: './sahara.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
    imports: [NgClass],
})
export class SaharaComponent extends TriangularGameComponent<SaharaRules,
                                                             SaharaMove,
                                                             SaharaState,
                                                             FourStatePiece>
{
    protected override computeViewBox(): ViewBox {
        const state: SaharaState = this.getState();
        const width: number = ((state.getWidth() + 1) / 2) * this.SPACE_SIZE;
        const height: number = state.getHeight() * this.SPACE_SIZE;
        return ViewBox
            .fromLimits(0, width, 0, height)
            .expandAll(this.STROKE_WIDTH / 2);
    }

    public lastCoord: MGPOptional<Coord> = MGPOptional.empty();

    public lastMoved: MGPOptional<Coord> = MGPOptional.empty();

    public chosenCoord: MGPOptional<Coord> = MGPOptional.empty();

    public possibleLandings: Coord[] = [];

    public constructor() {
        super();
        this.setRulesAndNode('Sahara');
        this.aiConfig = {
            minimax: [{
                id: 'capture-freedom',
                name: $localize`Capture > Captured Freedom > All Freedoms`,
                heuristic: (): SaharaCapturedThenCapturedFreedomThenAllFreedomsHeuristic =>
                    new SaharaCapturedThenCapturedFreedomThenAllFreedomsHeuristic(SaharaRules.get()),
                moveGenerator: (): SaharaMoveGenerator => new SaharaMoveGenerator(),
                useRandomness: true,
            }, {
                id: 'freedom',
                name: $localize`Freedom`,
                heuristic: (): SaharaFreedomHeuristic => new SaharaFreedomHeuristic(),
                moveGenerator: (): SaharaMoveGenerator => new SaharaMoveGenerator(),
            }, {
                id: 'mobility',
                name: $localize`Mobility`,
                heuristic: (): SaharaMobilityHeuristic => new SaharaMobilityHeuristic(SaharaRules.get()),
                moveGenerator: (): SaharaMoveGenerator => new SaharaMoveGenerator(),
            }],
            mcts: [{
                id: 'default',
                name: $localize`Default`,
                moveGenerator: (): SaharaMoveGenerator => new SaharaMoveGenerator(),
            }],
        };
        this.encoder = SaharaMove.encoder;
    }

    public override async showLastMove(move: SaharaMove): Promise<void> {
        this.lastCoord = MGPOptional.of(move.getStart());
        this.lastMoved = MGPOptional.of(move.getEnd());
    }

    public override hideLastMove(): void {
        this.lastCoord = MGPOptional.empty();
        this.lastMoved = MGPOptional.empty();
    }

    public override cancelMoveAttempt(): void {
        this.possibleLandings = [];
        this.chosenCoord = MGPOptional.empty();
    }

    @ClickHandler((x: number, y: number) => `#click-${ x }-${ y }`)
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const currentPlayer: Player = this.getState().getCurrentPlayer();
        const player: FourStatePiece = FourStatePiece.ofPlayer(currentPlayer);
        if (this.chosenCoord.equalsValue(new Coord(x, y))) {
            return this.cancelMove();
        } else if (this.chosenCoord.isAbsent() ||
                  this.board[y][x] === player)
        { // Must select pyramid
            return this.choosePiece(x, y);
        } else { // Must choose empty landing space
            return this.chooseLandingCoord(x, y);
        }
    }

    private async choosePiece(x: number, y: number): Promise<MGPValidation> {
        if (this.board[y][x] === FourStatePiece.EMPTY) { // Did not select pyramid
            return this.cancelMove(SaharaFailure.MUST_CHOOSE_PYRAMID_FIRST());
        } else if (this.board[y][x].is(Player.ofTurn(this.getTurn()))) { // selected player's pyramid
            const coord: Coord = new Coord(x, y);
            this.selectPiece(coord);
            return MGPValidation.SUCCESS;
        } else { // Selected opponent pyramid
            return this.cancelMove(SaharaFailure.MUST_CHOOSE_OWN_PYRAMID());
        }
    }

    private selectPiece(coord: Coord): void {
        this.chosenCoord = MGPOptional.of(coord);
        this.possibleLandings = this.rules.getLegalLandingCoords(this.getState(), coord);
    }

    private async chooseLandingCoord(x: number, y: number): Promise<MGPValidation> {
        const clickedCoord: Coord = new Coord(x, y);
        const newMove: MGPFallible<SaharaMove> = SaharaMove.from(this.chosenCoord.get(), clickedCoord);
        if (newMove.isFailure()) {
            return this.cancelMove(newMove.getReason());
        }
        return await this.chooseMove(newMove.get());
    }

    public override async updateBoard(_triggerAnimation: boolean): Promise<void> {
        this.board = this.getState().board;
    }

    public getPlayerClassAtXY(x: number, y: number): string {
        const piece: FourStatePiece = this.getState().getPieceAtXY(x, y);
        return this.getPlayerClass(piece.getPlayer());
    }

}
