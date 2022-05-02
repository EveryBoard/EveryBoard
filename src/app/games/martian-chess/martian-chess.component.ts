import { Component } from '@angular/core';
import { RectangularGameComponent } from 'src/app/components/game-components/rectangular-game-component/RectangularGameComponent';
import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { MartianChessDummyMinimax } from './MartianChessDummyMinimax';
import { MartianChessMove } from './MartianChessMove';
import { MartianChessMoveResult, MartianChessNode, MartianChessRules } from './MartianChessRules';
import { MartianChessState } from './MartianChessState';
import { MartianChessPiece } from './MartianChessPiece';
import { MartianChessTutorial } from './MartianChessTutorial';

export type MartianChessFace = {
    readonly shape: MartianChessShape,
    readonly points: MartianChessPoint,
};
export type MartianChessShape = 'Star' | 'Polygon' | 'Circle';
export type MartianChessPoint = 'Concentric Circles' | 'Dots' | 'Horizontal Points';

@Component({
    selector: 'app-martian-chess',
    templateUrl: './martian-chess.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class MartianChessComponent extends RectangularGameComponent<MartianChessRules,
                                                                    MartianChessMove,
                                                                    MartianChessState,
                                                                    MartianChessPiece,
                                                                    MartianChessMoveResult>
{

    public static SPACE_SIZE: number = 100;
    public static STROKE_WIDTH: number = 8;

    public MartianChessComponent: typeof MartianChessComponent = MartianChessComponent;

    public style: MartianChessFace = {
        shape: 'Circle',
        points: 'Horizontal Points',
    };
    public readonly pieces: typeof MartianChessPiece = MartianChessPiece;

    public state: MartianChessState;

    public readonly configViewTranslation: string;
    public readonly configCogTransformation: string;

    private selectedPiece: MGPOptional<Coord> = MGPOptional.empty();

    public countDown: MGPOptional<number> = MGPOptional.empty();

    public callTheClock: boolean = false;

    public displayModePanel: boolean = false;

    public listOfStyles: { name: string, style: MartianChessFace }[] = [
        { name: 'Star', style: { shape: 'Star', points: 'Dots' } },
        { name: 'Polygon', style: { shape: 'Polygon', points: 'Concentric Circles' } },
        { name: 'Simple', style: { shape: 'Circle', points: 'Horizontal Points' } },
        { name: 'Circely', style: { shape: 'Circle', points: 'Concentric Circles' } },
    ];
    public clockNeedlesPoints: string;

    public static getRegularPolygon(nbSide: number, yOffset: number = 0): string {
        const coords: Coord[] = MartianChessComponent.getRegularPolygonCoords(nbSide, yOffset);
        return MartianChessComponent.mapCoordsToString(coords);
    }
    public static getNPointedStar(nbSide: number, degreeOffset: number): string {
        const coords: Coord[] = this.getNPointedStarCoords(nbSide, degreeOffset);
        return MartianChessComponent.mapCoordsToString(coords);
    }
    private static getNPointedStarCoords(nbSide: number, degreeOffset: number): Coord[] {
        const points: Coord[] = [];
        const cx: number = 0.5 * MartianChessComponent.SPACE_SIZE;
        const cy: number = 0.5 * MartianChessComponent.SPACE_SIZE;
        nbSide *= 2;
        for (let indexDot: number = 0; indexDot < nbSide; indexDot++) {
            const degree: number = (indexDot * (360 / nbSide)) + degreeOffset;
            const radian: number = (degree / 180) * Math.PI;
            const radius: number = (indexDot % 2 === 0) ?
                MartianChessComponent.SPACE_SIZE/2 :
                MartianChessComponent.SPACE_SIZE/6;
            const px: number = cx + (0.8 * radius * Math.cos(radian));
            const py: number = cy + (0.8 * radius * Math.sin(radian));
            points.push(new Coord(px, py));
        }
        return points;
    }
    /**
     * coord are based on a 100 x 100 containing square, in which the shape is centered
     * yOffset describe the offset "pixel wise" (concrete offset in "svg unit")
     */
    public static getRegularPolygonCoords(nbSide: number, yOffset: number = 0): Coord[] {
        const points: Coord[] = [];
        const cx: number = 0.5 * MartianChessComponent.SPACE_SIZE;
        const cy: number = 0.5 * MartianChessComponent.SPACE_SIZE;
        for (let indexCorner: number = 0; indexCorner < nbSide; indexCorner++) {
            const degree: number = (indexCorner * (360 / nbSide)) - 90;
            const radian: number = (degree / 180) * Math.PI;
            const radius: number = 0.5 * MartianChessComponent.SPACE_SIZE;
            const px: number = cx + (0.8 * radius * Math.cos(radian));
            const py: number = cy + (0.8 * radius * Math.sin(radian)) + yOffset;
            points.push(new Coord(px, py));
        }
        return points;
    }
    public static mapCoordsToString(coords: Coord[]): string {
        let points: string = '';
        for (const coord of coords) {
            points += coord.x + ', ' + coord.y + ' ';
        }
        return points;
    }
    public static getRadius(circle: number): number {
        return this.SPACE_SIZE * circle / 10;
    }
    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.rules = new MartianChessRules(MartianChessState);
        this.availableMinimaxes = [
            new MartianChessDummyMinimax(this.rules, 'Martian Chess Dummy Minimax'),
        ];
        this.SPACE_SIZE = MartianChessComponent.SPACE_SIZE;
        this.configCogTransformation = this.getConfigCogTransformation();
        this.configViewTranslation = this.getConfigViewTranslation();
        this.clockNeedlesPoints = this.getClockNeedlesPoints();
        this.encoder = MartianChessMove.encoder;
        this.tutorial = new MartianChessTutorial().tutorial;
        this.scores = MGPOptional.of([0, 0]);
        this.updateBoard();
    }
    public getConfigViewTranslation(): string {
        const padding: number = 0;
        const xTranslate: number = (5 * this.SPACE_SIZE) + padding;
        const yTranslate: number = (7 * this.SPACE_SIZE) + padding + (2 * this.STROKE_WIDTH);
        const translate: string = 'translate(' + xTranslate + ', ' + yTranslate + ')';
        return translate;
    }
    public getConfigCogTransformation(): string {
        const padding: number = this.STROKE_WIDTH;
        const wantedSize: number = this.SPACE_SIZE - padding;
        const scaler: number = wantedSize / 512;
        const scale: string = 'scale(' + scaler + ' ' + scaler +')';
        const translate: string = 'translate(' + (3 * padding) + ', ' + (3 * padding) + ')';
        return scale + ' ' + translate;
    }
    public getClockNeedlesPoints(): string {
        const c: number = 0.5 * this.SPACE_SIZE;
        const up: string = c + ' ' + (0.1 * this.SPACE_SIZE);
        const center: string = c + ' ' + c;
        const right: string = (0.75 * this.SPACE_SIZE) + ' ' + c;
        return up + ', ' + center + ', ' + right;
    }
    public updateBoard(): void {
        this.state = this.rules.node.gameState;
        this.board = this.state.board;
        const scoreZero: number = this.state.getScoreOf(Player.ZERO);
        const scoreOne: number = this.state.getScoreOf(Player.ONE);
        this.countDown = this.state.countDown;
        this.scores = MGPOptional.of([scoreZero, scoreOne]);
    }
    public getPieceLocation(x: number, y: number): string {
        const cx: number = this.SPACE_SIZE * x;
        const cy: number = this.SPACE_SIZE * y;
        return 'translate(' + cx + ', ' + cy + ')';
    }
    public getPieceClasses(x: number, y: number): string[] {
        const clickedCoord: Coord = new Coord(x, y);
        const classes: string[] = [];
        classes.push(y <= 3 ? 'player0' : 'player1');
        const selectedCoord: Coord = this.selectedPiece.getOrElse(new Coord(-1, -1));
        if (selectedCoord.equals(clickedCoord)) {
            classes.push('selected');
        }
        if (this.rules.node.move.isPresent()) {
            const move: MartianChessMove = this.rules.node.move.get();
            if (move.end.equals(clickedCoord)) {
                const previousPiece: MartianChessPiece =
                    this.rules.node.mother.get().gameState.getPieceAt(clickedCoord);
                const wasOccupied: boolean = previousPiece !== MartianChessPiece.EMPTY;
                if (wasOccupied) {
                    const landingHome: boolean = this.rules.node.gameState.isInOpponentTerritory(new Coord(0, y));
                    if (landingHome) {
                        classes.push('highlighted');
                    }
                }
            }
        }
        return classes;
    }
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        this.displayModePanel = false;
        const clickValidity: MGPValidation = this.canUserPlay('#click_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const clickedCoord: Coord = new Coord(x, y);
        if (this.selectedPiece.isPresent()) {
            return this.secondClick(clickedCoord);
        } else {
            return this.firstClick(clickedCoord);
        }
    }
    private async firstClick(startCoord: Coord): Promise<MGPValidation> {
        if (this.getState().getPieceAt(startCoord) === MartianChessPiece.EMPTY) {
            this.cancelMoveAttempt();
            return MGPValidation.SUCCESS;
        } else {
            const isInPlayerTerritory: boolean = this.getState().isInPlayerTerritory(startCoord);
            if (isInPlayerTerritory) {
                this.selectedPiece = MGPOptional.of(startCoord);
                return MGPValidation.SUCCESS;
            } else {
                this.cancelMoveAttempt();
                return MGPValidation.SUCCESS;
            }
        }
    }
    private async secondClick(endCoord: Coord):Promise<MGPValidation> {
        const startCoord: Coord = this.selectedPiece.get();
        if (startCoord.equals(endCoord)) {
            this.cancelMoveAttempt();
            return MGPValidation.SUCCESS;
        } else {
            const move: MGPFallible<MartianChessMove> =
                MartianChessMove.from(startCoord, endCoord, this.callTheClock);
            if (move.isSuccess()) {
                const state: MartianChessState = this.rules.node.gameState;
                return this.chooseMove(move.get(), state);
            } else {
                return this.cancelMove(move.getReason());
            }
        }
    }
    public cancelMoveAttempt(): void {
        this.selectedPiece = MGPOptional.empty();
        this.callTheClock = false;
    }
    public async onClockClick(): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#clockOrCountDownView');
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const canCallTheClock: boolean = this.getState().countDown.isAbsent();
        if (canCallTheClock) {
            this.callTheClock = !this.callTheClock;
        }
        return MGPValidation.SUCCESS;
    }
    public getClockCircleClasses(): string[] {
        const classes: string[] = ['base'];
        if (this.callTheClock) {
            classes.push('selected');
        }
        if (this.getCurrentPlayer() === Player.ZERO) {
            classes.push('player0-stroke');
        } else {
            classes.push('player1-stroke');
        }
        return classes;
    }
    public getSquareClasses(x: number, y: number): string[] {
        const square: Coord = new Coord(x, y);
        const classes: string[] = ['base'];
        if (this.rules.node.move.isPresent()) {
            const node: MartianChessNode = this.rules.node;
            const move: MartianChessMove = node.move.get();
            if (move.coord.equals(square)) {
                classes.push('moved');
            } else if (move.end.equals(square)) {
                const previousPiece: MartianChessPiece = node.mother.get().gameState.getPieceAt(square);
                const wasEmpty: boolean = previousPiece === MartianChessPiece.EMPTY;
                if (wasEmpty) {
                    classes.push('moved');
                } else {
                    const landingHome: boolean = node.gameState.isInOpponentTerritory(new Coord(0, y));
                    if (landingHome) {
                        classes.push('moved');
                    } else {
                        classes.push('captured');
                    }
                }
            }
        }
        return classes;
    }
    public onModeCogClick(): void {
        this.displayModePanel = !this.displayModePanel;
    }
    public chooseStyle(n: number): void {
        this.style = this.listOfStyles[n].style;
        this.displayModePanel = false;
    }
}
