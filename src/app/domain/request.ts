import { Player } from 'src/app/jscaip/Player';
import { JSONValue } from 'src/app/utils/utils';

export type RequestCode =
    'DrawProposed' | 'DrawAccepted' | 'DrawRefused' |
    'AddedTime' |
    'TakeBackAsked' | 'TakeBackAccepted' | 'TakeBackRefused' |
    'RematchProposed' | 'RematchAccepted';

export class Request {
    public static drawProposed: (player: Player) => Request = makeWithPlayer('DrawProposed');
    public static drawAccepted: Request = make('DrawAccepted', {});
    public static drawRefused: (player: Player) => Request = makeWithPlayer('DrawRefused');

    public static addedTime: (player: Player) => Request = makeWithPlayer('AddedTime');

    public static takeBackAsked: (player: Player) => Request = makeWithPlayer('TakeBackAsked');
    public static takeBackRefused: (player: Player) => Request = makeWithPlayer('TakeBackRefused');
    public static takeBackAccepted: (player: Player) => Request = makeWithPlayer('TakeBackAccepted');

    public static rematchProposed: (player: Player) => Request = makeWithPlayer('RematchProposed');
    public static rematchAccepted(typeGame: string, partId: string): Request {
        return make('RematchAccepted', { typeGame, partId });
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

