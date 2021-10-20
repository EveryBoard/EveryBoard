# AwesomBoard

[AwesomBoard](awesom.eu/board) is a platform to play various abstract strategy games, but also to develop AI for these games and to explore new games.

If you like AwesomBoard, do not hesitate to star this repository!

# Development
## Local server
Run `npm start` and navigate to `http://localhost:4200`

## Building for deployment

Run `npm run build`. The result of the build will be stored in the `dist/` directory.

## Running unit tests

Make sure firebase emulators are installed by running `firebase init emulators`.
Then, run `npm test`

## Updating translations

Run `./scripts/update-translations.sh` to update the translation files.
Then, translate in `translations/messages.fr.xlf`.
Finally, run `./scripts/check-translations.sh` to check that you haven't forgot anything and to generate the final translation files that will be used in deployment.

## PR Merge procedure
### For the PR submitter
After the PR has been approved for merging:
  - Update the global thresholds in `src/karma.conf.js` (`coverageReporter.check.global`) to match with your latest run from `npm test`.
  - Update `index.html` with the number of tests
  - Update the coverage data with `scripts/coverage.py generate`

### For the PR merger
  - Check that `src/karma.conf.js` has been updated
  - Check that `index.html` has been updated
  - Check that `coverage/*.csv` have been updated
