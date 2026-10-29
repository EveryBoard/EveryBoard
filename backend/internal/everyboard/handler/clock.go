package handler

import (
	"crypto/rand"
	"fmt"
	"time"
)

func nowImpl() int64 {
	return time.Now().Unix()
}

var Now = nowImpl

func nowFloatImpl() float64 {
	return float64(time.Now().UnixNano()) / 1e9
}

var NowFloat = nowFloatImpl

func randBoolImpl() bool {
	var randomByte [1]byte
	if _, err := rand.Read(randomByte[:]); err != nil {
		panic(fmt.Errorf("cannot generate random first player: %w", err))
	}
	return randomByte[0]&1 == 1
}

var RandBool = randBoolImpl
