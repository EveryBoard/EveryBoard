package utils

import (
	"log"
)

const Red = "\033[31m"
const Reset = "\033[0m"

type Logger interface {
	Infof(format string, args ...any)
	Errorf(format string, args ...any)
	Debugf(format string, args ...any)
}

type StandardLogger struct{}

func (l StandardLogger) Infof(format string, args ...any) {
	log.Printf("[INFO] "+format, args...)
}

func (l StandardLogger) Errorf(format string, args ...any) {
	log.Printf(Red+"[ERROR] "+format+Reset, args...)
}

func (l StandardLogger) Debugf(format string, args ...any) {
	// Debug logging can be toggled via env var if needed
	log.Printf("[DEBUG] "+format, args...)
}

var DefaultLogger Logger = StandardLogger{}
