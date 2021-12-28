import { Component } from '@angular/core';
import { GameComponent } from 'src/app/components/game-components/game-component/GameComponent';
import { Coord } from 'src/app/jscaip/Coord';
import { Vector } from 'src/app/jscaip/Direction';
import { Player } from 'src/app/jscaip/Player';
import { MessageDisplayer } from 'src/app/services/message-displayer/MessageDisplayer';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { ConspirateursMove, ConspirateursMoveDrop, ConspirateursMoveEncoder, ConspirateursMoveJump, ConspirateursMoveSimple } from './ConspirateursMove';
import { ConspirateursRules } from './ConspirateursRules';
import { ConspirateursState } from './ConspirateursState';

interface ViewInfo {
    boardInfo: SquareInfo[][],
    centralZoneStart: Coord,
    centralZoneSize: Vector,
    shelters: Coord[],
    victory: Coord[],
}

interface SquareInfo {
    coord: Coord,
    squareClasses: string[],
    pieceClasses: string[],
    hasPiece: boolean,
}

@Component({
    selector: 'app-conspirateurs',
    templateUrl: './conspirateurs.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class ConspirateursComponent extends GameComponent<ConspirateursRules, ConspirateursMove, ConspirateursState> {
    public viewInfo: ViewInfo = {
        boardInfo: [],
        centralZoneStart: new Coord(4, 6),
        centralZoneSize: new Coord(9, 5),
        shelters: ConspirateursState.ALL_SHELTERS,
        victory: [], // TODO: fill it in update board
    }
    private selected: MGPOptional<Coord> = MGPOptional.empty();
    private jumpInConstruction: MGPOptional<ConspirateursMoveJump> = MGPOptional.empty();

    constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.rules = ConspirateursRules.get();
        this.availableMinimaxes = [
            // TODO
        ];
        this.encoder = ConspirateursMoveEncoder;
        // TODO this.tutorial = new ConspirateursTutorial().tutorial;
        this.updateBoard();
    }
    public updateBoard(): void {
        this.updateViewInfo();
        const lastMove: MGPOptional<ConspirateursMove> = this.rules.node.move;
        if (lastMove.isPresent()) {
            this.showLastMove();
        }
    }
    private updateViewInfo() {
        const state: ConspirateursState = this.getState();
        this.viewInfo.boardInfo = [];
        for (let y: number = 0; y < ConspirateursState.HEIGHT; y++) {
            this.viewInfo.boardInfo.push([]);
            for (let x: number = 0; x < ConspirateursState.WIDTH; x++) {
                const coord: Coord = new Coord(x, y);
                const piece: Player = state.getPieceAt(coord);
                const squareInfo: SquareInfo = {
                    coord,
                    squareClasses: [],
                    pieceClasses: [this.getPlayerClass(piece)],
                    hasPiece: piece !== Player.NONE,
                };
                this.viewInfo.boardInfo[y].push(squareInfo);
            }
        }
        if (this.selected.isPresent()) {
            if (this.jumpInConstruction.isPresent()) {
                const jump: ConspirateursMoveJump = this.jumpInConstruction.get();
                const jumpStart: Coord = jump.getStartingCoord();
                const jumpCurrent: Coord = jump.getEndingCoord();
                this.viewInfo.boardInfo[jumpStart.y][jumpStart.x].hasPiece = false;
                this.viewInfo.boardInfo[jumpCurrent.y][jumpCurrent.x].pieceClasses =
                    [this.getPlayerClass(this.getCurrentPlayer())];
                this.viewInfo.boardInfo[jumpCurrent.y][jumpCurrent.x].hasPiece = true;
                for (const coord of jump.coords) {
                    this.viewInfo.boardInfo[coord.y][coord.x].squareClasses.push('moved');
                }
            } else {
                const selected: Coord = this.selected.get();
                this.viewInfo.boardInfo[selected.y][selected.x].pieceClasses.push('selected');
            }
        }
    }
    private showLastMove(): void {
        const lastMove: ConspirateursMove = this.rules.node.move.get();
        if (lastMove.isDrop()) {
            this.viewInfo.boardInfo[lastMove.coord.y][lastMove.coord.x].squareClasses.push('moved');
        } else if (lastMove.isSimple()) {
            this.viewInfo.boardInfo[lastMove.coord.y][lastMove.coord.x].squareClasses.push('moved');
            this.viewInfo.boardInfo[lastMove.end.y][lastMove.end.x].squareClasses.push('moved');
        } else {
            for (const coord of lastMove.coords) {
                this.viewInfo.boardInfo[coord.y][coord.x].squareClasses.push('moved');
            }
        }
    }
    public cancelMoveAttempt(): void {
        this.jumpInConstruction = MGPOptional.empty();
        this.selected = MGPOptional.empty();
        this.updateBoard();
    }
    public async onClick(coord: Coord): Promise<MGPValidation> {
        const state: ConspirateursState = this.getState();
        if (this.jumpInConstruction.isPresent()) {
            const jump: ConspirateursMoveJump = this.jumpInConstruction.get();
            if (coord.equals(jump.getEndingCoord())) {
                return this.chooseMove(jump, state);
            } else {
                const newJump: MGPFallible<ConspirateursMoveJump> = jump.addJump(coord);
                if (newJump.isFailure()) {
                    return this.cancelMove(newJump.getReason());
                }
                this.jumpInConstruction = MGPOptional.of(newJump.get());
            }
        }
        if (this.selected.isPresent()) {
            const selected: Coord = this.selected.get();
            if (selected.getDistance(coord) === 1) {
                const move: MGPFallible<ConspirateursMove> = ConspirateursMoveSimple.of(selected, coord);
                return this.tryMove(move);
            } else {
                const jump: MGPFallible<ConspirateursMoveJump> = ConspirateursMoveJump.of([selected, coord]);
                if (jump.isFailure()) {
                    return this.cancelMove(jump.getReason());
                }
                this.jumpInConstruction = MGPOptional.of(jump.get());
            }
        } else {
            console.log(state.isDropPhase())
            if (state.isDropPhase()) {
                const move: MGPFallible<ConspirateursMove> = ConspirateursMoveDrop.of(coord);
                return this.tryMove(move);
            } else {
                this.selected = MGPOptional.of(coord);
            }
        }
        return MGPValidation.SUCCESS;
    }
    private async tryMove(move: MGPFallible<ConspirateursMove>): Promise<MGPValidation> {
        if (move.isFailure()) {
            return this.cancelMove(move.getReason());
        }
        return this.chooseMove(move.get(), this.getState());
    }
}
