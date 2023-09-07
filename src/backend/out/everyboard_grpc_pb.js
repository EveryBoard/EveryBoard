// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var everyboard_pb = require('./everyboard_pb.js');
var google_protobuf_struct_pb = require('google-protobuf/google/protobuf/struct_pb.js');

function serialize_GameId(arg) {
  if (!(arg instanceof everyboard_pb.GameId)) {
    throw new Error('Expected argument of type GameId');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_GameId(buffer_arg) {
  return everyboard_pb.GameId.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_GameIdAndAction(arg) {
  if (!(arg instanceof everyboard_pb.GameIdAndAction)) {
    throw new Error('Expected argument of type GameIdAndAction');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_GameIdAndAction(buffer_arg) {
  return everyboard_pb.GameIdAndAction.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_GameIdAndMove(arg) {
  if (!(arg instanceof everyboard_pb.GameIdAndMove)) {
    throw new Error('Expected argument of type GameIdAndMove');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_GameIdAndMove(buffer_arg) {
  return everyboard_pb.GameIdAndMove.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_GameIdAndReplyToRequest(arg) {
  if (!(arg instanceof everyboard_pb.GameIdAndReplyToRequest)) {
    throw new Error('Expected argument of type GameIdAndReplyToRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_GameIdAndReplyToRequest(buffer_arg) {
  return everyboard_pb.GameIdAndReplyToRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_GameIdAndRequest(arg) {
  if (!(arg instanceof everyboard_pb.GameIdAndRequest)) {
    throw new Error('Expected argument of type GameIdAndRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_GameIdAndRequest(buffer_arg) {
  return everyboard_pb.GameIdAndRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_GameIdAndType(arg) {
  if (!(arg instanceof everyboard_pb.GameIdAndType)) {
    throw new Error('Expected argument of type GameIdAndType');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_GameIdAndType(buffer_arg) {
  return everyboard_pb.GameIdAndType.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_SuccessOrFailure(arg) {
  if (!(arg instanceof everyboard_pb.SuccessOrFailure)) {
    throw new Error('Expected argument of type SuccessOrFailure');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_SuccessOrFailure(buffer_arg) {
  return everyboard_pb.SuccessOrFailure.deserializeBinary(new Uint8Array(buffer_arg));
}


var EveryboardService = exports.EveryboardService = {
  initializeGame: {
    path: '/Everyboard/initializeGame',
    requestStream: false,
    responseStream: false,
    requestType: everyboard_pb.GameIdAndType,
    responseType: everyboard_pb.SuccessOrFailure,
    requestSerialize: serialize_GameIdAndType,
    requestDeserialize: deserialize_GameIdAndType,
    responseSerialize: serialize_SuccessOrFailure,
    responseDeserialize: deserialize_SuccessOrFailure,
  },
  deleteGame: {
    path: '/Everyboard/deleteGame',
    requestStream: false,
    responseStream: false,
    requestType: everyboard_pb.GameId,
    responseType: everyboard_pb.SuccessOrFailure,
    requestSerialize: serialize_GameId,
    requestDeserialize: deserialize_GameId,
    responseSerialize: serialize_SuccessOrFailure,
    responseDeserialize: deserialize_SuccessOrFailure,
  },
  startGame: {
    path: '/Everyboard/startGame',
    requestStream: false,
    responseStream: false,
    requestType: everyboard_pb.GameId,
    responseType: everyboard_pb.SuccessOrFailure,
    requestSerialize: serialize_GameId,
    requestDeserialize: deserialize_GameId,
    responseSerialize: serialize_SuccessOrFailure,
    responseDeserialize: deserialize_SuccessOrFailure,
  },
  addMove: {
    path: '/Everyboard/addMove',
    requestStream: false,
    responseStream: false,
    requestType: everyboard_pb.GameIdAndMove,
    responseType: everyboard_pb.SuccessOrFailure,
    requestSerialize: serialize_GameIdAndMove,
    requestDeserialize: deserialize_GameIdAndMove,
    responseSerialize: serialize_SuccessOrFailure,
    responseDeserialize: deserialize_SuccessOrFailure,
  },
  addRequest: {
    path: '/Everyboard/addRequest',
    requestStream: false,
    responseStream: false,
    requestType: everyboard_pb.GameIdAndRequest,
    responseType: everyboard_pb.SuccessOrFailure,
    requestSerialize: serialize_GameIdAndRequest,
    requestDeserialize: deserialize_GameIdAndRequest,
    responseSerialize: serialize_SuccessOrFailure,
    responseDeserialize: deserialize_SuccessOrFailure,
  },
  addReply: {
    path: '/Everyboard/addReply',
    requestStream: false,
    responseStream: false,
    requestType: everyboard_pb.GameIdAndReplyToRequest,
    responseType: everyboard_pb.SuccessOrFailure,
    requestSerialize: serialize_GameIdAndReplyToRequest,
    requestDeserialize: deserialize_GameIdAndReplyToRequest,
    responseSerialize: serialize_SuccessOrFailure,
    responseDeserialize: deserialize_SuccessOrFailure,
  },
  addAction: {
    path: '/Everyboard/addAction',
    requestStream: false,
    responseStream: false,
    requestType: everyboard_pb.GameIdAndAction,
    responseType: everyboard_pb.SuccessOrFailure,
    requestSerialize: serialize_GameIdAndAction,
    requestDeserialize: deserialize_GameIdAndAction,
    responseSerialize: serialize_SuccessOrFailure,
    responseDeserialize: deserialize_SuccessOrFailure,
  },
};

exports.EveryboardClient = grpc.makeGenericClientConstructor(EveryboardService);
