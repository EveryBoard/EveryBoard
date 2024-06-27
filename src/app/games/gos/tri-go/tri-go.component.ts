import { ChangeDetectorRef, Component } from '@angular/core';
import { GoMove } from 'src/app/games/gos/GoMove';
import { TriGoConfig, TriGoRules } from './TriGoRules';
import { GoState } from 'src/app/games/gos/GoState';
import { GoPiece } from '../GoPiece';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPOptional, MGPValidation, Utils } from '@everyboard/lib';
import { GroupDatas } from 'src/app/jscaip/BoardDatas';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { MCTS } from 'src/app/jscaip/AI/MCTS';
import { GoMoveGenerator } from '../go/GoMoveGenerator';
import { Debug } from 'src/app/utils/Debug';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';
import { GoPhase } from '../GoPhase';
import { TriangularGameComponent } from 'src/app/components/game-components/game-component/TriangularGameComponent';
import { GoLegalityInformation } from '../AbstractGoRules';
import { ViewBox } from 'src/app/components/game-components/GameComponentUtils';
import { TriangularCheckerBoard } from 'src/app/jscaip/state/TriangularCheckerBoard';
import { TriGoMinimax } from './TriGoMinimax';

@Component({
    selector: 'app-tri-go',
    templateUrl: './tri-go.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
})
@Debug.log
export class TriGoComponent extends TriangularGameComponent<TriGoRules,
                                                            GoMove,
                                                            GoState,
                                                            GoPiece,
                                                            TriGoConfig,
                                                            GoLegalityInformation>
{

    public boardInfo: GroupDatas<GoPiece>;

    public ko: MGPOptional<Coord> = MGPOptional.empty();

    public last: MGPOptional<Coord> = MGPOptional.empty();

    public captures: Coord[]= [];

    public GoPiece: typeof GoPiece = GoPiece;

    public constructor(messageDisplayer: MessageDisplayer, cdr: ChangeDetectorRef) {
        super(messageDisplayer, cdr);
        this.setRulesAndNode('TriGo');
        this.availableAIs = [
            new TriGoMinimax(),
            new MCTS($localize`MCTS`, new GoMoveGenerator(), this.rules),
        ];
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
        const abstractSize: number = state.getWidth() / 2;
        return new ViewBox(
            0.5 * this.SPACE_SIZE * ((abstractSize + 1) % 2),
            0,
            this.SPACE_SIZE * state.getWidth() / 2,
            this.SPACE_SIZE * state.getHeight(),
        ).expandAll(this.STROKE_WIDTH / 2);
    }

    public async onClick(coord: Coord): Promise<MGPValidation> {
        const x: number = coord.x;
        const y: number = coord.y;
        const clickValidity: MGPValidation = await this.canUserPlay('#click-' + x + '-' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        this.last = MGPOptional.empty(); // now that the user stopped trying to do a move
        // we stop showing the user the last move
        const resultlessMove: GoMove = new GoMove(x, y);
        return this.chooseMove(resultlessMove);
    }

    public async updateBoard(_triggerAnimation: boolean): Promise<void> {
        const state: GoState = this.getState();
        const phase: GoPhase = state.phase;

        this.board = state.getCopiedBoard();
        this.scores = MGPOptional.of(state.getCapturedCopy());

        this.ko = state.koCoord;
        this.canPass = phase !== GoPhase.FINISHED;
        // this.createHoshis();
    }

    private showCaptures(): void {
        const previousState: GoState = this.getPreviousState();
        this.captures = [];
        for (let y: number = 0; y < this.getState().getHeight(); y++) {
            for (let x: number = 0; x < this.getState().getWidth(); x++) {
                const coord: Coord = new Coord(x, y);
                const wasOccupied: boolean = previousState.getPieceAt(coord).isOccupied();
                const isEmpty: boolean = this.board[y][x] === GoPiece.EMPTY;
                const isNotKo: boolean = this.ko.equalsValue(coord) === false;
                if (wasOccupied && isEmpty && isNotKo) {
                    this.captures.push(coord);
                }
            }
        }
    }

    public override async pass(): Promise<MGPValidation> {
        const phase: GoPhase = this.getState().phase;
        if (phase === GoPhase.PLAYING || phase === GoPhase.PASSED) {
            return this.onClick(GoMove.PASS.coord);
        }
        Utils.assert(phase === GoPhase.COUNTING || phase === GoPhase.ACCEPT,
                     'GoComponent: pass() must be called only in playing, passed, counting, or accept phases');
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
        return 'translate(20 ' + y + ') scale(0.6)';
    }

    public isUpward(coord: Coord): boolean {
        return TriangularCheckerBoard.isSpaceDark(coord);
    }

    public isDownward(coord: Coord): boolean {
        return TriangularCheckerBoard.isSpaceDark(coord) === false;
    }

}
