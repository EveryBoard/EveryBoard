import { Component } from '@angular/core';
import { GameComponent } from 'src/app/components/game-components/game-component/GameComponent';
import { Coord } from 'src/app/jscaip/Coord';
import { Vector } from 'src/app/jscaip/Direction';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { Player } from 'src/app/jscaip/Player';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MessageDisplayer } from 'src/app/services/message-displayer/MessageDisplayer';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { DiamDummyMinimax } from './DiamDummyMinimax';
import { DiamFailure } from './DiamFailure';
import { DiamMove, DiamMoveDrop, DiamMoveEncoder, DiamMoveShift } from './DiamMove';
import { DiamPiece } from './DiamPiece';
import { DiamRules } from './DiamRules';
import { DiamState } from './DiamState';
import { DiamTutorial } from './DiamTutorial';

interface ViewInfo {
    boardInfo: CaseInfo[],
    remainingPieces: PieceInfo[],
}

interface CaseInfo {
    x: number,
    caseClasses: string[],
    pieces: PieceInfo[],
}

interface PieceInfo {
    classes: string[],
    y: number,
    drawPosition: Coord,
    actualPiece: DiamPiece,
}

type Selected = { type: 'pieceFromReserve', piece: DiamPiece }
    | { type: 'pieceFromBoard', position: Coord }

@Component({
    selector: 'app-diam',
    templateUrl: './diam.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class DiamComponent extends GameComponent<DiamRules, DiamMove, DiamState, LegalityStatus> {
    public static CENTER: Coord[] = [
        new Coord(40, 160),
        new Coord(100, 50),
        new Coord(255, 2),
        new Coord(400, 50),
        new Coord(460, 160),
        new Coord(400, 270),
        new Coord(255, 320),
        new Coord(100, 270),
    ];
    public static PIECE_HEIGHT: number = 37;
    public BOARD_PATHS: string[] = [
        'M 2.8324855,277.57643 164.46619,228.81694 170.57257,148.42756 32.571357,104.19835 Z',
        'M 170.57257,148.42237 246.4213,96.276913 195.13813,2.0233391 32.571357,104.19315 Z',
        'm 195.14159,2.0268021 205.0898,0.010821 -52.1686,94.2453509 -101.64149,-0.0057 z',
        'M 348.06279,96.281239 400.23529,2.0330788 564.39307,104.19207 424.66384,148.41891 Z',
        'm 424.66384,148.42237 7.27882,80.37683 164.9712,48.72701 -32.52079,-173.33068 z',
        'm 431.94266,228.80481 -75.73854,62.15055 79.06197,135.86929 161.64688,-149.29953 z',
        'm 356.20412,290.9506 79.06197,135.86929 -268.2864,0.0433 74.14082,-135.90175 z',
        'M 241.12051,290.96379 166.97969,426.86556 2.8324855,277.57708 164.46619,228.81759 Z',
    ];
    public DECORATION_PATHS: string[] = [
        'm 170.57257,148.42302 v 40.08918 l -6.11049,80.38634 v -40.09025 z',
        'm 170.57646,188.51696 v -40.08918 l 75.8509,-52.140047 v 40.086147 z',
        'm 246.42323,96.285785 v 40.086155 l 101.63847,-0.003 0.001,-40.082256 z',
        'm 424.66037,148.42345 v 40.08377 l -76.60213,-52.14178 10e-4,-40.082033 z',
        'm 424.66037,148.42193 v 40.08377 l 7.27884,80.37445 v -40.08377 z',
        'm 435.26609,466.90582 v -40.08615 l 161.64688,-149.2995 8.9e-4,40.08701 z',
        'm 166.97969,426.86815 v 40.08638 l 268.28379,-0.0433 v -40.08031 z',
        'm 2.8324855,277.57297 v 40.08636 L 166.97969,466.94782 v -40.08636 z',
    ];
    public selected: Selected | null = null; // TODO: use MGPOptional after strictness merge
    public viewInfo: ViewInfo = {
        boardInfo: [],
        remainingPieces: [],
    };
    constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.rules = new DiamRules(DiamState);
        this.availableMinimaxes = [
            new DiamDummyMinimax(this.rules, 'DiamDummyMinimax'),
        ];
        this.encoder = DiamMoveEncoder;
        this.tutorial = new DiamTutorial().tutorial;
        this.updateBoard();
    }
    public async onCaseClick(x: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#click_' + x);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }

        return this.onCaseClickAfterCheck(x);
    }
    private async onCaseClickAfterCheck(x: number): Promise<MGPValidation> {
        if (this.selected != null) {
            let move: DiamMove;
            if (this.selected.type === 'pieceFromReserve') {
                move = new DiamMoveDrop(x, this.selected.piece);
            } else {
                if ((this.selected.position.x + 1) % 8 === x) {
                    move = new DiamMoveShift(this.selected.position, 'right');
                } else if ((this.selected.position.x + 7) % 8 === x) {
                    move = new DiamMoveShift(this.selected.position, 'left');
                } else {
                    return this.cancelMove(DiamFailure.MUST_SHIFT_LEFT_OR_RIGHT());
                }
            }
            return this.chooseMove(move, this.rules.node.gameState, null, null);
        } else {
            return this.cancelMove(DiamFailure.MUST_SELECT_PIECE_FIRST());
        }
    }
    public async onPieceInGameClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#click_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        if (this.selected != null) {
            return this.onCaseClickAfterCheck(x);
        }
        if (this.rules.node.gameState.getPieceAtXY(x, y).owner === this.rules.node.gameState.getCurrentPlayer()) {
            this.selected = { type: 'pieceFromBoard', position: new Coord(x, y) };
            this.updateViewInfo();
            return MGPValidation.SUCCESS;
        } else {
            return this.cancelMove(RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
        }
    }
    public async onRemainingPieceClick(piece: DiamPiece): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#piece_' + piece.owner.value + '_' + (piece.otherPieceType ? 1 : 0));
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }

        if (piece.owner === this.rules.node.gameState.getCurrentPlayer()) {
            this.selected = { type: 'pieceFromReserve', piece };
            this.updateViewInfo();
            return MGPValidation.SUCCESS;
        } else {
            return this.cancelMove(RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
        }
    }
    public updateBoard(): void {
        this.updateViewInfo();
    }
    private updateViewInfo(): void {
        for (let x: number = 0; x < DiamState.WIDTH; x++) {
            this.viewInfo.boardInfo[x] = {
                x,
                caseClasses: this.getCaseClasses(x),
                pieces: this.getPieces(x),
            };
        }
        this.viewInfo.remainingPieces = [];
        for (const piece of DiamPiece.PLAYER_PIECES) {
            const remaining: number = this.rules.node.gameState.getRemainingPiecesOf(piece);
            for (let y: number = 0; y < remaining; y++) {
                const classes: string[] = ['player' + piece.owner.value];
                if (piece.otherPieceType) {
                    classes.push('color-variant');
                }
                if (this.selected != null &&
                    this.selected.type === 'pieceFromReserve' &&
                    this.selected.piece === piece &&
                    y === remaining-1) {
                    // highlight the top piece of the remaining pieces stack if it is selected
                    classes.push('highlighted');
                }
                this.viewInfo.remainingPieces.push({
                    classes,
                    y,
                    drawPosition: this.getDrawPosition(piece).getNext(new Vector(0, -y*DiamComponent.PIECE_HEIGHT)),
                    actualPiece: piece,
                });
            }
        }
    }
    private getDrawPosition(piece: DiamPiece): Coord {
        let x: number;
        if (piece.owner === Player.ZERO) {
            x = -100;
        } else {
            x = 600;
        }
        let y: number;
        if (piece.otherPieceType) {
            y = 100;
        } else {
            y = 450;
        }
        return new Coord(x, y);
    }
    private getCaseClasses(x: number): string[] {
        const lastMove: DiamMove | null = this.rules.node.move;
        if (lastMove != null && lastMove.getTarget() === x) {
            return ['moved'];
        }
        return [];
    }
    private getPieces(x: number): PieceInfo[] {
        const highestAlignment: MGPOptional<Coord> = this.rules.findHighestAlignment(this.rules.node.gameState);
        const infos: PieceInfo[] = [];
        for (let y: number = DiamState.HEIGHT-1; y >= 0; y--) {
            const piece: DiamPiece = this.rules.node.gameState.getPieceAtXY(x, y);
            if (piece !== DiamPiece.EMPTY) {
                const classes: string[] = ['player' + piece.owner.value];
                if (piece.otherPieceType) classes.push('color-variant');
                if (this.selected != null &&
                    this.selected.type === 'pieceFromBoard' &&
                    this.selected.position.x === x &&
                    this.selected.position.y === y) {
                    classes.push('highlighted');
                }
                if (highestAlignment.isPresent() &&
                    (highestAlignment.get().x % 4) === (x % 4) &&
                    highestAlignment.get().y === y) {
                    classes.push('victory-stroke');
                }
                infos.push({
                    classes,
                    y,
                    drawPosition: DiamComponent.CENTER[x].getNext(new Vector(0, (y-3)*DiamComponent.PIECE_HEIGHT)),
                    actualPiece: piece,
                });
            }
        }
        return infos;
    }
    public cancelMoveAttempt(): void {
        this.selected = null;
        this.updateBoard();
    }
}
