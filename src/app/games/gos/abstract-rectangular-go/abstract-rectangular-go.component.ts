import { ModelSignal, signal, WritableSignal } from '@angular/core';

import { Coord } from '@everyboard/games';
import { GoLegalityInformation } from '@everyboard/games';
import { ScoreName } from '@everyboard/games';
import { GoMove } from '@everyboard/games';
import { GoPhase } from '@everyboard/games';
import { GoPiece } from '@everyboard/games';
import { GoState } from '@everyboard/games';
import { GoHeuristic } from '@everyboard/games';
import { GoMoveGenerator } from '@everyboard/games';
import { PlayerNumberMap } from '@everyboard/games';
import { Table, TableUtils } from '@everyboard/games';
import { RectangularGoConfig, AbstractRectangularGoRules } from '@everyboard/games';
import { GoSubBoardHelper } from '@everyboard/games';
import { MGPOptional, MGPValidation, Utils } from '@everyboard/lib';

import { ViewBox } from '../../../components/game-components/GameComponentUtils';
import { ClickHandler } from '../../../components/game-components/game-component/ClickHandler';
import { GobanGameComponent } from '../../../components/game-components/goban-game-component/GobanGameComponent';


export abstract class AbstractRectangularGoComponent
    extends GobanGameComponent<AbstractRectangularGoRules,
                               GoMove,
                               GoState,
                               GoPiece,
                               RectangularGoConfig,
                               GoLegalityInformation>
{

    protected ko: WritableSignal<MGPOptional<Coord>> = signal(MGPOptional.empty());

    public last: WritableSignal<MGPOptional<Coord>> = signal(MGPOptional.empty());

    public captures: WritableSignal<Coord[]> = signal([]);

    public displayedZooms: WritableSignal<number> = signal(1);

    public abstract hover: ModelSignal<MGPOptional<Coord>>;

    public zooms: WritableSignal<ReadonlyArray<Table<GoState>>> = signal([]);

    private readonly SUB_BOARD_SEPARATOR: number = 0.5 * this.SPACE_SIZE;

    private readonly ZOOM_SEPARATOR: number = this.SPACE_SIZE;

    public constructor(urlName: string) {
        super(urlName);
        this.encoder = GoMove.encoder;
        this.canPass = true;
        this.scores = MGPOptional.of(PlayerNumberMap.of(0, 0));
        this.aiConfig = {
            minimax: [{
                id: 'territory',
                name: $localize`Territory`,
                heuristic: (): GoHeuristic => new GoHeuristic(),
                moveGenerator: (): GoMoveGenerator => new GoMoveGenerator(),
                hash: AbstractRectangularGoComponent.hash,
            }],
            mcts: [{
                id: 'default',
                name: $localize`Default`,
                moveGenerator: (): GoMoveGenerator => new GoMoveGenerator(),
            }],
        };
        this.encoder = GoMove.encoder;
        this.canPass = true;
        this.scores = MGPOptional.of(PlayerNumberMap.of(0, 0));
    }

    private static hash(state: GoState): string {
        let board: string = '';
        for (const line of state.board) {
            for (const cell of line) {
                board += cell.toString();
            }
            board += '\n';
        }
        return `${state.turn % 2}-${state.phase.toString()}-${board}-${JSON.stringify(state.koCoord)}-${JSON.stringify(state.captured)}`;
    }

    public override computeViewBox(): ViewBox {
        const zooms: number = this.zooms().length;
        const zoomSeparatorCount: number = zooms - 1;
        const verticalSubBoardSeparatorCount: number = zooms * (zooms - 1) * 0.5;
        const normalWidth: number = this.getState().getWidth() * this.SPACE_SIZE;
        const width: number = normalWidth + ((zooms - 1) * this.SUB_BOARD_SEPARATOR);
        const normalHeight: number = this.getState().getHeight() * this.SPACE_SIZE;
        let height: number = zooms * normalHeight;
        height += this.SUB_BOARD_SEPARATOR * verticalSubBoardSeparatorCount;
        height += this.ZOOM_SEPARATOR * zoomSeparatorCount;
        return ViewBox.fromLimits(0, width, 0, height);
    }

    public override async showLastMove(move: GoMove): Promise<void> {
        this.last.set(MGPOptional.of(move.coord));
        this.showCaptures();
    }

    public override hideLastMove(): void {
        this.captures.set([]);
        this.last.set(MGPOptional.empty());
    }

    @ClickHandler((coord: Coord) => '.space-' + coord.x + '-' + coord.y)
    public async onClick(coord: Coord): Promise<MGPValidation> {
        const resultlessMove: GoMove = new GoMove(coord.x, coord.y);
        return this.chooseMove(resultlessMove);
    }

    public override async updateBoard(_triggerAnimation: boolean): Promise<void> {
        const state: GoState = this.getState();
        const phase: GoPhase = state.phase;

        this.board = state.getCopiedBoard();
        const subBoards: ReadonlyArray<Table<Table<GoPiece>>> = GoSubBoardHelper.splitInSubBoards(
            this.board,
            this.config().zoom,
        );
        this.displayedZooms.set(this.config().showZooms ? this.config().zoom : 1);
        this.zooms.set(
            subBoards.map(
                (table: Table<Table<GoPiece>>) => {
                    return TableUtils.map(table, (board: Table<GoPiece>) => {
                        return state.withBoard(board);
                    });
                },
            ),
        );
        this.updateScores();

        this.ko.set(state.koCoord);
        this.canPass = phase.allowsPass();
        this.createHoshis();
        this.cdr.detectChanges();
    }

    private updateScores(): void {
        this.scores = MGPOptional.of(this.getState().captured);
    }

    protected override getScoreName(): ScoreName {
        return this.getState().phase.getScoreName();
    }

    private showCaptures(): void {
        const previousState: GoState = this.getPreviousState();
        const captures: Coord[] = [];
        for (let y: number = 0; y < this.getHeight(); y++) {
            for (let x: number = 0; x < this.getWidth(); x++) {
                const coord: Coord = new Coord(x, y);
                const wasOccupied: boolean = previousState.getPieceAt(coord).isOccupied();
                const isEmpty: boolean = this.board[y][x] === GoPiece.EMPTY;
                const isNotKo: boolean = this.ko().equalsValue(coord) === false;
                if (wasOccupied && isEmpty && isNotKo) {
                    captures.push(coord);
                }
            }
        }
        this.captures.set(captures);
    }

    public override async pass(): Promise<MGPValidation> {
        const phase: GoPhase = this.getState().phase;
        if (phase.isPlaying() || phase.isPassed()) {
            return this.onClick(GoMove.PASS.coord);
        }
        Utils.assert(phase.isCounting() || phase.isAccept(),
                     'GoComponent: pass() must be called only in playing, passed, counting, or accept phases');
        return this.onClick(GoMove.ACCEPT.coord);
    }

    public translateZoom(zoom: number): string {
        const translateX: number = this.xZoomTranslate(zoom);
        const translateY: number = this.yZoomTranslate(zoom);
        return `translate(${ translateX }, ${ translateY })`;
    }

    private xZoomTranslate(zoom: number): number {
        const totalZooms: number = this.zooms().length;
        return (totalZooms - zoom - 1) * 0.5 * this.SUB_BOARD_SEPARATOR;
    }

    private yZoomTranslate(zoom: number): number {
        const normalheight: number = this.getState().getHeight() * this.SPACE_SIZE;
        let translate: number = (zoom) * normalheight;
        translate += (zoom) * this.ZOOM_SEPARATOR;
        translate += (zoom) * ((zoom) - 1) * 0.5 * this.SUB_BOARD_SEPARATOR;
        return translate;
    }

    private getTranslateXZoomBoard(zoom: number, subZoomX: number, subZoomY: number): number {
        let squareLeftCount: number = 0;
        for (let previousZoomX: number = 0; previousZoomX < subZoomX; previousZoomX++) {
            const previousState: GoState = this.zooms()[zoom][subZoomY][previousZoomX];
            const abstractWidth: number = previousState.getWidth();
            squareLeftCount += abstractWidth;
        }
        let translateX: number = squareLeftCount * this.SPACE_SIZE;
        translateX += subZoomX * this.SUB_BOARD_SEPARATOR;
        return translateX;
    }

    private getTranslateYZoomBoard(zoom: number, subZoomX: number, subZoomY: number): number {
        let squareTopCount: number = 0;
        for (let previousZoomY: number = 0; previousZoomY < subZoomY; previousZoomY++) {
            const previousState: GoState = this.zooms()[zoom][previousZoomY][subZoomX];
            const abstractHeight: number = previousState.getHeight();
            squareTopCount += abstractHeight;
        }
        let translateY: number = squareTopCount * this.SPACE_SIZE;
        translateY += subZoomY * this.SUB_BOARD_SEPARATOR;
        return translateY;
    }

    public translateZoomBoard(zoom: number, subZoomX: number, subZoomY: number): string {
        const translateX: number = this.getTranslateXZoomBoard(zoom, subZoomX, subZoomY);
        const translateY: number = this.getTranslateYZoomBoard(zoom, subZoomX, subZoomY);
        return `translate(${ translateX }, ${ translateY })`;
    }

    public onTakeHover(zoom: number, zx: number, zy: number, zoomedCoord: MGPOptional<Coord>): void {
        if (zoomedCoord.isPresent()) {
            const normalCoord: Coord = GoSubBoardHelper.fromZoomedToNormalCoord(zoomedCoord.get(), zx, zy, zoom);
            this.hover.set(MGPOptional.of(normalCoord));
        } else {
            this.hover.set(MGPOptional.empty());
        }
    }

}
