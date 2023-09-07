// package: 
// file: everyboard.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import * as everyboard_pb from "./everyboard_pb";
import * as google_protobuf_struct_pb from "google-protobuf/google/protobuf/struct_pb";

interface IEveryboardService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    initializeGame: IEveryboardService_IinitializeGame;
    deleteGame: IEveryboardService_IdeleteGame;
    startGame: IEveryboardService_IstartGame;
    addMove: IEveryboardService_IaddMove;
    addRequest: IEveryboardService_IaddRequest;
    addReply: IEveryboardService_IaddReply;
    addAction: IEveryboardService_IaddAction;
}

interface IEveryboardService_IinitializeGame extends grpc.MethodDefinition<everyboard_pb.GameIdAndType, everyboard_pb.SuccessOrFailure> {
    path: "/Everyboard/initializeGame";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<everyboard_pb.GameIdAndType>;
    requestDeserialize: grpc.deserialize<everyboard_pb.GameIdAndType>;
    responseSerialize: grpc.serialize<everyboard_pb.SuccessOrFailure>;
    responseDeserialize: grpc.deserialize<everyboard_pb.SuccessOrFailure>;
}
interface IEveryboardService_IdeleteGame extends grpc.MethodDefinition<everyboard_pb.GameId, everyboard_pb.SuccessOrFailure> {
    path: "/Everyboard/deleteGame";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<everyboard_pb.GameId>;
    requestDeserialize: grpc.deserialize<everyboard_pb.GameId>;
    responseSerialize: grpc.serialize<everyboard_pb.SuccessOrFailure>;
    responseDeserialize: grpc.deserialize<everyboard_pb.SuccessOrFailure>;
}
interface IEveryboardService_IstartGame extends grpc.MethodDefinition<everyboard_pb.GameId, everyboard_pb.SuccessOrFailure> {
    path: "/Everyboard/startGame";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<everyboard_pb.GameId>;
    requestDeserialize: grpc.deserialize<everyboard_pb.GameId>;
    responseSerialize: grpc.serialize<everyboard_pb.SuccessOrFailure>;
    responseDeserialize: grpc.deserialize<everyboard_pb.SuccessOrFailure>;
}
interface IEveryboardService_IaddMove extends grpc.MethodDefinition<everyboard_pb.GameIdAndMove, everyboard_pb.SuccessOrFailure> {
    path: "/Everyboard/addMove";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<everyboard_pb.GameIdAndMove>;
    requestDeserialize: grpc.deserialize<everyboard_pb.GameIdAndMove>;
    responseSerialize: grpc.serialize<everyboard_pb.SuccessOrFailure>;
    responseDeserialize: grpc.deserialize<everyboard_pb.SuccessOrFailure>;
}
interface IEveryboardService_IaddRequest extends grpc.MethodDefinition<everyboard_pb.GameIdAndRequest, everyboard_pb.SuccessOrFailure> {
    path: "/Everyboard/addRequest";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<everyboard_pb.GameIdAndRequest>;
    requestDeserialize: grpc.deserialize<everyboard_pb.GameIdAndRequest>;
    responseSerialize: grpc.serialize<everyboard_pb.SuccessOrFailure>;
    responseDeserialize: grpc.deserialize<everyboard_pb.SuccessOrFailure>;
}
interface IEveryboardService_IaddReply extends grpc.MethodDefinition<everyboard_pb.GameIdAndReplyToRequest, everyboard_pb.SuccessOrFailure> {
    path: "/Everyboard/addReply";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<everyboard_pb.GameIdAndReplyToRequest>;
    requestDeserialize: grpc.deserialize<everyboard_pb.GameIdAndReplyToRequest>;
    responseSerialize: grpc.serialize<everyboard_pb.SuccessOrFailure>;
    responseDeserialize: grpc.deserialize<everyboard_pb.SuccessOrFailure>;
}
interface IEveryboardService_IaddAction extends grpc.MethodDefinition<everyboard_pb.GameIdAndAction, everyboard_pb.SuccessOrFailure> {
    path: "/Everyboard/addAction";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<everyboard_pb.GameIdAndAction>;
    requestDeserialize: grpc.deserialize<everyboard_pb.GameIdAndAction>;
    responseSerialize: grpc.serialize<everyboard_pb.SuccessOrFailure>;
    responseDeserialize: grpc.deserialize<everyboard_pb.SuccessOrFailure>;
}

export const EveryboardService: IEveryboardService;

export interface IEveryboardServer extends grpc.UntypedServiceImplementation {
    initializeGame: grpc.handleUnaryCall<everyboard_pb.GameIdAndType, everyboard_pb.SuccessOrFailure>;
    deleteGame: grpc.handleUnaryCall<everyboard_pb.GameId, everyboard_pb.SuccessOrFailure>;
    startGame: grpc.handleUnaryCall<everyboard_pb.GameId, everyboard_pb.SuccessOrFailure>;
    addMove: grpc.handleUnaryCall<everyboard_pb.GameIdAndMove, everyboard_pb.SuccessOrFailure>;
    addRequest: grpc.handleUnaryCall<everyboard_pb.GameIdAndRequest, everyboard_pb.SuccessOrFailure>;
    addReply: grpc.handleUnaryCall<everyboard_pb.GameIdAndReplyToRequest, everyboard_pb.SuccessOrFailure>;
    addAction: grpc.handleUnaryCall<everyboard_pb.GameIdAndAction, everyboard_pb.SuccessOrFailure>;
}

export interface IEveryboardClient {
    initializeGame(request: everyboard_pb.GameIdAndType, callback: (error: grpc.ServiceError | null, response: everyboard_pb.SuccessOrFailure) => void): grpc.ClientUnaryCall;
    initializeGame(request: everyboard_pb.GameIdAndType, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: everyboard_pb.SuccessOrFailure) => void): grpc.ClientUnaryCall;
    initializeGame(request: everyboard_pb.GameIdAndType, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: everyboard_pb.SuccessOrFailure) => void): grpc.ClientUnaryCall;
    deleteGame(request: everyboard_pb.GameId, callback: (error: grpc.ServiceError | null, response: everyboard_pb.SuccessOrFailure) => void): grpc.ClientUnaryCall;
    deleteGame(request: everyboard_pb.GameId, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: everyboard_pb.SuccessOrFailure) => void): grpc.ClientUnaryCall;
    deleteGame(request: everyboard_pb.GameId, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: everyboard_pb.SuccessOrFailure) => void): grpc.ClientUnaryCall;
    startGame(request: everyboard_pb.GameId, callback: (error: grpc.ServiceError | null, response: everyboard_pb.SuccessOrFailure) => void): grpc.ClientUnaryCall;
    startGame(request: everyboard_pb.GameId, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: everyboard_pb.SuccessOrFailure) => void): grpc.ClientUnaryCall;
    startGame(request: everyboard_pb.GameId, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: everyboard_pb.SuccessOrFailure) => void): grpc.ClientUnaryCall;
    addMove(request: everyboard_pb.GameIdAndMove, callback: (error: grpc.ServiceError | null, response: everyboard_pb.SuccessOrFailure) => void): grpc.ClientUnaryCall;
    addMove(request: everyboard_pb.GameIdAndMove, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: everyboard_pb.SuccessOrFailure) => void): grpc.ClientUnaryCall;
    addMove(request: everyboard_pb.GameIdAndMove, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: everyboard_pb.SuccessOrFailure) => void): grpc.ClientUnaryCall;
    addRequest(request: everyboard_pb.GameIdAndRequest, callback: (error: grpc.ServiceError | null, response: everyboard_pb.SuccessOrFailure) => void): grpc.ClientUnaryCall;
    addRequest(request: everyboard_pb.GameIdAndRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: everyboard_pb.SuccessOrFailure) => void): grpc.ClientUnaryCall;
    addRequest(request: everyboard_pb.GameIdAndRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: everyboard_pb.SuccessOrFailure) => void): grpc.ClientUnaryCall;
    addReply(request: everyboard_pb.GameIdAndReplyToRequest, callback: (error: grpc.ServiceError | null, response: everyboard_pb.SuccessOrFailure) => void): grpc.ClientUnaryCall;
    addReply(request: everyboard_pb.GameIdAndReplyToRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: everyboard_pb.SuccessOrFailure) => void): grpc.ClientUnaryCall;
    addReply(request: everyboard_pb.GameIdAndReplyToRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: everyboard_pb.SuccessOrFailure) => void): grpc.ClientUnaryCall;
    addAction(request: everyboard_pb.GameIdAndAction, callback: (error: grpc.ServiceError | null, response: everyboard_pb.SuccessOrFailure) => void): grpc.ClientUnaryCall;
    addAction(request: everyboard_pb.GameIdAndAction, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: everyboard_pb.SuccessOrFailure) => void): grpc.ClientUnaryCall;
    addAction(request: everyboard_pb.GameIdAndAction, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: everyboard_pb.SuccessOrFailure) => void): grpc.ClientUnaryCall;
}

export class EveryboardClient extends grpc.Client implements IEveryboardClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);
    public initializeGame(request: everyboard_pb.GameIdAndType, callback: (error: grpc.ServiceError | null, response: everyboard_pb.SuccessOrFailure) => void): grpc.ClientUnaryCall;
    public initializeGame(request: everyboard_pb.GameIdAndType, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: everyboard_pb.SuccessOrFailure) => void): grpc.ClientUnaryCall;
    public initializeGame(request: everyboard_pb.GameIdAndType, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: everyboard_pb.SuccessOrFailure) => void): grpc.ClientUnaryCall;
    public deleteGame(request: everyboard_pb.GameId, callback: (error: grpc.ServiceError | null, response: everyboard_pb.SuccessOrFailure) => void): grpc.ClientUnaryCall;
    public deleteGame(request: everyboard_pb.GameId, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: everyboard_pb.SuccessOrFailure) => void): grpc.ClientUnaryCall;
    public deleteGame(request: everyboard_pb.GameId, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: everyboard_pb.SuccessOrFailure) => void): grpc.ClientUnaryCall;
    public startGame(request: everyboard_pb.GameId, callback: (error: grpc.ServiceError | null, response: everyboard_pb.SuccessOrFailure) => void): grpc.ClientUnaryCall;
    public startGame(request: everyboard_pb.GameId, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: everyboard_pb.SuccessOrFailure) => void): grpc.ClientUnaryCall;
    public startGame(request: everyboard_pb.GameId, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: everyboard_pb.SuccessOrFailure) => void): grpc.ClientUnaryCall;
    public addMove(request: everyboard_pb.GameIdAndMove, callback: (error: grpc.ServiceError | null, response: everyboard_pb.SuccessOrFailure) => void): grpc.ClientUnaryCall;
    public addMove(request: everyboard_pb.GameIdAndMove, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: everyboard_pb.SuccessOrFailure) => void): grpc.ClientUnaryCall;
    public addMove(request: everyboard_pb.GameIdAndMove, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: everyboard_pb.SuccessOrFailure) => void): grpc.ClientUnaryCall;
    public addRequest(request: everyboard_pb.GameIdAndRequest, callback: (error: grpc.ServiceError | null, response: everyboard_pb.SuccessOrFailure) => void): grpc.ClientUnaryCall;
    public addRequest(request: everyboard_pb.GameIdAndRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: everyboard_pb.SuccessOrFailure) => void): grpc.ClientUnaryCall;
    public addRequest(request: everyboard_pb.GameIdAndRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: everyboard_pb.SuccessOrFailure) => void): grpc.ClientUnaryCall;
    public addReply(request: everyboard_pb.GameIdAndReplyToRequest, callback: (error: grpc.ServiceError | null, response: everyboard_pb.SuccessOrFailure) => void): grpc.ClientUnaryCall;
    public addReply(request: everyboard_pb.GameIdAndReplyToRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: everyboard_pb.SuccessOrFailure) => void): grpc.ClientUnaryCall;
    public addReply(request: everyboard_pb.GameIdAndReplyToRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: everyboard_pb.SuccessOrFailure) => void): grpc.ClientUnaryCall;
    public addAction(request: everyboard_pb.GameIdAndAction, callback: (error: grpc.ServiceError | null, response: everyboard_pb.SuccessOrFailure) => void): grpc.ClientUnaryCall;
    public addAction(request: everyboard_pb.GameIdAndAction, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: everyboard_pb.SuccessOrFailure) => void): grpc.ClientUnaryCall;
    public addAction(request: everyboard_pb.GameIdAndAction, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: everyboard_pb.SuccessOrFailure) => void): grpc.ClientUnaryCall;
}
