# HTML conventions
- HTML id and class names are separated by `-`
- HTML classes that do not have a corresponding CSS class must be prefixed with `data-`, e.g., `data-game-name`

# Test conventions
- 'Then it should fail' is the official 'then' of lines like 'await testUtils.expectClickFailure...'
- 'Then the move should be illegal' is the officiel 'then' of lines like 'testUtils.expectMoveFailure...'