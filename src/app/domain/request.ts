import { Player } from 'src/app/jscaip/Player';
import { JSONValue, Utils } from 'src/app/utils/utils';
import { JSONObject } from 'src/app/utils/utils';

export type RequestCode =
    'DrawProposed' | 'DrawAccepted' | 'DrawRefused' |
    'AddedTime' |
    'TakeBackAsked' | 'TakeBackAccepted' | 'TakeBackRefused' |
    'RematchProposed' | 'RematchAccepted';

export class Request implements JSONObject {
    [key: string]: JSONValue; // Index signature to type to JSONObject

    public static drawProposed: (by: Player) => Request = makeWithPlayer('DrawProposed');
    public static drawAccepted: Request = make('DrawAccepted', {});
    public static drawRefused: (by: Player) => Request = makeWithPlayer('DrawRefused');

    public static takeBackAsked: (by: Player) => Request = makeWithPlayer('TakeBackAsked');
    public static takeBackRefused: (by: Player) => Request = makeWithPlayer('TakeBackRefused');
    public static takeBackAccepted: (by: Player) => Request = makeWithPlayer('TakeBackAccepted');

    public static rematchProposed: (by: Player) => Request = makeWithPlayer('RematchProposed');
    public static rematchAccepted(typeGame: string, partId: string): Request {
        return make('RematchAccepted', { typeGame, partId });
    }

    public static getPlayer(request: Request): Player {
        return Player.of(Utils.getNonNullDefinedOrFail(request.data)['player']);
    }
    public static getTypeGame(request: Request): string {
        return Utils.getNonNullDefinedOrFail(request.data)['typeGame'];
    }
    public static getPartId(request: Request): string {
        return Utils.getNonNullDefinedOrFail(request.data)['partId'];
    }

    public code: RequestCode;
    public data: JSONValue;
}

function make(code: RequestCode, data: JSONValue): Request {
    return { code, data };
}

function makeWithPlayer(code: RequestCode): (player: Player) => Request {
    return (player: Player) => {
        return make(code, { player: player.value });
    };
}
