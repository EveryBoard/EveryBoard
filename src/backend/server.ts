import * as grpc from '@grpc/grpc-js';
import { GameIdAndType, GameIdOrFailure, SuccessOrFailure, UnimplementedEveryboardService } from './protos/everyboard';


type Call<X, Y> = grpc.ServerUnaryCall<X, Y>;
type Reply<X> = grpc.sendUnaryData<X>;

type GameId = string; // A game id, corresponding to the id of the firestore element
type UserId = string; // A user id, corresponding to the user's uid

type SuccessOrFailureBasedReply = {
    set success(success: boolean);
    set errorMessage(reason: string);
};

/**
 * This runs some action in a promise.
 * First, it checks if the requester is authenticated, and fills the reply with an error message if not.
 * Then, it runs the action.
 * In case the action fails (i.e., throws an error), it fills the reply with the error message.
 */
async function tryOrFail<X extends SuccessOrFailureBasedReply>(idToken: string, reply: X, action: () => Promise<void>): Promise<void> {
    const catchError = err => {
        reply.success = false;
        reply.errorMessage = err.toString()
    };
    // TODO await checkAuth(idToken).catch(catchError);
    return action().catch(catchError);
}

export class EveryboardService extends UnimplementedEveryboardService {

    public initializeGame(call: Call<GameIdAndType, SuccessOrFailure>,
                          callback: Reply<SuccessOrFailure>)
    : Promise<void>
    {
        const reply: SuccessOrFailure = new SuccessOrFailure();
        return tryOrFail(call.request.idToken, reply, async() => {
            const userId: UserId = call.request.idToken;
            reply.success = true;
            callback(null, reply);
        });
    }
}


