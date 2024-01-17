all: bin

bin:
	opam exec -- dune build main.exe

run:
	GAMES=$$(grep "new GameInfo" ../src/app/components/normal-component/pick-game/pick-game.component.ts | sed -E "s/.*new GameInfo\([^,]+, +'([^']+)'.*/\1/" | paste -s -d, /dev/stdin) \
	opam exec -- dune exec -- ./main.exe

test: bin
	GAMES=$$(grep "new GameInfo" ../src/app/components/normal-component/pick-game/pick-game.component.ts | sed -E "s/.*new GameInfo\([^,]+, +'([^']+)'.*/\1/" | paste -s -d, /dev/stdin) \
	opam exec -- dune exec --instrument-with bisect_ppx --force -- ./tests.exe test $(match)
	bisect-ppx-report html
	echo 'Coverage produced in _coverage/index.html'
	find . -name '*.coverage' | xargs rm -f

clean:
	opam exec -- dune clean

.PHONY: bin test clean install all
