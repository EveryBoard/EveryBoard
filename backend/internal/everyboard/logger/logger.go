package logger

import (
	"log"
	"os"
)

const (
	red   = "\033[31m"
	reset = "\033[0m"
)

var (
	Info  = log.New(os.Stderr, "[INFO] ", log.LstdFlags)
	Error = log.New(os.Stderr, red+"[ERROR] "+reset, log.LstdFlags)
	Debug = log.New(os.Stderr, "[DEBUG] ", log.LstdFlags)
)
