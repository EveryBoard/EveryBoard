export class RequestCode {
    public static ZERO_PROPOSED_DRAW: RequestCode = new RequestCode('ZERO_PROPOSED_DRAW');

    public static ONE_PROPOSED_DRAW: RequestCode = new RequestCode('ONE_PROPOSED_DRAW');

    public static DRAW_ACCEPTED: RequestCode = new RequestCode('DRAW_ACCEPTED');

    public static ZERO_REFUSED_DRAW: RequestCode = new RequestCode('ZERO_REFUSED_DRAW');

    public static ONE_REFUSED_DRAW: RequestCode = new RequestCode('ONE_REFUSED_DRAW');

    public static ZERO_ADDED_TIME: RequestCode = new RequestCode('ZERO_ADDED_TIME');

    public static ONE_ADDED_TIME: RequestCode = new RequestCode('ONE_ADDED_TIME');

    public static ZERO_ASKED_TAKE_BACK: RequestCode = new RequestCode('ZERO_ASKED_TAKE_BACK');

    public static ONE_ASKED_TAKE_BACK: RequestCode = new RequestCode('ONE_ASKED_TAKE_BACK');

    public static ZERO_REFUSED_TAKE_BACK: RequestCode = new RequestCode('ZERO_REFUSED_TAKE_BACK');

    public static ONE_REFUSED_TAKE_BACK: RequestCode = new RequestCode('ONE_REFUSED_TAKE_BACK');

    public static ZERO_PROPOSED_REMATCH: RequestCode = new RequestCode('ZERO_PROPOSED_REMATCH');

    public static ONE_PROPOSED_REMATCH: RequestCode = new RequestCode('ONE_PROPOSED_REMATCH');

    public static REMATCH_ACCEPTED: RequestCode = new RequestCode('REMATCH_ACCEPTED'); // TODO: separate in two

    public static ZERO_ACCEPTED_TAKE_BACK: RequestCode = new RequestCode('ZERO_ACCEPTED_TAKE_BACK');

    public static ONE_ACCEPTED_TAKE_BACK: RequestCode = new RequestCode('ONE_ACCEPTED_TAKE_BACK');

    private constructor(private readonly value: string) {}

    public toInterface(): IMGPRequest {
        return { code: this.value };
    }
}
export interface IMGPRequest {
    code: string;

    partId?: string;

    typeGame?: string;
}
