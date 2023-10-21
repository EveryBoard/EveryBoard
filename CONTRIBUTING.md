You want to contribute to EveryBoard? Great! Here are some instructions to help in that process.

# I'd like to contribute but I have very little time
No problem! You can:

  - Star this repository
  - Try out our website and [open a new issue](https://github.com/EveryBoard/EveryBoard/issues/new/choose) if you find anything that should not happen!

# I have a bit of spare time to contribute
Nice! You can look at the list of [issues](https://github.com/EveryBoard/EveryBoard/issues), in particular the ones labelled as [good first issue](https://github.com/EveryBoard/EveryBoard/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22).

# I have quite some time to contribute
Great! There's a few things you can help with:

  - You can browse through the list of [issues](https://github.com/EveryBoard/EveryBoard/issues) and pick the one that you'd like to work on.
  - You can implement a new game as a starting point. If you don't know which game, we do have plenty of ideas so don't hesitate to contact a [member of the organization](https://github.com/orgs/EveryBoard/people)
  - You can also contact us in case you wish to implement a particular feature. We have quite some ideas on the roadmap already, and maybe you'd like to tackle one of these!
  - If you have some graphics or UX knowledge, we'd be happy to share design improvement ideas with you and to hear your opinion!

# Development
Here is some more information on getting started with developing with EveryBoard.

## Cloning the repository
Run `git clone https://github.com/EveryBoard/EveryBoard`

## Install dependencies
Run `npm ci`

## Local server
Ensure you are logged in to firebase (check with `npx firebase login list`). If not you'll need to run `npx firebase login` to authenticate. Next, make sure firebase emulators are installed by running `npx firebase init emulators`.
Then, run `npm run start:emulator` and navigate to `http://localhost:4200`

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
