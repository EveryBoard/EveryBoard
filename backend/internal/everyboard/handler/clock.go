package handler

import (
	"math/rand"
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
	return rand.Intn(2) == 1
}

var RandBool = randBoolImpl
