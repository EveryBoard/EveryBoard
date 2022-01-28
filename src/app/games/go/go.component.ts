import { Component } from '@angular/core';
import { RectangularGameComponent } from '../../components/game-components/rectangular-game-component/RectangularGameComponent';
import { GoMove } from 'src/app/games/go/GoMove';
import { GoLegalityInformation, GoRules } from 'src/app/games/go/GoRules';
import { GoMinimax } from 'src/app/games/go/GoMinimax';
import { GoState, Phase, GoPiece } from 'src/app/games/go/GoState';
import { Coord } from 'src/app/jscaip/Coord';
import { assert, display } from 'src/app/utils/utils';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { GroupDatas } from 'src/app/jscaip/BoardDatas';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { GoTutorial } from './GoTutorial';

@Component({
    selector: 'app-go',
    templateUrl: './go.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class GoComponent extends RectangularGameComponent<GoRules, GoMove, GoState, GoPiece, GoLegalityInformation> {

    public static VERBOSE: boolean = false;

    public boardInfo: GroupDatas<GoPiece>;

    public ko: MGPOptional<Coord> = MGPOptional.empty();

    public last: MGPOptional<Coord> = MGPOptional.empty();

    public canPass: boolean;

    public captures: Coord[]= [];

    public GoPiece: typeof GoPiece = GoPiece;

    constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.scores = MGPOptional.of([0, 0]);
        this.rules = new GoRules(GoState);
        this.availableMinimaxes = [
            new GoMinimax(this.rules, 'GoMinimax'),
        ];
        this.encoder = GoMove.encoder;
        this.tutorial = new GoTutorial().tutorial;
        this.canPass = true;
        this.updateBoard();
    }
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#click_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        this.last = MGPOptional.empty(); // now that the user stopped trying to do a move
        // we stop showing the user the last move
        const resultlessMove: GoMove = new GoMove(x, y);
        return this.chooseMove(resultlessMove, this.rules.node.gameState, this.scores.get());
    }
    public updateBoard(): void {
        display(GoComponent.VERBOSE, 'updateBoard');

        const state: GoState = this.rules.node.gameState;
        const move: MGPOptional<GoMove> = this.rules.node.move;
        const phase: Phase = state.phase;

        this.board = state.getCopiedBoard();
        this.scores = MGPOptional.of(state.getCapturedCopy());

        this.ko = state.koCoord;
        if (move.isPresent()) {
            this.showCaptures();
        } else {
            this.captures = [];
        }
        this.last = move.map((move: GoMove) => move.coord);
        this.canPass = phase !== Phase.FINISHED;
    }
    private showCaptures(): void {
        const previousState: GoState = this.rules.node.mother.get().gameState;
        this.captures = [];
        for (let y: number = 0; y < this.board.length; y++) {
            for (let x: number = 0; x < this.board[0].length; x++) {
                const coord: Coord = new Coord(x, y);
                const wasOccupied: boolean = previousState.getPieceAt(coord).isEmpty() === false;
                const isEmpty: boolean = this.board[y][x] === GoPiece.EMPTY;
                const isNotKo: boolean = this.ko.equalsValue(coord) === false;
                if (wasOccupied && isEmpty && isNotKo) {
                    this.captures.push(coord);
                }
            }
        }
    }
    public async pass(): Promise<MGPValidation> {
        const phase: Phase = this.rules.node.gameState.phase;
        if (phase === Phase.PLAYING || phase === Phase.PASSED) {
            return this.onClick(GoMove.PASS.coord.x, GoMove.PASS.coord.y);
        }
        assert(phase === Phase.COUNTING || phase === Phase.ACCEPT,
               'GoComponent: pass() must be called only in playing, passed, counting, or accept phases');
        return this.onClick(GoMove.ACCEPT.coord.x, GoMove.ACCEPT.coord.y);
    }
    public getSpaceClass(x: number, y: number): string {
        const piece: GoPiece = this.rules.node.gameState.getPieceAtXY(x, y);
        return this.getPlayerClass(piece.getOwner());
    }
    public caseIsFull(x: number, y: number): boolean {
        const piece: GoPiece = this.rules.node.gameState.getPieceAtXY(x, y);
        return piece !== GoPiece.EMPTY && !this.isTerritory(x, y);
    }
    public isLastCase(x: number, y: number): boolean {
        if (this.last.isPresent()) {
            const last: Coord = this.last.get();
            return x === last.x && y === last.y;
        } else {
            return false;
        }
    }
    public isDead(x: number, y: number): boolean {
        return this.rules.node.gameState.isDead(new Coord(x, y));
    }
    public isTerritory(x: number, y: number): boolean {
        return this.rules.node.gameState.isTerritory(new Coord(x, y));
    }
}
