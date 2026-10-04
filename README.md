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
`make ci-translations`, and `make ci-images`. Run `make ci-clean` to remove the CI Compose resources.

The end-to-end suite is not containerized yet. It continues to run with `npm run e2e` and remains a separate GitHub
Actions job because its launcher currently manages its own PostgreSQL container and local processes.
