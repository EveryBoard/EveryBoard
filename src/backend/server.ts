import * as grpc from '@grpc/grpc-js';



import { GameIdAndType, GameIdOrFailure } from './out/everyboard_pb';
import { EveryboardService } from './out/everyboard_grpc_pb';
import { User } from 'src/app/domain/User';
import { Utils } from 'src/app/utils/utils';
import { UserDAO } from 'src/app/dao/UserDAO';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { firebaseConfig } from 'src/app/firebaseConfig';
import { PartDAO } from 'src/app/dao/PartDAO';
import { Firestore } from 'firebase/firestore';
import { MinimalUser } from 'src/app/domain/MinimalUser';
import { MGPResult, Part } from 'src/app/domain/Part';
import { ConfigRoom, FirstPlayer, PartStatus, PartType } from 'src/app/domain/ConfigRoom';
import { ConfigRoomDAO } from 'src/app/dao/ConfigRoomDAO';

type Call<X, Y> = grpc.ServerUnaryCall<X, Y>;
type Reply<X> = grpc.sendUnaryData<X>;

type GameId = string; // A game id, corresponding to the id of the firestore element
type UserId = string; // A user id, corresponding to the user's uid

type SuccessOrFailureBasedReply = { setSuccess: (success: boolean) => void, setErrormessage: (reason: string) => void };

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const userDAO: UserDAO = new UserDAO(firestore as unknown as Firestore);
const partDAO: PartDAO = new PartDAO(firestore as unknown as Firestore);
const configRoomDAO: ConfigRoomDAO = new ConfigRoomDAO(firestore as unknown as Firestore);

async function checkAuthAndGetUid(idToken: string): Promise<string> {
    return getAuth().verifyIdToken(idToken).then((decodedToken) => decodedToken.uid);
}

async function checkAuth(idToken: string): Promise<void> {
    await checkAuthAndGetUid(idToken);
}

/**
 * This runs some action in a promise.
 * First, it checks if the requester is authenticated, and fills the reply with an error message if not.
 * Then, it runs the action.
 * In case the action fails (i.e., throws an error), it fills the reply with the error message.
 */
async function tryOrFail<X extends SuccessOrFailureBasedReply>(idToken: string, callback: Reply<X>, reply: X, action: () => Promise<void>): Promise<void> {
    const catchError = err => {
        reply.setSuccess(false);
        reply.setErrormessage(err.toString())
    };
    await checkAuth(idToken).catch(catchError);
    return action().catch(catchError);
}

/**
 * This creates an unstarted game
 * It fails if:
 *   - the creator is already in another game
 * Performs 1 read + 3 write.
 */
function initializeGame(call: Call<GameIdAndType, GameIdOrFailure>, callback: Reply<GameIdOrFailure>): Promise<void> {
    const reply: GameIdOrFailure = new GameIdOrFailure();
    return tryOrFail(call.request.getIdtoken(), callback, reply, async() => {
        const userId: UserId = call.request.getIdtoken();
        const user: User = (await userDAO.read(call.request.getIdtoken())).get(); // 1 read
        if (user.currentGame !== null) {
            throw new Error('You can be creator of only one game at a time');
        }
        const creator: MinimalUser = {
            id: userId,
            name: Utils.getNonNullable(user.username),
        };
        const typeGame: string = call.request.getType();

        // Create the game
        const newPart: Part = {
            typeGame,
            playerZero: creator,
            turn: -1,
            result: MGPResult.UNACHIEVED.value,
        };
        const gameId: string = await partDAO.create(newPart);
        // Then the config room
        const newConfigRoom: ConfigRoom = {
            chosenOpponent: null,
            firstPlayer: FirstPlayer.RANDOM.value,
            partType: PartType.STANDARD.value,
            partStatus: PartStatus.PART_CREATED.value,
            maximalMoveDuration: PartType.NORMAL_MOVE_DURATION,
            totalPartDuration: PartType.NORMAL_PART_DURATION,
            creator,
        };
        return configRoomDAO.set(gameId, newConfigRoom);
        // Then the chat

        reply.setSuccess(true);
        reply.setGameid(gameId);
        callback(null, reply);
    });
}


var server = new grpc.Server();
server.addService(EveryboardService, { initializeGame });

server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  server.start();
});
