# EveryBoard

[EveryBoard](https://everyboard.org) is a platform to play various abstract strategy games, to develop AIs for these games, and to explore new game ideas.

If you like EveryBoard, please star this repository!

If you would like to help, see [how to contribute](CONTRIBUTING.md)

## Running CI locally

The build, unit tests, linters, translation checks, and PostgreSQL integration tests run in Docker. The only local
requirements are Docker, Docker Compose, and Make.

Run the complete containerized validation suite with:

```sh
make ci
```

Individual categories can be run with `make ci-build`, `make ci-frontend`, `make ci-backend`, `make ci-lint`,
`make ci-translations`, `make ci-images`, and `make ci-e2e`. Run `make ci-clean` to remove the CI Compose resources.
