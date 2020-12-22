export class RequestCode {
    public static ZERO_PROPOSED_DRAW: RequestCode = new RequestCode('ZERO_PROPOSED_DRAW');

    public static ONE_PROPOSED_DRAW: RequestCode = new RequestCode('ONE_PROPOSED_DRAW');

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
        return {code: this.value};
    }
}
export interface IMGPRequest {
    code: string;

    partId?: string;

    typeGame?: string;
}
export class MGPRequest {
    public readonly code: string;

    public constructor(
        code: RequestCode,
        public readonly partId?: string,
        public readonly typeGame?: string,
    ) {
        if (code === RequestCode.REMATCH_ACCEPTED &&
            (partId == null || typeGame == null)) {
            throw new Error('To accept rematch, one must provide new partId and typeGame.');
        }
        this.code = code.toInterface().code;
        if (this.partId === undefined) this.partId = null;
        if (this.typeGame === undefined) this.typeGame = null;
    }
}
