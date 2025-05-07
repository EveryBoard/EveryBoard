package utils

import "log"

const Red = "\033[31m"
const Reset = "\033[0m"

func Errorf(format string, args ...any) {
    log.Printf(Red+format+Reset, args...)
}
