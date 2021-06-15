import { Component } from '@angular/core';
import { AbstractGameComponent } from '../../components/game-components/abstract-game-component/AbstractGameComponent';
import { GoMove } from 'src/app/games/go/GoMove';
import { GoRules } from 'src/app/games/go/GoRules';
import { GoMinimax } from 'src/app/games/go/GoMinimax';
import { GoPartSlice, Phase, GoPiece } from 'src/app/games/go/GoPartSlice';
import { Coord } from 'src/app/jscaip/Coord';
import { GoLegalityStatus } from 'src/app/games/go/GoLegalityStatus';
import { display } from 'src/app/utils/utils';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { GroupDatas } from 'src/app/jscaip/BoardDatas';
import { MoveEncoder } from 'src/app/jscaip/Encoder';
import { MessageDisplayer } from 'src/app/services/message-displayer/MessageDisplayer';

@Component({
    selector: 'app-go',
    templateUrl: './go.component.html',
    styleUrls: ['../../components/game-components/abstract-game-component/abstract-game-component.css'],
})
export class GoComponent extends AbstractGameComponent<GoMove, GoPartSlice, GoLegalityStatus> {
    public static VERBOSE: boolean = false;

    public scores: number[] = [0, 0];

    public boardInfo: GroupDatas<GoPiece>;

    public ko: Coord;

    public last: Coord = new Coord(-1, -1);

    public canPass: boolean;

    public captures: Coord[]= [];

    public encoder: MoveEncoder<GoMove> = GoMove.encoder;

    constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.rules = new GoRules(GoPartSlice);
        this.availableMinimaxes = [
            new GoMinimax(this.rules, 'GoMinimax'),
        ];
        this.canPass = true;
        this.showScore = true;
    }
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#click_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        this.last = new Coord(-1, -1); // now the user stop try to do a move
        // we stop showing him the last move
        const resultlessMove: GoMove = new GoMove(x, y);
        return this.chooseMove(resultlessMove, this.rules.node.gamePartSlice, this.scores[0], this.scores[1]);
    }
    public updateBoard(): void {
        display(GoComponent.VERBOSE, 'updateBoard');

        const slice: GoPartSlice = this.rules.node.gamePartSlice;
        const move: GoMove = this.rules.node.move;
        const koCoord: MGPOptional<Coord> = slice.koCoord;
        const phase: Phase = slice.phase;

        this.board = slice.getCopiedBoard();
        this.scores = slice.getCapturedCopy();

        this.last = move ? move.coord : null;
        this.ko = koCoord.getOrNull();
        if (move == null) {
            this.captures = [];
        } else {
            this.showCaptures();
        }
        this.canPass = phase !== Phase.FINISHED;
    }
    private showCaptures(): void {
        const previousSlice: GoPartSlice = this.rules.node.mother.gamePartSlice;
        this.captures = [];
        for (let y: number = 0; y < this.board.length; y++) {
            for (let x: number = 0; x < this.board[0].length; x++) {
                const coord: Coord = new Coord(x, y);
                const wasOccupied: boolean = previousSlice.getBoardAtGoPiece(coord).isEmpty() === false;
                const isEmpty: boolean = this.board[y][x] === GoPiece.EMPTY.value;
                const isNotKo: boolean = !coord.equals(this.ko);
                if (wasOccupied && isEmpty && isNotKo) {
                    this.captures.push(coord);
                }
            }
        }
    }
    public async pass(): Promise<MGPValidation> {
        const phase: Phase = this.rules.node.gamePartSlice.phase;
        if (phase === Phase.PLAYING || phase === Phase.PASSED) {
            return this.onClick(GoMove.PASS.coord.x, GoMove.PASS.coord.y);
        }
        if (phase === Phase.COUNTING || phase === Phase.ACCEPT) {
            return this.onClick(GoMove.ACCEPT.coord.x, GoMove.ACCEPT.coord.y);
        } else {
            this.message('Cannot pass');
            return MGPValidation.failure('Cannot pass');
        }
    }
    public getCaseClass(x: number, y: number): string {
        const piece: GoPiece = this.rules.node.gamePartSlice.getBoardByXYGoPiece(x, y);
        return this.getPlayerClass(piece.getOwner());
    }
    public caseIsFull(x: number, y: number): boolean {
        const piece: GoPiece = this.rules.node.gamePartSlice.getBoardByXYGoPiece(x, y);
        return piece !== GoPiece.EMPTY && !this.isTerritory(x, y);
    }
    public isLastCase(x: number, y: number): boolean {
        if (this.last == null) {
            return false;
        } else {
            return x === this.last.x && y === this.last.y;
        }
    }
    public isThereAKo(): boolean {
        return this.ko != null;
    }
    public isDead(x: number, y: number): boolean {
        return this.rules.node.gamePartSlice.isDead(new Coord(x, y));
    }
    public isTerritory(x: number, y: number): boolean {
        return this.rules.node.gamePartSlice.isTerritory(new Coord(x, y));
    }
}
