import { Injectable } from '@angular/core';
import { GameEventReply, GameEventRequest, RequestType } from 'src/app/domain/Part';
import { Player } from 'src/app/jscaip/Player';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPSet } from 'src/app/utils/MGPSet';
import { Utils } from 'src/app/utils/utils';

/**
 * The request manager manages the requests and replies.
 * It keeps state about whether a current request has been sent or is waiting for a reply.
 */
@Injectable({
    providedIn: 'root',
})
export class OGWCRequestManagerService {

    private requestAwaitingReply: MGPOptional<GameEventRequest> = MGPOptional.empty();
    private forbiddenRequests: MGPSet<RequestType> = new MGPSet();

    public onGameStart(): void {
        // Upon game start, clear out requests
        this.requestAwaitingReply = MGPOptional.empty();
        this.forbiddenRequests = new MGPSet();
    }
    public onReceivedMove(): void {
        // Upon a new turn, the player can again request anything
        this.forbiddenRequests = new MGPSet();
    }
    public onReceivedRequest(request: GameEventRequest): void {
        Utils.assert(this.requestAwaitingReply.isAbsent(), 'Should not receive two requests in a row!');
        this.requestAwaitingReply = MGPOptional.of(request);
    }
    /**
     * Called when a reply is received.
     * @returns true if the request has been accepted and must be handled by the OGWC
     */
    public async onReceivedReply(reply: GameEventReply, currentPlayer: Player): Promise<boolean> {
        this.requestAwaitingReply = MGPOptional.empty();
        switch (reply.reply) {
            case 'Accept':
                // The request has been accepted by the opponent, we give it back to OGWC
                return true;
            case 'Reject':
                // When one of our requests is rejected, we cannot make this request until the next turn
                if (reply.player === currentPlayer.getOpponent().value) {
                    // Opponent denied our request
                    this.forbiddenRequests.add(reply.requestType);
                }
                return false;
        }
    }
    public canMakeRequest(request: RequestType): boolean {
        // If a request is awaiting a reply, no other request can be made until replied
        if (this.requestAwaitingReply.isPresent()) return false;
        // If the request is forbidden, we cannot make it
        if (this.forbiddenRequests.contains(request)) return false;
        return true;
    }
    public mustReply(player: Player): MGPOptional<GameEventRequest> {
        // Different from canMakeRequest, as we can play if our requests have not been answered for example.
        if (this.requestAwaitingReply.isPresent() &&
            this.requestAwaitingReply.get().player === player.getOpponent().value)
        {
            return this.requestAwaitingReply;
        } else {
            return MGPOptional.empty();
        }
    }
    public getCurrentRequest(): MGPOptional<GameEventRequest> {
        return this.requestAwaitingReply;
    }
    public hasBeenDeniedRequest(): boolean {
        return this.forbiddenRequests.isEmpty() === false;
    }
}
