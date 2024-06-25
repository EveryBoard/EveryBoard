EveryBoard's backend

It is build in OCaml with Dream's HTTP server.

To build:

```sh
make
```

To run:

```sh
make run
```

To run all tests (coverage data is stored in the `_coverage` directory):

```sh
make test
```

To run specific tests:

```sh
make test match='regex-that-matches-some-test'
```

