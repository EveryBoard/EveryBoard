// package: 
// file: everyboard.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";
import * as google_protobuf_struct_pb from "google-protobuf/google/protobuf/struct_pb";

export class GameId extends jspb.Message { 
    getIdtoken(): string;
    setIdtoken(value: string): GameId;
    getGameid(): string;
    setGameid(value: string): GameId;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GameId.AsObject;
    static toObject(includeInstance: boolean, msg: GameId): GameId.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GameId, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GameId;
    static deserializeBinaryFromReader(message: GameId, reader: jspb.BinaryReader): GameId;
}

export namespace GameId {
    export type AsObject = {
        idtoken: string,
        gameid: string,
    }
}

export class GameIdAndType extends jspb.Message { 
    getIdtoken(): string;
    setIdtoken(value: string): GameIdAndType;
    getGameid(): string;
    setGameid(value: string): GameIdAndType;
    getType(): string;
    setType(value: string): GameIdAndType;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GameIdAndType.AsObject;
    static toObject(includeInstance: boolean, msg: GameIdAndType): GameIdAndType.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GameIdAndType, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GameIdAndType;
    static deserializeBinaryFromReader(message: GameIdAndType, reader: jspb.BinaryReader): GameIdAndType;
}

export namespace GameIdAndType {
    export type AsObject = {
        idtoken: string,
        gameid: string,
        type: string,
    }
}

export class GameIdAndMove extends jspb.Message { 
    getIdtoken(): string;
    setIdtoken(value: string): GameIdAndMove;
    getGameid(): string;
    setGameid(value: string): GameIdAndMove;

    hasMove(): boolean;
    clearMove(): void;
    getMove(): google_protobuf_struct_pb.Struct | undefined;
    setMove(value?: google_protobuf_struct_pb.Struct): GameIdAndMove;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GameIdAndMove.AsObject;
    static toObject(includeInstance: boolean, msg: GameIdAndMove): GameIdAndMove.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GameIdAndMove, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GameIdAndMove;
    static deserializeBinaryFromReader(message: GameIdAndMove, reader: jspb.BinaryReader): GameIdAndMove;
}

export namespace GameIdAndMove {
    export type AsObject = {
        idtoken: string,
        gameid: string,
        move?: google_protobuf_struct_pb.Struct.AsObject,
    }
}

export class GameIdAndRequest extends jspb.Message { 
    getIdtoken(): string;
    setIdtoken(value: string): GameIdAndRequest;
    getGameid(): string;
    setGameid(value: string): GameIdAndRequest;

    hasRequest(): boolean;
    clearRequest(): void;
    getRequest(): google_protobuf_struct_pb.Struct | undefined;
    setRequest(value?: google_protobuf_struct_pb.Struct): GameIdAndRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GameIdAndRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GameIdAndRequest): GameIdAndRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GameIdAndRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GameIdAndRequest;
    static deserializeBinaryFromReader(message: GameIdAndRequest, reader: jspb.BinaryReader): GameIdAndRequest;
}

export namespace GameIdAndRequest {
    export type AsObject = {
        idtoken: string,
        gameid: string,
        request?: google_protobuf_struct_pb.Struct.AsObject,
    }
}

export class GameIdAndReplyToRequest extends jspb.Message { 
    getIdtoken(): string;
    setIdtoken(value: string): GameIdAndReplyToRequest;
    getGameid(): string;
    setGameid(value: string): GameIdAndReplyToRequest;
    getRequestid(): string;
    setRequestid(value: string): GameIdAndReplyToRequest;

    hasReply(): boolean;
    clearReply(): void;
    getReply(): google_protobuf_struct_pb.Struct | undefined;
    setReply(value?: google_protobuf_struct_pb.Struct): GameIdAndReplyToRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GameIdAndReplyToRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GameIdAndReplyToRequest): GameIdAndReplyToRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GameIdAndReplyToRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GameIdAndReplyToRequest;
    static deserializeBinaryFromReader(message: GameIdAndReplyToRequest, reader: jspb.BinaryReader): GameIdAndReplyToRequest;
}

export namespace GameIdAndReplyToRequest {
    export type AsObject = {
        idtoken: string,
        gameid: string,
        requestid: string,
        reply?: google_protobuf_struct_pb.Struct.AsObject,
    }
}

export class GameIdAndAction extends jspb.Message { 
    getIdtoken(): string;
    setIdtoken(value: string): GameIdAndAction;
    getGameid(): string;
    setGameid(value: string): GameIdAndAction;
    getAction(): string;
    setAction(value: string): GameIdAndAction;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GameIdAndAction.AsObject;
    static toObject(includeInstance: boolean, msg: GameIdAndAction): GameIdAndAction.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GameIdAndAction, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GameIdAndAction;
    static deserializeBinaryFromReader(message: GameIdAndAction, reader: jspb.BinaryReader): GameIdAndAction;
}

export namespace GameIdAndAction {
    export type AsObject = {
        idtoken: string,
        gameid: string,
        action: string,
    }
}

export class SuccessOrFailure extends jspb.Message { 
    getSuccess(): boolean;
    setSuccess(value: boolean): SuccessOrFailure;
    getErrormessage(): string;
    setErrormessage(value: string): SuccessOrFailure;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SuccessOrFailure.AsObject;
    static toObject(includeInstance: boolean, msg: SuccessOrFailure): SuccessOrFailure.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SuccessOrFailure, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SuccessOrFailure;
    static deserializeBinaryFromReader(message: SuccessOrFailure, reader: jspb.BinaryReader): SuccessOrFailure;
}

export namespace SuccessOrFailure {
    export type AsObject = {
        success: boolean,
        errormessage: string,
    }
}

export class GameIdOrFailure extends jspb.Message { 
    getSuccess(): boolean;
    setSuccess(value: boolean): GameIdOrFailure;
    getErrormessage(): string;
    setErrormessage(value: string): GameIdOrFailure;
    getGameid(): string;
    setGameid(value: string): GameIdOrFailure;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GameIdOrFailure.AsObject;
    static toObject(includeInstance: boolean, msg: GameIdOrFailure): GameIdOrFailure.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GameIdOrFailure, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GameIdOrFailure;
    static deserializeBinaryFromReader(message: GameIdOrFailure, reader: jspb.BinaryReader): GameIdOrFailure;
}

export namespace GameIdOrFailure {
    export type AsObject = {
        success: boolean,
        errormessage: string,
        gameid: string,
    }
}
