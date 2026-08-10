import { NgClass } from '@angular/common';
import { Component } from '@angular/core';

import { MGPFallible, MGPOptional, MGPValidation, Utils } from '@everyboard/lib';

import { ViewBox } from '../../components/game-components/GameComponentUtils';
import { RectangularGameComponent } from '../../components/game-components/rectangular-game-component/RectangularGameComponent';
import { Coord } from '../../jscaip/Coord';
import { Ordinal } from '../../jscaip/Ordinal';
import { Player } from '../../jscaip/Player';
import { PlayerNumberMap } from '../../jscaip/PlayerMap';
import { EmptyRulesConfig } from '../../jscaip/RulesConfigUtil';

import { MartianChessComponentUtils } from './MartianChessComponentUtils';
import { MartianChessMove } from './MartianChessMove';
import { MartianChessMoveGenerator } from './MartianChessMoveGenerator';
import { MartianChessPiece } from './MartianChessPiece';
import { MartianChessMoveResult, MartianChessRules } from './MartianChessRules';
import { MartianChessScoreHeuristic } from './MartianChessScoreHeuristic';
import { MartianChessState } from './MartianChessState';
import { MartianChessDroneComponent } from './martian-chess-drone.component';
import { MartianChessPawnComponent } from './martian-chess-pawn.component';
import { MartianChessQueenComponent } from './martian-chess-queen.component';

type SelectedPieceInfo = {
    selectedPiece: Coord;
    legalLandings: Coord[];
}
export type MartianChessFace = {
    readonly shape: MartianChessShape;
    readonly points: MartianChessPoint;
};
export type MartianChessShape = 'Star' | 'Polygon' | 'Circle';
export type MartianChessPoint = 'Concentric Circles' | 'Dots' | 'Horizontal Points';

/**
 * There is one pattern of space in the game that is used in MartianChess.
 * I'll call that pattern the "circle into chubby-square with contact but without overlap"
 * In this one, for a square of the game defined on a width of 100, and the stroke width defined to 8
 * the real used width is then 108, cause half of the stroke is "out".
 * When drawing a 3x3 board, its a width of 3x100 + half strokes on each side, so 308x308
 * The advantage is that by only drawing the empty squares you get a grid with all horizontal and vertical
 * and all inside and outside lines equals.
 * Then for those pattern it's better to think that we draw from the coord (-4, -4)
 * and that the width is 308.
 *
 * For the inside circle, its center must still be (50, 50), but is radius cannot be 50 to avoid overlap,
 * so you must remove one two halves of a stroke-width, one for circle stroke-outside-half,
 * and one for square stroke-inside-half
 */
@Component({
    selector: 'app-martian-chess',
    templateUrl: './martian-chess.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
    imports: [NgClass, MartianChessPawnComponent, MartianChessDroneComponent, MartianChessQueenComponent],
})
export class MartianChessComponent extends RectangularGameComponent<MartianChessRules,
                                                                    MartianChessMove,
                                                                    MartianChessState,
                                                                    MartianChessPiece,
                                                                    EmptyRulesConfig,
                                                                    MartianChessMoveResult>
{
    public INDICATOR_SIZE: number = 20;
    public readonly HORIZONTAL_CENTER: number = 0.5 * MartianChessState.WIDTH * MartianChessComponentUtils.SPACE_SIZE;
    private readonly UNSTROKED_HEIGHT: number = MartianChessState.HEIGHT * MartianChessComponentUtils.SPACE_SIZE;
    public readonly VERTICAL_CENTER: number = (0.5 * this.UNSTROKED_HEIGHT) + MartianChessComponentUtils.STROKE_WIDTH;

    public readonly LEFT: number = (MartianChessComponentUtils.SPACE_SIZE / -4) +
        (MartianChessComponentUtils.STROKE_WIDTH / -2);
    private readonly UNSTROKED_WIDTH: number = MartianChessState.WIDTH * MartianChessComponentUtils.SPACE_SIZE;
    public readonly UP: number = - MartianChessComponentUtils.STROKE_WIDTH / 2;
    public readonly WIDTH: number =
        this.UNSTROKED_WIDTH + (2.5 * MartianChessComponentUtils.SPACE_SIZE) + MartianChessComponentUtils.STROKE_WIDTH;
    public readonly HEIGHT: number = this.UNSTROKED_HEIGHT + (3 * MartianChessComponentUtils.STROKE_WIDTH);

    protected override computeViewBox(): ViewBox {
        return new ViewBox(this.LEFT, this.UP, this.WIDTH, this.HEIGHT);
    }

    public MartianChessComponent: typeof MartianChessComponent = MartianChessComponent;

    public style: MartianChessFace = {
        shape: 'Circle',
        points: 'Horizontal Points',
    };
    public readonly pieces: typeof MartianChessPiece = MartianChessPiece;

    public readonly configViewTranslation: string;
    public readonly configCogTransformation: string;

    public selectedPieceInfo: MGPOptional<SelectedPieceInfo> = MGPOptional.empty();

    private lastMoved: Coord[] = [];
    private captured: MGPOptional<Coord> = MGPOptional.empty();
    private promoted: MGPOptional<Coord> = MGPOptional.empty();

    public countDown: MGPOptional<number> = MGPOptional.empty();

    public callTheClock: boolean = false;

    public displayModePanel: boolean = false;

    public listOfStyles: { name: string; style: MartianChessFace }[] = [
        { name: 'Star', style: { shape: 'Star', points: 'Dots' } },
        { name: 'Polygon', style: { shape: 'Polygon', points: 'Concentric Circles' } },
        { name: 'Simple', style: { shape: 'Circle', points: 'Horizontal Points' } },
        { name: 'Circely', style: { shape: 'Circle', points: 'Concentric Circles' } },
    ];
    public clockNeedlesPoints: string;

    public constructor() {
        super();
        this.setRulesAndNode('MartianChess');
        this.aiConfig = {
            minimax: [{
                id: 'Score',
                name: $localize`Score`,
                heuristic: (): MartianChessScoreHeuristic => new MartianChessScoreHeuristic(),
                moveGenerator: (): MartianChessMoveGenerator => new MartianChessMoveGenerator(),
            }],
            mcts: [{
                id: 'default',
                name: $localize`MCTS`,
                moveGenerator: (): MartianChessMoveGenerator => new MartianChessMoveGenerator(),
            }],
        };
        this.encoder = MartianChessMove.encoder;
        this.hasAsymmetricBoard = true;
        this.scores = MGPOptional.of(PlayerNumberMap.of(0, 0));

        this.SPACE_SIZE = MartianChessComponentUtils.SPACE_SIZE;
        this.configCogTransformation = this.getConfigCogTransformation();
        this.configViewTranslation = this.getConfigViewTranslation();
        this.clockNeedlesPoints = this.getClockNeedlesPoints();
    }

    public getConfigViewTranslation(): string {
        const padding: number = 0;
        const translationX: number = (5.25 * this.SPACE_SIZE) + padding;
        const translationY: number = (7 * this.SPACE_SIZE) + padding + (2 * this.STROKE_WIDTH);
        return this.getSVGTranslation(translationX, translationY);
    }

    public getConfigCogTransformation(): string {
        const padding: number = this.STROKE_WIDTH;
        const wantedSize: number = this.SPACE_SIZE - padding;
        const scaler: number = wantedSize / 40;
        const scale: string = 'scale(' + scaler + ' ' + scaler +')';
        const translation: string = this.getSVGTranslation(padding, padding);
        return translation + ' ' + scale;
    }

    public getClockNeedlesPoints(): string {
        const c: number = 0.5 * this.SPACE_SIZE;
        const up: string = c + ' ' + (0.1 * this.SPACE_SIZE);
        const center: string = c + ' ' + c;
        const right: string = (0.75 * this.SPACE_SIZE) + ' ' + c;
        return up + ', ' + center + ', ' + right;
    }

    public override async updateBoard(_triggerAnimation: boolean): Promise<void> {
        this.state = this.getState();
        this.board = this.state.board;
        const scoreZero: number = this.state.getScoreOf(Player.ZERO);
        const scoreOne: number = this.state.getScoreOf(Player.ONE);
        this.countDown = this.state.countDown;
        this.scores = MGPOptional.of(PlayerNumberMap.of(scoreZero, scoreOne));
    }

    public override async showLastMove(move: MartianChessMove): Promise<void> {
        this.lastMoved = move.getCoords();
        const landing: Coord = move.getEnd();
        const previousPiece: MartianChessPiece = this.node.parent.get().gameState.getPieceAt(landing);
        const wasFilled: boolean = previousPiece !== MartianChessPiece.EMPTY;
        // Since now, current player is previous opponent
        const landingInOpponentTerritory: boolean = this.node.gameState.isInPlayerTerritory(landing);
        if (wasFilled) {
            if (landingInOpponentTerritory) {
                this.captured = MGPOptional.of(landing);
            } else {
                this.promoted = MGPOptional.of(landing);
            }
        }
    }

    public override hideLastMove(): void {
        this.lastMoved = [];
        this.captured = MGPOptional.empty();
        this.promoted = MGPOptional.empty();
    }

    public getPieceClasses(coord: Coord): string[] {
        const classes: string[] = [];
        classes.push(coord.y > 3 ? 'player0-fill' : 'player1-fill');
        if (this.selectedPieceInfo.isPresent() && this.selectedPieceInfo.get().selectedPiece.equals(coord)) {
            classes.push('selected-stroke');
        }
        if (this.promoted.equalsValue(coord)) {
            classes.push('last-move-stroke');
        }
        return classes;
    }

    public async onClick(coord: Coord): Promise<MGPValidation> {
        this.displayModePanel = false;
        const clickValidity: MGPValidation = await this.canUserPlay('#click-' + coord.x + '-' + coord.y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        if (this.selectedPieceInfo.isPresent()) {
            return this.secondClick(coord);
        } else {
            return this.firstClick(coord);
        }
    }

    private async firstClick(startCoord: Coord): Promise<MGPValidation> {
        if (this.isOneOfUsersPieces(startCoord)) {
            return this.selectAsFirstPiece(startCoord);
        } else {
            return this.cancelMove();
        }
    }

    private async selectAsFirstPiece(coord: Coord): Promise<MGPValidation> {
        const legalLandings: Coord[] = this.getLegalLandings(coord);
        this.selectedPieceInfo = MGPOptional.of({
            selectedPiece: coord,
            legalLandings,
        });
        return MGPValidation.SUCCESS;
    }

    private getLegalLandings(coord: Coord): Coord[] {
        const firstPiece: MartianChessPiece = this.state.getPieceAt(coord);
        let landingSquares: Coord[];
        if (firstPiece === MartianChessPiece.PAWN) {
            landingSquares = Ordinal.DIAGONALS.map((d: Ordinal) => coord.getNext(d));
        } else if (firstPiece === MartianChessPiece.DRONE) {
            landingSquares = this.getValidLinearLandingSquareUntil(coord, 2);
        } else {
            landingSquares = this.getValidLinearLandingSquareUntil(coord, MartianChessState.HEIGHT);
        }
        return landingSquares.filter((c: Coord) => {
            const moveCreated: MGPFallible<MartianChessMove> = MartianChessMove.from(coord, c);
            if (moveCreated.isSuccess()) {
                return this.rules.isLegal(moveCreated.get(), this.getState()).isSuccess();
            } else {
                return false;
            }
        });
    }

    private getValidLinearLandingSquareUntil(coord: Coord, until: number): Coord[] {
        return Ordinal.ORDINALS.flatMap((d: Ordinal) => {
            const landings: Coord[] = [];
            let landing: Coord = coord.getNext(d);
            let steps: number = 1;
            while (MartianChessState.isOnBoard(landing) && steps <= until) {
                landings.push(landing);
                if (this.getState().getPieceAt(landing) === MartianChessPiece.EMPTY) {
                    landing = landing.getNext(d);
                    steps++;
                } else {
                    break;
                }
            }
            return landings;
        });
    }

    private async secondClick(endCoord: Coord): Promise<MGPValidation> {
        const info: SelectedPieceInfo = this.selectedPieceInfo.get();
        if (info.selectedPiece.equals(endCoord)) {
            return this.cancelMove();
        } else if (info.legalLandings.some((c: Coord) => c.equals(endCoord))) {
            const move: MGPFallible<MartianChessMove> =
                MartianChessMove.from(info.selectedPiece, endCoord, this.callTheClock);
            Utils.assert(move.isSuccess(), 'MartianChessComponent or Rules did a mistake thinking this would have been a legal move!');
            return this.chooseMove(move.get());
        } else if (this.isOneOfUsersPieces(endCoord)) {
            return this.selectAsFirstPiece(endCoord);
        } else {
            const move: MGPFallible<MartianChessMove> =
                MartianChessMove.from(info.selectedPiece, endCoord, this.callTheClock);
            if (move.isSuccess()) {
                return this.chooseMove(move.get());
            } else {
                return this.cancelMove(move.getReason());
            }
        }
    }

    private isOneOfUsersPieces(coord: Coord): boolean {
        return this.state.getPieceAt(coord) !== MartianChessPiece.EMPTY &&
               this.state.isInPlayerTerritory(coord);
    }

    public override cancelMoveAttempt(): void {
        this.selectedPieceInfo = MGPOptional.empty();
        this.callTheClock = false;
    }

    public async onClockClick(): Promise<MGPValidation> {
        const clickValidity: MGPValidation = await this.canUserPlay('#clock-or-count-down-view');
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const canCallTheClock: boolean = this.getState().countDown.isAbsent();
        if (canCallTheClock) {
            this.callTheClock = this.callTheClock === false;
        }
        return MGPValidation.SUCCESS;
    }

    public getClockCircleClasses(): string[] {
        const classes: string[] = ['base'];
        if (this.callTheClock) {
            classes.push('selected-stroke');
        }
        if (this.getCurrentPlayer() === Player.ZERO) {
            classes.push('player0-stroke');
        } else {
            classes.push('player1-stroke');
        }
        return classes;
    }

    public getSquareClasses(square: Coord): string[] {
        const classes: string[] = ['base'];
        if (this.captured.equalsValue(square)) {
            classes.push('captured-fill');
        } else if (this.lastMoved.some((coord: Coord) => coord.equals(square))) {
            classes.push('moved-fill');
        }
        return classes;
    }

    public onModeCogClick(): void {
        this.displayModePanel = this.displayModePanel === false;
    }

    public chooseStyle(n: number): void {
        this.style = this.listOfStyles[n].style;
        this.displayModePanel = false;
    }

    public getPieceTranslation(coord: Coord): string {
        const cx: number = coord.x * this.SPACE_SIZE;
        let cy: number = coord.y * this.SPACE_SIZE;
        if (coord.y > 3) {
            // Need to take into account the double stroke of the middle of the board
            cy += 2 * this.STROKE_WIDTH;
        }
        return this.getSVGTranslation(cx, cy);
    }

    public getBoardTransformation(): string {
        const translation: string = this.getSVGTranslation(this.SPACE_SIZE, 0);
        const rotation: string = 'rotate(' + (this.getPointOfView().getValue() * 180) + ' ' + this.HORIZONTAL_CENTER + ' ' + this.VERTICAL_CENTER + ')';
        return translation + ' ' + rotation;
    }

    public getCapturesTransformation(player: Player): string {
        const scale: string = 'scale(0.5, 0.5)';
        const translationX: number = - this.SPACE_SIZE / 2;
        let translationY: number = this.SPACE_SIZE / 2;
        if (player === this.getPointOfView()) {
            translationY += (10 * this.SPACE_SIZE) + (4 * this.STROKE_WIDTH);
        }
        const translation: string = this.getSVGTranslation(translationX, translationY);
        return scale + ' ' + translation;
    }

}
