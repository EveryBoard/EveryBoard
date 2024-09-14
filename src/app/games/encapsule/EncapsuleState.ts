import { ArrayUtils, MGPMap, MGPOptional, NumberMap, Utils } from '@everyboard/lib';
import { GameStateWithTable } from 'src/app/jscaip/state/GameStateWithTable';
import { EncapsulePiece, Size } from 'src/app/games/encapsule/EncapsulePiece';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { Table } from 'src/app/jscaip/TableUtils';
import { PlayerMap } from 'src/app/jscaip/PlayerMap';

export class EncapsuleRemainingPieces extends PlayerMap<EncapsuleSizeToNumberMap> {
}
export class EncapsuleSizeToNumberMap extends NumberMap<Size> {
}

export class EncapsuleState extends GameStateWithTable<EncapsuleSpace> {

    private readonly remainingPieces: EncapsuleRemainingPieces;

    public constructor(board: Table<EncapsuleSpace>, turn: number, remainingPieces: EncapsuleRemainingPieces) {
        super(board, turn);
        this.remainingPieces = remainingPieces;
    }

    public getRemainingPieces(): EncapsuleRemainingPieces {
        return this.remainingPieces;
    }

    public getRemainingPiecesOfPlayer(player: Player): EncapsuleSizeToNumberMap {
        return this.getRemainingPieces().get(player);
    }

    public pieceBelongsToCurrentPlayer(piece: EncapsulePiece): boolean {
        return piece.belongsTo(this.getCurrentPlayer());
    }

    public isDroppable(piece: EncapsulePiece): boolean {
        return this.pieceBelongsToCurrentPlayer(piece) &&
               this.isInRemainingPieces(piece);
    }

    public isInRemainingPieces(piece: EncapsulePiece): boolean {
        const playerPieces: EncapsuleSizeToNumberMap = this.remainingPieces.get(piece.getPlayer() as Player);
        const numberOfPieces: number = playerPieces.get(piece.getSize()).getOrElse(0);
        return numberOfPieces > 0;
    }

    public getPlayerRemainingPieces(): EncapsuleSizeToNumberMap {
        return this.remainingPieces.get(this.getCurrentPlayer());
    }

}

export class EncapsuleSpace {

    public static readonly EMPTY: EncapsuleSpace = new EncapsuleSpace(new MGPMap());

    public constructor(public readonly pieces: MGPMap<Size, Player>) {
        this.pieces.makeImmutable();
    }

    public getOccupiedCircles(): MGPMap<Size, Player> {
        return this.pieces.filter(this.isEmptyKeyValue);
    }

    public isEmpty(): boolean {
        const occupiedCircles: MGPMap<Size, Player> = this.getOccupiedCircles();
        return occupiedCircles.size() === 0;
    }

    private isEmptyKeyValue(_: Size, value: PlayerOrNone): boolean {
        return value.isPlayer();
    }

    public toList(): EncapsulePiece[] { // TODO: rename as "copy"
        const pieces: EncapsulePiece[] = [];
        for (const size of this.pieces.getKeyList()) {
            const player: PlayerOrNone = this.pieces.get(size).get();
            if (player.isPlayer()) {
                const newPiece: EncapsulePiece = EncapsulePiece.ofSizeAndPlayer(size, player);
                pieces.push(newPiece);
            }
        }
        return pieces;
    }

    public toOrderedPieceNames(): string[] {
        const maxSize: number = 3; // TODO: take it from config
        const pieceNames: string[] = [];
        for (let size: number = 1; size <= maxSize; size++) {
            const owner: MGPOptional<Player> = this.pieces.get(size);
            let playerOrNone: PlayerOrNone;
            if (owner.isPresent()) {
                playerOrNone = owner.get();
            } else {
                playerOrNone = PlayerOrNone.NONE;
            }
            const piece: EncapsulePiece = EncapsulePiece.ofSizeAndPlayer(size, playerOrNone);
            pieceNames.push(piece.toString());
        } // TODO: remove trailing PlayerOrNone.NONE if there is
        return pieceNames;
    }

    public getBiggest(): EncapsulePiece {
        const occupiedCircles: MGPMap<Size, Player> = this.getOccupiedCircles();
        const occupiedSizes: Size[] = occupiedCircles.getKeyList();
        const sortedSizes: Size[] = ArrayUtils.maximumsBy(occupiedSizes, (value: Size) => value);
        if (sortedSizes.length === 0) {
            return EncapsulePiece.NONE;
        } else {
            const biggestSize: Size = sortedSizes[0];
            const biggestPlayer: PlayerOrNone = this.pieces.get(biggestSize).get();
            return EncapsulePiece.ofSizeAndPlayer(biggestSize, biggestPlayer);
        }
    }

    public tryToSuperposePiece(piece: EncapsulePiece): MGPOptional<EncapsuleSpace> {
        const biggestPresent: Size = this.getBiggest().getSize();
        if (piece === EncapsulePiece.NONE) {
            throw new Error('Cannot move EMPTY on a space');
        }
        if (piece.getSize() > biggestPresent) {
            return MGPOptional.of(this.put(piece));
        } else {
            return MGPOptional.empty();
        }
    }

    public removeBiggest(): {removedSpace: EncapsuleSpace, removedPiece: EncapsulePiece} {
        const removedPiece: EncapsulePiece = this.getBiggest();
        if (removedPiece === EncapsulePiece.NONE) {
            throw new Error('Cannot remove piece from empty space');
        }
        const size: Size = removedPiece.getSize();
        const removedPieces: MGPMap<Size, Player> = this.pieces.getCopy();
        removedPieces.delete(size);
        removedPieces.makeImmutable();
        const removedSpace: EncapsuleSpace = new EncapsuleSpace(removedPieces);
        return { removedSpace: removedSpace, removedPiece };
    }

    public put(piece: EncapsulePiece): EncapsuleSpace {
        if (piece === EncapsulePiece.NONE) throw new Error('Cannot put NONE on space');
        const biggest: EncapsulePiece = this.getBiggest();
        Utils.assert(biggest.size < piece.size, 'Cannot put a piece on top of a bigger one');
        const addedPieces: MGPMap<Size, Player> = this.pieces.getCopy();
        addedPieces.put(piece.getSize(), piece.getPlayer() as Player);
        addedPieces.makeImmutable();
        return new EncapsuleSpace(addedPieces);
    }

    public belongsTo(player: Player): boolean {
        return this.getBiggest().getPlayer() === player;
    }

    public toString(): string {
        const pieceNames: string[] = this.toOrderedPieceNames();
        return '(' + pieceNames[0] + ', ' + pieceNames[1] + ', ' + pieceNames[2] + ')';
    }

}
