package internal

import (
	"os"
	"log"
	"strings"

	"github.com/EveryBoard/EveryBoard/internal/utils"
)

func readFile(filename string) utils.Set[string] {
	data, err := os.ReadFile(filename)
	if err != nil {
		log.Fatalf("Cannot read %v: %v", filename, err)
		return nil
	}

	gamesSet := make(utils.Set[string])
	for _, line := range strings.Split(string(data), "\n") {
		if game := strings.TrimSpace(line); game != "" {
			gamesSet.Add(game)
		}
	}

	return gamesSet
}

var gameList utils.Set[string]

func initGameList(filePath string) {
	gameList = readFile(filePath)
}

func gameExists(gameName string) bool {
	_, exists := gameList[gameName]
	return exists
}
