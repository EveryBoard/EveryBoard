package model

type Player int

const (
	PlayerZero Player = 0
	PlayerOne  Player = 1
)

type PlayerOrNone int

const (
	PlayerOrNoneZero PlayerOrNone = 0
	PlayerOrNoneOne  PlayerOrNone = 1
	PlayerOrNoneNone PlayerOrNone = 2
)
