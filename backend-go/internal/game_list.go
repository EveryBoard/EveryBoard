package internal
import (
	"os"
	"log"
	"strings"
)

func readFile(filename string) Set[string] {
	data, err := os.ReadFile(filename)
	if err != nil {
		log.Fatalf("Cannot read %v: %v", filename, err)
		return nil
	}

	gamesSet := make(Set[string])
	for _, line := range strings.Split(string(data), "\n") {
		if game := strings.TrimSpace(line); game != "" {
			gamesSet.Add(game)
		}
	}

	return gamesSet
}

var gameList = readFile("games.txt")

func GameExists(gameName string) bool {
	_, exists := gameList[gameName]
	return exists
}
