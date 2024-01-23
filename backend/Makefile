all: bin

gamelist:
	grep "new GameInfo" ../src/app/components/normal-component/pick-game/pick-game.component.ts | sed -E "s/.*new GameInfo\([^,]+, +'([^']+)'.*/\1/" > games.txt

bin:
	opam exec -- dune build main.exe

run: gamelist
	GAMES=$$(cat games.txt)
	opam exec -- dune exec -- ./main.exe

test: bin gamelist
	GAMES=$$(cat games.txt) \
	opam exec -- dune exec --instrument-with bisect_ppx --force -- ./tests.exe test $(match)
	bisect-ppx-report html
	echo 'Coverage produced in _coverage/index.html'
	find . -name '*.coverage' | xargs rm -f

docker: gamelist
	sed -i 's/;; //' dune
	docker build -t backend-build -f Dockerfile.build .
	sed -i 's/(flags /;; (flags/' dune
	docker run --rm --entrypoint cat backend-build /home/ocaml/_build/default/main.exe > main.static.exe
	echo "GAMES='$$(cat games.txt)'" > .env
	docker build -t backend -f Dockerfile.serve .


clean:
	opam exec -- dune clean

.PHONY: bin test clean install all
