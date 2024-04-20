[33mcommit 7194c788a9131d2dfa20fe3daaff7f072a196b91[m[33m ([m[1;36mHEAD -> [m[1;32mrectanglz[m[33m, [m[1;31morigin/rectanglz[m[33m)[m
Merge: 1671ec372 0937eb63d
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Apr 17 21:30:51 2024 +0200

    [rectanglz] pull develop and fix conflicts

[33mcommit 0937eb63d96851fa4dee4cfc9bf042f9ba273c6e[m[33m ([m[1;31morigin/develop[m[33m, [m[1;31morigin/HEAD[m[33m, [m[1;32mdevelop[m[33m)[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Apr 14 15:32:58 2024 -0400

    Separate utils into a lib (#160)
    
    * [lib] Move files around
    
    * [lib] Get lib test to work
    
    * [lib] Add coverage check
    
    * [lib] Fix compilation of tests
    
    * [lib] Fix tests
    
    * [lib] Improve lib coverage
    
    * [lib] Fix ArrayUtils, achieve full lib coverage
    
    * [lib] Update CI
    
    * [lib] Fix linter
    
    * [lib] Try to fix CI
    
    * [lib] Try to fix CI once more
    
    * [lib] Disable cache in CI to see what happens
    
    * [lib] Restore cache, add debug ls
    
    * [lib] More debug
    
    * [lib] Try to fix build
    
    * [lib] Improve CI, remove debug stuff
    
    * [lib] More debug
    
    * [lib] More debug
    
    * [lib] Add missing dep
    
    * [lib] Update package.json
    
    * [lib] Try to fix libtest in CI
    
    * [lib] Strange behaviour requires strange changes
    
    * [lib] Add lost coverage
    
    * [lib] Fix Diam equality test
    
    * [lib] Archive coverage results before checking it
    
    * [lib] Only one import of @everyboard/lib per file
    
    * [lib] Fix tests
    
    * [lib] Fix linter
    
    * [lib] Fix lib tests
    
    * [lib] lib coverage
    
    * [lib] Remove empty files
    
    * [lib] Remove unneeded files
    
    * [lib] Fix package-lock
    
    * [lib] Fix build
    
    * [lib] wtf
    
    * [lib] wtf...
    
    * [lib] PR comments
    
    * [lib] Fix build
    
    * [lib] PR comments
    
    * [lib] Hopefully really fix build
    
    * [lib] Fix CI
    
    * [lib] Fix lint dependencies
    
    * [lib] Fix lint
    
    * [lib] Remove newlines
    
    * [lib] Remove unused function

[33mcommit 1671ec37244b62cd716a7ef564090f6002c7c7d2[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Apr 9 20:10:38 2024 +0200

    [rectanglz] pr comments

[33mcommit a8866db7dc8d889ebdf52f343d69cd3213e7a991[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun Apr 7 17:28:04 2024 -0400

    [active-parts-fix] Fix use of PartDocument in ActivePartsService

[33mcommit 4996adccb4ad0dd9a63b8b0c8b357f5f65c65c17[m[33m ([m[1;32mepaminondas-double-click[m[33m)[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 5 11:27:43 2024 -0400

    Fix e2e (#197)

[33mcommit 86865ea372f741093c671cf861c1afdb934319a5[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Apr 1 06:18:41 2024 -0400

    Display game name in lobby and header (#185)
    
    * Display game name in lobby and header
    
    * [display-game-name] PR comments
    
    * [display-game-name] Convention
    
    * [display-game-name] Conventions, 2
    
    * [display-game-name] Add missing id
    
    * [display-game-name] Fix tests

[33mcommit d6ef0f415d0c8333b57c0757de92d66cd455b2c9[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Mar 29 18:02:05 2024 +0100

    [rectanglz] mostly done

[33mcommit ec00b65e6edd133f0b793a81d452c280997e75b9[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Mar 18 19:09:37 2024 +0100

    work in progress, almost done

[33mcommit e8f7ea743b2f1663fcd749916d03522d3c5cfcad[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Mar 17 14:26:03 2024 +0100

    [rectanglz] game is now playable online

[33mcommit 09676468014a5b1f4e64afe3f0c166101c3dec3e[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Mar 16 17:51:46 2024 +0100

    [rectanglz] is playable

[33mcommit 04e25b8f94e1cbe6242c2d4caba85329567e47f1[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Mar 16 08:19:43 2024 +0100

    Fix deployment by downgrading angular-cli-ghpages (#190)

[33mcommit 2ec14af1bb3d85f4affe99efe9cb81f3b008733c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Mar 12 21:50:25 2024 +0100

    Update dependencies, remove @angular/fire (#186)
    
    * [updates-2024-03] Remove angular/fire
    
    * [updates-2024-03] Upgrade dependencies
    
    * [updates-2024-03] Lint
    
    * [updates-2024-03] More upgrades

[33mcommit fff7ded06ac96b199714d6df4d5472be0e59083f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Mar 10 20:36:18 2024 +0100

    Add karma-time-stats-reporter to identify slow tests (#184)

[33mcommit d9a88deb7b519dce06e9e1226f2178fa88406eb6[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Mar 1 22:05:20 2024 +0100

    Fix score on online part (#182)
    
    * [score-ogwc] More PlayerMaps!
    
    * [score-ogwc] Remove unneeded function
    
    * [score-ogwc] PR comments

[33mcommit 38b66ea6d4a30d48f523e40ff90300d05ea7d7a7[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Feb 17 12:56:17 2024 -0500

    [fix-part-creation-reload] Bugfix on part-creation (#174)
    
    * [fix-part-creation-reload] Bugfix + refactor on part-creation
    
    When being chosen opponent (or not), and reloading the page, it threw an error.
    
    * [fix-part-creation-reload] PR comments
    
    * [fix-part-creation-reload] PR comment
    
    * [fix-part-creation-reload] PR comment
    
    * [fix-part-creation-reload] Too many blank lines

[33mcommit a9721817dd7d2f6e7aa602e539fa504059a62578[m
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sat Feb 17 14:44:52 2024 +0100

    Fix Pente and Add a Bonus (#179)
    
    * wip
    
    * [fix-pente-config-and-bonus] Done
    
    * [fix-pente-config-and-bonus] fixed some coverage and test
    
    * [fix-pente-config-and-bonus] fix translation, remove describe, fix linter
    
    * [fix-pente-config-and-bonus] fix coverage, again
    
    * [fix-pente-config-and-bonus] PR Comments
    
    * [fix-pente-config-and-bonus] PR Comments
    
    * [fix-pente-config-and-bonus] PR Comments and another bonus
    
    * [fix-pente-config-and-bonus] PR Comments
    
    * [fix-pente-config-and-bonus] PR Comments

[33mcommit 6d05b9cd38f753afcddcffa59f356082af0ada7e[m
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sun Feb 11 21:22:01 2024 +0100

    Don't Click When You Must Reply (#175)
    
    * [dont-click-when-you-must-reply] Done
    
    * [dont-click-when-you-must-reply] Fixed coverage
    
    * [dont-click-when-you-must-reply] pr comments
    
    * [dont-click-when-you-must-reply] Enhance behavior and test of canUserPlay
    
    * [dont-click-when-you-must-reply] PR Comments
    
    * [dont-click-when-you-must-reply] fix demo test and translation
    
    * [dont-click-when-you-must-reply] fixed coverage
    
    * [dont-click-when-you-must-reply] fixed linter
    
    * [dont-click-when-you-must-reply] pulled develop and fixed conflict 2

[33mcommit 7e847a5b676ef505c1410d2a7151ebbff4556126[m
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sun Feb 11 21:05:12 2024 +0100

    Lifecycle Refactor showLastMove and hideLastMove (#180)
    
    * [lifecycle-refactor-slm-and-hlm] HideLastMove and ShowLastMove must now always be implemented
    
    * [lifecycle-refactor-slm-and-hlm]fix translation and coerceo view box

[33mcommit 435387b18220e2adc5e273ee6b37a78903eddb4c[m
Merge: 51ad5f7c3 6ec142368
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Tue Jan 30 20:29:01 2024 +0100

    Merge pull request #176 from EveryBoard/master-in-develop
    
    Master in develop

[33mcommit 6ec142368fe0654bf86a6337333bf08bd32271f2[m[33m ([m[1;31morigin/master-in-develop[m[33m)[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun Jan 28 14:15:45 2024 -0500

    [master-in-develop] Removed too much

[33mcommit a97ec79725d3ba40cea35cf93280710c9230e241[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun Jan 28 14:15:03 2024 -0500

    [master-in-develop] Fix broken changes

[33mcommit 95592790d8c64c74001e48d2a4beecf1b739431a[m
Merge: 4dba84ccc 51ad5f7c3
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun Jan 28 14:07:35 2024 -0500

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into HEAD

[33mcommit 51ad5f7c3b1de6d5fbec83c68a8d816867afcda5[m
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sun Jan 28 18:27:47 2024 +0100

    Ba awa (#162)
    
    * [configurate-game-at-creation] work in progress
    
    * [configurate-game-at-creation] Work in progress
    
    * [configurate-game-at-creation] work in progress, basic functionnality working for LGWC
    
    * [configure-game-at-creation] Working For Go and added Tablut
    
    * [configurate-game-at-creation] Enhance configuration and added Awalé
    
    * [configure-game-at-creation] work in progress
    
    * [configure-game-at-creation] work in progress; added P4
    
    * [configure-game-at-creation] Work in progress; added tests; added games; uniformised view boxes
    
    * [configure-game-at-creation] work in progress
    
    * [configure-game-at-creation] fix LGWC bug, fixed P4 bug, added custom validators
    
    * [configure-game-at-creation] Added Epaminondas; Removed TODOs;
    
    * [configure-game-at-creation] Added goban board game
    
    * [configure-game-at-creation] Adapted classes for multiple-standard-configs
    
    * [configure-game-at-creation] Adapted RulesConfigurationComponent to use default and standard configs
    
    * [configure-game-at-creation] all test running
    
    * [configure-game-at-creation] coverage fixed
    
    * [configure-game-at-creation] remove xdescribe
    
    * [configure-game-at-creation] fix coverage
    
    * wip
    
    * [configure-game-at-creation] PR Comments
    
    * [configure-game-at-creation] pulled develop; fixed conflict; answer PR Comments
    
    * [configure-game-at-creation] fixed; mancalas configurability enhanced
    
    * [configure-game-at-creation] Mancala made more configurable
    
    * [configure-game-at-creation] Unified Mancala's code
    
    * [configure-game-at-creation] Enhance Mancala; PR COmments answered
    
    * [configure-game-at-creation] PR Comments all answered
    
    * wip
    
    * [configure-game-at-creation] work in progress
    
    * [configure-game-at-creation] Work in progress
    
    * [configure-game-at-creation] wip
    
    * [configurate-game-at-creation] prefer <= to >= for uniformity
    
    * [configurate-game-at-creation] make Siam editable
    
    * [configure-game-at-creation] make siam and reversi configurable
    
    * [configure-game-at-creation] remove xdescribe
    
    * [configurate-game-at-creation] PR Comments and optianisabilisation
    
    * [configurate-game-at-creation] PR COmments; work in progress
    
    * [configure-game-at-creation] PR Comments; fixed test, optionalisabilisation
    
    * [configure-game-at-creation] PR Comments
    
    * [configure-game-at-creation] small change
    
    * [configure-game-at-creation] remove config reference from node
    
    * [configure-game-at-creation] remove TODOs
    
    * [configure-game-at-creation] remove xdes; PR Comments
    
    * [configure-game-at-creation] fixed coverage
    
    * [configure-game-at-creation] remove console.log
    
    * [configure-game-at-creation] PR Comments
    
    * [configure-game-at-creation] PR Comments
    
    * [Ba-awa] Added Game Ba-awa
    
    * [ba-awa] remove fit
    
    * [ba-awa] fix translation and tests
    
    * [ba-awa] PR Comment
    
    * [ba-awa] remove xdescribe and add unit test, remove todo
    
    * [ba-awa] fix linter and tests
    
    * [ba-awa] fix cross-config behavior of mancalas
    
    * [ba-awa] PR Comments
    
    * [ba-awa] PR Comments & Translations
    
    * [ba-awa] kalah is not awalé
    
    * [ba-awa] PR Comments
    
    * [ba-awa] Update images
    
    * [ba-awa] PR Comments
    
    * [ba-awa] PR Comments; fixed linter and translations
    
    * [ba-awa] fixed test
    
    * [ba-awa] pr comments
    
    * [ba-awa] fix linter and translation and release date
    
    * [ba-awa] fix small  bug]
    
    ---------
    
    Co-authored-by: Quentin Stievenart <quentin.stievenart@gmail.com>

[33mcommit d6df61c95b88cd6cfcc1efc6c9e7e3fdfa36b93c[m
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sun Jan 28 17:40:55 2024 +0100

    Abalone Capture Should Be Shown (#172)
    
    * [abalone-capture-should-be-shown] done
    
    * [abalone-capture-should-be-shown] Fix conflict
    
    * [abalone-capture-should-be-shown] abalone arrow bug fixed; hive fix in progress
    
    * wip
    
    * [abalone-capture-should-be-shown] fixed other hexagonals
    
    * [abalone-capture-should-be-shown] pr comments
    
    * [abalone-capture-should-be-shown] pr comments
    
    * [abalone-capture-should-be-shown] PR Comments

[33mcommit 8ff8f23f002823d53177eb5b8df357f12d0dd8ac[m
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Fri Jan 26 02:42:14 2024 +0100

    Render Player And FourStatePiece Value Attribute Private (#169)
    
    * Changed .value attribute into a private attribute and created a getValue() method in Player.(PlayerNone | Player), RelativePlayer and FourStatePieces, aswell as changing the corresponding calls in the files to match the new getValue()
    
    * Changed all case of using .value from PlayerOrNone from all .ts files, Aswell added <PlayerOrNone, number> to "new MGPMap" in ApagosSquare.ts which was causing a missmatch in type
    
    * finished to replace the .value into .getValue() in the html files, and removed the "jeanjjjjj" test that was still in a file
    
    * [RenderPlayerAndFourStatePieceValueAttributePrivate]
    
    * Merger with Develop
    
    * Added method getPlayer to fourStatePiece and fixed some reviews
    
    * Fixed more reviews, hands to Martin to finish the removal of the getValue() in PlayerOrNone
    
    * [render-player-and-four-state-piece-value-attribute-private] remove hardcoded number from FourStatePiece entirely
    
    * [render-player-and-four-state-piece-value-attribute-private] Fixed test
    
    * [RenderPlayerAndFourStatePieceValueAttributePrivate] remove fit
    
    * [render-player-and-four-state-piece-value-attribute-private] remove xdescribe
    
    * wip
    
    * [render-player-and-four-state-piece-value-attribute-private] Create and use PlayerNumberMap
    
    * [render-private-player-value] fixed test and translations
    
    * [render-private-player-value] fixed linter
    
    * [render-private-player-value] PR Comments; enhance PlayerNumberMap
    
    * [render-private-player-value] fix tests compilation and last PR Comments
    
    * [render-private-player-value] fixed Siam
    
    * [render-private-player-value] fix tests
    
    * [render-private-player-value] fixed coverage
    
    ---------
    
    Co-authored-by: mvherp <mathieu.van.herp@ulb.be>

[33mcommit 120290bd5549a5d7466ebefb830c6b7f42ac6b9c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Jan 18 14:52:50 2024 -0500

    [update-2024-01] Fully upgrade all dependencies (#173)
    
    * [update-2024-01] Fully upgrade all dependencies
    
    * [update-2024-01] PR comments

[33mcommit 992a4458e2d1fc6de056dd666cc581360aa0212c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jan 14 09:42:10 2024 -0500

    Use MinimalUser instead of Player in game events (#171)
    
    * [minimal-user-game-event] Use MinimalUser in game events
    
    * [minimal-user-game-event] Fix tests and linter
    
    * [minimal-user-game-event] PR comments
    
    * [minimal-user-game-event] PR comments
    
    * [minimal-user-game-event] Fix error due to opponent not being bound yet
    
    * [minimal-user-game-event] Really fix error
    
    * [minimal-user-game-event] Simplify user management in OGWC
    
    * [minimal-user-game-event] Fix linter
    
    * [minimal-user-game-event] Fix linter

[33mcommit b9b581b4b1f577ed2964b5615a215eb08914707c[m
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Thu Jan 4 22:16:30 2024 +0100

    Multi Metric Minimaxes (#159)
    
    * [configurate-game-at-creation] work in progress
    
    * [configurate-game-at-creation] Work in progress
    
    * [configurate-game-at-creation] work in progress, basic functionnality working for LGWC
    
    * [configure-game-at-creation] Working For Go and added Tablut
    
    * [configurate-game-at-creation] Enhance configuration and added Awalé
    
    * [configure-game-at-creation] work in progress
    
    * [configure-game-at-creation] work in progress; added P4
    
    * [configure-game-at-creation] Work in progress; added tests; added games; uniformised view boxes
    
    * [configure-game-at-creation] work in progress
    
    * [configure-game-at-creation] fix LGWC bug, fixed P4 bug, added custom validators
    
    * [configure-game-at-creation] Added Epaminondas; Removed TODOs;
    
    * [configure-game-at-creation] Added goban board game
    
    * [configure-game-at-creation] Adapted classes for multiple-standard-configs
    
    * [configure-game-at-creation] Adapted RulesConfigurationComponent to use default and standard configs
    
    * [configure-game-at-creation] all test running
    
    * [configure-game-at-creation] coverage fixed
    
    * [configure-game-at-creation] remove xdescribe
    
    * [configure-game-at-creation] fix coverage
    
    * wip
    
    * [configure-game-at-creation] PR Comments
    
    * [configure-game-at-creation] pulled develop; fixed conflict; answer PR Comments
    
    * [configure-game-at-creation] fixed; mancalas configurability enhanced
    
    * [configure-game-at-creation] Mancala made more configurable
    
    * [configure-game-at-creation] Unified Mancala's code
    
    * [configure-game-at-creation] Enhance Mancala; PR COmments answered
    
    * [configure-game-at-creation] PR Comments all answered
    
    * wip
    
    * [configure-game-at-creation] work in progress
    
    * [configure-game-at-creation] Work in progress
    
    * [configure-game-at-creation] wip
    
    * [configurate-game-at-creation] prefer <= to >= for uniformity
    
    * [configurate-game-at-creation] make Siam editable
    
    * [configure-game-at-creation] make siam and reversi configurable
    
    * [configure-game-at-creation] remove xdescribe
    
    * [multi-metric-minimaxes] moved ai related files in specific sub-folder
    
    * [multi-metric-minimaxes] work in progress
    
    * [multi-metric-minimaxes] fixed ArrayUtils and hence, the whole behavior
    
    * [multi-metric-minimaxes] Fixed SixHeuristic
    
    * [configurate-game-at-creation] PR Comments and optianisabilisation
    
    * [configurate-game-at-creation] PR COmments; work in progress
    
    * [configure-game-at-creation] PR Comments; fixed test, optionalisabilisation
    
    * [configure-game-at-creation] PR Comments
    
    * [configure-game-at-creation] small change
    
    * [configure-game-at-creation] remove config reference from node
    
    * [configure-game-at-creation] remove TODOs
    
    * [configure-game-at-creation] remove xdes; PR Comments
    
    * [configure-game-at-creation] fixed coverage
    
    * [configure-game-at-creation] remove console.log
    
    * [multi-metric-minimaxes] pulled configure-game-at-creation and fixed conflict
    
    * [configure-game-at-creation] PR Comments
    
    * [configure-game-at-creation] PR Comments
    
    * [multi-metric-minimaxes] PR Comments
    
    * [configure-game-at-creation] Ba-awa
    
    * [configure-game-at-creation] changed index.html
    
    * [configurate-game-at-creation] reverting ba-awa
    
    * [configurate-game-at-creation] fix TIMEOUT_BETWEEN_LAPS
    
    * [configure-game-at-creation] PR Comments
    
    * [configure-game-at-creation] use NoConfig type
    
    * [configurate-game-at-creation] PR Comments
    
    * [configure-game-at-creation] fix translation
    
    * [configurate-game-at-creation] should fix coverage?
    
    * [configurate-game-at-creation] PR Comments
    
    * [configure-game-at-creation] PR Comments
    
    * [configurate-game-at-creation] Update image and script
    
    * [configurate-game-at-creation] Fix build
    
    * [configuirate-game-at-creation] OGWC.getConfig is now a real getter
    
    * [configurate-game-at-creation] Update translations
    
    * [configurate-game-at-creation] PR Comments
    
    * [configure-game-at-creation] add last comment
    
    * [configurate-game-at-creation] Improve CI and hopefuly fix CSS test
    
    * [multi-metric-minimaxes] PR Comments
    
    * [multi-metric-minimaxes] pulled develop and fixed conflict
    
    * [multi-metric-minimaxes] done todo and fix naming
    
    * [multi-metric-minimaxes] PR Comments
    
    * [multi-metrix-minimax] enhance edge-using board, reuse PlayerNumberTable
    
    * [multi-metric-minimaxes] made Minimax move BoardValue agnostic; pr comments
    
    * [multi-metric-minimaxes] PR Comments
    
    * [multi-metric-minimaxes] PR Comments and Coverage Boost
    
    * [multi-metric-minimaxes] fixed build
    
    * [multi-metric-minimaxes] fix file naming
    
    * [multi-metric-minimaxes] rename
    
    * [multi-metric-minimaxes] files renaming case sensitive
    
    * [multi-metric-minimaxes] removes xdescribe and logs
    
    * [multi-metric-minimaxes] fix translation
    
    * [multi-metric-minimaxes] PR Comments about translation
    
    ---------
    
    Co-authored-by: Quentin Stievenart <quentin.stievenart@gmail.com>

[33mcommit e325dd82e42e4bb204c1fe05d75638af5a8eb181[m
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sat Dec 30 23:11:53 2023 +0100

    Lodestone: Crumbled Lodestone displayed as Pieces (#168)
    
    * wip
    
    * [lodestone-crumbled-lodestone-showed-as-crumbled-piece-bug] Fixed
    
    * [lodestone-bug-fix] removed undead lodestone bug
    
    * [lodestone-bug-fix] fixed it at last

[33mcommit bac80c4dfbcb546b0a4eaf338be3dbabd0fdc1d5[m
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Thu Dec 28 21:35:48 2023 +0100

    [epaminondas-show-score] (#164)

[33mcommit 7e362cb53c70b0bc083fd110a8fb378148946e49[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 27 10:36:44 2023 -0500

    Fix flaky CI tests (#165)
    
    * [configurate-game-at-creation] work in progress
    
    * [configurate-game-at-creation] Work in progress
    
    * [configurate-game-at-creation] work in progress, basic functionnality working for LGWC
    
    * [configure-game-at-creation] Working For Go and added Tablut
    
    * [configurate-game-at-creation] Enhance configuration and added Awalé
    
    * [configure-game-at-creation] work in progress
    
    * [configure-game-at-creation] work in progress; added P4
    
    * [configure-game-at-creation] Work in progress; added tests; added games; uniformised view boxes
    
    * [configure-game-at-creation] work in progress
    
    * [configure-game-at-creation] fix LGWC bug, fixed P4 bug, added custom validators
    
    * [configure-game-at-creation] Added Epaminondas; Removed TODOs;
    
    * [configure-game-at-creation] Added goban board game
    
    * [configure-game-at-creation] Adapted classes for multiple-standard-configs
    
    * [configure-game-at-creation] Adapted RulesConfigurationComponent to use default and standard configs
    
    * [configure-game-at-creation] all test running
    
    * [configure-game-at-creation] coverage fixed
    
    * [configure-game-at-creation] remove xdescribe
    
    * [configure-game-at-creation] fix coverage
    
    * wip
    
    * [configure-game-at-creation] PR Comments
    
    * [configure-game-at-creation] pulled develop; fixed conflict; answer PR Comments
    
    * [configure-game-at-creation] fixed; mancalas configurability enhanced
    
    * [configure-game-at-creation] Mancala made more configurable
    
    * [configure-game-at-creation] Unified Mancala's code
    
    * [configure-game-at-creation] Enhance Mancala; PR COmments answered
    
    * [configure-game-at-creation] PR Comments all answered
    
    * wip
    
    * [configure-game-at-creation] work in progress
    
    * [configure-game-at-creation] Work in progress
    
    * [configure-game-at-creation] wip
    
    * [configurate-game-at-creation] prefer <= to >= for uniformity
    
    * [configurate-game-at-creation] make Siam editable
    
    * [configure-game-at-creation] make siam and reversi configurable
    
    * [configure-game-at-creation] remove xdescribe
    
    * [configurate-game-at-creation] PR Comments and optianisabilisation
    
    * [configurate-game-at-creation] PR COmments; work in progress
    
    * [configure-game-at-creation] PR Comments; fixed test, optionalisabilisation
    
    * [configure-game-at-creation] PR Comments
    
    * [configure-game-at-creation] small change
    
    * [configure-game-at-creation] remove config reference from node
    
    * [configure-game-at-creation] remove TODOs
    
    * [configure-game-at-creation] remove xdes; PR Comments
    
    * [configure-game-at-creation] fixed coverage
    
    * [configure-game-at-creation] remove console.log
    
    * [configure-game-at-creation] PR Comments
    
    * [configure-game-at-creation] PR Comments
    
    * [configure-game-at-creation] Ba-awa
    
    * [configure-game-at-creation] changed index.html
    
    * [configurate-game-at-creation] reverting ba-awa
    
    * [configurate-game-at-creation] fix TIMEOUT_BETWEEN_LAPS
    
    * [configure-game-at-creation] PR Comments
    
    * [configure-game-at-creation] use NoConfig type
    
    * [configurate-game-at-creation] PR Comments
    
    * [configure-game-at-creation] fix translation
    
    * [configurate-game-at-creation] should fix coverage?
    
    * [configurate-game-at-creation] PR Comments
    
    * [configure-game-at-creation] PR Comments
    
    * [configurate-game-at-creation] Update image and script
    
    * [configurate-game-at-creation] Fix build
    
    * [configuirate-game-at-creation] OGWC.getConfig is now a real getter
    
    * [configurate-game-at-creation] Update translations
    
    * [configurate-game-at-creation] PR Comments
    
    * [configure-game-at-creation] add last comment
    
    * [configurate-game-at-creation] Improve CI and hopefuly fix CSS test
    
    * [configuirate-game-at-creation] Fix e2e
    
    * [configurate-game-at-creation] Fix missing argument in e2e
    
    * [mcts-coverage] Add some debug info for CI fix
    
    * [mcts-coverage] Always store coverage results
    
    * [mcts-coverage] disable fit to see if tests pass
    
    * [mcts-coverage] Remove console.log
    
    * [mcts-coverage] Disable logging
    
    * [mcts-coverage] Fix flaky ConnectedUserService test
    
    * [mcts-coverage] Add test to hopefully fix CI coverage
    
    * [mcts-coverage] Update given
    
    ---------
    
    Co-authored-by: Martin Remy <martin.remy.42@gmail.com>

[33mcommit 4dba84ccc2caae493cff688e1ef4b454ed071cd4[m
Merge: 1d53c34a3 9a3c5a2ef
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue Dec 26 20:19:19 2023 -0500

    Merge branch 'master' of github.com:EveryBoard/EveryBoard into develop

[33mcommit 1d53c34a3793521ae8626a2dfcf3941538413b23[m
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Tue Dec 26 17:45:16 2023 +0100

    Configure Game At Creation (#144)
    
    * [configurate-game-at-creation] work in progress
    
    * [configurate-game-at-creation] Work in progress
    
    * [configurate-game-at-creation] work in progress, basic functionnality working for LGWC
    
    * [configure-game-at-creation] Working For Go and added Tablut
    
    * [configurate-game-at-creation] Enhance configuration and added Awalé
    
    * [configure-game-at-creation] work in progress
    
    * [configure-game-at-creation] work in progress; added P4
    
    * [configure-game-at-creation] Work in progress; added tests; added games; uniformised view boxes
    
    * [configure-game-at-creation] work in progress
    
    * [configure-game-at-creation] fix LGWC bug, fixed P4 bug, added custom validators
    
    * [configure-game-at-creation] Added Epaminondas; Removed TODOs;
    
    * [configure-game-at-creation] Added goban board game
    
    * [configure-game-at-creation] Adapted classes for multiple-standard-configs
    
    * [configure-game-at-creation] Adapted RulesConfigurationComponent to use default and standard configs
    
    * [configure-game-at-creation] all test running
    
    * [configure-game-at-creation] coverage fixed
    
    * [configure-game-at-creation] remove xdescribe
    
    * [configure-game-at-creation] fix coverage
    
    * wip
    
    * [configure-game-at-creation] PR Comments
    
    * [configure-game-at-creation] pulled develop; fixed conflict; answer PR Comments
    
    * [configure-game-at-creation] fixed; mancalas configurability enhanced
    
    * [configure-game-at-creation] Mancala made more configurable
    
    * [configure-game-at-creation] Unified Mancala's code
    
    * [configure-game-at-creation] Enhance Mancala; PR COmments answered
    
    * [configure-game-at-creation] PR Comments all answered
    
    * wip
    
    * [configure-game-at-creation] work in progress
    
    * [configure-game-at-creation] Work in progress
    
    * [configure-game-at-creation] wip
    
    * [configurate-game-at-creation] prefer <= to >= for uniformity
    
    * [configurate-game-at-creation] make Siam editable
    
    * [configure-game-at-creation] make siam and reversi configurable
    
    * [configure-game-at-creation] remove xdescribe
    
    * [configurate-game-at-creation] PR Comments and optianisabilisation
    
    * [configurate-game-at-creation] PR COmments; work in progress
    
    * [configure-game-at-creation] PR Comments; fixed test, optionalisabilisation
    
    * [configure-game-at-creation] PR Comments
    
    * [configure-game-at-creation] small change
    
    * [configure-game-at-creation] remove config reference from node
    
    * [configure-game-at-creation] remove TODOs
    
    * [configure-game-at-creation] remove xdes; PR Comments
    
    * [configure-game-at-creation] fixed coverage
    
    * [configure-game-at-creation] remove console.log
    
    * [configure-game-at-creation] PR Comments
    
    * [configure-game-at-creation] PR Comments
    
    * [configure-game-at-creation] Ba-awa
    
    * [configure-game-at-creation] changed index.html
    
    * [configurate-game-at-creation] reverting ba-awa
    
    * [configurate-game-at-creation] fix TIMEOUT_BETWEEN_LAPS
    
    * [configure-game-at-creation] PR Comments
    
    * [configure-game-at-creation] use NoConfig type
    
    * [configurate-game-at-creation] PR Comments
    
    * [configure-game-at-creation] fix translation
    
    * [configurate-game-at-creation] should fix coverage?
    
    * [configurate-game-at-creation] PR Comments
    
    * [configure-game-at-creation] PR Comments
    
    * [configurate-game-at-creation] Update image and script
    
    * [configurate-game-at-creation] Fix build
    
    * [configuirate-game-at-creation] OGWC.getConfig is now a real getter
    
    * [configurate-game-at-creation] Update translations
    
    * [configurate-game-at-creation] PR Comments
    
    * [configure-game-at-creation] add last comment
    
    * [configurate-game-at-creation] Improve CI and hopefuly fix CSS test
    
    * [configuirate-game-at-creation] Fix e2e
    
    * [configurate-game-at-creation] Fix missing argument in e2e
    
    ---------
    
    Co-authored-by: Quentin Stievenart <quentin.stievenart@gmail.com>

[33mcommit e96db363423aaef9f4a2d3ed483c8a983469b381[m
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sat Dec 23 22:51:35 2023 +0100

    Lodestone Row Capture Enhancement (#158)
    
    * [lodestone-row-capture-enhancement] work in progress; some bug to fix
    
    * [lodestone-row-capture-enhancement] work in progress; bug to fix remain
    
    * [lodestone-row-capture-enhancement] Work in progress; Mostly done
    
    * [lodestone-row-capture-enhancement] PR Comments answered
    
    * [lodestone-row-capture-enhancement] fix tests
    
    * [lodestone-row-capture-enhancement] PR Comments
    
    * [lodestone-row-capture-enhancement] PR Comments
    
    * [lodestone-row-capture-enhancement] small fix
    
    * [lodestone-row-capture-enhancement] fix translations
    
    * [lodestone-row-capture-enhancement] PR Comments
    
    * [lodestone-row-capture-enhancement] Linter fixed
    
    * [lodestone-row-capture-enhancement] PR Comments
    
    * [lodestone-row-capture-enhancement] PR Comments comment
    
    * [lodestone-row-capture-enhancement] fixed coverage
    
    * [lodestone-row-capture-enhancement] highlight fixed
    
    * [lodestone-row-capture-enhancement] fix coverage and linter
    
    * [lodestone-row-capture-enhancement] PR Comments
    
    * [lodestone-row-capture-enhancement] PR Comments

[33mcommit 9f9b07c7e827ed10d63512a0cfb60e8c0501be93[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Dec 18 00:50:56 2023 -0500

    [fix-maximumsby] Fix ArrayUtils.maximumsBy (#161)

[33mcommit 9a3c5a2ef53242d3f672148285d135d75474bfe7[m[33m ([m[1;32mmaster[m[33m)[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Nov 26 05:37:04 2023 -0500

    EveryBoard Master 13 (#140)
    
    * [mcts] Initial try
    
    * [kalah] mancala rules centralised; main functionnality working; work in progress
    
    * [debug-flag] Initial design for dynamically enabled debug mode
    
    * [debug-flag] Fix type of display
    
    * [debug-flag] Improve Utils.display
    
    * [debug-flag] Add ability to programmatically enable debug mode
    
    * [debug-flag] Add support for logging classes with private constructor
    
    * [kalah] making test async to allow healthy animation handling
    
    * [debug-flag] Propagate everywhere, remove display
    
    * [debug-flag] Remove VERBOSE variables
    
    * [debug-flag] Fix compilation
    
    * [debug-flag] Fix tests and linters
    
    * [kalah] animated awale, kalah to be enhanced
    
    * [toast-improvements] Toast time proportional to message length
    
    * WIP
    
    * [kalah] modify mancala views to show score
    
    * [debug-flag] Store the debug info in localStorage to preserve it across sessions
    
    * [debug-flag] Restore coverage
    
    * [toast-improvements] Remove remaining tick(3000)
    
    * [toast-improvements] Rename getComponent to getGameComponent
    
    * [toast-improvements] Extract configureTestingModule
    
    * [toast-improvements] Moar cleanup
    
    * [toast-improvements] Even more cleanup
    
    * [toast-improvements] Move stuff around to prepare for inheritance
    
    * [toast-improvements] Remove useless constructor argument
    
    * [toast-improvements] Remove unneeded constructor
    
    * [toast-improvements] Rename wrapper to component, add getWrapper()
    
    * [toast-improvements] Introduce TestUtils inheritance
    
    * [toast-improvements] Refactor click methods
    
    * [toast-improvements] Fix linter
    
    * [debug-flag] PR comments
    
    * [kalah] put all component logics in common between kalah and awale
    
    * [mcts] Fix MCTS search starting at end game nodes
    
    * [kalah] animation enhanced, bugs and todo removed
    
    * [mcts] WIP
    
    * [kalah] add step in tutorial
    
    * [kalah] pulled develop and fixed conflict
    
    * [mcts] Progress on refactoring minimaxes
    
    * [mcts] More progress in refactoring minimaxes
    
    * [kalah] Pulled develop and fixed conflict
    
    * wip
    
    * [kalah] enable animation during online game
    
    * [mcts] More refactors
    
    * [mcts] Restore build
    
    * [mcts] Start refactoring tests
    
    * [kalah] Pulled develop and fixed conflict; removed todos
    
    * [toast-improvements] Get rid of almost all tick(1) in favor of tick(0)
    
    * [toast-improvements] Force to catch toasts
    
    * [toast-improvements] Fix linter
    
    * [kalah] Mainly Finished
    
    * [mcts] finish first big refactor of minimax tests
    
    * [conspirateur_minimax_fix] Fixed conspirateur; remove magic-value; enforce State.isOnBoard pattern
    
    * [mcts] WIP, get rid of different BoardValues
    
    * [toast-improvements] PR comments
    
    * [mcts] Restore compilation
    
    * [mcts] Refactor SixMinimax
    
    * [mcts] Add option selection in local game component
    
    * [mcts] Fix tests
    
    * [mcts] Add P4 MCTS!
    
    * [mcts] Add MCTS to Awale
    
    * [coerceo_fix] fixed Coerceo minimax
    
    * [conspirateur_minimax_fix] Pull Request Comment
    
    * [mcts] Restore MCTS tests
    
    * [conspirateur_minimax_fix] pull request comment
    
    * [mcts] Fix MCTS test
    
    * [mcts] Improve coverage
    
    * [mcts] Time-based MCTS + more coverage
    
    * [mcts] Six coverage
    
    * [mcts] Add printDot tests
    
    * [mcts] Fix linter
    
    * [mcts] Add MCTS to every game
    
    * [update] Prepare for upgrading angular
    
    * [update] Upgrade angular to v15
    
    * [update] Update @angular/fire, @fortawesome/angular-fontawesome
    
    * [update] Upgrade angular to v16
    
    * [kalah] pull develop; fixed conflict; PR Comments; TODOS
    
    * [update] more updates
    
    * [update] Remove unneeded dependencies
    
    * [update] npm audit fix
    
    * [update] Fix linter
    
    * [kalah] remove xdescribe
    
    * [kalah] Update images
    
    * [mcts] PR comments
    
    * [mcts] Move heuristics/move generators to specific files (for the first half of the games)
    
    * [kalah] Fix online bugs
    
    * [mcts] Move heuristic/move generator to their specific files for the rest of the games
    
    * [mcts] linter
    
    * [mcts] Move some files
    
    * [mcts] Fix unstable test
    
    * [mcts] Improve GameNode coverage and MCTS timing
    
    * [mcts] Display board value as a number in AI info
    
    * [mcts] Change available timeouts
    
    * [mcts] Heavily reduce max game length
    
    * [mcts] Fix tests, more coverage
    
    * [mcts] Small fixes and more coverage
    
    * [mcts] Recover full coverage
    
    * [kalah] Pull Request Comments
    
    * [mcts] PR comments
    
    * [design-enhancements] Siam: player piece reserve should be on bottom
    
    * [design-enhancements] Quarto: don't show piece in hand when it is empty
    
    * [design-enhancements] Epaminondas: don't highliht non-player pieces
    
    * [design-enhancements] Tafl: remove highlights on non player pieces
    
    * [design-enhancements] Improve Lasca coordinates
    
    * [design-enhancements] Full coverage
    
    * [kalah] pr comments
    
    * [triangular-game-component-stroke-enhancement] refactor calculation coordinate -> points/translate
    
    * [triangular-game-component-stroke-enhancement] done
    
    * [MCTS] PR comments
    
    * [mcts] Update translations
    
    * [design-enhancements] PR comments
    
    * [kalah] PR Comments
    
    * [triangular-game-component-stroke-enhancement] pull request comments
    
    * [triangular-game-component-stroke-enhancement] Pull Request Comments
    
    * [design-enhancements] Fix linter
    
    * [kalah] Pull Request Comments
    
    * [triangular-game-component-stroke-enhancement] test fix
    
    * [kalah] enhance french translations
    
    * [triangular-game-component-stroke-enhancement] fix tests
    
    * [design-enhancement] Introduce pointOfView + isInteractive in game components
    
    * [kalah] fix tutorial
    
    * [triangular-game-component-stroke-enhancement] remove unused method
    
    * [mcts] PR comments
    
    * [mcts] Fix linter
    
    * [kalah] PR Comments about tutorial
    
    * [mcts] PR comments
    
    * [kalah] update release date
    
    * [design-enhancements] PR comments
    
    * [mcts] PR comments
    
    * [mcts] PR comments, rest
    
    * [mcts] Fix missing coverage
    
    * [design-enhancements] PR comments
    
    * [design-enhancements] Fix tests
    
    * [mcts] Remove fit
    
    * [design-enhancement] Fix interactivity when not selecting the AI level
    
    * [mcts] PR comments
    
    * [design-enhancements] PR comments + fix setInteractivity in online game
    
    * [mcts] PR comments
    
    * [design-enhancement] More interactivity tests, use interactivity in Lasca
    
    * [mcts] Translate more AI names
    
    * [mcts] Move common Gipf/Yinsh code into GipfProjectHelper
    
    * [mcts] Remove double gipf capture
    
    * [conspirateur-shelter-enhancement] change shelter highlight
    
    * [conspirateur-shelter-enhancement] change shelter highlight again
    
    * [rules-choose] Change return type of Rules.choose, as well as its usages
    
    * [table-utils] Separate table utils from array utils
    
    * Try to fix e2e in CI (#152)
    
    * [real-teeko] Disable teleport teeko (#151)
    
    * [real-teeko] Disable teleport teeko
    
    * [real-teeko] Test improvements, fix translation
    
    * [real-teeko] PR comment
    
    * [conspirateur-shelter-enhancement] PR Comments
    
    * [conspirateur-shelter-enhancement] PR Comments
    
    * [get-initial-state] Introduce Rules.getInitialState (#148)
    
    * More strictness (#153)
    
    * New game: Diaballik (#146)
    
    * [diaballik] Moves and rules
    
    * [diaballik] Refactor moves
    
    * [diaballik] Fix rules tests
    
    * [diaballik] Prepare component
    
    * [diaballik] First working component
    
    * [diaballik] Refactor component
    
    * [diaballik] Show victory and defeat
    
    * [diaballik] Improve highlights
    
    * [diaballik] Add minimax and indicators
    
    * [diaballik] More tests
    
    * [diaballik] PR comments, coverage, and tutorial
    
    * [diaballik] Translations
    
    * [diaballik] Minor adjustments
    
    * [diaballik] PR comments
    
    * [diaballik] More PR comments
    
    * [diaballik] Better anti-game rule
    
    * [diaballik] Improve viewbox, rotate board for player 1
    
    * [diaballik] Improve component, fix some issues
    
    * [diaballik] Fix tests and move generator
    
    * [diaballik] "Simplify" isUnitary to isSingleOrthogonalStep
    
    * [diaballik] Refactor usages of getViewBox
    
    * [diaballik] Pass over remaining simple PR comments
    
    * [diaballik] Improve piece selection toasts
    
    * [diaballik] Fix most piece selection toast tests
    
    * [diaballik] Fix remaining test
    
    * [diaballik] Show icons to help remember translations and passes done
    
    * [diaballik] Remaining PR comments
    
    * [diaballik] Finish handling PR comments
    
    * [diaballik] First part of new PR comments
    
    * [diaballik] Remaining PR comments
    
    * [diaballik] Update images
    
    * [diaballik] PR comments
    
    * [diaballik] Fix coverage
    
    * [diaballik] PR comments
    
    * [diaballik] PR comments
    
    * [diaballik] Update images
    
    * [diaballik] PR comment
    
    * [diaballik] Fix tests
    
    * [diaballik] Add out of board tests
    
    * [diaballik] Remove infeasible path
    
    * Rook like move highlight for Tafl (#142)
    
    * [rook-like-move-highlight] done
    
    * [rook-like-move-highlight] Added to yinsh too
    
    * [rook-like-move-highlight] pull request comments
    
    * [rook-like-move-highlight] fix linter; respond to pr comment
    
    * [rook-like-move-highlight] PR Comments answered
    
    * [rook-like-move-highlight] PR Comments
    
    * [rook-like-move-highlight] finished merging develop to fix tests
    
    * [rook-like-move-highlight] fix Coord coverage
    
    * [rook-like-move-highlight] added test for PR Comment
    
    * [rook-like-move-highlight] enhance coord behavior and tests
    
    * [rook-like-move-highlight] removed xdescribe
    
    ---------
    
    Co-authored-by: Martin Remy <martin.remy.42@gmail.com>

[33mcommit 3d9072024e02c717829e382b25ff12b7c85f810a[m
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sat Nov 25 14:38:49 2023 +0100

    Rook like move highlight for Tafl (#142)
    
    * [rook-like-move-highlight] done
    
    * [rook-like-move-highlight] Added to yinsh too
    
    * [rook-like-move-highlight] pull request comments
    
    * [rook-like-move-highlight] fix linter; respond to pr comment
    
    * [rook-like-move-highlight] PR Comments answered
    
    * [rook-like-move-highlight] PR Comments
    
    * [rook-like-move-highlight] finished merging develop to fix tests
    
    * [rook-like-move-highlight] fix Coord coverage
    
    * [rook-like-move-highlight] added test for PR Comment
    
    * [rook-like-move-highlight] enhance coord behavior and tests
    
    * [rook-like-move-highlight] removed xdescribe

[33mcommit dcc6f106b28adf632d1927ace29b7ca2758b0b82[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Nov 20 12:26:54 2023 -0500

    New game: Diaballik (#146)
    
    * [diaballik] Moves and rules
    
    * [diaballik] Refactor moves
    
    * [diaballik] Fix rules tests
    
    * [diaballik] Prepare component
    
    * [diaballik] First working component
    
    * [diaballik] Refactor component
    
    * [diaballik] Show victory and defeat
    
    * [diaballik] Improve highlights
    
    * [diaballik] Add minimax and indicators
    
    * [diaballik] More tests
    
    * [diaballik] PR comments, coverage, and tutorial
    
    * [diaballik] Translations
    
    * [diaballik] Minor adjustments
    
    * [diaballik] PR comments
    
    * [diaballik] More PR comments
    
    * [diaballik] Better anti-game rule
    
    * [diaballik] Improve viewbox, rotate board for player 1
    
    * [diaballik] Improve component, fix some issues
    
    * [diaballik] Fix tests and move generator
    
    * [diaballik] "Simplify" isUnitary to isSingleOrthogonalStep
    
    * [diaballik] Refactor usages of getViewBox
    
    * [diaballik] Pass over remaining simple PR comments
    
    * [diaballik] Improve piece selection toasts
    
    * [diaballik] Fix most piece selection toast tests
    
    * [diaballik] Fix remaining test
    
    * [diaballik] Show icons to help remember translations and passes done
    
    * [diaballik] Remaining PR comments
    
    * [diaballik] Finish handling PR comments
    
    * [diaballik] First part of new PR comments
    
    * [diaballik] Remaining PR comments
    
    * [diaballik] Update images
    
    * [diaballik] PR comments
    
    * [diaballik] Fix coverage
    
    * [diaballik] PR comments
    
    * [diaballik] PR comments
    
    * [diaballik] Update images
    
    * [diaballik] PR comment
    
    * [diaballik] Fix tests
    
    * [diaballik] Add out of board tests
    
    * [diaballik] Remove infeasible path

[33mcommit f9f58261aa322d1724c7e9bc02bb1ac96729be6a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Nov 14 09:39:57 2023 -0500

    More strictness (#153)

[33mcommit a60f5f1604f9e07cfc4b3376114f46eb34b19f30[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Nov 12 10:19:14 2023 -0500

    [get-initial-state] Introduce Rules.getInitialState (#148)

[33mcommit 839235b614ce78716b2e79c2e6ba905fb4bdce3b[m
Merge: a981d4a5a 2a5a6f622
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Nov 3 16:22:37 2023 -0400

    Merge pull request #147 from EveryBoard/conspirateurShelterEnhancement
    
    [conspirateur-shelter-enhancement] change shelter highlight

[33mcommit 2a5a6f622c2bad24bc0f701a9714d4c8eebfcbba[m[33m ([m[1;31morigin/conspirateurShelterEnhancement[m[33m)[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Nov 3 20:52:36 2023 +0100

    [conspirateur-shelter-enhancement] PR Comments

[33mcommit 4cdf086967edbbd7690215f801cf761866372a1c[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Oct 25 18:55:51 2023 +0200

    [conspirateur-shelter-enhancement] PR Comments

[33mcommit bd2b745b47bd3a81738879b4030debfcf9cdc3ee[m
Merge: 7d23fba59 a981d4a5a
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Oct 25 07:52:01 2023 +0200

    Merge branch 'develop' of https://github.com/EveryBoard/EveryBoard into conspirateurShelterEnhancement

[33mcommit a981d4a5aa7f61555dcc200ce3203a7930407099[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Oct 23 12:02:11 2023 -0400

    [real-teeko] Disable teleport teeko (#151)
    
    * [real-teeko] Disable teleport teeko
    
    * [real-teeko] Test improvements, fix translation
    
    * [real-teeko] PR comment

[33mcommit 63d3e556d4d1014a87a6cdd899db4a6c2dba54b2[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Oct 15 10:07:59 2023 -0400

    Try to fix e2e in CI (#152)

[33mcommit 2db3714ddb0f6de93933f30ee6bf3dbbcbac340b[m
Merge: 8d5ef6955 ce7689726
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sun Oct 8 21:05:36 2023 +0200

    Merge pull request #149 from EveryBoard/table-utils

[33mcommit 8d5ef69551e93973358eb57c9428eecba7240967[m
Merge: ea0b6bdef 52833d5a3
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sun Oct 8 17:09:28 2023 +0200

    Merge pull request #150 from EveryBoard/rules-choose

[33mcommit ce7689726903847fa2be5d539401801aa8e7bb4a[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun Oct 1 18:49:06 2023 -0400

    [table-utils] Separate table utils from array utils

[33mcommit 52833d5a33e730e7a8127dfc0c5d0bc6d064d38f[m[33m ([m[1;31morigin/rules-choose[m[33m)[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun Oct 1 17:56:18 2023 -0400

    [rules-choose] Change return type of Rules.choose, as well as its usages

[33mcommit 7d23fba5989258d426c5006f81d6bd3591559fcb[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Oct 1 19:15:14 2023 +0200

    [conspirateur-shelter-enhancement] change shelter highlight again

[33mcommit e53c8b6eab900196450a2163246088ae95a80f3a[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Oct 1 18:48:50 2023 +0200

    [conspirateur-shelter-enhancement] change shelter highlight

[33mcommit ea0b6bdefd499462d84e5e641f94ec2d860261c5[m
Merge: 0cbff1bc1 3f3e439cc
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sat Sep 30 14:47:05 2023 +0200

    Merge pull request #143 from EveryBoard/design-enhancements

[33mcommit 3f3e439cc32b50cef3c63cc47819357de87321f7[m[33m ([m[1;31morigin/design-enhancements[m[33m)[m
Merge: 8c91c88f5 0cbff1bc1
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri Sep 29 16:22:11 2023 -0400

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into design-enhancements

[33mcommit 0cbff1bc1590850380903df73d32f0daac1e8aa0[m
Merge: 1b850895c 2cd561abd
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Wed Sep 27 17:51:29 2023 +0200

    Merge pull request #133 from EveryBoard/mcts

[33mcommit 2cd561abdea5eedb280d1d7f70a7f2a4732f236d[m[33m ([m[1;31morigin/mcts[m[33m)[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed Sep 27 09:39:54 2023 -0400

    [mcts] Remove double gipf capture

[33mcommit 5873c1afc781d8e8289b203063fd933ccb987e29[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed Sep 27 09:20:19 2023 -0400

    [mcts] Move common Gipf/Yinsh code into GipfProjectHelper

[33mcommit 0cd594a48163a222f0d4fc444f47a945b71da59d[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Mon Sep 25 08:30:30 2023 -0400

    [mcts] Translate more AI names

[33mcommit 8c91c88f5db2244e221c00ac0f19d330a5566574[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun Sep 24 11:55:30 2023 -0400

    [design-enhancement] More interactivity tests, use interactivity in Lasca

[33mcommit f23c9fcff1f5cf999e5ae224aab722be07fe354e[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun Sep 24 10:56:07 2023 -0400

    [mcts] PR comments

[33mcommit 9eaded8b997fcfd7c876698e7cedb5bdbf8c9c3b[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat Sep 23 17:12:13 2023 -0400

    [design-enhancements] PR comments + fix setInteractivity in online game

[33mcommit 3ca404a11685f209ce336d454c915c884ca6d4f9[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat Sep 23 12:20:46 2023 -0400

    [mcts] PR comments

[33mcommit 4c48abd4bd32b85e3ac88131efb7855dda6689f8[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri Sep 22 09:41:25 2023 -0400

    [design-enhancement] Fix interactivity when not selecting the AI level

[33mcommit 039cf34ae96ed41ef42cace78b2c7dfb592ab00b[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Thu Sep 21 08:35:49 2023 -0400

    [mcts] Remove fit

[33mcommit e706df11f998f1e96e5e67a1a033b66e834c753c[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed Sep 20 03:16:18 2023 -0400

    [design-enhancements] Fix tests

[33mcommit 2d7a0bb3e845ed09850c1ab4d5a03098d9bf888d[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed Sep 20 02:40:01 2023 -0400

    [design-enhancements] PR comments

[33mcommit cd32d580945a764e1b355dd05a7a35a56d6e65ec[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed Sep 20 02:15:39 2023 -0400

    [mcts] Fix missing coverage

[33mcommit fa16a9adfdefca986703ce1fff10318501afc088[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed Sep 20 01:46:25 2023 -0400

    [mcts] PR comments, rest

[33mcommit 97ee2ac7fd4a70b9ca49396d8279a5d03fbf133d[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed Sep 20 01:35:00 2023 -0400

    [mcts] PR comments

[33mcommit 6096d70a72c4983abe856d81349667c40f843976[m
Merge: 1180c660d 1b850895c
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat Sep 9 15:44:50 2023 -0400

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into design-enhancements

[33mcommit 1180c660d4f800763e62e616214c020580f2c99d[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat Sep 9 15:39:19 2023 -0400

    [design-enhancements] PR comments

[33mcommit b34fff17cbee92ef1d09e43de36ba669633dd99a[m
Merge: cfbf11ef5 1b850895c
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat Sep 9 13:58:33 2023 -0400

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into mcts

[33mcommit 1b850895c83deb26367b1ab12125a5761084154e[m
Merge: 3c2bbe772 9443b6a68
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Sep 7 15:09:16 2023 -0400

    New game: Kalah
    
    Kalah

[33mcommit 9443b6a686e291f31e53f32982b41da2ad736895[m[33m ([m[1;31morigin/kalah[m[33m)[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Sep 7 20:55:26 2023 +0200

    [kalah] update release date

[33mcommit d54c01c544f1584ab830031489fe62fa069d27cd[m
Merge: 91c6f6c17 3c2bbe772
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Sep 7 20:38:27 2023 +0200

    [kalah] pulled develop and fixed conflict

[33mcommit cfbf11ef54192c4ae13ca854a78a35dcf67d1a6a[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Thu Sep 7 13:21:05 2023 -0400

    [mcts] PR comments

[33mcommit 6ce96ac98bf630ba82f146b96f4488e39899b75d[m
Merge: 660143a0c 3c2bbe772
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Thu Sep 7 12:59:33 2023 -0400

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into mcts

[33mcommit 3c2bbe772bba57ac91792702269327259e08988f[m
Merge: ca3aad0da 540378198
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Sep 7 12:35:29 2023 -0400

    Merge pull request #145 from EveryBoard/triangular-game-component-stroke-enhancement
    
    Triangular Game Component Stroke Enhancement

[33mcommit 91c6f6c1764c990c06ca70fd76363020697c4290[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Sep 7 18:33:10 2023 +0200

    [kalah] PR Comments about tutorial

[33mcommit 660143a0ced152917e17039f5cc3b8621e475178[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed Sep 6 02:16:20 2023 -0400

    [mcts] Fix linter

[33mcommit e03f0ebee7fdd660744433a25d623997259c0465[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue Sep 5 16:31:28 2023 -0400

    [mcts] PR comments

[33mcommit 540378198a6e914b7bf8e28f4390ec83ede4768a[m[33m ([m[1;31morigin/triangular-game-component-stroke-enhancement[m[33m)[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Sep 5 22:17:20 2023 +0200

    [triangular-game-component-stroke-enhancement] remove unused method

[33mcommit 7c73e45c12d995aba49dbee6a4c0e1b7960d8b79[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Sep 5 22:16:33 2023 +0200

    [kalah] fix tutorial

[33mcommit b15e9771749b77b31726977d8824cbd1061d9957[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue Sep 5 12:23:32 2023 -0400

    [design-enhancement] Introduce pointOfView + isInteractive in game components

[33mcommit bf981b3845dd59e1c868b7edc4e30d922f25e62b[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Sep 4 21:44:53 2023 +0200

    [triangular-game-component-stroke-enhancement] fix tests

[33mcommit 15c82ddf885dae5d422384ff78a03b720fdfc123[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Sep 4 21:40:06 2023 +0200

    [kalah] enhance french translations

[33mcommit 3f8d1ce796beba343cb8c83730a94a073e24e0c2[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Sep 4 21:14:20 2023 +0200

    [triangular-game-component-stroke-enhancement] test fix

[33mcommit 947cdbd0425db769f573d6a51b2440b188b01a75[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Sep 4 21:12:13 2023 +0200

    [kalah] Pull Request Comments

[33mcommit b734c4e7c5f5ee4dd4c3e5a6afb01ccd0579b0fc[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Mon Sep 4 14:06:12 2023 -0400

    [design-enhancements] Fix linter

[33mcommit fbbef06b7968303098d1c6e4aac447594bd1888d[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Sep 4 19:40:32 2023 +0200

    [triangular-game-component-stroke-enhancement] Pull Request Comments

[33mcommit 1148ae777780fb4e3122691877ad0d3ab96d2d55[m
Merge: 1d448d092 aad5d16ad
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Sep 3 18:06:28 2023 +0200

    [triangular-game-component-stroke-enhancement] fix git bad manip by pulling itself

[33mcommit 1d448d092a5b1b6c2d722b1f4007f111d61280e9[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Sep 3 17:59:55 2023 +0200

    [triangular-game-component-stroke-enhancement] pull request comments

[33mcommit 7f1e885bd42923ddfc8e50e6dc39857b4567fd80[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Sep 3 16:33:32 2023 +0200

    [kalah] PR Comments

[33mcommit 4b6729024edc15233e7d624225a39d9ae793cdae[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Thu Aug 31 02:47:39 2023 -0400

    [design-enhancements] PR comments

[33mcommit 76ef5bea9e3de15fe0ba1d026083b148d186f6c1[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed Aug 30 08:42:17 2023 -0400

    [mcts] Update translations

[33mcommit 4bec73c805e1eb14b01e2f206001155ee30040f4[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Mon Aug 28 08:31:53 2023 -0400

    [MCTS] PR comments

[33mcommit aad5d16ad5bf1d72f4f2140d9bc281d8b3d13158[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Aug 27 17:37:01 2023 +0200

    [triangular-game-component-stroke-enhancement] done

[33mcommit 0ab2aac93fb7533261348ef75d0a47ce0efa0a0d[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Aug 26 19:54:56 2023 +0200

    [triangular-game-component-stroke-enhancement] refactor calculation coordinate -> points/translate

[33mcommit c34d681a027b08f1b8fb7025e3f2085766ea6b0a[m
Merge: fe564fa0a ca3aad0da
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Aug 24 12:18:26 2023 +0200

    Merge branch 'develop' of https://github.com/EveryBoard/EveryBoard into kalah

[33mcommit fe564fa0a9a4152e1a5e620600f44abbebb845e9[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Aug 24 12:18:16 2023 +0200

    [kalah] pr comments

[33mcommit fa4628df3ab0653c5c45be472d439daef3a3c9ff[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Thu Aug 24 05:18:14 2023 -0400

    [design-enhancements] Full coverage

[33mcommit ee117eedf958e111ef2591c3ce6168e85851e453[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Thu Aug 24 03:26:26 2023 -0400

    [design-enhancements] Improve Lasca coordinates

[33mcommit 7ca3b97dce8e9672c56353c13aff6221b1cb3937[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Thu Aug 24 02:05:43 2023 -0400

    [design-enhancements] Tafl: remove highlights on non player pieces

[33mcommit 8e7a11e59d82a102a99efafe8db82507ca2b622d[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Thu Aug 24 02:00:49 2023 -0400

    [design-enhancements] Epaminondas: don't highliht non-player pieces

[33mcommit 777b75e9c854f2356820a59425a3edeaf50ef840[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Thu Aug 24 01:59:24 2023 -0400

    [design-enhancements] Quarto: don't show piece in hand when it is empty

[33mcommit 26239e2873326ef36f5171196ddacf2be0f014a7[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed Aug 23 15:53:43 2023 -0400

    [design-enhancements] Siam: player piece reserve should be on bottom

[33mcommit d49e541a62793607a24168d68bcd0b21fb2d56a9[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed Aug 23 09:03:21 2023 -0400

    [mcts] PR comments

[33mcommit 97ba5c323901ef7a496b255b176e4c64575ae92b[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Aug 19 23:25:52 2023 +0200

    [kalah] Pull Request Comments

[33mcommit 550d081a781946fe2b41afef6da27c3f92d70bd7[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue Aug 15 17:38:41 2023 -0400

    [mcts] Recover full coverage

[33mcommit 04217b81c736910afe31dcc8d7fb9c7eba286620[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue Aug 15 11:00:21 2023 -0400

    [mcts] Small fixes and more coverage

[33mcommit 96c236b7172e382a24e1a1d7661c6b6bed538e9f[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue Aug 15 10:44:29 2023 -0400

    [mcts] Fix tests, more coverage

[33mcommit b9b74cba466916846dc830a020515bc308be0339[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue Aug 15 09:54:31 2023 -0400

    [mcts] Heavily reduce max game length

[33mcommit 8b4f0b67037d324fa491d8e827c44a54b3cba4c1[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue Aug 15 09:43:50 2023 -0400

    [mcts] Change available timeouts

[33mcommit 3e6e96099f8e6e25d794e51b683571497d773740[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue Aug 15 09:01:22 2023 -0400

    [mcts] Display board value as a number in AI info

[33mcommit d8170cfd16dbed17cbda4e4893e96d12a849beb0[m
Merge: f4504aa57 ca3aad0da
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue Aug 15 08:51:13 2023 -0400

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into mcts

[33mcommit f4504aa57bb8f70975909d9a65e0f069ce1209ae[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue Aug 15 08:50:07 2023 -0400

    [mcts] Improve GameNode coverage and MCTS timing

[33mcommit c437b74bd7c877a9cac50d0b7d77e3e7edf19b62[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue Aug 15 07:27:39 2023 -0400

    [mcts] Fix unstable test

[33mcommit a900ea3dcbde60b0b741dd54e8a89e2d70ff0195[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue Aug 15 07:19:45 2023 -0400

    [mcts] Move some files

[33mcommit c8f30f6b8def4684b5a36b46bfc840f3fa471488[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Mon Aug 14 19:00:39 2023 -0400

    [mcts] linter

[33mcommit f0c75a93bc018740fd4244084987921a653c8781[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Mon Aug 14 16:36:05 2023 -0400

    [mcts] Move heuristic/move generator to their specific files for the rest of the games

[33mcommit f734f50bbf88c61ffdde22ed72f0ba14e5885575[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Aug 14 20:43:50 2023 +0200

    [kalah] Fix online bugs

[33mcommit 906e2510deb46db317675742519fefaa6839b252[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun Aug 13 19:00:00 2023 -0400

    [mcts] Move heuristics/move generators to specific files (for the first half of the games)

[33mcommit aa95f5a66c3740d91a48f08b72d417345f5ff648[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat Aug 12 20:22:05 2023 -0400

    [mcts] PR comments

[33mcommit ca3aad0da34350d73efcad5423c00a334a12f70c[m
Merge: 390752b5d 14051e541
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Aug 12 12:19:15 2023 -0400

    Merge pull request #141 from EveryBoard/update-08-2023
    
    Update dependencies (08/2023)

[33mcommit 992f4c7d52592f1f15a8e80ce30fb5c77c8e78b4[m
Merge: 5507a583e bf4608e6b
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat Aug 12 11:30:28 2023 -0400

    Merge branch 'kalah' of github.com:EveryBoard/EveryBoard into kalah

[33mcommit 5507a583e7c0be1ccbb77b7cce36964f18d66017[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat Aug 12 11:30:09 2023 -0400

    [kalah] Update images

[33mcommit bf4608e6b87fcbfdb823d804d1100ab079b3f6d2[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Aug 12 17:21:44 2023 +0200

    [kalah] remove xdescribe

[33mcommit 4e3f3b944eefee398fb6af6a262d7a22a61bcd36[m
Merge: 4b1c87c50 390752b5d
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Aug 12 11:53:12 2023 +0200

    [kalah] pulled develop and fixed conflict

[33mcommit 14051e541b27cd83e07ec4f81f9692a836964df7[m[33m ([m[1;31morigin/update-08-2023[m[33m)[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri Aug 11 20:24:03 2023 -0400

    [update] Fix linter

[33mcommit 7f3b2470c3d2a485a3c6da9c89bc8bb8ff0a36a1[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri Aug 11 19:37:43 2023 -0400

    [update] npm audit fix

[33mcommit 56a7aae8106e4aa60bcf50b105140d366941d041[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri Aug 11 19:25:39 2023 -0400

    [update] Remove unneeded dependencies

[33mcommit f421733a8f957528a7055a8a5d8c6f7183121fc4[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri Aug 11 16:23:16 2023 -0400

    [update] more updates

[33mcommit 4b1c87c50b6813ba03f8b98d521346f05514363a[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Aug 11 21:27:48 2023 +0200

    [kalah] pull develop; fixed conflict; PR Comments; TODOS

[33mcommit e25730acdcf24f498249be571e0211a7ead1349e[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Thu Aug 10 08:34:19 2023 -0400

    [update] Upgrade angular to v16

[33mcommit d5dab6496708f277be196b85fe83c8f7a841582f[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Thu Aug 10 08:15:31 2023 -0400

    [update] Update @angular/fire, @fortawesome/angular-fontawesome

[33mcommit 577fce2aace2a2719cba4697b10b6affd2b1e411[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Thu Aug 10 08:12:54 2023 -0400

    [update] Upgrade angular to v15

[33mcommit 79db14ffcb710a10d3900b69ece5255471f787ee[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Thu Aug 10 08:04:38 2023 -0400

    [update] Prepare for upgrading angular

[33mcommit 6d36b37c9e5fc1475d432734604747051f3b5cc0[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue Aug 8 08:20:59 2023 -0400

    [mcts] Add MCTS to every game

[33mcommit 3edf5d68adf161747f5868d5061ff93798038fcd[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Mon Aug 7 20:25:35 2023 -0400

    [mcts] Fix linter

[33mcommit 3d07093a83441d864ce4b2823bf5392f763a6621[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Mon Aug 7 18:22:50 2023 -0400

    [mcts] Add printDot tests

[33mcommit 003805fd9ae56bdb72634afe8c9c27a93a402ffa[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Mon Aug 7 08:15:14 2023 -0400

    [mcts] Six coverage

[33mcommit 5ac9852f981e37ac460d1a81584b0b7a4672d862[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun Aug 6 18:55:51 2023 -0400

    [mcts] Time-based MCTS + more coverage

[33mcommit e2c48164524b4d5bfc8af3f199166432646f5ea6[m
Merge: c77b38145 390752b5d
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun Aug 6 17:33:22 2023 -0400

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into mcts

[33mcommit c77b38145e7396af62ebd0a4575fb68653002689[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun Aug 6 13:12:40 2023 -0400

    [mcts] Improve coverage

[33mcommit 12106b1fe401c08474a507d1773a9d6a301702ac[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun Aug 6 11:40:51 2023 -0400

    [mcts] Fix MCTS test

[33mcommit 390752b5d31d666ef48e13e4ed66476d7f040931[m
Merge: 0f9a3dcdd 0a209a6a5
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Aug 6 10:30:55 2023 -0400

    Merge pull request #138 from EveryBoard/conspirateur_minimax_fix
    
    [conspirateur_minimax_fix] Fixed conspirateur; remove magic-value; enforce State.isOnBoard pattern

[33mcommit 0a209a6a5415771dd2ae11ee0cf37a3a82a1bd0f[m[33m ([m[1;31morigin/conspirateur_minimax_fix[m[33m)[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Aug 6 16:14:56 2023 +0200

    [conspirateur_minimax_fix] pull request comment

[33mcommit 57c54b1fa1e49f16700b2530691def203722b616[m
Merge: db11bfc0d 0f9a3dcdd
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun Aug 6 09:43:36 2023 -0400

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into mcts

[33mcommit db11bfc0d5d9b543af96298075bb9328374d16cc[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat Aug 5 18:17:37 2023 -0400

    [mcts] Restore MCTS tests

[33mcommit 0b106a3630b17625ed6fc85c9677217235ebb48b[m
Merge: d2abd3a76 0f9a3dcdd
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Aug 5 19:25:04 2023 +0200

    Merge branch 'develop' of https://github.com/EveryBoard/EveryBoard into conspirateur_minimax_fix

[33mcommit 0f9a3dcdd5964b576f49d55c949ac709e047e52c[m[33m ([m[1;31morigin/six_minimax_fix[m[33m)[m
Merge: 36bc020a0 c162616e1
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sat Aug 5 19:23:20 2023 +0200

    Merge pull request #135 from EveryBoard/toast-improvements
    
    Toast improvements + refactor test utils

[33mcommit d2abd3a762b3afcaea3a8156a98ecd97f6197ddc[m
Merge: d90b39e73 36bc020a0
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Aug 5 19:19:48 2023 +0200

    [conspirateur_minimax_fix] Pull Develop and fixed conflict

[33mcommit d90b39e73799eef91046ff18d7741de81c53346c[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Aug 5 19:03:47 2023 +0200

    [conspirateur_minimax_fix] Pull Request Comment

[33mcommit c162616e1d2eb0e6aa56e06808cf2d4a2d54f516[m[33m ([m[1;31morigin/toast-improvements[m[33m)[m
Merge: bd1f3b03c 36bc020a0
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat Aug 5 09:56:18 2023 -0400

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into toast-improvements

[33mcommit 36bc020a00cb84b298cb56af0a8a4d8e3e4a45d8[m
Merge: 1dda0ba17 02947377a
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Aug 5 09:48:02 2023 -0400

    Merge pull request #139 from EveryBoard/coerceo_fix
    
    [bug] Coerceo Minimax Fix

[33mcommit 02947377a1fd497bc9a6236c7f52989c29a5d6c2[m[33m ([m[1;31morigin/coerceo_fix[m[33m)[m
Merge: 999c013ba 1dda0ba17
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Aug 5 15:36:13 2023 +0200

    Merge branch 'develop' of https://github.com/EveryBoard/EveryBoard into coerceo_fix

[33mcommit 1dda0ba17363a3863f83a797a4655612769da5ee[m
Merge: e72fe0bb0 b65f004d5
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sat Aug 5 15:33:30 2023 +0200

    Merge pull request #128 from EveryBoard/debug-flag
    
    Dynamically enableable debug flag

[33mcommit 999c013ba4fdd93933979efcc0b37b3a3db4c25d[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Aug 5 15:12:19 2023 +0200

    [coerceo_fix] fixed Coerceo minimax

[33mcommit 6d2b2516994556683f42ac6a79705c5353dd167c[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri Aug 4 20:21:23 2023 -0400

    [mcts] Add MCTS to Awale

[33mcommit af4e1cf3c42bf32769fded2d6939ae20ffb30f31[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri Aug 4 19:40:19 2023 -0400

    [mcts] Add P4 MCTS!

[33mcommit 0e13d21bd1146855763c68bf22da561c88ff28ce[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri Aug 4 18:24:29 2023 -0400

    [mcts] Fix tests

[33mcommit f00fade081a544694686747edb776de8574845c1[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri Aug 4 13:59:28 2023 -0400

    [mcts] Add option selection in local game component

[33mcommit 14174f8cf958a2c4180a32a22e10f74f7a9e288d[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri Aug 4 13:20:34 2023 -0400

    [mcts] Refactor SixMinimax

[33mcommit 7ad52b65a50872ab00b47200b7c47d05ddb8d991[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri Aug 4 09:58:36 2023 -0400

    [mcts] Restore compilation

[33mcommit bd1f3b03cc33650d0dcc388a751d3aa71c14df3b[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri Aug 4 09:22:13 2023 -0400

    [toast-improvements] PR comments

[33mcommit f72bfc321a6eef38f055af4c52bf2fabcbdb3772[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri Aug 4 09:05:48 2023 -0400

    [mcts] WIP, get rid of different BoardValues

[33mcommit ad9fe97858f82d8b31a22aeef34b0bc6dbe8287b[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Aug 3 21:00:50 2023 +0200

    [conspirateur_minimax_fix] Fixed conspirateur; remove magic-value; enforce State.isOnBoard pattern

[33mcommit 9e36802abac22973c511894365c468a5c23f2773[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed Aug 2 19:13:31 2023 -0400

    [mcts] finish first big refactor of minimax tests

[33mcommit d3a3c2843c9d86e571ea2051bda552891f643668[m
Merge: acad536c2 e72fe0bb0
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Aug 2 20:58:24 2023 +0200

    [kalah] Pulled develop and fix conflict, edition 73

[33mcommit acad536c20c531d21d7abb11dc76c04702abcdcd[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Aug 2 20:50:04 2023 +0200

    [kalah] Mainly Finished

[33mcommit b65f004d54e629548b613a8ec8ff672e97dc172c[m[33m ([m[1;31morigin/debug-flag[m[33m)[m
Merge: c1d975bde e72fe0bb0
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue Aug 1 20:45:58 2023 -0400

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into debug-flag

[33mcommit 7e01dc67a5f812c6522088e4114b1e423a119659[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue Aug 1 20:20:26 2023 -0400

    [toast-improvements] Fix linter

[33mcommit b21b0d8796e0f6edc4a54338846de0154fa504db[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue Aug 1 20:18:55 2023 -0400

    [toast-improvements] Force to catch toasts

[33mcommit 8262edf460b4e09aded912cce0b2b60f384a4f76[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue Aug 1 18:28:49 2023 -0400

    [toast-improvements] Get rid of almost all tick(1) in favor of tick(0)

[33mcommit 1b4647c87029e76e59ca010bef324827a43888e1[m
Merge: 5e4cf5ec1 e72fe0bb0
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue Aug 1 17:52:23 2023 -0400

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into toast-improvements

[33mcommit 8562d6f6475068b0dedfe6abfef8c31aee34b521[m
Merge: 831fe787a 604033a02
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Aug 1 21:40:20 2023 +0200

    [kalah] pulled kalah and fixed conflict

[33mcommit 831fe787a9ed20f1059706641a2ed2a5e468c6d8[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Aug 1 21:39:10 2023 +0200

    [kalah] Pulled develop and fixed conflict; removed todos

[33mcommit fa636f477ae9c7e0f03214f994c1c5042e4e8130[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue Aug 1 07:17:38 2023 -0400

    [mcts] Start refactoring tests

[33mcommit e792f9a9c68258af2f674708e69942e01f14ddf6[m
Merge: 762586deb e72fe0bb0
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun Jul 30 17:02:04 2023 -0400

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into mcts

[33mcommit 762586deb16dba66a47391d849bdbbe62e291346[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun Jul 30 16:44:22 2023 -0400

    [mcts] Restore build

[33mcommit 09741a684e38a7e3ca3a5c763d8228ecd0837948[m
Merge: ef25c2be6 e72fe0bb0
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sun Jul 30 21:11:56 2023 +0200

    Merge pull request #137 from EveryBoard/develop
    
    EveryBoard Master 12

[33mcommit e72fe0bb0ef0543bbb4d04b9510008ca3ad6713d[m
Merge: 7f9acf457 4b03ca11d
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jul 30 12:30:44 2023 -0400

    Merge pull request #134 from EveryBoard/teeko
    
    Teeko

[33mcommit 1a228af2b883985bf76a995b1c1bfbba3d844498[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun Jul 30 12:28:22 2023 -0400

    [mcts] More refactors

[33mcommit 604033a025ef0e57d4cced6fa3c7939ecf783b6c[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Jul 30 18:26:49 2023 +0200

    [kalah] enable animation during online game

[33mcommit 4b03ca11d6aaeacce27778cd12c788f0a691bb3c[m[33m ([m[1;31morigin/teeko[m[33m)[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Jul 30 18:21:03 2023 +0200

    [teeko] fixed coverage

[33mcommit 97361dc432b8f2b87843a325bba42fed7a6a9373[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Jul 30 17:55:38 2023 +0200

    [teeko] updated version number

[33mcommit 101ada34343a566d45690c4970d9388371fb95c7[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Jul 30 17:51:59 2023 +0200

    [teeko] fix test

[33mcommit 0307198e62f58e75fe80493cc0072d632a8c79d7[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Jul 30 17:45:14 2023 +0200

    wip

[33mcommit 3cbcf825d71a169d59f9d9ca9f61b2194ef5c96f[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Jul 30 17:27:20 2023 +0200

    [teeko] Fix translation

[33mcommit 62f93592d4530fc67b71e213104d3c9edff815fd[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Jul 30 17:07:00 2023 +0200

    [kalah] Pulled develop and fixed conflict

[33mcommit 08580476c2e0e7ed12c984a687b50086fe5fa2ce[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun Jul 30 11:05:42 2023 -0400

    [teeko] Add images and fix encoder

[33mcommit 5e0c5f0d97e56bd16201a5635fa082f6bd0001a1[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun Jul 30 10:58:00 2023 -0400

    [mcts] More progress in refactoring minimaxes

[33mcommit 8a9ae09e85439c5bda3c267652601ad25586b34c[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Jul 30 16:37:15 2023 +0200

    [teeko] Pull Request Comments

[33mcommit 6fe07633385a9d3c548cd64994f7601ab72350ed[m
Merge: 3706a558d 7f9acf457
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Jul 30 16:22:37 2023 +0200

    [kalah] Pull develop and fixed conflict AGAIN

[33mcommit aaafd9f76f1d0616ea779b5d1b7be9ecf6d04d47[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun Jul 30 09:52:20 2023 -0400

    [mcts] Progress on refactoring minimaxes

[33mcommit 985526b775289f626d27f5a613043bf2d9c89072[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Jul 30 15:47:13 2023 +0200

    [teeko] fix build

[33mcommit 3706a558d60a5bfc799642ce2b6b9e29824bd8ad[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Jul 30 15:39:10 2023 +0200

    [kalah] pulled develop and fixed conflict

[33mcommit 0351085bc591dea57be13bb010de076e39bdca3d[m
Merge: eeaf74b84 7f9acf457
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Jul 30 15:36:25 2023 +0200

    [teeko] pull develop and fixed conflict and fix linter

[33mcommit eeaf74b8423ddb2433b649f621558be269507a41[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Jul 30 15:29:57 2023 +0200

    [teeko] Pull Request Comments

[33mcommit 7f9acf457943121b7e28273b054e063e5cac7939[m
Merge: 0986307f8 c427e945c
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jul 29 12:39:19 2023 -0400

    Merge pull request #122 from EveryBoard/move-tuple-reuse
    
    [refactor] Move Encoders: Reuse tuple

[33mcommit 179c98360f57c62fb44755c48e7923d549756e95[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Jul 29 18:36:52 2023 +0200

    [kalah] add step in tutorial

[33mcommit c427e945ccc4a47a53d4b1006f25fe4bffe35f12[m[33m ([m[1;31morigin/move-tuple-reuse[m[33m)[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Jul 29 18:30:01 2023 +0200

    [move-tuple-reuse] removed console.log and fix test

[33mcommit 2f554917f30ec32ff21ae26532fde95b176943b6[m
Merge: 0816db187 0986307f8
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat Jul 29 12:23:50 2023 -0400

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into mcts

[33mcommit 0816db1873decca0ea28d1e8c89df48042f55f3b[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat Jul 29 09:06:46 2023 -0400

    [mcts] WIP

[33mcommit d648ad9d8596bceedc4d34933fb64a72a52516e0[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Jul 29 18:22:29 2023 +0200

    [teeko] small refactor; PR Comment

[33mcommit 19ca5f6570f88a8f18977bd6f833871503963e9f[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Jul 29 17:37:10 2023 +0200

    [move-tuple-reuse] pull develop and fixed conflict

[33mcommit 77b837b1e04b2c154e4520618c94a7be499e1f10[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Jul 29 16:54:47 2023 +0200

    wip

[33mcommit 143101d2bc7e35128b440e958144ed4a5e0e83ee[m
Merge: 83565fc09 0986307f8
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Jul 29 16:36:06 2023 +0200

    Merge branch 'develop' of https://github.com/EveryBoard/EveryBoard into teeko

[33mcommit dbc83c46ce801313e2253d1f56b373288f1963c6[m
Merge: 31cf72611 0986307f8
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Jul 29 16:34:31 2023 +0200

    [move-tuple-reuse] pulled develop and fixed conflicts; removed some lifecycle-misuse

[33mcommit 0986307f8f71dc547b58441cc8cbd7ded4e46b98[m
Merge: 4d232a320 6e2f770e0
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jul 29 09:54:32 2023 -0400

    Merge pull request #130 from EveryBoard/less-states
    
    TestUtils: remove 'state' parameter from expectMoveSuccess and expectMoveFailure

[33mcommit 31cf72611088d77a703f3b9fd66be978100ad152[m
Merge: 1dd760435 4d232a320
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Jul 29 15:44:28 2023 +0200

    [move-tuple-reuse] pulled develop and fixed conflicts

[33mcommit 83565fc098bd2f23d3baaa2a8ecda7fc470816bb[m
Merge: a6e42199e 4d232a320
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Jul 29 15:40:55 2023 +0200

    [teeko] pulled develop and remove todos

[33mcommit 6e2f770e0d1c0438aa4be960220c57acdfcaed77[m[33m ([m[1;31morigin/less-states[m[33m)[m
Merge: 1f036d957 4d232a320
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat Jul 29 09:40:52 2023 -0400

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into less-states

[33mcommit 4d232a320e37817c287fcb84680857223105b206[m
Merge: 01137e1cb 6f5a4dcf1
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sat Jul 29 15:36:05 2023 +0200

    Merge pull request #123 from EveryBoard/part-creation-bugfix
    
    Part creation bugfix

[33mcommit 1dd76043536025cf16434877453bea0b31d6bf74[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Jul 29 15:23:56 2023 +0200

    [move-tuple-reuse] pulled develop and fixed conflict

[33mcommit 1f036d9570a5f1965292737485cb4cab50d1507c[m
Merge: 19a18f7e8 01137e1cb
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat Jul 29 09:07:49 2023 -0400

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into less-states

[33mcommit 6f5a4dcf16420d61ae625c641e1295b8a4a7076f[m
Merge: 8da822afd 01137e1cb
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat Jul 29 09:07:05 2023 -0400

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into part-creation-bugfix

[33mcommit 01137e1cbe00f4d4a13a0fd2cabdb583dda7b3ec[m
Merge: 4993ce758 eef5a4289
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jul 29 09:06:04 2023 -0400

    Merge pull request #125 from EveryBoard/ConnectSixRefactor
    
    [refactor] Connect Six Refactor and mid-move take back fix

[33mcommit a6e42199e8fdbe564e3114431ac70d53ad20b3e2[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jul 28 21:04:35 2023 +0200

    [teeko] Pull Request Comment 2

[33mcommit 8215af5049c8702daf9af12b417db15b8b8245dc[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jul 28 21:02:42 2023 +0200

    [kalah] animation enhanced, bugs and todo removed

[33mcommit 9f00430f6e0fe00f8128ab23a91e1cfb4e787475[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri Jul 28 08:47:55 2023 -0400

    [mcts] Fix MCTS search starting at end game nodes

[33mcommit 0e28d715e58cfbc80b44cc4516e4c8dfa5600ab1[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Jul 27 20:44:38 2023 +0200

    [teeko] Pull Request Comments

[33mcommit 5020ed84cda25bd59150f09a75e3a8af17d1e561[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Jul 27 20:30:51 2023 +0200

    [kalah] put all component logics in common between kalah and awale

[33mcommit c1d975bdecf888e6b7085eedd4d33c80d1da4a03[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue Jul 25 21:40:18 2023 -0400

    [debug-flag] PR comments

[33mcommit 5e4cf5ec11395b8580c2a7ab30cb05b269566c72[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue Jul 25 21:07:02 2023 -0400

    [toast-improvements] Fix linter

[33mcommit d5a0267106a177914e04b085794da6458eebc0cc[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue Jul 25 20:58:48 2023 -0400

    [toast-improvements] Refactor click methods

[33mcommit 158fcc9e6c3fb2fc323e476c1c5a2ef7ba9c7bc7[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue Jul 25 20:34:10 2023 -0400

    [toast-improvements] Introduce TestUtils inheritance

[33mcommit 347b665b7d6daf56b7112a829222c5d7117c1288[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue Jul 25 20:23:28 2023 -0400

    [toast-improvements] Rename wrapper to component, add getWrapper()

[33mcommit 05f07321df0176ba8fb291ef8a02403076104f59[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue Jul 25 20:13:49 2023 -0400

    [toast-improvements] Remove unneeded constructor

[33mcommit fd076ac3feb53082ffc6148d1c1effc16d283d9d[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue Jul 25 19:57:06 2023 -0400

    [toast-improvements] Remove useless constructor argument

[33mcommit a9c2746f83c815d5350e1e455a43725d7b8982f7[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue Jul 25 19:52:18 2023 -0400

    [toast-improvements] Move stuff around to prepare for inheritance

[33mcommit 3b856acbd13649d0e8e03ef9a3ec925ffb91f777[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue Jul 25 19:27:53 2023 -0400

    [toast-improvements] Even more cleanup

[33mcommit 74b775a3a5c4560579e5f32f73424a987f0aade4[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue Jul 25 19:21:12 2023 -0400

    [toast-improvements] Moar cleanup

[33mcommit a5f7af6d8c00de885964dba1bae8713ca555bec6[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue Jul 25 08:06:08 2023 -0400

    [toast-improvements] Extract configureTestingModule

[33mcommit 3c2f4fcd8601292735511ae749e73badb82262e8[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Mon Jul 24 19:24:40 2023 -0400

    [toast-improvements] Rename getComponent to getGameComponent

[33mcommit 6abf370d0444ea15c8167a69b87704a59ff87dd4[m
Merge: b49694459 4993ce758
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Jul 20 19:00:34 2023 +0200

    Merge branch 'develop' of https://github.com/EveryBoard/EveryBoard into teeko

[33mcommit b496944592709004698483c3cb2d0a6fb45154e5[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Jul 20 18:34:35 2023 +0200

    [teeko] Add New Game: Teeko

[33mcommit 1bf3afff9412dc8ce64f0106e9eafb9b4f6b8cd4[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed Jul 19 07:43:37 2023 -0400

    [toast-improvements] Remove remaining tick(3000)

[33mcommit cac1fa19d268bb4193323f92b56eab16f50faf3e[m
Merge: 2429f0fbd 4993ce758
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue Jul 18 20:17:03 2023 -0400

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into toast-improvements

[33mcommit 76b3c8c850f1ef5814ee0a460ccd34bd2f47e687[m
Merge: c9dab3976 4993ce758
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue Jul 18 19:15:18 2023 -0400

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into mcts

[33mcommit 8da822afd467788df8db24d59af4726336989e12[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue Jul 18 19:09:54 2023 -0400

    [part-creation-bugfix] PR comment

[33mcommit 19a18f7e8ebfb74a8c325394b23efb57212cefb6[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue Jul 18 19:06:36 2023 -0400

    [less-states] PR comment

[33mcommit 4993ce75882536c14aeeb3929ea3d06dc3c1b2d5[m
Merge: 3290e9dc8 923f65aef
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Tue Jul 18 18:30:24 2023 +0200

    Merge pull request #131 from EveryBoard/use-hexa-neighbors
    
    Refactor: use HexagonalUtils.getNeighbors where possible

[33mcommit 3290e9dc878bedc3d64e73129b4b0b710d16fa64[m
Merge: 0493ecb6a 125950f73
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Tue Jul 18 18:28:49 2023 +0200

    Merge pull request #132 from EveryBoard/gcd
    
    Refactor: Move GCD computation out of Vector

[33mcommit c070a6d47d5c67d29cb6c4d6edd8340a4bfe2153[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue Jul 18 08:28:56 2023 -0400

    [debug-flag] Restore coverage

[33mcommit d409bc68d5a3f70f77ba458ade38fd56e4812efc[m
Merge: 7ce5690c4 0493ecb6a
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Mon Jul 17 20:28:04 2023 -0400

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into debug-flag

[33mcommit 7ce5690c4de3ef716dbf1aed47bef1fcec323e34[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Mon Jul 17 20:19:18 2023 -0400

    [debug-flag] Store the debug info in localStorage to preserve it across sessions

[33mcommit 023c0d1a9c757249f297df12fc3f27c1a38114a7[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Mon Jul 17 18:41:14 2023 -0400

    [part-creation-bugfix] PR comments

[33mcommit 923f65aef5cd0feefa791049ad8ccbaedabb28dc[m[33m ([m[1;31morigin/use-hexa-neighbors[m[33m)[m
Merge: e42ddfb87 0493ecb6a
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Mon Jul 17 18:19:32 2023 -0400

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into use-hexa-neighbors

[33mcommit e42ddfb87301688d0f4e663ecc1db61c40dff1a4[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Mon Jul 17 18:17:35 2023 -0400

    [use-hexa-neighbors] Fix linter

[33mcommit 125950f735bb8bcd30d721dbb4629aa15ffd12ad[m[33m ([m[1;31morigin/gcd[m[33m)[m
Merge: a588d3503 0493ecb6a
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Mon Jul 17 18:14:40 2023 -0400

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into gcd

[33mcommit a588d350312fa90b1f8b865300af42d280a6229a[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Mon Jul 17 18:14:31 2023 -0400

    [gcd] PR comments

[33mcommit 7c8f5c3371dbe314f3c41478fcfff0b638bb831a[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Mon Jul 17 08:13:18 2023 -0400

    [less-states] Fix tests

[33mcommit 4a3a96b8cc23234ccdeafd1cc665dbcfe53cdf07[m
Merge: bc085e668 0493ecb6a
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Mon Jul 17 08:09:36 2023 -0400

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into less-states

[33mcommit bc085e668862f18b55dc887209690f9161fff873[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Mon Jul 17 08:07:53 2023 -0400

    [less-states] PR comments

[33mcommit 51c337517ab5ef6eff15a7c8009b9000cc3bc2ff[m
Merge: 0457c791c 0493ecb6a
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Jul 16 19:40:08 2023 +0200

    [move-tuple-reuse] Pulled develop and fixed conflict; PR Comments

[33mcommit f497645556051a4738cbe4974e2bf1c5c7d95e3f[m
Merge: c483a5ecd 0493ecb6a
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun Jul 16 13:16:40 2023 -0400

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into part-creation-bugfix

[33mcommit eef5a4289cf8c03d076a6e31010b1ac9dfaa79d7[m[33m ([m[1;31morigin/ConnectSixRefactor[m[33m)[m
Merge: 90dc93c6e 0493ecb6a
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Jul 16 19:13:36 2023 +0200

    Merge branch 'develop' of https://github.com/EveryBoard/EveryBoard into ConnectSixRefactor

[33mcommit 90dc93c6e8472ff5761cc294433b4a4f25c4fca6[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Jul 16 19:13:31 2023 +0200

    [ConnectSixRefactor] PR Comment Wave 42

[33mcommit 6b0f46bf36ccddb7a04fe3aa86593d0cc8a1f9fd[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Jul 16 18:57:01 2023 +0200

    [kalah] modify mancala views to show score

[33mcommit 0493ecb6a1d99183bb1479c0753a19a47cad7f47[m
Merge: a882ac213 26c6430bb
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sun Jul 16 18:52:33 2023 +0200

    Merge pull request #124 from EveryBoard/stricter-json-typing
    
    [stricter-json-typing] use type instead of interface for better typing of JSON objects

[33mcommit 26c6430bbcf536fed7eb7957a042d31a0bf91342[m[33m ([m[1;31morigin/stricter-json-typing[m[33m)[m
Merge: 007e23f1c a882ac213
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun Jul 16 12:36:09 2023 -0400

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into stricter-json-typing

[33mcommit a882ac2133356e13902534d35254fe71eb07ec31[m
Merge: a82512a24 0516fdb5c
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sun Jul 16 18:25:10 2023 +0200

    Merge pull request #129 from EveryBoard/no-click-endgame
    
    Disallow clicks at the end of a game

[33mcommit 0516fdb5ca5649fa05898e6552fc3fe858678485[m
Merge: 230b1b350 a82512a24
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun Jul 16 12:04:06 2023 -0400

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into no-click-endgame

[33mcommit 2429f0fbd0e9248ff6d479273c2482b4e30763b1[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun Jul 16 11:55:47 2023 -0400

    WIP

[33mcommit a82512a240f01165f4caceb44064efb7017fa8db[m
Merge: 3b9e6811c 0217bd935
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sun Jul 16 17:55:03 2023 +0200

    Merge pull request #120 from EveryBoard/ogwc-view
    
    Improve request/reply UX in online games

[33mcommit 9ff66d38238fb9d1ec2512bad27f1529b76aa8f2[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat Jul 15 16:52:23 2023 -0400

    [toast-improvements] Toast time proportional to message length

[33mcommit f96b8a74e09ae5eea139c4d5ab3ac3ae7dcd8087[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Jul 15 12:35:30 2023 +0200

    [ConnectSixRefactor] Pull Request Comments

[33mcommit 60d6f2629e4027eabb6e59705dcb1d24b078d442[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Jul 15 12:09:22 2023 +0200

    [kalah] animated awale, kalah to be enhanced

[33mcommit 62150dd1f4ae88d7a8352e3b75ce5a78e06a55e9[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed Jul 12 08:02:55 2023 -0400

    [gcd] Move GCD computation out of Vector

[33mcommit c483a5ecd4418d0c1f769815a97c161fa86accc4[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue Jul 11 08:05:47 2023 -0400

    [part-creation-bugfix] Rename ObservedPart to CurrentGame

[33mcommit fdab58b8b8024a50e1684c1a48c0bd55dabdcef7[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Jul 6 20:39:35 2023 +0200

    [ConnectSixRefactor] Pull Request Comments

[33mcommit acf946040a15a9b273cea353ca607ef819fefb0e[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Thu Jul 6 08:26:25 2023 -0400

    [use-hexa-neighbors] Refactor: use HexagonalUtils.getNeighbors where possible

[33mcommit 230b1b350766b5f0976d6543a909dccc87ad70c0[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed Jul 5 07:10:32 2023 -0400

    [no-click-endgame] PR comment

[33mcommit 280ad2f41668c7a847c628013817e7120e38f484[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Jul 3 20:04:19 2023 +0200

    [ConnectSixRefactor] PR Comments

[33mcommit 0457c791cd7507a62460acd684472b170580b58b[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Jul 3 19:48:36 2023 +0200

    [move-tuple-reuse] Pull Request Comment

[33mcommit 52e1703ecce80ed601cc6fb673353fd6a150a85a[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Mon Jul 3 06:48:10 2023 -0400

    [less-states] Fix linter

[33mcommit 31353cf44a0594f88a1e2518974edd8c4481751e[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Mon Jul 3 06:44:35 2023 -0400

    [less-states] Add missing coverage

[33mcommit f8f852a1b92abb93bf97588c4f8d79051a1a6c33[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat Jul 1 21:15:29 2023 -0400

    [less-states] Remove scores from TestUtils

[33mcommit 2280c9fd0a2770860820dab7164a4d488079134b[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat Jul 1 10:13:24 2023 -0400

    [less-states] Remove states from where we already know them

[33mcommit b92d97341ce9d78bfcef8e905e06f282518e9086[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed Jun 28 08:01:40 2023 -0400

    [debug-flag] Fix tests and linters

[33mcommit be68be8ec17bcaa179268d864d3d3373c9dc7384[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed Jun 28 07:42:16 2023 -0400

    [debug-flag] Fix compilation

[33mcommit bc168d741b95a8d0ab08bdc0b164b8522ee1278a[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Jun 27 20:17:54 2023 +0200

    [move-tuple-reuse] PR Comments

[33mcommit 65baf25b98617e321d6d1b2b61103a14f45386fb[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue Jun 27 07:33:35 2023 -0400

    [debug-flag] Remove VERBOSE variables

[33mcommit 8a1e6573053b2fe2b5dd72b446ecec8947b13abc[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Mon Jun 26 20:42:23 2023 -0400

    [debug-flag] Propagate everywhere, remove display

[33mcommit 03f084863fa6a1af6f49d82e79806c7045c6d055[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Jun 26 21:49:58 2023 +0200

    [kalah] making test async to allow healthy animation handling

[33mcommit e069df7d099fc8ead27a6b79f5b4d8acdbfcd3a0[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Mon Jun 26 07:52:59 2023 -0400

    [debug-flag] Add support for logging classes with private constructor

[33mcommit 88aea1870adf1d2ae133a8e410979ad72ab43ef5[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun Jun 25 11:58:47 2023 -0400

    [no-click-endgame] Disallow clicks at the end of a game

[33mcommit eb870472dcd88e2f328162d582a7df41d8f1925f[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat Jun 24 16:20:56 2023 -0400

    [part-creation-bugfix] PR comment

[33mcommit d5bd2b8c0a6d96f5a4b79f48463687fcde51754d[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Thu Jun 22 08:51:07 2023 -0400

    [debug-flag] Add ability to programmatically enable debug mode

[33mcommit 3ddab687740f6cf8e938c47d8195025155469d45[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Jun 21 20:51:12 2023 +0200

    [ConnectSixRefactor] PR Comments

[33mcommit eda67edbfd174b826c2a64aad2fff8cb8e1498e6[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Jun 21 20:42:27 2023 +0200

    [move-tuple-reuse] PR Comments

[33mcommit f42a5c11d16ad497d6f43010b972b81ba5465d8b[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed Jun 21 07:35:55 2023 -0400

    [debug-flag] Improve Utils.display

[33mcommit 007e23f1c1470e556ecd52c098445de26253f100[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed Jun 21 07:30:56 2023 -0400

    [stricter-json-typing] PR comments

[33mcommit 53c79cb61ccf62204d2a5144570905298068331e[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun Jun 18 17:13:22 2023 -0400

    [debug-flag] Fix type of display

[33mcommit dd5beb8c1d270c466b5db9d1deb771eae5270302[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun Jun 18 16:49:39 2023 -0400

    [debug-flag] Initial design for dynamically enabled debug mode

[33mcommit ee7f382fe7cd3e885238b862d99305cbcfc715c8[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Jun 18 17:27:19 2023 +0200

    [ConnectSixRefactor] PR Comments

[33mcommit 551540540cd5db283dfcb6540dc3f82fb971bf1d[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Jun 18 17:16:46 2023 +0200

    [move-tuple-reuse] PR Comments

[33mcommit 6a54bd83598e06f5b1d072e356003b4c4e261986[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Jun 18 15:54:01 2023 +0200

    [kalah] mancala rules centralised; main functionnality working; work in progress

[33mcommit fb88af11126a86efb67da597227e5cec9eff55f7[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri Jun 16 08:13:06 2023 -0400

    [stricter-json-typing] Remove fdescribe

[33mcommit 710ba7a17184605994dbc66c3f5c3ce65d5fec9e[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri Jun 16 07:52:40 2023 -0400

    [stricter-json-typing] Restore firestoreTime pipe test

[33mcommit 87f45a10c2a030ab058918e03092a4a25103da76[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri Jun 16 06:27:26 2023 -0400

    [part-creation-bugix] Remove useless tick

[33mcommit a253036c9b41e36d8709c112046996296131e366[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri Jun 16 06:26:45 2023 -0400

    [part-creation-bugfix] Remove useless tick

[33mcommit f366e864f1d30fe8d6479d0d4da9b83ba0e0c7c8[m
Merge: 89bb54294 3b9e6811c
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Thu Jun 15 23:03:44 2023 -0400

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into part-creation-bugfix

[33mcommit 89bb54294b666bd6d3076890b39fbd90f7c4f9eb[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Thu Jun 15 23:03:01 2023 -0400

    [part-creation-bugfix] Properly fix exclusive guard

[33mcommit 3b9e6811cabab2c12764bcf497939782c900e4f2[m
Merge: eee30b4eb 3bfdd7c04
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Jun 14 21:26:56 2023 -0400

    Merge pull request #126 from EveryBoard/abalone_and_apagos_enhancement
    
    Abalone And Apagos Test Enhancements

[33mcommit 6a7800eca8731c71e3f1d0eb0426c6ff8f2592bc[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Jun 11 13:34:17 2023 +0200

    [move-tuple-reuse] clean of()/from.get() usages

[33mcommit b4ac15f90894b105092e06660981ee8c0dc9a9b2[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Jun 11 10:44:31 2023 +0200

    [move-tuple-reuse] revert changes on Lodestone

[33mcommit d625888bc629536577c2b3782d6720375f41fff5[m
Merge: 5c4d1bad6 05a6c4f0d
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Jun 11 09:28:39 2023 +0200

    Merge branch 'move-tuple-reuse' of https://github.com/EveryBoard/EveryBoard into move-tuple-reuse

[33mcommit 5c4d1bad61a91d33b969f9a334d4edb924121ff9[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Jun 10 18:55:33 2023 +0200

    [move-tuple-reuse] refactor and reuse encoder.disjunction

[33mcommit 3bfdd7c04ba4a9c2345030e069d86d3398bcfc82[m[33m ([m[1;31morigin/abalone_and_apagos_enhancement[m[33m)[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Jun 10 14:43:35 2023 +0200

    [abalone_and_apagos_enhancement] PR Comments

[33mcommit bea1663d403b06a24ff4750de983d82e6f4c422c[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jun 9 19:10:26 2023 +0200

    [abalone_and_apagos_enhancement] PR Comment

[33mcommit abfef043ae8f4659130faad3c904145e680b46c5[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jun 9 19:05:03 2023 +0200

    [ConnectSixRefactor] fix connect six test

[33mcommit 20c718bf100d9a8cdcb4411e823fd44166447992[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jun 9 18:48:07 2023 +0200

    [ConnectSixRefactor] PR Comment and fix Tafls

[33mcommit 05a6c4f0d3bbf61f54b0f944d2029e66ab56b7c2[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jun 9 18:01:21 2023 +0200

    [move-tuple-reuse] Refactor disjunctions encoder methods

[33mcommit 4ec9d6c0e1686624175bd161e1c1464c0d2c0bfd[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Jun 5 21:48:28 2023 +0200

    [abalone_and_apagos_enhancement] add abalone changes

[33mcommit e4088c0609b5961c076ed2008d721e33c4517ae5[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Jun 5 20:48:05 2023 +0200

    [abalone-and-apagos-enhancement] sprintly enhancement of game components tests

[33mcommit a615b24e653e55fbd23c26b87d76fd9c26e463ed[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Jun 4 14:32:25 2023 +0200

    [ConnectSixRefactor] remove ai display

[33mcommit c62cbfab3ba3ec7038c5a232ec3f022ccbd30742[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Jun 4 14:29:51 2023 +0200

    [ConnectSixRefactor] add cancelMoveAttempt test for ogwc too

[33mcommit a93d5acc916821d0009f29d5928cb0b042e8721f[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Jun 4 14:17:37 2023 +0200

    [ConnectSixRefactor]created a slow and bad minimax; fixed issues; fixed take backs in mid moves for local games

[33mcommit 955476adae60bdf57f1ed12120c22e79f3198820[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Jun 1 21:42:02 2023 +0200

    [move-tuple-reuse] Generalise getListEncoder

[33mcommit ce018d7b2ddce13d07cc8ad43a033669443ddef9[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Jun 1 21:18:15 2023 +0200

    [move-tuple-reuse] remove abstract encoder

[33mcommit 94b5e40d7e591026a0d08b83c7ed974471cadd28[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Thu Jun 1 07:40:06 2023 -0400

    [stricter-json-typing] Fix translations and test typo

[33mcommit 85796a2624f3c5accd0ffd8826c0c7190f988488[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed May 31 07:53:01 2023 -0400

    [stricter-json-typing] Cover chat tab in lobby

[33mcommit 0ca9c26a3e924c74ba5baee87fd2676e524c486b[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed May 31 07:46:24 2023 -0400

    [stricter-json-typing] Remove ActiveUsersService, add new security tests

[33mcommit 0217bd93533f8518f9f06bd0b2a1dd103702dd23[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed May 31 07:17:57 2023 -0400

    [ogwc-view] Use Utils.assert in OGWC

[33mcommit e8650634b432dc95ab57e59b4c28583fb7a082b0[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed May 31 07:16:15 2023 -0400

    [ogwc-view] Fix coverage

[33mcommit a71cd785747b3f401e12b6592ae31e7b2efb85ac[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue May 30 07:37:43 2023 -0400

    [part-creation-bug] Fix user mocks with time and fix getServerTime test

[33mcommit 664b7c506fab4892dac58f51fee3b04df12ecc0d[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue May 30 07:24:33 2023 -0400

    [ogwc-view] Fix build

[33mcommit 8494a822ad933029f0a0383e3312d9c3e1fd4d2f[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue May 30 07:13:12 2023 -0400

    [ogwc-view] PR comment

[33mcommit 868bd17510ab15d2485efbd7c5f5e8a4013994f4[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue May 30 07:07:10 2023 -0400

    [part-creation-bugfix] Fix build

[33mcommit 35520b38bdf990c52020c72133c89356d8f9a47e[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Mon May 29 20:23:39 2023 -0400

    [part-creation-bugfix] Something strange happened to translations, fixed

[33mcommit b96f80848dfa4bcd2babf5e0b6e025ae5bba51f4[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Mon May 29 20:21:35 2023 -0400

    [part-creation-bugfix] PR comments

[33mcommit ef857c2cc247609373c7c52028f9d16f3c69e83c[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Mon May 29 20:11:21 2023 -0400

    [part-creation-bugfix] Fix tests, cover everything

[33mcommit e4558f4c42431f9efcf2a1f3d543dc503865d555[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Mon May 29 07:44:26 2023 -0400

    [part-creation-bugfix] Rename FocusedPart to ObservedPart

[33mcommit 6f2b2a004a8c85fe21f17147558367cab4ca939d[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Mon May 29 07:30:07 2023 -0400

    [part-creation-bugfix] Fix bugs and tests

[33mcommit 6a766fe7782545aa3dcc89d610e577bc9e56a574[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun May 28 16:47:38 2023 -0400

    [part-creation-bug] Fix logout part-creation bug

[33mcommit 2c71a4c0a0014c057a4af4d7d7b3315cb293ef5e[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun May 28 21:22:31 2023 +0200

    [move-tuple-reuse] Fixed linter and coverage

[33mcommit 03426fb0573d996f9abc432a6059bb53221057d5[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun May 28 18:51:48 2023 +0200

    [move-tuple-reuse] Fix all test

[33mcommit d6e1a87008e60e0de5a3717f1e59ea9b249b26de[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 27 17:58:18 2023 -0400

    [stricter-json-typing] use type instead of interface for better typing of JSON objects

[33mcommit 991cebd739e3a46260dbb32d71b7fd1de1c4f541[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat May 27 18:32:56 2023 +0200

    [move-tuple-reuse] uniformised of/from and reused tuple; work in progress

[33mcommit a5e8ae6880bbfb4d90a3ad1d82f1c2f486f4ed98[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 27 12:02:51 2023 -0400

    [ogwc-view] Translations

[33mcommit b56dd74ff319fe4fc1cdad02634e8ae58319fc93[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 27 11:53:32 2023 -0400

    [ogwc-view] Fix linter

[33mcommit 4ad21c7edbf89e351cbc5d2c352a2d20125c7676[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 27 11:31:43 2023 -0400

    [ogwc-view] Fix tests

[33mcommit bc2df3752e8750a794a73d23e6dcb5d6bd2c242b[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 27 09:59:11 2023 -0400

    [ogwc-view] Show when requests have been sent

[33mcommit 4e5c6d0528995c729f4026531764138dd292f65d[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 27 09:50:26 2023 -0400

    [ogwc-view] Disable buttons instead of hiding them

[33mcommit 12077281778454fee9e51285bb6506acb049839d[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri May 26 21:19:07 2023 -0400

    [ogwc-view] PR comments

[33mcommit e2ffe95b2d97a06772ef4e3104ac354e5f2d6a06[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri May 26 20:24:33 2023 -0400

    [part-creation-bug] Not everything is fixed

[33mcommit 97f6be94de267efeb5518ee27765be21dc3c3a58[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri May 26 19:22:58 2023 -0400

    [part-creation-bugfix] Make all tests green

[33mcommit 78b94033dd2ba95526f533255a945e6a21ee815d[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri May 26 08:02:44 2023 -0400

    [move-tuple-reuse] Fix coerceo moves typing

[33mcommit 2e43b5ce44611a985642dad9374cefbc07ba8011[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Thu May 25 21:42:26 2023 -0400

    [part-creation-bugfix] WIP

[33mcommit a5019e502c04e1a4c010a686045d08ba406bba96[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu May 25 22:07:51 2023 +0200

    [move-tuple-reuse] Work In progress

[33mcommit c2169b8727d0fa6f68b3be76aecdd3814b17d072[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Thu May 25 08:04:24 2023 -0400

    [part-creation-bugfix] ObservedPart bugs seem entirely fixed

[33mcommit 4cf3c9fee03d0de06aa35a4de3122b84f37fbaf4[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed May 24 18:32:15 2023 -0400

    [part-creation-bugfix] Fix the bug, hopefully entirely

[33mcommit 80390be232f5f7a49a1a6cb18d98ef4132dfa195[m
Merge: f331f709f eee30b4eb
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed May 24 07:47:27 2023 -0400

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into ogwc-view

[33mcommit f331f709f8aa4da7e273df25bae400f194ddf54d[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed May 24 07:47:11 2023 -0400

    [ogwc-view] Full coverage

[33mcommit ef25c2be626c3466e42d71ae655cac3a877b66d2[m
Merge: b8f1ee96b eee30b4eb
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed May 24 07:16:00 2023 -0400

    Merge pull request #121 from EveryBoard/develop
    
    EveryBoard Master 11

[33mcommit eee30b4eb0061c4390a963aac4cc92a019fdda5f[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed May 24 07:04:27 2023 -0400

    Update index.html

[33mcommit 529003344c1ad5231e8cb907a31c273c0f8fd944[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed May 24 07:03:09 2023 -0400

    Update coverage

[33mcommit ceec56483f0458358536597f29cdc206b0079952[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed May 24 06:33:44 2023 -0400

    [ogwc-view] Test wanted features

[33mcommit 8af857e52b49d1442439b4578f7eef5ad73f329e[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue May 23 11:38:17 2023 -0400

    [ogwc-view] Minor fix

[33mcommit 09c16c0a8ce740fd85d11081cd3438149f5d921f[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue May 23 11:37:53 2023 -0400

    [ogwc-view] Add icons, improve overall UX

[33mcommit a0f4585462df3a00b4296fd11ebe10c184685d9c[m
Merge: 348a89390 f90f1b424
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue May 23 07:41:07 2023 -0400

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into ogwc-view

[33mcommit 348a8939045e15a100e647a79b301726c1628d91[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue May 23 07:36:52 2023 -0400

    [ogwc-view] First try to improve OGWC view

[33mcommit f90f1b424b75b371bc80144bd392461b16381910[m
Merge: 22f394d1c 6ecbdbd36
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon May 22 20:44:52 2023 -0400

    Merge pull request #119 from EveryBoard/rules-singletonification-and-nodelessification
    
    Rules Singletonification And Nodelessification

[33mcommit 6ecbdbd36d1d4fe45e7fa826591f5f914ae1d434[m[33m ([m[1;31morigin/rules-singletonification-and-nodelessification[m[33m)[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue May 23 02:24:59 2023 +0200

    [rules-singletonification-and-nodelessification] Pull Request Comment Wave 2

[33mcommit fcbe9f7eec0b94d31159470b4eb0f987cc61ce09[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue May 23 02:18:31 2023 +0200

    [rules-singletonification-and-nodelessification] fixed tests

[33mcommit e72a26ee7dbb4f513bd5d720fdd53f09ede73360[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue May 23 00:01:02 2023 +0200

    [rules-singletonification-and-nodelessification] Pull Request Comment

[33mcommit d08187108b00de4eb68e3bbbc4d703b2711f9156[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon May 22 21:10:17 2023 +0200

    [rules-singletonification-and-nodelessification] fixed pente and online games

[33mcommit c9dab39766fb411739dbdcb06fce6fd67f8b9b72[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun May 21 21:48:18 2023 -0400

    [mcts] Initial try

[33mcommit 837c512cd4909014a1824c63f27c123e8136b8da[m
Merge: a25175142 22f394d1c
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon May 22 14:12:27 2023 +0200

    [rules-singletonification-and-nodelessification] pulled develop and fixed conflict and npm ci

[33mcommit a25175142669d2581ecceb673a2b4484b8132072[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon May 22 04:24:46 2023 +0200

    [rules-singletonification-and-nodelessification] PR Comments wave 1

[33mcommit 22f394d1c30afb507b3afabfb3a1437bef04ce18[m
Merge: 19477e424 502fb7f1b
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Mon May 22 04:14:17 2023 +0200

    Merge pull request #88 from EveryBoard/move-collection

[33mcommit eeb835c1f3534fa05fe742946b7a41f93accd9b6[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon May 22 03:56:50 2023 +0200

    [rules-singletonification-and-nodelessification] fix pente that was from the very recent past

[33mcommit 502fb7f1b52c632050a69523b815aae86b84dbe3[m
Merge: 0d4bb48cc 19477e424
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun May 21 21:50:05 2023 -0400

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into move-collection

[33mcommit 0d4bb48cc689c475d3041f94e5f31d3a5d74dc47[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun May 21 21:49:36 2023 -0400

    [move-collection] Remove unneeded test

[33mcommit cdbfa1623ebefa8eba2d3cf69f0391cc09fe9017[m
Merge: fa7def0ba 0f7fcdbbc
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon May 22 03:38:17 2023 +0200

    [rules-singletonification-and-nodelessification] pulled develop and fixed conflict

[33mcommit fa7def0ba47f9507c98c6465686b4a935a5680fb[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon May 22 03:34:35 2023 +0200

    [rules-singletonification-and-nodelessification] Rules no longer own a node

[33mcommit 19477e424836c166f0f67a4525ef38fb470fac15[m
Merge: 0f7fcdbbc 63c9f83fb
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Mon May 22 03:33:10 2023 +0200

    Merge pull request #118 from EveryBoard/remove-tuto-previous-state

[33mcommit 63c9f83fb4809f4e4f52a2622204255de8e75c28[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun May 21 15:51:41 2023 -0400

    [remove-tuto-previous-state] Really fix linter

[33mcommit ce68d9b143f8e1ad4cd8e8a4cd1e20ab9383f461[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun May 21 13:01:40 2023 -0400

    [remove-tuto-previous-state] Fix linter

[33mcommit baa2e6c0d94dc47bc3f4d973bd782f01d7930d6e[m
Merge: 8635d6ec4 0f7fcdbbc
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun May 21 13:00:29 2023 -0400

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into remove-tuto-previous-state

[33mcommit affaa4c074ef21994be84b02dd400d09b2585dad[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun May 21 12:54:58 2023 -0400

    [move-collection] Refactor tests a bit more

[33mcommit 0f7fcdbbc697bbfc6b3158770f711a44e82441f6[m
Merge: 382615d38 246e4b34c
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sun May 21 18:49:23 2023 +0200

    Merge pull request #117 from EveryBoard/change-password

[33mcommit 382615d38e65e63685d5c31489b5290b2c18894b[m
Merge: 83c8e4e6a e10114884
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sun May 21 18:47:38 2023 +0200

    Merge pull request #116 from EveryBoard/dvonn-enhancement

[33mcommit 24d55487f960438c63be8e93356d2e6f277f9f72[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun May 21 12:38:15 2023 -0400

    [move-collection] Linter + comment

[33mcommit 246e4b34c33cbd0e95347bd8fcd9e6852fbdffdd[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun May 21 12:26:25 2023 -0400

    [change-password] Fix indentation

[33mcommit 8635d6ec45e58b2a597be2dbc54392c376c54fa6[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun May 21 12:25:25 2023 -0400

    [remove-tuto-previous-state] Fix coverage

[33mcommit e10114884678d981b8db6fdc92322e68c60ed16b[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun May 21 12:17:28 2023 -0400

    [dvonn-enhancement] PR comment

[33mcommit 2b324fd10d2d8dcea301e5d64ed625dccdf82a48[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun May 21 12:12:50 2023 -0400

    [move-collection] PR comments

[33mcommit 2c042501f7886a31561bcdbbd9a0633b8febe008[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun May 21 11:54:16 2023 -0400

    [change-password] Fix linter

[33mcommit 4ccd397c90d963a85fd49d7514fdaaf40733143b[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun May 21 11:52:24 2023 -0400

    [remove-tuto-previous-state] Remove withPreviousState and its only (useless) use

[33mcommit 2ac6f2642d7326c9df85f6c64b6183a86447fb91[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun May 21 11:48:09 2023 -0400

    [dvonn-enhancement] PR comments

[33mcommit acac8b4f809c1ef5fd844b03e7a44299cbc1e28c[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun May 21 11:29:45 2023 -0400

    [change-password] Fix tests, add translations

[33mcommit 14e19d971bf4bcb0870c5431f6f7e3d91935f22e[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun May 21 10:44:39 2023 -0400

    [move-collection] PR comments

[33mcommit 557452f56636fd0ac9352f1e3c53d097f8dbe68e[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun May 21 10:27:28 2023 -0400

    [change-password] Add account settings page with link to reset password

[33mcommit 6427647863be4fdcf8eb94d3664be0d30f337625[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 20 22:00:20 2023 -0400

    [dvonn-enhancement] Fix linter

[33mcommit 5a4e106ffa21a5874eee3730ed3c0f842e7b3c5f[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 20 21:50:18 2023 -0400

    [dvonn-enhancement] Improve piece selection, fix text size

[33mcommit 70477b31aafa6b530ff9b2fc56d13dfd0551709c[m
Merge: e179a834a 83c8e4e6a
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 20 20:37:02 2023 -0400

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into move-collection

[33mcommit e179a834a44be6155846759a6a34bab3e8ebf088[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 20 20:26:25 2023 -0400

    [move-collection] Fix compilation

[33mcommit 83c8e4e6a29cee8c8f2214c9dc1efe1c781c6624[m
Merge: 92d570847 921942e7a
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sun May 21 02:24:14 2023 +0200

    Merge pull request #106 from EveryBoard/NewGameHelper

[33mcommit 92d570847187ff7ab729acf7cd5614595c238505[m
Merge: 973318625 1cf861f9b
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sun May 21 02:22:04 2023 +0200

    Merge pull request #114 from EveryBoard/pente

[33mcommit 78140245861f5c068a6b1a1f65953677573bb227[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 20 20:19:05 2023 -0400

    [move-collection] hopefully fix current player name

[33mcommit 921942e7a5383f9544f7f51b2226af4d31261b40[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 20 20:03:24 2023 -0400

    [NewGameHelper] Fix typo

[33mcommit 1cf861f9bc4a231d0a2d2fee74141e0a850382b5[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 20 20:00:20 2023 -0400

    [pente] Uniformize applyLegalMove

[33mcommit ed6404e8d6ff9a5ca8b69da792f4aaa18284ca8f[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 20 19:49:45 2023 -0400

    [NewGameHelper] Fix coverage

[33mcommit 2d3b559ff80381bf118e810cbc9fdffedeb892fd[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 20 19:40:48 2023 -0400

    [NewGameHelper] PR comments

[33mcommit 97086775380e9a06ba430dee19685e14daaf033d[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 20 19:35:36 2023 -0400

    [move-collection] Improve e2e script

[33mcommit d92365652a717099a72c353993fda8317188d415[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 20 18:49:49 2023 -0400

    [move-collection] PR comments

[33mcommit b378f8dca7307a14139377f8d2ffa710ea3bbe62[m
Merge: 06992f867 973318625
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 20 17:49:02 2023 -0400

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into NewGameHelper

[33mcommit 06992f86727de7d6094eaa2d1ae4bc3b2791544a[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 20 17:48:43 2023 -0400

    [NewGameHelper] Fix linter

[33mcommit a881d9e20bc4b996db4991154f3841faeb6f07d7[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 20 17:45:36 2023 -0400

    [pente] Update translations

[33mcommit fb1b8ce299e16ec47a10b1ea87d3b06971d7adee[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 20 17:43:02 2023 -0400

    [pente] Fix linter

[33mcommit dc2f07839b9ab4b672973148a83ce0923bb07f1f[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 20 17:38:33 2023 -0400

    [pente] Add GobanGameComponent

[33mcommit 16b0710cc6fb306fbdb311e8fbcf4162f97badf5[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 20 17:05:04 2023 -0400

    [pente] Most PR comments

[33mcommit 66b05f5cb12f67f5c3ca79a10b3d10ab464b1dfd[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 20 15:23:15 2023 -0400

    [move-collection] Second part of PR comments

[33mcommit e10b26121a07b77b6f817eb73698e3221c69a03e[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 20 14:30:48 2023 -0400

    [move-collection] First part of PR comments

[33mcommit 9eede7d2dae8595df58134ddb1000b56ba3d85d4[m
Merge: a0f0403ef 973318625
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 20 13:17:26 2023 -0400

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into move-collection

[33mcommit 47aa9cda58919fd2295b07b06b11653008ee5747[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 20 12:44:05 2023 -0400

    [pente] Add minimax to component

[33mcommit 56292114d05a40a10182cfca51aed79845e76576[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 20 12:39:35 2023 -0400

    [NewGameHelper] Expand new game README

[33mcommit 7a0d872977c2eb51ce1b53c4deded695cf8aac5b[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 20 12:32:49 2023 -0400

    [NewGameHelper] Fully cover minimax

[33mcommit 985a18da0040c5292978f5923a243e475048d289[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 20 12:18:09 2023 -0400

    [pente] Update images

[33mcommit ab32e620619c7eb38f7058142cfb22eaba526cd7[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 20 12:14:00 2023 -0400

    [pente] Full coverage

[33mcommit 26ab35dad14831f502d1345368671647f39744d1[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 20 09:23:03 2023 -0400

    [pente] Add minimax

[33mcommit a41b7609cdb76e8454b1dfd0e98d00575def65d9[m
Merge: a3ebbfef8 973318625
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 20 08:52:05 2023 -0400

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into pente

[33mcommit a3ebbfef8a3de697b90e14cb371522d3471f67af[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 20 08:51:48 2023 -0400

    [pente] Translate

[33mcommit 54af68c0b1b6b43e6c94fe0817f1fcfc1e91a29a[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 20 08:23:01 2023 -0400

    [pente] Add tutorial

[33mcommit 973318625fe3a050a581e320b3c986ef3bb58fbb[m
Merge: 06beedf3e 920791cf7
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri May 19 22:40:30 2023 -0400

    Merge pull request #115 from EveryBoard/pylos-online-and-in-demo-card
    
    [pylos-online-and-in-demo-card] showLastMove lifecycle enhanced

[33mcommit 920791cf7300c48925a88883f742bff8ba77672f[m[33m ([m[1;31morigin/pylos-online-and-in-demo-card[m[33m)[m
Merge: b7fa91ad2 06beedf3e
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat May 20 04:40:18 2023 +0200

    Merge branch 'develop' of https://github.com/EveryBoard/EveryBoard into pylos-online-and-in-demo-card

[33mcommit b7fa91ad269ad6849e806dc3235feda5e301ed65[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat May 20 04:37:19 2023 +0200

    [pylos-online-and-in-demo-card] Pentago fixed

[33mcommit 610e69e20e2dabdee8391ac55bab45a141d930bc[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat May 20 04:28:54 2023 +0200

    [pylos-online-and-in-demo-card] fix tafls and loa

[33mcommit 06beedf3e27fbae68583f72768e1cf7d5cbf3814[m
Merge: 503ef7f6d c941132fc
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sat May 20 04:00:04 2023 +0200

    Merge pull request #113 from EveryBoard/refactor-minimaxes

[33mcommit 4e72a5345cd624201fdac0d3754c540add8663cc[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat May 20 03:51:30 2023 +0200

    [pylos-online-and-in-demo-card] remove fdescribe

[33mcommit c941132fc6d84d44909618613c78eb2d02ea1a40[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri May 19 21:44:07 2023 -0400

    [refactor-minimax] Fix imports

[33mcommit 702617f542c3a8ee93539a69d498db27e81d2f03[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat May 20 03:43:02 2023 +0200

    [pylos-online-and-in-demo-card] fix coverage

[33mcommit 1877da0b8f84ffa0b97747752af001e2fcff329a[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri May 19 21:33:07 2023 -0400

    [pente] Component is now playable

[33mcommit 0140247ee9818e971f76ef77149113f5451b97ce[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat May 20 02:19:20 2023 +0200

    [pylos-online-nad-in-demo-card] lifecycle enhancement; pull request comment

[33mcommit fc1ef410e5ee853c3f26daf34ab43fe07e3faf4c[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri May 19 19:08:19 2023 -0400

    [pente] component tests

[33mcommit 1e9aceea2b5ca7e38c6e20f8f3f29a2e6fa449b2[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri May 19 19:19:24 2023 -0400

    [refactor-minimaxes] Fix linter

[33mcommit c91d61bd06c0cae85d2b40e2dc36de5b587293c6[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri May 19 19:17:12 2023 -0400

    [refactor-minimaxes] PR comments

[33mcommit 3203eabddc899700630b29ce8eaedf197325ddb6[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat May 20 00:51:12 2023 +0200

    [pylos-online-and-in-demo-card] added override to new showLastMove methods

[33mcommit ba914141037e546817890f850b000088ff55d856[m
Merge: 0ea2d6644 503ef7f6d
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat May 20 00:44:10 2023 +0200

    [pylos-online-and-in-demo-card] pull develop and fixed conflict

[33mcommit 0ea2d6644efb21394fe90bb7b8935130ab6a981d[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri May 19 23:31:51 2023 +0200

    [pylos-online-and-in-demo-card] showLastMove lifecycle enhanced

[33mcommit fa496621ef4db981a1e8159f653dc87ea28eb37f[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri May 19 16:47:05 2023 -0400

    [NewGameHelper] Fully cover NewGame component

[33mcommit 861850986ebd56507d75feb36b4a29df34e5fb45[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri May 19 16:08:58 2023 -0400

    [pente] Rules and coverage

[33mcommit a67a50aa3cb3e8f997522b3b773e5d6a289e62fb[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri May 19 15:31:38 2023 -0400

    [pente] Add moves and rules structure

[33mcommit 45fb99a61d4ae399123ec75da62799900c92b9ac[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri May 19 15:27:34 2023 -0400

    [NewGameHelper] Fully document rules and test them

[33mcommit 4fc703eb48b69c5d9f2cd3235f19b40c3c70e73c[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri May 19 11:51:58 2023 -0400

    [NewGameMove] Fully document moves

[33mcommit 0b9ece12254cf54cf096b42f0f7718379fe31cde[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri May 19 10:27:12 2023 -0400

    [NewGameHelper] document encoder

[33mcommit ec968bb72d9874ea623788c8dabea90e5fd879f7[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri May 19 10:18:45 2023 -0400

    [refactor-minimaxes] Document and fix coverage

[33mcommit e90d9c232d7c0ff36130aedc16a3390ea3319145[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri May 19 09:56:35 2023 -0400

    [NewGameHelper] Start README

[33mcommit c28fc64e6c52de284f79cbc6e8acb7e5638ddcc8[m
Merge: 1a289caeb 503ef7f6d
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri May 19 09:43:50 2023 -0400

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into HEAD

[33mcommit 1a289caebd2fe6d0bc8a25832173f48f81493d8b[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri May 19 09:43:21 2023 -0400

    [NewGameHelper] Pass over architecture and move

[33mcommit b970116e42439f8c47ec8d091830e424519233fe[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri May 19 09:21:48 2023 -0400

    [refactor-minimaxes] Really fix linter

[33mcommit 9cee9dda9543dbe4b81d9b7472a028f90ee93f63[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri May 19 09:08:25 2023 -0400

    [refactor-minimaxes] Fix linter and broken tests

[33mcommit 9936e2311b7a39e58841f0df8e47c8c0408b9e45[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri May 19 08:33:37 2023 -0400

    [refactor-minimaxes] Refactor most minimaxes

[33mcommit 503ef7f6dc8a7becfa86d4ec29547d1befa5cfa6[m
Merge: c6bd53639 74e8e3162
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Fri May 19 00:51:02 2023 +0200

    Merge pull request #112 from EveryBoard/stricter-mode

[33mcommit c6bd536396636ebefda9633091777261bff0cef7[m
Merge: f172cf611 324f873bb
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Fri May 19 00:49:02 2023 +0200

    Merge pull request #110 from EveryBoard/dvonn-move-fix

[33mcommit 74e8e3162bd57fc823abbb6d6e94619e11de071b[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Thu May 18 17:42:31 2023 -0400

    [stricter-mode] PR comment

[33mcommit 324f873bb701dfc182a3c0a688f603127302ed96[m
Merge: b11264556 f172cf611
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Thu May 18 17:33:52 2023 -0400

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into dvonn-move-fix

[33mcommit 54255100a33d6d1cef7b0ce8f83c37210fb16b79[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Thu May 18 17:30:48 2023 -0400

    [stricter-mode] Fix build

[33mcommit bfba9fb5ef72156636f0df178e495c30f7cbf377[m
Merge: c88798433 f172cf611
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Thu May 18 17:24:28 2023 -0400

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into stricter-mode

[33mcommit f172cf61171e4cdfc15c1a0733478bb685edf225[m
Merge: c69e87d6c be4ac8438
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Thu May 18 23:19:23 2023 +0200

    Merge pull request #109 from EveryBoard/remove-number-encoders

[33mcommit c88798433b7663aa1a5be3d00121f1064a50bf56[m
Merge: 6b6ff8aec c69e87d6c
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Thu May 18 17:16:29 2023 -0400

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into stricter-mode

[33mcommit 6b6ff8aec7702b46122398f0fd62b8fd8e93421f[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Thu May 18 16:49:43 2023 -0400

    [stricter-mode] Enforce noImplicitOverride

[33mcommit be4ac84386f94b89de954a2521ba654fdf065850[m
Merge: a166815b5 c69e87d6c
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Thu May 18 16:39:57 2023 -0400

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into remove-number-encoders

[33mcommit a166815b542382240a5aee923978049558d2c89d[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Thu May 18 16:39:33 2023 -0400

    [remove-number-encoders] Fix linter

[33mcommit c69e87d6cec26c26e18b370b0156251adc660789[m
Merge: e9ff51e05 698b9a66c
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu May 18 16:38:46 2023 -0400

    Merge pull request #111 from EveryBoard/local-endgame-enhancement
    
    Local Endgame Enhancement: "joueur joueur" issue fixed

[33mcommit 698b9a66cf54199fa41bf721e16e4cbaff64bcc7[m[33m ([m[1;31morigin/local-endgame-enhancement[m[33m)[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu May 18 22:26:57 2023 +0200

    [local-endgame-enhancement] joueur joueur issue fixed

[33mcommit 9fd50f8ff49cc54d78667a820837ded3ad380cc0[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Thu May 18 16:25:03 2023 -0400

    [remove-number-encoders] PR comment

[33mcommit 23035f088f238affe3f8db577879e72ae5fcdbd7[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Thu May 18 16:08:45 2023 -0400

    [remove-number-encoders] PR comments

[33mcommit b11264556adc0e8189e2cf76ed383553ad2260ee[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Thu May 18 11:06:10 2023 -0400

    [dvonn-move-fix] Remove Dvonn.of to avoid runtime errors in Dvonn

[33mcommit b7cbcb489dd844c54fb19821d6b0c4add43fc47a[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed May 17 22:30:23 2023 -0400

    [remove-number-encoders] Recover coverage

[33mcommit 9da38158068f974c13b8b7b3367ec102b99fdd08[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed May 17 22:26:28 2023 -0400

    [remove-numbers-encoders] Fully remove NumberEncoder

[33mcommit 065529796bfe9367c168d0e5a733122efe4769a6[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed May 17 20:57:13 2023 -0400

    [remove-number-encoders] Yinsh

[33mcommit 057f832f3e799416105fe3824b69a79c8b8c94de[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed May 17 20:55:25 2023 -0400

    [remove-number-encoders] Go

[33mcommit 6c21b876e250eb20fc21cfab2126c6e7e58d69b1[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed May 17 20:53:03 2023 -0400

    [remove-number-encoders] Reversi

[33mcommit f2f78d9c890c1610e5c48c13afc1c24a8a2a8bec[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed May 17 20:45:13 2023 -0400

    [remove-number-encoders] Diam

[33mcommit a4edc97b8e1d34a1529d77f26fc02ea9ebe335a3[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed May 17 20:39:59 2023 -0400

    [remove-number-encoders] Dvonn

[33mcommit 99ff4621302cc2635b0615c0e0d3222d1606a6ad[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed May 17 20:35:41 2023 -0400

    [remove-number-encoders] Epaminondas

[33mcommit 52c41c70641e55c11bc8c3821e1188c89346f2f9[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed May 17 20:32:54 2023 -0400

    [remove-number-encoders] Siam

[33mcommit 55a55487e0bd46449b53e095377bf5dd84dd9c37[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed May 17 20:24:22 2023 -0400

    [remove-number-encoders] MartianChess

[33mcommit e9ff51e056eb73aa5c3100d5cee14d348c6949f2[m
Merge: 26ee31d4f cab1ae2bd
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed May 17 20:25:56 2023 -0400

    Merge pull request #108 from EveryBoard/go-hoshi
    
    Go: Add Hoshis

[33mcommit cab1ae2bdb10b38020b65826d91f4378afa6f653[m[33m ([m[1;31morigin/go-hoshi[m[33m)[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu May 18 01:17:50 2023 +0200

    [go-hoshi] PR Comment Wave 3: fix linter

[33mcommit 239895b4a8d145ffe96d0ef876ea2c491fadc51a[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed May 17 18:59:47 2023 -0400

    [remove-number-encoders] Quarto

[33mcommit 1109bdf23182035dfd8851f675039121188e0f8a[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu May 18 01:14:33 2023 +0200

    [go-hoshi] PR Comment Wave 2

[33mcommit 7d42d11e9e3b23d30d920966df07378d0af792f0[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu May 18 01:10:04 2023 +0200

    [go-hoshi] PR Comment

[33mcommit a0f0403ef8bdcc3b373f562d1e25d5f91edb5061[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed May 17 19:09:06 2023 -0400

    [move-collection] Split OGWC file in two

[33mcommit c5bcaeb74c954674cd8fffe23666dc0a1b2af579[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed May 17 22:24:48 2023 +0200

    [go-hoshi] Hoshi added; won't work for custom board size in the best way

[33mcommit 376dae947fcd1f8bf3d8f82a609c0f0b412f15a9[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed May 17 15:59:00 2023 -0400

    [remove-number-encoders] Awale

[33mcommit ba9ca691c222b23fc38974f8dc274cfe56675784[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed May 17 15:56:42 2023 -0400

    [remove-number-encoders] P4

[33mcommit 9ded51c2e53287121e55c7a910de21888e71ed9f[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed May 17 15:53:44 2023 -0400

    [remove-number-encoders] Apagos

[33mcommit dcdd7c41cf130f5971e3b762712ad0d9e7f893e6[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed May 17 15:31:08 2023 -0400

    [remove-number-encoders] Abalone

[33mcommit 8e30172ddcf2f1585331aece4e246e81053395f1[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed May 17 13:29:25 2023 -0400

    [remove-number-encoders] No more number encoder in ConspirateursMove

[33mcommit cda3303aaf977625696fb1122baec59e96df57e0[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed May 17 13:13:15 2023 -0400

    [remove-number-encoders] Remove number encoders from QuixoMove

[33mcommit a1073fcd793e0bf17be67a47aa409b16ed1c6d37[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed May 17 13:00:19 2023 -0400

    [remove-number-encoders] Remove number encoders from Coerceo

[33mcommit 711abd50c471d0db49185cdfbe344807533df3ba[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed May 17 12:38:20 2023 -0400

    [remove-number-encoders] Remove number encoder from SaharMove

[33mcommit 922fca15c6b05f2d576ee2a5311fd635d256a15c[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed May 17 12:30:37 2023 -0400

    [remove-number-encoders] Remove number encoders from Kamisado

[33mcommit bec7eab8ef3e586a7bb07a040cf0a47d00c2d983[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed May 17 10:24:00 2023 -0400

    [remove-number-encoders] Encapsule now uses move encoders instead of number encoders

[33mcommit 42a6c34a41c82ba49957521d580024fb2a16ebb1[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed May 17 10:25:39 2023 -0400

    [move-collection] Fix linter

[33mcommit 3cc1ce2a21d40b047737e83ee78d80bfaa17d106[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed May 17 09:28:52 2023 -0400

    [remove-number-encoders] Refactor DiamMove encoder

[33mcommit 26ee31d4fb8fde7f043c605517ce8097ba1ccee0[m
Merge: c1a10934f 41f114082
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue May 16 22:01:40 2023 -0400

    Merge pull request #107 from EveryBoard/pentago-highlight-fix
    
    Pentago Highlight Fix

[33mcommit c1a10934f50a555344abb859dfbd4315953214f2[m
Merge: 19d1594df f230ac27d
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue May 16 22:00:02 2023 -0400

    Merge pull request #105 from EveryBoard/six-shift-fix
    
    Six Shift Fix

[33mcommit f230ac27df569e2d8693b27eecaaef4380deaca6[m[33m ([m[1;31morigin/six-shift-fix[m[33m)[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed May 17 03:50:23 2023 +0200

    [six-shift-fix] PR Comment 2

[33mcommit 41f114082e5edfaf3b1086e77a0cbccb169ac525[m[33m ([m[1;31morigin/pentago-highlight-fix[m[33m)[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed May 17 03:43:31 2023 +0200

    [pentago-highlight-fix] remove unused import

[33mcommit e6016d689359163870f4060a6c064f3d1f00ff8b[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed May 17 03:29:34 2023 +0200

    [pentago-highlight-fix] Pull Request Comment Wave 1

[33mcommit c372f4246e8cfe450bbb6dad59c00bdd4b21c69a[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed May 17 02:34:43 2023 +0200

    [six-shift-fix] remove fdescribe

[33mcommit f13ad067ddcd330757e224ff281b7ccb7c480f0b[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue May 16 20:27:03 2023 -0400

    [move-collection] Fix take backs and part starts

[33mcommit 98c4fffcd0e35417cfbd8e10f9a443b8396f4bb3[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed May 17 02:25:55 2023 +0200

    [sif-shift-fix] PR Comment

[33mcommit 9d1a3a0325ac589ee0b321293a213be92f33a186[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed May 17 01:45:10 2023 +0200

    [pentago-highlight-fix] Highlight enhance and last move more visible

[33mcommit 6e9e5d66ca142ecc24d3bf8b175ff94cacca7362[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue May 16 16:31:32 2023 +0200

    [six-shift-fix] fixed linter

[33mcommit cdd7ee9d99787c2c09f105bac2be8731e3618fa4[m
Merge: 39f24bd80 19d1594df
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue May 16 10:21:29 2023 -0400

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into move-collection

[33mcommit 39f24bd80454d636554f6a3e53913f2de6dee615[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue May 16 10:20:52 2023 -0400

    [move-collection] Rename PartService into GameEventService

[33mcommit 8099ad59fe83b9489ebf2e474b9e0ecdf119f2bb[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue May 16 16:11:53 2023 +0200

    [six-shift-fix] remove xdescribe

[33mcommit 8e3666628c33cdc6578718ecfc280fd69f9da557[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue May 16 16:10:51 2023 +0200

    [six-shift-fix] Test fixed

[33mcommit 76626ac8fa12c14d054affaff6a22d5318667e01[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Mon May 15 10:56:25 2023 -0400

    [move-collection] Firestore security rules

[33mcommit af5ebcf32c684453a6d2e6b59d61d25ea9b70b7b[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue May 16 03:00:58 2023 +0200

    [six-shift-fix] if it's boring to fix it: remove it !

[33mcommit 19d1594dffe0b682b9d4feaf60da087c929a0d8f[m
Merge: 8a7e51ed1 1d5b87793
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Tue May 16 01:43:13 2023 +0200

    Merge pull request #104 from EveryBoard/validation-is-fallible

[33mcommit 1d5b8779339eb89c7501af291d06ca3b29dba4bd[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Mon May 15 19:26:52 2023 -0400

    [validation-is-fallible] PR comments

[33mcommit 1ce3b7212786579600676e1b30650aa1913303b5[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Mon May 15 10:26:02 2023 -0400

    [validation-is-failure] Fix linter

[33mcommit 6be3c8a3a2cff70c8faaa876b97018b108f86be5[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Mon May 15 10:23:48 2023 -0400

    [move-collection] PR comments

[33mcommit 29fb2b7b0573a8a1681ae587ca9402cdaa2ab851[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Mon May 15 09:19:36 2023 -0400

    [validation-is-failure] MGPValidation is now an MGPFallible of void

[33mcommit 4b8fc1b2e2d9f2d194aa25bab7ffe47f26e38bce[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Mon May 15 08:34:54 2023 -0400

    [move-collection] WIP

[33mcommit 79db0efc90a2d67aedce64109a7f700b70d0d9dd[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun May 14 21:18:10 2023 -0400

    [move-collection] Start fixing security

[33mcommit 592a5b307dda242b644ee12d937f125889a58d5a[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun May 14 18:44:37 2023 -0400

    [move-collection] Fix most linter issues

[33mcommit d6d9823b80fd84145a68bc1cd997ff700195e5a7[m
Merge: ca69ddb6a 8a7e51ed1
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun May 14 18:14:51 2023 -0400

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into move-collection

[33mcommit ca69ddb6a538f9918b3e8698f00effa92678bd17[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun May 14 18:08:42 2023 -0400

    [move-collection] Get rid of ObjectUtils

[33mcommit 9f40fb6752264c0cfbe052da5d8d9133076c5e50[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun May 14 18:07:04 2023 -0400

    [move-collection] Better handling of part start

[33mcommit 77d4dc0d4c4a98017996af4d6f3e209d51323529[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun May 14 18:00:53 2023 -0400

    [move-collection] Remove most dependencies to actual part instead of events

[33mcommit 889e1a2b4199e871200a80959faf65808572d050[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun May 14 17:42:10 2023 -0400

    [move-collection] Add EndGame action

[33mcommit 8a7e51ed11da580da40160fd247a1c31309ce297[m
Merge: 2a052ab8e ee36ae76f
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun May 14 16:55:15 2023 -0400

    Merge pull request #103 from EveryBoard/coerceo-highlight-lifecycle-enhancement
    
    Coerceo Highlight Lifecycle Enhancement

[33mcommit ee36ae76f57169c80842ee2bc56db8b64c9183ad[m[33m ([m[1;31morigin/coerceo-highlight-lifecycle-enhancement[m[33m)[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun May 14 22:42:18 2023 +0200

    [map-get-by-index] modify text to hide copy/cut

[33mcommit 3e02ffd5d2dcd6c012139d7ce8fa4f4015a3eafa[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun May 14 22:39:18 2023 +0200

    [map-get-by-index] add tests for getAnyPair

[33mcommit e66f996dd1ab6ff6793ae0beede46ee4d781be32[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun May 14 22:32:35 2023 +0200

    [coerceo-highlight-lifecycle-enhancement] map.getByIndex should not exist

[33mcommit 50d2217630b96d3351de7be8f79d8f1c35923e1c[m
Merge: 395822f0b 2a052ab8e
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun May 14 22:31:32 2023 +0200

    Merge branch 'develop' of https://github.com/EveryBoard/EveryBoard into coerceo-highlight-lifecycle-enhancement

[33mcommit 395822f0b8f49ef692b35d46979029448b69c495[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun May 14 22:17:14 2023 +0200

    [coerceo-highlight-lifecycle-enhancement] last move no longer displayed when current move is displayed

[33mcommit 2a052ab8efcf6b7ad91b6c5589fe21e33560ec97[m
Merge: 70586d3dd 24ba9c2d7
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun May 14 12:11:28 2023 -0400

    Merge pull request #101 from EveryBoard/get-coords-and-contents-update
    
    GameState.GetCoordsAndContents: make it return an object, not a list

[33mcommit 24ba9c2d7b80d316b23eec548236d407fd75fa08[m[33m ([m[1;31morigin/get-coords-and-contents-update[m[33m)[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun May 14 18:04:43 2023 +0200

    [get-coords-and-contents-update] fixed use of GetCoordsAndContents in connect six

[33mcommit 70586d3dd75f152d48b7e883fe33b236d0c554cb[m
Merge: e7db4faa5 2bdff8c59
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun May 14 12:01:29 2023 -0400

    Merge pull request #102 from EveryBoard/lasca-symetry-bug
    
    Fix: Lasca Symmetry Bug

[33mcommit 2bdff8c595421549f3ee25e738faefbb1cd5cef0[m[33m ([m[1;31morigin/lasca-symetry-bug[m[33m)[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun May 14 17:49:55 2023 +0200

    [lasca-symetry-bug] removed fdescribe

[33mcommit 10e24f53b1a64ed3ccbc867381800801c57da908[m
Merge: 0f4181d63 e7db4faa5
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun May 14 17:44:16 2023 +0200

    [get-coords-and-contents-update] pull develop and fixed conflicts

[33mcommit a0090b08bf98d371760c6878039985ce3c5c2d34[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun May 14 17:41:55 2023 +0200

    [lasca-symetry-bug] capture no longer displayed where they where before rotation

[33mcommit 0f4181d63386edc0d69fec10168a47bb71197ee8[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun May 14 17:28:25 2023 +0200

    [get-coords-and-contents-update] GetCoordsAndContents now return an object, not a list of value

[33mcommit e7db4faa531d6bb4e5e715bc82a1f8c9b8a3091b[m
Merge: 96009ccff a44f1d30b
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun May 14 11:27:12 2023 -0400

    Merge pull request #100 from EveryBoard/get-victorious-coord-generalisation
    
    Get Victorious Coord Generalisation

[33mcommit a44f1d30bb34929a4311f8d598f633bc57206cdd[m[33m ([m[1;31morigin/get-victorious-coord-generalisation[m[33m)[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun May 14 17:18:52 2023 +0200

    [get-victorious-coord-generalisation] cancel adaptation to quarto, NInARow is not ready for ownerless games

[33mcommit 804108d9244cf061761031fe04ad0661224620a7[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun May 14 17:15:49 2023 +0200

    [get-victorious-coord-generalisation] cancel adaptation to quarto, NInARow is not ready for ownerless games

[33mcommit 7364fc0748badd211565ce379ede7d0dd78510cc[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun May 14 11:14:51 2023 -0400

    [move-collection] Fix tests

[33mcommit 97a7850e3d47e189e9fb4a014fdaef971db3dfe9[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun May 14 17:10:33 2023 +0200

    [get-victorious-coord-generalisation] fixed coverage

[33mcommit 5edd7571370a4f7a8c9d335bd83463441ea3971e[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun May 14 09:46:54 2023 -0400

    [move-collection] Get rid of lastUpdate, lastUpdateTime, and listMoves

[33mcommit 108a31850c336a960948d2bf998557450b29bce3[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun May 14 14:44:16 2023 +0200

    [get-victorious-coord-generalisation] done

[33mcommit 5200f66a44de80b1e30dc1d6b7e72b716b65b341[m
Merge: 92cba10ea 96009ccff
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun May 14 07:29:23 2023 -0400

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into move-collection

[33mcommit 96009ccff389ce2bbfa321e7398b851101adb24d[m
Merge: 5b75aefc0 36aff7c9e
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun May 14 07:25:16 2023 -0400

    Merge pull request #99 from EveryBoard/connect-six
    
    Connect Six

[33mcommit 36aff7c9e30542745773b6ad3cfcc8f15b99fa87[m[33m ([m[1;31morigin/connect-six[m[33m)[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun May 14 13:17:36 2023 +0200

    [connect-six] fix translation and commit!

[33mcommit 63ed5b4d9f3e933ecd3d9b652e52a62f2a36001e[m
Merge: d93ec0133 655acbc80
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun May 14 04:33:18 2023 +0200

    Merge branch 'connect-six' of https://github.com/EveryBoard/EveryBoard into connect-six

[33mcommit d93ec01336ccf16a80acdc2614b412d29edd7272[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun May 14 04:32:48 2023 +0200

    [connect-six] fix linter and translation

[33mcommit 40ca0a49637eeb76e9e6d60f6ea5e6a980a8829d[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun May 14 04:18:14 2023 +0200

    [connect-six] enhance transation

[33mcommit 655acbc803fb55f55cff5378c7ffa2c8ebd0f00c[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 13 22:15:45 2023 -0400

    [connect-six] Update images

[33mcommit 49487d10383bf97be14d904f2081cb9a8f32ca09[m
Merge: d478cbfa9 5b75aefc0
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun May 14 04:14:47 2023 +0200

    [connect-six] Pulled develop and fixed conflict

[33mcommit d478cbfa972ab189ca534d1899f32e85278c09b3[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun May 14 04:14:08 2023 +0200

    [connect-six] Pull Request Comment Wave 2

[33mcommit 92cba10ea9f875585f05ed6c3ab5f3aca1a16ce8[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 13 22:08:59 2023 -0400

    [move-collection] Remove some debug info

[33mcommit cfca31a40191fdfd707db6342798af482c16011f[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun May 14 03:47:09 2023 +0200

    [connect-six] add tutorial

[33mcommit 5e8b549eb49e93c105d0f6824362afa35b14d9ab[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 13 21:40:32 2023 -0400

    [move-collection] Fix remaining tests

[33mcommit d5331834a20f93172fe24db9d50879db03359266[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun May 14 02:54:19 2023 +0200

    [connect-six] pull request comment wave 1

[33mcommit 5b75aefc0980f6a3ca72f5cd820885fdf4755b31[m
Merge: e02b2e883 498269735
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sun May 14 02:23:19 2023 +0200

    Merge pull request #93 from EveryBoard/remove-minimax-debug

[33mcommit 49826973531fbafa8f835df634a87b1a883b5212[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat May 13 20:22:21 2023 -0400

    [remove-minimax-debug] Fix indentation

[33mcommit 94a8e11e6270e6480df3093e454f01afdcc8b60b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat May 13 20:21:21 2023 -0400

    [remove-minimax-debug] Remove useless ng-container

[33mcommit 0e3eedb8212d2cdade4bad4da3505eba21e2bf86[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat May 13 19:37:29 2023 -0400

    [remove-minimax-debug] Keep displayAIMetrics

[33mcommit 3880ee33c62c82f9c3d569dde28ab67a0fcbd8bb[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat May 13 17:38:23 2023 -0400

    [remove-minimax-debug] Fix unstable test

[33mcommit 5ec4862ccb1375c2882bedfb02563eef15e88c10[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat May 13 17:30:30 2023 -0400

    [remove-minimax-debug] Update numbers, some fixes

[33mcommit ffc98b3f0d8a512a5c3f184c66a83bb99ab52353[m[33m ([m[1;31morigin/remove-minimax-debug[m[33m)[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat May 13 23:19:07 2023 +0200

    [remove-minimax-debug] recoverage Trexo and Tafl and enhance tafl escaper logic

[33mcommit 929a644af453e63c6e76232b19d940b9eadc415f[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 13 17:03:50 2023 -0400

    [move-collection] Fix some take back tests

[33mcommit df3ad1fcfd33f55cfebc4ff98d54701980eacb71[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 13 16:24:02 2023 -0400

    [move-collection] Protect events handling with mutex

[33mcommit fe3c552507b792f8c074dfcdafcfb89f289c3061[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 13 15:57:58 2023 -0400

    [move-collection] Make sure clocks have been updated even is part is done

[33mcommit 9aa082439b9f72968c68b8cd8ca62061c6d061ae[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 13 15:45:45 2023 -0400

    [move-collection] Fix onCancelMove test

[33mcommit afcf272310aacc236cb0280e4e226d3bca95cc72[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 13 12:16:05 2023 -0400

    [move-collection] Update clocks at the end of the game

[33mcommit 0e42eacfc2c7d4259be414148d49cb57b3cb4751[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 13 11:50:54 2023 -0400

    [move-collection] Reinitialize TimeManager's data upon game start

[33mcommit b2a67f263bfe27179cbc9dc29f185deea536d23d[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 13 11:00:43 2023 -0400

    [move-collection] Fix remaining tests

[33mcommit ba35a59a1f3aada1d68002b8b1363f3c48ad4170[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat May 13 16:45:16 2023 +0200

    [connect-six] Code fully covered, component done, encoder done

[33mcommit 5f6cdf009991d615fb2d989afae82e3856d61bde[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat May 13 10:13:29 2023 -0400

    [remove-minimax-debug] Update coverage CSV

[33mcommit 698f63a000c7cbca81bdbb5996a9a61470332230[m
Merge: d7a694cba e02b2e883
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat May 13 10:09:09 2023 -0400

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into remove-minimax-debug

[33mcommit d7a694cba3267ee6503695f5f106566eb34fe046[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat May 13 09:48:55 2023 -0400

    [remove-minimax-debug] Remove dead functions

[33mcommit cc869d53fe77ef2f961b37f22990ce1945a66154[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 13 09:43:46 2023 -0400

    [move-collection] Fix getServerTimestamp

[33mcommit f739706674f44019c96ef887d61dc266f16ab8a1[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 13 09:28:34 2023 -0400

    [move-collection] Some manual fixes

[33mcommit 520598e9eeb6633371d8bf8f0036909e4cdc4581[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 13 08:57:50 2023 -0400

    [move-collection] Fix tests

[33mcommit 3b3144dc097e2ae34f4b5cec3ce66f33e0571eb5[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat May 13 07:53:33 2023 -0400

    Revert "[move-collection] WIP"
    
    This reverts commit 05c81e7c95442d0f27dc77ea02af64f1f4582089.

[33mcommit d3d39dc45ef2136289e924c319146335c2ec9ad7[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat May 13 03:06:42 2023 +0200

    [remove-minimax-debug] covered and enhanced 'escape' tafl minimax

[33mcommit 05c81e7c95442d0f27dc77ea02af64f1f4582089[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri May 12 20:47:29 2023 -0400

    [move-collection] WIP

[33mcommit d83b16fce80cec9af86e49879a4f2180269ff96f[m
Merge: ab58dd077 e02b2e883
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri May 12 23:54:12 2023 +0200

    [connect-six] pull develop and fix conflict

[33mcommit ab58dd07791e79fb21eff7d72f984e4730625f34[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri May 12 23:48:40 2023 +0200

    [connect-six] Rules and Component done

[33mcommit e3f1927df4c7693aa68c1315d5bd500f15d887fa[m
Merge: dcc91e6bf e02b2e883
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri May 12 16:53:47 2023 -0400

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into move-collection

[33mcommit dcc91e6bf0366b0482d66a1a2a5eea9ffe186d29[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri May 12 16:53:06 2023 -0400

    [move-collection] remove drift for debugging

[33mcommit e02b2e883b2f2b52f4093b127c51979eed0caac5[m
Merge: 5d1d9b39d 2845917bc
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Fri May 12 22:32:26 2023 +0200

    Merge pull request #98 from EveryBoard/unique-list

[33mcommit 17383a64008b3d13b63483a46d9b6c27d70c268a[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri May 12 11:17:42 2023 -0400

    [move-collection] Do not rely on local timestamp

[33mcommit 2845917bcb4e11e2a3235f8f352bc0c586994cf9[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri May 12 09:44:28 2023 -0400

    [unique-list] Rename MGPOrderedSet to MGPUniqueList and cover it fully

[33mcommit d6e152ed445032df2b820d43f6c7e2a18c4b7fe1[m
Merge: 6e12f94a5 5d1d9b39d
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri May 12 08:50:05 2023 -0400

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into move-collection

[33mcommit 6e12f94a5190d22f8969a7a6d0af71a300a8b561[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri May 12 08:35:31 2023 -0400

    [move-collection] Fix linter

[33mcommit 026931236e0f0c421cae1052f62b04804e96a76b[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri May 12 07:47:32 2023 -0400

    [move-collection] Prepare refactoring

[33mcommit 5d1d9b39dbf50a7637c5a461e0016bed3803aff5[m
Merge: 233af6e40 af1b95a78
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu May 11 21:15:07 2023 -0400

    Merge pull request #81 from EveryBoard/Lasca
    
    New game: Lasca

[33mcommit af1b95a78cab74f4f3ebbf955a23c9464aa0faef[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Thu May 11 21:13:12 2023 -0400

    [lasca] Update images

[33mcommit daeb828ed88b803f983c11e301ff3984850434d0[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Thu May 11 20:12:29 2023 -0400

    [move-collection] Fully cover part service

[33mcommit c3eaac9b0b460c6f2d3f8329b330f3178e7c6b16[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Thu May 11 13:46:40 2023 -0400

    [move-collection] Add new tests

[33mcommit ada0aa9d298f1b5351325d31c001e89d58386d10[m[33m ([m[1;31morigin/Lasca[m[33m)[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed May 10 20:24:46 2023 +0200

    [Lasca] Pull request comment 2

[33mcommit 393a1c00dfa7d1949fe9e815f32cc6da7d94fba6[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue May 9 19:16:35 2023 -0400

    [move-collection] Fix more unstable tests

[33mcommit ade1dfcd7d402a14ff80816e053465a6ce27ff8b[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue May 9 20:48:51 2023 +0200

    [Lasca] Pull Request Comments & View Fixes

[33mcommit 336111cfd85409cace89310f30fad43a8ee057ed[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue May 9 07:35:32 2023 -0400

    [move-collection] Fix clocks order

[33mcommit 2201fe6ab7f4b33b626ef06ae0dead351912ba4b[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Mon May 8 19:39:17 2023 -0400

    [move-collection] Fix most tests

[33mcommit 9b9a2c3907650c57c1eb5a62f1573525e68d7203[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun May 7 17:47:50 2023 -0400

    [move-collection] Fix double component creation in tests

[33mcommit 481785f0a2727ed5f4ec4fbf2b31cbb6cfcf3c97[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun May 7 11:15:49 2023 -0400

    [move-collection] Refactor time manager to become a service

[33mcommit 2d9ab3dd5b8869678980429f109f80df11f39e52[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri May 5 19:12:04 2023 +0200

    [Lasca] fix linter and coverage

[33mcommit 139124d00ab8a061668e0bd5d0a053f68439138d[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu May 4 21:05:15 2023 +0200

    [Lasca] PR Comment 3

[33mcommit 7bd63025086eaa0324061aa26e5c78164460951c[m[33m ([m[1;31morigin/NewGameHelper[m[33m)[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu May 4 07:53:10 2023 +0200

    wip

[33mcommit 0afc9f1fe76185daac9bff4c23d37b856a9659b7[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed May 3 20:09:35 2023 +0200

    [Lasca] PR Comment 2

[33mcommit bf74ec32dee5e531681f563c5fb1554458df28fd[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue May 2 21:19:03 2023 +0200

    [Lasca] PR Comment

[33mcommit 02705a6bea4aaff66011cb303eb5bea10e924e7f[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue May 2 10:39:45 2023 +0200

    [Lasca] coverage.py attempt 5

[33mcommit 92f1ae2ee80e1fcb8e92fe4c94157e7fb9a5194b[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue May 2 10:15:06 2023 +0200

    [Lasca] coverage.py attempt 4

[33mcommit f60abadd509e07c3806100e5a9db590500420487[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue May 2 09:14:38 2023 +0200

    [Lasca] coverage.py attempt 3

[33mcommit 94f4301bef4c1b8ed22c64bfa1dbd28c83718426[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Mon May 1 07:36:41 2023 -0400

    [move-collection] Fix more tests

[33mcommit 9b53fe31a7a7a98cd0d2dec60c65329893e93520[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon May 1 22:48:05 2023 +0200

    [Lasca] coverage.py attempt 3

[33mcommit 956a6bc6fcec89e05b091c34a277f159d5a1b0d7[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon May 1 22:37:26 2023 +0200

    [Lasca] coverage.py attempt 2

[33mcommit 1cb0acb84b5ae52b8a306bbb9577415a81798741[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon May 1 22:13:28 2023 +0200

    [Lasca] coverage.py attempt 1

[33mcommit 989d27f1b0e4a101ae68ea68f0c3df3d48142e6d[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon May 1 21:57:02 2023 +0200

    [Lasca] coverage.py attempt 0

[33mcommit 58bf35cec9404e53b673a55a8002b3f71c76623e[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon May 1 20:08:52 2023 +0200

    [Lasca] small fix

[33mcommit 2d7513fd62d291c201576597086bc719d1d5bc96[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon May 1 19:33:49 2023 +0200

    [Lasca] small changes

[33mcommit 2a19bdf5acb285a0782811c73469bafada8b5530[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon May 1 19:22:42 2023 +0200

    [Lasca] update coverage.py for debug

[33mcommit d69d37aa338e8e679e6d33c21a264d2f2ab47622[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon May 1 15:09:10 2023 +0200

    [Lasca] coverage.py modification for test

[33mcommit 465222d8316e0bba048e25f9b91e6556d01de862[m
Merge: 464a36f35 233af6e40
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Thu Apr 27 08:27:46 2023 -0400

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into move-collection

[33mcommit 334317e4411b2135c222bc723ddb2b664e956c31[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Apr 26 20:21:18 2023 +0200

    [Lasca] temporary modification to coverage.py for debug

[33mcommit 464a36f35652f73672d926c0eef2d5e72c0190b6[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 21 09:38:27 2023 -0400

    [move-collection] Fix more tests

[33mcommit fba2c06391dbbfd69934a68019fbdfcdc28f723a[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Apr 25 07:27:39 2023 +0200

    [Lasca] fixed translation

[33mcommit 725d49d11dd6e65a472e04084b7cfa21b4954444[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Apr 24 21:30:00 2023 +0200

    [Lasca] put some code in common with Trexo

[33mcommit aafc05bcaf504759c87f072987888082d6ac2a4d[m
Merge: 662d1859b 233af6e40
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Apr 24 08:04:35 2023 +0200

    [Lasca] Pull develop and fix conflict

[33mcommit b8f1ee96b5bea982c028ea93076d852627564748[m
Merge: 9836a0e23 233af6e40
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sun Apr 23 21:04:57 2023 +0200

    Merge pull request #97 from EveryBoard/develop

[33mcommit 233af6e4089029776d3272e9bce0404b5ca07c32[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat Apr 22 18:31:11 2023 -0400

    Update images

[33mcommit 2502a9b4d0d0f0b02757877904ba886414d85c75[m
Merge: 4f90ec214 761cadfb4
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 21 10:40:33 2023 -0400

    Merge pull request #87 from EveryBoard/trexo
    
    Trexo

[33mcommit 761cadfb4ca07318c089ac1a0863f8a3f717566d[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 21 09:51:40 2023 -0400

    [trexo] Update images

[33mcommit 662d1859bad00802fc262ef77573a17e0d1ee915[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Apr 20 19:12:09 2023 +0200

    [Lasca] remove xdescribe

[33mcommit db76ca48a6cb8cdb72f2ce244d5b32ccfcc9b6c3[m[33m ([m[1;31morigin/trexo[m[33m)[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Apr 20 19:09:42 2023 +0200

    [Trexo] PR Comment Wave 6

[33mcommit d9a1fc741c682c1b458d52a31184a7f15a2ea703[m
Merge: bc3994268 4f90ec214
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Apr 20 19:05:31 2023 +0200

    Merge branch 'develop' of https://github.com/EveryBoard/EveryBoard into Trexo

[33mcommit 3765f83bbd72e79d1453bdb4eb1b9eb3465857c8[m
Merge: 2345c8423 4f90ec214
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Apr 20 19:03:50 2023 +0200

    Merge branch 'develop' of https://github.com/EveryBoard/EveryBoard into Lasca

[33mcommit 2345c84234bf7192b407220ef49ed6712b2ed293[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Apr 20 19:03:37 2023 +0200

    [Lasca] Pull Request Comment Wave 2

[33mcommit 8cec8364f464ccbd092baa61b7b0646906ed2cd0[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Apr 19 20:56:40 2023 +0200

    [Lasca] Fixed coverage

[33mcommit 1a14e592c31d910263ae964662b4b0b0a58ac53f[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed Apr 19 07:46:57 2023 -0400

    [move-collection] Fix simple move test

[33mcommit a00c6719b6b88558cc97b680d9f6d3606924a00e[m
Merge: 6fcb38171 298a7842e
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Apr 18 21:28:33 2023 +0200

    [Lasca] pulled Lasca and fixed conflict oO?

[33mcommit 6fcb3817198fd5e3d44f668c53365a5a26778270[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Apr 18 21:27:26 2023 +0200

    [Lasca] fixed Vector

[33mcommit bc399426817cfdac17bdd6853d2bc57237e876dc[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Apr 18 20:51:15 2023 +0200

    [Trexo] PR Comment wave 5

[33mcommit ba25c30fd88ca56137df89d6d99fd4be36ba0c97[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue Apr 18 07:58:25 2023 -0400

    [move-collection] Fix game service tests

[33mcommit f10a4b0097a3edbbc71704ed047fbebb521ebcdb[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Mon Apr 17 19:46:07 2023 -0400

    [move-collection] Local and global times are now working correctly

[33mcommit d30d138e6f240a8d4b2f1798619c7c84aa90fb92[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Apr 17 21:03:36 2023 +0200

    [Trexo] removed xdescribe

[33mcommit 93ea7ead6b1d3d89768a6de079dc8b5da05f0385[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Mon Apr 17 08:06:40 2023 -0400

    [move-collection] Rename last event -> last move start

[33mcommit 5369c4c218b89d4cead0adafca47d0289fc16753[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed Apr 12 17:53:42 2023 -0400

    [move-collection] Local time management seems good now

[33mcommit 4f90ec2140c5e9ded7e2105893eadeb2f4146a36[m
Merge: 455d2c21f 68752cb24
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sun Apr 16 20:47:50 2023 +0200

    Merge pull request #95 from EveryBoard/netlify-deploy

[33mcommit f9c5584b775cb99f8f534fccb673bb3f78e11dcf[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Apr 16 15:04:10 2023 +0200

    [Trexo] pull request comments wave 4

[33mcommit 455d2c21f8239fcfd60f325322406ec71c258f38[m
Merge: 71c6117cb 3deafc85d
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sat Apr 15 20:47:44 2023 +0200

    Merge pull request #96 from EveryBoard/coerceo-tiles-fix

[33mcommit 3deafc85d0d35ccb788c67410d19a0a3499afbea[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat Apr 15 13:38:05 2023 -0400

    [ceorceo-tiles-fix] PR comments

[33mcommit bafb5245c687faef8b7c5c138b46d961ee91c6bc[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Apr 12 07:48:06 2023 +0200

    [Lasca] Pull Request Comment

[33mcommit 355877b52b99d6d32c2ddd53cd7765c97977608d[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Apr 11 07:19:03 2023 +0200

    [Trexo] fix linter and translations

[33mcommit 2b0b1ed2698969f2b6f082b22bf2718ac68f7cb4[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Mon Apr 10 09:10:06 2023 -0400

    [move-collection] Joining in-game works

[33mcommit f8d3d0baf4ca6b2b91c6ef8302844361419e2cc9[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun Apr 9 21:05:45 2023 -0400

    [coerceo-tiles-fix] Fix tiles placement in coerceo

[33mcommit 68752cb243b3e77b438bc364b30ee410dacea47a[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun Apr 9 20:40:39 2023 -0400

    [netlify-deploy] Looser CI restrictions to deploy feature branch

[33mcommit fa0108a1cda8ebe388f5982f7ad8534c6cdcbc73[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun Apr 9 20:36:06 2023 -0400

    [remove-minimax-debug] Fix Hive coverage

[33mcommit 102c5882d3c991dce5d0e914bd7b1871cb8d85f9[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun Apr 9 19:30:55 2023 -0400

    [move-collection] Polish time management

[33mcommit f5fe81b129f8c4b7e0487605a3d1a701096e63a7[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun Apr 9 16:20:08 2023 -0400

    [move-collection] Finally get something that works

[33mcommit 298a7842e1d1c970e20f170189fc50d7dadc57f0[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Apr 9 13:36:38 2023 +0200

    [Lasca] pull request comments

[33mcommit 3860971aa6a69b593f1aad3bd0d2f4a05c363108[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Apr 9 13:19:35 2023 +0200

    [trexo] pull request comments

[33mcommit aa1a0b45c02f44bea5da3b6eb098d6544cc2cf9d[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 7 16:55:55 2023 -0400

    [remove-minimax-debug] Update coverage

[33mcommit c597ce9dfc2e803468f80cc6761f4d8e7f2b14df[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 7 16:51:31 2023 -0400

    [remove-minimax-debug] Remove debug info from minimax

[33mcommit 62493fe80a9014b116ade9f87cf7a9fbdcfa7a92[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 7 16:49:05 2023 -0400

    [move-collection] WIP

[33mcommit e8c6d3f40f46f86b54bb2e0d2903c5f907418593[m
Merge: 55ad1708b 71c6117cb
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Apr 4 07:14:00 2023 +0200

    [Lasca] Pulled Develop and fixed conflict

[33mcommit 8956f3037ce3787b466de8c03d7b049cfae9bd6f[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Apr 3 21:50:32 2023 +0200

    [trexo] Pull request comment and view enhancement

[33mcommit d07ad4c4ed0a01549e30461ee8a6171760179325[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun Apr 2 17:45:59 2023 -0400

    [move-collection] Improve time management before refactor

[33mcommit 0002b4dda7b8c8d97e0539f0ea0e5a80cfd83d6d[m
Merge: a76608243 71c6117cb
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun Apr 2 13:03:35 2023 -0400

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into move-collection

[33mcommit 71c6117cb2a5147ca126e802c2d0231495dd8ee1[m
Merge: 8b6ef0ac5 b7d2612f6
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sun Apr 2 18:57:14 2023 +0200

    Merge pull request #92 from EveryBoard/coverage-script

[33mcommit b7d2612f69165899445e3e5c69bef9b2e3d93bcf[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun Apr 2 07:58:36 2023 -0400

    [coverage-script] PR comment

[33mcommit 9836a0e23c3dba72701810a612eacabdfaf22cc0[m
Merge: 96386a23c 8b6ef0ac5
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Apr 1 17:01:53 2023 -0400

    Merge pull request #91 from EveryBoard/develop
    
    EveryBoard Master 9

[33mcommit 846bf34e04de80c485069862c612a30c6ade618f[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat Apr 1 17:01:02 2023 -0400

    [coverage-script] Recover missing coverage

[33mcommit 0d04b379724da443341127d310ba4a5d53f55ea9[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat Apr 1 16:24:55 2023 -0400

    [coverage-script] Fix path of coverage files in coverage script

[33mcommit a7660824388d0d697947922e5c99e3a79e82a0ce[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat Apr 1 12:56:54 2023 -0400

    [move-collection] WIP

[33mcommit 233a4fdb29014b0671978bc25615f60b55185b39[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Apr 1 14:29:38 2023 +0200

    [trexo] pulled develop and fix conflict

[33mcommit 1c10eacc976c3663d9c7357df286b6d1c6e61b06[m
Merge: d4e53807f 8b6ef0ac5
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Mar 30 21:31:01 2023 +0200

    [trexo] pull develop and merge confict

[33mcommit 8b6ef0ac573d7bf8a8e302476430f495003015a8[m
Merge: 4a29caeaa 99f4d9d7e
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Wed Mar 29 08:23:37 2023 +0200

    Merge pull request #83 from EveryBoard/hive
    
    Hive

[33mcommit d4e53807f647621c9dde145c9e9739464d6a7272[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Mar 28 19:43:23 2023 +0200

    [trexo] PR Comments; change TrexoState

[33mcommit 7d8c663d4cc05849edcc097d2025e7dff18bda46[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue Mar 28 08:13:30 2023 -0400

    [move-collection] Parts are now playable again

[33mcommit 7e98e48188c05ff24ce68b75905ab6e579f4f7e5[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun Mar 26 07:31:42 2023 -0400

    [move-collection] WIP

[33mcommit 99f4d9d7e8f90e1bd19af57a0edfa09411f112a1[m
Merge: 10135a2ed 4a29caeaa
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Thu Mar 23 08:15:06 2023 -0400

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into hive

[33mcommit 10135a2ed3b85023157a66164850b2df956bfd82[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Thu Mar 23 08:11:20 2023 -0400

    [hive] Next PR review comments

[33mcommit 904f44ff9b943cbb7710cc28ee62e3cd98770e73[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Thu Mar 23 07:46:51 2023 -0400

    [move-collection] WIP: extract timing functions from OGWC

[33mcommit 4a29caeaac80399aa1d3a5f09abfb1056754cdf8[m
Merge: a78076462 bf39dd921
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Wed Mar 22 07:55:28 2023 +0100

    Merge pull request #80 from EveryBoard/tuto-orientation
    
    [tuto-orientation] Fix tutorial orientation

[33mcommit adfeafd7e2d8cbd5a4df3418d766ed47b3866f3b[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue Mar 21 07:40:10 2023 -0400

    [hive] Missing PR comments

[33mcommit 76bd0f07a69e126b0f646bc6dfd4274fbcdb52ad[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Mon Mar 20 19:26:41 2023 -0400

    [hive] Fix HiveMinimax that was generating illegal moves when queen bee must be dropped

[33mcommit 70f41c536d38e4ffc983ed64d44be55a8694e49d[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun Mar 19 19:19:19 2023 -0400

    [hive] Next batch of PR comments

[33mcommit 50ab18d8293cd674aa2ea9a36c73747275323217[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat Mar 18 09:56:46 2023 -0400

    [move-collection] WIP

[33mcommit c53d297043a44a1bdddfaccc36d657689c5dba22[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Mar 16 20:39:12 2023 +0100

    [trexo] PR Comments; updated way to draw the piece; finished tutorial

[33mcommit 2e7f5b3840cd11c09582d92013f78c1de87cda8e[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed Mar 15 19:27:03 2023 -0400

    [hive] Fix translations and rename moveLegality to moveValidity

[33mcommit 94b26ebf459c3f8d249ce58beded643d4c7569ea[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed Mar 15 19:18:34 2023 -0400

    [hive] Fix linter and minor refactors

[33mcommit 31a6891f5b1fae87ab02f9c847e16c0a2418aa02[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed Mar 15 19:11:49 2023 -0400

    [hive] Improve highlights

[33mcommit c833ffeaad09b4db39ea6efcd92b276def2b9922[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed Mar 15 19:00:28 2023 -0400

    [hive] Fix spider move

[33mcommit ff016f6e3ed6d42ce9fb811e1ab5e026238370d3[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed Mar 15 07:34:50 2023 -0400

    [hive] More PR comments and small fix

[33mcommit 0e008a9c1ff73c3447125814382d9b9e734fdf02[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue Mar 14 08:10:00 2023 -0400

    [hive] Add test for broken rule

[33mcommit 6fc95309e9442f2f6f364e558cb73c570d329278[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Mon Mar 13 07:53:09 2023 -0400

    [hive] Moar reviews

[33mcommit a222659eb0de5b24404736406dbdc4aed3a02481[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun Mar 12 10:35:34 2023 -0400

    [hive] More review comments

[33mcommit bf39dd921b6bd678a78c1c40ed9867c7d98ac82e[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri Mar 10 07:33:47 2023 -0500

    [tuto-orientation] PR comments

[33mcommit fa8de1abfa1e8daf5dc7a8de8d051c1199c93ace[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Wed Mar 8 17:47:18 2023 -0500

    [move-collection] Notes on how to go forward from here

[33mcommit bfd6d8ace95d95b840c105542412f7fa60429234[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Mon Mar 6 19:56:36 2023 -0500

    [move-collection] Fix tests that are not time-related

[33mcommit 768d4df8f4eecb08a8837569a7bc9ce57dacffa5[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat Mar 4 10:35:17 2023 -0500

    [move-collection] Support take backs and other requests/actions

[33mcommit 1e20376a95263a82742132ff6fc37dd6e39b1c7b[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun Feb 26 10:17:51 2023 -0500

    [move-collection] Last fixer for collectioned moves

[33mcommit c9d2afcfbaf42877dc87c87e5a88846be2492890[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat Feb 25 09:04:10 2023 -0500

    [move-collection] Disable take back, enable late arrival tests

[33mcommit 0c2efbf15e16c6f253c0104489f08e1bf8e1bd81[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri Feb 24 18:03:20 2023 -0500

    [move-collection] Fix tests

[33mcommit 1ecce5c63231fbba93f6a4ea02dbe623ddf55a43[m
Merge: e9a53265d a78076462
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue Feb 21 18:08:30 2023 -0500

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into move-collection

[33mcommit e9a53265db0ee96de9984ca54ddf4605e75b676e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jan 29 12:57:24 2023 -0500

    [move-collection] Store moves in a sub collection.
    
    Works with manual testing so far

[33mcommit 0dc7654f81418b225873fe0cf37970d36c4a6562[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun Feb 19 17:53:59 2023 -0500

    [tuto-orientation] PR comments

[33mcommit e811ff90379decd39d8732c771367578269f311c[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun Feb 19 12:58:05 2023 -0500

    [hive] New review comments

[33mcommit a4cb0c1e6be749342182fb7b84155cc6f1e11874[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun Feb 19 11:49:05 2023 -0500

    [hive] Update tuto text and translations

[33mcommit 1e443513a54e50f309881f9d813a76528f3bbee5[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun Feb 19 11:36:19 2023 -0500

    [hive] Coverage

[33mcommit 3baae6917417efd65ded132a4ba41c922f891c01[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat Feb 18 18:12:15 2023 -0500

    [hive] Lint fixes

[33mcommit f735f41c8237c0c19f500c3e6611fa9e27469994[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat Feb 18 17:24:03 2023 -0500

    [hive] Fix all tests

[33mcommit 1dd63c6173006aa1f804e37daa220cd8c69f809c[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat Feb 18 15:31:36 2023 -0500

    [hive] Refactor

[33mcommit 0ea412b77f4dc0701409aee883eefcfe6b715164[m
Merge: 74c30f5d8 22d7abe4a
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Feb 18 11:45:07 2023 +0100

    Merge branch 'trexo' of https://github.com/EveryBoard/EveryBoard into trexo

[33mcommit 74c30f5d87cd912281b0b2c66e3161cf1a3c7598[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Feb 18 11:44:37 2023 +0100

    [trexo] pull request response and enhancements

[33mcommit 8038c59cb07a2018b199bfc85c685afa855352a4[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri Feb 17 19:44:20 2023 -0500

    [hive] Fix most visual things

[33mcommit 55ad1708bb48ddc61d600d078a4e32d72dbe0ee1[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Feb 15 21:13:57 2023 +0100

    [Lasca] PR Comments

[33mcommit d35cad8181eace2bce421b0a29fad61e185a02b0[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Mon Feb 13 19:54:54 2023 -0500

    [hive] Finalize all improvements but one

[33mcommit 5def8286998378ff8c1bec8a5e3979eb9ccdd301[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Mon Feb 13 07:46:31 2023 -0500

    [hive] Fix remaining test

[33mcommit 66c252785b59717927933cc17aec35ee29e76b8d[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun Feb 12 20:25:28 2023 -0500

    [hive] Final touches

[33mcommit b8d7619567c5069cec27ae6173e7e2c145a16003[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Feb 12 17:21:50 2023 +0100

    [Lasca] temporary change to debug passive-player-clicks

[33mcommit 2414b2697a93be5aa04dcb572fe71a17e28e6157[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun Feb 12 10:13:26 2023 -0500

    [hive] Add PASS to Minimax moves

[33mcommit 10372e3b809e2229aa0605e39a8ce28adb49cb76[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sun Feb 12 08:46:37 2023 -0500

    [hive] More minor fixes

[33mcommit 54b9e0e96624269034ef587d0b8920556ed7744d[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Feb 10 21:01:29 2023 +0100

    [Lasca] Pull request answer and enhancements

[33mcommit 17f4c59ff7f5b83e27e634de75df1d3f8d9b0bae[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Fri Feb 10 08:01:13 2023 -0500

    [hive] Fix viewbox computation

[33mcommit 0fb9319519c47649d564bba63689227a98e1addb[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Thu Feb 9 20:52:10 2023 -0500

    [hive] Run linter

[33mcommit 9355ced3ba0627458764ef41c6173a732dd8e107[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Thu Feb 9 20:46:26 2023 -0500

    [hive] Finish PR comments

[33mcommit a34250ee9c01f426df6dedba39baff115d83694f[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Thu Feb 9 07:34:20 2023 -0500

    [hive] More review comments

[33mcommit c0a3d42db486c4c8eea2119c4cd9fed47d307930[m
Merge: 0c54e90d2 a78076462
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Feb 9 07:54:32 2023 +0100

    Merge branch 'develop' of https://github.com/EveryBoard/EveryBoard into Lasca

[33mcommit 0c54e90d2f6d1cd9a2732192ff6a8c0f12cec227[m
Merge: bd9e1f7b9 d0a344c7e
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Feb 9 07:29:14 2023 +0100

    [Lasca] fix merge conflict

[33mcommit bd9e1f7b957c9c783de87fde1dc4477edb152bfc[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Feb 8 22:29:55 2023 +0100

    [Lasca] Answer pull request

[33mcommit af38785907fc0f9a50f8eb81bd0cb7a86beec8a9[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue Feb 7 20:55:26 2023 -0500

    [hive] Render HiveState immutable

[33mcommit 5c72473396838b504bd256e7d2b31cf40d317d2a[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Tue Feb 7 07:48:18 2023 -0500

    [hive] Repair all repairable tests

[33mcommit cba3a5cb5e89e19f1c2c085995c509390cd18ee6[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Mon Feb 6 18:58:34 2023 -0500

    [hive] Back to normal

[33mcommit 167d680ee86ce782d24761576b5bf88f4db651ed[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Mon Feb 6 18:55:04 2023 -0500

    [hive] WIP, wtf is happening

[33mcommit 282364c1f0d619910f781aeb645aa92937c79e34[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Mon Feb 6 07:55:58 2023 -0500

    [hive] Fix other tests than hive

[33mcommit 22d7abe4a8b4cc5ffc034c23a76f203119efa4a1[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat Feb 4 10:39:33 2023 -0500

    [trexo] Add image

[33mcommit 223dba1eeb6860e761233bcfedd5c0c327bb3f68[m
Merge: 703921a5b a78076462
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Feb 4 16:22:12 2023 +0100

    Merge branch 'develop' of https://github.com/EveryBoard/EveryBoard into trexo

[33mcommit 703921a5b59b86a028fd338323012615dcfe3350[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Feb 4 16:22:08 2023 +0100

    [Trexo] Fix Linter

[33mcommit a9ffb38be4a856e091e6f1eb1bf481dbb4794545[m
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat Feb 4 10:13:32 2023 -0500

    [hive] More review comments

[33mcommit f1b26eaf9de974beb1672dce4423d2312176f06a[m
Merge: e20a9f7b8 a78076462
Author: Quentin Stievenart <quentin.stievenart@gmail.com>
Date:   Sat Feb 4 09:03:09 2023 -0500

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into hive

[33mcommit e20a9f7b8508f7ccb199c8961c98cdeac9848459[m
Author: Quentin Stievenart <quentin@dhcp-172-29-12-77>
Date:   Fri Feb 3 17:27:02 2023 +0000

    [hive] Review comments

[33mcommit 28b0da4a7a71df44d9bcabb2ce40033c8b4ed908[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Feb 2 20:54:46 2023 +0100

    [Trexo] 3D/2D move choosable now

[33mcommit 8887ec0ea5dbc9aa06f16e028796838ec6d9d918[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Feb 1 20:08:34 2023 +0100

    [Trexo] Work in Progress; Fixing Tests

[33mcommit a78076462b74c21304b9a823363501853a30f3b4[m
Merge: d8a5eddf6 b114ce197
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Tue Jan 31 19:44:28 2023 +0100

    Merge pull request #85 from EveryBoard/serve-debug
    
    [serve-debug] npm start should serve in debug mode, so should netlify deployment

[33mcommit d8a5eddf6fb5b8fc934cb1f91b7283200fefc452[m
Merge: 3fb4583fe 02b969147
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Mon Jan 30 19:44:25 2023 +0100

    Merge pull request #84 from EveryBoard/twitter
    
    [twitter] Update twitter URL

[33mcommit a9bf87f1f3851d6861c5a17fcbe52b799c98f5be[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jan 28 15:10:45 2023 -0500

    [hive] Change behaviour of beetle to match actual rules

[33mcommit 982fe49a5c3e04b0f50d273939393f3a9ce56b60[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Jan 25 18:34:34 2023 -0500

    [tuto-orientation] Update tuto translations

[33mcommit 30fba3154b4ff64c0f4f44b9a594ace7437299ac[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jan 24 20:00:26 2023 -0500

    [tuto-orientation] Tutorial improvements

[33mcommit b114ce197fd49e2b6432e5eff9c21fe2601b9d9a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jan 24 08:59:26 2023 -0500

    [serve-debug] npm start should serve in debug mode, so should netlify deployment

[33mcommit 4a385e5b2b103fe98f33b9d943ca7cb861bf9e67[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jan 24 07:41:03 2023 -0500

    [hive] Add more tests and improve viewbox

[33mcommit 5fe64323c319c52a3e9e572b031a2ea1954b4fa7[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jan 24 07:20:37 2023 -0500

    [hive] Improve last move and allow deselecting remaining piece

[33mcommit d0a344c7e12d9f2fed59796a02398848cf94b751[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jan 22 16:57:40 2023 -0500

    [lasca] Minor fixes in translations

[33mcommit 1ba433fe69ba738f5dba4888716074daa88f9619[m
Merge: 528f4dbb4 d857232e2
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jan 22 10:45:10 2023 -0500

    Merge branch 'Lasca' of github.com:EveryBoard/EveryBoard into Lasca

[33mcommit 528f4dbb4d2a6a7eaceb1e9d462fd6e15bcab8f4[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jan 22 10:44:19 2023 -0500

    [lasca] Update id

[33mcommit 56f6b5331474020c7edbd38d62353d7650e9b607[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jan 22 10:05:42 2023 -0500

    [hive] Fix move encoder for specific spider bug

[33mcommit 5150b01c51497cacb4ca3bab57842cb41e715120[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jan 22 09:29:12 2023 -0500

    [hive] Show last move and improve strokes

[33mcommit 118e8b767cd52b413ce9dee6860bd9f37d6d8154[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jan 21 16:39:34 2023 -0500

    [hive] Enable piece deselection when clicking a second time on it

[33mcommit 06c2832bcb6388b6fd08cc094fccb69f48430f6e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jan 21 16:34:26 2023 -0500

    [hive] Add more stroke to the pieces

[33mcommit 7ee363ccd93733548b1154a77be6a090f46cdfe2[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jan 21 16:25:34 2023 -0500

    [hive] Fix spider move visuals

[33mcommit fda884291cef6255c9f0bc427a4a0460c24fae03[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jan 21 08:56:31 2023 -0500

    [hive] Move piece behaviour outside of pieces

[33mcommit 02b969147f8c5094e989609814f3fa798e6eda53[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jan 20 08:36:54 2023 -0500

    [twitter] Update twitter URL

[33mcommit 1c803f989ed7c15b6c3a846ccf32f323a98fd34a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jan 17 08:00:53 2023 -0500

    [hive] Fix grasshopper move

[33mcommit 4301831fc5767643caf85a26c258ff26a6e430a8[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jan 17 07:54:21 2023 -0500

    [hive] Translations and linter

[33mcommit c051909bf7b3753e292b6690b58376a1096f3334[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Jan 16 07:51:53 2023 -0500

    [hive] Add images

[33mcommit a796e3686de0a4d0657b6ce900e82ae9d3286c1a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Jan 16 07:39:02 2023 -0500

    [hive] Get full coverage

[33mcommit d857232e29f4928a4e8970b8c2e9be01ed060b42[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Jan 16 07:11:26 2023 +0100

    [Lasca] Answered Pull Request Comment

[33mcommit 303954b417385772a90d76d357d316c9e9a02700[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jan 15 20:55:56 2023 -0500

    [hive] Fix sliding rule

[33mcommit eaec63c630fc9cfe1075453fe5a4abaca7585c22[m[33m ([m[1;31morigin/hive[m[33m)[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Jan 12 08:47:00 2023 -0500

    [hive] Allow player to pass when needed

[33mcommit 6d642fe8170e3e1449c6604d2c7f61bd4ad2e5ab[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Jan 12 08:06:25 2023 -0500

    [hive] Hive and Six component refactor

[33mcommit c91bf9e987e08483cd96ff80ddc14aacad9ff1b2[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jan 10 20:12:12 2023 -0500

    [hive] Fix tuto

[33mcommit 2b2ea807d9fff1a9a76bd846bf23ee9a68df87bd[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jan 10 08:42:41 2023 -0500

    [hive] Refactor moves

[33mcommit d09664d0dd23107424097a055895b5f49b00b97f[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Jan 10 19:56:17 2023 +0100

    [Trexo] Enhance design

[33mcommit 9ebf322f36c55b54c58780cd45aa2a1f1f094c5e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Jan 9 20:17:19 2023 -0500

    [hive] Minor fix on stack inspection

[33mcommit 646d06e43ba9c6c31ab86c18380f8192a608edd6[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jan 8 19:51:37 2023 -0500

    [hive] Tutorial

[33mcommit 096c9dee63017e3aceb4b4c2c75ceab94770c056[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jan 6 08:26:35 2023 -0500

    [hive] Cover more and start tuto

[33mcommit 58654d68d3fc72f80dfc66bdb314ed23f7771a78[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jan 6 07:20:44 2023 -0500

    [hive] Fix encoding, finish minimax

[33mcommit 7007f97fbbee2a16d2c406ed82cf9bddad4b771b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Jan 5 07:16:09 2023 -0500

    [hive] Fix Sxi

[33mcommit d5b0fcfbbc847ba125e7ea20f3aee8ca05daacdb[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Jan 2 16:38:07 2023 -0500

    [hive] Fix most broken test, tutorial and refactor remains

[33mcommit 73951f557f4b90918292c32d6ce3f92854267fa3[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Jan 2 14:10:31 2023 -0500

    [hive] Add ability to inspect stacks of pieces

[33mcommit 609663ad3aeb81f730e9a4f64049922b195cf64a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Jan 2 13:29:28 2023 -0500

    [hive] Bugfix: cannot drop next to opponent, not ours

[33mcommit abb5b3a6d0a1130b941db74588d66db8fbc9487b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Jan 2 13:08:26 2023 -0500

    [hive] Improve hive-piece view

[33mcommit 4d082c60e538f2c6cdd5fd32d21255aa55eee648[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Jan 2 10:05:44 2023 -0500

    [hive] Forbidden to drop next to a *stack containing an opponent piece*

[33mcommit 253c56d1048e9ac263b624d550f489a2b9076435[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Jan 2 10:01:02 2023 -0500

    [hive] Show spider move indicators

[33mcommit 1da122cecfd879cf150b8d2a4b03b232698c2ca7[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jan 1 15:33:49 2023 -0500

    [hive] Fix spider moves in component

[33mcommit 477cc70ad496aaf17e8e654aaaa71ea63132eb4f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jan 1 14:41:02 2023 -0500

    [hive] Adapt queen bee location on state update

[33mcommit 2a792aab1308d3a81cc9ba0c8231ccf3f91c9950[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jan 1 10:47:53 2023 -0500

    [hive] Don't accept selecting something else when queen bee must be selected

[33mcommit ce79816ff6d8f1363a00f67ac311abcb46770858[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jan 1 09:57:39 2023 -0500

    [hive] Fix disconnection check

[33mcommit 7a84982b01e8163fca47e607542f5213c5a34ee5[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Dec 31 20:46:25 2022 -0500

    [hive] Show indicators for moves

[33mcommit 5c7a2893c8e6598410d37ec2d2bffd213e3b0584[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Dec 31 20:10:25 2022 -0500

    [hive] Show selected piece on board

[33mcommit f28af2d853a2543fc4acd8af232cf89755cc0b45[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Dec 31 19:38:47 2022 -0500

    [hive] Complete drop tests

[33mcommit eff1d27d9e0197002b3642249f00a4063517d57e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Dec 31 19:14:39 2022 -0500

    [hive] Fix first turns possible drops

[33mcommit 785248a6282ce27af6729621d74586704fc07bc1[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Dec 31 17:45:23 2022 -0500

    [hive] Show possible drop locations

[33mcommit 273785038ac2d423b5a1db04c9bfe206c8406d71[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Dec 31 17:31:18 2022 -0500

    [hive] Fix remaining piece highlight

[33mcommit f48c910f5ed5afcb76000c941e1517e15b5c9810[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Dec 31 15:46:04 2022 -0500

    [hive] Improve remaining piece placements and viewbox

[33mcommit c661b50430f4929be2b3ed0d85a17009d201681b[m
Merge: ddee71114 041631db8
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Dec 31 02:31:29 2022 +0100

    Merge branch 'Lasca' of https://github.com/EveryBoard/EveryBoard into Lasca

[33mcommit ddee711140a875f9a6b4e203c945a387c2ef0de9[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Dec 31 02:31:07 2022 +0100

    [Lasca] Pull Request Comment and Fix

[33mcommit d7876a4aad19ee231cd81fd693d9d7567b8b81ba[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 30 12:57:32 2022 -0500

    [hive] Fix rules: queen bee can be dropped when it must

[33mcommit dc8270c5203abd5bce51c6bb6ad4828e17cac3ef[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 29 19:27:40 2022 -0500

    [hive] Fix selected highlight

[33mcommit db08ff2c29bd3eb1a45928bcacb199bde09e2b12[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 29 19:08:32 2022 -0500

    [hive] Improve visuals

[33mcommit df48eb696056977ebe52f109df5db27855024634[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 29 18:32:58 2022 -0500

    [hive] Introduce isometric view

[33mcommit 8e570445d6d5ca1dfd3ccc64bb0a4c8d87c59825[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 29 07:40:41 2022 -0500

    [hive] Fix move computation for spider and ant

[33mcommit 3a45adaf8f7af5707a6ccdaa46c5229557f695df[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 29 07:07:49 2022 -0500

    [hive] Write component tests

[33mcommit 041631db803157af80af90a97013acefadc40057[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 23 07:09:47 2022 -0500

    [lasca] Update images

[33mcommit a6a35e3cb93e049d1d3cd4b65ef2bf0f27beb7ef[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 22 21:40:31 2022 -0500

    [hive] Progress on component, forbid to drop opponent's pieces

[33mcommit 8c20fbdf5cc3cdf7300576b187dac476827d4294[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 21 20:34:14 2022 -0500

    [hive] WIP

[33mcommit 1ce11a037525d7f19454a10e32c9703eab836086[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Dec 21 19:18:26 2022 +0100

    [Trexo] Game Component test work; design ongoing

[33mcommit e4f96de7e50128a579c70388ad86736638b2fbc3[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Dec 20 17:17:43 2022 +0100

    [lasca] removed fdescribe

[33mcommit 67d8af0f899b73c61a2640a619e9a4a432918929[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Dec 20 17:17:01 2022 +0100

    [Lasca] pull request comment

[33mcommit 40da30ad8a3128c3d01ecf443d3ce8d6d9701934[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Dec 16 22:38:24 2022 +0100

    [Trexo] work in progress

[33mcommit 02d3185eff88e7846f0166b39038b9a3c6de77ab[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Dec 16 19:22:36 2022 +0100

    wip

[33mcommit 76f6bdb88bfc3e21760ce096c7fbb4b5cab5fd31[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Dec 13 14:11:11 2022 +0100

    [hive] Draft hive pieces and rules

[33mcommit 3fb4583fe08367465994ca976c43139b47164611[m
Merge: 430be9bc1 53e8e8865
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Mon Dec 12 07:21:40 2022 +0100

    Merge pull request #77 from EveryBoard/e2e
    
    [e2e] e2e testing script

[33mcommit 202affeed5a143620eced469f742d88e93041329[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Dec 11 16:04:37 2022 +0100

    [Lasca] Fixed translation

[33mcommit cb4b0fc2fbf58cd51ffe3bf623e1f1d432cff785[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Dec 11 15:59:39 2022 +0100

    [Lasca] re-included dao and removed console logs

[33mcommit 1ca0037c15635dca71b029ace680d458c9d3fab2[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Dec 10 10:58:30 2022 +0100

    [Lasca] answer review comment; fix coverage; fix translation

[33mcommit 780c8f6073f0b2ca404d3e60fb517955d73ddc59[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Nov 27 21:33:23 2022 +0100

    [Trexo] implementing rules

[33mcommit 71fd6c508402b4a75a7085cd3deb2e01332d0b8a[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Nov 24 20:38:25 2022 +0100

    [lasca] tutorial in progress

[33mcommit 08c8522797e0793cd857d736177547e69b8ede9f[m[33m ([m[1;31morigin/tuto-orientation[m[33m)[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Nov 24 07:26:37 2022 +0100

    [tuto-orientation] Fix typo

[33mcommit 4cae042a045a72881c6c5501cb792f0f6c1ec3e6[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Nov 21 22:16:05 2022 +0100

    [lasca] Almost finished UX, added a better version of the Minimax

[33mcommit 53e8e886555d149ebe02be6d119ba081604d8380[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Nov 19 22:59:42 2022 +0100

    [e2e] Try to fix script for CI

[33mcommit d7e7f84950da4bc14a1b66d30475737a917cfff2[m
Merge: d0c23be6f 430be9bc1
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Nov 19 22:04:48 2022 +0100

    [lasca] pulled develop and fix conflict and fix ogwc error

[33mcommit d0c23be6f8eb077412d39db7680cfe93447399a9[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Nov 19 21:28:43 2022 +0100

    [lasca] should be playable locally and online, work in progress

[33mcommit 354c0275b67ce1c1366cd0631122d5424f2b1e21[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Nov 19 11:11:59 2022 +0100

    [e2e] Wait for player turn before playing online

[33mcommit 8ae7d67c960fcc7ef548c72560728202ca4d28d1[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Nov 19 07:55:34 2022 +0100

    [e2e] Improve launch-and-watch

[33mcommit 0c09e3c1377856d37a27db042048f51666faa852[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Nov 18 14:48:52 2022 +0100

    [e2e] Really finalize e2e.py

[33mcommit e8172bc7b2b6b54cb9fd8f38264a96fa7bcb905a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Nov 18 13:55:20 2022 +0100

    Revert "[e2e] Finalize python script"
    
    This reverts commit 0d5d65a80f1b16bf246f3e77fb422fbc33ee0f10.

[33mcommit 39c938e14dc06b9c11d1bf27e7de9e1bb236cb6d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Nov 18 09:50:43 2022 +0100

    [tuto-orientation] Fix tutorial orientation

[33mcommit 0d5d65a80f1b16bf246f3e77fb422fbc33ee0f10[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Nov 18 07:53:12 2022 +0100

    [e2e] Finalize python script

[33mcommit d014f7696f22a41279b75f9f7422d6d205150734[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Nov 17 23:46:45 2022 +0100

    [e2e] launch-and-watch should also match 127.0.0.1

[33mcommit fb30121aa231646311fb94409f32cd3c8758f9a8[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Nov 17 20:40:23 2022 +0100

    [e2e] Try to fix launch-and-watch

[33mcommit 6d349b388c5e1915561ea7afad615d67ce6e8d30[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Nov 17 20:05:49 2022 +0100

    [e2e] More debug

[33mcommit 96386a23cf18159d33c1e696e41d51d167b0b131[m
Merge: ab41f0801 430be9bc1
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Thu Nov 17 16:48:51 2022 +0100

    Merge pull request #79 from EveryBoard/develop
    
    EveryBoard Master 8

[33mcommit 430be9bc12d740257bc03229bdc2019af6d399c2[m
Merge: e42d85700 ec41e6ea9
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Thu Nov 17 15:51:22 2022 +0100

    Merge pull request #51 from EveryBoard/security-take-back-bug
    
    [security-take-back-bug] Disable some security rules to avoid expression limit

[33mcommit 8a5c5b509d713dd738824a8020379a388ac98ff3[m
Merge: 3eb2101f9 e42d85700
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Nov 17 15:05:54 2022 +0100

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into e2e

[33mcommit 3eb2101f91242334b3f784e359ff0ff36e047e55[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Nov 17 15:05:33 2022 +0100

    [e2e] Debug e2e script in CI

[33mcommit e42d8570047734a5ae859cfe92ff7e5d3991dfc9[m
Merge: 434d9d5ef 4b83d1844
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Nov 17 15:04:13 2022 +0100

    Merge pull request #76 from EveryBoard/SetObserverPartRoleFix

[33mcommit 4b83d184409e31a7cf353916aabefac2b800e06e[m[33m ([m[1;31morigin/SetObserverPartRoleFix[m[33m)[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Nov 17 14:48:23 2022 +0100

    [set-observed-part-role-fix] fix linter

[33mcommit 6b230e164df0655a781ff4b00e2b868097477a2b[m
Merge: a3fa607e9 3b00ea051
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Nov 17 13:31:54 2022 +0100

    Merge branch 'SetObserverPartRoleFix' of https://github.com/EveryBoard/EveryBoard into SetObserverPartRoleFix

[33mcommit a3fa607e9088aa683d9561bc7ea5797b445f262d[m
Merge: 008e1df9b 434d9d5ef
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Nov 17 13:31:35 2022 +0100

    [set-observed-part-role-fix] pulled develop and fixed conflict

[33mcommit 008e1df9bc82c051acb627ecdb8dae52521cf253[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Nov 17 13:30:16 2022 +0100

    [set-observed-part-role-fix] fix coverage and enhance tests

[33mcommit ec41e6ea99d010adff280b73cdf437269710841d[m
Merge: d09db0cf6 434d9d5ef
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Nov 17 12:41:59 2022 +0100

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into security-take-back-bug

[33mcommit 5b7489b5ce278a2562f49e8fdc01813b83b0a535[m
Merge: 84b572d88 434d9d5ef
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Nov 17 12:33:11 2022 +0100

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into e2e

[33mcommit 84b572d8856644dee48172e160f50a719206bd61[m
Merge: b12df268c 0f53852d8
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Nov 17 12:28:48 2022 +0100

    Merge branch 'e2e' of github.com:EveryBoard/EveryBoard into e2e

[33mcommit b12df268c731ba3d4de7be6a70649ac1450b5318[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Nov 17 12:28:03 2022 +0100

    [e2e] Fix headless e2e tests

[33mcommit 434d9d5ef5562d76fb6a8c19254fab65aac3c293[m
Merge: 34f6f0c1a cac5c728d
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Thu Nov 17 12:24:31 2022 +0100

    Merge pull request #66 from EveryBoard/demo-page
    
    Demo page

[33mcommit cac5c728da7c702f44617e39f4db0575896a12ba[m
Merge: 363aa0813 34f6f0c1a
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Nov 17 11:47:06 2022 +0100

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into demo-page

[33mcommit 34f6f0c1af3d85a1757a040a74ba1918dacd3ad0[m
Merge: 030728462 ad0c5b3ee
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Thu Nov 17 11:33:28 2022 +0100

    Merge pull request #49 from EveryBoard/update-09-2022
    
    Update all dependencies, including angular to v14

[33mcommit 363aa08135d1855733c68853cfffe5509716bf4a[m
Merge: da863c971 030728462
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Nov 17 11:28:17 2022 +0100

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into demo-page

[33mcommit 0307284623d360cf5f44c45f0b2e9d479a501fdd[m
Merge: 1f935f20e f2849542a
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Nov 17 10:50:42 2022 +0100

    Merge pull request #75 from EveryBoard/EndGameIndicationEnhancement

[33mcommit ad0c5b3eefd8b807cef5ccb392379fe03f21795d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Nov 17 10:48:59 2022 +0100

    [update-09-2022] Update coverage properly

[33mcommit da863c971dfe2f2548ec6ebc6ad0b18f63616bfc[m
Merge: c90674032 1f935f20e
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Nov 17 10:33:05 2022 +0100

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into demo-page

[33mcommit f2849542a16e8358573a11378f79476153f334e3[m[33m ([m[1;31morigin/EndGameIndicationEnhancement[m[33m)[m
Merge: 15b9d398f 1f935f20e
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Nov 17 10:25:28 2022 +0100

    [end-game-indication-enhancement] pulled develop and updated translation

[33mcommit 1f935f20e48c8652bf2ade34d8847151bedb8140[m
Merge: c976f6215 5d5af4afc
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Nov 17 10:16:55 2022 +0100

    Merge pull request #78 from EveryBoard/PylosLandingDisplayFix

[33mcommit 15b9d398faf3d5c7536589787401be7e0f57200e[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Nov 17 09:20:27 2022 +0100

    [end-game-indication-enhancement] temporary coverage fix

[33mcommit 5d5af4afcd2900ffff71ef62ffa593347348eada[m[33m ([m[1;31morigin/PylosLandingDisplayFix[m[33m)[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Nov 17 09:13:21 2022 +0100

    [pylos-landing-display-fix] PR Comments

[33mcommit de5482399b0e27f6ec34162cef73b4688b065d44[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Nov 17 09:11:33 2022 +0100

    [update-09-2022] Fix linter

[33mcommit c09a5acaf3348bf1022e3ac75f40cbaaec4f4467[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Nov 17 09:06:46 2022 +0100

    [pylos-landing-display-fix] fixed translation

[33mcommit daacf5aa84e22c91e805e1d6e5f4ba5a8bb73f49[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Nov 17 08:59:49 2022 +0100

    [end-game-indication-enhancement] fix translation

[33mcommit c906740325f80aaa1c88f555463a5c6515c5be23[m
Merge: 08666b13c c976f6215
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Nov 17 08:59:16 2022 +0100

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into demo-page

[33mcommit 3464d068fb94b842eb04eafd2e80e7228936e510[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Nov 17 08:54:21 2022 +0100

    [update-09-2022] Fix online game wrapper

[33mcommit 70b3b7acb115b3d25d06048c2b632c1cf0c1574b[m
Merge: 308ede9dc c976f6215
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Nov 17 08:40:25 2022 +0100

    Merge branch 'develop' of https://github.com/EveryBoard/EveryBoard into EndGameIndicationEnhancement

[33mcommit 3b00ea0513542d5a3103adbd2b13f38695c43979[m
Merge: bf1370b10 c976f6215
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Nov 17 08:39:13 2022 +0100

    Merge branch 'develop' of https://github.com/EveryBoard/EveryBoard into SetObserverPartRoleFix

[33mcommit f83bc0e4e7f38ce6894663af77d048df0f7d9e77[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Nov 17 08:35:01 2022 +0100

    [pylos-landing-display-fix] fix coverage and linter

[33mcommit a5dd714522d448c1114b0504f680500ea3bc80ee[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Nov 17 08:29:37 2022 +0100

    wip

[33mcommit 0f53852d85c2f5ad439a5c57120297ba36ff5920[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Nov 16 23:08:13 2022 +0100

    [e2e] Use chrome and silence curl in e2e scripts

[33mcommit 3d4d6009edceab0b7733c43204c8889fda072af4[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Nov 16 20:45:30 2022 +0100

    [e2e] Disable setup-python cache

[33mcommit ae1438367e573e44ced19aca3bb9e0caa8630a9c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Nov 16 08:39:09 2022 +0100

    [e2e] Experiment with action

[33mcommit 8950cac8c120622d3057684c433d59e66ad73e31[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Nov 16 08:15:05 2022 +0100

    [e2e] More upgrades

[33mcommit 4ef5cae04efdaac3ea7773c6cab88a8031a3bd07[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Nov 16 08:12:20 2022 +0100

    [e2e] Add requests as a dependency for e2e tests

[33mcommit e551f8f332df0a609b4abbec0e4c47dc768d7c56[m
Merge: ba96421e6 c976f6215
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Nov 16 07:16:01 2022 +0100

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into update-09-2022

[33mcommit ba96421e6443fc33cd31d82a7b83699e0a385d3d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Nov 16 06:56:40 2022 +0100

    [update-09-2022] PR comments

[33mcommit 38a02adbb8f0188d4d17dc2bbf5b8963a0ec6e86[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Nov 16 06:43:17 2022 +0100

    [e2e] Fix tests broken due to renaming ids

[33mcommit c976f621584e96e753d543eaab956da69dabe4db[m
Merge: aff82e0c6 3f79b18f9
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Nov 15 22:21:18 2022 +0100

    Merge pull request #72 from EveryBoard/CurrentPlayerMustBeBelowFix

[33mcommit 3f79b18f9c51a0a356bd155e54553b29de083608[m[33m ([m[1;31morigin/CurrentPlayerMustBeBelowFix[m[33m)[m
Merge: c7d02a0dd aff82e0c6
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Nov 15 19:55:46 2022 +0100

    Merge branch 'develop' of https://github.com/EveryBoard/EveryBoard into CurrentPlayerMustBeBelowFix

[33mcommit f943dbbff8bb76991d324966f07cc9c3d1813cec[m
Merge: 68b949f94 aff82e0c6
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Nov 15 19:54:31 2022 +0100

    Merge branch 'develop' of https://github.com/EveryBoard/EveryBoard into PylosLandingDisplayFix

[33mcommit 9a88a8cde2fd195e841ab7961840c2c1fb3b5b97[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Nov 15 17:43:09 2022 +0100

    [e2e] Finalize e2e tests

[33mcommit aff82e0c634c7727ef0c0089c63fd46bec0b925d[m
Merge: 974951dcb dbf2e7186
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Nov 15 08:15:45 2022 +0100

    Merge pull request #74 from EveryBoard/AwaleMansoonFix

[33mcommit dbf2e71863bca98a1733172d840c76d65dc0d528[m[33m ([m[1;31morigin/AwaleMansoonFix[m[33m)[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Nov 13 16:13:47 2022 +0100

    [Awale-Mansoon-Fix] removed fdescribe

[33mcommit 68b949f942affeedb5da1d7e68c5e520d20fb3cf[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Nov 13 16:12:25 2022 +0100

    [Pylos-landing-display-fix] no longer display un-landable coord

[33mcommit 0c26ad512a730e221f1b20e734b9383abf296051[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Nov 13 13:09:35 2022 +0100

    [awale-mansoon-fix] partially change 'error log and throw' code test

[33mcommit 308ede9dc3da6f6ab878252657d31027222a063e[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Nov 12 18:17:33 2022 +0100

    [end-game-indication-enhancement] uniformise tense use in end game message

[33mcommit cb4da83d2daa51991534e07a6abd64ad11ef5558[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Nov 12 10:41:04 2022 +0100

    [e2e] New scenario: online game

[33mcommit f9a5440ab04ee981523851a70a1d222c1df633b5[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Nov 11 15:08:40 2022 +0100

    [awale-mansoon-fix] copied test of moved code for coverage

[33mcommit cfc80a5a2ebe01114ba1196f1a2b3d5d6ccdde30[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Nov 11 15:01:40 2022 +0100

    [end-game-indication-enhancement] remove console log

[33mcommit bf1370b108acac95ef263c5526adaa72fc650290[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Nov 10 20:51:29 2022 +0100

    [set-observed-part-role-fix] remove fdescribe

[33mcommit 86f6042658a18979b49938704c923e64417f9ce9[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Nov 10 20:46:27 2022 +0100

    [set-observed-part-role-fix] stopped using partial object for role update

[33mcommit 66bd311a4c2a3ad6593c1535e1a101e1d3632c2b[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Nov 9 21:23:23 2022 +0100

    [end-game-indication-enhancement] is done

[33mcommit e75e08b9a0a85ee96e732c0df9dcdadd753fc02e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Nov 9 08:13:46 2022 +0100

    [e2e] New scenario: play against AI

[33mcommit 9a5a63ba04d556fa91670dcd1b163dae7b25b92f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Nov 9 07:58:21 2022 +0100

    [e2e] Add simple and registered e2e scenarios

[33mcommit be2b1e78fa0d1a6249cdc76899b274558d26e9cd[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Nov 9 07:56:46 2022 +0100

    [e2e] Annotate some html elements for easier e2e testing

[33mcommit c7d02a0dd73b9d9abd21c987122cb7cb69e6351a[m
Merge: 8c93aa2cb e46cd8873
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Nov 8 19:53:12 2022 +0100

    Merge branch 'CurrentPlayerMustBeBelowFix' of https://github.com/EveryBoard/EveryBoard into CurrentPlayerMustBeBelowFix

[33mcommit 8c93aa2cbc1d8eb047dccce79e56decb283e5de5[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Nov 8 19:52:55 2022 +0100

    [current-player-must-be-below-fix] remove unused code

[33mcommit e0a58966a08d4bce54eb811ce02587b76eb118c4[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Nov 8 19:48:03 2022 +0100

    [awale-mansoon-fix] made assert test stable

[33mcommit 974951dcb8076e4e94b073b3dc664aa243e8332e[m
Merge: 11c1f9308 b7c6b70bd
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Nov 7 23:05:48 2022 +0100

    Merge pull request #73 from EveryBoard/AwaleMansoonFix

[33mcommit 11c1f930847e4e94c5a072d90dcf3b982fcedc30[m
Merge: 4c5675134 7d27a6ac2
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Nov 7 17:56:00 2022 +0100

    Merge pull request #70 from EveryBoard/FixMartianChessRotation

[33mcommit e46cd8873c4da4d28b5768a96ff7ef38e7b4bd9e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Nov 7 17:53:33 2022 +0100

    [current-player-must-be-below-fix] Update images

[33mcommit b7c6b70bdbf90a2dbdfe99bf1e78fceb25e024d4[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Nov 5 19:30:35 2022 +0100

    [awale-mansoon-fix] done

[33mcommit 4626ca0a9fe675c905a82022eb65cd9c09c1f342[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Nov 4 21:43:11 2022 +0100

    [current-player-must-be-below-fix] Enhanced Yinsh, Encapsule and MartianChess

[33mcommit 7d27a6ac21c70654695bce4d4cbd3d2ffd5ea5d3[m[33m ([m[1;31morigin/FixMartianChessRotation[m[33m)[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Nov 3 21:43:53 2022 +0100

    [fix-martian-chess-rotation] enhance martian chess rotation again; and PR Comment

[33mcommit 08666b13c84d055bb13ac0f5bb73dfc38ee1ecf8[m
Merge: 0b911284b 4c5675134
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Nov 3 11:08:40 2022 +0100

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into demo-page

[33mcommit 4c567513457864c2ddeb2a12f3399da6e558efda[m
Merge: ba1c02cbd 5f2dfb260
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Nov 2 22:11:55 2022 +0100

    Merge pull request #71 from EveryBoard/OnlyRotateRemainingPieceInPylos

[33mcommit ba1c02cbd85978e3ff5db3cb26e86a36306d853f[m
Merge: ecfbab09d de9cae0e4
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Nov 2 22:11:09 2022 +0100

    Merge pull request #38 from EveryBoard/MultitabManagement

[33mcommit de9cae0e495afb1045a6a7bbf84cb67655cab6e7[m[33m ([m[1;31morigin/MultitabManagement[m[33m)[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Nov 2 22:03:03 2022 +0100

    [Multitab-Management] remove fdescribe

[33mcommit 40bb73ab2195074260f8b9a5c80dde50b4550e0c[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Nov 2 21:59:18 2022 +0100

    [multitab-management] fixed count-down component's tests

[33mcommit 5f2dfb260b696b236a577769a0e9a429f0b08677[m[33m ([m[1;31morigin/OnlyRotateRemainingPieceInPylos[m[33m)[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Nov 2 21:29:13 2022 +0100

    [only-rotate-remaining-piece-in-pylos] done

[33mcommit f05062626e588c9010fd7bd40170ffcbf6f5f416[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Nov 2 21:20:10 2022 +0100

    [multitab-management] fixed TestUtils

[33mcommit 47850db53d3526a74b4ca7d85578ae346818f6e4[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Nov 2 21:18:41 2022 +0100

    [update-09-2022] Fix chat in online game

[33mcommit 0ba36e7b350cae5ed60d6c11686d5ecfbfc300ad[m
Merge: 5266afa81 ecfbab09d
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Nov 2 20:42:24 2022 +0100

    [multitab-manamgenet] pulled develop fix conflict and translation

[33mcommit e78e95a9b16255e02a26c9ce790e528cfe196858[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Nov 2 20:38:48 2022 +0100

    [update-09-2022] Update dependencies, once more

[33mcommit 47641efa057dd1b3dab3dd5faed6ad0a56a284ba[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Nov 2 20:29:50 2022 +0100

    [update-09-2022] PR comments

[33mcommit 5266afa812246117002036c6189b51d75f9ce6b1[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Nov 2 20:28:39 2022 +0100

    [multitab-management] small cleaning and live-pr-comment

[33mcommit cf9eaf01fdb5345853debcf1f8f55ed8307da9cc[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Nov 2 20:22:01 2022 +0100

    [Multitab-management] fix lasts tests and check coverage

[33mcommit 0b911284b5d2bea360a2a6c1b263c608cfcff5de[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Nov 2 19:45:56 2022 +0100

    [demo-page] Rename demo-card to demo-card-wrapper, fix lint errors

[33mcommit 73e4e53dd07332c48909072a1f261715020ff2f4[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Nov 1 22:54:17 2022 +0100

    [fix-martian-chess-rotation] done

[33mcommit 866529a9ebbb86e6cf49ac4a9d66b92ae2e5d709[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Nov 1 21:19:31 2022 +0100

    [multitab-management] fixed all tests but late-arrival tests

[33mcommit 6cdb0bb3ce0e3ac2405fddd682a1e34922e44a04[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Nov 1 12:32:12 2022 +0100

    [demo-page] PR comments

[33mcommit 693017836700cbece7aab3187e4919040af080de[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Nov 1 10:43:32 2022 +0100

    [demo-page] Final fixes

[33mcommit 9058df4b9dc964058be107c4a014ceeb300e062f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Nov 1 10:23:52 2022 +0100

    [demo-page] PR comments

[33mcommit ab41f08016ba6a48fcd5483621c1565083bd101e[m
Merge: 5a62f7308 ecfbab09d
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Fri Oct 28 22:06:56 2022 +0200

    Merge pull request #69 from EveryBoard/develop

[33mcommit 07419a84b210539befa8796679c99cf742b3c4c0[m
Merge: 1629d0f9b ecfbab09d
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Oct 28 19:40:46 2022 +0200

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into demo-page

[33mcommit 1629d0f9b9919676ab46a0399fbd7d53b797ea76[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Oct 28 19:37:20 2022 +0200

    [demo-page] Get all solutions in the demo page

[33mcommit ecfbab09daea487e4a547b7a94b784ae70ef9d54[m
Merge: b139d0e28 5c1dfe0fc
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Oct 28 18:57:12 2022 +0200

    Merge pull request #68 from EveryBoard/FixAwaleHighlights

[33mcommit 5c1dfe0fc8966fa47e30ba125cb37331ab9d33a7[m[33m ([m[1;31morigin/FixAwaleHighlights[m[33m)[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Oct 28 18:43:39 2022 +0200

    [fix-awale-highlights] fixed css class naming for diam too

[33mcommit b742aad10e36d0e9ad9a7446c829ebb2c03d7497[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Oct 28 18:39:17 2022 +0200

    [fix-awale-highlights] fixed css class naming

[33mcommit 33d3d51356a5bd295ad800ec7a262b6fe9016abd[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Oct 28 08:51:49 2022 +0200

    [demo-page] Fix awale tests

[33mcommit ad0f6b9033d9b1ef17046d19998230e32734903b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Oct 27 18:07:01 2022 +0200

    [demo-page] Fix linter

[33mcommit 1338452f9d5df613676aae017d41afd8ee02b750[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Oct 27 17:49:27 2022 +0200

    [demo-page] Fix obvious visual problems

[33mcommit 9263a491c33587035f25957e0c610384a7b48fcf[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Oct 27 17:32:47 2022 +0200

    [demo-page] Fix tests and improve firefox view

[33mcommit 5e29e8fd1f8a444117b0dddda3989920a2361c79[m
Merge: c5d59c8a1 b139d0e28
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Oct 27 09:53:24 2022 +0200

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into demo-page

[33mcommit d09db0cf6c752cc01c9ed2875ee99cdb5676a78d[m
Merge: 5a85379d8 b139d0e28
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Oct 27 09:49:27 2022 +0200

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into security-take-back-bug

[33mcommit c5d59c8a10cbba98b88b188ecc68870e439d3588[m
Merge: 50e418cee 22f0b6e06
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Oct 27 09:48:36 2022 +0200

    [demo-page] MinimaxTesting is now dead, long live MinimaxTesting

[33mcommit b139d0e282b6d0f92f2a574b5947190a1bb4f1de[m
Merge: 2566fe84a 1c21265fd
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Oct 26 09:51:31 2022 +0200

    Merge pull request #65 from EveryBoard/AwaleEnhancement

[33mcommit 0b8fcb3f8903eea23fc0f9eb703c9adb5842097a[m
Merge: 8e12c3ac2 2566fe84a
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Oct 25 21:30:02 2022 +0200

    [multitab-management] pulled develop and fixed conflict

[33mcommit 1c21265fdb3fa25a6c16433ee05bc0ac225a678c[m[33m ([m[1;31morigin/AwaleEnhancement[m[33m)[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Oct 25 20:00:07 2022 +0200

    [Awale-enhancement] fixed tutorial

[33mcommit ba1b585e0fdaecd92a53881b654d58161cab2118[m
Merge: e4ca4c4af 2566fe84a
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Oct 25 19:39:19 2022 +0200

    [awale-enhancement] pull develop and fixed conflict

[33mcommit 2566fe84a9478cb9a84040158932c6ce47e061d6[m
Merge: 204765a10 5e82b460e
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Tue Oct 25 19:24:38 2022 +0200

    Merge pull request #52 from EveryBoard/siam-improvements

[33mcommit 50e418cee453a3b4064134b25a4b8487e3685ce2[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Oct 25 08:21:03 2022 +0200

    [demo-page] Use tutorials to have demo nodes automatically

[33mcommit 22f0b6e06c397644065aedf8d19b061341a00365[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Oct 25 08:21:03 2022 +0200

    [demo-page] Uso tutorials to have demo nodes

[33mcommit 5e82b460e1ad7b20abac5e25d1b470d2f9eb22d5[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Oct 24 23:18:23 2022 +0200

    [siam-improvements] Update translations

[33mcommit ae2bf11bb2aa0abfd5987f8fe8f544f88c3af2e4[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Oct 24 22:52:24 2022 +0200

    [siam-improvements] Fix translations and linter

[33mcommit e4ca4c4af5d77af8d9f9872b44af3673052a47e9[m
Merge: e16cf1537 204765a10
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Oct 24 21:05:31 2022 +0200

    [awale-enhancement] pulled develop, fix conflict, and enhance tutorial

[33mcommit 8e12c3ac25fc0050e834e619025b1aa54fb85193[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Oct 24 19:36:45 2022 +0200

    wip

[33mcommit da758f5e865a98da3dc4cf253fdfdbc3ca870e8b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Oct 24 18:47:28 2022 +0200

    [siam-improvements] Update translations

[33mcommit f499251589482ba8c0038a8ac2c2063b0090c2a0[m
Merge: befed03e9 204765a10
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Oct 24 18:13:06 2022 +0200

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into siam-improvements

[33mcommit befed03e9fc4797a36e66ba10ebed02e5636ae6a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Oct 24 18:04:37 2022 +0200

    [siam-improvements] PR comments

[33mcommit 57fcd77b740494f60d8cfcc1a95f42a6fed5ffd1[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Oct 23 16:39:31 2022 +0200

    [demo-page] Write tests and add more examples

[33mcommit 204765a10c06086fd809415e6d34e5654a25c9b7[m
Merge: e9baa648f e529db7cb
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Oct 23 15:35:34 2022 +0200

    Merge pull request #67 from EveryBoard/MakePylosCrossClickable
    
    Make pylos cross clickable and rename "case" in "space" (where wanted)

[33mcommit e16cf15374e84ff8bb94e5e2cc2b04b369de213f[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Oct 23 12:32:43 2022 +0200

    [Awale-enhancement] text and translation enhancement

[33mcommit a36864292089b6cd54878cc6d7f5116cc610262e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Oct 23 12:00:49 2022 +0200

    [siam-improvements] Update tutorial

[33mcommit e529db7cbef4a7ddb455297908236858908d084b[m[33m ([m[1;31morigin/MakePylosCrossClickable[m[33m)[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Oct 22 17:57:46 2022 +0200

    [make-pylos-cross-clickable] made pylos cross clickable and stopped using 'case' to say 'space'

[33mcommit 08316c062d50391414a8405059eb5a16c3de321c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Oct 22 17:15:20 2022 +0200

    [demo-page] Allow changing number of columns on demo page

[33mcommit 9dd181d25bb04e4cc5644d0d89c02360eed068bb[m
Merge: 836f8dd77 e9baa648f
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Oct 22 17:02:31 2022 +0200

    [Awale-Enhancement] pull develop and fixed conflicts

[33mcommit 836f8dd77aeac0d7d1c2179ca279a0bc0ccd4882[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Oct 22 13:49:20 2022 +0200

    [Awale-Enhancement] is done

[33mcommit f113a3b3dc3203df80a383ed81478be157531f81[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Oct 20 19:26:14 2022 +0200

    [siam-improvements] Fix tests

[33mcommit 6081e2284d4a041f2dc8d79626d859c4edd50a74[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Oct 20 19:19:26 2022 +0200

    [siam-improvements] Fix syntax

[33mcommit c08322e160c213c84f2380c99905c6919cdbb7ee[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Oct 20 11:47:59 2022 +0200

    [demo-page] First working draft of demo page

[33mcommit 01a6e6ff2200d59c04c9d383087c7675d17060e4[m
Merge: e5946b402 e9baa648f
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Oct 20 14:59:23 2022 +0200

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into siam-improvements

[33mcommit e5946b40217f8c430844b815b289c4522ff1b074[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Oct 20 09:02:03 2022 +0200

    [siam-improvements] PR comments

[33mcommit 0f0a6dbf1349df13c54c8cf9e01fca5838c0d908[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Oct 20 08:36:50 2022 +0200

    [demo-page] Get rid of game-includer component

[33mcommit e9baa648f34756058b5d63d39090da94014faec6[m
Merge: fa87fdbcb 5332f4a20
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Thu Oct 20 08:11:55 2022 +0200

    Merge pull request #63 from EveryBoard/boardvalue-rename

[33mcommit fa87fdbcbd1fa13e097cb06471e858e2d54b0883[m
Merge: 48b838e87 4ec2ecfdd
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Thu Oct 20 07:31:22 2022 +0200

    Merge pull request #64 from EveryBoard/six-minimax-coverage

[33mcommit b8fcd11d34e2bb69fe2474bf7885448a7518fb92[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Oct 19 16:03:28 2022 +0200

    [update-09-2022] Regenerate coverage

[33mcommit 3bb07c8340baffa034160157e5b556a2fb485509[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Oct 19 15:47:45 2022 +0200

    [update-09-2022] Update all dependencies again

[33mcommit 1ed62378c30bbb0089bfd166c8685bd434b00834[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Oct 19 15:36:51 2022 +0200

    [update-09-2022] Type form controls and groups

[33mcommit f45bff0a7d06d2b7b4e9aa4e3787a26e30693bf0[m
Merge: 32fff3f95 48b838e87
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Oct 19 15:36:43 2022 +0200

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into update-09-2022

[33mcommit 6d6e2ea06996ea3faee416f1681c5ccf6f70d524[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Oct 19 13:24:30 2022 +0200

    [siam-improvements] Update images and translations

[33mcommit cbd817b640647eafe65c79bf0c4f79dec36d4463[m
Merge: 5ccafdc8f 48b838e87
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Oct 19 13:20:49 2022 +0200

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into siam-improvements

[33mcommit 4ec2ecfdd8606299b8042610dff17d5da92fd30a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Oct 18 17:31:57 2022 +0200

    [six-minimax-coverage] Fully cover SixMinimax

[33mcommit 9f47f66f55ce7e8840fa10caf1eb3f1065598ccb[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Oct 17 18:47:16 2022 +0200

    wip

[33mcommit 5332f4a2060b9f0b3c270e34eeb65a56a2ab294a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Oct 17 16:44:46 2022 +0200

    [boardvalue-rename] Rename NodeUnheritance into BoardValue

[33mcommit 48b838e87b15695234c2277f4e34186c3d03307d[m
Merge: 4c03eb34d 0c6534057
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Mon Oct 17 08:29:36 2022 +0200

    Merge pull request #60 from EveryBoard/abalone-minimax-cover

[33mcommit 4c03eb34d1e71167d48963fe93d13f845daf3fa0[m
Merge: 25e67f705 9b706d9e2
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Mon Oct 17 08:28:08 2022 +0200

    Merge pull request #61 from EveryBoard/apagos-coverage

[33mcommit 25e67f70548ad003344f900bc499ff9591e499b6[m
Merge: 7c5447679 5b659cfd9
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Oct 17 08:02:19 2022 +0200

    Merge pull request #59 from EveryBoard/PylosEnhancement

[33mcommit 9b706d9e284f64150e301a397b48c69f0431f286[m
Merge: ad5bcd5b2 7c5447679
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Oct 17 07:59:16 2022 +0200

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into apagos-coverage

[33mcommit ad5bcd5b2d7f6caf7c4ec7eb2c8fb6188b35e65e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Oct 17 07:58:47 2022 +0200

    [apagos-coverage] PR comment

[33mcommit 0c653405742ce5d44a9f1d56ba30bda1cb614914[m
Merge: d2dbc753d 7c5447679
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Oct 17 07:56:02 2022 +0200

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into abalone-minimax-cover

[33mcommit 5b659cfd9a37a89368b438b2822b4735dfb09129[m[33m ([m[1;31morigin/PylosEnhancement[m[33m)[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Oct 17 07:37:52 2022 +0200

    [pylos-enhancement] remove xdescribe

[33mcommit cd7435989e9e8dc1bae677d86c0b7a1c879b6d1b[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Oct 17 07:35:22 2022 +0200

    [pylos-enhancement]  fix pylos conflicting test; translation; coverage

[33mcommit 4a1cad0d68078232583314192fef3024f81b8ae3[m
Merge: 41bdabc7f 7c5447679
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Oct 16 22:29:34 2022 +0200

    [pylos-enhancement] pull develop and fixed conflict

[33mcommit 41bdabc7f3e296afe15608660fcd5c914a0ec989[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Oct 16 21:53:16 2022 +0200

    [pylos-enhancement] fix translation in french

[33mcommit 5ccafdc8f344c813548c63fd930cd9e4add74674[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Oct 16 21:32:06 2022 +0200

    [siam-improvements] PR comments

[33mcommit 7c54476798b01675592e49e345c0c555e67062f2[m
Merge: 16009bb9e 5a9f33601
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Oct 16 21:23:31 2022 +0200

    Merge pull request #53 from EveryBoard/ChangingSelectedPieceUXRefactor

[33mcommit d2dbc753d89c00b3b116231037138f4017b4963f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Oct 16 21:09:55 2022 +0200

    [abalone-minimax-cover] Fix GWT in abalone dummy minimax

[33mcommit 46c39c5e1423022d889371f8e6017a2e3f62da11[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Oct 16 21:07:51 2022 +0200

    [apagos-coverage] Simplify and reformulate test

[33mcommit 5a9f3360110480a9ccee22b838f4aefcfe18957a[m[33m ([m[1;31morigin/ChangingSelectedPieceUXRefactor[m[33m)[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Oct 16 21:03:19 2022 +0200

    [changing-selected-piece-ux-refactor] fix translations

[33mcommit 42f7ae34c57ff3b5dde54da73b773c09994596bb[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Oct 16 20:57:54 2022 +0200

    [pylos-enhancement] PR Comments

[33mcommit 70f0bcb1eb0287d9a1d9b76a043f49061604f97b[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Oct 15 21:47:10 2022 +0200

    [Multitab-management] pr comments

[33mcommit d1f8aac1f1309dc5f06b3f9a6b797a6aa2979332[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Oct 15 19:02:23 2022 +0200

    [Pylos-enhancement] fixed translation and answered PR Comments

[33mcommit 9f4da6619ffc479f560dbbfe0b9f404eb2fe177d[m
Merge: 09c704478 16009bb9e
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Oct 15 18:21:31 2022 +0200

    [PylosEnhancement] pulled develop and fixed conflict

[33mcommit d5a28b34a915f4dfb65af2190282f26e5eb953fb[m
Merge: 25ae04a13 519a5ef37
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Oct 15 17:46:55 2022 +0200

    Merge branch 'ChangingSelectedPieceUXRefactor' of https://github.com/EveryBoard/EveryBoard into ChangingSelectedPieceUXRefactor

[33mcommit 25ae04a13b314ebeac60fa624fcc86ce0cf40467[m
Merge: 6f520c11b 16009bb9e
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Oct 15 17:14:34 2022 +0200

    [ChangingSelectedPieceUXRefactor] pulled develop and fixed conflict

[33mcommit 70f20da39f6f0d4b94009466c96596b1f1e228b5[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Oct 15 07:16:05 2022 +0200

    [apagos-coverage] Improve coverage of Apagos minimax

[33mcommit d3903aeb34bee9ce04f7ea8e35a81f384d7d71f6[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Oct 14 22:44:36 2022 +0200

    [abalone-minimax-cover] Fully cover abalone minimax in tests

[33mcommit 235502f448c7de349b76f876f5cc2bc95a8b941b[m
Merge: 351e4abae 16009bb9e
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Oct 14 22:07:33 2022 +0200

    [MultitabManagement] pulled develop and fix conflict; wip

[33mcommit 6f520c11bf62712ab142faa15e7713ab2bf0c9b0[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Oct 14 21:17:00 2022 +0200

    wip

[33mcommit 16009bb9e922017c385ca5ac21662f59c85b121b[m
Merge: ae6136dce 83c4aab01
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Oct 14 21:14:16 2022 +0200

    Merge pull request #45 from EveryBoard/CurrentPlayerMustBeBellow

[33mcommit 83c4aab01189eb761f4d634e62defdc69b7fcf33[m[33m ([m[1;31morigin/CurrentPlayerMustBeBellow[m[33m)[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Oct 14 20:50:36 2022 +0200

    [CurrentPlayerMustBeBellow] enhance martian chess test

[33mcommit 09c70447844fbfe1d26bae51d4f1f33910d2df0d[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Oct 14 20:33:09 2022 +0200

    [PylosEnhancement] (f/x)describe removed

[33mcommit b54963ca1ba53d70c1bdbbe4822f0f4fa0761164[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Oct 14 20:32:06 2022 +0200

    [PylosEnhancement] is done

[33mcommit 519a5ef37da35d5d7773a0dcbcc9d45dc3feed60[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Oct 14 20:10:58 2022 +0200

    [ChangingSelectedPieceUXRefactor] Fix images

[33mcommit 734d714f259b07efbbc1cd672894259f6fd82382[m
Merge: 13fbd4e05 ae6136dce
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Oct 14 20:03:40 2022 +0200

    [ChangingSelectedPieceUXRefactor] PR Comments

[33mcommit ae6136dce579b98b6d30f4fcff265298efc54b64[m
Merge: 5d09509a2 1394f9e9d
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Oct 12 08:34:47 2022 +0200

    Merge pull request #56 from EveryBoard/MakeQuixoPlayableOnPhone

[33mcommit fa0ff256211ee4d52a178467980fb5f7686d8c35[m
Merge: 706afa42f 5d09509a2
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Oct 12 08:18:53 2022 +0200

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into siam-improvements

[33mcommit 706afa42fe3959dda9ee1c83c7793ab75a58b941[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Oct 12 08:17:42 2022 +0200

    [siam-improvements] Simplify clearing node after restart

[33mcommit 13fbd4e0557fdc4bd74e2d65a8fd2b49c95e6780[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Oct 12 06:37:34 2022 +0200

    [ChangingSelectedPieceUXRefactor] fix translation and remove fdescribe

[33mcommit 1394f9e9d3edab657bc2834a73ce436c22f86d97[m[33m ([m[1;31morigin/MakeQuixoPlayableOnPhone[m[33m)[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Oct 12 06:31:36 2022 +0200

    [MakeQuixoPlayableOnPhone] PR Comment #1

[33mcommit 5d09509a2c73fb2e0ad8b6f47f0690b189066647[m
Merge: b0f3b086f bef2ec59f
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Oct 11 23:34:54 2022 +0200

    Merge pull request #57 from EveryBoard/CoverLOACompletely

[33mcommit c4b54f89a9d7fa9ae63aae3312c83568a21752a7[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Oct 11 23:28:23 2022 +0200

    [siam-improvements] Fix linter

[33mcommit 0b2566b268624604d2109f3c91efd7441e1db892[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Oct 11 23:10:48 2022 +0200

    [siam-component] Update board after resetting it in GameWrapper

[33mcommit bef2ec59f326a56c5750a56b1edfe7c1bc509334[m[33m ([m[1;31morigin/CoverLOACompletely[m[33m)[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Oct 11 21:35:16 2022 +0200

    [CoverLOACompletely] Finished

[33mcommit 351e4abaea9ae33cb50f2cc251ba340d255421b2[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Oct 11 21:05:18 2022 +0200

    [MultitabManagement] fix translation

[33mcommit 11dbf9c000bad7bfbe892f41b2eb95e8c177527f[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Oct 11 21:00:12 2022 +0200

    [MakeQuixoPlayableOnPhone] Should be done

[33mcommit 2c56a959a59fb6e8b84251b7a54c62ebb8262703[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Oct 11 19:48:28 2022 +0200

    [MultitabManagement] PR Comments; fix coverage

[33mcommit ffb23ea7d99fcb83453030f49508bd5afc94377c[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Oct 11 19:12:56 2022 +0200

    [ChangingSelectedPieceUXRefactor] Fix build

[33mcommit f07181c891e99290eb900ad633d2888d6a3fd4c9[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Oct 11 18:57:57 2022 +0200

    [CurrentPlayerMustBeBellow] PR Comments

[33mcommit 9c51411c67c0f2ac2bca8d420c860859e424aa83[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Oct 11 18:47:29 2022 +0200

    [CurrentPlayerMustBeBellow] Enhanced apagos

[33mcommit a369ec1c903b25edee34090fa2cfa66642e9a20e[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Oct 11 18:45:34 2022 +0200

    [ChangingSelectedPieceUXRefactor] Pull request comment

[33mcommit 1f5c7bc27da26cdefaf6de932e615cea2f29e63f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Oct 11 17:04:49 2022 +0200

    [siam-improvements] Avoid using rules.node.gameState

[33mcommit d3f102252a3b6e1ed2b2975d893b9c8dcf1cae90[m
Merge: 6107bf187 b0f3b086f
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Oct 9 20:56:07 2022 +0200

    Merge branch 'develop' of https://github.com/EveryBoard/EveryBoard into CurrentPlayerMustBeBellow

[33mcommit 6107bf1874762f14af44827da40ac48690745303[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Oct 9 20:55:55 2022 +0200

    [CurrentPlayerMustBeBellow] Adapt behavior for MartianChess and for local game against AI

[33mcommit 836d26a5982dec7fb3fde229baed2c7781444a48[m
Merge: 576429da8 4b3d44e90
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Oct 7 16:22:51 2022 +0200

    [MultitabManagement] pulled ... MultitabManagement into MultitabManagement ? I did a git mistake probably

[33mcommit 576429da813fb38a3feac190dde18b203ea9eabe[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Oct 6 21:30:14 2022 +0200

    [MultitabManagement] Normal PR Comments

[33mcommit 4b3d44e905ba27a4c51569bfd96cfb21d5cdd6a8[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Oct 3 21:22:55 2022 +0200

    wip

[33mcommit c130ac908d61bff2e9ab109e95f27d7bc071e640[m
Merge: 45b1f2b5e b0f3b086f
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Oct 1 18:38:44 2022 +0200

    [MultitabManagement] merged develop and fixed conflict

[33mcommit 45b1f2b5e6017f5d49eb0cdbc94a568d60a98c46[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Oct 1 18:35:27 2022 +0200

    [MultitabManagement] making header link to part clickable (wip)

[33mcommit 88151c67e403a8a310e1df0007f57294bbaea166[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Sep 30 21:55:50 2022 +0200

    [ChangingSelectedPieceUXRefactor] PR Comments

[33mcommit 5bb02f9dc03cc34cd24fbf3f8f2c5b9e10a32c55[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Sep 29 22:15:21 2022 +0200

    [ChangingSelectedPieceUXRefactor] fix lint; tests; translations

[33mcommit 8f8092c10a88000c450010995af35e44f78aead9[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Sep 29 21:10:04 2022 +0200

    [ChangingSelectedPieceUXRefactor] add behavior change to yinsh

[33mcommit 5a85379d8e2fb19de0c097fdb2f9cb56262d570a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Sep 28 22:16:17 2022 +0200

    [security-take-bag-bug] Disable tests for security rules that have been disabled

[33mcommit a2479bd4aba90273066e19aa3ba6a1c13b60b1cd[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Sep 28 21:38:28 2022 +0200

    [siam-improvements] Improve colors of non player pieces

[33mcommit 5a62f7308a63a63403485414a4376dc48acb7ba4[m
Merge: 4f21cfe4a b0f3b086f
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Sep 28 20:25:10 2022 +0200

    Merge pull request #55 from EveryBoard/develop

[33mcommit 77ee0df1b98216d93c84a6405ad6757989191ceb[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Sep 28 17:26:25 2022 +0200

    [siam-improvements] PR comments

[33mcommit 515d5f8057ecbf28008fa55593924a4f9af68dd0[m
Merge: 1ffa05fb6 b0f3b086f
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Sep 28 11:26:56 2022 +0200

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into siam-improvements

[33mcommit b0f3b086fdc12ef7936187fc14a42dfa5dc6222a[m
Merge: 7d4e1e326 0a38ec5d2
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Wed Sep 28 08:45:13 2022 +0200

    Merge pull request #54 from EveryBoard/fix-active-services

[33mcommit 0a38ec5d2e4a90fa8a0a7e0a6908e06cf3c939e0[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Sep 27 18:01:21 2022 +0200

    [fix-active-service] Fix duplicates in active parts and active user services

[33mcommit 1ffa05fb654c5089d3952224ae7bc627145d4600[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Sep 26 22:34:22 2022 +0200

    [siam-improvements] Update viewbox

[33mcommit a2cfa25fe3bc4dfe4e6f0b3ffe35be9fb7fb4b51[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Sep 26 22:30:07 2022 +0200

    [siam-improvements] Update translations

[33mcommit b42987c6f8b5cf40ccce8759d2355bef73bdc377[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Sep 25 15:42:23 2022 +0200

    [siam-improvements] Improve CSS names

[33mcommit bccf736d13df5e088699e5162c15f0c1a284fd70[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Sep 26 20:01:06 2022 +0200

    [ChangingSelectedPieceUXRefactor] advance in double-click behavior; refactor 'it's

[33mcommit 76f498f9587500cb17b2ad22e146418afae22963[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Sep 25 21:48:23 2022 +0200

    [ChangingSelectedPieceUXRefactor] advance in double click refactor

[33mcommit 75906efae9fb9de291804c47521db6029a2ff94c[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Sep 24 19:15:24 2022 +0200

    [ChangingSelectedPieceUXRefactor] Work in progress

[33mcommit 5c36d204f956b04f43adff809b799828a7b45c9d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Sep 24 14:38:47 2022 +0200

    [siam-improvements] PR comments

[33mcommit 32fff3f95b5d88172ab766f7a88c1936d6b4b983[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Sep 21 07:56:42 2022 +0200

    [update-09-2022] Fix tests

[33mcommit 0330b025d38cbb371a98b32b9ec09497f27a8b93[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Sep 20 23:13:10 2022 +0200

    [siam-improvements] remove debug code

[33mcommit 1950048b102ceb38dfb6cbfeea161c00b2d736ad[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Sep 20 17:24:05 2022 +0200

    [siam-improvements] PR comments

[33mcommit f43c601f149acb346bf403a620ee92809e34ca48[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Sep 20 20:21:26 2022 +0200

    [ChangingSelectedPieceUXRefactor] update translation; add Hnefatafl

[33mcommit 41919a0d208eb58212ef8ef18f6926adeb2f8695[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Sep 20 17:23:52 2022 +0200

    [siam-improvements] Get rid of highlighted CSS class

[33mcommit 21ac724f13889ea40b721abd97c1e98e9f3194e9[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Sep 20 15:55:03 2022 +0200

    [siam-improvements] Regenerate images and translations

[33mcommit 2d29eec9ac02ea217ceb1695db6385dab41b80d0[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Sep 20 07:57:39 2022 +0200

    [siam-improvements] Add missing Direction test

[33mcommit 67e807be8aae38f07a14ef58e44eb03331eac7ff[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Sep 20 07:52:51 2022 +0200

    [siam-improvements] Regenerate coverage correctly, fix script

[33mcommit be4aa64b08529f7dcf05e30571864b46bcca5e20[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Sep 19 22:07:22 2022 +0200

    [siam-improvements] Update images

[33mcommit 45e3fe26778480088839d523ce3b8f60ed6b1637[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Sep 19 18:07:52 2022 +0200

    [siam-improvements] Update coverage and index

[33mcommit aee1cd30861ea75c866bb057139683293bda314d[m
Merge: 0fcaad9a4 7d4e1e326
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Sep 19 18:06:47 2022 +0200

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into siam-improvements

[33mcommit 0fcaad9a4f070fa6e569f92de0eacc6157f12256[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Sep 19 18:03:07 2022 +0200

    [siam-improvements] Full coverage and improve Siam encoder

[33mcommit 523af766062b883c291ea8fcca1416daa5fdb538[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Sep 19 18:02:58 2022 +0200

    [siam-improvements] Further improvements after comments

[33mcommit 8013341a97fa59009aec3ddef326471e1c772600[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Sep 18 19:37:53 2022 +0200

    [CurrentPlayerMustBeBellow] enhance naming

[33mcommit 7af1c22afd68a73a06950d93f11dd9eddecd62f6[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Sep 18 14:30:43 2022 +0200

    [ChangingSelectedPieceUXRefactor] Enhanced Tafls test; Adapt tafls second click behavior

[33mcommit 8c46cc5ac681e75aba21f9aa7d058b4e95cecbd1[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Sep 17 12:38:00 2022 +0200

    [ChangingSelectedPieceUXRefactor] adapted Tafls to new rule

[33mcommit 1a1d3c4c6821814d5ac420a9fcc8f74f3c13c39f[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Sep 16 22:55:26 2022 +0200

    [MultitabManagement] fix linter & translation

[33mcommit a4e7fdf909b9b96129741c27b0d15e7ee66071cd[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Sep 16 19:43:28 2022 +0200

    [MultitabManagement] Enhance code coverage

[33mcommit 88006efc70ba7db8749c84d6c7fe4e349476cab6[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Sep 16 17:37:58 2022 +0200

    [siam-improvements] Finalize component improvements

[33mcommit 27102396c47c6f9ed1f890829ec6f5b403027e62[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Sep 15 16:47:24 2022 +0200

    [MultitabManagement] split  ObservedPartService outside of ConnectedUserService

[33mcommit 7d4e1e326bafa3e4f080bff7800bfe88d2e15d92[m
Merge: 5c9edbcff bdb247396
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Thu Sep 15 14:37:29 2022 +0200

    Merge pull request #50 from EveryBoard/rename-collection

[33mcommit eb052cc972eca0105f278cf87bb5545e6adbee39[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Sep 13 12:05:15 2022 +0200

    [siam-improvements] New move mechanisms

[33mcommit 4ae2eb890eb9ee3764a5882997f632746d96b8d5[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Sep 13 08:09:12 2022 +0200

    [siam-improvements] Show indicator push arrows

[33mcommit d64e0768f98a3d42eff832f263a64115773a90a8[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Sep 12 20:27:10 2022 +0200

    [MultitabManagement] restoring package-lock.json

[33mcommit 67ac294f219e7f880aa16523e88ac52241c2df74[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Sep 12 20:14:46 2022 +0200

    [MultitabManagement] git attempt at cancelling branch change on package-lock

[33mcommit c2be7ae10ab83103ddd0b977ac5e81188514141d[m
Merge: f51537475 5c9edbcff
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Sep 12 20:01:19 2022 +0200

    Merge branch 'develop' of https://github.com/EveryBoard/EveryBoard into MultitabManagement

[33mcommit 8c9e8d3629e1063be4e2f2dbaf149b8e1e7c7e2d[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Sep 12 19:10:30 2022 +0200

    [CurrentPlayerMustBeBellow] fix linter; enhance naming

[33mcommit bdb247396e4028387919e56c52fab88c9edf4609[m
Merge: 3ce5456f3 5c9edbcff
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Sep 12 08:44:26 2022 +0200

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into rename-collection

[33mcommit 5c9edbcffe98945b20f9d6d3c14ca9b7481e4df8[m
Merge: 9e35f6c41 acddad4d7
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Sep 12 08:44:10 2022 +0200

    Merge pull request #46 from EveryBoard/SaharaShowPossibleLanding

[33mcommit 3ce5456f38399bf2b55f7fcbc965aec1eed99853[m
Merge: 364e643d2 9e35f6c41
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Sep 12 08:43:57 2022 +0200

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into rename-collection

[33mcommit acddad4d715aba9c5ce65dec84e5ed8a90e7d0b9[m[33m ([m[1;31morigin/SaharaShowPossibleLanding[m[33m)[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Sep 12 07:33:16 2022 +0200

    [SaharaShowPossibleLandings] PR Comment; enhance polygone drawing; enhance unit tests

[33mcommit abf3a89dcb7982155f4c3f74286d5ae3b46b0fb0[m
Merge: 076023c48 9e35f6c41
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Sep 11 21:04:01 2022 +0200

    Merge branch 'develop' of https://github.com/EveryBoard/EveryBoard into CurrentPlayerMustBeBellow

[33mcommit 076023c48b35185bf7f7491d71fabb37d5ee5b87[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Sep 11 21:03:14 2022 +0200

    [CurrentPlayerMustBeBellow] PR Comment

[33mcommit f51537475de72958516ab8f25bccd63ba1009b54[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Sep 11 20:55:26 2022 +0200

    [MultitabManagement] pulled develop and answered last PR Comment

[33mcommit 59d846104b2eb882ed6aae5463dfc3dd6a10bbd1[m
Merge: 9997b7f97 9e35f6c41
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Sep 11 19:35:36 2022 +0200

    Merge branch 'develop' of https://github.com/EveryBoard/EveryBoard into MultitabManagement

[33mcommit 9997b7f977abda518d0d02c3f3503d69e05ab67f[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Sep 11 19:34:55 2022 +0200

    [MultitabManagement] PR Comment

[33mcommit cb8263c2543a256a236bb67dbf3be9faf622475d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Sep 10 14:25:41 2022 +0200

    [siam-improvements] New mechanism to insert pieces in Siam

[33mcommit 2da558ba41ef23fac06ee520c3cd518f808a4a36[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Sep 10 10:27:07 2022 +0200

    [siam-improvements] Show remaining pieces

[33mcommit 60cd9ce890f8c6f2f73079fb1868f79ab14639c0[m
Merge: 97da7f3d0 5d50c0708
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Sep 9 22:23:16 2022 +0200

    [MultitabManagement] Pulled develop and fixed conflict; answered some PR comment

[33mcommit 9a17bbdeae0a2006e9ceb5a4061ce8ffe64b6100[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Sep 9 21:33:04 2022 +0200

    [security-take-back-bug] Disable some security rules to avoid expression limit

[33mcommit 364e643d2c92cf1a2f1160e26420d2cd4addb1b5[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Sep 9 19:45:13 2022 +0200

    [rename-collection] Add script to rename collection

[33mcommit 9e35f6c416548b7ee9be8223644e175ca71a2540[m
Merge: 5d50c0708 fe65699a0
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Fri Sep 9 18:35:35 2022 +0200

    Merge pull request #48 from EveryBoard/login-redirect-fix

[33mcommit 5424c2c512c0fc7c9a7e7e87da2b2fd9ba4f1215[m
Merge: 6ff33e343 5d50c0708
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Sep 7 21:32:57 2022 +0200

    [CurrentPlayerMustBeBellow] pull develop and fixed conflict

[33mcommit 6ff33e343d1899a19060119b511eea628abc813f[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Sep 7 21:06:18 2022 +0200

    [CurrentPlayerMustBeBellow] PR Comments]

[33mcommit 71a5a6017c51d27c1ba870469c0db219f1df058f[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Sep 7 18:28:50 2022 +0200

    [SaharaShowPossibleLanding] fix refactor related bug

[33mcommit fa546ab2388e15eb06bd5d293447b6868b3c3c76[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Sep 7 08:26:53 2022 +0200

    [CurrentPlayerMustBeBelow] fixed coverage

[33mcommit 9327036c956148974b0e9fab0411f468ff576577[m
Merge: 2a966463c 2306fbcf5
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Sep 7 07:50:23 2022 +0200

    [CurrentPlayerMustBeBelow] pulled develop, fixed conflict, fixed number disply in Awale

[33mcommit fe65699a02decd26a8f71945e567c339529c684f[m
Merge: 9225de61c 5d50c0708
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Sep 6 17:21:38 2022 +0200

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into login-redirect-fix

[33mcommit 8b90d34429a90def84c4dfb1e4036d3e4bcfbf30[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Sep 6 16:09:39 2022 +0200

    [update] Upgrade remaining dependencies

[33mcommit 7ee5376808e21dd6e0434adb77e6e77ab13784ff[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Sep 6 15:56:34 2022 +0200

    [update] Upgrade to angular 14

[33mcommit e56aba912116b0f8c6de544e32d7464c6b9b394e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Sep 6 15:51:34 2022 +0200

    [update] Upgrade to angular 13

[33mcommit f7fb11cdef6ce1ea3d630ee1b06521ecc8fe976a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Sep 6 15:43:09 2022 +0200

    [update] Explicitly install rxjs

[33mcommit 5d50c0708eecca441a02155029594d43aa37b999[m
Merge: 2306fbcf5 cf9f8c18f
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Tue Sep 6 15:06:47 2022 +0200

    Merge pull request #36 from EveryBoard/dao

[33mcommit cf9f8c18f7f98cfb254aa683b940a7fa2c23b517[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Sep 6 08:01:42 2022 +0200

    [dao] PR comment

[33mcommit 55f28faf8ce8b3e60e0401b6e8a494bfdb67b20e[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Sep 6 07:14:27 2022 +0200

    [SaharaShowPossibleLanding] PR Comments

[33mcommit 97da7f3d08d170d8422cc499726e919ffcbec52e[m
Merge: d1ef9a634 2306fbcf5
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Sep 6 07:10:25 2022 +0200

    [MultitabManagement] pull develop and fixed conflict

[33mcommit d1ef9a634c5b9f136de83b7fd912106400acc45d[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Sep 5 22:21:41 2022 +0200

    [MultitabManagement] Pull Request Comment

[33mcommit 77321a31a70f7486b15922cb9277699cb328948a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Sep 5 21:10:08 2022 +0200

    [dao] PR comments

[33mcommit 9225de61c165bf75f30957b8a196a8f957cefc63[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Sep 5 20:47:44 2022 +0200

    [login-redirect-fix] Add test for login redirect

[33mcommit b61448d90aa6a9547066890472b5f7344240f30d[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Sep 5 19:06:38 2022 +0200

    [SaharaShowPossibleLanding] PR Comments

[33mcommit 64db60b9da3372af8f5d439e3d874020fa7720a7[m
Merge: db56a9ddf 8fa9c9894
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Sep 5 18:25:12 2022 +0200

    Merge branch 'dao' of github.com:EveryBoard/EveryBoard into login-redirect-fix

[33mcommit db56a9ddfc474eb5e3257842ae2cf2e91b923da5[m
Merge: 9a02be0e3 2306fbcf5
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Sep 5 10:26:58 2022 +0200

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into login-redirect-fix

[33mcommit 8fa9c9894ca89e2d77f738f985df90a1e407b936[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Sep 5 09:52:43 2022 +0200

    [dao] Use Subscription instead of Unsubscription

[33mcommit 3f37e6b760d4463a942427b4e7350424ce4f0c54[m
Merge: 3fa8f184a 2306fbcf5
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Sep 5 08:36:30 2022 +0200

    Merge branch 'develop' of https://github.com/EveryBoard/EveryBoard into SaharaShowPossibleLanding

[33mcommit aa73dddd491af12767b837045c450fe4401793f7[m
Merge: 7e4cfe873 88ff1957f
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Sep 3 17:20:48 2022 +0200

    [MultitabManagement] pull develop and fixed conflict then tests

[33mcommit 2306fbcf510a968d93e0ee07536a14fe06d367f8[m
Merge: 0191ac546 fc54213e5
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Fri Sep 2 20:34:58 2022 +0200

    Merge pull request #44 from EveryBoard/enhance-games-sprintly-08-2022

[33mcommit fc54213e5d1085911758d3d4d59e0af36213517f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Sep 2 19:37:03 2022 +0200

    [enhance-games-sprintly] Update translations

[33mcommit 7876169d31b219262065b4ca3622faf08f8d79c7[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Sep 2 19:34:31 2022 +0200

    [enhance-games-sprintly] PR comment

[33mcommit 7a8b899ca09d476e8f086fd7b71018848c3ca0ef[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Sep 2 19:20:10 2022 +0200

    [dao] PR comments

[33mcommit cae0d7e8ef58aec28373de3da482d58187975fa5[m
Merge: 6b46fa8a5 0191ac546
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Sep 2 19:04:52 2022 +0200

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into dao

[33mcommit 6ca86057f3d900dd39153601604fac6d0f1ea59c[m
Merge: 3b8d20a12 0191ac546
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Sep 2 19:01:01 2022 +0200

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into enhance-games-sprintly-08-2022

[33mcommit 3b8d20a126a14d123a12b7c55b5b497b4451db66[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Sep 2 18:57:00 2022 +0200

    [enhance-games-sprintly] Fix kamisado test and Siam failure

[33mcommit 0191ac546a781d5f1b41c7ddec9de95eeedc5323[m
Merge: 88ff1957f 7a4795757
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Thu Sep 1 07:34:18 2022 +0200

    Merge pull request #47 from EveryBoard/footer-on-bottom

[33mcommit 7a4795757dda16e3c32f9b485e7a28fa8b7a6f16[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Aug 30 17:40:51 2022 +0200

    [footer-on-bottom] Force the footer to always be on the bottom of the page

[33mcommit 6b46fa8a5ffccf4a5330b594b0b726593827287f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Aug 30 12:12:29 2022 +0200

    [dao] PR comments

[33mcommit b56cdba460cf61009574513527b232ea5c806414[m
Merge: 5e5fb8853 88ff1957f
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Aug 30 11:09:39 2022 +0200

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into dao

[33mcommit 513e7affcd11bb24e4fb78dedf8a79be5b37b919[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Aug 30 11:09:00 2022 +0200

    [enhance-games-sprintly] Add lifecycle test for Kamisado end game

[33mcommit 5fe21e305d094b74de45ae71e2e3003506dcd439[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Aug 30 08:54:45 2022 +0200

    [enhance-games-sprintly] Minor refactors

[33mcommit c54502727d11772245cd0885b08cbc89b2962215[m
Merge: cd91f4ee0 88ff1957f
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Aug 30 08:46:31 2022 +0200

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into enhance-games-sprintly-08-2022

[33mcommit 2a966463c4cb0bcd48a70bc64b2ffdbc6d915acc[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Aug 29 21:06:44 2022 +0200

    wip

[33mcommit 88ff1957f2d9e09ba71fa3459437d940c4bb0bfb[m
Merge: ecd00db54 9af049efb
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Mon Aug 29 21:04:25 2022 +0200

    Merge pull request #33 from EveryBoard/security-firebase

[33mcommit 9af049efb6a71026a2e3d30c0b2a3f891f857c40[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Aug 29 20:08:08 2022 +0200

    [security-firebase] Fix calls in firestore rules

[33mcommit 8d2685baa3c908227939cc5db3c1f7d14402c7e6[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Aug 29 20:07:23 2022 +0200

    [security-firebase] Fix the previous fix

[33mcommit 3eca6f4e9e52a579ebd5ff815394dfea58f0a52a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Aug 29 20:03:50 2022 +0200

    [security-firebase] Fix rematch after victory

[33mcommit 5ac7f5e9dbf95c5cb52d96d7e4883c5c1b6795fe[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Aug 29 17:27:43 2022 +0200

    [security-firebase] Last fixes

[33mcommit 5e5fb88530f0661e774e71e50b0393c8dbc1e80a[m
Merge: 5ccd4ccc8 7ee451db4
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Aug 29 10:49:53 2022 +0200

    Merge branch 'security-firebase' of github.com:EveryBoard/EveryBoard into dao

[33mcommit 3fa8f184a6b7cf4c77d8aebb121a62c39a319c89[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Aug 28 15:15:21 2022 +0200

    [SaharaShowPossibleLanding] PR Comments

[33mcommit cd91f4ee058f39b7d26f495f8d30c136ac25ff21[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Aug 27 13:14:53 2022 +0200

    [nehance-games-sprintly] Minor linter fix

[33mcommit b98b21c960f9c001a3deb165f3bf9578495c2571[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Aug 27 13:00:59 2022 +0200

    [enhance-games-sprintly] Fix linter

[33mcommit d1064dec3bb6f9833e5f36461865ae39f77bebb8[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Aug 27 12:31:39 2022 +0200

    [enhance-games-sprintly] Restore old Siam components, improvements will be for later

[33mcommit b1659e7058a89d2a0e844ceb2b3a75e00fca100d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Aug 27 10:43:27 2022 +0200

    [enhance-games-sprintly] Improve Kamisado component

[33mcommit 7ee451db410882c2eb57de9389082ec611c8321c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Aug 27 09:27:37 2022 +0200

    [security-firebase] Final adjustments

[33mcommit 45b1385ef5fac9448e3a712d70a03d0cf0ea9f16[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Aug 26 20:04:09 2022 +0200

    [security-firebase] More PR comments

[33mcommit 1d6bbae33b069d20317918ecb3782a7320a18d47[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Aug 26 20:06:42 2022 +0200

    [enhance-games-sprintly] Improve Siam component

[33mcommit 6f61cb3fb8b83cbc530245bb26d5a7102196f5dc[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Aug 26 17:14:33 2022 +0200

    [security-firebase] Final adjustments for security

[33mcommit 2c9a28ddc7e26d57534ba9eec03448dffd6e05ee[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Aug 25 21:33:24 2022 +0200

    [SaharaShowPossibleLanding] done

[33mcommit 56c71594b388366c58749723cbf61291fc02f643[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Aug 25 12:05:06 2022 +0200

    [security-firebase] Fix all tests, cover all PR comments

[33mcommit e39322d6f1e013c28ac6e7ebf2f118e5f01eaf5a[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Aug 24 11:24:15 2022 +0200

    [CurrentPlayerMustBeBellow] adapted online-game-wrapper component so that player is always below for the game needing it

[33mcommit 7e4cfe873dce5e1c5454187b5806da032e993001[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Aug 23 19:42:22 2022 +0200

    [MultitabManagement] First functionnalities done

[33mcommit ee7199a0392e83d470ea3e31c57594e92004688d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Aug 20 09:13:54 2022 +0200

    [security-firebase] Minor PR comments

[33mcommit e9c8b4eee3bd0b09ebf9c4a34cb183517ff6cd52[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Aug 19 13:29:39 2022 +0200

    [enhance-games-sprintly] PR comments

[33mcommit 73e6abfa58e772642979eb95b33da93b75764add[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Aug 19 08:59:48 2022 +0200

    [enhance-games-sprintly] Rename componentTestUtils to testUtils

[33mcommit 7069b7a260ffa3cbee0a091e3153a3f7268391f1[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Aug 19 08:49:21 2022 +0200

    [enhance-games-sprintly] Add viewbox computation to RectangularGameComponent, fix minor things

[33mcommit 54b04d1f8ff06f1eb880a1f48db04ff308e8dc67[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Aug 18 22:44:25 2022 +0200

    [enhance-games-sprintly] Add previous state to predicate tuto, improve siam tests

[33mcommit e9d5d380257b756111f084c26296690e1dc49638[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Aug 17 19:43:59 2022 +0200

    [security-firebase] Update translations

[33mcommit 27c9b5644d072e98208b395da3de2b73c8027421[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Aug 17 19:31:23 2022 +0200

    [security-firebase] Small fixes to security rules

[33mcommit 5cee767be45bc3cc03e490e2ffe400fbb1aeff36[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Aug 17 19:25:35 2022 +0200

    [security-firebase] Loosen time checks to have lighter rules

[33mcommit ce4decbe46a55ba7fb7d15233304ff327d6d3038[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Aug 16 17:47:42 2022 +0200

    [security-firebase] More refinements after PR comments

[33mcommit fe71f18a6da0f60376f7eeb562cecb539d47b278[m
Merge: 17ec38e1f ecd00db54
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Aug 16 08:15:36 2022 +0200

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into security-firebase

[33mcommit 93ec42b3ce0fa155d5aab0934a78422b75943072[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Aug 16 07:46:05 2022 +0200

    [enhance-games-sprintly] Finish commenting Epaminondas tests

[33mcommit a2cf70ed79af4487f5d6d8d725a70e84b3f34dfe[m
Merge: 68217e0ae ecd00db54
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Aug 15 21:15:52 2022 +0200

    [MultitabManagement] pull develop and fix conflicts, test are to be fixed

[33mcommit 014f2e5af9f2d559bda6048cc1f0575027e82604[m
Merge: 5f43d539f ecd00db54
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Aug 15 21:06:09 2022 +0200

    gMerge branch 'develop' of github.com:EveryBoard/EveryBoard into enhance-games-sprintly-08-2022

[33mcommit 5f43d539f4e5488980e938ed97eaa53ace36becc[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Aug 15 21:05:16 2022 +0200

    [enhance-games-sprintly] Test suites enhancement for yinsh, kamisado and epaminondas

[33mcommit 68217e0ae918e8712789b0b088074995a878ff7b[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Aug 15 20:50:56 2022 +0200

    [MultitabManagement] enhancing test and small changes

[33mcommit 4f21cfe4ad9afd36994245f2f758f31464d37a16[m
Merge: 60d60cbea ecd00db54
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Mon Aug 15 20:32:00 2022 +0200

    Merge pull request #43 from EveryBoard/develop

[33mcommit ecd00db54a7533dd9bf68f445847a305c013f26a[m
Merge: 44a8ed3cf 20dd01c33
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Aug 15 18:31:04 2022 +0200

    Merge pull request #34 from EveryBoard/BoostGoCoverage

[33mcommit 20dd01c3331d5e1e80cab6786262047ff3529fd7[m[33m ([m[1;31morigin/BoostGoCoverage[m[33m)[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Aug 15 17:44:16 2022 +0200

    [BoostGoCoverage] fix translation

[33mcommit 9c9be1efeaccb7b7040339c130508c685d3a1709[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Aug 14 13:39:04 2022 +0200

    [BoostGoCoverage] fix linter

[33mcommit dc6819821e741c7e1da921b5b637d8298ffe48b8[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Aug 14 12:51:38 2022 +0200

    [BoostGoCoverage] pull request comment

[33mcommit e9f81f146f1e15b06bdf2adb97de0ce2ec23d798[m
Merge: fcd330037 44a8ed3cf
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Aug 12 22:20:40 2022 +0200

    [BoostGoCoverage] pull develop and merge conflict

[33mcommit 17ec38e1f8c432a6c00fb86645850974d99292e2[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Aug 11 08:38:30 2022 +0200

    [security-firebase] Fix time tests to match with reality

[33mcommit fcd330037e9ca8656b5e4a09395b9ac29876a703[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Aug 10 22:41:29 2022 +0200

    [BoostGoCoverage] fixed coverage and answer PR Comment

[33mcommit 7dab0ed4f941208a8f2d5e07006076384b063894[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Aug 9 17:57:43 2022 +0200

    [security-firebase] PR comments

[33mcommit def5910aff98c573491641199261279a8a7470ae[m
Merge: 9f57ede20 44a8ed3cf
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Aug 9 08:16:52 2022 +0200

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into security-firebase

[33mcommit 5ccd4ccc8c126e329998518c879409b941ed8dd1[m
Merge: ce231f667 44a8ed3cf
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Aug 9 08:12:11 2022 +0200

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into dao

[33mcommit ce231f6674797b869b736425d51e0d86d3bb947e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Aug 9 08:05:53 2022 +0200

    [dao] Fix disabled test

[33mcommit 85fa1ec774807619e4d8c0a4506f93db7a39543a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Aug 8 19:37:52 2022 +0200

    [dao] Big refactor, stateless services, improved unsubscription checks

[33mcommit 44a8ed3cf5c833c81cfa9ede089f7b30e76ab707[m
Merge: c513cda05 5efded777
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Mon Aug 8 08:39:13 2022 +0200

    Merge pull request #42 from EveryBoard/ux-improvements-08-2022

[33mcommit 41600474ed36d1994694d879a7ba84214b57ede5[m
Merge: 0e08c49c3 a1f589caf
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Aug 8 07:46:34 2022 +0200

    Merge branch 'dao' of github.com:EveryBoard/EveryBoard into dao

[33mcommit 5efded777a4c35dedc2515c2b26e782f98ca6263[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Aug 8 07:35:27 2022 +0200

    [ux-improvement] Fix translation

[33mcommit 0e08c49c305732d2b57d28dcb1cecf71b95a9034[m
Merge: 3e40546d6 c513cda05
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Aug 7 17:04:20 2022 +0200

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into dao

[33mcommit a1f589caf4a77cdb7b90fbc9b001a77d7a0a0451[m
Merge: 3e40546d6 9f57ede20
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Aug 7 17:02:34 2022 +0200

    Merge remote-tracking branch 'origin/security-firebase' into dao

[33mcommit a1b262db4d54cfb2ef7981cd9cfa0cfa74377100[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Aug 7 09:35:00 2022 +0200

    [ux-improvements] Update footer

[33mcommit 9f57ede2054a85487d7cd3b60715e14b44e2c266[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Aug 6 20:59:38 2022 +0200

    [security-firebase] Fix time management tests

[33mcommit a61ea017de2d41445639b1441144ab23f3cec7ec[m
Merge: 5317fdbe4 c513cda05
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Aug 5 20:56:38 2022 +0200

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into security-firebase

[33mcommit 0a9e19d302fe6c75372700d34fda794107c43885[m
Merge: 34c1a8d9d c513cda05
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Aug 5 20:54:02 2022 +0200

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into ux-improvements-08-2022

[33mcommit 34c1a8d9d017316bf3a6a0fd103fafebe18df891[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Aug 5 20:53:18 2022 +0200

    [ux-improvements] Delete old .firebase directory

[33mcommit 2172b336337fb37b049ce9beae9fa9160b19e138[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Aug 5 20:46:12 2022 +0200

    [ux-improvements] Translate footer

[33mcommit c513cda05b76ab5629736b1f00120d3cd2e12d79[m
Merge: 616fc874a 582837641
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Aug 5 19:08:54 2022 +0200

    Merge pull request #41 from EveryBoard/welcome-modal-fix

[33mcommit 5317fdbe4fe41d343bf00846cf851e6ada1f5d76[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Aug 5 16:20:57 2022 +0200

    [security-firebase] Fix linter

[33mcommit 40be0d550da124020e945cf8fd4f4572593c5be0[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Aug 5 16:08:33 2022 +0200

    [security-firebase] Add more tests

[33mcommit 442e661edcf27947ee35a54f6c78879680c5294d[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Aug 5 15:29:38 2022 +0200

    [MultitabManagement] enhancing coverage and ObservedPart lifecycle

[33mcommit 64814b2c8fdb32ea6b7acf0f01ed1bf2560c6c0b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Aug 5 15:28:56 2022 +0200

    [security-firebase] Rename Joiner to ConfigRoom

[33mcommit 99eb1897a4625e95788e3884546faab31728d56b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Aug 5 11:40:25 2022 +0200

    [security-firebase] PR comments

[33mcommit e3b68ca5cdde221ebd6aabb42ac06d6dfecef49f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Aug 5 10:01:11 2022 +0200

    [security-firebase] Rename last_changed to lastUpdateTime, improve Timestamp usage

[33mcommit 9b65681b89bdb36cb4270119d365d2bbc4bc8fef[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Aug 4 17:55:11 2022 +0200

    [security-firebase] First part of new PR comments

[33mcommit 2fcc4444d2bafe571ae1633d8086b9bde2a9b139[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Aug 2 23:44:56 2022 +0200

    [ux-improvements] Fix tests

[33mcommit 05791bd3709ba598562aefe4e07e8fddd2bd3e4c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Aug 1 09:38:40 2022 +0200

    [ux-improvements] Hide connected users while it's empty

[33mcommit 0f8e9c71d33e35166e9c16b829c133a05ee41d51[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Aug 1 09:32:36 2022 +0200

    [ux-improvements] Loading icon instead of 'connecting...' username on login component

[33mcommit 14a254a52239b6e8715242472e1b0224d26a0248[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Aug 1 09:32:28 2022 +0200

    [ux-improvements] Add footer

[33mcommit 08b360ca92ffcf33409dedb54ae743aa33de4f4b[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Jul 31 21:56:41 2022 +0200

    [MultitabManagement] fixed coverage

[33mcommit 3714083f8faefd643cc253a5664724ef6f174f5a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jul 31 12:07:14 2022 +0200

    [security-firebase] Improve timestamp handling in rules

[33mcommit a52186c272e35e6a8a2a89bbddcc3f59b37aed2a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jul 29 19:30:25 2022 +0200

    [security-firebase] fix rematch and other broken tests

[33mcommit 9a02be0e3c0d01462d4a59c267c1724e92890162[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jul 29 10:19:19 2022 +0200

    [login-redirect-fix] Unsubscribe upon login component destruction

[33mcommit 64ac42f3d5e65f894bbea4b9f5f7b8adb5acf38a[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Jul 28 21:10:47 2022 +0200

    [MultitabManagement] adding back coverage csvs

[33mcommit c2770e0f0e05d147dde342c1ad7fbc2075b82081[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Jul 28 21:06:55 2022 +0200

    [MultitabManagement] covering ConnectedUserService

[33mcommit 5828376418008fade2c5378afadb460a1e0fbc65[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Jul 28 21:03:50 2022 +0200

    [welcome-modal-fix] Remove bulma-slider

[33mcommit 3e40546d60c6cc105fe9c13e9f077975562a2a24[m
Merge: 11116d44b 616fc874a
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Jul 28 13:47:04 2022 +0200

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into dao

[33mcommit 11116d44b3544034c0a83fa88d60f773e1f2d4c6[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Jul 28 13:46:48 2022 +0200

    [dao] PR comments

[33mcommit 6d8d79c56869e5c2ef9d9aad8028a50a6622c553[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Jul 27 19:44:03 2022 +0200

    [security-firebase] Fix linter

[33mcommit f95d3203cae4011518e5671a363360cb8fd7157d[m
Merge: 1fad0161f 616fc874a
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Jul 27 19:38:54 2022 +0200

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into security-firebase

[33mcommit 1fad0161f88e79520769b714343c11b31ddc82ec[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Jul 27 18:06:36 2022 +0200

    [security-firebase] PR comments

[33mcommit 616fc874a4341666a15c2404014778c5d012a74c[m
Merge: 40c4ed7e4 6c24f8550
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Mon Jul 25 21:37:42 2022 +0200

    Merge pull request #39 from EveryBoard/update-deps-07-2022

[33mcommit f8714cb6d17f8aa45193e4bf45a2c8a391e6e659[m
Merge: 77179589e 40c4ed7e4
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Jul 25 20:48:16 2022 +0200

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into security-firebase

[33mcommit 9a20a8067cfc8e55d30f60ab93b1f3dfa53817f8[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Jul 24 18:10:50 2022 +0200

    [BoostGoCoverage] fixed MGPNode branch uncovered

[33mcommit 2eb8581f48c6d56a41cf71fe017809b442e51de0[m
Merge: 13afc97f3 40c4ed7e4
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Jul 23 22:47:23 2022 +0200

    Merge branch 'develop' of https://github.com/EveryBoard/EveryBoard into BoostGoCoverage

[33mcommit 40c4ed7e4dfff0e0630ca2ebf7c1b38f0ad42aec[m
Merge: 98f300ce0 dfbba0c82
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sat Jul 23 12:53:19 2022 +0200

    Merge pull request #40 from EveryBoard/move-encoder

[33mcommit 28c0d23a3cee042a6b51ddb295f4f586b73a483f[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jul 22 19:06:25 2022 +0200

    [MultitabManagement] Fixed test and made non-contiguous part possible

[33mcommit dfbba0c82e6789ffe0f05d8bffdec5a7f14f7899[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Jul 18 19:59:27 2022 +0200

    [move-encoder] Move Encoder to utils

[33mcommit 6c24f85508f2ad9b6e377ac638568043e214ea0b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Jul 18 08:02:21 2022 +0200

    [update-deps] Fix eslint, upgrade node to v16

[33mcommit 7e6735f3127d36dfa0e51771708f66a19e482474[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jul 16 19:27:07 2022 +0200

    [update-deps] Update rest of dependencies, except angular

[33mcommit 6a044475c6530bbb6a7fb42054a46cd4c7a515e4[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jul 16 13:14:23 2022 +0200

    [update-deps] Update a bunch of dependencies

[33mcommit 50788b8fd22ca10be80532820603741561fe60ac[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jul 16 12:37:13 2022 +0200

    [dao] Fix remaining test and linter

[33mcommit ca7200de759d8f47bcbc174f44bdc40cd3cd1f2d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jul 15 08:48:57 2022 +0200

    [dao] Fix most broken tests

[33mcommit 1b65e6417da0e102166089f5196b07a35a5106a7[m
Merge: 871450f93 98f300ce0
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jul 15 08:40:35 2022 +0200

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into dao

[33mcommit 871450f93742135d3abf7d194c45d66e964aff15[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jul 2 09:52:44 2022 +0200

    [dao] Fix compilation post-merge

[33mcommit 6475ad3a5aa880397be2d7f4f82255b7e443dc31[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Jul 14 20:25:07 2022 +0200

    [MultitabManagement] only one active action allowed or several observing allowed

[33mcommit 13afc97f3d15ed63ac00a4fa7595521a89e9d519[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Jul 13 19:31:00 2022 +0200

    [BoostCGoAndCoerceoAndOtherCoverage] PR Comment; fix translation and coverage

[33mcommit 77179589e73789e93d0004d33d0798b06d81f5a8[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Jul 13 08:11:40 2022 +0200

    [security-firebase] Update translations

[33mcommit 471c585907a8a918d08e180eba577ea82754c5fd[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Jul 13 07:16:04 2022 +0200

    [security-firebase] Rmeove dead code

[33mcommit e9f217e51e606d9f242780447ad806b28873c9c1[m
Merge: cc55f6e54 60d60cbea
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Jul 12 20:17:13 2022 +0200

    [MultitabManagement] pulled master and fix conflict

[33mcommit cc55f6e54c9874f8aa83f275681719972209e91b[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Jul 12 19:13:47 2022 +0200

    [MultitabManagement] forbidden action enforcement in progress

[33mcommit ee41d81ff7d68e1f96f4759a3ed3c90d2a66ff50[m
Merge: 095c01322 98f300ce0
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jul 12 17:23:54 2022 +0200

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into security-firebase

[33mcommit 095c01322d9e4bfdc9ddd5691191bc2f33974112[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jul 5 07:20:13 2022 +0200

    [security-firebase] PR comments

[33mcommit 48edc279e4504e2be49778d64cc7d0b4e75b0238[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Jul 9 18:55:58 2022 +0200

    wip

[33mcommit eb0fcfb4280475700cdc17e654ea40d57d155cb6[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Jul 9 18:12:34 2022 +0200

    [BoostCoerceoCoverage] removed TODOTODO in Pylos

[33mcommit 4c3dde8ca8fe847453d0ea9828dd0516ad7177e9[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Jul 9 17:36:32 2022 +0200

    [BoostCoerceoCoverage] fix translation and linter

[33mcommit 4b09d3a85c3aac4104faa8a11029d644595c15af[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Jul 9 17:28:17 2022 +0200

    wip

[33mcommit 60d60cbea298f343c4f4355a6d192ff8ade3b2fc[m
Merge: e5ea2c634 98f300ce0
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Fri Jul 8 08:29:57 2022 +0200

    Merge pull request #37 from EveryBoard/develop

[33mcommit 1bda1df2e990b4a5be7478c7b60028f86303fbc5[m
Merge: 1f69763f6 98f300ce0
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Jul 5 22:11:25 2022 +0200

    [BoostGoAndCoerceoCoverage] pull develop and fixed conflict

[33mcommit 1f69763f64578f584a3223e95d5c4613680935ef[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Jul 5 21:44:38 2022 +0200

    ENhanced Coerceo Minimax nicely

[33mcommit f1a4c1ab6cd932383e624038226743086b7d377a[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Jul 4 21:16:15 2022 +0200

    Boosted Coerceo Pieces > Threat > Tile minimax

[33mcommit 98f300ce03ebd44caf550736e70e845498f007cf[m
Merge: 28c964ff8 c8e07970b
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jul 2 07:28:15 2022 +0200

    Merge pull request #31 from EveryBoard/MartianChess

[33mcommit c8e07970bf5392776f02dce56ae1a17bf332b186[m
Merge: 1481a854f 4ca505b38
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jul 1 22:10:28 2022 +0200

    Merge branch 'MartianChess' of https://github.com/EveryBoard/EveryBoard into MartianChess

[33mcommit 1481a854f76fdc7e6bc43a381f962cf1201ae236[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jul 1 22:09:45 2022 +0200

    [MartianChess] fix color scheme

[33mcommit 4ca505b38d30bf52eeea1134b05bf096ef2a635b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jul 1 21:34:16 2022 +0200

    [MartianChess] Add images

[33mcommit 5a0be9defab8f5201475f4a92aed61dcb96f3926[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jul 1 21:32:04 2022 +0200

    [MartianChess] PR comment again

[33mcommit 5b77165042af9d8e63ea2f78db6cb6eb6484f7c7[m
Merge: 86b474b71 28c964ff8
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jul 1 21:17:37 2022 +0200

    [MartianChess] Repulled and refix conflict

[33mcommit bb17f5b7117da48c9924f455d10b82895f797041[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jul 1 21:15:57 2022 +0200

    [dao] Refactor ChatDAO and ChatService

[33mcommit 86b474b71f2e89a65728fa4ceeac3cc1554fefb2[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jul 1 21:02:44 2022 +0200

    [MartianChess] Pulled lodestone and fixed conflict

[33mcommit ad36c6b290e434a92ee5222614c5dbfca741420c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jul 1 07:31:19 2022 +0200

    [dao] Fix chat test

[33mcommit a17aa4bb81b960442f4e8fa15373a5c0fd77c205[m
Merge: 5eeca3a12 28c964ff8
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jul 1 07:26:28 2022 +0200

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into dao

[33mcommit 5eeca3a12238b5822d46c74592226a33cebdae8e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jul 1 07:24:59 2022 +0200

    [dao] linter

[33mcommit 20d5c71122a7e4242d7a64bd54e2d3f564752f1d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jun 24 07:25:46 2022 +0200

    [dao] Unsubscribe in services

[33mcommit fc4cf3cd507fba39adac92903ca9457472d30440[m
Merge: 8eb8f27f0 e5ea2c634
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Jun 28 18:00:55 2022 +0200

    Merge branch 'master' of https://github.com/EveryBoard/EveryBoard into MartianChess

[33mcommit 8eb8f27f0e2845eecdc4c0d6bde8fc0fe4bc5124[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Jun 28 17:59:26 2022 +0200

    [MartianChess] Pull request Comment

[33mcommit 28c964ff85a995207e65bf7d544818b9136b58f6[m
Merge: 2571c8a4d 8c7de8e3f
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sun Jun 26 13:13:11 2022 +0200

    Merge pull request #35 from EveryBoard/lodestone

[33mcommit 8c7de8e3f4a6627030c8615985579e06067164df[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jun 24 19:20:12 2022 +0200

    [lodestone] Linter

[33mcommit 35b8de72186fcb9c0564812e132c8f0352669a47[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jun 24 19:18:06 2022 +0200

    [lodestone] GWT

[33mcommit abe83a509e6c2b9725b4e9923e9636b5fbf3e77e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jun 24 18:28:42 2022 +0200

    [lodestone] Fix pull issue

[33mcommit 2571c8a4d43af34ebae6c5dcecd49e9784858acf[m
Merge: a7a5fd5d4 4b7af2fbe
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Fri Jun 24 14:38:33 2022 +0200

    Merge pull request #28 from EveryBoard/lodestone

[33mcommit 4b7af2fbe04373c41b19ec1edc4de6f69afd72cd[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jun 24 07:28:36 2022 +0200

    [lodestone] Last PR comment?

[33mcommit 617c0e630979c432eb31f58815a843e46f1805e8[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Jun 23 08:52:55 2022 +0200

    [dao] Get rid of most public observers

[33mcommit de9c1f69cdc215ecae728dcc532fca92cde64729[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Jun 23 09:04:09 2022 +0200

    [lodestone] TutorialStepClicks have a solution!

[33mcommit 814ecf821e71819e89de6e7648812ad1ef360128[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Jun 22 18:57:03 2022 +0200

    [MartianChess] Translation and PR Comment

[33mcommit 82888742a24ac72c70d0406f4e2ec5ac8dccac28[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jun 21 08:57:40 2022 +0200

    [lodestone] Disable logging

[33mcommit b1d06acdcae3a222b2899e4f9d6b1b31fa564030[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jun 21 08:56:15 2022 +0200

    [lodestone] Mini PR comment refactor

[33mcommit f43679f6e155ab702af62c224609ee3840b6e32c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jun 21 08:30:18 2022 +0200

    [security-firebase] Disable logging

[33mcommit a374cc10813c7da154d8ae4e22d86cc478ebf343[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jun 21 08:20:55 2022 +0200

    [security-firebase] Remove fit and two warnings

[33mcommit 14706ca6d0adc0b0315b1064d7b08c7a3c37ca0f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jun 21 07:40:21 2022 +0200

    [security-firebase] Update firestore.json rules

[33mcommit 56f594c4195e765bdef0115575199fd8a5997ddc[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Jun 20 18:05:22 2022 +0200

    [security-firebase] Minor fixes and add another test

[33mcommit 3e20d0e4ddca82b42b5d844c604de1caee674751[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Jun 20 18:17:41 2022 +0200

    [lodestone] Minor PR comments

[33mcommit 38ae7f2e9be359479dcd09c5ca6d498318ae9829[m
Merge: 994b2cc58 a7a5fd5d4
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Jun 19 17:12:38 2022 +0200

    [MultitabManagement] Pulled develop and fixed conflict

[33mcommit 5cd334f2fa43fd5b03a77523a9e26c8cb2269c2a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jun 18 21:51:58 2022 +0200

    [security-firebase] Remove unneeded usage of RTDB and fix firestore rules

[33mcommit 94e78573d37ecc5563f370bd238ed7b15894d186[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jun 18 21:24:48 2022 +0200

    [security-firebase] remove databaseURL from firebaseConfig type

[33mcommit a891992c80c3edb86cdb49bf98137c9ef0dd6be4[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jun 18 21:05:28 2022 +0200

    [security-firebase] More action debugging

[33mcommit d70437bf00b9c5b0e3b3722147a97e3a3e9a5bcc[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jun 18 20:50:39 2022 +0200

    [security-firebase] Debug github action

[33mcommit 6c4892139f0df21274741efd83df8a54ff5de04b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jun 18 19:43:02 2022 +0200

    [security-firebase] Fix broken test

[33mcommit 6815f23c84e6c97c53ab64a18829c33597360cf3[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jun 18 18:28:21 2022 +0200

    [lodestone] Fix a bunch of warnings

[33mcommit c60eca73bd3b8ebe9e3b39dbb4061488b161d67f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jun 18 18:17:06 2022 +0200

    [lodestone] Improve lodestone and capture visual position

[33mcommit 8003b0f33bdf4679a62153bc2e4a6738662793eb[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Jun 18 15:55:27 2022 +0200

    [MartianChess] PR Comment and translation

[33mcommit 7554c5aac5383033de51461c17ecca901cb71eea[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jun 18 12:05:38 2022 +0200

    [security-firebase] Improve JoinerService tests

[33mcommit 2c225750d62716e4ae4e949d851283dd79027e11[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jun 18 11:57:38 2022 +0200

    [security-firebase] Role-based security tests for JoinerDAO

[33mcommit f982c4944a4afdb55eafa3364b113732d73a7681[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jun 18 10:13:24 2022 +0200

    [security-firebase] Expand PartDAO security tests

[33mcommit 73849daa1b2a9a947067a15d2aec112b867bacb4[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jun 17 08:59:07 2022 +0200

    [security-firebase] Fix some broken tests

[33mcommit 5adfb828b27d7c53c42eca00b0ffcac57336d496[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jun 17 20:44:40 2022 +0200

    [lodestone] PR comments

[33mcommit 4ad8436af089d8aa14c8b9a53439af19ba649014[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jun 17 20:35:55 2022 +0200

    [MartianChess] fixed translation

[33mcommit fefe6d059fee9980873bf8126ee381cedd7ae9d2[m
Merge: 06e199ecc a7a5fd5d4
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jun 17 19:45:46 2022 +0200

    [MartianChess] Pulled develop, fix conflict, and add temporary coverage 'from' local-game-wrapper

[33mcommit 1adbe183f848242d47a4604b2ae2f79654188dcc[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Jun 16 07:51:30 2022 +0200

    [lodestone] Update translations

[33mcommit 6e45b8f0a9d04a6915de9645d8f31e405337b454[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Jun 16 07:38:26 2022 +0200

    [lodestone] More PR comments

[33mcommit 7d431aa0976f09c0cce210395d00057a62232db3[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jun 14 08:18:06 2022 +0200

    [security-firebase] PR comments (partially)

[33mcommit 06e199ecc054c5a0d12da5948b05560dee1e2b10[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Jun 15 21:05:29 2022 +0200

    [MartianChess] Added indicators

[33mcommit c7a1cb6f00faf54d42ac921784798c6c49adac87[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jun 12 15:44:56 2022 +0200

    [lodestone] Remaining PR comments

[33mcommit a269c128dc2b8c57d5f10cec9a83cd02be0f5706[m
Merge: 3ed5f0049 a7a5fd5d4
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jun 12 12:00:58 2022 +0200

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into lodestone

[33mcommit 3ed5f0049e8701dd94e32f2394780181dad43642[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jun 12 11:47:44 2022 +0200

    [lodestone] Improve visuals by shifting pressure plates a bit from the board

[33mcommit 3f2260a9c2034a7c971c7ebe6fe681764b0dddc9[m
Merge: 8e0d2b3bf a7a5fd5d4
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jun 12 10:41:41 2022 +0200

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into security-firebase

[33mcommit a7a5fd5d467478ff27f8adb20e3e01b371a73f29[m
Merge: 6f54a7831 ed509a238
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jun 12 09:53:36 2022 +0200

    Merge pull request #25 from EveryBoard/unexisting-game
    
    Unexisting game

[33mcommit 8e0d2b3bf4c231290d71bbb1ae536276ff2efed0[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jun 12 09:52:34 2022 +0200

    [security-firebase] PR comments

[33mcommit 994b2cc58e35d5437f7c4dcafe4d9f42809314c1[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jun 10 21:02:54 2022 +0200

    [MultitabManagement] Display current part in header of non playing tab

[33mcommit e16a16812fc9b30cd8a77e0ff2ea350f1c33ecc5[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Jun 8 19:03:07 2022 +0200

    [BoostGoCoverage] Refactored Pylos to enhance its UX

[33mcommit d8dc9c0036d19011e6c45384d8a3d760957d5fac[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jun 5 17:59:48 2022 +0200

    [security-firebase] Use different firebase targets for different environments

[33mcommit c8d103dc7043cb9a4b56b663bca01a79f58bd24d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jun 4 22:48:43 2022 +0200

    [lodestone] Shift pressure plates for better visuals

[33mcommit d22e3d3869aae78006b3a8590f33c73d4a75f8d3[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Jun 4 14:39:03 2022 +0200

    [MartianChess] answer pull request comment and fix coverage

[33mcommit ed509a2385cf9f9a3858148d7404a00195f9514a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jun 3 22:34:36 2022 +0200

    [unexisting-game] PR comments

[33mcommit c661f0b9e7b70d0fb6fbea4ad47e748a26f082fe[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jun 3 19:27:09 2022 +0200

    [lodestone] Update translations

[33mcommit 23b8115609fe9c87fecca70fa56ecd43473e513b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jun 3 18:02:21 2022 +0200

    [lodestone] Fix translations

[33mcommit df1af79ed887423da86bec17c1feecc29767e461[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jun 3 16:56:07 2022 +0200

    [lodestone] PR comments

[33mcommit 548bd8b67d4a9b28527103075613e4dd421a7618[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Jun 2 20:47:33 2022 +0200

    [BoostGoCoverage] fix attempt for Encapsule Test

[33mcommit 7e29ce6cb008579a6fc995cbceb588787c3e9acc[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Jun 2 20:30:27 2022 +0200

    [BoostGoCoverage] Answered Pull Request Review Wave

[33mcommit 7b792b0d5454fe42f71b933d7cc55c2ce2a19573[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon May 30 21:37:37 2022 +0200

    [MartianChess] change color of the pieces of the mode view

[33mcommit 0add072b336382c2367c7217d9110f1d7b496756[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon May 30 20:31:25 2022 +0200

    [MartianChess] prevent minimax to call the clock

[33mcommit 43115a061db3aa4ae254d4285d6beb524682a98c[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon May 30 20:22:38 2022 +0200

    [BoostCoerceoCoverage] booster coerceo coverage and fixed it

[33mcommit 5172f811752ddda51c86dfa22c2a0642ea920b44[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun May 29 01:55:28 2022 +0200

    [lodestone] More PR comments

[33mcommit fe79374362d0f7b47c5511987f0891b9ed520c98[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu May 26 21:53:54 2022 +0200

    [BoostPylosCoverage] covered last pylos branch and fix minimax error

[33mcommit a8bc3e23469b6d6d387292fdb6d1010f654577a4[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu May 26 12:26:57 2022 +0200

    [BoostGoCoverage] fixed indentation and remove log

[33mcommit 5d42fe881b1b9687c071d7dc1991e12da68f99a1[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu May 26 12:05:55 2022 +0200

    [BoostGoCoverage] answer pull request comment 2

[33mcommit 0b21301b77dc2f285b70d6627b31fc26a12c439c[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu May 26 12:04:17 2022 +0200

    [BoostGoCoverage] answer pull request comment

[33mcommit f4a51c64878a069b32c7de40a21079ff9011f6d6[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue May 24 23:23:26 2022 +0200

    [lodestone] PR comments

[33mcommit ff1f80c02af1d1c8712014e15a785e5c68b3e63c[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun May 22 22:53:40 2022 +0200

    [MartianChess] Answer PR Comment, fix drone rule that was incorrect

[33mcommit 51e686d256ac7377f21c50be440ac4e2778e4565[m
Merge: 8c1858aee a2df83196
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat May 21 22:38:53 2022 +0200

    Merge branch 'MartianChess' of https://github.com/EveryBoard/EveryBoard into MartianChess

[33mcommit 8c1858aeefa2c7be70e9bf146e1a8e56b2edbccf[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat May 21 22:38:12 2022 +0200

    [MartianChess] fixed coverage bug

[33mcommit 298a5f5001431343b34b7be17cfac04e4c350342[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat May 21 22:03:52 2022 +0200

    [BoostGoCoverage] covered go entirely

[33mcommit 260c0639153e87ec04246601f66551d680d8fdfa[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat May 21 17:47:14 2022 +0200

    [lodestone] Update images

[33mcommit 3aae0b04cca196ea362dd6a13ec40435c2ac0412[m
Merge: 5470fd1c7 6f54a7831
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat May 21 17:43:11 2022 +0200

    Merge remote-tracking branch 'everyboard/develop' into lodestone

[33mcommit 3664652977ed2fddd4c334aa126f027a8274151f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat May 21 17:39:58 2022 +0200

    [unexisting-game] PR comments + fix test

[33mcommit 5662bf44447d9fdb991fd3b49f8b2a587f1c0cb8[m
Merge: ad1bd879f 6f54a7831
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat May 21 14:08:26 2022 +0200

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into unexisting-game

[33mcommit a2df83196f17c47011e5ea34d6fa75c6a89bb52c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat May 21 07:03:35 2022 +0200

    [MartianChess] Add images

[33mcommit 894a2da30ad0dd8975782319e96082ee11749c54[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri May 20 22:49:48 2022 +0200

    [security-firebase] Small joinerservice refactor

[33mcommit aae09b6ff16dcb6e5500a61cf3f4b0a5780d0164[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri May 20 20:25:08 2022 +0200

    [MartianChess] added fr.json file

[33mcommit 0a846c69839464381f3d8ac9e8b4d8f82f830866[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri May 20 19:25:45 2022 +0200

    [MartianChess] Fix translation again

[33mcommit b3723bbee5215854acfd1e374f242511eb8ef4b4[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri May 20 18:54:47 2022 +0200

    [MartianChess] update coverage and translation

[33mcommit 7aab50a48c57d457115e3abc098b6a1e577f4edc[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri May 20 08:22:53 2022 +0200

    [security-firebase] Use more MinimalUsers

[33mcommit 65713bc56fc3ad0bfb939ff78addf19d5cfa5697[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu May 19 22:17:45 2022 +0200

    [MartianChess] fixed Siam UX

[33mcommit 474654b06260b328202df1b2227a5e8ac6f486ed[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu May 19 22:17:08 2022 +0200

    [security-firebase] Full coverage

[33mcommit 5e61143cf3f40d1ab2f7b9e61e8c22371317d3db[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu May 19 20:14:47 2022 +0200

    [MartianChess] Pull Request Review Comment Response

[33mcommit 8cee44340e905641f666db4f5f940dc165106430[m
Merge: 3a3621228 6f54a7831
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu May 19 20:07:13 2022 +0200

    [MartianChess] pull develop, fix conflict, and continued answering pull request comment

[33mcommit e82ab6cb41b686cd4c1db295f83e024da39b247e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu May 19 08:57:22 2022 +0200

    [security-firebase] Improve coverage

[33mcommit 3a3621228241500409fd5931ee0de20f2d87c4f8[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed May 18 21:09:57 2022 +0200

    [MartianChess] Fixed main look of martian chess selected pieces

[33mcommit 5493e2aa624f44cfcaa95a7f5e40d864627dbfd9[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue May 17 22:04:59 2022 +0200

    [security-firebase] linter

[33mcommit bf2854ab4140645664133e7e46adcbf08ef1f396[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue May 17 09:00:58 2022 +0200

    [security-firebase] Polish joiner security

[33mcommit 64c037be10471a5d027327da11965afc0643a4ee[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon May 16 17:52:04 2022 +0200

    [security-firebase] Fix broken tests after merge

[33mcommit e438d053402af2dc5ea65b927842820be4fb11c5[m
Merge: 6408933c7 6f54a7831
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun May 15 08:38:25 2022 +0200

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into security-firebase

[33mcommit 6408933c7f049dc8acd1b4e4afc63719d5a7ab40[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri May 13 22:00:06 2022 +0200

    [security-firebase] WIP Tests for part security

[33mcommit e5ea2c63436ed528e2b3955cf8f9ad4752a7bca7[m
Merge: 3891b2408 6f54a7831
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Fri May 13 21:57:17 2022 +0200

    Merge pull request #32 from EveryBoard/develop
    
    Master 3

[33mcommit 6f54a7831bce10c6563eaaa9f8865819ddb6160d[m
Merge: b9e8a48a8 e81e124ba
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri May 13 20:46:46 2022 +0200

    Merge pull request #17 from EveryBoard/FalselyDisconnectedBug
    
    Falsely Disconnected Bug

[33mcommit e81e124ba4b101a0d3bc5a9b94bd2d8cc652e8e8[m[33m ([m[1;31morigin/FalselyDisconnectedBug[m[33m)[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri May 13 20:31:56 2022 +0200

    [FalselyDisconnectedBug] fix translation and lint

[33mcommit 0edef6ba6265bad6b502b2a6118d648bef5bd931[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri May 13 20:22:45 2022 +0200

    [FalselyDisconnectedBug] fix coverage even more

[33mcommit 2a5e4fb5bfc9f65d925777d90b1b7f8a5de67f51[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri May 13 18:53:07 2022 +0200

    [security-firebase] Fix most tests except part-creation

[33mcommit 0667724ec2ca71a3ce2c3837fc8438d4a938a522[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri May 13 18:43:36 2022 +0200

    [FalselyDisconnectedBug] Pull Request Comment

[33mcommit 534d59006dc5cd26697b623de4fc4143acdcc7e1[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri May 13 08:42:26 2022 +0200

    [FalselyDisconnectedBug] fixed coverage 2.5

[33mcommit 06a5255090aa15dd9845effee111169648909da9[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri May 13 08:39:30 2022 +0200

    [FalselyDisconnectedBug] fixed coverage 2

[33mcommit 37b62acaaa926c3278b7b2aaac2c4ff896b89874[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri May 13 08:38:06 2022 +0200

    [FalselyDisconnectedBug] fixed coverage for real

[33mcommit 7c5cce9f63c7055603a6a43b794d4ebb51ae2600[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri May 13 08:36:07 2022 +0200

    [FalselyDisconnectedBug] fixed coverage

[33mcommit 0f31ae7e93b1b1f246d81ba9c65dffeb105bb56a[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri May 13 08:19:58 2022 +0200

    [FalselyDisconnectedBug] fix toasting

[33mcommit b9e8a48a8073b292bfd15c2859914428a69afe44[m
Merge: bf8108f25 b6d400385
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Thu May 12 18:44:58 2022 +0200

    Merge pull request #30 from EveryBoard/license
    
    [license] Add license and contribution information

[33mcommit 3baf72c89e636919d9f2ed7815e28c99cda8dcdd[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu May 12 08:01:43 2022 +0200

    [FalselyDisconnectedBug] changed test expectation to match fuseau horaire of testing server

[33mcommit 59aea3da013c6e67df34c4c2c85116a4b6c2cf35[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu May 12 07:41:16 2022 +0200

    [FalselyDisconnectedBug] fix coverage file and translation

[33mcommit f3e4ff23d0489680c8423c8a391a9fb1c6c9e44d[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu May 12 07:34:36 2022 +0200

    [FalselyDisconnectedBug] Change user subscription way in partCreationComponent

[33mcommit ad1bd879fcf82f6cbe925354bf0f2eae3fac2875[m
Merge: a90ac7c32 bf8108f25
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed May 11 08:04:14 2022 +0200

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into unexisting-game

[33mcommit a90ac7c32e232673e88a5760652c9a53644b4cec[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed May 11 07:56:22 2022 +0200

    [unexisting-game] PR comments

[33mcommit 56c038f21fc28da501aa330559c194106ccd3ed8[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed May 11 07:47:29 2022 +0200

    [security-firebase] WIP

[33mcommit 0bde63439791dae45bb8e61cd83eaa742241b99b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon May 9 18:19:45 2022 +0200

    [security-firebase] WIP joiner security before moving to candidates collection

[33mcommit 880a65db9c9bee2ff25f5f37c2a8077cd4748b5c[m
Merge: db56def1a bf8108f25
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun May 8 18:03:52 2022 +0200

    [FalselyDisconnectedBug] Pulled and merged develop

[33mcommit db56def1ad81dd7ead5754fc03e7e948c4118cc3[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu May 5 21:18:50 2022 +0200

    [FalselyDisconnectedBug] generated coverage files

[33mcommit 4c6e512278a681c5254b0dd4d21cd8601d8519ef[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu May 5 21:17:25 2022 +0200

    [FalselyDisconnectedBug] Done done to TODOTODO

[33mcommit 42aab2773652001be568b214622cc430a86cbc20[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu May 5 20:08:03 2022 +0200

    [FalselyDisconnectedBug] PR Wave 1

[33mcommit 10f94c72997c5d898a8b8c84ce555657dae954af[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue May 3 16:45:41 2022 +0200

    [security-firebase] Refactor user creation in tests

[33mcommit 866413f5d99ed8c31dcacb05da459f874807f641[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue May 3 16:22:43 2022 +0200

    [security-firebase] Setup for part security

[33mcommit 3256749a98e7ca98483bb5b0f7c7f690de711cb2[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue May 3 15:17:11 2022 +0200

    [security-firebase] Further improvements to joiner security

[33mcommit 275b64bb2c7a7cdefae5c83ad77045aeaac8258e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue May 3 13:17:34 2022 +0200

    [security-firebase] WIP improve security of joiners (partially)

[33mcommit b87b20a98b01ddc167e502ab721768e15d2d50a2[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon May 2 21:02:05 2022 +0200

    [MartianChess] PR Wave 1

[33mcommit 1d667e0dfa80d944f6152be353e37675d1c8b17e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon May 2 18:34:14 2022 +0200

    [security-firebase] WIP setup for joiner security

[33mcommit 5470fd1c7750f3f8c8f3c5877c3ee6177e3f60b9[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon May 2 07:33:15 2022 +0200

    [lodestone] Fix lodestone visuals

[33mcommit 066b900bc75a08a8f78f67a6da72c47948e66425[m
Merge: e35bf1ad9 bf8108f25
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun May 1 21:56:47 2022 +0200

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into lodestone

[33mcommit e35bf1ad98a7bf1e57bccd3eeb4c63784586d783[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun May 1 21:54:24 2022 +0200

    [lodestone] PR comments

[33mcommit f7c93a62f81c4e02e9163a8f21af4f574aeda6d8[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun May 1 20:30:22 2022 +0200

    [MartianChess] pawn fixed; tuto covered; capture visibles

[33mcommit 745931048ca6629ecea4ee25a4b2834b85601a1f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Apr 30 10:23:42 2022 +0200

    [security-firebase] Minor changes

[33mcommit fcbb04ca3ca41b66969158c4de18a64f1ae294d4[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Apr 28 19:44:35 2022 +0200

    [FalselyDisconnectedBug] change toast to display username and not userid

[33mcommit 5116f0f8179b2dec37bdfdffce0b6455dccfab2f[m
Merge: c8aa09998 bf8108f25
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Apr 27 19:34:36 2022 +0200

    [MartianChess] pulled develop and fixed conflict

[33mcommit be6ae1a0cbe968691f425f8dbebaa6b45e46e574[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Apr 27 08:18:17 2022 +0200

    [security-firebase] Fix tests

[33mcommit c8aa09998122f36e549fb87a8f3ed26b1266f92c[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Apr 26 19:35:40 2022 +0200

    [MartianChess] ready for review

[33mcommit 5d48675376c6cf8efa3fbb7f30b6f9b367507121[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Apr 25 08:37:41 2022 +0200

    [security-firebase] Improve player security

[33mcommit bf8108f25f38cec0c4cee62b0de652f54ad1f074[m
Merge: 7124ac511 74c7df5ef
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Fri Apr 22 20:51:05 2022 +0200

    Merge pull request #29 from EveryBoard/popup-blocked
    
    Popup blocked

[33mcommit 74c7df5ef2949f5e945524aace0a4bd4a2babea0[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 22 20:23:52 2022 +0200

    [popup-blocked] Update tick

[33mcommit 2f9a47c7c955d50f3c782def9bf19dea2ca88584[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 22 20:05:21 2022 +0200

    [unexisting-game] Rename firebase to firestore when it makes sense

[33mcommit c714cedf786e7e0ce5dc8216ba57b31feb6ffbde[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 22 08:00:22 2022 +0200

    [unexisting-game] Remove unneeded import

[33mcommit 84c342f8468716558d801045ea272762c5fb714f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 22 07:52:46 2022 +0200

    [unexisting-game] PR comments

[33mcommit 255339ff90888e481b6ac3661c4cb06e6b537ab7[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Apr 20 21:09:46 2022 +0200

    [MartianChess] Work In Progress, mostly done

[33mcommit ef3471f7cf6b28bdfe52628bb89bc8a6c0829115[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Apr 19 21:57:08 2022 +0200

    [popup-blocked] Remove unneeded tick

[33mcommit 508f20181ac86e49db3afdf1f33cab7fc157b809[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Apr 19 21:41:25 2022 +0200

    [unexisting-game] Fix build

[33mcommit 1bb03c4b27befe23ac538968ade839a8dd0fcfbe[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Apr 19 08:10:03 2022 +0200

    [lodestone] Fix broken minimax

[33mcommit 82ac7d8cb0377e96d3998ff084a9553cadf72d3b[m
Merge: 3a51e19d0 7124ac511
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Apr 19 07:28:34 2022 +0200

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into unexisting-game

[33mcommit 3a51e19d0e8473dbfa5936ed5e805da8b20d0cc9[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Apr 18 21:57:02 2022 +0200

    [unexisting-game] Coverage

[33mcommit 9b9576009c11eaab7214487e6e5eb0ef002c1a06[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Apr 18 19:35:58 2022 +0200

    [unexisting-game] Linter rules

[33mcommit f6a288d0240f979622f70ed4fe2ea2b7556bb77f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Apr 18 19:11:43 2022 +0200

    [unexisting-game] PR comments

[33mcommit 827255b2589961b4d05470e3d871a9cdf67b5973[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Apr 17 19:00:44 2022 +0200

    [lodestone] Update index

[33mcommit aa66d8434b7221dcfb3fa682aa57b5b46930e5e9[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Apr 17 15:41:47 2022 +0200

    [lodestone] Recover full coverage

[33mcommit a6d1fd042f310ff29c4d675c517b2f314f26cbb9[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Apr 17 14:44:39 2022 +0200

    [lodestone] Fix broken tests

[33mcommit 0980e911e6ed1b544eead9b7c9476e5d54968930[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Apr 17 14:20:26 2022 +0200

    [lodestone] Update tuto

[33mcommit b46d6e74937e50a723c9bb02c0e60aad01d53adf[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Apr 17 14:06:35 2022 +0200

    [lodestone] Support showing solution in click steps for tutorial

[33mcommit 44f275d3efdfccbf75a81b71402700cb9794d512[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Apr 16 22:40:57 2022 +0200

    [lodestone] Further component improvements

[33mcommit 745b2b0d68917806d872fd218eb46b15a82c1397[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Apr 16 20:34:59 2022 +0200

    [lodestone] Enable removing temporary captures

[33mcommit 47937e0f645ed5e0877a83442a9e915b597f21a3[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Apr 16 14:20:01 2022 +0200

    [lodestone] Improve state difference visualization

[33mcommit 0c72becb67d486d9d353d99707777b7a40ce8c0e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Apr 16 13:07:23 2022 +0200

    [lodestone] Improve visuals, fix falling lodestone bug

[33mcommit bc33d66d76e03721c412db2d3328a459b2a31110[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 15 21:08:28 2022 +0200

    [lodestone] Better placement of captures, above the board

[33mcommit a15f2b217da5cdd97e6290a7df4299aa3163f0ce[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 15 20:51:08 2022 +0200

    [lodestone] Center board properly

[33mcommit b6d4003854b69666a54fbfe7e39b795740ad70f4[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 15 18:10:37 2022 +0200

    [license] Add license and contribution information

[33mcommit 753ada81c8387b543190d6bf26376c5a46e52819[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Apr 14 08:09:46 2022 +0200

    [popup-blocked] Forgot to stage changes of previous commit...

[33mcommit 497a5fc3b81c4fc101592aad20c4ac7b790ac738[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Apr 14 07:04:23 2022 +0200

    [popup-blocked] Add an extra test and fix the broken ones

[33mcommit 18fecae9ecf245bcf030ccfe978ccd14c0c2234b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Apr 14 06:59:14 2022 +0200

    [popup-blocked] Clarify error messages

[33mcommit 7affd3c2c856df8b461fe286e1a3541dd8ec7190[m
Merge: 258460b3c 7124ac511
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Apr 13 08:26:56 2022 +0200

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into lodestone

[33mcommit 258460b3ce2614eae5e2b2c5b1b4044f25b1fedc[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Apr 13 08:19:05 2022 +0200

    [lodestone] Small refactors and fixes

[33mcommit 108ab7ccb4a306a9ef2f68986dc883b0f2180fdc[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Apr 13 07:58:35 2022 +0200

    [lodestone] More tests for dummy minimax

[33mcommit 57cf0eb091b80bfbfe8549e61e200f2f175ef9ad[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Apr 13 06:56:30 2022 +0200

    [lodestoe] Translations

[33mcommit 7124ac511da689b150e017428972c76391a8862f[m
Merge: 7f6067719 a06c789dd
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Tue Apr 12 20:11:21 2022 +0200

    Merge pull request #24 from EveryBoard/playerornone
    
    Introduce PlayerOrNone and Player distinction

[33mcommit fce20d38f2ed3961cd75d072dc505de9722e9b84[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Apr 12 08:34:14 2022 +0200

    [lodestone] Tutorial

[33mcommit 2b2d52a4053f31c9d4f71218c2abcd1fd7a77daf[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Apr 11 21:48:24 2022 +0200

    [lodestone] Add minimax, start tutorial

[33mcommit 16bba1a158c328b6f6a6e827adb9fb3d647f0ee6[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Apr 11 06:52:39 2022 +0200

    [lodestone] Full coverage

[33mcommit 98a0e6984e8a4a8a7b52605e3a337dd22933f837[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Apr 10 10:56:31 2022 +0200

    [lodestone] WIP, prepare for full coverage

[33mcommit a06c789dd666168bd683717fad2ef5305b728c46[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Apr 10 08:11:12 2022 +0200

    [playerornone] Remaining PR comments

[33mcommit 7c7015e2796635710beeeb5782bfe435b5ebb1d4[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Apr 9 23:36:08 2022 +0200

    [unexisting-game] Update translations

[33mcommit 3eb0ea6dc7fde66bd50264dcc9cf21302d662a36[m
Merge: 327757d27 7f6067719
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Apr 9 23:31:15 2022 +0200

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into unexisting-game

[33mcommit 327757d27fedac7fa4202623f48c4fd6b752125f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Apr 9 14:08:59 2022 +0200

    [unexisting-game] Improve unexisting game behavior

[33mcommit 54dfe81e125d8716454de3bf34f4ed32c760ad37[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 8 19:08:34 2022 +0200

    [playerornone] Update karma numbers, again

[33mcommit 0982944a599bd96a9be1680b96710158d071eb70[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 8 19:03:08 2022 +0200

    [playerornone] Update index.html

[33mcommit aed75774cd6991d5657427e8b6d1c8e18e0a428b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 8 18:59:45 2022 +0200

    [playerornone] Fix uncovered branch

[33mcommit a91a32d5a702f9c1aecb66bfd2ed25ce9699ddfe[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 8 18:41:34 2022 +0200

    [playernone] Decrease coverage percentage, as there are now less lines

[33mcommit 9fc11a52d72cd96df48b04d97abbf6d3219999d8[m
Merge: 4ccfbf81c 7f6067719
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 8 18:25:36 2022 +0200

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into playerornone

[33mcommit 4ccfbf81c3747e7f505ba440eb860abe36f9b221[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 8 18:25:08 2022 +0200

    [playerornone] PR comments

[33mcommit 2c7b65cb87fb0d95ce019e0da66b326903975661[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 8 08:36:39 2022 +0200

    [lodestone] Final required component test

[33mcommit e42435e79dd0ecfaf259e9a47be14778fafdccb7[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 8 08:20:58 2022 +0200

    [lodestone] More component tests

[33mcommit 8c692ce03227505a999fb1ff3c68fee09eb436e8[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Apr 7 08:42:04 2022 +0200

    [lodestone] Fix a few more tests

[33mcommit 44d1ef758adf65cbfb6b041b431ca064a628b92e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Apr 7 08:20:42 2022 +0200

    [lodestone] More progress on component

[33mcommit bc9470e0b96de8d27b952103c6f514873d1c33a0[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Apr 6 08:30:17 2022 +0200

    [lodestone] Further progress on component

[33mcommit 1d8f94540d1cd2d4e7d984944fb7d988b5fb91c2[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Apr 5 08:55:53 2022 +0200

    [lodestone] Better handling of pressure plates in component

[33mcommit 9e6474bb89544596a6011f97680b63e6663ddcf4[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Apr 5 06:53:56 2022 +0200

    [lodestone] Show pieces on pressure plate

[33mcommit 5c166e39478788b5f350cd34851c23af308ac2e8[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Apr 4 17:06:54 2022 +0200

    [lodestone] Progress on component

[33mcommit bc947be23a5dc3d1ab6cd12e15d3c23dc16da342[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Apr 3 19:11:55 2022 +0200

    [playerornone] PR comments: homogenize

[33mcommit f09533ab5ec432e5dec17db13accd4bc69236069[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Mar 29 07:55:40 2022 +0200

    [lodestone] WIP component and their tests

[33mcommit 7f6067719e4793aea7907b5c1c652d7e83762549[m
Merge: 73566ffe4 4b52e5a40
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 1 22:49:26 2022 +0200

    Merge pull request #22 from EveryBoard/chat-security
    
    Improve chat security

[33mcommit 4b52e5a406cb55e9f07a05f3f7b94c4aed50c794[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 1 19:13:34 2022 +0200

    [chat-security] PR comment: add comment

[33mcommit 5629ad2f3142ba2c2beeae2521cab8be8bd1e0ef[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 1 19:12:02 2022 +0200

    [chat-security] PR comments

[33mcommit 997da5489f61db879e59f47d8411843b3d4175b5[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Mar 29 08:51:43 2022 +0200

    [chat-security] Enable dot-notation rule

[33mcommit 561fedd4fcaa0d745cdc5b0b8c2001317e6873c3[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Mar 29 08:48:22 2022 +0200

    [chat-security] PR comments

[33mcommit b53a125dbe536b3e18fecedf3dddb7c94b8f3dca[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Mar 28 18:15:14 2022 +0200

    [lodestone] Display pressure plates

[33mcommit 240e47ec2f6b86e51f53e802a9e7a048750e3eb5[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Mar 21 19:36:00 2022 +0100

    [playerornone] Fix linter

[33mcommit 86d8fa0afbdd7f98969e1c477427cc835ea64396[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Mar 21 19:21:59 2022 +0100

    [playerornone] PR comment to have PlayerOrNone.isPlayer()

[33mcommit 8dd85b2880dd7264cf8d912a026680b1419ffb38[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Mar 21 19:08:06 2022 +0100

    [playerornone] PR comment to weaken some types

[33mcommit a3528f8f75bcf721286a559fb27edb7bf1d3870a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Mar 21 18:58:56 2022 +0100

    [chat-security] Fix improper import

[33mcommit 2d22953beba7089c0d73e72a1427de82f45dea3d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Mar 20 20:55:48 2022 +0100

    [chat-security] PR comment + fix test

[33mcommit 48bd962651777efec22b46ff1fc176a5f974b2e0[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Mar 20 19:08:29 2022 +0100

    [lodestone] WIP component + fix pick-game text

[33mcommit 2f53b5b9052d88ce62adb17cb5b77d95561d5bb0[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Mar 18 19:32:27 2022 +0100

    [lodestone] Rules and their tests

[33mcommit 3540d42555e88cca009399e81cc3a79538dda174[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Mar 16 08:05:27 2022 +0100

    [chat-security] PR comments

[33mcommit 34b4535ee31abf5b4bd1b1c908fc5e5fb9d53a20[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Mar 16 08:01:03 2022 +0100

    [lodestone] WIP

[33mcommit 3891b2408210815eb009535b0bce5cf40e4b0919[m
Merge: 3b7a59d06 73566ffe4
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Fri Mar 11 22:00:43 2022 +0100

    Merge pull request #27 from EveryBoard/develop
    
    Fix CI/CD for master

[33mcommit 73566ffe4e13242be22fa93d8b1fb74a078f9960[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Mar 11 21:57:21 2022 +0100

    Fix CI/CD for master

[33mcommit 3b7a59d06f13b5b275e0b04de10953c2be3b1314[m
Merge: 524979a59 1fdb23eb9
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Fri Mar 11 19:41:37 2022 +0100

    Merge pull request #26 from EveryBoard/develop
    
    Everyboard Master 2

[33mcommit 4377a59e4d5b085439198230954f9aa31691d5f5[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Mar 11 08:24:14 2022 +0100

    [unexisting-game] Translate new message

[33mcommit d60a17d54651c181d9285a975486b6118043c1e6[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Mar 11 08:16:16 2022 +0100

    [unexisting-game] Refactor & cover object utils

[33mcommit 9deb6d1e886564d59bc6b2d01e6c55f30019c070[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Mar 10 08:51:30 2022 +0100

    [unexisting-game] Fix tests

[33mcommit f4c18d52aa68f57f420113956df1c1fbaa85f3f3[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Mar 9 08:35:07 2022 +0100

    [playerornone] Player.NONE is removed for PlayerOrNone.NONE

[33mcommit 364e3314bb26bf3f48beee73d583ca9688bebee0[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Mar 9 08:08:19 2022 +0100

    [chat-security] Fix linter

[33mcommit 021f48157fbf1b0fa67154cb67f6c17f392c1ef2[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Mar 9 07:54:01 2022 +0100

    [chat-security] PR comments

[33mcommit 41553552b7f90a1e8a422cf0c8f6bcb2eb68355f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Mar 7 08:32:57 2022 +0100

    [unexisting-game] WIP remaining coverage

[33mcommit 67d9dab23e0579c540ecc27b43bac1438e1d94aa[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Mar 5 07:27:19 2022 +0100

    [unexisting-game] More coverage

[33mcommit 1bca979c38f95d505432897e3310c988e24c488f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Mar 4 22:30:48 2022 +0100

    [unexisting-game] GameWrapper now redirects to / if game does not exist

[33mcommit 91a0646bc0781afb071e98e8000dcecc11ab8772[m
Merge: f2e81ff3f 1fdb23eb9
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Mar 4 20:00:04 2022 +0100

    Merge branch 'develop' of https://github.com/EveryBoard/EveryBoard into FalselyDisconnectedBug

[33mcommit c86d9d8c435d62a103aa2e324de417809de8fd5e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Mar 4 08:13:33 2022 +0100

    [playerornone] Fix linter issues

[33mcommit c2af5ceeaf593ce225be04f30e5a89b27b8010a7[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Mar 4 07:57:20 2022 +0100

    [playerornone] Cover missing pieces

[33mcommit cad75e601c6fcfca93669c02813802c34f62b2c5[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Mar 3 21:14:51 2022 +0100

    [MartianChess] work in progress

[33mcommit e0dbe6812dd267efd3c1a20b7efe26117e879aa0[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Mar 3 08:36:33 2022 +0100

    [playerornone] Adapt test code

[33mcommit e3d14de089920f06b24be97f7cae0822ae3059c6[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Mar 3 08:01:44 2022 +0100

    [playerornone] Introduce PlayerOrNone type and use it everywhere necessary

[33mcommit f2e81ff3f915309d6e79d36bd3570646ad37d3ea[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Mar 2 19:06:27 2022 +0100

    [FalselyDisconnectedBug] coverage.csv generated

[33mcommit 2bae8d562ed67ab21deba255c13c0c22cc019479[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Mar 2 19:04:59 2022 +0100

    [MartianChess] Created Move Class

[33mcommit 95027d48137d14c6e881618df00d3d83d4f613c2[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Mar 2 08:12:16 2022 +0100

    [chat-security] Add extra tests for DAO & chat display

[33mcommit b6c1a4e4598c5bdab77281f4e3d16829018981da[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Mar 2 07:02:59 2022 +0100

    [chat-security] Fix FirebaseFirestoreDAO subDAO creation

[33mcommit 0ca2b90a352e6f1146e876781195e2dee3d41968[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Mar 1 18:29:42 2022 +0100

    [FalselyDisconnectedBug] PR Comment and complete translation

[33mcommit 419ef3c158f67e8932dd407c2870a037287b7359[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Mar 1 17:22:06 2022 +0100

    [chat-security] Minor fix

[33mcommit e219d5490a4d15dbf70a3b8dec0c18cc9c5fd381[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Feb 28 20:07:32 2022 +0100

    [FalselyDisconnectedBug] PR Wave 1 and renaming

[33mcommit 183f7748f63e2f8c814d638493e8798d1b40e071[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Feb 28 20:07:26 2022 +0100

    [FalselyDisconnectedBug] PR Wave 1 and renaming

[33mcommit 97a3b1e4249962abd087c3a571086421331f7482[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Feb 28 17:41:33 2022 +0100

    [chat-security] Update translations

[33mcommit 3c43c943cc6acaa0c35ec2087da753bb7e4483e4[m
Merge: 3c172e0c0 1fdb23eb9
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Feb 28 17:40:40 2022 +0100

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into chat-security

[33mcommit 3c172e0c0215dace64bcbaa7d1655a461c9bd8dc[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Feb 28 17:39:28 2022 +0100

    [chat-security] PR comments

[33mcommit 1fdb23eb90e47a5b7332718bff37f9d778972a2c[m
Merge: 9a561f442 7d118fed0
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Mon Feb 28 08:47:11 2022 +0100

    Merge pull request #23 from EveryBoard/connectivity-fix
    
    [connectivity-fix] Fix improper timestamp use in ConnectivityDAO

[33mcommit 21feb4ceaf6ec99f602db90e9b2bcc35c6dd2d65[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Feb 28 06:49:35 2022 +0100

    [chat-security] Fix linter

[33mcommit 7d118fed0d7e6c54b1a84907f7b7ca8b5da4720b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Feb 27 21:17:14 2022 +0100

    [connectivity-fix] Fix improper timestamp use in ConnectivityDAO

[33mcommit 32d1437ee68744174aecbf0c42a62d24715793c3[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Feb 27 17:45:32 2022 +0100

    [FalselyDisconnectedBug] coverage csv updated

[33mcommit 998190e53a491f6697062802ca1f333b57709d6d[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Feb 27 17:44:19 2022 +0100

    [FalselyDisconnectedBug] bumped back coverage

[33mcommit 3a0efd559aa87d8762c236f8c97fd0739c5efbc2[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Feb 27 11:04:08 2022 +0100

    [chat-security] Delete chats before part in part-creation

[33mcommit d3185de65c470d851592ea9f4c7cd640da38cffe[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Feb 27 10:52:56 2022 +0100

    [chat-security] Add chat deletion tests

[33mcommit 8ca52835ccdcc21279ee85776de058a576996763[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Feb 27 10:04:55 2022 +0100

    [chat-security] Minor remaining fixes

[33mcommit 6e47460c2524552a77de9c7617b06c8f30937f7a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Feb 27 09:43:54 2022 +0100

    [chat-security] Fix DAO mock

[33mcommit 225762d9e58dbb2327009984c40e7eaf3d5b8a47[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Feb 26 22:16:59 2022 +0100

    [chat-security] Display chat time, filter local doc creation in DAOs

[33mcommit f8dfd40cdd01391356c2f088cfe3419437d0bbde[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Feb 26 09:23:26 2022 +0100

    [chat-security] Restore part of the coverage

[33mcommit 90f4c4fdf1380d9cc6e547906490276e12534f5f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Feb 26 08:58:50 2022 +0100

    [chat-security] Security rules for other chats

[33mcommit a2c36f0ba0e48c4a5f768daa8dad3ba605803d87[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Feb 24 19:52:18 2022 +0100

    [FalselyDisconnectedBug] Fixed tests; work in progress

[33mcommit d0a9b61e1e7cefab4e8c042ff0e75133f40f1f29[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Feb 23 08:27:41 2022 +0100

    [chat-security] Rules for the lobby chat

[33mcommit 2328417c0040fe0553929a54b2b5e8f6f842e9fa[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Feb 23 06:59:54 2022 +0100

    [chat-security] Fix chat component

[33mcommit c922cb159e4f0eeb10a80c2fd23e86670d5d3c36[m
Merge: b65c86ef0 9a561f442
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Feb 22 19:51:44 2022 +0100

    Merge branch 'develop' of https://github.com/EveryBoard/EveryBoard into FalselyDisconnectedBug

[33mcommit b65c86ef09e30e425e90b4cf8d989977ced6e0d8[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Feb 22 19:51:33 2022 +0100

    [FalselyDisconnectedBug] wip; fixed chat issue, removeObservedPart issue; start observing user sooner

[33mcommit 9a561f442a35af9bc070da571693556fdb2194a1[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Feb 21 21:33:58 2022 +0100

    [ci] Try to fix dev deployment

[33mcommit 3b6619d8ca371d85fcee0165ddc84c1db390ff07[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Feb 21 21:31:26 2022 +0100

    [chat-security] Restructure chat schema

[33mcommit da8c49a6133296d0aff8f265c5afc38d2f5d2a01[m
Merge: a07d09226 e50429189
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Feb 21 20:04:15 2022 +0100

    [FalselyDisconnectedBug] pulled develop and fix conflict

[33mcommit a07d0922611caf58fc59143b0330dc9adffe613a[m
Merge: 8e21d9ce8 75222d171
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Feb 21 19:55:10 2022 +0100

    [FalselyDisconnectedBug] pulled develop and fix conflict; BROKEN

[33mcommit e5042918985536f26663a0b606651342c1584b04[m
Merge: 75222d171 6c7a71515
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Mon Feb 21 07:50:31 2022 +0100

    Merge pull request #21 from EveryBoard/css-card-spacing
    
    Css card spacing

[33mcommit 8e21d9ce878d1c2ef67a36e76ff0e082ece8fefe[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Feb 20 16:45:52 2022 +0100

    [FalselyDisconnectedBug] small changes

[33mcommit e49e98818d9cf363ac11ce58ad001277ddc0e4e3[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Feb 20 13:57:24 2022 +0100

    [FalselyDisconnectedBug] fix header component test which did not make sense

[33mcommit 430e4f3f0c6d825af861c11b5ce0da8e77f89ef5[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Feb 19 23:43:28 2022 +0100

    [FalselyDisconnectedBug] enhance test, fixed them all, wip

[33mcommit 6c7a71515eca376ddddefd8eb86b59434cff3c3d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Feb 18 08:08:58 2022 +0100

    [css-card-spacing] Improve coverage

[33mcommit 2d716daf550d85b8a9a8a60473f46ba1a570aac7[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Feb 18 07:07:07 2022 +0100

    [css-card-spacing] PR comments

[33mcommit bda96af1975f592428dc32300eb5f1339338247d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Feb 17 17:36:07 2022 +0100

    Merge + fix circularity error

[33mcommit b2fd9892609efaf3c128943eca18a6a15cd8269f[m
Merge: 0312872ac 75222d171
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Feb 16 08:08:25 2022 +0100

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into css-card-spacing

[33mcommit 0312872ac78a953897112acf8001735e3812e64a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Feb 16 08:07:39 2022 +0100

    [css-card-spacing] PR comments

[33mcommit 75222d1718baa39bc75485a7f4fb173978282e85[m
Merge: df8599e70 92f155aa3
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Wed Feb 16 07:20:14 2022 +0100

    Merge pull request #18 from EveryBoard/dependencies
    
    Update dependencies and cleanup auth service

[33mcommit 7bf7e648ece67e810d3709b6596c9650e63f778b[m
Merge: 24e92b37f df8599e70
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Feb 15 22:02:34 2022 +0100

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into css-card-spacing

[33mcommit 24e92b37fe739a228ff1e9083e3c706257de6b13[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Feb 15 19:34:50 2022 +0100

    [css-card-spacing] Use rem instead of px, move setting to global css file

[33mcommit 92f155aa3fe0104e2663b184696977c164d1d543[m
Merge: a86092c67 df8599e70
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Feb 15 19:32:11 2022 +0100

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into dependencies

[33mcommit a86092c67789837daddd99b0b1c682a2c63becdf[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Feb 15 08:29:13 2022 +0100

    [dependencies] npm audit fix for critical dependency

[33mcommit df8599e70053ec374aa13e9ef1834f40d82f192a[m
Merge: ec82d3798 e256a3530
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Tue Feb 15 08:23:12 2022 +0100

    Merge pull request #11 from EveryBoard/logerrors
    
    Log errors in DB

[33mcommit e256a353053530e7ab189d568004e104f99a7e44[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Feb 15 08:15:04 2022 +0100

    [logerrors] Fix broken test due to message change

[33mcommit ef6ee22461904af1355f64e9b00896eb719d7b17[m
Merge: 588cd3b7a ec82d3798
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Feb 15 08:02:09 2022 +0100

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into logerrors

[33mcommit 588cd3b7a70532566abbd76ec4d73d3515458e9b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Feb 15 07:54:21 2022 +0100

    [logerrors] PR comments

[33mcommit 6aa51b1f505dc7ca9dbdb2bb9deb1ea86e237df5[m
Merge: 02f328525 ec82d3798
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Feb 15 07:41:41 2022 +0100

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into dependencies

[33mcommit 02f328525e222ce47b75b9c716c2f90d84a403b1[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Feb 15 07:33:07 2022 +0100

    [dependencies] PR comment

[33mcommit 18b86089fbcd0785fdd6eab255968447e79f7bd6[m
Merge: 37bde5acd ec82d3798
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Feb 14 19:40:28 2022 +0100

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into css-card-spacing

[33mcommit ec82d3798a089a7d43ddb64dc85423cbaf373dd3[m
Merge: 099dd4b7a 71861606a
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Mon Feb 14 19:31:19 2022 +0100

    Merge pull request #20 from EveryBoard/optimized-sets
    
    [optimized-sets] Introduce OptimizedSet and CoordSet

[33mcommit 71861606a7eed1f370bc1355a5abbb39cfcd273d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Feb 14 17:46:08 2022 +0100

    [optimized-sets] PR comment

[33mcommit 37bde5acd5268fe377a8bb8a7dda73a63909dace[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Feb 14 17:37:28 2022 +0100

    [css-card-spacing] Improve coverage

[33mcommit a4341fffc87e0b66fea0534d2cfb813cf4c4dc08[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Feb 14 17:37:17 2022 +0100

    [css-card-spacing] Update images

[33mcommit 7f06ac401868462ae73a830fb41cf3c85058b921[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Feb 14 17:36:50 2022 +0100

    [css-card-spacing] Improve spacing of cards on welcome page

[33mcommit a844edbba067ff2bc856801208fcbee21527461b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Feb 14 08:19:54 2022 +0100

    [optimized-sets] PR comment

[33mcommit 4d452f8734edfc764551076ad2aa1112f1a939e8[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Feb 14 08:12:34 2022 +0100

    [logerrors] Get coverage of MessageDisplayer.criticalMessage

[33mcommit 182216c7216324f4a00073ffc0ae75ee2cd8e7ca[m
Merge: 558871aa3 099dd4b7a
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Feb 14 08:09:04 2022 +0100

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into logerrors

[33mcommit 558871aa387bf667d851d4ef321edf1bf9a05d56[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Feb 14 08:08:11 2022 +0100

    [logerrors] PR comments

[33mcommit 0212c4151c74f320e54d036ea766ae5f19df5e17[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Feb 14 06:56:53 2022 +0100

    [optimized-sets] PR comment

[33mcommit b03b70375b9fa01427413a6692082c883c7bc405[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Feb 13 21:43:53 2022 +0100

    [dependencies] PR comments

[33mcommit aecef5811391484d5028d7c7838af96c5598efea[m
Merge: 0f19279a4 099dd4b7a
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Feb 13 20:49:48 2022 +0100

    [FalselyDisconnectedBug] pulled develop and fixed conflict

[33mcommit dca33013870eccf16f2a5d32c3ef7166bdce009e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Feb 13 09:30:29 2022 +0100

    [dependencies] Use more stable serverTimestamp, simplify updatePresence

[33mcommit 525a32ad2abc5f6e4094985f1cbe2aa5b33aa4f9[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Feb 12 23:11:23 2022 +0100

    [dependencies] Update karma

[33mcommit 6d1ff2eb074372817c73e7274610ceb47ad2ce48[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Feb 12 23:07:43 2022 +0100

    [dependencies] Use LF as newlines in coverage.py

[33mcommit 0b12d83c8cf22b7f8c928dd75ade01aa6aedb561[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Feb 12 23:03:05 2022 +0100

    [dependencies] Restore 100% part-creation coverage

[33mcommit 2832f5e42f1a54653334a16e1e33c433275fe696[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Feb 12 18:15:39 2022 +0100

    [dependencies] Fix broken tests due to missing tick

[33mcommit fd45382eceec73f563aed8802e8a4157b21faf67[m
Merge: 13b13ff5a 099dd4b7a
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Feb 12 09:22:57 2022 +0100

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into dependencies

[33mcommit 4678d73c7bbff5cd5080e4a585ca19a31807e323[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Feb 12 09:00:16 2022 +0100

    [optimized-sets] Remove duplicate test

[33mcommit 77def02e0c1bfeb348ec5e91e11543c6024540a7[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Feb 12 08:51:13 2022 +0100

    [optimized-sets] Update no-spec-dupes linter rule

[33mcommit 9f04f127b7955d9af5b87cd4986d6006d9186fab[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Feb 12 08:40:25 2022 +0100

    [optimized-sets] Minor PieceThreat refactor

[33mcommit 0f19279a4b88ade66b0ed65b420e0ade6de10cf3[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Feb 11 21:20:46 2022 +0100

    [FalselyDisconnectedBug] wip

[33mcommit 60ac495350219a22afa848941fbe758a1440ea15[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Feb 11 17:46:55 2022 +0100

    [optimized-sets] Apply CoordSet where it can be used

[33mcommit a61e4caaee82ccbdc0223937728e8ec6ad4872ff[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Feb 11 17:28:27 2022 +0100

    [optimized-sets] Introduce OptimizedSet and CoordSet

[33mcommit 099dd4b7a17a75c4732ab752f569f67777cff435[m
Merge: c63a0f5b1 4f0977a7b
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Thu Feb 10 08:52:16 2022 +0100

    Merge pull request #19 from EveryBoard/joinerservice
    
    [joinerservice] JoinerService.joinGame now returns a MGPValidation

[33mcommit 13b13ff5a53926e3beb789626e8568e641d8e103[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Feb 7 21:04:56 2022 +0100

    [dependencies] Apply button layout fix to all styles

[33mcommit 9a398521884fce8f4f0e1d84944a0ff0c4e47fd1[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Feb 6 17:52:39 2022 +0100

    [dependencies] Fix welcome page + karma thresholds

[33mcommit e9a6fb729fa63f583628ffca6224f1048cbf3ea7[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Feb 6 15:38:53 2022 +0100

    [dependencies] Fix centering of buttons with latest bulma

[33mcommit da3365c82b6bd78949eb66e7698cb9e0ccd022be[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Feb 5 16:43:37 2022 +0100

    [dependencies] Downgrade to angular 12

[33mcommit 4f0977a7bfeaf21fb1240b06794668c1efb20f15[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Feb 4 18:38:39 2022 +0100

    [joinerservice] JoinerService.joinGame now returns a MGPValidation

[33mcommit 03f4f18a9f617b2c432c20d2d5b596b7651076b1[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Feb 4 10:27:10 2022 +0100

    [dependencies] add firebase-tools

[33mcommit bdc3ae520dbf06b987d8ae6911fdde57e6e9deec[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Feb 4 08:42:31 2022 +0100

    [dependencies] Increased mis-coverage in auth service due to PR comments refactors

[33mcommit 8f343de4fe5b73906e8445c5a77f28cacb39cda9[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Feb 4 08:36:39 2022 +0100

    [dependencies] Add missing CI dependencies, fix test teardown, remove dead code

[33mcommit fa4cc3d139ade08c074b74f0ebd8359d148c3db2[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Feb 4 08:07:22 2022 +0100

    [logerrors] Fix flaky test

[33mcommit 2e3862e36ed73c6c998515b78b0313523161fdd4[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Feb 3 23:12:52 2022 +0100

    [logerrors] Cover missing branch

[33mcommit 59c98808b1c6e43baeb93f95c0772a2e6ba6c5b7[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Feb 3 23:07:39 2022 +0100

    [logerrors] Fix linter

[33mcommit 5e03efa633be6a1221c7ef95d2ea03013838a5c9[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Feb 3 22:23:33 2022 +0100

    [logerrors] Remaining PR comments

[33mcommit aceb351d5b222323daf3cea00cc38a9040754fce[m
Merge: fe1fe3997 c63a0f5b1
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Feb 3 20:48:00 2022 +0100

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into logerrors

[33mcommit 69cb9e77bd61b351aed89b370e989cd301ec14fe[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Feb 3 20:09:04 2022 +0100

    [FalselyDisconnectedBug] covered rebumped

[33mcommit fe1fe399790e88bd42f94f14e8a0aba6ea504715[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Feb 3 17:59:39 2022 +0100

    [logerrors] Partial PR comments

[33mcommit 9c92d94e53904d1a481713e8f5743724779e3cee[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Feb 3 17:35:49 2022 +0100

    [dependencies] More coverage, PR comments

[33mcommit ab7f827ea6ce8f3742a446b720c1d026aebec730[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Feb 2 21:00:56 2022 +0100

    [FalselyDisconnectedBug] fixed tests; work in progress

[33mcommit a025deafde73d4db10cbd20ed6b08bfe71858b8a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Feb 1 18:32:54 2022 +0100

    [dependencies] Fix emulator setup

[33mcommit ce00aa91fcd901855e30df1afd28cf92fa2d4274[m
Merge: 5c7c29e56 c63a0f5b1
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Feb 1 18:32:36 2022 +0100

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into dependencies

[33mcommit 5c7c29e56070f3d25ca9c4ac6edbc2396219d2b3[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Feb 1 18:29:58 2022 +0100

    [dependencies] Refactor auth service

[33mcommit 1da10803cac24ccbd64910d4366e4a8133870308[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Jan 31 18:29:17 2022 +0100

    [FalseDisconectedBug] Add observedPart to UserDoc, add subscription, remove some action linked to 'disconnection'

[33mcommit c76d3eb71a1b88e613bb539b96fb1bf311c9d1d3[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jan 28 08:01:17 2022 +0100

    [dependenciens] WIP

[33mcommit 524979a590a42ee1a2712b6abffd90e960b3f354[m
Merge: 7db399b78 c63a0f5b1
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jan 29 00:28:59 2022 +0100

    Merge pull request #16 from EveryBoard/develop
    
    Everyboard Master 1

[33mcommit c63a0f5b111cc3e2de5d616382d01a8464252d3d[m
Merge: 23ffc6bb7 93b083c6a
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jan 28 22:36:05 2022 +0100

    Merge pull request #15 from EveryBoard/SixFixSizing
    
    Six fix sizing

[33mcommit 93b083c6a5285bb37cb361564d6c7e6ec37b1cce[m[33m ([m[1;31morigin/SixFixSizing[m[33m)[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jan 28 22:44:47 2022 +0100

    [SixFixSizing] fix active parts service

[33mcommit 045707c23f703ff997e3705f7a200ac1da7b3cc4[m
Merge: 98db42fe6 23ffc6bb7
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jan 28 22:37:12 2022 +0100

    Merge branch 'develop' of https://github.com/EveryBoard/EveryBoard into SixFixSizing

[33mcommit 98db42fe6b70961120ab165a264f633e82d8c9d7[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jan 28 22:27:09 2022 +0100

    [SixFixSizing] PR Comment Wave 1, which was usefull!

[33mcommit 23ffc6bb755dc70c3f36657ee1229a1c92d1f05d[m
Merge: 6a0d0eacb 665d0fb0e
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jan 28 22:12:00 2022 +0100

    Merge pull request #14 from EveryBoard/TimeManagementFixTakeBack
    
    Time management fix take back

[33mcommit b67cee592adcf00a97922ae208041bc8636616fe[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jan 28 08:23:02 2022 +0100

    [SixFixSizing] remove commented test code

[33mcommit 6b160be964fec2174d837f7c6a6b9afaf2f3140b[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jan 28 08:16:34 2022 +0100

    [SixFixSizing] sized fixed

[33mcommit 665d0fb0eaa7dd6c00372679336c2851e2f84326[m[33m ([m[1;31morigin/TimeManagementFixTakeBack[m[33m)[m
Merge: 076849c79 6a0d0eacb
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Jan 26 08:25:40 2022 +0100

    [TimeManagementFixTakeBack] pulled develop and fix conflict

[33mcommit 076849c796f43c37ef1f04c667ba14cd97a9f6a1[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Jan 26 08:21:03 2022 +0100

    [TimeManagementFixTackBack] PR Comment Wave 1 forgotten part

[33mcommit cae4a224a52f87bed98a81251a25bd90d400fd08[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Jan 26 08:17:23 2022 +0100

    [TimeManagementFixTackBack] PR Comment Wave 1

[33mcommit 93acff37229895effd39c9d201be98f4bbb2c402[m
Merge: 3bead9116 6a0d0eacb
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jan 25 22:20:05 2022 +0100

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into dependencies

[33mcommit 3bead91165dacebcb011a9c193efb1d362d3faaf[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jan 25 22:18:45 2022 +0100

    [dependencies] Upgrade to latest versions

[33mcommit 6a0d0eacb7482d72d73637116dc5efa12e4a168b[m
Merge: 87edf4ac3 edcc8e03f
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Tue Jan 25 19:34:06 2022 +0100

    Merge pull request #13 from EveryBoard/test-routes
    
    [test-routes] Fix path to /server and test routes

[33mcommit 6fcb1ef53a0d8617a4b717ba90c1df9ae56712b3[m
Merge: 87edf4ac3 685ace4dd
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Jan 25 19:32:50 2022 +0100

    [TimeManagementFixTakeBack] pulled develop and fixed conflict

[33mcommit 31434f45c01a2f2a93d667bf27bbf5a1ab8043f8[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jan 25 09:39:44 2022 +0100

    [dependencies] Enable prod build by default

[33mcommit bb603dc6714798dc6dec06287f45a1726e4da99b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jan 25 09:37:50 2022 +0100

    [dependencies] Migrate to angular v12

[33mcommit 3e9385c116da57842a6b57b5709d7844d25ec099[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jan 25 09:28:49 2022 +0100

    [depnedencies] Bump outdated versions

[33mcommit 07af06a4681351f6330faf33144be89a54da3b17[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jan 25 08:27:32 2022 +0100

    [logerrors] Fix linter issues

[33mcommit edcc8e03f1bf8a5752a8a162cc91c78339999dd3[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jan 25 08:23:52 2022 +0100

    [test-routes] Bump version number

[33mcommit 4868a32aab820bcf100ce1f3ec19dea3cf8a80d1[m
Merge: bd4895c02 87edf4ac3
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jan 25 08:23:12 2022 +0100

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into test-routes

[33mcommit bd4895c02ee8eda6073cf348a0b58741578e86f8[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jan 25 08:16:24 2022 +0100

    [test-routes] PR comments

[33mcommit 4b2000a1fef8b5ac4eba4fd5a9e57f90d83e3e3d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jan 25 08:09:18 2022 +0100

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into logerrors

[33mcommit caa9afcac769c52ab3561bf0c9b072b2456d2dde[m
Merge: 2dea2a7e5 87edf4ac3
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jan 25 07:52:40 2022 +0100

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into logerrors

[33mcommit 2dea2a7e5ba07d9bbe1731ef74cca8e027a43269[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jan 25 07:50:39 2022 +0100

    [logerrors] Rename and cover new code

[33mcommit 87edf4ac3100c32668dc0519ff5d642758e5c7f1[m
Merge: 1d6f2101f 0d92ce2d7
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Jan 24 22:01:35 2022 +0100

    Merge pull request #10 from EveryBoard/AddTimeToOpponentCleanerVersion
    
    Add time to opponent cleaner version

[33mcommit 0d92ce2d78f6b0a55a15c09bea6542f50de2af81[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Jan 24 21:33:50 2022 +0100

    [AddTimeToOpponent] updated coverage and translation

[33mcommit 32f9b492b38ee9e571f276f737d56187f1bed58b[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Jan 24 20:08:35 2022 +0100

    [AddTimeToOpponent] fix translation and linter

[33mcommit bb6334aba0f0e70d54c2c06f76509e580285668b[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Jan 24 19:36:56 2022 +0100

    [AddTimeToOpponent] rename case sensitivity on file naming

[33mcommit 8f6e1f56ef641c558b67ad35f03cd649791a1222[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Jan 24 19:26:48 2022 +0100

    [logerrors] Overall improvement of error logging

[33mcommit 7c7a7a23fc20143f52ef6caad4417ccab46f4d26[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Jan 24 09:02:59 2022 +0100

    [AddTimeToOpponent] Generate CSV file

[33mcommit faac669c59e28b8c54e92177d72a1ac5748785a7[m
Merge: 0b4c528dd 1d6f2101f
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Jan 24 08:58:32 2022 +0100

    [AddTimeToOpponent] Pulled Everyboard/develop and fixed conflict

[33mcommit 418793bab08f983a3ac011438b3bda1e623c3a0a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jan 23 14:20:09 2022 +0100

    [test-routes] Fix path to /server and test routes

[33mcommit 0b4c528dd8f6b04916a1ed84e1bf07674af5a117[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Jan 22 19:24:56 2022 +0100

    [AddTimeToOpponent] change french translation

[33mcommit 8c0391f3c56c86f13e4cfe5438167bc3cf960551[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Jan 22 19:23:48 2022 +0100

    [AddTimeToOpponent] removed unused css

[33mcommit 91f318a8202b68ab9012586edd160844b3f44f8b[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Jan 22 19:19:41 2022 +0100

    [AddTimeToOpponent] PR Comment wave 4

[33mcommit 56129e1c92056a1a48719c7560ad3b0e304c413e[m
Merge: 58c68754f 1d6f2101f
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jan 22 19:02:02 2022 +0100

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into logerrors

[33mcommit 1d6f2101f1e7dbbd42d21c9922fd3c40823e1022[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jan 22 18:29:18 2022 +0100

    Redeploy failed develop deployment

[33mcommit dd08381a2d954cfe508aa31644ec7cfe9ce7c169[m
Merge: 4d03e95b1 b78944f95
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sat Jan 22 17:59:30 2022 +0100

    Merge pull request #6 from EveryBoard/activeparts-missing
    
    Bugfix: Active parts missing + improve DAOs

[33mcommit b78944f9570393b3dc87df5713052ad214f541a3[m[33m ([m[1;31morigin/activeparts-missing[m[33m)[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jan 21 21:27:02 2022 +0100

    [activeparts-missing] Linter & coverage data

[33mcommit dc22959055b5483f98d05925c153814f2f0ff1ea[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jan 21 17:42:26 2022 +0100

    [activeparts-missing] Finalize renaming

[33mcommit 3b9ce61442b49c471001dee8da966bc190f93e09[m
Merge: 3fe432f09 4d03e95b1
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jan 21 08:24:36 2022 +0100

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into activeparts-missing

[33mcommit 3fe432f091736bf0dbb04a61d04d1f657e59a990[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jan 21 08:16:01 2022 +0100

    [activeparts-missing] PR comments and renamings

[33mcommit 4d03e95b1c41cecdf3ce292533bc797519cde182[m
Merge: c8beef113 0d1c3ca0a
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Thu Jan 20 19:23:52 2022 +0100

    Merge pull request #12 from EveryBoard/improve-awale-and-quarto
    
    Improve awale and quarto

[33mcommit 11378b619d0a98ccb6c15d1e98b5de53e808671a[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Jan 20 19:08:38 2022 +0100

    [AddTimeToOpponent] PR Comment Wave 3

[33mcommit 0d1c3ca0aa09d9f90532b7b728798d805e60e3b3[m[33m ([m[1;31morigin/improve-awale-and-quarto[m[33m)[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Jan 20 08:47:40 2022 +0100

    [improve-awale-and-quarto] Use expectToBeCreated for Quarto too

[33mcommit 4c434c85c6c07b7a41b821abacfaff8f393ff54c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Jan 20 08:46:28 2022 +0100

    [improve-awale-and-quarto] Last PR comment

[33mcommit fac3dc1c6b393a323ef6d51f97f3fc9e8c2e0c8c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Jan 20 08:00:48 2022 +0100

    [improve-awale-and-quarto] PR comments and fix coverage.py

[33mcommit cb076b9cb6695794d62f8e396a604063fc081982[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Jan 20 07:34:04 2022 +0100

    [activeparts-missing] Remove DomainWrapper and fix lint

[33mcommit f1ec01a68b66d1f557d32969fccf5f1003bdd24a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Jan 19 23:34:37 2022 +0100

    [activeparts-missing] Update version number

[33mcommit a9d38d46bc63b72d88b91142957a92326e5797d0[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Jan 19 23:31:59 2022 +0100

    [activeparts-missing] PR comments

[33mcommit 58c68754f3e19ae68744267159a5db7ea56042bb[m[33m ([m[1;31morigin/logerrors[m[33m)[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Jan 19 08:07:05 2022 +0100

    [logerrors] PR comments, but stuck until activeparts PR is merged

[33mcommit 81ae90ac28010516a3fe13d259836ce756297984[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jan 18 17:31:10 2022 +0100

    [improve-awale-and-quarto] Get 100% coverage of quarto

[33mcommit f5c6153ca2538bbe86fa15dfbaaae478995b4152[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Jan 17 22:02:03 2022 +0100

    [activeparts-missing] Fix linter

[33mcommit 9f598a70055dc2d5af10631aeca93a89c8d2b77a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Jan 17 21:59:28 2022 +0100

    [improve-awale-and-quart] Fix conspirateurs component

[33mcommit e68cfb42240682612a5f1eb09198b7a7919b6237[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Jan 17 20:02:45 2022 +0100

    [improve-awale-and-quarto] Get 100% coverage for Awale

[33mcommit c6149298672c6f07163831a0b487f743adb3d14a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Jan 17 08:56:47 2022 +0100

    [logerrors] Fix linter

[33mcommit 51dfa1fd6d6ad78fc6f895f74a4aa3487c87bcb4[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Jan 17 08:54:08 2022 +0100

    [activeparts-missing] PR comments

[33mcommit be1626c282c6b948453555c9c1a8ac9252eb9a16[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Jan 17 07:20:28 2022 +0100

    [logerrors] Fix remaining broken tests

[33mcommit d90d34c51df4ebcd19c25f5e2dffa0161b7db7fa[m
Merge: 282f8f3fa c8beef113
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jan 15 08:32:35 2022 +0100

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into logerrors

[33mcommit 282f8f3faed34ad5380d4e75bb43f1912f93d3c3[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jan 11 21:51:11 2022 +0100

    [logerrors] Integrate ErrorLogService

[33mcommit 52751a818c30f7d6a233f760d637a33ec3cca103[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jan 15 00:04:04 2022 +0100

    [activeparts-missing] Fix linter issue

[33mcommit 03b959ee21a0530a44e01b222db5f5236a584271[m
Merge: 334dae65a c8beef113
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jan 14 23:34:06 2022 +0100

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into activeparts-missing

[33mcommit 334dae65a5643ecff0f084fad3d484247061caae[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jan 14 23:26:14 2022 +0100

    [activeparts-missing] Cover missing branch in part-creation

[33mcommit c8beef1137ae4e7c2ec1845f224be9035f765b86[m
Merge: e2f744088 659ec4f4b
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jan 14 19:34:40 2022 +0100

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into HEAD

[33mcommit 62c323d52a9c24d301c52ac5ea175ab549f607b1[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jan 14 19:27:20 2022 +0100

    [activeparts-missing] Fix linter

[33mcommit 7b074803202977ce2abe780d26d9d3f8115ab95e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jan 14 19:02:57 2022 +0100

    [activeparts-missing] Refactoring to subscriptions, fix all tests

[33mcommit e2f7440884624ec118dafd145ec20b78e58a3940[m
Merge: 206563dfb ff861c572
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jan 14 08:55:27 2022 +0100

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into P4Enhance

[33mcommit 206563dfbc2668e266ef4e930c0347e2accc55df[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jan 14 08:54:08 2022 +0100

    [P4Enhance] PR Comments Wave 2

[33mcommit 455f55b0251271392fa49ee3463abdb35996ce81[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jan 14 06:57:57 2022 +0100

    [activeparts-missing] Further improve subscriptions

[33mcommit de2c912f0323e4fc73c2e2004649cfba75f276d7[m[33m ([m[1;31morigin/AddTimeToOpponentCleanerVersion[m[33m)[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Jan 13 21:28:31 2022 +0100

    [AddTimeToOpponent] PR Comment Wave 3.1415926585

[33mcommit 685ace4ddd038c7d021541b54c993e623477ea26[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Jan 13 20:53:13 2022 +0100

    wip

[33mcommit 9600ff04d97a91ff86eb98d796d4db9c74e1bb5e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Jan 13 08:59:08 2022 +0100

    [activeparts-missing] Fix new tests

[33mcommit 995b457cf892dc43f9382f0465ced24bc86ced48[m
Merge: f42f0bb3c 659ec4f4b
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Jan 13 08:15:49 2022 +0100

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into activeparts-missing

[33mcommit f42f0bb3ccb1e7460f1c11c6e71addc028ebc16b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Jan 13 08:12:33 2022 +0100

    [activeparts-missing] Better handling of subscriptions

[33mcommit 181be4f2cffdc9eadc59ffa24984e6c08e7f515d[m
Merge: 55ba6aff6 659ec4f4b
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Jan 13 08:08:38 2022 +0100

    [AddTimeToOpponent] pulled everyboard develop and fixed conflict

[33mcommit 55ba6aff6c6e81f882696071a31f3901160625e1[m
Merge: 2880c43c3 798b91779
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Jan 12 20:24:55 2022 +0100

    [AddTimeToOpponent] pulled develop and fixed conflict + PR Comment

[33mcommit 659ec4f4bde352da3c70daf84f930ca4b175813d[m
Merge: 798b91779 c1766ed7d
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Jan 12 06:57:39 2022 +0100

    Merge pull request #9 from EveryBoard/P4Enhance
    
    P4Enhance

[33mcommit c1766ed7d9d57521a4a47ddc6c4a7d8ceeeccf2c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jan 11 21:58:42 2022 +0100

    [P4Enhance] Fix coverage.py

[33mcommit a4c45019824640faeecdeadab136eaa355c1842b[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Jan 11 20:47:14 2022 +0100

    [P4Enhance] fix coverage.py and csvs

[33mcommit 2c1b8863693b5cd00fd6378bd1b44b8e6804786a[m
Merge: 3b90a283c 798b91779
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Jan 11 20:43:59 2022 +0100

    [P4Enhance] pulled everyboard/develop and fixed conflict

[33mcommit ff861c57227b6174981883596e8a551117c9d69f[m
Merge: ca7a2417b 7d3379be1
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jan 11 20:14:41 2022 +0100

    Merge pull request #126 from MartinREMY42/Brandhub
    
    [Brandhub] Make tafl component adapted to different sized boards

[33mcommit 798b91779bb8f72ffb610e375af76add7aa4f45a[m
Merge: deffb0cea b70e433dc
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jan 11 20:11:56 2022 +0100

    Merge pull request #8 from EveryBoard/Brandhub
    
    Brandhub

[33mcommit deffb0ceacb09244030c34c77aecc9820809c248[m
Merge: 914682dc6 04c750cec
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Tue Jan 11 19:36:24 2022 +0100

    Merge pull request #7 from EveryBoard/current-player-color
    
    Show current player color in tuto & local

[33mcommit b70e433dc2e3468982db0755c0f0df790a7b8326[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jan 11 12:01:22 2022 +0100

    [Brandhub] Update images
    
    (Lunch commit)

[33mcommit 7d3379be1d34f30121f67bf846ca99b2280f5834[m
Merge: fb180f5e8 914682dc6
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Jan 11 08:36:57 2022 +0100

    Merge branch 'develop' of https://github.com/EveryBoard/EveryBoard into Brandhub

[33mcommit 3b90a283c0bdac868e63701d53bddbfa0041158e[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Jan 11 08:25:28 2022 +0100

    [P4Enhance] Fixed conflict

[33mcommit fb180f5e8b8886a561d8b00227fc93c1855d5e55[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Jan 11 08:12:56 2022 +0100

    [Brandhub] removed games.txt temporary file

[33mcommit 2880c43c3b4d8c70e50f6f8e73a56a11c81325da[m
Merge: 63a49f65b 914682dc6
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Jan 11 07:58:33 2022 +0100

    [AddTimeToOpponent] pulled develop from everyboard repo and fixed conflict

[33mcommit 63a49f65b3046c6e4fb97cc23f401c7d1f388306[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Jan 10 21:23:03 2022 +0100

    [AddTimeToOpponent] adding again coverage file

[33mcommit 04c750cecd4af44cf5a8e54ed97a21f0c0c403bb[m
Merge: 33d142ec6 914682dc6
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Jan 10 08:24:29 2022 +0100

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into current-player-color

[33mcommit 33d142ec678b0939ad5b978e6811082c809db337[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Jan 10 08:18:25 2022 +0100

    [current-player-color] PR comments

[33mcommit 914682dc63419028bdd155a88058717721839fb0[m
Merge: 36b0d020e 4b51fc34e
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Mon Jan 10 08:14:37 2022 +0100

    Merge pull request #4 from EveryBoard/conspirateurs
    
    New game: conspirateurs

[33mcommit dfe437dd8ea8224e9b57b447baf0ee25f1ef7af3[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Jan 10 08:08:25 2022 +0100

    [activeparts-missing] Move some files and rename classes

[33mcommit 4c1625c2f5399db90b382babca3b3d401a3e8d40[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Jan 10 08:01:18 2022 +0100

    [a,ctiveparts-missing] Cover missing branch in GameService

[33mcommit 0445aebbc8d6668f59b2f638991bd6f24f067e5a[m
Merge: b8dc6baad 36b0d020e
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Jan 10 08:01:08 2022 +0100

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into activeparts-missing

[33mcommit b8dc6baad1d43338ff788b87b18a4ad03afedfd1[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Jan 10 07:52:33 2022 +0100

    [activeparts-missing] PR comments

[33mcommit 4b51fc34e2366c02a55453db0662d7cef5c3352e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jan 9 21:42:41 2022 +0100

    [conspirateurs] PR comment + update game images

[33mcommit e7fc98116d6f2bb4ce6743a9c5ebfa3160f071c1[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Jan 9 21:07:18 2022 +0100

    [AddTimeToOpponent] remove use of french false friend 'case'

[33mcommit 812cd2c2cafc4ce64c02d76b87403b842f90483b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jan 9 11:53:02 2022 +0100

    [current-color-player] More coverage improvements

[33mcommit d04ec75c1e58309ba62d95826694526ceca406b8[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jan 9 10:37:55 2022 +0100

    [current-player-color] fix all expect-matcher errors and cover siam piece

[33mcommit c4afe2fbc67d243bef19f5430c535a134c7030a3[m
Merge: a1bb4dbfc 36b0d020e
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jan 9 09:57:09 2022 +0100

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into current-player-color

[33mcommit c70762dd574f87fa750f4f8b2f827030dcd82679[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jan 9 09:46:46 2022 +0100

    [conspirateurs] Fix linter and update translations

[33mcommit db695d88af348e5ce7c976c576ecf2c71d4e1453[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jan 9 09:31:20 2022 +0100

    [conspirateurs] Change victory visualization, fix some previously useless tests

[33mcommit a39d43d31548da4a23736eeaaf6323658c85c711[m
Merge: c7d0e38fe 36b0d020e
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jan 9 03:07:33 2022 +0100

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into HEAD

[33mcommit c7d0e38fe464989778f3a368a4844a95b61c8428[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jan 9 03:05:54 2022 +0100

    [conspirateurs] PR comments

[33mcommit a1bb4dbfca1049d825f9400a136a3c5fef643a02[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jan 9 02:57:36 2022 +0100

    [current-player-color] Add current player color to tuto & online game wrappers

[33mcommit 36b0d020edfb105387df0b93bdbc0be455b3fd1d[m
Merge: a799fff0c 3d6b62b4c
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sat Jan 8 18:18:24 2022 +0100

    Merge pull request #5 from EveryBoard/part-creation-coverage
    
    Refactor part creation tests

[33mcommit 13cf5a460a5da4d5471dfcb949d8e1836db6a147[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jan 8 00:04:38 2022 +0100

    [conspirateurs] Improve shelter highlights

[33mcommit f3d9c1408c940d52718bd5181ddc07015c5f25fe[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jan 7 22:52:23 2022 +0100

    [conspirateurs] Enable jump cancellation upon other piece click

[33mcommit 1e03d090ae8ef0d52968c18e2460cd5e26f1ba46[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jan 7 17:39:56 2022 +0100

    [conspirateurs] PR comments, wave 2

[33mcommit 7b6cd5822ed77c0c5ba38a30f33b8ee670fdf02f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jan 7 08:18:44 2022 +0100

    [current-player-color] Remove duplicate function

[33mcommit 83e99422f0283ef6fc1e534eb4a0c2f3830def62[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Jan 6 21:57:36 2022 +0100

    [activeparts-missing] Fix linter issue

[33mcommit 3d6b62b4c91e04548279d8eb82367c9a5c6392da[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Jan 6 21:49:20 2022 +0100

    [part-creation-coverage] PR comments

[33mcommit 9b2998b4a53c22cfd83e5c6ff344c46c43b06de9[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Jan 6 21:38:41 2022 +0100

    [activeparts-missing] Improve Firestore DAOs

[33mcommit 27f583025524246f46d340e3f3c6a53e952ad721[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Jan 6 05:34:42 2022 +0100

    [activespart-missing] Improve FirebaseFirestoreDAO types to reflect reality

[33mcommit ee6ae362a464eb4102ecd5faa9ee952fc7be6b19[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Jan 5 06:54:18 2022 +0100

    [activeparts-missing] Get 100% coverage for active parts, bugfix for missing parts

[33mcommit 0660f59e3f248f9a457dca0082545ddf1f54aeb3[m
Merge: eb6c072c8 ca7a2417b
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Jan 4 20:01:44 2022 +0100

    [AddTimeToOpponent] pulled develop and fix conflict

[33mcommit eb6c072c8bfc06529f278ea63e6698fecbf81a2c[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Jan 4 19:54:08 2022 +0100

    [AddTimeToOpponent] pulled develop and fixed conflict

[33mcommit beb8ba552e8068446eec8cd30335586123dc0ad5[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jan 4 07:26:57 2022 +0100

    [conspirateurs] Improve minimax, i18n

[33mcommit 75369eea8debe4193bdf106a6645f8bff5a4b7ce[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Jan 3 21:33:35 2022 +0100

    [AddTimeToOpponent] Several should be addable to same chrono twice in a row

[33mcommit a2e0ed3a878c0e28aa0bdc6ad3bb850342486e8b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Jan 3 19:29:05 2022 +0100

    [conspirateurs] Improve jump visualisation and minimax

[33mcommit 9c45b26f4b3ed833ccd8fdf747638036573e6071[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Jan 3 08:32:19 2022 +0100

    [conspirateurs] Test getBoardValue scores

[33mcommit 8ac47b5c57b12a6433694ea97a02c3c78b0674a1[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Jan 3 08:19:24 2022 +0100

    [conspirateurs] More PR comments

[33mcommit b658d75ea5ce5c2406efaadfcd4cad03a332bb72[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jan 2 16:04:48 2022 +0100

    [conspirateurs] PR comments

[33mcommit d060f159f28a779f2495f6c6d70e06160aa191a7[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jan 2 13:14:14 2022 +0100

    [part-creation-coverage] Fix linter issues, restore original HTML

[33mcommit a181da77146b9bf49eafefd707c08cbbc98c93b7[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jan 2 09:56:18 2022 +0100

    [part-creation-coverage] Refactor part creation tests
    
      - add GWT
      - improve tests structure
      - get 100% coverage
      - did not encounter heisentest

[33mcommit e43442b08b790d997943324b57edd2806e01a588[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 30 19:10:16 2021 +0100

    [conspirateurs] Fix broken test and remove console.logs

[33mcommit c0e0acffc14549c1c22dcb46f32ba4b2242400e8[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 30 17:09:38 2021 +0100

    [conspirateurs] Add images

[33mcommit c0414fb3346e3442d28a41c03b28623311c2b7a0[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 30 17:06:53 2021 +0100

    [conspirateurs] Get full coverage

[33mcommit a45a9ddf5e2b270e45ba13d67c63ca7c442a79aa[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 30 16:26:57 2021 +0100

    [conspirateurs] Finish tutorial

[33mcommit 191a6c72dc93f57683e3403746fed32e7d397f2a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 30 14:34:14 2021 +0100

    [conspirateurs] Some more progress, and improve coverage of Minimax.ts

[33mcommit a799fff0cac281358104f8a106a7feda7b5a3582[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 30 12:04:10 2021 +0100

    Fix root path in new environment

[33mcommit 4179af289064e4f4fee0fb58c56979efb314b8d4[m
Merge: ad2194c08 2e6be35ca
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 30 10:19:37 2021 +0100

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into conspirateurs

[33mcommit 2e6be35ca1cf27a759e0f6d537c2809f6d2c93a8[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 30 10:19:10 2021 +0100

    Update translations

[33mcommit ad2194c088ca0c854699c2273880b7c69ed330f6[m
Merge: 54f3a93e1 22cc692c6
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 30 10:14:53 2021 +0100

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into conspirateurs

[33mcommit 54f3a93e1ea18b7177427822785cd55dff8adce2[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 30 10:14:35 2021 +0100

    [conspirateurs] Add minimax spec

[33mcommit 22cc692c6c19b9852d8fcc13c1b3cca6f93b1f10[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 30 10:08:20 2021 +0100

    Finalize the name change, really

[33mcommit 5b1aa0581903ba87650594858cfa0b398cca702b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 30 10:05:32 2021 +0100

    Finalize the name change

[33mcommit d62b11363a399b6d5de0949b7c4744752e6cde39[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 30 09:58:30 2021 +0100

    Update dependencies

[33mcommit 7fd37d8e6ae9cc74dd5c19ba54c4f2235cd5218f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 30 09:19:46 2021 +0100

    Update angular.json

[33mcommit ba387dfe9df2d311f32f8d0dd4ec0446a079dfed[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Dec 29 21:26:09 2021 +0100

    [AddTimeToOpponent] Messages after agreed draw enhanced

[33mcommit 9e1eb15eac4bf536f6e3708cb6b730710f90d2f7[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 29 21:05:37 2021 +0100

    [conspirateurs] Start working on minimax

[33mcommit 682ae9e2782a9ef5e70ebb601665163b239a18b6[m
Merge: 249305d1f ca7a2417b
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 29 17:22:03 2021 +0100

    Merge develop from upstream

[33mcommit 249305d1faad940ced77565c579d171e0f0495e3[m
Merge: f4ace3baf 36d2deed3
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 29 17:03:30 2021 +0100

    Merge pull request #3 from EveryBoard/develop-merged
    
    Develop merged

[33mcommit ca7a2417b62d4bfdd6a65db30becbb967b8ae225[m
Merge: 363b75abc 31db33463
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Wed Dec 29 16:46:33 2021 +0100

    Merge pull request #130 from MartinREMY42/testutils-pass-2
    
    Testutils pass, on to develop

[33mcommit 31db334631a0557bc38cffe49cad7ba5da0c5b2a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 29 15:11:21 2021 +0100

    [testutils-pass] PR comments + fix compilation

[33mcommit 613fc8e3b35b1067a603c9b079c7a00e60f7398e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 29 15:08:07 2021 +0100

    [conspirateurs] Start testing component

[33mcommit 38d8be3918e623a58fd105c35f2fc6aece355410[m
Merge: 7bbe46bbb 363b75abc
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 29 09:51:50 2021 +0100

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into conspirateurs

[33mcommit 36d2deed364fb5462a414bff1d027c954fb90d06[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 29 08:56:29 2021 +0100

    Get up to date with the latest develop

[33mcommit ef76c825fd52e59c9acf3177171b55f37df23990[m
Merge: 363b75abc 96d536931
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 29 08:53:14 2021 +0100

    Merge branch 'master' of github.com:MartinREMY42/multi-game-project into testutils-pass-2

[33mcommit 7bbe46bbb7748b5eef06495d3414b4e167fba9a3[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Dec 28 22:00:13 2021 +0100

    [conspirateurs] First draft of component

[33mcommit 363b75abc946098b8b5fd2559068f15123eeaa97[m
Merge: 1eef899a5 7ad16117c
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Wed Dec 29 08:24:20 2021 +0100

    Merge pull request #129 from MartinREMY42/dark-mode-improvements
    
    Dark mode improvements

[33mcommit 76ff69d78f684a6cb3efa27d7a5ab8c7f8ab40a7[m
Merge: e0ab44f25 1eef899a5
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Dec 28 20:01:39 2021 +0100

    [P4Enhance] pulled develop and fixed conflict

[33mcommit e0ab44f25fffb9ee888ca344598de49ec19bd417[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Dec 28 19:21:52 2021 +0100

    [P4Enhance]PR Comment Wave 1

[33mcommit 84458f716152d41bd9e090e2cf2c31c14b590b01[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Dec 28 19:00:25 2021 +0100

    [AddTimeToOpponent] Chrono now resynchronised after time add

[33mcommit 3e3a715ac41dddd195cb194d1d76d28a5f2e1a20[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Dec 28 16:27:15 2021 +0100

    [conspirateurs] Finalize rules

[33mcommit 0b8863f66642d192c2ad11fa922c1a4c28c30b75[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Dec 28 12:35:39 2021 +0100

    Update package-lock

[33mcommit 9ad2ebdf6460d4d9052ee1b57fb143259cb207bc[m
Merge: 617974e73 f4ace3baf
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Dec 28 12:00:12 2021 +0100

    Merge branch 'develop' of github.com:EveryBoard/EveryBoard into develop-merged

[33mcommit 617974e73db0e2b9679682022770f0d0734f60d5[m
Merge: 52136a370 96d536931
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Dec 28 11:58:04 2021 +0100

    Merge branch 'master' of github.com:MartinREMY42/multi-game-project into develop-merged

[33mcommit 52136a37073573b198e9d84f34bb8feee2077530[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Dec 27 08:14:03 2021 +0100

    [deployment] Rename pantheonsgame to everyboard

[33mcommit 9c1350a0e485cb17db3224725bf30ef4310d72b3[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Dec 27 08:11:07 2021 +0100

    [deployment] Finalize new workflow

[33mcommit 07b9c49c8c3e5fa21d8cdcde25d9c000e821d8c5[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 24 11:53:28 2021 +0100

    [deployment] Add email info in ng deploy
    
    (Lunch break commit)

[33mcommit 893276db02ff8e9a6150ec9c16f04549d337b840[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 24 09:02:39 2021 +0100

    [deployment] Enable logging to see what went wrong

[33mcommit a06f016bd345f7238a5107d6d1bf5417f4baf21c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 24 08:37:11 2021 +0100

    [deployment] Fix dependencies for gh-pages deployment

[33mcommit c8c49709574ee0b03cf25eea6cfd29c5cec2f80f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 24 08:01:06 2021 +0100

    [deployment] Use github pages for master/dev

[33mcommit da77274bf7f157a7124b3558623a07ee5f4e7222[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 22 21:58:52 2021 +0100

    [deployment] Update netlify-cli dependency

[33mcommit baa2bdffd3059fe957278e6265b6f1ce99f01fef[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 23 06:59:25 2021 +0100

    [deployment] Add build script back

[33mcommit e8d5ec665f4ffe264fe8354a8fca95520823c947[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 22 21:24:43 2021 +0100

    Revert "[deployment] Experiment with CD: try to get branch deploy with prod"
    
    This reverts commit 5f9309d5415814c3ae184ac22ebd1d949b22568d.

[33mcommit f3e3e94fa120b323709556857a8b4be973bbe1ad[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 22 21:24:30 2021 +0100

    Revert "[deployment] Try netlify build"
    
    This reverts commit a53bbc9aed0bc622dc96075c07f0aa13b5817dfb.

[33mcommit 68e89d45bd7e7ab3a933fb1072d275cd028c59b8[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 22 21:24:11 2021 +0100

    Revert "[deployment] Add build script for netlify"
    
    This reverts commit 3688b2e9f61037896170d263fa06cfd422981640.

[33mcommit 0f51ae6b9fa420d76cd512022ca02f5036524335[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 22 21:02:55 2021 +0100

    [deployment] Add build script for netlify

[33mcommit 9334c33800d349a4c0c750baec06044cfa26ae89[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 22 20:31:50 2021 +0100

    [deployment] Try netlify build

[33mcommit 45b2030b09f909e09d5f12c443fcd92aa6bcbb38[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 22 07:52:53 2021 +0100

    [deployment] Experiment with CD: try to get branch deploy with prod

[33mcommit 1c49d94dcef61e61a5b82441942898c9244802d7[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 22 07:31:06 2021 +0100

    [deployment] Update translations, update image script

[33mcommit 32a1ca04b867569b9b06701d4a37fac0d805e774[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 22 06:49:51 2021 +0100

    [deployment] Update package-lock.json after merge

[33mcommit cf0aeaf824d576d9df513a951b7db4eb1db1af52[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Dec 20 07:47:37 2021 +0100

    [deployment] Update python deps, once more

[33mcommit 642f75b8c38ad781ec0385ced7889034eea86f93[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Dec 20 07:22:18 2021 +0100

    [deployment] Update python dependencies

[33mcommit 8f8b49d383f57035ff7c14e3c45ebab483280317[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Dec 20 06:53:28 2021 +0100

    [deployment] Clean deployment script

[33mcommit c71c646d77bca43a485d7d93d8bd19db0715857e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 9 20:08:08 2021 +0100

    [deployment] Try to get branch name in CI

[33mcommit a822400f533be9609d5b3c7c01481a14c16d73b0[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 9 19:30:49 2021 +0100

    [deployment] Add some debugging info

[33mcommit 7b242b6614d27c4c5ef32159042af2a0f96ae1e3[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 9 17:33:13 2021 +0100

    [deployment] Try to get the branch name from the PR

[33mcommit 6b9d430f8fdd0f5d5c4784697cc72ca603545b4f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 9 08:10:10 2021 +0100

    [deployment] Try fix for org member

[33mcommit 9359bd8bb50c3445afd848cc5be3d58ece077738[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 8 07:35:26 2021 +0100

    [deployment] Fix action output usage

[33mcommit 006be951542349da40deb78c36dd421b662d96a3[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 8 06:55:09 2021 +0100

    [deployment] Update action version

[33mcommit 5af5c2aead7c90f766d62e1fd8d531f9b5ff2202[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Dec 7 21:58:11 2021 +0100

    [deployment] Trying with quotes

[33mcommit d9e947a2fac93235d1cbb677badd6bf48a3b3db9[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Dec 6 21:46:03 2021 +0100

    [deployment] Try to pass username to action

[33mcommit 998c58ab30333a024ed7470e4654222a6d21bb7c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Dec 6 17:48:29 2021 +0100

    [deployment] Improve deployment on master/develop/feature branch

[33mcommit 9d397c7bf09256ceadfe7538209024e86e256d2d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Dec 6 08:14:52 2021 +0100

    [deployment] CD: check if user is member of the organization

[33mcommit ba6986331bf38c9c476085b85c1bcab2b7282f06[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Dec 4 10:12:11 2021 +0100

    [deployment] Really fix syntax issues

[33mcommit 623e16fae4633519408a31e19eca9b98964f6ced[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Dec 4 10:09:33 2021 +0100

    [deployment] Fix syntax

[33mcommit 7fe72343bf373dbfbe572edef8ce94e70bcd0190[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Dec 4 10:05:30 2021 +0100

    [deployment] Use GH secrets

[33mcommit 89c9f354e52ea564c7d2e488d626cca7f5bdc286[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Dec 4 09:37:28 2021 +0100

    [deployment] Forgot to checkout

[33mcommit e9b3f9b11d365afc5d1ec28cdd3ba001341d6d0d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Dec 4 09:26:39 2021 +0100

    [deployment] More experiments with deployment, now from github

[33mcommit e4ae6990753066b6d81de177b08904a8383054d0[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Dec 4 09:06:21 2021 +0100

    [deployment] Forgot secrets

[33mcommit 860145bac59b7e21fa4da71349004ce89fc1978a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Dec 4 08:50:45 2021 +0100

    [deployment] Try to use netlify CLI to trigger deployment

[33mcommit 44aab89e861ba670a70f9e998d160eea099b4b20[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Dec 4 08:32:54 2021 +0100

    [deployment] Use netlify environment

[33mcommit 30dedd19146f914a448916362c13c24684d92cec[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Dec 4 08:09:31 2021 +0100

    [deployment] Trigger build through webhook

[33mcommit 5247a22f00e90cc61783d56c4d1029d65e3716f1[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 3 22:44:38 2021 +0100

    [deployment] Test netlify deployment trigger

[33mcommit 40d1a1e77554fc18963d3924ca07cb36a634f04e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 3 22:30:32 2021 +0100

    [deployment] Add maintenance mode easily deployable

[33mcommit e583f2791f23433c17c2d8550b4d36984209a96c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 3 22:09:02 2021 +0100

    [deployment] Update dummy firebaseConfig to please linter

[33mcommit 46dc87db588ff9fe4ddfe8ec4f2d92fabca516ad[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 3 21:41:21 2021 +0100

    [deployment] revers eslint version to 7 for compatibility with old angular

[33mcommit 62180df5231ee6ab9f9884733fdc054c232b4a1e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 3 20:03:21 2021 +0100

    [deployment] Update scripts to get full CI pipeline working hopefully

[33mcommit 45430147bf18f89a0433a3eb54c791a575dd4107[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 3 19:27:04 2021 +0100

    [deployment] Complete overhaul of CI scripts

[33mcommit 8d333f195a31b5bcbe0b61bb88376566c8599ed1[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 3 08:59:00 2021 +0100

    [deployment] Fix typo

[33mcommit 05bbfdaa4ea016bcbf23e998bfb4679b09e6377a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 3 08:55:48 2021 +0100

    [deployment] Uses inputs for custom action

[33mcommit 8c37d0cba48ee84746ab6040c1dbafd19e4a7162[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 3 08:48:22 2021 +0100

    [deployment] Further simplify custom action

[33mcommit 96bdd685fb442716078a8bd60eaf2065b1e42981[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 3 08:45:35 2021 +0100

    [deployment] Fix custom action

[33mcommit 9294bfef1acc22833594a72a30328772296a6fa9[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 3 08:42:23 2021 +0100

    [deployment] Move custom action to subdirectory

[33mcommit 3855190ab39f073fe44e061d1908b2389a12c6b7[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 3 08:39:03 2021 +0100

    [deployment] Try to get custom action working

[33mcommit b75dc7fbb8a9c9eb5af2abe7ce50b865d4fb96dd[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 3 08:35:20 2021 +0100

    [deployment] Perform checkout before using custom action

[33mcommit ffe3b0df34194fa759015fa9b69e2a9d53d234e3[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 3 08:29:43 2021 +0100

    [deployment] Syntax error in action yaml

[33mcommit ad165a000be4743fc73ddccb772cf30672582b95[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 3 08:27:52 2021 +0100

    [deployment] Use newly defined action in workflow

[33mcommit 87c601c3a4e1b80873034b87fe1b89f07fd4ed6c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 3 08:26:25 2021 +0100

    [deployment] Update CI workflows

[33mcommit d8f979e6701250502bd7723ead55b12fdde8dda7[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 2 22:16:15 2021 +0100

    [deployment] Simply build script as much as possible to reduce build time

[33mcommit 2f8f9e395279be74491adc51dffdb82c7e15dea2[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 2 18:07:33 2021 +0100

    [deployment] Disable image generation to gain build time

[33mcommit 169df28e2d113a034465ac60053ffd6b234b8df8[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 2 08:29:45 2021 +0100

    [deployment] Really trying to get chromedriver to work

[33mcommit e1ecc7cc4369fd2e1efffa3c1e6b3c79a6c938fb[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 2 08:18:43 2021 +0100

    [deployment] Try to set CHROME_BIN

[33mcommit b23eec72380f1001f58149545768399fc7defa0c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 2 06:55:09 2021 +0100

    [deployment] Add debugging code

[33mcommit 0daa3ae9473abb2abbc04403067a964eb20da26d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 1 08:56:21 2021 +0100

    [deployment] Update screenshotter

[33mcommit 745a99ee9836d3068796c3e016fdaf3fdbdb4cee[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 1 07:55:58 2021 +0100

    [deployment] Fix pip call

[33mcommit 7f18bf6cfa91aecca51a9cbec07a5c84f1b3128e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 1 07:00:51 2021 +0100

    [deployment] Force the use of python 3

[33mcommit 3d2a6a9ea6b01e80a7c7d9f02238888c66f0afed[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Nov 30 21:58:16 2021 +0100

    [deployment] Use webdriver-manager to get chrome to work hopefully

[33mcommit b38f543fdf7a2754c0c684f47daace486dccf9d8[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Nov 30 21:58:07 2021 +0100

    [deployment] Update dependencies

[33mcommit ebdb76a68618c57c4f9851748c47b72648232eb7[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Nov 30 21:47:10 2021 +0100

    [deployment] Try to get chromedriver working

[33mcommit d95e29aa65a2fcb8c0c56370a5ae3f95e54d9789[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Nov 30 17:15:16 2021 +0100

    [deployment] Fix typo in package.json

[33mcommit a72c918519a4a36cac0e8634c36fe04e479802c8[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Nov 30 17:13:28 2021 +0100

    [deployment] Improve netlify production build

[33mcommit a59a664c86ea85be9fe58a71a334a7cadfc69348[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Nov 30 07:53:04 2021 +0100

    [deployment] One more typo

[33mcommit 192e50cb6bd6737df5be894593ad16ee26a254da[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Nov 30 07:46:30 2021 +0100

    [deployment] Fix more typos in deployment script

[33mcommit ecc2aa5b405d4a5271215e0ca1044cdd5986ce48[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Nov 30 07:30:24 2021 +0100

    [deployment] Different approach for deployment script

[33mcommit d638bfa983f6a26b598e69729b99d3fe9f6d0372[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Nov 30 07:14:14 2021 +0100

    [deployment] Fix typo in script

[33mcommit 2ff68d77f2fffb1c326dc231cb1d7dbccec4e38c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Nov 30 07:08:06 2021 +0100

    [deployment] Use secret variables for firebaseConfig

[33mcommit ad1fd4ceebf0af4bfe278cc55872f3774937ff89[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Nov 27 17:44:20 2021 +0100

    [deployment] Try to get deployment working

[33mcommit 5612a80dcc3061f90be1e8d38511a1494b4e92be[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Nov 27 10:32:48 2021 +0100

    Add package-lock

[33mcommit 7ad16117c0d5bb77cf257e252f2600ad7be4a33e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Dec 28 11:25:31 2021 +0100

    [dark-mode] Some design improvements

[33mcommit 1eef899a53f6ffbe2d6719584bf7db87f4a4b503[m
Merge: e1f02441a 92f203508
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Tue Dec 28 08:40:32 2021 +0100

    Merge pull request #128 from MartinREMY42/welcome-no-gameservice
    
    Remove GameService dependency from WelcomeComponent

[33mcommit 92f2035083a5f04055332edc36b74777896c95fe[m
Merge: c3423c303 e1f02441a
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Dec 28 08:18:55 2021 +0100

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into welcome-no-gameservice

[33mcommit c3423c303ad6e1cc723bdf9563514d37435398b2[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Dec 28 08:17:52 2021 +0100

    [welcone-no-gameservice] PR comment

[33mcommit 3578d27cc8d533856cc76ce05c2538e5fc499f28[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Dec 28 08:15:54 2021 +0100

    [conspirateurs] Implement moves and state, draft rules

[33mcommit 83a3da7c194210a1387932dc6a41a56812f8d5b4[m
Merge: 9384ba65f e1f02441a
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Dec 27 08:40:02 2021 +0100

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into AddTimeToOpponentCleanerVersion

[33mcommit e1f02441a9eeade4e8a018add188c80cc9dcba65[m
Merge: eeed3739d 281d3f755
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Mon Dec 27 08:29:52 2021 +0100

    Merge pull request #124 from MartinREMY42/linter
    
    Linter

[33mcommit 9384ba65f405b1916097b590f4deb8aead3c38ed[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Dec 27 08:19:58 2021 +0100

    [AddTimeToOpponent] PR Comments Wave 1

[33mcommit f4ace3baf1f3d5fdf2ea0267e22d0135051286d0[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Dec 27 08:14:03 2021 +0100

    [deployment] Rename pantheonsgame to everyboard

[33mcommit 6e36f28acb9b7d71fb34ab96c4661668dc65ec4f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Dec 27 08:11:07 2021 +0100

    [deployment] Finalize new workflow

[33mcommit 00376a94f9b5c197232107bddfe8aae3dc011342[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Dec 26 16:45:21 2021 +0100

    [welcome-no-gameservice] Finalize changes

[33mcommit e00d180970bf17c106f3f35789ceb6be69bda8a8[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Dec 26 16:43:55 2021 +0100

    [welcome-no-gameservice] Cover new game creation page

[33mcommit e695168a6533daa85d6aa5180c2c25cd17863884[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Dec 26 13:17:20 2021 +0100

    [P4Enhanced] P4 and Six coverage bumped and rules utils used for test

[33mcommit 80ee9201f60ab0f88f8e6dd4a54096783aa31a27[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Dec 24 18:41:48 2021 +0100

    [Brandhub] Make tafl component adapted to different sized boards

[33mcommit 5845c36094f895934f3071b65d5ede92778b5f26[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Dec 24 13:51:19 2021 +0100

    [AddTimeToOpponent] moved all change in this PR, previous one was polluted

[33mcommit 8dbc9eae63fdf41ad6a34585e3083aa1b02b6942[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 24 11:53:28 2021 +0100

    [deployment] Add email info in ng deploy
    
    (Lunch break commit)

[33mcommit 43fe8a5948704c6db367ca2f0956a975d05ffb08[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 24 09:02:39 2021 +0100

    [deployment] Enable logging to see what went wrong

[33mcommit 2ee627c48e8b3f27c19ae218d8069dc98b27588a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 24 08:37:11 2021 +0100

    [deployment] Fix dependencies for gh-pages deployment

[33mcommit 5abc5356fe580da37ab91cab98c5156f8eba7989[m
Merge: e741f9444 c765b2ba7
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 24 08:07:19 2021 +0100

    Merge pull request #2 from EveryBoard/deployment
    
    Deployment

[33mcommit c765b2ba7bc0c110afc1652d9006aa4581beac0b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 24 08:01:06 2021 +0100

    [deployment] Use github pages for master/dev

[33mcommit 1b4095b2ddd94b6baa7d9f80ad7fa402963292e5[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 24 07:36:40 2021 +0100

    [welcome-no-gameservice] Add new online game creation page

[33mcommit 7bea717ba3659abb97ef5463438668addf0037d4[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 23 08:53:24 2021 +0100

    [welcome-no-gameservice] Online game creation becomes online game selection, as it will be replaced

[33mcommit e741f9444ecdd5a066a739ac633a688bf4541c23[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 23 07:53:40 2021 +0100

    [deployment] Trigger CI build

[33mcommit 281d3f755bd6977b4559cffb14af69e2ae866eeb[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 23 07:52:13 2021 +0100

    [linter] Move remaining errors to warning for the time being

[33mcommit 7517670d805804b0e464183f2531a8884d62a5b1[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 23 07:47:37 2021 +0100

    [linter] Go back to worse code quality while waiting for update to newer ng versions

[33mcommit 2cfa65dbe6c0355fa464a3ef726e86f0a215f421[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 23 06:59:25 2021 +0100

    [deployment] Add build script back

[33mcommit ea64ca689ac8d258b51ad1b1873f152e1ea6caa7[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 22 22:23:23 2021 +0100

    [linter] Add max-lines-per-function rule for non-spec files

[33mcommit 27521909822ec94ba1a009db5f32a0b937575eb8[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 22 21:58:52 2021 +0100

    [deployment] Update netlify-cli dependency

[33mcommit 479a10c2982f45a224201b46654a7249ab0fe9e7[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 22 21:46:26 2021 +0100

    [linter] More lint rules

[33mcommit 6c171b6b7129dbac5933c20e329288ec76ded0da[m
Merge: eeed3739d 9015153c8
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 22 21:25:16 2021 +0100

    Merge pull request #1 from EveryBoard/deployment
    
    Deployment

[33mcommit 9015153c863b6cf2ebdfc19fb67a891caf51a398[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 22 21:24:43 2021 +0100

    Revert "[deployment] Experiment with CD: try to get branch deploy with prod"
    
    This reverts commit 5f9309d5415814c3ae184ac22ebd1d949b22568d.

[33mcommit a1a3cdf1a2685d2ec022994a02ed7f60466ebabf[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 22 21:24:30 2021 +0100

    Revert "[deployment] Try netlify build"
    
    This reverts commit a53bbc9aed0bc622dc96075c07f0aa13b5817dfb.

[33mcommit 8e9e2b8c7bbd3fec1b499d2bc32fce5bbc641e1e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 22 21:24:11 2021 +0100

    Revert "[deployment] Add build script for netlify"
    
    This reverts commit 3688b2e9f61037896170d263fa06cfd422981640.

[33mcommit 3688b2e9f61037896170d263fa06cfd422981640[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 22 21:02:55 2021 +0100

    [deployment] Add build script for netlify

[33mcommit a53bbc9aed0bc622dc96075c07f0aa13b5817dfb[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 22 20:31:50 2021 +0100

    [deployment] Try netlify build

[33mcommit 889888d7a8bbad139d06f0d9a312d569aac584f6[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 22 08:22:59 2021 +0100

    [linter] Detect number of todos, and add strict-boolean-expressions check

[33mcommit 5f9309d5415814c3ae184ac22ebd1d949b22568d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 22 07:52:53 2021 +0100

    [deployment] Experiment with CD: try to get branch deploy with prod

[33mcommit ef20cbd80492e6d17faa93b7c7e1caadb0fc76c5[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 22 07:31:06 2021 +0100

    [deployment] Update translations, update image script

[33mcommit bc586fa6ebddd9bdaa7580ce7e357502f51f73c7[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 22 06:49:51 2021 +0100

    [deployment] Update package-lock.json after merge

[33mcommit 4c6d40acd957ed70786a9f36decb74735f2858b3[m
Merge: a4d947f05 eeed3739d
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 22 06:45:11 2021 +0100

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into deployment

[33mcommit eeed3739d5bb14edd52c3ef1043cdf9384348ea8[m
Merge: 6f7fe666b 0a1df80a8
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 22 06:36:31 2021 +0100

    Merge pull request #119 from MartinREMY42/YinshHighlights
    
    YinshHighlights

[33mcommit 0a1df80a8127b9b75de2f957bcaeb35c6915e511[m
Merge: 64a305ca8 6f7fe666b
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Dec 21 22:09:25 2021 +0100

    [YinshHighlights] pulled develop and fixed conflict

[33mcommit 96d536931717168ab9dacc11f1738ca9ecb4b0f9[m
Merge: 7db399b78 cd36113cf
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Tue Dec 21 21:50:27 2021 +0100

    Merge pull request #122 from MartinREMY42/testutils-pass
    
    [testutils-pass] Improve tests for passing a turn

[33mcommit 6f7fe666b669679f3681c1cb15e96fde153ccd71[m
Merge: b861371a8 e65867dc8
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Dec 21 21:47:17 2021 +0100

    Merge pull request #121 from MartinREMY42/Brandhub
    
     Brandhub fix

[33mcommit 64a305ca82cec27145dde4cae21c7ead22379f6c[m
Merge: 69feb3c7b b861371a8
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Dec 21 20:56:04 2021 +0100

    [YinshHighlights] pulled develop and fixed conflicts

[33mcommit e65867dc85dde11f7d3415dd9db4f7eaa7d216ce[m
Merge: d0a02e766 b861371a8
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Dec 21 20:28:43 2021 +0100

    [Brandhub] pulled develop and fixed conflict

[33mcommit d0a02e766b9848ed8197c3fb16c78991bf4b21df[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Dec 21 20:16:34 2021 +0100

    [Brandhub] non valid move enhanced

[33mcommit b861371a8bd7c75f4cd55f48b39fe9da7594430a[m
Merge: 384756050 5802cd49e
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Tue Dec 21 19:30:55 2021 +0100

    Merge pull request #115 from MartinREMY42/dark-mode
    
    Dark mode

[33mcommit 384756050589fe6e05e0a101302fbf9c433296bd[m
Merge: b6e23470f 0cdc7932e
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Tue Dec 21 19:23:36 2021 +0100

    Merge pull request #123 from MartinREMY42/strictness
    
    Strictness pt. 2

[33mcommit a4d947f05e83c79dcba1cf8fad476d6f97c2d59f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Dec 21 18:43:38 2021 +0100

    [deployment] Trigger new deployment

[33mcommit cd36113cfb8ee4a9e923dae71a9be4969705e8b0[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Dec 21 17:41:39 2021 +0100

    [testutils-pass] Update karma-json because there are less branches to cover

[33mcommit 5802cd49e8313d1121b12d9a8f4a775e859e6a9b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Dec 21 17:25:48 2021 +0100

    [dark-mode] Coerceo visual fix

[33mcommit 69feb3c7b122f88fd7dc0b9dc648317bf6a55da9[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Dec 21 08:47:18 2021 +0100

    [YinshHighlights] PR Comment Wave 1

[33mcommit 0cdc7932e3154803ceb521a312688ccdd8182398[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Dec 21 08:25:29 2021 +0100

    [strictness] Forgot MGPFallible.toString definition

[33mcommit 56274fc93769867b03a637d06a809b94038683f7[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Dec 21 08:22:20 2021 +0100

    [strictness] PR comment 2

[33mcommit f4be01aae31fec7eb003d1882ae3e714db3be7e3[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Dec 21 07:39:05 2021 +0100

    [testutils-pass] Lint

[33mcommit 9f77c74b071f382a00b9c96517aee73ad0d99527[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Dec 21 07:36:42 2021 +0100

    [strictness] PR comment

[33mcommit 5e604250c03d3215442a67c137b24659851ebc31[m
Merge: b6e23470f 4bbe3c388
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Dec 21 07:35:53 2021 +0100

    Merge branch 'strictness' of github.com:MartinREMY42/multi-game-project into strictness

[33mcommit 04cb5688b6bd8e51faf5a652d696b954d4b4b854[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Dec 21 06:59:20 2021 +0100

    [dark-mode] Use polygons in coerceo

[33mcommit 3097143871cf4ef47949f0f9200113354c5fd649[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Dec 21 06:50:11 2021 +0100

    [dark-mode] Properly regenerate coverage data

[33mcommit 88a5ce7906d5398573254470167cb9d008423f1a[m
Merge: 8760ddeb1 b6e23470f
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Dec 20 22:05:28 2021 +0100

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into dark-mode

[33mcommit b6e23470f4e77b588eae2b225cdb5cf9b18cd7c9[m
Merge: 22c71d42e 8ebe89abd
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Dec 20 22:01:50 2021 +0100

    Merge pull request #104 from MartinREMY42/MGPNode_firstNode
    
    Mgp node first node

[33mcommit 79288758cdf39988d87b22c5b8cbde38190afb41[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Dec 20 21:51:14 2021 +0100

    [testutils-pass] Improve tests for passing a turn

[33mcommit 72f932a2c0733203a17c9280d727a6ddd0f737a0[m
Merge: a58a9b0ff 22c71d42e
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Dec 20 21:41:29 2021 +0100

    [Brandhub] pulled develop and fixed conflict

[33mcommit a58a9b0ff374e467ab3f7d55715018e2539179ad[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Dec 20 21:39:53 2021 +0100

    [Brandhub] Fixed unwanted sandwich against throne

[33mcommit 8ebe89abd1f55955649487a180c7208088bc1028[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Dec 20 21:06:05 2021 +0100

    [MGPNode_firstNode] unused import removed

[33mcommit 70f293bf76aadf86d5aaeba6175ca79f2084e546[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Dec 20 20:55:06 2021 +0100

    [YinshHighlights] pulled develop and bumped numbers

[33mcommit 38718503b11200beb1fede3eb0cc0e439ffcddcc[m
Merge: 604c2ac3d 22c71d42e
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Dec 20 20:52:14 2021 +0100

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into YinshHighlights

[33mcommit 604c2ac3dd8c4a8937d76f0b4b937386b9f59864[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Dec 20 20:51:08 2021 +0100

    [YinshHighlights] case become space, and ticket is done

[33mcommit 4bbe3c3881ea342a2849c35c23d8ba04e545e34f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Dec 20 08:12:29 2021 +0100

    [strictness] Quick fix of player names in online component + remove one branch

[33mcommit 3fb92587481e5e7ce8f6719f655893015fe67910[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Dec 20 07:47:37 2021 +0100

    [deployment] Update python deps, once more

[33mcommit c48644893797c012fe1c5fff312bf1f2f6af6be9[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Dec 20 07:22:18 2021 +0100

    [deployment] Update python dependencies

[33mcommit ff292154bfe680765f4e12c56fa7d0be52c763d3[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Dec 20 06:53:28 2021 +0100

    [deployment] Clean deployment script

[33mcommit e1a6e407be0784ad99032cea5ac64fda30933c3d[m
Merge: ddd03349d 22c71d42e
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Dec 19 21:48:12 2021 +0100

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into deployment

[33mcommit 8760ddeb1ee8eb1ff2d6072baf5bfc9a92b92c9a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Dec 19 21:44:22 2021 +0100

    [dark-mode] PR comments

[33mcommit e2ad7ea48a34c329df3388b44c6ae0bf2f1cfc87[m
Merge: 0729c3c69 22c71d42e
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Dec 19 21:39:31 2021 +0100

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into dark-mode

[33mcommit 0729c3c694e8204c3900d29305f5303dfc6ca0de[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Dec 19 21:21:22 2021 +0100

    [dark-mode] Add tests for welcome page

[33mcommit cf8c20edd512e388b60b28c6c950d643e5e5c148[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Dec 19 21:03:14 2021 +0100

    [YinshHighlights] (-1, -1) coord optionalised

[33mcommit 2c0c8fe4beb36cbfe98ab3a6a7b53b5a8ab6a6f4[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Dec 19 20:39:35 2021 +0100

    [dark-mode] Add question mork on card games

[33mcommit 59d111ccb1c3865942e892083ead323f7b535ff9[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Dec 19 16:39:07 2021 +0100

    [dark-mode] Improve phone support

[33mcommit eb195f3eadae3ac37cffd6ffc903913ebb5fce95[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Dec 19 09:23:28 2021 +0100

    [dark-mode] Use modals

[33mcommit d2740297e0295b8f7da59fe7ab29af8a5aa745dc[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Dec 18 15:01:53 2021 +0100

    [MGPNode_firstNode] finalized

[33mcommit 1c1011da794aae203bff79a7f2f89d0d9fdc4a63[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Dec 18 08:34:38 2021 +0100

    [dark-mode] Get rid of masonry

[33mcommit 7db399b7828ea4856f5b423d6093cc97aed52164[m
Merge: 02e648d4a 22c71d42e
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Fri Dec 17 22:31:33 2021 +0100

    Merge pull request #118 from MartinREMY42/develop
    
    Develop

[33mcommit 0fa00ae2b134cf821c9e4502d815f44c00ee730b[m
Merge: 9d040ad3c 22c71d42e
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Dec 17 22:12:25 2021 +0100

    [MGPNode_firstNode] coverage.py fix

[33mcommit 22c71d42ef8d1c4f9c4ac1ed32ec8acecfdd3fe8[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Dec 17 21:56:11 2021 +0100

    Small coverage.py and lead eisenbug fix

[33mcommit 929cfa9b44578272d451134c191d7da95fd650f4[m
Merge: b3854804d 1e0013919
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 17 20:48:33 2021 +0100

    Merge pull request #117 from MartinREMY42/SaharaNeighborErrorMessage
    
    Sahara neighbor error message

[33mcommit 1e0013919970ef497c5b54b23522e0880cfbc541[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Dec 17 20:56:50 2021 +0100

    [SaharaNeighborErrorMessage] PR Comment Wave 2

[33mcommit 9d040ad3c56ea6578dd4bd10c7423e2545c5f152[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Dec 17 20:48:15 2021 +0100

    [MGNode_firstNode] PR Comment Wave 1

[33mcommit 086fe4afda0f578727bb3c0f89e3d2b6062989ec[m
Merge: ddabb2e66 b3854804d
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Dec 17 20:15:47 2021 +0100

    [SaharaNeighborErrorMessage] pulled develop and fixed conflict

[33mcommit dfc4e15cca7807041df38d18eadd492a3cfcdcaf[m
Merge: 9c936ae97 6691e353b
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Dec 17 20:09:10 2021 +0100

    [MGPNode_firstNode] pulled develop and fix conflicts

[33mcommit b3854804da0804c7c25b1b5aeca166fb7a667ba0[m
Merge: 6691e353b b16302198
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 17 20:00:07 2021 +0100

    Merge pull request #116 from MartinREMY42/EncapsuleTestAndDesignEnhancement
    
    Encapsule test and design enhancement

[33mcommit ddabb2e669daf03eba242dec57f6eab8e68e79e2[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Dec 17 14:40:54 2021 +0100

    [SaharaNeighborErrorMessage] PR Comment Wave 1

[33mcommit b1630219883d071ed61bc45741fc7530ebfc8dd2[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Dec 17 14:14:22 2021 +0100

    [EncapsuleTestAndDesignEnhancement]PR Comment wave 1

[33mcommit a816e9e3f7ec89ffec16caba3b2c00594f4d0771[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 17 08:38:51 2021 +0100

    [dark-mode] Uniformize game's fills and strokes

[33mcommit 87d1ff4ab87c0e0a1c9029eddb9bc3c288e95c30[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 16 17:18:41 2021 +0100

    [dark-mode] Various improvements

[33mcommit 105dc3a6542910cd11847f81f029235644d4327a[m
Merge: 7f27de806 6691e353b
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Dec 16 22:46:01 2021 +0100

    [SaharaNeighborErrorMessage] pulled develop and fix conflict

[33mcommit 7f27de8060dbe37460e41a810251671e5e6b7f72[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Dec 16 22:40:50 2021 +0100

    [SaharaNeighborsErrorMessage] errors message of static move and invalid sahara move enhanced

[33mcommit f48cfdf8c079273a9f3c10645b4c52a86b3afadf[m
Merge: 734aee73e 6691e353b
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Dec 16 22:10:42 2021 +0100

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into EncapsuleTestAndDesignEnhancement

[33mcommit f312cb9145c2f69a7461af851f47341f29b0eaad[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Dec 16 22:09:22 2021 +0100

    [SaharaNeighborErrorMessage] work in progress

[33mcommit 6691e353b3258b48335b61c40167fdad56f67197[m
Merge: 6ac50aa5c 582b20ed2
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 16 17:33:11 2021 +0100

    Merge pull request #107 from MartinREMY42/Brandhub
    
    New game: Brandhub

[33mcommit 582b20ed261b2c75628e4b5597ac38c72d4cb13b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 16 17:25:10 2021 +0100

    [brandhub] Finalize PR

[33mcommit 734aee73ee18652175d122f0e3fc5402aaad042f[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Dec 16 15:19:30 2021 +0100

    [EncapsuleTestAndDesignEnhancement] Done, 1 TODO and 1 xit removed

[33mcommit 33bbead0d423760aa770b425160bf6018cd48963[m
Merge: 029a841b0 dbe22587a
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 16 06:53:14 2021 +0100

    Merge branch 'strictness' of github.com:MartinREMY42/multi-game-project into dark-mode

[33mcommit 070c6c498d5140e36a28e9838379f6e57538114f[m
Merge: d79ca926d 6ac50aa5c
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Dec 15 21:06:01 2021 +0100

    [Brandhub] Pull develop and fix conflict

[33mcommit d79ca926d6d781cc9433d9a8676d75eafa9ab71b[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Dec 15 18:15:58 2021 +0100

    [Brandhub] Bump coverage to 100%

[33mcommit 6ac50aa5cb625500dfda6077ba97ad10dd41d99c[m
Merge: a68186a91 dbe22587a
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Wed Dec 15 08:20:35 2021 +0100

    Merge pull request #103 from MartinREMY42/strictness
    
    Strictness

[33mcommit dbe22587a4bd830e773536342b248c284a3b1a28[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 15 08:00:42 2021 +0100

    [strictness] Remove unneeded translation

[33mcommit ee873670a79e10fef2c3800b36947e71ffc03937[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 15 07:51:32 2021 +0100

    [strictness] Final PR comments

[33mcommit f664c265c22f9a241f4d5d4add6cf29904e439fc[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Dec 14 23:47:50 2021 +0100

    [strictness] PR comments

[33mcommit e7ada6d7d8240f1b293ba6a16d22ea2870ddf7b8[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Dec 14 21:25:32 2021 +0100

    [Brandhub] PR comment wave 4

[33mcommit 2b0883ad71cfe12eb202a91589a1551409b920a1[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Dec 14 08:00:37 2021 +0100

    [strictness] Coverage

[33mcommit 1f7360460ec21ba1e17e44436ba0cc048dcaef9d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Dec 14 07:52:22 2021 +0100

    [strictness] Remove unneeded code

[33mcommit 055c32659eee7261e8c909bb6be4cd7d85568d04[m
Merge: bd6218ed8 a68186a91
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Dec 14 07:49:17 2021 +0100

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into strictness

[33mcommit bd6218ed8f7d627369a1ea9e700f3ecd76fbe9f0[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Dec 14 07:44:11 2021 +0100

    [strictness] PR comments

[33mcommit 804321ec0b2e2f61f98ca00f656930a02deb7610[m
Merge: 60c525536 a68186a91
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Dec 13 21:51:52 2021 +0100

    [Brandhub] pull develop and fixed conflicts

[33mcommit 60c5255361326514ed95826869a5b8f6e56ddf1c[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Dec 13 21:49:00 2021 +0100

    [Brandhub] PR Comment Wave 3

[33mcommit 029a841b06444cfe297a568a5f54bd05364bc4f8[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Dec 13 08:52:04 2021 +0100

    [dark-mode] Test new code

[33mcommit a5480c1010ff889ed56753b34fc24e3901fdd418[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Dec 13 08:16:16 2021 +0100

    [dark-mode] Add user settings to change theme and language

[33mcommit 9b439fba6a0b9fabb5d5191db70d7f00995a7c5c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Dec 12 18:41:42 2021 +0100

    [dark-mode] Improve welcome cards design

[33mcommit d7e9e4b0666c0d47fce694ca3c6dedc15aa60abc[m
Merge: d526c7942 a68186a91
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Dec 12 11:05:32 2021 +0100

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into dark-mode

[33mcommit d526c79428bc1e14e23f9dfb558acde0de813598[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Dec 12 10:24:35 2021 +0100

    [dark-mode] Generate both dark and light images

[33mcommit 438ad3f92ad03408157525cb6115e3206c390793[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Dec 12 10:16:48 2021 +0100

    [dark-mode] Store theme changes

[33mcommit 1c0bd9d7a539f1752fd99d7eb5d7c7f9201eb381[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Dec 11 23:54:56 2021 +0100

    [dark-mode] Improve column settings

[33mcommit 9c936ae978752f5c6e5a28ab05f974e05afa215f[m
Merge: 45ae36ffa a68186a91
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Dec 11 21:25:55 2021 +0100

    [MGPNode_firstNode] pulled develop and fix conflicts

[33mcommit 268dd5f4f206950422a25de8d27f9f32c40d049b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Dec 11 11:33:16 2021 +0100

    [dark-mode] Introduce dark and light images

[33mcommit 3818100d1c0571126b078c9585bc663dc6403f66[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Dec 11 11:22:31 2021 +0100

    [dark-mode] Add dynamic CSS loading

[33mcommit 9103209a3216a7cc5a98a3d745b1597bafa05d78[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Dec 10 18:36:19 2021 +0100

    [Brandhub] PR Comment wave 2

[33mcommit a68186a919e49ab4bec3a7fc9fa3c835b40a2510[m
Merge: 77f174824 19dfda171
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Fri Dec 10 18:30:40 2021 +0100

    Merge pull request #113 from MartinREMY42/diam
    
    [diam] Don't let pieces be hovered when it is not the player's turn

[33mcommit ddd03349ddda9ff514691a2223cfeac925e8d242[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 9 20:08:08 2021 +0100

    [deployment] Try to get branch name in CI

[33mcommit b0edbda497ed78aadee0fb720de0e49e6ce84b65[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 9 19:30:49 2021 +0100

    [deployment] Add some debugging info

[33mcommit 7597de010d8631433ace687de8c9693cb2db1a47[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 9 17:33:13 2021 +0100

    [deployment] Try to get the branch name from the PR

[33mcommit a5fb61d21a635d76fe12a5d4f1461c745302b6a5[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 9 08:10:10 2021 +0100

    [deployment] Try fix for org member

[33mcommit 06d9a83064cca65a23b33430542878bf3ce64b24[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Dec 8 22:28:43 2021 +0100

    [Brandhub] PR Comments

[33mcommit a18a46992568bdea1593bdce138336499635ce84[m
Merge: 7aacd22d9 77f174824
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 8 08:37:07 2021 +0100

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into dark-mode

[33mcommit 7ad577772a7b949671a500ea6aeeee40c5b64efd[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 8 07:35:26 2021 +0100

    [deployment] Fix action output usage

[33mcommit a3f71191cabaf0e5a8ad02ac2384b215cd627930[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 8 06:55:09 2021 +0100

    [deployment] Update action version

[33mcommit 7538d6c09fe4891fcd28ede4e6090c832610f6f4[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Dec 7 22:02:43 2021 +0100

    [Brandhub] Fix Tafl Move Encoder test

[33mcommit 224b6ee1616f1268fb16110cd929d50f76502459[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Dec 7 21:58:11 2021 +0100

    [deployment] Trying with quotes

[33mcommit 2c73d7992e5ebae0a927d5fdd97ee26b589d70dd[m
Merge: ea6cebc31 77f174824
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Dec 7 20:16:27 2021 +0100

    [Brandhub] First PR wave answered

[33mcommit ea6cebc318cd5bef6591801aa8cda2a5a046250d[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Dec 7 19:32:04 2021 +0100

    [Brandhub] Coverage bumped

[33mcommit 20b47c3e4898dde18a5bb77342500740e50eb731[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Dec 7 17:43:21 2021 +0100

    [strictness] minify six minimax test cases

[33mcommit 07869ae8caaa4beef1e19b05c09ec75c3d31144a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Dec 7 12:11:54 2021 +0100

    [strictness] Revert minimax states
    
    (lunch commit)

[33mcommit c9ab13867dd4e01c2e2ce2fddcf80a66500778a1[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Dec 6 17:48:14 2021 +0100

    [strictness] PR comments

[33mcommit 19dfda171a7937171503bd21d5a7ac7674b2cfac[m
Merge: 99836976f 02e648d4a
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Dec 6 21:52:47 2021 +0100

    Merge branch 'master' of github.com:MartinREMY42/multi-game-project into diam

[33mcommit c9191ecbd8a3bf6dafba8bafc4f68cf97c4f2f35[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Dec 6 21:46:03 2021 +0100

    [deployment] Try to pass username to action

[33mcommit 02e648d4a806013c291f9c5e7c284653dfeb98ed[m
Merge: 1589cad59 79847bddb
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Mon Dec 6 21:44:49 2021 +0100

    Merge pull request #114 from MartinREMY42/six
    
    [six] Cancel move if during group selection, the user clicks on an empty space

[33mcommit 284c2449b13f37168c3a361b4f4a2af25fb41e70[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Dec 6 17:48:29 2021 +0100

    [deployment] Improve deployment on master/develop/feature branch

[33mcommit 25c85fa8bc1ff26204fe95cfb92c4c014d3776f2[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Dec 6 08:14:52 2021 +0100

    [deployment] CD: check if user is member of the organization

[33mcommit 7aacd22d969e946424deba0cc1e0897d832082b7[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Dec 6 08:00:05 2021 +0100

    [dark-mode) Remove unused items in CSS

[33mcommit 79847bddb1f599609575ab60c12330a9aa75a8c7[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Dec 5 10:58:09 2021 +0100

    [six] Update index

[33mcommit db6f0d446adde8827d67f726d7169f544effaf4c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Dec 5 10:49:29 2021 +0100

    [six] Cancel move if during group selection, the user clicks on an empty space

[33mcommit c2957cbc2ddb74ca8450b7c8698f154d8ccf7a90[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Dec 5 09:46:31 2021 +0100

    [strictness] Fixes after merge

[33mcommit ced31b25a5b5fefeab9fa267bd3908a115ce8cf3[m
Merge: 6656430ed 77f174824
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Dec 5 09:20:49 2021 +0100

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into strictness

[33mcommit 6656430ed509afbe1b02e9fdba9a219e0d718d59[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Dec 5 08:55:02 2021 +0100

    [strictness] PR comments and fix Quarto

[33mcommit 99836976f974639f20c467adc9b250e7ff78a2ee[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Dec 4 22:13:06 2021 +0100

    [diam] Don't let pieces be hovered when it is not the player's turn

[33mcommit b1db5fb2c10a7682ad18277caa76eb3161ef2d41[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Dec 4 20:28:27 2021 +0100

    [Brandhub] Translation enhanced; wip

[33mcommit 1589cad5914dc31e6f28dd851bf4c16e48ef821b[m
Merge: e3b2106c0 77f174824
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sat Dec 4 20:16:33 2021 +0100

    Merge pull request #112 from MartinREMY42/develop
    
    Master 27

[33mcommit ee0ba0a42b36bb06a31fdb8ea4dda6c9249f8964[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Dec 4 10:27:05 2021 +0100

    [deployment] Commit new translations

[33mcommit 73c9a6c53716d849125b5be1703b29532bed857c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Dec 4 10:12:11 2021 +0100

    [deployment] Really fix syntax issues

[33mcommit 83adb109efb6c5f0e3b71e7098291e9651d887e0[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Dec 4 10:09:33 2021 +0100

    [deployment] Fix syntax

[33mcommit 6450f0826f43bc612b88b931557a0cffbc83c107[m
Merge: 623415ef2 77f174824
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Dec 4 10:08:39 2021 +0100

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into deployment

[33mcommit 623415ef2264a466487427a069aff359e4313846[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Dec 4 10:05:30 2021 +0100

    [deployment] Use GH secrets

[33mcommit c96e661d18c1fac4eb49821e56d34bda629ffe74[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Dec 4 09:37:28 2021 +0100

    [deployment] Forgot to checkout

[33mcommit 77f174824f1fc54a1e2bf1204d1cc5b5e95201af[m
Merge: 39f2cf78a 62371bcbf
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sat Dec 4 09:29:24 2021 +0100

    Merge pull request #111 from MartinREMY42/chat
    
    Chat: add missing unsubscribe

[33mcommit f94e5990124fd91e414c0a24aa3173c3b1c8eb64[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Dec 4 09:26:39 2021 +0100

    [deployment] More experiments with deployment, now from github

[33mcommit 276844f2f0fb738e3a8fa984dcf9db26653acf8b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Dec 4 09:06:21 2021 +0100

    [deployment] Forgot secrets

[33mcommit 97122b14283636e2b7abff5376d705c865ba4a86[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Dec 4 08:50:45 2021 +0100

    [deployment] Try to use netlify CLI to trigger deployment

[33mcommit f8bf760ae62869c8f1da8210b756c04f0b9551f9[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Dec 4 08:32:54 2021 +0100

    [deployment] Use netlify environment

[33mcommit 62371bcbf551fd93961d4ff155d2de3e3eaa5828[m
Merge: 681c90548 39f2cf78a
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Dec 4 08:14:53 2021 +0100

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into chat

[33mcommit 681c9054827472e08ef35b6e85d8f6beaa0000bf[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Dec 4 08:14:39 2021 +0100

    Revert "[chat] Remove some indentation for easier review"
    
    This reverts commit 1e7d347e37f5c164a0081cdaf615b0056776735d.

[33mcommit 1a5dea905be72654cc3a4a467d3294b1b8e728ba[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Dec 4 08:09:31 2021 +0100

    [deployment] Trigger build through webhook

[33mcommit 39f2cf78a5526cd3d35bf0109dd8f85ffea15cff[m
Merge: ccc12c6d0 cebc86820
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sat Dec 4 00:15:26 2021 +0100

    Merge pull request #106 from MartinREMY42/diam
    
    Diam

[33mcommit 4bbe1f14d09fa2b457b0cb2ee50604c9725d987b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 3 22:44:38 2021 +0100

    [deployment] Test netlify deployment trigger

[33mcommit 8e4aee4fa010372f0b1a7813128508eb7b694afb[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 3 22:30:32 2021 +0100

    [deployment] Add maintenance mode easily deployable

[33mcommit 1065e745abe3cf7cac002d7025d875317b7dee1b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 3 22:09:02 2021 +0100

    [deployment] Update dummy firebaseConfig to please linter

[33mcommit 931fbb6f7f1c1ffd6014b52815299e6b8d756aea[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 3 22:07:37 2021 +0100

    [dark-mode] First attempt at dark mode

[33mcommit 82904dfc31972fff870bd0a20af3b826cea006ae[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 3 21:41:21 2021 +0100

    [deployment] revers eslint version to 7 for compatibility with old angular

[33mcommit 34a32ee87718bd44bbb51a2da3cfbacfa4ad5967[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 3 20:03:21 2021 +0100

    [deployment] Update scripts to get full CI pipeline working hopefully

[33mcommit cebc86820991839e5e763b436fa4c7a8eaf89bca[m
Merge: f5cccd6ca ccc12c6d0
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 3 20:40:33 2021 +0100

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into diam

[33mcommit 1e7d347e37f5c164a0081cdaf615b0056776735d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 3 20:05:17 2021 +0100

    [chat] Remove some indentation for easier review

[33mcommit fc0d9b65efc16dc2424379321711458e01d343af[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 3 19:27:04 2021 +0100

    [deployment] Complete overhaul of CI scripts

[33mcommit 2214594c43581a2370a44592edf0104313fe96b3[m
Merge: 8dfd052aa ccc12c6d0
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Dec 3 19:18:29 2021 +0100

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into Brandhub

[33mcommit 8dfd052aac42dc1532adbedf8e742f11cae874df[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Dec 3 19:17:47 2021 +0100

    [Brandhub] Tafl minimaxes fully separated, TaflRules refactored

[33mcommit ccc12c6d028563f727b671382d271f2873a239d3[m
Merge: d7a4481c5 98a300532
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Fri Dec 3 18:54:47 2021 +0100

    Merge pull request #109 from MartinREMY42/reset-password
    
    Add ability to reset password

[33mcommit f0cc808504a914b2798e50bce501567ba9778d33[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 3 08:59:00 2021 +0100

    [deployment] Fix typo

[33mcommit 98f654048f00cc4dc66434ef6f86738667b3e31d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 3 08:55:48 2021 +0100

    [deployment] Uses inputs for custom action

[33mcommit 08c51a3cf1e2ea602ef4e2d26efa190468f5407c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 3 08:48:22 2021 +0100

    [deployment] Further simplify custom action

[33mcommit d1127814fc7424668143aefbe583f2be43926e04[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 3 08:45:35 2021 +0100

    [deployment] Fix custom action

[33mcommit 3193d6d96e70d14c792088c25401572070568835[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 3 08:42:23 2021 +0100

    [deployment] Move custom action to subdirectory

[33mcommit f2f2ef3f43eaa7a9feee606e66eb82484ad13561[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 3 08:39:03 2021 +0100

    [deployment] Try to get custom action working

[33mcommit 70617b0dc2ce1d1c9eb3060f0cfeb9e4d27c701d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 3 08:35:20 2021 +0100

    [deployment] Perform checkout before using custom action

[33mcommit f3162ec2796f2c6bbeb5f124443ca07c3f08f6be[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 3 08:29:43 2021 +0100

    [deployment] Syntax error in action yaml

[33mcommit d84c094999d089b9dc347a94a11ee501a8cb7ef8[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 3 08:27:52 2021 +0100

    [deployment] Use newly defined action in workflow

[33mcommit 5911f5521254c44a09888c5009998955cd1ab875[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 3 08:26:25 2021 +0100

    [deployment] Update CI workflows

[33mcommit f5cccd6ca3350fc49383ae8d26640c623ed8c62f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 3 06:58:58 2021 +0100

    [diam] More PR comments

[33mcommit 25bb040d1a5730771aabe8ef4f9a9e5051ea2ead[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 2 22:16:15 2021 +0100

    [deployment] Simply build script as much as possible to reduce build time

[33mcommit 3b3a68c58f03baf95c49a08fe920c851a56177bc[m
Merge: 9d621a6bc d7a4481c5
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 2 19:26:17 2021 +0100

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into diam

[33mcommit 0304117dbee1f971ef70b419fe5bd3bb5b2fab88[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 2 18:07:33 2021 +0100

    [deployment] Disable image generation to gain build time

[33mcommit e1ac5ff103d63345cd1f91ed54b416fe8b4d53b2[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 2 18:03:45 2021 +0100

    [chat] Fix flaky coverage and add missing unsubscribe

[33mcommit 9d621a6bcfddb7dd83f847c4fe83d04a4dab0bca[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 2 09:05:34 2021 +0100

    [diam] PR comments

[33mcommit ae5ea822f505c2581ac3c195b3037fa802fb1981[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 2 08:29:45 2021 +0100

    [deployment] Really trying to get chromedriver to work

[33mcommit 7c222960d37e756bd5ea8d8d88b7bd2b76ca61dd[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 2 08:18:43 2021 +0100

    [deployment] Try to set CHROME_BIN

[33mcommit 98a3005321cdbc9c3d50aff7193c8120653c7110[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 2 07:57:26 2021 +0100

    [reset-password] Add translations

[33mcommit d8b070807f326511a26f26a78c46a4bca6639623[m
Merge: af86127c0 d7a4481c5
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 2 07:01:27 2021 +0100

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into reset-password

[33mcommit f7f258bc587b5010a22e8d19ea67f1b5d9b8091e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Dec 2 06:55:09 2021 +0100

    [deployment] Add debugging code

[33mcommit d7a4481c57bef79ee91814f4e6039edb2e88f068[m
Merge: b35a20a83 61fb3a3a7
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Wed Dec 1 20:41:27 2021 +0100

    Merge pull request #110 from MartinREMY42/minimax
    
    [minimax] Fix alpha beta pruning

[33mcommit fcbc46b30919f3186ee3a7fbb34f0ec064d7af1c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 1 08:56:21 2021 +0100

    [deployment] Update screenshotter

[33mcommit a401d24435e36d30f23f33cd3d157629372609f9[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 1 08:47:19 2021 +0100

    [strictness] Fix compilation and tests

[33mcommit 02e03dd562f034d31da0dc91ed150dfe4eee2a9b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 1 08:20:38 2021 +0100

    [diam] Fix minimax coverage

[33mcommit cb7a1ae36557e2f52514950c16db91d096b1afa6[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 1 07:55:58 2021 +0100

    [deployment] Fix pip call

[33mcommit c7f7700bc7fcbb0f8c418590dd286567995036b8[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 1 07:49:49 2021 +0100

    [diam] Improve minimax, rename anticlockwise to counterclockwise

[33mcommit 8fcb17fe6416ff28141f795f5d7e1b8c1eb507b5[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 1 07:00:51 2021 +0100

    [deployment] Force the use of python 3

[33mcommit f6d7bdf426f3699bef9cb53337052bffedfa87fe[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Nov 30 21:58:16 2021 +0100

    [deployment] Use webdriver-manager to get chrome to work hopefully

[33mcommit 4ff53fd9ecba9a37a20ed227b8c6ffddb18396d1[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Nov 30 21:58:07 2021 +0100

    [deployment] Update dependencies

[33mcommit a12da61a086b6d279191d9075646295dacdf0318[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Nov 30 21:47:10 2021 +0100

    [deployment] Try to get chromedriver working

[33mcommit 688d2ad50bcb3ae4933268871d4920cf9ca740d9[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Nov 30 19:13:19 2021 +0100

    [strictness] More optionalisation

[33mcommit 0b09a80f4dda3e754b89f3b9eeac10ad81b4cf05[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Nov 30 18:20:06 2021 +0100

    [strictness] PR comments

[33mcommit 1749e5532e8b996531c9b26a0f9fa56049bc8a16[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Nov 30 17:15:16 2021 +0100

    [deployment] Fix typo in package.json

[33mcommit a4849039154fb5652a171943bf66a544ac9cedd9[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Nov 30 17:13:28 2021 +0100

    [deployment] Improve netlify production build

[33mcommit 0bad18ee2ebeb1f8b6ec2c5e594696c8d6979471[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Nov 30 07:53:04 2021 +0100

    [deployment] One more typo

[33mcommit d02b7670fcfadc6e43f2510b623034642f799ef0[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Nov 30 07:46:30 2021 +0100

    [deployment] Fix more typos in deployment script

[33mcommit d70c82d7dc55fde0701b7299a0c851b6da229ea2[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Nov 30 07:30:24 2021 +0100

    [deployment] Different approach for deployment script

[33mcommit 97918dceebb3813a5f5dc34e8fff236c5b792219[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Nov 30 07:14:14 2021 +0100

    [deployment] Fix typo in script

[33mcommit c8baceb78b2d52f3514b983b77449078ce6b5c6a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Nov 30 07:08:06 2021 +0100

    [deployment] Use secret variables for firebaseConfig

[33mcommit 36d6691e6a2b384b211f44e1c77100549fb2d272[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Nov 27 17:44:20 2021 +0100

    [deployment] Try to get deployment working

[33mcommit 9256c9c564320bc26a5c28236d529978c1c8021a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Nov 29 18:40:32 2021 +0100

    [strictness] PR comments

[33mcommit 9ea2d0be2f399657322fac4da08462d2f6f29b2a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Nov 29 17:48:33 2021 +0100

    [diam] Update game info comment and index

[33mcommit 31acefc193c26944afd586f8a20f067fb67b4591[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Nov 29 17:14:43 2021 +0100

    [diam] Disable animation code

[33mcommit 9920f73e01cb41e547eabc28a84c34cbb9e9c16c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Nov 29 17:14:20 2021 +0100

    [diam] Add image, improve component based on comments

[33mcommit d2e686ae2254529d1dae513e238fea0a9f1845d0[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Nov 28 08:52:23 2021 +0100

    [diam] PR comments

[33mcommit e3a1552d4413ea0eb64597d0d7a3b8fa0e5ef9f3[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Nov 28 21:58:54 2021 +0100

    Work in progress, Minimax made generic for Tafl games

[33mcommit 61fb3a3a769b64d26aa8ab8c4b6e7483ce63d2e2[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Nov 28 21:46:12 2021 +0100

    [minimax] Update coverage data

[33mcommit c4cacaf209afe696e122c08e69ad36432e120a4c[m
Merge: 370d17914 b35a20a83
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Nov 28 08:53:51 2021 +0100

    [minimax] Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into minimax

[33mcommit 2ef00c0717325c2181619f0a117bcdf8ac8b5872[m
Merge: 849c40c21 b35a20a83
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Nov 27 18:17:14 2021 +0100

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into diam

[33mcommit b35a20a83d034ff806dc9068a6c24366f83cab1b[m
Merge: a65ceb298 75a86fc30
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sat Nov 27 13:42:15 2021 +0100

    Merge pull request #108 from MartinREMY42/coverage-script
    
    [coverage] Improve script to work on a file-per-file basis

[33mcommit 6f7325073c177879800e8837a258d36d4e6d32a6[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Nov 27 10:32:48 2021 +0100

    Add package-lock

[33mcommit 370d179146527c145a649987bc6f4093d1fbea5a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Nov 26 23:56:01 2021 +0100

    [minimax] Update coverage data

[33mcommit fc94cbe58bcbcf7ea86af36a9c18de30bd1912bc[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Nov 26 21:06:07 2021 +0100

    [minimax] Fix alpha beta pruning

[33mcommit af86127c0249634a374881dc27ed4b58c97f6602[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Nov 24 08:33:49 2021 +0100

    [reset-password] Update test data

[33mcommit 914ff26334e55dd64b404ead6d3f39e717160417[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Nov 24 08:32:30 2021 +0100

    [reset-password] Add reset password component, disable some buttons when relevant

[33mcommit 849c40c219dc77202974ab10a53ff5e3c916b100[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Nov 23 21:44:35 2021 +0100

    [diam] Fix linter issues

[33mcommit b7f181ff03c26263ae7043f7cc9b8c179d5a6b19[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Nov 23 19:15:10 2021 +0100

    [strictness] Fix flaky test

[33mcommit 75a86fc30e065b8dc0221cd4e5c39d9adee1eb25[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Nov 23 19:14:23 2021 +0100

    [coverage] Improve script to work on a file-per-file basis

[33mcommit ca1bac94ef5c0cf82cb086dde0f848c58442725c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Nov 23 08:44:12 2021 +0100

    [strictness] Small PR comments

[33mcommit 1d7b202b8dfe7c8e3ed857fbb5e27b9edbcc08ee[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Nov 23 08:36:56 2021 +0100

    [diam] Get back coverage in pylos (why though?)

[33mcommit 25796d94aae2e113ad62fa47ccbde932ac7f91cc[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Nov 23 08:17:12 2021 +0100

    [diam] Highlight on hover

[33mcommit e378705c206a99eb19a8e4a10d118269ea34ff2d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Nov 22 21:41:31 2021 +0100

    [diam] Final adjustments to game style

[33mcommit 4bfe3f75ce02ac58f6dec3eccfa3153e21fa26a9[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Nov 22 21:09:34 2021 +0100

    [Brandhub] Refactored enough so that both Tablut and Brandhub use the more thing in common so far; wip

[33mcommit 344c2a7f3f4cf78e897f9609718c41eed3bf514d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Nov 22 18:35:18 2021 +0100

    [diam] Translations

[33mcommit cde8f9b01913adb15b71875a6a52e6b8437ed073[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Nov 22 18:04:26 2021 +0100

    [diam] Further improve component

[33mcommit 5f59787a0c77c1a2bcc1142f8f4eb358cd0ecb09[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Nov 22 17:38:26 2021 +0100

    [strictness] Fix linter

[33mcommit d460a86a185a0e1aaf392458f4d48f5738e05951[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Nov 22 17:35:19 2021 +0100

    [strictness] PR comments

[33mcommit 99d1a4dd553c9493be2103adf2c7f87f8c70bd82[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Nov 22 08:41:19 2021 +0100

    [diam] Improve highlight behavior

[33mcommit 7a9d186d5b4cf2d64efc237d4cbf2531d0674af4[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Nov 21 21:48:05 2021 +0100

    [diam] Improve piece colors

[33mcommit b547d016ba71e24f700ea7c5269fb0e49e25a8ae[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Nov 21 18:15:32 2021 +0100

    [Brandhub] Work in progress

[33mcommit 735efff07d4ded3ec66301c3a1c7e5e90d4a29c6[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Nov 20 21:24:05 2021 +0100

    [diam] tutorial

[33mcommit 357cf3b680969b5f69eb4682988ab9e5d2efbc0c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Nov 20 18:59:38 2021 +0100

    [diam] PR comments

[33mcommit 56826a3a87607398265bc9aa192107bb6ee9f495[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Nov 20 18:46:09 2021 +0100

    [strictness] Finalize coverage improvement

[33mcommit 1601da44df39b001b13705fddbfa78d09bdb3760[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Nov 20 14:57:05 2021 +0100

    [strictness] Improve coverage in tuto

[33mcommit f88b9a15d73140e68590e196b312e8fcb840a6fc[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Nov 20 09:14:38 2021 +0100

    [strictness] Update karma and index

[33mcommit de93aad44244c4c0386b99d115a8923ba76886d7[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Nov 20 09:13:13 2021 +0100

    [strictness] Improve coverage

[33mcommit d7f57206fb762bc094929a9fcc73e56fe5121638[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Nov 20 08:38:39 2021 +0100

    [strictness] Remove unnecessary interface elements of GameState

[33mcommit a848085113b09503e1bf96a7114c2cb8c6d83afe[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Nov 19 23:09:42 2021 +0100

    [strictness] Remove getNullable

[33mcommit 999972d0dfbc09f79940c01bd14909bafee7fc20[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Nov 19 23:00:54 2021 +0100

    [strictness] Get rid of getOrNull methods

[33mcommit 1e0028ad5ed7995d1910c6a670f1bc2acca17e2e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Nov 19 17:45:47 2021 +0100

    [strictness] less nulls and less empty strings

[33mcommit 0c50873e4a315914efa0417abce41ca6a1faef96[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Nov 19 16:48:54 2021 +0100

    [strictness] Get rid of dao's read and use tryToRead instead

[33mcommit 8e794751a03cff4d1755487a9e04f28c3fffea13[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Nov 19 16:40:37 2021 +0100

    [strictness] Improve part creation

[33mcommit 51ab0adc4ce36d8bf8a5f84012f0320d985c23cb[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Nov 19 16:29:49 2021 +0100

    Revert "[strictness] WIP on part creation, still need to fix a few tests"
    
    This reverts commit 5aabc9499d2be71a6efc9268b0b8126243cf8691.

[33mcommit afb0b62586fbf22dbf286e3d0cedff61bb8fe9ff[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Nov 19 16:29:22 2021 +0100

    [strictness] PR comments

[33mcommit 5aabc9499d2be71a6efc9268b0b8126243cf8691[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Nov 19 13:56:31 2021 +0100

    [strictness] WIP on part creation, still need to fix a few tests

[33mcommit 29ed15e8932291daaa16673506bcadafb54dc840[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Nov 19 13:36:25 2021 +0100

    [strictness] PR comments

[33mcommit dd6fe773bf658cde59495322b7fc798a0d9d2108[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Nov 19 10:34:04 2021 +0100

    [strictness] Remove unused imports

[33mcommit 946c05cb2140a48ef73a7692175be7d4f1ec5487[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Nov 19 09:40:11 2021 +0100

    [strictness] Use game nodes directly instead of MGPNode

[33mcommit 6d06ef831e4af4cc229e01c67acb0fdebd1dfb60[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Nov 19 09:21:22 2021 +0100

    [strictness] Fix broken tests

[33mcommit 9ea88b0d546968f0f353963c2bc3a065c8bfed60[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Nov 19 08:51:08 2021 +0100

    [strictness] Finish refactoring of legality status

[33mcommit ab27dcfd0f89275b7b7c15da1cf2979123cc3d2d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Nov 19 08:27:21 2021 +0100

    [strictness] LegalityStatus/MGPFallible refactor in all games

[33mcommit 6fe331a450c13ea6729ce351da0004efdc574654[m
Merge: c2e65b76f a65ceb298
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Nov 18 21:01:27 2021 +0100

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into diam

[33mcommit 45ae36ffa2a8c385a212bb1773305dc4d46f6c57[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Nov 18 20:58:04 2021 +0100

    Enhance coverage and refactor Quarto

[33mcommit cf3c0a58ec9f7d4ccafca5916b65683af93cf3f3[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Nov 18 20:41:27 2021 +0100

    [strictness] LegalityStatus becomes a MGPFallible (in progress)

[33mcommit c2e65b76f8c24930cc8353d4e10890547b507d92[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Nov 18 20:37:47 2021 +0100

    [diam] Finalize component, get full coverage

[33mcommit ddd62df8f30b079db3c796dbf900a03234feff6c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Nov 18 08:57:11 2021 +0100

    [strictness] Optionalize node childs

[33mcommit 906a9120ce5348bf4e7fa07f50602dc68227c050[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Nov 18 08:53:51 2021 +0100

    [strictness] PR comments

[33mcommit b5a3566d3610827776be25d3da60e46304665024[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Nov 18 07:47:39 2021 +0100

    [strictness] Even more optionals

[33mcommit 83ad49ee788ff49706648af906e5f714e5dab7c7[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Nov 17 16:24:13 2021 +0100

    enhanced Go Kamisado Tests

[33mcommit 8eb418c80964bae7ac941c60ad0efdc5c537eede[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Nov 16 22:28:58 2021 +0100

    [strictness] More optionals instead of nulls

[33mcommit 9d92b910f09b2bfa097c5a167f9e0df2cf66dd48[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Nov 16 18:24:30 2021 +0100

    [strictness] Render move optional instead of | null

[33mcommit 7ffa5debdfc1058a6b627289c52e6783c9ae29cb[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Nov 15 22:55:58 2021 +0100

    [strictness] PR comments

[33mcommit 214dc1d0fbc7400556fa5ae7005371ac77f4dfd5[m
Merge: 13d8c9f03 9ad3602c8
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Nov 15 22:49:41 2021 +0100

    Merge branch 'strictness' of github.com:MartinREMY42/multi-game-project into strictness

[33mcommit 13d8c9f032038c01d69f65c5ad3ce4cfd3ddd335[m
Merge: 67e6947ef a65ceb298
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Nov 15 18:14:29 2021 +0100

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into strictness

[33mcommit 9ad3602c806738a59f44a055600168a22af07966[m
Merge: 67e6947ef a65ceb298
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Nov 15 18:14:29 2021 +0100

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into strictness

[33mcommit 67e6947ef51269c4278c7402eacc526b0996b94d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Nov 11 17:03:48 2021 +0100

    [strictness] tuto refactor

[33mcommit 57d8f1cfc6633fa7d470c8b02860bf854e7bde46[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Nov 15 08:36:42 2021 +0100

    [diam] improve component

[33mcommit e3b2106c03da770fa75ebe252337e064920f011d[m
Merge: 2e69affc4 a65ceb298
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sun Nov 14 22:51:07 2021 +0100

    Merge pull request #105 from MartinREMY42/develop
    
    Master 26

[33mcommit a65ceb298c928e5449e4a1544e77a952ee2e59fe[m
Merge: bf8a91ac4 e8cd90a84
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Nov 14 22:13:32 2021 +0100

    Merge pull request #101 from MartinREMY42/Apagos
    
    Apagos

[33mcommit 232985525ff094c920e50f915c9911d12811d267[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Nov 14 21:10:17 2021 +0100

    generated coverage csvs

[33mcommit e8cd90a84521e182ee7d3de5798ba8dad9142fe2[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Nov 14 20:14:37 2021 +0100

    readded coverage csv

[33mcommit e618f2728ab346465a2824b6765b7f29cf6ef92a[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Nov 14 20:12:20 2021 +0100

    work in progress, refactored KamisadoRules test a lot, made 'state only' node creation more esthetic

[33mcommit e41e9a3b66e9f20a3195b6971f3a2b57a7129db8[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Nov 14 14:25:12 2021 +0100

    updated karma, index, and coverage csvs, cancelled coverage.py's modifications

[33mcommit 714a8f72c14003b9d052b4231fa655207a59095e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Nov 14 08:31:55 2021 +0100

    [diam] add minimax, improve component

[33mcommit 437972b4850a7fb6ef9a8ae66e64888f6434e855[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Nov 13 18:30:36 2021 +0100

    fix test of double clic

[33mcommit aa2c857601d50f225d660160a6833f3ac590cc09[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Nov 13 18:15:50 2021 +0100

    Cover last branch

[33mcommit 3d037c840f338cf187efc7badceff2a0ebf0d78d[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Nov 13 18:08:20 2021 +0100

    fixed two last Apagos UX comments

[33mcommit 7dc052e5fc2304905c24b699a5779f4bc212c53f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Nov 11 13:12:20 2021 +0100

    [strictness] PR comments

[33mcommit 645d789647657a2510b2b2eedc1f6f331c197d99[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Nov 10 18:38:21 2021 +0100

    Last PR Comment and rename SQUARE_SIZE to SPACE_SIZE

[33mcommit ec80362e60cb5283e63a6204da8e6e3ba85ed85c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Nov 10 17:39:53 2021 +0100

    [strictness] Use optional for node parent

[33mcommit ffdd475bc7616b2ddc96c51c64f0b34374d64cba[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Nov 10 15:06:46 2021 +0100

    [strictness] Use optional for AI

[33mcommit a33accf31006c73ededb6e27ad7ad04090c5a4ba[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Nov 10 15:01:35 2021 +0100

    [strictness] Fix broken test

[33mcommit 96cbb39589f1581e0ec71bb51f96eb93fc584571[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Nov 10 14:07:27 2021 +0100

    [strictness] refactor getNonNullable

[33mcommit e87377fe7c6f13ad1c6815c729c341e5fff2ced0[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Nov 10 13:10:18 2021 +0100

    [strictness] Refactor scores in components

[33mcommit 4143c590e31d67dd63d17426621db27129442b14[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Nov 7 12:50:26 2021 +0100

    [diam] WIP

[33mcommit 6bbc0fc46d89ac375c1258c42a84ebdd4f9871b3[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Nov 9 21:15:33 2021 +0100

    small PR comments forgotten

[33mcommit 3c0aaebdaa7617c8b6683fa0b411116bbaea9a3b[m
Merge: 920e2a74f bf8a91ac4
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Nov 9 20:45:49 2021 +0100

    pulled develop and fixed conflict

[33mcommit 9d026e20f4042df116efda830127fa235d8f79ef[m
Merge: 1c593cfa7 bf8a91ac4
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Nov 8 21:48:47 2021 +0100

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into strictness

[33mcommit 920e2a74f87c803f6ad285a62772d18d4e062ed4[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Nov 8 21:29:39 2021 +0100

    PR comments

[33mcommit bf8a91ac432a3fa03e5b122cb492da45fae60148[m
Merge: fce5d40a9 33c139578
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Mon Nov 8 19:21:12 2021 +0100

    Merge pull request #88 from MartinREMY42/test-auth
    
    Test auth

[33mcommit 33c1395786e61f6267afa57019acd5d48ade26fc[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Nov 8 17:52:39 2021 +0100

    [test-auth] PR comments

[33mcommit 0e7240b3369112c0d021298bce4c0ea5ca8b2da2[m
Merge: c40971c9f fce5d40a9
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Nov 8 08:19:45 2021 +0100

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into Apagos

[33mcommit c40971c9f8e04a406da36e00f5819f09c8bd7fce[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Nov 7 17:24:27 2021 +0100

    answer PR comment

[33mcommit 6d7929b8a79ba5116cd9b990c7d47caec04009fa[m
Merge: 5eb1bcf60 fce5d40a9
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Nov 7 12:05:51 2021 +0100

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into diam

[33mcommit 5eb1bcf60c71a4803583ff82191b267a3cd015c5[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Nov 6 13:41:30 2021 +0100

    [diam] Diam rules with their tests and full coverage

[33mcommit 74dcc6f4c8f3d2810e92a50fd796555afafb63fd[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Nov 7 01:05:01 2021 +0100

    add translations

[33mcommit 7a0483e3f059d0ca13ffb4953df477532336b79a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Nov 7 00:26:21 2021 +0100

    [test-auth] oopsies.

[33mcommit 1c593cfa7426c737d9d5c7f860d2af4978bfc3ed[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Nov 6 21:14:31 2021 +0100

    [strictness] Fix build for strictTemplates

[33mcommit 4c8bc1edf7b6212534cf652f6845639eb63dcdfa[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Nov 6 13:56:22 2021 +0100

    [strictness] Fix remaining test and final cleanup

[33mcommit f7ccf4809c628ebe680e54ccad0a74002541f16b[m
Merge: 5267ffba7 ba06ab542
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Nov 6 08:43:57 2021 +0100

    Merge branch 'test-auth' of github.com:MartinREMY42/multi-game-project into strictness

[33mcommit ba06ab54264bf030702d193010d4c27c8f90d800[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Nov 6 08:34:52 2021 +0100

    [test-auth] Update coverage numbers

[33mcommit 5267ffba7b5969e43d9ffed3cbe550484db6085d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Nov 6 08:32:04 2021 +0100

    [strictness] linter

[33mcommit 49c0c28a73f5c5382a775600060a59366e70a68b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Nov 6 08:14:27 2021 +0100

    [strictness] Recover necessary coverage

[33mcommit 8421e70013bd0f16ecda34b18dd65e73f7baf09f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Nov 6 07:45:55 2021 +0100

    [strictness] Improve coverage

[33mcommit c0e9778dab4c9336b5f750433256462392b3da4d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Nov 4 19:54:46 2021 +0100

    [strictness] Fix remaining tests, add coverage

[33mcommit 0ea01e6b45a89a403e52290a81a2db050f218607[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Nov 4 21:57:40 2021 +0100

    [test-auth] karma strangeness

[33mcommit 48b55585dde7468efe7ec4336a1bc11d3e911f7b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Nov 4 21:20:09 2021 +0100

    [test-auth] Increase coverage to pass necessary threshold

[33mcommit ac9d867c3b224d01c181fe698d4dc1fbbb5621cd[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Nov 4 20:49:40 2021 +0100

    [test-auth] Refactor comparableEquals API

[33mcommit 826f817bd2513133369372aee8e6f10e78d9da59[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Nov 4 20:37:43 2021 +0100

    covered everything, added i18n

[33mcommit 5ecd4defd3cd58859ce138f0b2b01445b4bb3a7c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Nov 4 20:20:30 2021 +0100

    [test-auth] PR comments

[33mcommit 4dc89f3aca74742428592dd9cd488c9b0d7b3a23[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Nov 4 08:21:27 2021 +0100

    [strictness] Finally get everything to compile

[33mcommit 208a1edf43f91e336be8375175adf68388981f76[m
Merge: 13abe77b1 4cbb27a30
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Nov 4 08:09:44 2021 +0100

    Merge branch 'test-auth' of github.com:MartinREMY42/multi-game-project into strictness

[33mcommit 13abe77b199b8c2940b22ac95d65adce971e40d2[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Nov 3 09:02:56 2021 +0100

    [strictness] More progress

[33mcommit 4cbb27a3022be01d300134f98af70649398e42d8[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Nov 4 07:10:31 2021 +0100

    [test-auth] PR comments

[33mcommit 23f267c83305ef34531e01bd84e5c3f3bcd89df5[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Nov 3 22:33:53 2021 +0100

    answer PR comment and add coverage

[33mcommit aa0c6b334f36dce7719c665faf493c3aef04416c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Nov 3 21:33:09 2021 +0100

    [test-auth] PR comments

[33mcommit c9728689b65d615c980cb167329713557999a64e[m
Merge: c394a0b2c 9317922e2
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Nov 3 08:12:20 2021 +0100

    Merge branch 'test-auth' of github.com:MartinREMY42/multi-game-project into strictness

[33mcommit c394a0b2c29d1013a1c972d1030389c5aa13c026[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Nov 3 07:53:25 2021 +0100

    [strictness] Most of the changes done

[33mcommit 1dcb3cb79d701a8e79b9b03dd03321ef364f40d1[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Nov 2 22:25:14 2021 +0100

    finished component in the 3rd way

[33mcommit 8d65d9f984c53099c8be8d53974ad6fecb8634cd[m
Merge: 1aa5ec4b4 fce5d40a9
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Nov 2 09:07:04 2021 +0100

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into strictness

[33mcommit 1aa5ec4b4748a75521c4c494838d85db4616e460[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Nov 2 09:05:59 2021 +0100

    [strictness] Start applying strictness to tests

[33mcommit a2a799e13c2fc5b74d4783b18f0875a516513d6a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Nov 1 22:07:26 2021 +0100

    [strictness] More strictness

[33mcommit 9317922e2cbbabee074637c54470cce668f6de37[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Nov 2 07:45:13 2021 +0100

    [test-auth] Update karma conf and index.html

[33mcommit 8bc6f4ed895671f4454e8ae30d934822b20a0c3b[m
Merge: 988524669 fce5d40a9
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Nov 2 07:40:51 2021 +0100

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into test-auth

[33mcommit 98852466905a1db12dc0678db27a64530d3172c4[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Nov 2 07:39:28 2021 +0100

    [test-auth] PR comment

[33mcommit 422af2d04f43141a452823ef4140b5b01b9753c0[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Nov 2 07:33:23 2021 +0100

    [test-auth] Use AccountGuard in other guards too

[33mcommit d481d9f0e3a2895b5074021f041e24428a7a8d7d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Oct 31 17:19:26 2021 +0100

    [test-auth] Improve DAO, improve guards

[33mcommit fce5d40a92df82a0c0b098c3284bb7f62bbc661b[m
Merge: f349b3b23 63cf58e95
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Nov 1 20:48:45 2021 +0100

    Merge pull request #100 from MartinREMY42/AddFunctionToProject
    
    Add Function to Repository

[33mcommit 63cf58e95f5f18fe426510f60cb154198b0ebc9a[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Nov 1 20:44:37 2021 +0100

    disable linter for documentation code

[33mcommit 45fba7ff42bd5659fb1875c7f2ce7c3271a2051a[m
Merge: eff8db301 f349b3b23
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Nov 1 20:31:27 2021 +0100

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into AddFunctionToProject

[33mcommit eff8db3013871fde2985a45f2cc0f77cb3fa3e36[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Nov 1 20:28:05 2021 +0100

    make it simple, we just need to be able to read that code

[33mcommit 48b47a23cc6145a9f1e3e459cfd31460cd611b96[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Nov 1 20:18:22 2021 +0100

    fixed ApagosMove.encoder

[33mcommit f349b3b2314971a23ab159e19c1e7dc1412649ba[m
Merge: 2e69affc4 56f9378d6
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Mon Nov 1 20:15:59 2021 +0100

    Merge pull request #102 from MartinREMY42/css
    
    Improve CSS

[33mcommit f22eb6210d0c58d639855b4457949d51c274cbbb[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Nov 1 07:24:03 2021 +0100

    [strictness] Almost finished

[33mcommit 56f9378d64d9a53d544ad4b481caf7a62ed5500a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Nov 1 07:28:48 2021 +0100

    [CSS] Restore previous colors

[33mcommit aad699feffd9d80535eccb341bfc353b45f6bd1c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Oct 31 21:56:38 2021 +0100

    [strictness] More strictNullChecks

[33mcommit ad29912a10e2c17f200359ad51a72d85eef55a34[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Oct 31 19:47:57 2021 +0100

    advanced a lot in the sorted look for Apagos, need to start again for an easier to understand mode

[33mcommit f752670ad9e376194a027410b015822290d59c0c[m
Merge: 36c3fe245 21ef41da4
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Oct 31 17:19:58 2021 +0100

    Merge branch 'strictness' of github.com:MartinREMY42/multi-game-project into strictness

[33mcommit 36c3fe245dbf6c85658cc12bcdb0ad583d6c0906[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Oct 30 09:32:43 2021 +0200

    [strictness] Apply strictNullChecks to some files

[33mcommit 21ef41da47e773864656266402360338a8796faa[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Oct 30 09:32:43 2021 +0200

    [strictness] Apply strictNullChecks to some files

[33mcommit 92ea51829c03e29e618d78a23b575c80c0fe2114[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Oct 31 01:00:58 2021 +0200

    renamed CASE_SIZE for better english; advance on Apagos UX, the only hard part

[33mcommit 741ea86ca86ac8d17cea8365df348b6b6167539f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Oct 30 09:32:58 2021 +0200

    [css] Remove fit

[33mcommit 4e1ab9d9fa4bade20f5aec4c6a6f7a0e05c6bcb0[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Oct 29 09:01:04 2021 +0200

    [strictness] Enable strictNullChecks

[33mcommit da16d62503bfadfe8cbee833389c15f447e33804[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Oct 29 08:04:51 2021 +0200

    [strictness] Enable strictTemplate

[33mcommit 8a9ef71eaa050e9a2bc030c9b368a660bf461497[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Oct 28 08:59:36 2021 +0200

    [test-auth] Fix flaky test, remove linter issues

[33mcommit e280c54bfc7a6036ffc00f6ccd622f583e48cb72[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Oct 28 08:54:21 2021 +0200

    [test-auth] Fix final tests (hopefully)

[33mcommit bed3f6c5366770f1edec94c67cc54fd71f579e62[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Oct 28 08:18:27 2021 +0200

    [test-auth] Final test to get full coverage

[33mcommit 3ac12c4fcb06892f35ff9a71d6b4934c791df3e7[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Oct 28 07:37:40 2021 +0200

    [test-auth] Update translations

[33mcommit e971dc2b68533ecf578f7a9e4ebff89706c87e14[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Oct 28 06:51:34 2021 +0200

    [test-auth] Skeleton of last missing test

[33mcommit 0fd02871761b213ec10d3da71f2d5bc76ae67e3c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Oct 27 08:56:32 2021 +0200

    [test-auth] Improve coverage of auth service

[33mcommit 3b264652dc2acc3006d736bba91e66ec735116df[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Oct 27 08:46:44 2021 +0200

    [test-auth] Rename registration to register

[33mcommit 648c88c9efe088a807aa0308651ede7223b6b2f6[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Oct 27 08:14:44 2021 +0200

    [test-auth] Bump coverage on verify-account

[33mcommit 06960516160c7861804ab3fd4b349f050dc90a62[m
Merge: 5863e5b74 2fee7fcac
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Oct 26 22:08:45 2021 +0200

    Merge branch 'test-auth' of github.com:MartinREMY42/multi-game-project into test-auth

[33mcommit 5863e5b740f14459d3506a228b74a75063381b17[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Oct 25 21:44:31 2021 +0200

    [test-auth] Get everything (except tests) working, increase coverage

[33mcommit fea988acdd5ed029dac8c305784ae824da35ba9f[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Oct 26 21:28:16 2021 +0200

    Work in progress, component test written, rules and rules test written

[33mcommit 2fee7fcac464ee0c11d637a32412c8c3bdad9635[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Oct 25 21:44:31 2021 +0200

    [test-auth] Get everything (except tests) working

[33mcommit 9bd9cc6333ea4ef5345367cc8a9e07ac4440aa36[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Oct 25 06:57:41 2021 +0200

    [test-auth] Add firebase rules eand emulator start script

[33mcommit 4220e50cf3302e8756469a21c15c2a122ded1351[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Oct 23 20:55:24 2021 +0200

    [test-auth] More PR comments

[33mcommit 1a2a8416276162c426e604c2fa822a845c7e97df[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Oct 23 20:53:57 2021 +0200

    [test-auth] PR comments

[33mcommit a30e3dfa2dce1cbb06026639ed35235f1519b0b1[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Oct 23 17:48:23 2021 +0200

    [test-auth] Remove some more lint warnings in Kamisado

[33mcommit 35843ab3493f4d58a3ac94e916a6dc2578f416d8[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Oct 23 15:57:07 2021 +0200

    [test-auth] remove some lint warnings

[33mcommit 7f175f11d29808e4dd73ff28897d50274f79eeae[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Oct 23 15:43:49 2021 +0200

    [test-auth] Find missing translations

[33mcommit 3ca0a7f47314c426a13ec6faf674680c79db278f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Oct 22 19:14:26 2021 +0200

    [css] Use SCSS

[33mcommit a8b21c52c6463c845806c2dac69b1c9696c5996b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Oct 22 19:54:48 2021 +0200

    [test-auth] PR comments

[33mcommit d21ad469f872bf316a5079658a07bad40f934a78[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Oct 22 08:48:43 2021 +0200

    [test-auth] PR comments

[33mcommit 8362e549913fb1a9e9121d8f7d712c6e1b59ef54[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Oct 22 08:45:17 2021 +0200

    [test-auth] Support failure of email verification

[33mcommit 7aae78903a18d7c90639556df31061d2c858a54a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Oct 21 19:46:11 2021 +0200

    [coverage-script] Add support for added and removed directories

[33mcommit 0a7f555721e0e609b1d50e31c6e466d19e280104[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Oct 21 09:02:03 2021 +0200

    [test-auth] Fix linter issues

[33mcommit 5a53d2a8365b8d410307dcc0dd44a8db3e02b8a5[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Oct 21 08:56:51 2021 +0200

    [test-auth] Test redirection on login component

[33mcommit 1118b68e3664141946525299fa1a497049f09a1e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Oct 21 08:48:29 2021 +0200

    Fix comparable tests

[33mcommit 772e2715abca73f044dae3713e3b339046fe3197[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Oct 20 22:11:07 2021 +0200

    moved folder so far, README to be done

[33mcommit 76cc01e5cfaccc09cd5f32722968434cf2db67d7[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Oct 20 22:03:28 2021 +0200

    expectAsync should be awaited

[33mcommit 4ffa01bcd572ce1ef2588511b5b1efc6d11c493a[m
Merge: 2ce5a20e6 2e69affc4
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Oct 20 22:00:35 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into test-auth

[33mcommit 2ce5a20e65e28c93ef1d1f4cfbab8d64b0f0d90a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Oct 20 21:57:38 2021 +0200

    [test-auth] Fix remaining test

[33mcommit 06e235b2bb3c4b444da50210d5583c40eec6d6cf[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Oct 20 21:36:23 2021 +0200

    [test-auth] Update translations

[33mcommit d825719dd59b59b58918f9c3e486c58327b977b5[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Oct 20 08:45:28 2021 +0200

    [test-auth] Remove debugging code

[33mcommit 2e69affc4515cf589ccce10e6b9f1c9ea21c9a1c[m
Merge: 238dd8900 4f82e8512
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Wed Oct 20 08:27:48 2021 +0200

    Merge pull request #99 from MartinREMY42/coverage-script
    
    Coverage script

[33mcommit 4f82e8512c99edd87a2c35b57e74601bb89aaa4b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Oct 20 08:13:38 2021 +0200

    [coverage-script] Update README

[33mcommit 31f3496c1dfd730d0e4c45c39b5f1f1eb0368edc[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Oct 20 07:54:20 2021 +0200

    [coverage-script] Update branch and statement CSV

[33mcommit d155339df29086a186a30da5c56c8cff01f7eff3[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Oct 20 07:52:06 2021 +0200

    [coverage-script] Fix columns extractions for branch/statement

[33mcommit fd0ea70b73a765c26681b48e337dd6021e64f64c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Oct 20 07:39:39 2021 +0200

    [coverage-script] Update text

[33mcommit 755e71ded672f2c72c83747d836a1de891400114[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Oct 18 21:03:46 2021 +0200

    [test-auth] Fix remaining tests, improve coverage

[33mcommit 89936b5d8d86829bdf0f1825bf910c570293c211[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Oct 19 07:49:27 2021 +0200

    [coverage] Fix lines coverage file

[33mcommit 0f03ff82d2dc1e1195a11a5d1b5cfda8f9a258aa[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Oct 19 07:42:50 2021 +0200

    [coverage] Update statements coverage, fix script for lines

[33mcommit 51cdae51192f85c039d14ad33a828b43cb902a0b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Oct 19 06:53:46 2021 +0200

    [karma] Lower coverage for CI

[33mcommit da8b57715614275aaf7b6b2a57a428d32357ef17[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Oct 18 21:50:22 2021 +0200

    [coverage-script] Don't alias pandas

[33mcommit a00fb36b635a9b8cfcd6d1fd93ff79ea8b9c4af4[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Oct 18 21:49:31 2021 +0200

    [coverage-script] Include line coverage in script

[33mcommit 70b9508666fabb88e0509d7e5bf7cc9842b55a29[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Oct 18 17:53:48 2021 +0200

    [coverage-script] Update coverage with latest numbers

[33mcommit 8228b088d0e48d54c84aad2d4d394643ce8a8988[m
Merge: 983abf5bb df6b51e55
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Oct 18 17:26:15 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into coverage-script

[33mcommit 983abf5bb26c8d9ab6667b5c40461ae05d2d91e8[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Oct 18 17:24:57 2021 +0200

    [karma] Bump coverage requirement

[33mcommit 21170a508940254c3c0f774e1447becaec281bfb[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Oct 18 08:50:32 2021 +0200

    [coverage-script] Update script and results from latest run

[33mcommit 8329543302c76dce119585f6faa1703565759433[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Oct 18 08:47:31 2021 +0200

    [coverage-script] Use es2020 build target for better istanbul coverage

[33mcommit a9e5d18a1e877a37f5d934e2e4243901520df9dc[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Oct 18 08:12:28 2021 +0200

    [coverage-script] Integrate script in CI pipeline

[33mcommit b7d102323ebc716cec95b73803118ed6d7b6313b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Oct 18 08:11:02 2021 +0200

    [coverage-script] Improve max-coverage script to become coverage.py

[33mcommit 081e02c58edee22a90211de283bd4ca25de6613e[m
Merge: f6aa9cf1d df6b51e55
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Oct 17 22:02:33 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into test-auth

[33mcommit f6aa9cf1d028742c0bcccfc503a95e30f076ef16[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Oct 17 22:00:59 2021 +0200

    [auth] Introduce exists method on DAO

[33mcommit 238dd8900336539fba658ab4b40714eac4a62e38[m
Merge: 1dad90876 df6b51e55
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sun Oct 17 16:12:33 2021 +0200

    Merge pull request #98 from MartinREMY42/develop
    
    Master 25

[33mcommit 6b21aff07ae937bf95ce68489dae0bcac657b3f4[m
Merge: f141ea737 d592f5aba
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Oct 15 21:16:51 2021 +0200

    [auth] Improve login and registration after manual testing

[33mcommit df6b51e55eb43d98337b7a26221ad80e05c75d2c[m
Merge: d592f5aba 188b72d85
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Oct 15 21:18:22 2021 +0200

    Merge pull request #96 from MartinREMY42/ChangeBoardGameHighlightWhenOffline
    
    Change board game highlight when end game

[33mcommit 188b72d855a2cfd1a274deae042c0190b9f646f8[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Oct 15 21:25:23 2021 +0200

    fix coverage weirdness

[33mcommit 9c16112535f66785dc8dd3f9cbadf2aa89f54084[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Oct 14 20:14:13 2021 +0200

    pull develop and fix conflict

[33mcommit f141ea7375254cdd8ee04a385450d27f99b11da8[m
Merge: f5344112e 78b86dc53
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Oct 14 08:39:39 2021 +0200

    Merge branch 'test-auth' of github.com:MartinREMY42/multi-game-project into test-auth

[33mcommit f5344112e4e5ea470cb11bdcd883a34c06f79fd6[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Oct 14 08:03:48 2021 +0200

    [auth] Test new directives

[33mcommit af766a7d5166d4d02be0218f83fb983d2a600e7e[m
Merge: 719bb309d d592f5aba
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Oct 14 08:12:00 2021 +0200

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into ChangeBoardGameHighlightWhenOffline

[33mcommit 78b86dc53bc9110866f294b674c4f9bf82b75be8[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Oct 14 08:03:48 2021 +0200

    [auth] Test new directives

[33mcommit d592f5abad2e5fd91d922aa723440b06a9a30f78[m
Merge: d77bd2d8c 931cbfeec
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Oct 14 07:51:05 2021 +0200

    Merge pull request #95 from MartinREMY42/FixEndgameBug
    
    Fix endgame bug

[33mcommit 719bb309db29184dbee7fcdfad74ef3c4e4d4cf3[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Oct 13 21:30:15 2021 +0200

    change board div highlight when game finished and rounded it

[33mcommit 931cbfeec96db543887307bb3765a2204c2538f0[m
Merge: fba51d2f4 d77bd2d8c
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Oct 13 20:01:20 2021 +0200

    pulled develop and fixed conflict

[33mcommit fba51d2f45af9ef5f89c38fc4f54ab55a17f1eee[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Oct 13 19:35:32 2021 +0200

    covered some branches, removed dead code

[33mcommit e21543323bee6dcb8091d59dcff4a421f9f2e3d9[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Oct 13 08:19:35 2021 +0200

    [auth] Color password hint if it succeeds/fails

[33mcommit 378a8a0150a3a29ffa3ebd1efa40768d4d1a5ea2[m
Merge: 940f5c8ac d77bd2d8c
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Oct 13 08:03:38 2021 +0200

    Merge + add toggleVisibility directive

[33mcommit 940f5c8accf600eeddc50dc369ca3eee3f83dbac[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Oct 13 07:35:41 2021 +0200

    [auth] work on the design of the forms

[33mcommit aa7f2768c04604292d139f09053888edb41e2b9b[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Oct 12 19:27:09 2021 +0200

    covered minimax testing rules, server page, and fixed resign message

[33mcommit d77bd2d8cd4a82f8593dc07c9bb3fbf0f13604c9[m
Merge: 8b7c8c2d4 997192111
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Tue Oct 12 07:07:43 2021 +0200

    Merge pull request #84 from MartinREMY42/remove-angular-material
    
    Remove angular material

[33mcommit 9971921110d2a38139485ab478426027da391f8f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Oct 11 22:15:59 2021 +0200

    Check all tick(3000)

[33mcommit e0cf40f11d1b2984db40b02b52d6dc0926cd57ca[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Oct 11 21:53:15 2021 +0200

    work in progress; monkey tests must be made to check if modifications are acceptable

[33mcommit 382a4274d1f8f7df90d105d373900b6cb7bc2b9a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Oct 11 19:14:11 2021 +0200

    [auth] Fix tests that broke due to merge

[33mcommit c9dd902f76dbc98650294fff746dd314118e6d87[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Oct 11 17:49:42 2021 +0200

    Fix linter issues

[33mcommit 663ea27361bd48c4aaf2b44b12b2610eab97df52[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Oct 11 17:38:04 2021 +0200

    [remove-angular-material] Fix remaining tests

[33mcommit 71fe879cc52d160f5146ad5bac7018f2236d5f63[m
Merge: 79e805750 8b7c8c2d4
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Oct 11 09:50:57 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into test-auth

[33mcommit 527a35a4054d20dce6edce1bd0ab1dc03fad9d4c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Oct 11 08:30:58 2021 +0200

    Provide more details on how a broken test can be resolved

[33mcommit 457164bf54d1139700ed3c6b3558d87e83e8ad8d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Oct 11 08:12:22 2021 +0200

    Fix tests that are breaking due to a tick too low

[33mcommit ad795875d8fe4fb87acec27e06dce6e45da3609f[m
Merge: 2453ab9a0 8b7c8c2d4
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Oct 11 08:02:12 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into remove-angular-material

[33mcommit 8b7c8c2d4d582b261728943d9c8024e5f659da77[m
Merge: e28bf0175 e2a704033
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Oct 11 07:43:26 2021 +0200

    Merge pull request #94 from MartinREMY42/LegalityStatus_Failure
    
    Legality status failure

[33mcommit e2a7040339f9e75045d9cf9fb08d90a058674d1b[m
Merge: f7160591a e28bf0175
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Oct 11 07:41:26 2021 +0200

    pulled develop and fixed conflict

[33mcommit e28bf0175de62b3985220306b51a031b089b07ac[m
Merge: c731bbe60 2916fe71a
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Oct 11 07:26:20 2021 +0200

    Merge pull request #93 from MartinREMY42/FixCurrentPlayerAfterTakeBack
    
    Fix current player after take back

[33mcommit 2916fe71a39ff0ccf00699da3435098b8af73670[m
Merge: 068c4bdbe c731bbe60
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Oct 10 23:45:14 2021 +0200

    pull develop and fix conflict

[33mcommit 068c4bdbea1c2bc5bb6fcb7a8bc58814d0cac171[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Oct 10 23:39:43 2021 +0200

    answer PR and refactor GoPiece

[33mcommit f7160591aa1cdc297a752260da5d813ea8016322[m
Merge: c94ebed57 c731bbe60
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Oct 10 22:58:55 2021 +0200

    pulled develop and fix conflict

[33mcommit c94ebed57dcb9f4ef44d1c74ccab26c09a013214[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Oct 10 22:52:25 2021 +0200

    answer PR comment

[33mcommit 79e80575094714daedd381b990ba5a5a2e27b836[m
Merge: 8daab6020 c731bbe60
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Oct 10 22:40:13 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into test-auth

[33mcommit c731bbe60a6d9ae8681ed7994aac86d1b5542df6[m
Merge: d4aadee28 2740c9b63
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Oct 10 22:18:35 2021 +0200

    Merge pull request #91 from MartinREMY42/PentagoComponent_fix_piece_click
    
    PentagoComponent: fix piece click

[33mcommit 69051b9b06e31480faa3a628e10306fda85431e0[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Oct 10 20:03:01 2021 +0200

    fix statement treshold which was too much bumped and blocked git action

[33mcommit 179c0e2ba17209e346d1693e9061ae5e0d76784e[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Oct 10 18:45:15 2021 +0200

    Create legalityStatus.failure; enhance to max Reversi's coverage

[33mcommit 2740c9b63be1056af4f2adfaa0428b76c7709bcd[m
Merge: bdefc80a0 d4aadee28
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Oct 10 14:46:50 2021 +0200

    pulled develop and bumped numbers

[33mcommit bdefc80a007601a6d833b375d8f1371f3adf08ce[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Oct 10 14:36:53 2021 +0200

    fix comment convention and fix renaming en pentago.component.html in component decorator

[33mcommit e7fb94f46a2ea030c2be03593142e2f55cf018ea[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Oct 10 14:26:34 2021 +0200

    covered some go branche

[33mcommit 9eb6906bb4cc161b6ec882d0fc8b6840830a2892[m
Merge: c474454f9 d4aadee28
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Oct 10 13:36:38 2021 +0200

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into FixCurrentPlayerAfterTakeBack

[33mcommit c474454f916548ff06f51f3f518e4eb2fd7555bc[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Oct 10 13:36:04 2021 +0200

    fix take back current player indicator

[33mcommit 8daab6020300d8cccc4e08a393bfdeeb5187a64e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Oct 10 09:29:04 2021 +0200

    [auth] Improve account finalization procedure and tests

[33mcommit d4aadee2860b7bc48a9b63b3afc167f17aa3ea61[m
Merge: 800f102ba fc9cd8656
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Oct 10 08:57:43 2021 +0200

    Merge pull request #92 from MartinREMY42/FixChronoTimer
    
    Fix Chrono Timer

[33mcommit fc9cd865604cef5e909dcf95c480599ee348ad94[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Oct 9 20:29:32 2021 +0200

    Remaining time fixed and QuartoPiece fully covered

[33mcommit aa9de02210658a1e7116a7f11cf9ee42a66ac599[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Oct 9 19:03:24 2021 +0200

    fix pentago click and cover pentagoMinimax

[33mcommit c2063ed6e09219de50de49d0db365766c8ac5396[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Oct 9 17:50:56 2021 +0200

    [auth] Add verification account page

[33mcommit 800f102ba7ad2706a5835ba50dae2db95d1c9d68[m
Merge: 3bfdc3326 170d4cf93
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Oct 9 16:47:34 2021 +0200

    Merge pull request #90 from MartinREMY42/FixKamisado
    
    Fix kamisado

[33mcommit 170d4cf930717ce57fae8d3e0e4ddea550538f0b[m
Merge: eef209185 3bfdc3326
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Oct 9 15:34:08 2021 +0200

    pulled develop and fixed conflict

[33mcommit eef2091859e22471ed0e41e37c4efaaec4283614[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Oct 9 15:32:45 2021 +0200

    fix kamisado board and covered some Tablut branch

[33mcommit da5a0e5a0fb5abcc10b7c1060a86225de4ff5516[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Oct 8 23:22:42 2021 +0200

    [auth] Update VerifiedAccount tests

[33mcommit 30f1803c19c3de21080c0f5455faedf001e8d561[m
Merge: 97f2d9726 3bfdc3326
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Oct 8 23:05:44 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into test-auth

[33mcommit 3bfdc332601515c3ea161f644c902221e849f581[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Oct 8 20:00:13 2021 +0200

    [karma] Lower line coverage threshold

[33mcommit 75d8bc997f097a51b614be790b26654d2ee5894c[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Oct 8 19:50:09 2021 +0200

    fix import; updated index.html

[33mcommit b117a2e6adc1fddff30ef76be3fd29c4f690ed34[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Oct 8 19:30:08 2021 +0200

    [actions] Improve oslint config in CI

[33mcommit 820ff3c0f0a018e8a39edbd68fd03fabfd433b5c[m
Merge: a6c7cc22a a54151acd
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Oct 8 19:20:39 2021 +0200

    Merge pull request #86 from MartinREMY42/RefactorGamePartSlice
    
    Refactor game part slice

[33mcommit a54151acd6a54ba641de4466319d4cb086608a6c[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Oct 8 19:28:01 2021 +0200

    fix the conflict too quickly pushed

[33mcommit aba4151c876e4dce4564dc6ddbf2cb114b60335e[m
Merge: 1c6578eea a6c7cc22a
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Oct 8 19:25:17 2021 +0200

    pulled develop and fix 'conflict'

[33mcommit 1c6578eea5f01573d05a3f6bcaaf2a487ec83ad1[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Oct 8 19:22:10 2021 +0200

    uncomment code in test; reactive linter in ci-cd

[33mcommit a6c7cc22a3e893abe5c29bfeae34a46d7fa5c745[m
Merge: fc2d8e83f c8344686b
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Oct 8 18:55:42 2021 +0200

    Merge pull request #89 from MartinREMY42/ReversiComponent_moved_disappears_when_cancelMove_has_been_called
    
    Reversi component moved disappears when cancel move has been called

[33mcommit c8344686b1659e622058da0d7dee471c89497905[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Oct 8 18:57:53 2021 +0200

    last clicked coord no longer disappears on invalid click

[33mcommit 97f2d9726dc93b0f4ef13e43c618717af7f412e0[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Oct 8 17:33:02 2021 +0200

    [auth] Fix remaining tests

[33mcommit c461364e17969ec70a934828edb340ada10c375b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Oct 8 08:44:50 2021 +0200

    [auth] Work on email verification

[33mcommit 9ac0381fcce8a7ca516d6d78d119fe1587b521c5[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Oct 7 22:22:28 2021 +0200

    answer lasts PR comments

[33mcommit c3f4cd1be53ca8fa0a0bc0be6eac868c6b134afb[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Oct 7 19:44:43 2021 +0200

    Replace some surviving ennemy by opponents

[33mcommit 85242c84d9ea7275058a739e266c7991f7a2f27d[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Oct 7 19:38:52 2021 +0200

    replace all occurence of en(n)emy to opponent

[33mcommit 74895cf3fff2e4617cb6db1b1b934d6c0ca2e058[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Oct 7 19:00:39 2021 +0200

    resolve broken test

[33mcommit 79c13b076697f495c58665b05d823e54edcf14f1[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Oct 7 08:46:51 2021 +0200

    Simplify comparable check

[33mcommit 5c7756972f2ccd619b346053a6e579978fbc88cc[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Oct 7 08:18:17 2021 +0200

    [dependencies] Update eslint-plugin-promise to latest version

[33mcommit 2f4af1f9958bb7b67828e9d5677b40f8d282d5b9[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Oct 7 08:17:34 2021 +0200

    Implement runtime check to see if a value is a Comparable

[33mcommit e5d793fa791c07d86e2dbba31787f4bde15dff2e[m
Merge: 6776f77b7 fc2d8e83f
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Oct 7 06:57:06 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into test-auth

[33mcommit 6776f77b74e9b8fd459da9c867260572a004c485[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Oct 6 16:24:42 2021 +0200

    [auth] Improve login component coverage
    
    work break commit

[33mcommit fc2d8e83fbb0088f4357173d36e7e4488ec97d97[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Oct 6 08:45:31 2021 +0200

    Update angular.json to reflect latest i18n changes

[33mcommit b9e064525375d79c881ef4229a802e0e14fb3e0b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Oct 6 08:03:51 2021 +0200

    [auth] Fix more tests

[33mcommit ca3262902938f81278339f4235d08f7f2a492464[m
Merge: ba5081dfa e51292a9c
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Oct 5 20:13:47 2021 +0200

    merged develop and fix conflicts

[33mcommit 7dda96b9ad1919820ddb0149086e744751fa2d03[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Oct 5 14:24:08 2021 +0200

    [auth] Improve registration component tests

[33mcommit f7e87cc36b9d987cb9ee238adb0483ff5f6c593a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Oct 5 13:45:59 2021 +0200

    [auth] Rename inscription to registration, and fix its tests

[33mcommit 9d9a157b5737590ad9180b5efb827bc08730822e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Oct 5 13:06:31 2021 +0200

    Simplify dependencies of game wrapper

[33mcommit 3655423b2134e1e6cf179701cfee704fb9aea671[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Oct 5 12:56:49 2021 +0200

    [test-auth] Fix more tests, remove unneeded userService in GameWrapper

[33mcommit bde7a46e6cfdde9a8fdd6a56ed84a1071e22b1a1[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Oct 4 19:18:50 2021 +0200

    [auth] Fix some failing tests and start cleaning up

[33mcommit ba5081dfafb4bbfd66d5b5b6ce6d29900f153f46[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Oct 4 22:33:15 2021 +0200

    Enhance naming, absorb HexaBoard child into HexagonalGameState childs

[33mcommit e51292a9c601946c55a4274ab8d8d85cf2cad1da[m
Merge: 8969f4c43 a382607da
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Mon Oct 4 19:58:01 2021 +0200

    Merge pull request #85 from MartinREMY42/runtime-i18n
    
    Runtime i18n

[33mcommit a382607daa083bbb54117f0c3f1db0a6456f6359[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Oct 4 19:55:21 2021 +0200

    [i18n] Final PR comments

[33mcommit 30478127948dfbe97eac44fcf07542d35b1ef268[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Oct 4 19:39:06 2021 +0200

    [i18n] PR comment

[33mcommit 377edb70cc07233384bde38f2902a7e402751f7a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Oct 4 19:36:10 2021 +0200

    [i18n] PR comments

[33mcommit 21097334e21837101c1c800bb146dcf16ba8ef35[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Oct 4 15:55:30 2021 +0200

    [auth] Improve test coverage

[33mcommit 0c3759f3d3c6fb2d068301cf1f11372f7812824c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Sep 30 18:13:31 2021 +0200

    [auth] Add tests for email login

[33mcommit d86e2d7459de8631661acf677678bb282d71a66b[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Sep 30 22:12:24 2021 +0200

    Refactored for lisibility

[33mcommit 54cc61432ee6edd412f27af00109e0192d8c4151[m
Merge: 80c716582 8969f4c43
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Sep 30 21:03:19 2021 +0200

    pulled develop and refactored GameComponent and fixed tests

[33mcommit 204b4cd242870ffa238201f5a40a9bae446dfbce[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Sep 30 18:19:14 2021 +0200

    [i18n] PR comments

[33mcommit 80c716582d337ae07d596ecac248df167f048c4a[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Sep 29 19:21:44 2021 +0200

    Test work, GameState refactored, cleaning yet to do and TODO to remove

[33mcommit 78acecbbfc8c6e38e434249cc4a7c80c47bae788[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Sep 29 07:42:19 2021 +0200

    [i18n] Remove unused translations, PR comments

[33mcommit 3e0c8d18e4a97f319dfd5f1ffddbd3aa8695ba55[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Sep 28 22:02:03 2021 +0200

    Extra coverage for NOT_YOUR_TURN message

[33mcommit cc43e35244a9f8ede5a49ff4104c9dd6cb18af03[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Sep 28 07:08:19 2021 +0200

    Improve CoerceoMove coverage

[33mcommit 728b58aaac8560ff12589bb741c9417b518ef112[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Sep 28 06:58:53 2021 +0200

    [i18n] Remove unused messages, recover lost coverage

[33mcommit df8a6bdf948d74ebf6459629adc1310deb501e85[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Sep 27 18:45:30 2021 +0200

    [i18n] Fix tests, translate comments, add extra localize where missing

[33mcommit fe9c2c93b32afa4ee62005a856e37c595aff9d85[m
Merge: 752c8a000 8969f4c43
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Sep 27 08:34:44 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into runtime-i18n

[33mcommit 752c8a000675a4e75200724d36fd5f87e4dafb08[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Sep 27 08:30:29 2021 +0200

    [i18n] Render tutorials runtime-translated

[33mcommit cff39199ca3a4eaf2f8b0d16f6d0168a8db96e66[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Sep 26 22:06:19 2021 +0200

    [i18n] Functionalize toasted messages

[33mcommit 8969f4c4379c99bb6908707d01e6fc7a02e01acc[m
Merge: e45963f29 7d39b02fd
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sat Sep 25 22:44:11 2021 +0200

    Merge pull request #83 from MartinREMY42/dvonn-tuto
    
    [dvonn] Improve two last tuto steps

[33mcommit 363747a63c78cd5844fe9d48db776c4da05bf21d[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Sep 25 22:37:13 2021 +0200

    refactored GamePartSlice into GameState and created RectangularGameState

[33mcommit 2453ab9a08945a48afccd6ed0cbd5900979442ec[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Sep 25 08:57:32 2021 +0200

    Remove remaining mat-select, demonstrate problem with a test

[33mcommit 15a975307d9518d665529be2a4f58f98789520a2[m
Merge: 753099a8d e45963f29
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Sep 25 08:51:52 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into remove-angular-material

[33mcommit 7d39b02fd40af1ea8617ad8f8b47098b13201eaa[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Sep 25 08:10:14 2021 +0200

    [dvonn] Improve two last tuto steps

[33mcommit 1dad908764af4ce6c40e202b69e8fd175de7b8eb[m
Merge: 740751f57 e45963f29
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Sep 24 22:16:37 2021 +0200

    Merge pull request #82 from MartinREMY42/develop
    
    Master 23

[33mcommit e45963f29a6db89bb492df4f6200b7f114a3e85d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Sep 24 21:58:11 2021 +0200

    Fix header/locale test, last try

[33mcommit 100757e5887a1e0681dc7411237aedaf66fa22cf[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Sep 24 21:49:31 2021 +0200

    Fix header locale test

[33mcommit f69873ff09b7573596b00714d7428d33b2e097f7[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Sep 24 21:41:24 2021 +0200

    Try to fix locale test, once more...

[33mcommit 5ca407fe1addd68a8bbe04ba4fa507270cc57a3f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Sep 24 21:24:38 2021 +0200

    Fix getLocale call in main.ts

[33mcommit 72cf7e440920236c34b27dbe464d0f66bf94a364[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Sep 24 20:37:43 2021 +0200

    Fix firebaseConfig typo in develop

[33mcommit 2ce4553df2140f12f40373917d8be240f0d13a6b[m
Merge: 56b857d09 e6b9d9d01
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Fri Sep 24 20:21:53 2021 +0200

    Merge pull request #81 from MartinREMY42/fix-locale-utils
    
    Fix locale utils

[33mcommit e6b9d9d0174e94af8df0ba584fda981acb6bc707[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Sep 24 20:11:23 2021 +0200

    [actions] Remove unneeded action

[33mcommit d1931c3783a67ffcf03533606860faca109f2379[m
Merge: 59c866ad1 56b857d09
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Sep 24 20:08:14 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into fix-locale-utils

[33mcommit 59c866ad100f4b272fe5722890d5c762a55b84b6[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Sep 24 20:07:01 2021 +0200

    Fix locale utils test

[33mcommit 56b857d09d4d8b2580d4a63ec149bb53b60866ae[m
Merge: f8de7a941 58675077e
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Sep 24 20:01:00 2021 +0200

    Merge pull request #80 from MartinREMY42/ChronoDesignEnhancement
    
    Chrono design enhancement

[33mcommit 58675077e89e38cf98f04c7eee1c31757c04a23b[m
Merge: 76b7c406d 34c9c260d
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Sep 24 19:40:44 2021 +0200

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into ChronoDesignEnhancement

[33mcommit f8de7a941e3a8f9b492619233a789f79742c9271[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Sep 24 19:40:41 2021 +0200

    Fix locale utils test stability

[33mcommit 34c9c260dbb59e6d543498a081aaab899de981e1[m
Merge: 63b8417a9 ea93e49d9
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Sep 24 19:31:49 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit 63b8417a9309523e338374f41a420a75e8f6237a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Sep 24 19:30:46 2021 +0200

    [actions] Enable master deployment

[33mcommit 740751f57ea978a8c03076540695e3dc5fd34964[m
Merge: 0d37c7bfc ea93e49d9
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Sep 24 19:03:21 2021 +0200

    Merge pull request #72 from MartinREMY42/develop
    
    Master 22

[33mcommit ea93e49d97bd96c0e76adf115ed2b85c952add78[m
Merge: edfa4b4d0 f7882f83d
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Sep 24 18:36:01 2021 +0200

    Merge pull request #79 from MartinREMY42/PylosLifecycle
    
    Pylos tuto and lifecycle enhanced

[33mcommit f7882f83def30b6f6349d829b4de30d94654a9e1[m
Merge: 2f46c6c18 edfa4b4d0
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Sep 24 18:32:34 2021 +0200

    merged develop and fixed conflict

[33mcommit 2f46c6c18fa00885b81bb4a3c5f42c3c90341582[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Sep 24 18:21:48 2021 +0200

    PR answer

[33mcommit 753099a8d95741da392604e0899ccaf1c6b79bac[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Sep 24 08:25:48 2021 +0200

    Get rid of angular material

[33mcommit 76b7c406d3bde99c7b145c19043ad24163ad8b11[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Sep 24 18:11:20 2021 +0200

    wip

[33mcommit edfa4b4d0d821147c2e8f6088bfdc8c8817a6dd3[m
Merge: 36ceec3a9 183227c2b
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Fri Sep 24 17:59:56 2021 +0200

    Merge pull request #77 from MartinREMY42/highlight-player
    
    Highlight player with their colors in online game

[33mcommit e3b240c7e2536f6fa73cb74d56833db957123701[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Sep 24 07:48:01 2021 +0200

    [css] Use bulma-toast instead of MatSnackBar

[33mcommit 183227c2be37b6ee258c6e338d29128f19bfa9d2[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Sep 23 17:15:40 2021 +0200

    [highlight-select] PR comment

[33mcommit 625d2dd12788cc9e84bc269d36f3168c1a48d253[m
Merge: 85819e05b 36ceec3a9
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Sep 23 07:11:44 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into highlight-player

[33mcommit 85819e05bad2e47016c8f5c9c9fdd539eb5c1bd8[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Sep 23 07:10:56 2021 +0200

    [highlight-player] PR comment

[33mcommit 36ceec3a90cbc8292a74380cdb1ad5b97a97bd69[m
Merge: 57ec7b6e1 d1b6a7b4e
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Sep 23 06:52:39 2021 +0200

    Merge pull request #78 from MartinREMY42/GoViewIsBroken
    
    Go view is broken (and Config Penible ?)

[33mcommit f7c697e59d0e022dc05742edf07c9d8adeae5571[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Sep 22 20:29:39 2021 +0200

    Improve coverage

[33mcommit d1b6a7b4ed3e4f965ba5323e099b362f6cfdde30[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Sep 22 20:20:55 2021 +0200

    Answer PR by enhancing error

[33mcommit 0e5cf50944eb8bea46388e92f05c1f294482a2f8[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Sep 22 20:13:36 2021 +0200

    Pylos tuto and lifecycle enhanced

[33mcommit e25823cc93cd3672da66b1dade19f39b8b0129ce[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Sep 22 08:46:13 2021 +0200

    Update index.html

[33mcommit ba44fafe004294f857ad62152c0563953a580dcd[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Sep 22 08:41:29 2021 +0200

    [highlight-player] Test the visual aspect

[33mcommit 0107008c38b0e87c37a664dd6954bdbddb2711a8[m
Merge: f62d5c4f2 57ec7b6e1
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Sep 22 07:37:34 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into highlight-player

[33mcommit f62d5c4f2029c31fb7b41ad59ab7518140fe7d35[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Sep 22 07:01:32 2021 +0200

    [highlight-player] PR comment

[33mcommit 05e1e03915b73e9b2f8f69b86138bf0f1f34d3c0[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Sep 21 22:27:55 2021 +0200

    fixed translation

[33mcommit 095caac17986353dbd34472cddb113d96a3ae4bd[m
Merge: 0b168734d 57ec7b6e1
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Sep 21 22:16:24 2021 +0200

    merged develop and fix conflict

[33mcommit 0b168734d6e5a7dc04c41621cc77b038dd7cb536[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Sep 21 22:14:43 2021 +0200

    answer PR comments

[33mcommit 57ec7b6e12fd14cc915d12681fd2b58307d039fb[m
Merge: 97c412ede 5c4df2b58
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Sep 21 22:03:26 2021 +0200

    Merge pull request #66 from MartinREMY42/enhance_time_use
    
    Enhance Time Use

[33mcommit 2116d44386099e91bd815f6f4a6867f773e220fd[m
Merge: fe6c176cc 97c412ede
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Sep 21 21:55:47 2021 +0200

    merged develop and fixed conflicts

[33mcommit fe6c176cc680ebd149996bfad9969659be2d3012[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Sep 21 21:47:54 2021 +0200

    Covered some branch ?

[33mcommit 5c4df2b5898770778557b3451624e3dd7f46daa6[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Sep 21 21:41:58 2021 +0200

    answer pr, remove unused code, add tests

[33mcommit 87c673de002b5b69cbdc952f90975257b7336c23[m
Merge: 247c32ef8 97c412ede
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Sep 21 21:14:18 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into highlight-player

[33mcommit 97c412ede5836f80a64b12ff105feac1033eda2b[m
Merge: 1523675ab 867d57b5f
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Tue Sep 21 21:00:03 2021 +0200

    Merge pull request #75 from MartinREMY42/i18n
    
    I18n: Improve check-translation script

[33mcommit 1523675ab77de501bc3c61aa701c5f43c6486fa0[m
Merge: b9d6ccb71 7beb9c350
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Tue Sep 21 20:23:26 2021 +0200

    Merge pull request #76 from MartinREMY42/dvonn-tuto2
    
    Dvonn tuto2

[33mcommit 867d57b5f86e8cb27c2b4ede5f6db74c6a67b682[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Sep 21 17:21:08 2021 +0200

    [actions] Add selenium dependency for screenshots

[33mcommit 247c32ef81ad42a3a6bddc55ba41c3d06d1c1174[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Sep 21 17:10:22 2021 +0200

    Remove debugging code

[33mcommit 7fecc1041324f4a89bbf2706a0f98e229c33ba17[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Sep 21 17:08:06 2021 +0200

    Highlight players with their respective color in online-game-wrapper

[33mcommit d5a77d3864aecca03a965a39477013d6bfe163a4[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Sep 21 14:05:00 2021 +0200

    [actions] Try to get it working

[33mcommit f9b0785f0e7e26ac9221ea7960f5a73e085f1406[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Sep 21 14:01:57 2021 +0200

    [i18n] Fix GH action syntax

[33mcommit 915d07c32c680eff6b2c72809a44c690334c15b6[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Sep 21 11:18:57 2021 +0200

    [i18n] Update script
    
    (lunch commit)

[33mcommit 7beb9c350007931951aa5d73d403b84575300a3c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Sep 21 06:55:41 2021 +0200

    [dvonn] Improve tutorial

[33mcommit 333c1f49fdc0832f5452b51a860428f9ad8ee567[m
Merge: f21877e7c b9d6ccb71
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Sep 20 21:04:43 2021 +0200

    merged in develop and fix conflict

[33mcommit f21877e7ca8f097a49263870d9b98b581e830c0d[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Sep 20 20:26:52 2021 +0200

    constantify IPart in test

[33mcommit 19bf377a2e202f91e2b9a655ecd469fdc75fa843[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Sep 20 18:58:01 2021 +0200

    fix translation and answer to PR comment

[33mcommit b0a6501c418339215b5202551c8c6b58022eee55[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Sep 20 18:05:25 2021 +0200

    [i18n] Improve check-translation script, so that it does not rely on order

[33mcommit b9d6ccb71b513bfcab48ed4a0c147f08b69fb5ba[m
Merge: 13c12a236 392a321e9
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Mon Sep 20 08:23:14 2021 +0200

    Merge pull request #69 from MartinREMY42/chat
    
    Chat improvements

[33mcommit 392a321e9f443fa27fda4e9237053cbed69b688b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Sep 20 07:49:14 2021 +0200

    Update index.html

[33mcommit 13c12a236baa3425788e1cab6cfad68c1bc7b790[m
Merge: 1ff627614 57b2d5bb8
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Sep 20 07:46:40 2021 +0200

    Merge pull request #73 from MartinREMY42/GoAndQuartoTutorialEnhancement
    
    Go and quarto tutorial enhancement // Custom Config Penible

[33mcommit 84915d1f2fadd351dc519712d7b61309b2fe519c[m
Merge: bb6f7ccfd 1ff627614
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Sep 20 06:51:37 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into chat

[33mcommit bb6f7ccfd3ea31c938a8940bb34982fcb23fb107[m
Merge: 0bf1eff40 0d37c7bfc
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Sep 19 21:14:55 2021 +0200

    Merge branch 'master' of github.com:MartinREMY42/multi-game-project into chat

[33mcommit 0bf1eff4014e87dad47eb81fd59f5606cf2c4438[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Sep 19 21:11:34 2021 +0200

    [chat] Last PR comment

[33mcommit 1ff627614c1755cbdcc095e1015a1d6e8524965b[m
Merge: bb65bf0e0 e9dff6832
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sun Sep 19 11:46:37 2021 +0200

    Merge pull request #74 from MartinREMY42/i18n
    
    I18n: missing elements

[33mcommit 4efdaa95599475a5f3cadfde6166a4dcf4e8df65[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Sep 19 11:16:28 2021 +0200

    made ObjectDifference a class

[33mcommit c830ebb7449c3d7ce5c64c69cd17d4a6f10f2432[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Sep 18 23:47:52 2021 +0200

    removing firestore-debug.log again!

[33mcommit 1891b56c291b8501f3d77f5f85f321afeb6656c2[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Sep 18 23:32:55 2021 +0200

    small fix and update index.html

[33mcommit 69d6a64ca5e679932f8d6c49fa868edfbae5d516[m
Merge: f9f60a4d2 bb65bf0e0
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Sep 18 23:25:22 2021 +0200

    merged develop inside to make PR more easy

[33mcommit 358cd9c1f2b4b9ed4224a2659b2538af47aa7bea[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Sep 18 23:10:52 2021 +0200

    cover missing branch in Rules.ts; add nicer wrapper to pieceInHand and remainingPieces in Quarto

[33mcommit e9dff6832c6ff8e78fd0aa9f18a555a445e0d486[m
Merge: fcb2de0c8 bb65bf0e0
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Sep 18 12:53:11 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into i18n

[33mcommit fcb2de0c8c100a36342b05fd8c43bd7d7915912c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Sep 18 12:50:50 2021 +0200

    [i18n] Update translations

[33mcommit bb65bf0e0b900cf68b4fff602104312219fe752d[m
Merge: e4d64308f 7380b7a68
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sat Sep 18 08:46:05 2021 +0200

    Merge pull request #71 from MartinREMY42/dvonn-tuto
    
    Dvonn: explain that the player can take possession of a source

[33mcommit 7380b7a68cd6198e9229a7b1b1d771a3787eb471[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Sep 17 22:48:21 2021 +0200

    [dvonn] PR comment

[33mcommit 5ca9e9c9e48be9f3656c5ec5bc07d06f526f18fd[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Sep 17 22:14:17 2021 +0200

    [chat] PR comment

[33mcommit 6159ede8daa856cbbe8025ebaa311959d06f9f13[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Sep 17 18:23:30 2021 +0200

    [chat] PR comments

[33mcommit 5b88fd722204ee0d1c729e0eca457625efe65e58[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Sep 17 17:21:22 2021 +0200

    [i18n] Update README

[33mcommit b01d63f518569511158a315104c4b143bc8a8135[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Sep 17 17:18:23 2021 +0200

    [i18n] Missing elements

[33mcommit 57b2d5bb8a0eca4c6c177601f961690f907ab9ee[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Sep 17 16:18:36 2021 +0200

    ignoring .log now

[33mcommit 31a144040dc751a6875f9ec4566187e5fde6d41e[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Sep 17 16:17:47 2021 +0200

    deleting log file

[33mcommit 25c2f02145c23fbde265030d291c898a9656456d[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Sep 17 16:15:01 2021 +0200

    trying to remove all .log from the repo

[33mcommit 3f5d3d56e1b4f76a3e6f7eca8da1898126b604fd[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Sep 17 13:21:46 2021 +0200

    [i18n] Multiple commits:
    
      - update images
      - update "update images" script to generate them before build/deploy
      - fix checking translations in CI/CD
      - add max-uncovered python script to guide coverage
      - preserve router url when switching language in header
      - improve side piece placements in pylos
      - add more MoveCoordToCoord tests

[33mcommit f5c32f34af77a88b492b97ee7a0cf6319f34360c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Sep 17 08:33:10 2021 +0200

    Fix some failing tests, two remaining

[33mcommit f9f60a4d2be7fb9364ecc0f369875bbaa9d3ee10[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Sep 16 21:20:27 2021 +0200

    pull develop inside and answer some PR comment

[33mcommit 874f4e2a046ff5cb8a7d281dd493e0055eecc24a[m
Merge: 808d33e90 e4d64308f
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Sep 16 20:43:03 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into chat

[33mcommit 808d33e9050696439313d9a8a5b67c9fcf3b7fdd[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Sep 16 20:39:46 2021 +0200

    [chat] PR comments

[33mcommit df0129bb7e5e59d93c7c75b245b2cca89bd40043[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Sep 16 20:26:31 2021 +0200

    Fix broken tests due to \' removal

[33mcommit e6b5ad1fff1480e255f4e3c4d8c06cff9745665e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Sep 16 20:17:58 2021 +0200

    [chat] PR comments + remove \'

[33mcommit e4d64308fd2e6a4eb27bed5de2689d10726f857d[m
Merge: 2d5fe5819 575f228c0
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Sep 16 20:12:54 2021 +0200

    Merge pull request #70 from MartinREMY42/GoAndQuartoTutorialEnhancement
    
    Go and quarto tutorial enhancement + Kamisado Fix + Custom Config Penible

[33mcommit 575f228c035e4e8a84cbc0cce6c1ce91daed6b0c[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Sep 16 20:06:27 2021 +0200

    make treshold pass

[33mcommit 145ccda01e7028db8785be937a69de1ded0b2da0[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Sep 16 19:43:51 2021 +0200

    fix test broken by passing to angular 11 ? ; answer PR comment

[33mcommit 67ab6789dcf440cb1a06ac6fe0eac1a57759e0df[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Sep 16 18:48:46 2021 +0200

    [dvonn] Add two extra tutorial steps

[33mcommit f43da29d670e889b0d423f78e6538fdb7cd7b2b3[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Sep 16 18:48:22 2021 +0200

    Use null for previous move in TutorialStep

[33mcommit 84a584324a81545417a1db50213c1f8fe7dfc087[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Sep 16 08:07:41 2021 +0200

    [chat] PR comments, get rid of more angular material

[33mcommit 2d5fe5819cfb0fb1a327c34c4a3c0c8b065585a8[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Sep 16 07:59:11 2021 +0200

    Fix CI/CD

[33mcommit 96a603a1cfa240685bddbdf05289a6aa0e1d0fca[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Sep 16 07:10:27 2021 +0200

    [chat] PR comments

[33mcommit f47c2c42fd82d4b52db6d2c5d86fdd06360c56b0[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Sep 15 20:50:50 2021 +0200

    Separated JSON from FirebaseJSON

[33mcommit 1fef05239d2ce289c2a15f8a1df7a705883343bf[m
Merge: 6a4aeef75 6a60cd168
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Sep 15 19:06:14 2021 +0200

    fix merge conflict + smallest refactor

[33mcommit 6a4aeef75e21cc19000a9a09a5395857f7c55553[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Sep 15 18:11:26 2021 +0200

    one more small coverage, small refactor

[33mcommit 2e8c372a68942820f5641b237307909685606d9d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Sep 15 07:50:56 2021 +0200

    Fix broken tests due to change in clickElement

[33mcommit ac648a4e0f73a9700adf7a3bf6bfcaf6334bec5f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Sep 14 21:45:43 2021 +0200

    [chat] PR comments

[33mcommit 6978965d183d1b1d31645890dfe87f6f069cd7e7[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Sep 14 21:20:08 2021 +0200

    Answer to PR comment, cover some branch

[33mcommit 65092b868be38981251afe2c6f11cb65132e0b6a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Sep 14 18:38:48 2021 +0200

    [chat] PR comment: ensure elements exist when clickElement is called

[33mcommit dea2b40105ba2b285b4e050f96e3da97a7f67f2e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Sep 14 17:39:30 2021 +0200

    [chat] PR comments

[33mcommit 72bff83304d645d78dbf933bd5bcb6dbb1e671ab[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Sep 14 17:37:16 2021 +0200

    Improve coverage in header and awale

[33mcommit 5f6d67ec323c71275bb582aa1d04fe9a2c155c51[m
Merge: 054e11626 209874181
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Sep 14 17:35:38 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into chat

[33mcommit 6a60cd168e95b35172f50138941ffa5fb4f6c4ff[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Sep 14 17:35:03 2021 +0200

    Fix redirect in index.html

[33mcommit 209874181d93cd2ce527f560ae0d829ab6b5e6e2[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Sep 14 07:43:00 2021 +0200

    [actions] Improve dev deployment

[33mcommit 541d58610b5a26553c721355fa31d09193393e6f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Sep 14 07:05:39 2021 +0200

    [actions] Fix actions syntax

[33mcommit 9dcbb00e1c83fcc26231b6db99665159e540e39c[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Sep 13 22:50:12 2021 +0200

    Cover some branch; answer PR 1 wave of comment;

[33mcommit 135ef3ee80d54fa1d4fdebccd3cf204d6c1a148d[m
Merge: e1da5f22e 6039b037e
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Mon Sep 13 22:02:45 2021 +0200

    Merge pull request #56 from MartinREMY42/i18n
    
    I18n

[33mcommit 054e11626749f43eb8180ce6f513aed4de109274[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Sep 13 13:37:58 2021 +0200

    Remove uncoverable branch

[33mcommit 9bfec9133c9f21c11ea4262542d693d5d2522658[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Sep 12 21:26:32 2021 +0200

    Modifiying game config sends less useless data to firebase; candidates arrival stopped being a pain in creators neck

[33mcommit e8448fb035d4fe26989a997179c52589a8747590[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Sep 10 10:25:56 2021 +0200

    [chat] Coverage

[33mcommit 6039b037e5a9509e18fad5fcf0f3dad78ac7e042[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Sep 9 22:41:10 2021 +0200

    [i18n] Update index.html

[33mcommit b1f26587a78b51cd124352b53614b60bdbaa4c7e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Sep 9 22:40:39 2021 +0200

    [i18n] Fix redirection on /

[33mcommit 1925e23839ac3fc7636d7a7144f821ebd11943e0[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Sep 9 22:40:22 2021 +0200

    [deps] Update outdated dependencies

[33mcommit f9bd7a7904e14a644b140f3390f33f14d2e016ef[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Sep 9 22:28:49 2021 +0200

    [actions] Try to refine actions to avoid two builds firing

[33mcommit f1c8cce728d8ed7b1f2e92bd48f7ae806113f4ad[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Sep 9 20:45:42 2021 +0200

    Change typescript version requirements

[33mcommit bcb97c31511c4d7189333fa197b502a36e0cb571[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Sep 9 20:39:09 2021 +0200

    Add angular/compiler dependency back

[33mcommit d730ba590ccbb2a865cf99098302a1fe9e7d79be[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Sep 9 19:59:19 2021 +0200

    [i18n] Improve deployment on board-test

[33mcommit 0bf08872f916e2a6a860733b5c19c7da01f9576a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Sep 9 19:16:51 2021 +0200

    [i18n] more fixes

[33mcommit f08187412f75bae588b4327deeef6ddb8317c643[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Sep 9 18:01:25 2021 +0200

    [i18n] Improve deployment

[33mcommit bd7bcc690b91196f5e475fb8da6d97bde0375d92[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Sep 8 22:47:45 2021 +0200

    Go and Kamisado enhanced

[33mcommit 17653ca57d4d6a029bd7bd8cd72b1f69948b05c4[m
Merge: 87d3fbea2 e1da5f22e
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Sep 8 07:45:30 2021 +0200

    merge develop and fix conflict and tests

[33mcommit 14985b62ea7ca36a51b8526142686d3908122c4c[m
Merge: 6320664cb e1da5f22e
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Sep 8 07:15:35 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into i18n

[33mcommit 87d3fbea2c44de09a71f136cd9ca9a1970ac1ed5[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Sep 7 18:47:43 2021 +0200

    tests of the time enhancement seem to work; take back don't break the flow

[33mcommit 6320664cb7c5823ee07b81e8ee96073bc8c37c06[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Sep 7 17:50:24 2021 +0200

    [i18n] Fix FR, take comments into account

[33mcommit 14a537369c059095c7d286ce56915d78c85ccb6d[m
Merge: a03cd27ff e1da5f22e
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Sep 7 07:09:31 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into chat

[33mcommit a03cd27ff3b7ca1a423785629627f15314fef9ba[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Sep 7 07:08:47 2021 +0200

    [chat] Remove logging

[33mcommit 92ced68fbe7cd3712b8d354ba6d883906fe9eaf3[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Sep 6 22:08:27 2021 +0200

    [chat] Fix remaining tests

[33mcommit e7f5e5752243e13e9e2de36ee27165ae63e4109c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Sep 6 19:48:24 2021 +0200

    [chat] WIP

[33mcommit d6595866e01bae8d94da47fcb3357b97a9f048db[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Sep 6 18:09:33 2021 +0200

    [chat] Fix test: scroll to bottom on load

[33mcommit ce80129285e7bd7f28c89ad77da9a0c53bd0e1ff[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Sep 6 17:35:57 2021 +0200

    [chat] Fix test: scroll to bottom when indicator clicked

[33mcommit 5bdd4cb1409927bcab9d90fb632f568f71522e2c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Sep 6 09:00:59 2021 +0200

    [i18n] Disable runtime translations, use FR by default

[33mcommit 0d37c7bfc5b0c1d9ed6749e32c0565a7a2404c59[m
Merge: f15692155 e1da5f22e
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sun Sep 5 14:52:54 2021 +0200

    Merge pull request #68 from MartinREMY42/develop
    
    Master 21

[33mcommit e1da5f22eee335dc1271bb5b6ff1c1c2208219fc[m
Merge: 29ce744c3 d07c40d86
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sat Sep 4 20:00:04 2021 +0200

    Merge pull request #64 from MartinREMY42/dao-tests
    
    Dao tests

[33mcommit d07c40d86d5525d786520a866e1aaf86e514b86f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Sep 4 19:54:21 2021 +0200

    Update index.html

[33mcommit bcab84b79cb52e41333002e452188617747ddaea[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Sep 4 19:40:34 2021 +0200

    [dao-tests] Fix use of emulators

[33mcommit 0857e6419e9a64d7b5a9647cf128d2d351f20d3d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Sep 4 17:30:03 2021 +0200

    [dao] Try to get CI test working with emulators, second try

[33mcommit 7e3222255dd679b763ab3a159b211169d9116e90[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Sep 4 17:21:49 2021 +0200

    [dao] Use script to run tests in CI

[33mcommit 7db80562e70026259447f6821b85704f205ac8bf[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Sep 4 17:17:23 2021 +0200

    make npm test command work on Martin's device, hence, probably on most windows

[33mcommit 7e06b49b6357f0820e78c12cb67f2fc287cc6d42[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Sep 4 16:32:31 2021 +0200

    WIP

[33mcommit 526ddf7e8b1662ff583cdf30509d2dc50ac29a94[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Sep 3 17:15:25 2021 +0200

    add package-lock.json to gitignore

[33mcommit 168b5df58145d6cc0d55424d6c1ac7ee7fcc9bf2[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Sep 3 17:14:50 2021 +0200

    [i18n] try to get all translations working

[33mcommit 334b79b07ef69d85b1113c10d2d472d6b0ad234e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Sep 3 17:07:32 2021 +0200

    [i18n] Increase coverage for header

[33mcommit a4eb5671100b11f4e01f780e2d90cf70aea71222[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Sep 2 08:31:18 2021 +0200

    [i18n] Improve translation script

[33mcommit 3f692e5d36fe88882a94c2a025d52ca63da9017d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Sep 1 08:07:44 2021 +0200

    [i18n] Fix locale loading

[33mcommit c83d5faabe324aacbf5d00e6db9f05b86f42b931[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Sep 1 07:51:22 2021 +0200

    [i18n] minor pr comments

[33mcommit 2982a3ac6e0c4f5886215814811a6dbb87d1061c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Aug 30 07:03:40 2021 +0200

    WIP

[33mcommit c168c9b6401f6c27263eb3eee60704604bfd92ab[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Aug 31 07:07:45 2021 +0200

    Update version number, update npm test command

[33mcommit 655eda0de09d6696ac77a37df3ba62558c386b26[m
Merge: 14acb8ad3 29ce744c3
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Aug 31 06:58:09 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into dao-tests

[33mcommit 6a7527ee8d86c491fa591fbe5bea3713f8f40286[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Aug 30 22:12:33 2021 +0200

    [i18n] final PR comments? and fix CI

[33mcommit f2e04fecbe75858da0d4f5a779fd4859e6f1ca2f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Aug 30 07:29:53 2021 +0200

    [i18n] final comments?

[33mcommit 93a084ba72c20ddefd72c87965a0d6ca3f47668e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Aug 13 22:18:11 2021 +0200

    [chat] Progress on chat component and tests

[33mcommit f1e598a66a19a6aa943e6c46b6a4998c130f59b5[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Aug 28 22:55:13 2021 +0200

    [i18n] More corrections, improve actions too

[33mcommit f345baf8ef407cc1dab80d5ffc019204a61d453c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Aug 28 10:18:19 2021 +0200

    [i18n] All game descriptions!

[33mcommit c85f6e4307517d64900b674b72c9c86e79c751cd[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Aug 27 22:29:58 2021 +0200

    [i18n] All game descriptions, more revisions

[33mcommit 2663227f9641c6d1d6b7746b9bffdb2876dcaba0[m
Merge: b841039d5 29ce744c3
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Aug 27 19:00:56 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into i18n

[33mcommit b841039d5822c07a6c0e855f455b238fd448e81c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Aug 27 18:34:50 2021 +0200

    [i18n] some more changes

[33mcommit c329ee245e1046b2575b4d87482740ffee2f9fca[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Aug 27 13:52:16 2021 +0200

    [i18n] lunch commit: fixed remaining comments

[33mcommit 3924235344f53a839e8208573fe988cc7c22bb25[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Aug 27 06:56:51 2021 +0200

    [i18n] PR comments ~2000

[33mcommit c34d5e738625dd6788edc5f0000b9fd75dc38ac6[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Aug 26 07:41:47 2021 +0200

    [i18n] minor change

[33mcommit b3d3f8490f1dcb13aff47d33881b0a341487bae2[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Aug 25 22:35:37 2021 +0200

    [i18n] PR comments

[33mcommit 9d13e10a84a7657411565a760ec5107db0de6122[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Aug 25 08:25:51 2021 +0200

    [i18n] go / gipf

[33mcommit 6b78959db4f97375c32c98add6b53030f6d97ef2[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Aug 25 08:02:32 2021 +0200

    [i18n] Moar

[33mcommit 3bc70d4438d304fea5ffe464d7fb49f9722a570f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Aug 24 08:39:04 2021 +0200

    [i18n] More progress

[33mcommit 79592d81f4dc67798290f65b40cc663449afcb49[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Aug 23 08:23:11 2021 +0200

    [i18n] Update ids

[33mcommit a141ddaebd1fcfcd9d2fd0f6205d8869a4955e46[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Aug 23 08:01:27 2021 +0200

    [i18n] 13XX?

[33mcommit f15692155a06bfdb0b5bf5a59b2c3f9a85a78740[m
Merge: 738d08a40 29ce744c3
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sat Aug 21 21:41:00 2021 +0200

    Merge pull request #67 from MartinREMY42/develop
    
    Master 20

[33mcommit 29ce744c345bfd358d636fd612de91159ca73d84[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Aug 21 18:43:06 2021 +0200

    Remove package lock

[33mcommit b10dcd6be1d3ab0f5f557d57c892015e2262e05a[m
Merge: 0da9d8d80 4e83f9639
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Aug 21 18:39:15 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit 0da9d8d80f52207327164c4a23d83297b9f2588b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Aug 21 18:39:03 2021 +0200

    Update package-lock

[33mcommit 4e83f96390b387866173fd4cfc5a1b502bbf3b3a[m
Merge: 4e2235183 9a4b14139
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sat Aug 21 18:35:19 2021 +0200

    Merge pull request #63 from MartinREMY42/yinsh-improvements
    
    Yinsh improvements

[33mcommit 9a4b141396ee5ead97551f2e67a365c14802a058[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Aug 21 18:30:23 2021 +0200

    [yinsh] minor final changes

[33mcommit 12c80cda978f3d8dc3ed57fa86c9e6f76f1daeea[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Aug 21 18:24:24 2021 +0200

    Update Coord.getDirectionToward behavior, remove getBinarised

[33mcommit ad46c8e27e9f7bde676295347eab601784eb1811[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Aug 21 18:12:21 2021 +0200

    [yinsh] Fix lint errors

[33mcommit ab7fb3ad2a74087cdddd359ea1050fc53b16c273[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Aug 20 22:49:43 2021 +0200

    [ci] name changes for actions

[33mcommit 6f53b37284df785ea3841bf50d93e261cb3e9305[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Aug 20 22:49:05 2021 +0200

    [i18n] some remaining comments

[33mcommit ac599a31e7a02e86e0f0c3a059c1ff3b68c307ed[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Aug 20 09:35:26 2021 +0200

    [i18n] coerceo & dvonn

[33mcommit 43ee3b208b603e89801f780e09f7f51787e89478[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Aug 20 08:20:30 2021 +0200

    [i18n] More comments

[33mcommit 2638a335eeb0493f8830ff322c3d48984c1b7231[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Aug 19 16:55:08 2021 +0200

    [yinsh] PR finalization

[33mcommit ef8d2ae9e8ace14b10a09839f6742bbcadf8344b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Aug 19 16:27:51 2021 +0200

    [i18n] Updated fr file

[33mcommit 497f7fca2866ec9331601e3c7bcdfdf213d09907[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Aug 19 07:06:43 2021 +0200

    [i18n] PR comments (still need to regenerate xlf though)

[33mcommit 790e4b9dcd6e4beaf1f05b8d0852d9ccb0c9eca4[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Aug 18 08:08:01 2021 +0200

    [yinsh-improvements] PR comments

[33mcommit 31c226af0ed5534d757c9e0cbac3b0071677b7c2[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Aug 18 07:08:12 2021 +0200

    [i18n] PR comments and check all FR items with spellchecker

[33mcommit 4b422e72f82f7c3390a7971a73cd2249c1ff4427[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Aug 17 22:11:21 2021 +0200

    [i18n] Fix remaining tests

[33mcommit b69b2dd2a613a8be61904acaf5032de409eea0d7[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Aug 17 22:05:48 2021 +0200

    [i18n] brbr

[33mcommit 357f7e17424d992194716231d12412cae186d706[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Aug 17 21:56:48 2021 +0200

    [i18n] non-breakable spaces

[33mcommit 034adfd2814f32101752c177da8df789fb09bd2e[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Aug 17 21:36:14 2021 +0200

    architectural change made on time use, not using it yet but updating it's data already

[33mcommit 9f74401c8ef61d81d70cdc5c4e3a48bb903a3671[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Aug 17 08:13:26 2021 +0200

    [yinsh-improvements] Fix broken tests

[33mcommit d7db031d740ba628bbf88bae0f5833614dd488a8[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Aug 16 20:17:05 2021 +0200

    [i18n] Fix remaining non-breakable space in english

[33mcommit 93237c2dbb7876cd97c26c1fa4563cbfd3c365e1[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Aug 16 19:11:15 2021 +0200

    [i18n] use non-breakable spaces in french

[33mcommit 78c2b5a640b71e54897ec24dc28472a79ed65315[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Aug 16 18:18:57 2021 +0200

    [i18n] PR comments

[33mcommit ca6cde7aa398a4cfa93142d59bfec5613cbbb90f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Aug 16 08:52:24 2021 +0200

    [i18n] update fr.json

[33mcommit 7aa127fdecc4ba3dd810d88ae531c7188d6b6c72[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Aug 16 08:51:50 2021 +0200

    [i18n] Add missing close tag

[33mcommit f2ad53cc38d85d08e8b0b91a2a01013b6b91ea42[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Aug 15 22:04:45 2021 +0200

    [yinsh] PR comments

[33mcommit 39bf679b806a1df7466ffa643d3d68e85cf55798[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Aug 15 21:55:59 2021 +0200

    [i18n] More PR comments

[33mcommit 68983deb44be5158256e665224e958d86fedb1d9[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Aug 14 16:31:18 2021 +0200

    Work in progress; investigation done, path to take is chosen

[33mcommit ed7b24893e9b6cc451f860daddaddd8857b1ff82[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Aug 14 10:47:59 2021 +0200

    [i18n] PR comments

[33mcommit f19a64959def2f31b421a9c6bcae2132c8980e5e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Aug 13 12:27:49 2021 +0200

    [chat] Fix flaky test due to chat messages being mutated

[33mcommit 9a8c05b1146626f43cee04cf46e5b91f4993e745[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Aug 13 07:53:50 2021 +0200

    [chat] Improve chat component, 100% coverage

[33mcommit c21560564fe5919de6d33e4782f6a1f8e275078f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Aug 12 08:43:36 2021 +0200

    [yinsh] PR comments

[33mcommit 6ec85e8eb827d85068cbac81cbb935391c2e74b0[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Aug 12 08:19:58 2021 +0200

    [yinsh] PR comments

[33mcommit ff91c7569e818c2adbf19a6e9b19b49d8684062a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Aug 12 08:06:55 2021 +0200

    [chat] Bulma-ize chat html

[33mcommit 0bc2c1cff009fbbd41aecabe1ec769102990ea0c[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Aug 11 20:48:36 2021 +0200

    wip

[33mcommit 8e1944bda0cad6841b7807583ee4a32caee7c8e0[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Aug 11 20:24:05 2021 +0200

    [chat] 100% coverage on chat service

[33mcommit 4a302d7c95297a401fc8f358426107580cdfed3c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Aug 11 11:40:59 2021 +0200

    [yinsh-improvements] Reenable disabled tests

[33mcommit b0993d7d34c72d4a4a2f83972f023369d1bde57f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Aug 11 11:37:03 2021 +0200

    [yinsh-improvements] Fix LoA tuto after merge

[33mcommit 42a1f984cc583fdad03663939c2d5a73563c5b8f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Aug 11 10:07:40 2021 +0200

    [yinsh-improvements] Add MGPCanFail tests

[33mcommit f65e8707b368221858914ecb826379b14153e30f[m
Merge: dc3cb9e7a 4e2235183
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Aug 11 08:54:50 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into yinsh-improvements

[33mcommit 961d8ca7549eab3878e7f7f15bdb04f01188abc8[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Aug 10 17:31:05 2021 +0200

    [i18n] Polish check-translations script, add missing TimeUtils translations

[33mcommit 92cc2ca599ec97ce01f5b92036f47cb1bd99013f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Aug 10 16:04:41 2021 +0200

    [i18n] Update check-translations script

[33mcommit 4c51a55742f6359fa377510f2b267226f58385a6[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Aug 10 16:03:10 2021 +0200

    [i18n] Take PR comments into account

[33mcommit dc3cb9e7a170b87f5aeb887ca005d6fc5de36fa7[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Aug 10 08:56:17 2021 +0200

    [yinsh] full coverage

[33mcommit b8e575d7833d540cfc09e4ec00b1f236983be743[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Aug 9 22:27:26 2021 +0200

    [yinsh] improve tutorial, fix component tests

[33mcommit 52bcab26a6b557abc4438508f14350f8d72d4a45[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Aug 9 18:59:56 2021 +0200

    LastMoveTime correct, working, Beginning also correct as server time stamp; AND 'make opponent lose only if he is offline' work!

[33mcommit e3ff3ec553436d783c1776ac956877994b912e2a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Aug 9 16:08:03 2021 +0200

    [yinsh] ambiguous captures are still possible, show toast when it happens

[33mcommit 6a66f25562726d014a880affe02185d5af93fc9f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Aug 9 16:02:56 2021 +0200

    [yinsh] Improve visuals of of move targets

[33mcommit 3a0fd8193e7266fed4228455dacc95e68b542f0e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Aug 9 15:11:35 2021 +0200

    [yinsh] Improve visuals of opponent's captures and move

[33mcommit 7c87d20a6c60eaf417e2f1737093a732c289970e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Aug 9 14:49:36 2021 +0200

    [yinsh] Show last moved

[33mcommit 115f6d08b44a50cdd36012688c8999c1723e75dd[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Aug 9 13:30:44 2021 +0200

    [yinsh] Show selected captures

[33mcommit d521affa7a2a75fd4baa763c58b7bef8a01329a2[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Aug 9 10:54:14 2021 +0200

    [yinsh] Improve capture selection

[33mcommit 5973ad93b0c287b1d2593ec058595b3daf0d25c6[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Aug 8 22:12:14 2021 +0200

    [yinsh] Improve ring visuals

[33mcommit ca8d10592552579ac8570de322aaf43c5e393111[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Aug 8 22:01:20 2021 +0200

    push to see global changes on PR

[33mcommit 8df46c2f060399bb4c6c4f68587cb0c598d3c8fc[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Aug 8 17:37:19 2021 +0200

    Refactor direction construction

[33mcommit 812d091067fb724c6aa45208ab1a386025f69fb1[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Aug 7 23:16:11 2021 +0200

    change behavior to make online player responsible for their own losing notification

[33mcommit 1d768cddd93bc22dfb84443f31baf9135842bad8[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Aug 7 09:03:51 2021 +0200

    Replace some Date.now by firebase server timestamp

[33mcommit 4e2235183de58159d521c2a9c6404ffbb099a1bc[m
Merge: f34e2ba7d ec0cdbe11
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Aug 7 08:26:50 2021 +0200

    Merge pull request #62 from MartinREMY42/TutorialEnhancements
    
    Tutorial enhancements

[33mcommit ec0cdbe117992f6c092f13debbac692262567ad2[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Aug 7 08:24:48 2021 +0200

    typo fixed

[33mcommit a128fcc72d8e276b4397efaf3777a921d6441ec4[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Aug 7 08:20:00 2021 +0200

    [i18n] Final fixes

[33mcommit 17651d5563673d24919b0a74da470d7d854676ef[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Aug 7 08:05:53 2021 +0200

    [i18n]  add script to check validity of the translations, apply fixes

[33mcommit 199a6af4e7215f23fba26226560a1238615101e2[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Aug 6 22:17:18 2021 +0200

    [i18n] All translations! \o/ /o/ \o\ /o\ \o/

[33mcommit ef2aea9943500933369a9607e329d0bbbeceecac[m
Merge: 483871585 f34e2ba7d
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Aug 6 20:35:55 2021 +0200

    fix conflict

[33mcommit 483871585da8e701ff05b4aef87f427cafd7c4e9[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Aug 6 19:18:24 2021 +0200

    PR comment fix

[33mcommit 14acb8ad3a2d7fad8465163d28a4dbdec1363286[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Aug 6 08:25:29 2021 +0200

    [dao-tests] dev-dependency on firebase-tools

[33mcommit 5ac596910334a94e01e5668213316a5ffd05b7a5[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Aug 6 08:22:18 2021 +0200

    Update emulators

[33mcommit 898b48510bf2fbd75bc2f01819c5e53bfcd78ca1[m
Merge: 1c12d974b 0aa199097
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Aug 6 07:55:36 2021 +0200

    Merge branch 'TutorialEnhancements' of github.com:MartinREMY42/multi-game-project into i18n

[33mcommit 4ef3f790584712bc9f71c01d6015ed3700dbedc2[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Aug 6 06:38:11 2021 +0200

    [dao-tests] Change npm test command in package.json

[33mcommit 1c12d974b829463b7ca64d7575222f3329690edd[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Aug 5 20:26:39 2021 +0200

    [i18n] more pr comments

[33mcommit 0aa199097eacb0ce57a8d676adae136b84451495[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Aug 5 19:47:10 2021 +0200

    small change

[33mcommit 9049b1d69d747f9022ab7002ccf79c9a18b69ca6[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Aug 5 15:53:33 2021 +0200

    [dao-tests] 100% coverage on dao

[33mcommit 0370244a536f9cde7fe8c7655e365df06214d909[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Aug 5 08:38:18 2021 +0200

    [i18n] Fix SixTutorialMessages import

[33mcommit bf497e5121b4e47eae06ba43ab4149c13e4ed694[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Aug 5 08:29:58 2021 +0200

    [i18n] PR comments + take changes to Six

[33mcommit b6f1182d25a8ca2e9130e2b627ddd09beb44f436[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Aug 5 08:08:40 2021 +0200

    all 'didacticial' replace by 'tutorial'; some enhancement

[33mcommit 139d29d3e704a5ba3e6fdca09da24c706cd21de7[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Aug 4 21:50:47 2021 +0200

    [i18n] moar pr comments

[33mcommit 44c4f49ed6e3d8829261cf14509e4446ce44ba9a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Aug 4 18:11:51 2021 +0200

    [i18n] PR comments

[33mcommit e540cde867bcb9bfc4070097468892f7a2f43c95[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Aug 3 21:38:11 2021 +0200

    [i18n] PR comments

[33mcommit 1ce2c11fb7276ccab926c2b1997fd2aa2cf61c1e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Aug 3 18:17:56 2021 +0200

    Some improvements to Yinsh

[33mcommit d287f3c63722e1d772959b6026e340252b6cd2ad[m
Merge: 3d683396d 73b0c335f
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Aug 3 07:09:12 2021 +0200

    Merge branch 'TutorialEnhancements' of github.com:MartinREMY42/multi-game-project into i18n

[33mcommit 73b0c335fa9103dbee4a1a8d8b8005fb49139b4c[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Aug 2 21:27:43 2021 +0200

    merge develop and fix conflict

[33mcommit e8b73e1af39273c74bed1db5add69028c5b7809c[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Aug 2 21:16:03 2021 +0200

    tutorial moved to their game's folder and attached to it

[33mcommit 3d683396dec6b73dfb93e32602903a8ecd814dd7[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Aug 2 20:25:30 2021 +0200

    [i18n] UK -> US

[33mcommit 37f3a037c517eb4192b3b2540036770a265bc877[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Aug 2 19:19:39 2021 +0200

    [i18n] More PR comments

[33mcommit 56b6663263483f367e9d89e2b96e3a69ff62d761[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Aug 2 18:04:27 2021 +0200

    [i18n] case -> space/square

[33mcommit 1714307053d76251876f62e2e56f94ce08777926[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Aug 2 17:52:53 2021 +0200

    [i18n] PR comments, start updating translation files

[33mcommit 03c45e290391b48221c39638463c176322dd16a8[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Aug 2 15:21:28 2021 +0200

    File renamed; Didacticial/Tutorial Step now able to have a previous Move; gipf enhanced

[33mcommit e998f93f48cf2a56d2cde917aa5cc8ac9ee0180a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Aug 2 08:18:06 2021 +0200

    [i18n] PR comments + more game descriptions

[33mcommit 52701b4a8d9adc942226a5ec24e75b32f1de0d90[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Aug 1 10:17:07 2021 +0200

    [i18n] Update yinsh failure

[33mcommit ffa896464ec49091273c33693751fec568eedb67[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Aug 1 08:47:45 2021 +0200

    [i18n] missing dot

[33mcommit 2a1c0de1df9bd68e1c377cbd599c7549647efd7c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jul 31 22:06:21 2021 +0200

    Fix tests, add extra explanation to Dvonn

[33mcommit e395900996d2819bc5d904e2117eaf8fce011bf7[m
Merge: 3ddc7fa81 3b582b56d
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jul 31 21:27:31 2021 +0200

    Merge branch 'TutorialEnhancements' of github.com:MartinREMY42/multi-game-project into i18n

[33mcommit 3ddc7fa8185b85f79f24cec03c781517160f10d4[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jul 31 21:21:05 2021 +0200

    [i18n] Missing i18n

[33mcommit f3ea86149dc4ea7f5bd44d9b86027eea08f8c537[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jul 31 21:18:45 2021 +0200

    [i18n] case -> space or square

[33mcommit 7e35043c3d4eacf3b0fd61347d016afa3586b639[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jul 31 21:10:34 2021 +0200

    [i18n] Yinsh tutorial

[33mcommit 371ecb81186b20e013002d4eb2b729aebcbb30af[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jul 31 20:41:34 2021 +0200

    [i18n] Use a spellchecker

[33mcommit cba834112d2770733dde646931bdc3405001754e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jul 31 20:32:23 2021 +0200

    Cover missing translations

[33mcommit e656cd1df87b4b4abe396eedf9b26d5753b263fe[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jul 31 20:17:08 2021 +0200

    [i18n] Fix tests

[33mcommit 679f165332e4f3ef474b92124506f0d9cb14d356[m
Merge: 48e3930b0 f34e2ba7d
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jul 31 19:48:42 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into i18n

[33mcommit 3b582b56db410f3f8953649d07eb4deda22e8a88[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Jul 31 18:45:20 2021 +0200

    enhanced coverage of fromPredicate; totally covered now!

[33mcommit f34e2ba7ddef7c1864989bbd4d81ffad208640c0[m
Merge: 530bee6b7 35de80e74
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sat Jul 31 18:44:41 2021 +0200

    Merge pull request #47 from MartinREMY42/yinsh
    
    Yinsh

[33mcommit 35de80e74dee0a654d7d6f855095e8feb5e7d52d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jul 31 18:34:55 2021 +0200

    [yinsh] Minor fix

[33mcommit f06391de6415ce94bae2f82eaf8de7c59a85671e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jul 31 18:30:41 2021 +0200

    [yinsh] More PR comments

[33mcommit 5ce80255b604f62b2703be8faaed4f252dad642b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jul 31 17:58:37 2021 +0200

    [yinsh] extract showLastMove in component

[33mcommit cf5fae2862b750f264f1024af723d12ac6d4c784[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jul 31 17:55:00 2021 +0200

    [yinsh] PR comments

[33mcommit 04a89ab04ffefeb482de1f17ae41f992895a5c3f[m
Merge: c99e28f80 530bee6b7
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jul 31 17:17:10 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into yinsh

[33mcommit 530bee6b78e53b605f047af3711fd98223879252[m
Merge: 3122df632 5a27df1f6
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jul 31 17:15:50 2021 +0200

    Merge pull request #61 from MartinREMY42/Abalone
    
    Fix Hexa Direction

[33mcommit 48e3930b020821f6daa75585c3f852310af6973d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jul 31 10:15:42 2021 +0200

    [i18n] Tablut tuto

[33mcommit 3ad3a8bf0bcc0d870cdb80a736467feacc176801[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jul 31 09:33:18 2021 +0200

    [i18n] Six tuto

[33mcommit 78d42dfb7da276b940f3b662ab9fdc514f7405e2[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jul 31 08:57:57 2021 +0200

    [i18n] siam tuto

[33mcommit a727a07fb920db21a51e6705b0f20daa2d2f3aae[m
Merge: 2c5da525b 9997893a4
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jul 31 00:28:05 2021 +0200

    Merge branch 'TutorialEnhancements' of github.com:MartinREMY42/multi-game-project into i18n

[33mcommit 2c5da525b100afd23a4ce2e5a2e01388f2d96103[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jul 31 00:21:54 2021 +0200

    More translations

[33mcommit c99e28f804252eb2e57cb2a5c82dffe47dd7fec3[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jul 31 00:20:11 2021 +0200

    Fix Yinsh PR comments

[33mcommit 5a27df1f64d25d72fc24982bda01b7251f493056[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jul 30 19:59:07 2021 +0200

    getAngle added and NumberEncoderTestUtils used

[33mcommit 9997893a4824fe305a89ea65d21046202b4bf28b[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jul 30 18:23:27 2021 +0200

    all tutorial htmlised

[33mcommit 31360da83255bd800aeb9159f3b206d5e476c670[m
Merge: 7ea79924a 915c0d4f8
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jul 30 09:04:29 2021 +0200

    Merge branch 'TutorialEnhancements' of github.com:MartinREMY42/multi-game-project into i18n

[33mcommit 7ea79924a9eea71265e511194ed03b978a2c6cfe[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jul 30 09:03:26 2021 +0200

    [i18n] Quarto

[33mcommit c2d3e5b65d7c9620f5e250a151fbb5cf9b8e61a6[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jul 30 08:06:17 2021 +0200

    [i18n] PR comments

[33mcommit e748b41f026b4e2b05585fe8484381bad2810b9e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jul 30 07:43:19 2021 +0200

    [i18n] PR comments

[33mcommit f8d2d872888c33dfa7eda2317b5c8f8e40318c31[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jul 30 07:09:31 2021 +0200

    handle PR comments

[33mcommit c0425c3393f4f4d26982a79ba7136c6cb56381d0[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jul 30 07:02:16 2021 +0200

    [i18n] More translations

[33mcommit 915c0d4f804a4a2401ddec251e0bc617d067fe19[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Jul 29 22:43:56 2021 +0200

    4 tutorial enhanced and sahara enhanced as well

[33mcommit 0aab73ac2971511572b0c59caf88b811cf97e573[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Jul 29 20:20:38 2021 +0200

    more enhancement

[33mcommit 018c3db92a571b34302bd7831debedc50d07e081[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Jul 29 20:01:23 2021 +0200

    enhancements

[33mcommit e247dd34a38f061ec99e5f982b5ef97c90576e21[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Jul 29 19:37:01 2021 +0200

    Fix HexaDirection encode/decode

[33mcommit a00d1794af9a22758d1f8837ca266dd26d0ee330[m
Merge: 402d7f621 df4858b08
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Jul 29 07:10:15 2021 +0200

    Merge branch 'TutorialEnhancements' of github.com:MartinREMY42/multi-game-project into i18n

[33mcommit 402d7f6211e81b8e306bc4111a5786ed81afbaf8[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Jul 29 07:02:29 2021 +0200

    [i18n] Translate abalone failure

[33mcommit 22f6a30824a029f3407aa05fc07fec148ff1d749[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Jul 28 22:18:59 2021 +0200

    [i18n] Abalone

[33mcommit ae31b9da5e4e9d988e0ebc271b058045e976486f[m
Merge: d01578103 3122df632
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Jul 28 22:16:34 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into i18n

[33mcommit d01578103228bbc7ffa70f892a64202db016e31d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Jul 28 22:16:13 2021 +0200

    [i18n] Game descriptions

[33mcommit 3ea9d50a8073289e040efed14f730a3f9fbaa217[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Jul 28 22:07:37 2021 +0200

    Remove fit

[33mcommit 54ebe2d0712dffb04e58a76fcac6ff3e31519167[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Jul 28 21:32:57 2021 +0200

    Fix bug: ai was playing when the game was finished

[33mcommit df4858b082fb9914c12eba0f57bfe73eed832271[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Jul 28 20:43:41 2021 +0200

    13 out of 20 tutorial htmlised

[33mcommit 58e9c7c601352c9697737e4f84b5c6dcf7f03d6a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Jul 28 20:23:06 2021 +0200

    [i18n] Translate more

[33mcommit bae06f6c9b9a9f4eb3c71753c32d1d869305b47c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Jul 28 07:52:27 2021 +0200

    [i18n] Coerceo

[33mcommit ab697ee985c08775f70d39e6cd49414daf286790[m
Merge: d2e824ac9 4dbe5176c
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Jul 28 07:10:12 2021 +0200

    Merge branch 'TutorialEnhancements' of github.com:MartinREMY42/multi-game-project into i18n

[33mcommit 8806ca2ecbf02d40f780d509cada0e6cb2ec7826[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Jul 27 22:06:27 2021 +0200

    after game button added, epaminondas and gipf tutorial htmlised

[33mcommit 3122df63205b02d7156940db7e816d65c9bbfda9[m
Merge: 247624e30 5d6a83542
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jul 27 20:27:56 2021 +0200

    Merge pull request #58 from MartinREMY42/Abalone
    
    Arrows enhancement

[33mcommit 5d6a83542106c44da10d0480caad645b241189d3[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Jul 27 18:26:30 2021 +0200

    Tutorial small fix

[33mcommit 4dbe5176c4d1b6862f818bbe37bbe983b00fcb8e[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Jul 27 18:21:25 2021 +0200

    Tutorial Enhancement in progress

[33mcommit dd7d98d38011a2b4926cbc4434003b975f4f3e13[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jul 27 17:50:35 2021 +0200

    Update tuto

[33mcommit d2e824ac9a0d3e9d0d96e52a5a0fb18026ef1625[m
Merge: 16d6386f0 247624e30
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jul 27 17:25:26 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into i18n

[33mcommit 2f01d981981a20b21d37098e393fd6dfa36b235d[m
Merge: 354859f89 247624e30
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jul 27 08:13:56 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into yinsh

[33mcommit 354859f8969e8db46bf1a05bef2b4a3a0c06428c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jul 27 08:13:09 2021 +0200

    Multiple changes:
    
      - improve coverage in utils
      - add combinatorics util
      - fix Yinsh minimax
      - add Yinsh tutorial

[33mcommit e5d79fc9f95c2b656b827bda02cb07c969b24677[m
Merge: c1825a005 247624e30
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Jul 27 07:21:16 2021 +0200

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into Abalone

[33mcommit 247624e3011aaaf85a414e86b3d620da0679c43c[m
Merge: 49bddfdc0 e91d1d4a3
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Jul 26 22:05:19 2021 +0200

    Merge pull request #59 from MartinREMY42/FixEncapsuleTutorial
    
    Encapsule tutorial fixed, Go coverage enhanced

[33mcommit e91d1d4a3dd55762faa95ff9a2fbba45ffee28c1[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Jul 26 22:04:14 2021 +0200

    Encapsule tutorial fixed, Go coverage enhanced

[33mcommit c1825a005a4acf34e1b8418803fa5597ab39b6af[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Jul 25 23:29:22 2021 +0200

    Tutorial done, Epaminondas minimax coverage and logic enhanced

[33mcommit e7e625ec40843d87eefa9856bd8d66727422e0ae[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Jul 25 11:09:53 2021 +0200

    arrow fixed and enhanced; some code covered

[33mcommit b2b8811cde1a17c773f1c7888561ba3c5e83e6e5[m
Merge: 201f4348c 49bddfdc0
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jul 24 13:01:36 2021 +0200

    Merge + fix yinsh minimax

[33mcommit 49bddfdc0e095860c684edfb841ace1f151f7c9e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jul 23 20:04:18 2021 +0200

    Update index.html

[33mcommit 7c98387118450eefe7136d780e464e92d4d66693[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jul 23 20:02:06 2021 +0200

    Add Abalone picture

[33mcommit 16d6386f0244d53c001d84b13d4794836f4843bd[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jul 23 19:57:07 2021 +0200

    WIP

[33mcommit 3b23f5c9fe1d7497b4a485e60ae965b3a1073d2d[m
Merge: fce37a9a8 9f5aeead6
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jul 23 19:54:55 2021 +0200

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into Abalone

[33mcommit fce37a9a8ae3d11e53f77b10aa36bbd2d1eb0635[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jul 23 19:54:05 2021 +0200

    file renaming

[33mcommit c5865ecf20aad4e09535c37c2bc81c97e742c023[m
Merge: 9f5aeead6 3b23f5c9f
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jul 23 19:51:42 2021 +0200

    Merge pull request #55 from MartinREMY42/Abalone
    
    Abalone done, didacticial to be created, code coverage enhanced!

[33mcommit ea290a6dda57540905b7c267ec6f2ec98de3346b[m
Merge: 0ba4a02da 9f5aeead6
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jul 23 19:45:08 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into i18n

[33mcommit 9f5aeead64e8f1423bb08b72c1da396fdcd299a0[m
Merge: 56962f98b b1c398d37
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jul 23 19:42:43 2021 +0200

    Merge pull request #57 from MartinREMY42/WhenTBAgainstAI_ThenTBTwice
    
    Take Back Against IA Fix

[33mcommit 0ba4a02dac95d652f9da4634c5860728111c573c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jul 23 19:41:43 2021 +0200

    [i18n] Update translations

[33mcommit b1c398d372f0499d5b19c86ed797f3bf0df0201a[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jul 23 19:41:13 2021 +0200

    console.log removed

[33mcommit 7a951feb40937d9f4c3d32d31ff7a0856ebda3c1[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jul 23 19:07:07 2021 +0200

    small fix

[33mcommit 2c8bae9d7a1ec5998284a30e99992e3d631323e4[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jul 23 19:04:24 2021 +0200

    [i18n] Fix PR comments

[33mcommit d553caa0bd24643527d7d309ebcfc65beab7ea69[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jul 23 18:55:23 2021 +0200

    Tutorial to be finished, arrow fix to be done; all rest is good

[33mcommit 201f4348c8e6bd153dffbc13cf4da84aa85cabde[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jul 23 18:47:41 2021 +0200

    [yinsh] List buggy minimax behaviour

[33mcommit fab66def5cf66c9c2f4989ff246ebfa163183db6[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jul 23 18:35:21 2021 +0200

    take back against IA fixed

[33mcommit 68ff13911a4e2f0736ed228632f5fe81e0fd8bdb[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jul 23 08:18:08 2021 +0200

    Minimax coverage

[33mcommit d04540d8568da613c14251d013858dabc231d607[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jul 23 07:14:15 2021 +0200

    100% coverage of Yinsh, add YinshMinimax

[33mcommit 97fb173800f923c4f41ef2cce765b99688f784ec[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Jul 21 21:28:33 2021 +0200

    wip: abalone review and didacticial

[33mcommit aceee0d56964a58866c8b45a4c148b1bd23e9489[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Jul 21 18:11:01 2021 +0200

    fix PR review

[33mcommit 419df2634a10f14a81005ca44302e4ae62d8f2ec[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jul 20 20:47:34 2021 +0200

    Finish major translations

[33mcommit c94b5577c2ac5c534fed207117cfd25569b22cfe[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Jul 20 20:38:17 2021 +0200

    Abalone done, didacticial to be created, code coverage enhanced!

[33mcommit e998d3faf62b1684ec9296d613ae4cbc4a305c8b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Jul 19 08:05:31 2021 +0200

    Progress on translations

[33mcommit 8fd5b235c5f26d71a47a426dc453679ef818b9f7[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jul 18 08:23:17 2021 +0200

    Add some translations

[33mcommit 321f979c4370b08b8bdbaedd03b3222b39cbe5f2[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jul 17 21:58:51 2021 +0200

    Example translation

[33mcommit 7e6cbf94a8f2689eaf261d965c1f670da74f5419[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jul 17 21:56:28 2021 +0200

    Add example translation

[33mcommit fb14a8070b82e36c7c3194ed47042add8e7c055a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jul 17 21:54:16 2021 +0200

    Include translation files

[33mcommit c64497072738eb1b53381fb9f4719aa708a61fd5[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jul 17 18:50:38 2021 +0200

    Improve setup

[33mcommit 38a3a816d469b2e1133822c1c39aff225d3c3c02[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jul 17 18:49:49 2021 +0200

    Upgrade to angular v11 for i18n

[33mcommit 92a0832fa0b23c4525b7003540f1472be058fda8[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jul 17 08:08:27 2021 +0200

    Minor fix

[33mcommit 3685e2c49d6f3561f9b81b3509dc3467ddb89fbf[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jul 16 21:43:20 2021 +0200

    Update text in code

[33mcommit 67e5a3088dee43dc20b82419f69a4a4dc470c3a9[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Jul 14 08:19:04 2021 +0200

    Small fix

[33mcommit 7e7355378b92baff6a77df28c7439a895544206c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jul 13 22:07:32 2021 +0200

    Initial localization commit

[33mcommit ef8e8bad06ecdcc2ac80ac10c826a3a0f0bd83e2[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jul 13 22:00:39 2021 +0200

    First feature-complete Yinsh

[33mcommit 619f3d162d08cfaece8e03bebf5524842724df56[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jul 11 09:46:50 2021 +0200

    All Yinsh component tests written

[33mcommit f62ba3c2bd443aaf16dd250111cd5c606d834427[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jul 11 08:54:58 2021 +0200

    Improve Yinsh component

[33mcommit 8dc8bf0b08653805a64216609f51c694f9d0359b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jul 10 17:25:59 2021 +0200

    List remaining specs for Yinsh component tests

[33mcommit 56962f98b6f69663333562de735cf6eaa0c4168f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jul 10 16:55:00 2021 +0200

    Remove superfluous $localize from Pylos didacticial

[33mcommit 58a931e3549cef0a04a84fe63e30a85da14662e5[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jul 10 16:23:40 2021 +0200

    WIP Yinsh

[33mcommit 738d08a40c953f6913612ce08406f58f15e6f4b5[m
Merge: 8c2bf6b30 7fd4533c4
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jul 9 21:29:50 2021 +0200

    Merge branch 'develop'

[33mcommit 7fd4533c4a8babf805a650e1fa6e72953a772298[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jul 9 21:26:43 2021 +0200

    bump version

[33mcommit 8c2bf6b30ef2b5a48f0e1cd13e6a58a258de9ce2[m
Merge: d3be072d7 60ffcdc52
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jul 9 21:07:18 2021 +0200

    Merge pull request #51 from MartinREMY42/develop
    
    Master 17

[33mcommit 60ffcdc52ab4c684681c9b34de5baa31b620c00d[m
Merge: 6ee17d14b 740296817
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jul 9 20:31:32 2021 +0200

    Merge pull request #50 from MartinREMY42/Encapsule_fix_suicide_victory
    
    Fixed Encapsule suicide victory, enhanced six didacticial and pentago…

[33mcommit 74029681713c70fb726c3bed5de9cdad4a39b21c[m
Merge: 5bb19417a 6ee17d14b
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jul 9 20:31:18 2021 +0200

    Merge branch 'develop' into Encapsule_fix_suicide_victory

[33mcommit 6ee17d14bcb3cb93813f11722304561d1f57bc04[m
Merge: 87cb5eb2b abcf2666d
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jul 9 20:27:44 2021 +0200

    Merge pull request #54 from MartinREMY42/intermediaryPage
    
    Intermediary page

[33mcommit abcf2666d1c8df4b49850cd27834e800c8c91393[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jul 9 20:33:45 2021 +0200

    enhance english translation

[33mcommit 5bb19417a9964330454d11efb576f61482ec86d3[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jul 9 19:56:40 2021 +0200

    remove some console.log

[33mcommit 01174bf706d0e2f6b58281ec4d18ce1ae324ad67[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jul 9 19:46:53 2021 +0200

    small refactor

[33mcommit 2aa6afcfbf3da73a09efe58ab3e05a8160ea200f[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jul 9 19:43:52 2021 +0200

    added intermediary page

[33mcommit 87cb5eb2b26424f6502181a83f72d10885bfc82b[m
Merge: 0f19ca587 88b1c3d16
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jul 9 18:40:39 2021 +0200

    Merge pull request #53 from MartinREMY42/smallCoverage
    
    small code coverages

[33mcommit 88b1c3d169f33978f056cc9459fc0fd9375a9262[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jul 9 18:39:42 2021 +0200

    small code coverages

[33mcommit de9d41fcdfbb41ceec75091ffb8d2f0e2a16b37a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jul 9 18:26:32 2021 +0200

    Progress on Yinsh component tests

[33mcommit 8fc943c0ee1865af6a1347bc571d7b5a926a4032[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Jul 8 21:33:08 2021 +0200

    Fixed Encapsule suicide victory, enhanced six didacticial and pentago didacticial, fix pentago didacticial, enhanced those two's coverage

[33mcommit b6766a621b538f3dd5768e8745c58b2ee8e197b4[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Jul 8 18:45:09 2021 +0200

    Fix Yinsh rules

[33mcommit 0f19ca587415270c797937e1c98f553096ca805d[m
Merge: ca0834dcc e3ee3669d
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Jul 7 08:44:59 2021 +0200

    Merge pull request #49 from MartinREMY42/OnlineGameWrapper_fix_and_create_rematch_unit_tests
    
    Online game wrapper fix and create rematch unit tests

[33mcommit e3ee3669dd216de5c9b819c2144f9eb4eb457c1b[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Jul 6 21:54:25 2021 +0200

    fix and didacticials enhancements

[33mcommit 3c292c7fe10acbffb477cb9de0a17f72c9ec198b[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Jul 5 22:07:14 2021 +0200

    add unit test on game service and online game wrapper

[33mcommit 9b7f2f7da2ffab6485b9df2b29af3f205a4b2ddf[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Jul 5 21:38:43 2021 +0200

    Progress on Yinsh tests

[33mcommit 99804e29fd0acc5a70c556239fae2deab6f77601[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jul 4 14:35:12 2021 +0200

    YinshBoard now renders correctly, add its screenshot

[33mcommit 004077b449571b395989b1cd8092bf32030fb2e9[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Jul 1 20:44:54 2021 +0200

    Add  NumberEncoder.ofCombination, add Yinsh

[33mcommit fe050f8ad9f3f513d612c011944d806ce15074ad[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jun 27 08:29:08 2021 +0200

    Generalize HexaBoard setAtUnsafe so that GipfBoard does not need to redefine it

[33mcommit ca0834dccea8e0745c21125c8ec9235f334c70d2[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Jul 1 20:36:45 2021 +0200

    Add strict-boolean-expression to eslint config

[33mcommit 1a3659e326023058205c8e2193b039c4ebadc562[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Jul 1 19:11:55 2021 +0200

    Update images and SixRules

[33mcommit d3be072d77ceef868a8eab75efc442c94bb63de2[m
Merge: 4ff9adab7 26afae0c8
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Jun 29 07:10:05 2021 +0200

    merge conflict of Master 15

[33mcommit 26afae0c873c64d07a72ab6b5e991ff06ad71d2d[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Jun 28 19:55:27 2021 +0200

    ready for Master 15

[33mcommit 2880a97ce83b4b2ac9bc43c87c68aaf762152400[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jun 27 20:35:58 2021 +0200

    Update images

[33mcommit 6b1d80038abbb2876d4c7b2a082d21a27eabcf6f[m
Merge: 580f02087 0964f111f
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Jun 27 17:35:43 2021 +0200

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into develop

[33mcommit 580f02087243b3ece2581b2e1154b102daf6e993[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Jun 27 17:35:10 2021 +0200

    small fix

[33mcommit 0964f111fe4dc9b201628389b8f92af3cf1d45ab[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jun 27 16:41:12 2021 +0200

    Update package-lock

[33mcommit 1277789bf9f31f13259f349bb57ef366b0543ea4[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jun 27 16:33:52 2021 +0200

    Update package-lock

[33mcommit 9516d9f4919b5265818c0b920fb56e512dfb7793[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Jun 27 11:43:31 2021 +0200

    merge

[33mcommit 420a177f6176ebfdf1f04256f4b32281fc0bffa6[m
Merge: 6cf03ca08 f5c0ee2bd
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Jun 27 11:41:33 2021 +0200

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into develop

[33mcommit 6cf03ca087d9e8a217a9cc84c3d0aff45ba5cfcd[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Jun 27 11:40:13 2021 +0200

    uniformize some text for easier internationalisation

[33mcommit f5c0ee2bd410b0c009a88a0a6841f1e6884af61f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jun 26 16:54:56 2021 +0200

    Improve part-creation further

[33mcommit 6d69f195024ae92a494ba74e41aa4e15ef5f2046[m
Merge: b9ff0d191 249be477c
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Jun 24 08:17:09 2021 +0200

    conflict merged

[33mcommit b9ff0d191079cb4f6370cc72a088e6e345fd7e18[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Jun 23 21:01:51 2021 +0200

    enhance game component and rules test, isSuccess()).toBeFalse() is not precise enough

[33mcommit bc812a4af6ec8488f73d14f81e8b8306012aabcb[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jun 22 21:51:57 2021 +0200

    Improve snackbar-info style: clear font on blue is better

[33mcommit 249be477c1f5156f0fd93ffc9f0e42c989d6d785[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Jun 21 23:15:19 2021 +0200

    handleError takes a string as argument

[33mcommit 9c39599f48c98ce1acaa2c822044464e4126b266[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Jun 21 23:14:51 2021 +0200

    Don't show menu when clicking on one of its element on the phone

[33mcommit 47b4b86f1f5497c991b4a82fd2e04186c0305e73[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jun 20 18:17:14 2021 +0200

    Fix menu toggling for phone

[33mcommit 4894346e47feedf0c05d6383aece123a23a4857f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jun 20 16:48:22 2021 +0200

    Fix part-creation, hopefully!

[33mcommit 51582b5f501f80900b9da27010805edf77875a59[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Jun 20 10:21:07 2021 +0200

    Enhanced Coerceo Piece > Threat > Tile minimax at level 1; needs to be fixed for level 2

[33mcommit b86728253982741255176960f2ef50c0656ec40a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jun 20 09:39:13 2021 +0200

    Fix localization for Kamisado, add some logging to part creation

[33mcommit fdb9318d5f2be2f88f2fbfbf12704661229d4b28[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jun 19 07:51:16 2021 +0200

    Remove fdescribe/fit

[33mcommit af1310589b79e46a15f158daac698f9fb2082417[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jun 19 07:49:57 2021 +0200

    Improve part creation tests

[33mcommit a6436343a7f3d9c60be28e5a7d9b1043661a40c8[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jun 19 07:05:36 2021 +0200

    Improve part creation

[33mcommit 6bab39131711820b67cf396165833c74e1808b5b[m
Merge: ace8653b3 8d1833438
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jun 18 22:21:51 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit 8d1833438465aef8d16de6d9f51171cf1d260b64[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jun 18 21:55:43 2021 +0200

    bump version number

[33mcommit f9ae124ed28276896c35215be40570f57002f22c[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jun 18 21:53:56 2021 +0200

    Pylos enhancement

[33mcommit ace8653b3460929da15003d442dcc241070ff85d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jun 18 21:50:58 2021 +0200

    First player is random by default, and fix minimax test

[33mcommit 627beeb38b39262c275ef093d5cba5da6c5ada34[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jun 18 19:28:20 2021 +0200

    Rename warning to handleError

[33mcommit 15a953fc5b1238ec469fe91f5c5c2c3c51a81743[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jun 18 19:10:09 2021 +0200

    Mark missing translations

[33mcommit c201cc900a2b959506cb6a3b74c2f6f9298cce5a[m
Merge: bc58ced58 226cc3cd3
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Jun 17 09:47:50 2021 +0200

    Merge and add localize to didacticials

[33mcommit bc58ced581adfbbde31da06dc50374e56dcc5f85[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Jun 17 09:15:23 2021 +0200

    Prepare for localization

[33mcommit 226cc3cd372e47c2ae31014491782e770a88f9ff[m
Merge: ab155177f ac8b5d346
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Jun 15 21:50:58 2021 +0200

    Fix Rules modification and hence MinimaxTesting broken test

[33mcommit ab155177f99837cdc0e7b427aefd71b3a58d53c4[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Jun 15 18:38:31 2021 +0200

    refactored PieceThreat to use it in Coerceo new minimax

[33mcommit ac8b5d34696b4a4738cbe5c306604c49259597c8[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Jun 14 20:12:13 2021 +0200

    Update CSS for custom snackbars

[33mcommit e6e21c511f5c3f42dca9860873a33844563f2df2[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Jun 14 08:47:45 2021 +0200

    Fix failing part creation test

[33mcommit e0c7346084c9fc50a7f0809863d82680c11a78c3[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Jun 14 07:56:08 2021 +0200

    Part creation: make opponent selection more explicit

[33mcommit 91d9494b58ec7d7d4d318bb4395e9b5ed4bb54e7[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Jun 14 07:47:08 2021 +0200

    Part Creation: remember config

[33mcommit efa2c1518c9563e43abf9e07038e6abe888769d1[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jun 13 09:16:37 2021 +0200

    Introduce MessageDisplayer as an indirection to snack bars

[33mcommit 1f6e468a4ab5fbd926e9bceae6e30a544c0494f2[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Jun 12 19:17:36 2021 +0200

    merge

[33mcommit fbc9f441eeb88f434bfc728317f7883d0ffefbb2[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Jun 12 19:17:12 2021 +0200

    merged

[33mcommit d2ba16c244d98c63d14e0c39e516f2625b6d4fd1[m
Merge: 7957b51b0 28bfd3e19
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Jun 12 15:28:59 2021 +0200

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into develop

[33mcommit 7957b51b06f82d3ae241dc07fb1de690b4d1d707[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Jun 12 15:27:34 2021 +0200

    enhance kamisado, quixo, and LOA didacticials, fix some typo in some other; fixed local game wrapper AI not starting error

[33mcommit 28bfd3e198de19b8642714d54e990c248b746636[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Jun 7 14:10:41 2021 +0200

    New part creation page functionality, only manually tested
    
    WIP part creation and joiner service
    
    Joiner service tests
    
    Start working on part creation tests
    
    Improve part-creation page
    
    Fix another test
    
    Add a few more part-type tests
    
    More part creation tests
    
    Improve part creation tests
    
    Add a few more tests

[33mcommit 96af4428e0643bbd28148d9a8637d72fba602464[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jun 11 22:00:38 2021 +0200

    fix sahara, enhance toasts

[33mcommit 4ff9adab7254a8e9ffd2c8444388e8b2f6ae2cab[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jun 11 22:00:38 2021 +0200

    fix sahara, enhance toasts

[33mcommit 515ab8ca1f3fc26626728ef1db07504783d685a2[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jun 11 21:46:15 2021 +0200

    fix six; fix go and other design

[33mcommit d1040221fba3761de01fa83e76805ece6440897e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Jun 10 21:54:07 2021 +0200

    update images

[33mcommit cd140941d97c7e773c7219e32e3cef661fc8d74c[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Jun 10 19:49:55 2021 +0200

    bump id

[33mcommit 4f757f4514b68568fc7f8c383a548f5240bd1cd7[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Jun 10 19:41:11 2021 +0200

    Enhance multiple Game design, bump Sahara code coverage

[33mcommit 7bb480c5d12c9fc9bc32d50dd0a9168c0a54ebf4[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Jun 8 18:06:10 2021 +0200

    small six didacticial fix

[33mcommit 78f1db94e2911c32c0545a87af3ffbc1da100ad1[m
Merge: 614507a81 fd1c7660a
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jun 11 21:47:17 2021 +0200

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into develop

[33mcommit 614507a81dc93c65634a4a779d69b80aeddaf031[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jun 11 21:46:15 2021 +0200

    fix six; fix go and other design

[33mcommit fd1c7660ae2918355c0ec1b05dad20dc0f505058[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Jun 10 21:54:07 2021 +0200

    update images

[33mcommit 3ceb0ad8286408f8de540fe832af711f975bdc02[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Jun 10 19:49:55 2021 +0200

    bump id

[33mcommit bf510f1fb3a37d13881f60a15e79a32c997917de[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Jun 10 19:41:11 2021 +0200

    Enhance multiple Game design, bump Sahara code coverage

[33mcommit c657563690cd8d1cb3d11241fb20a587cc220cec[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Jun 8 18:06:10 2021 +0200

    small six didacticial fix

[33mcommit 94c0f76e7fce1f64249b40ff7193a84c3cd28bc6[m
Merge: 2748f3606 0759a9486
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Tue Jun 8 17:46:48 2021 +0200

    Merge pull request #43 from MartinREMY42/develop
    
    Master 13

[33mcommit 0759a94863a86c077a72abf149a9d31b6b519d22[m
Merge: cacdf14ae 8fa68a444
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Jun 8 17:41:48 2021 +0200

    merge conflict

[33mcommit cacdf14ae338a62a04184e02db2d7b964505e673[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Jun 8 17:39:52 2021 +0200

    code reviewed; tablut minimaxes enhanceds and added

[33mcommit 4d9195fa4efe6fe0371fcc2b31c8dcca81e6f63b[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Jun 7 21:57:17 2021 +0200

    Tablut Piece and Control is a beast, best Tablut IA ever seen, WIP

[33mcommit 8fa68a4440247bd4a2c973e8df85721116fa4c06[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Jun 7 06:48:35 2021 +0200

    Fix in six dida

[33mcommit aefc3ed11f7e49a06ca136056590b9f35bfbe0d0[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jun 5 19:30:38 2021 +0200

    Final fnixes in Six dida

[33mcommit ccc3bf50538e233370953f7a0dc178dd8ffd38f6[m
Merge: 5442a8df0 08ea531a9
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Jun 5 16:38:10 2021 +0200

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into develop

[33mcommit 5442a8df0574b21a0a93d04a8618b3e73c2b7f60[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Jun 5 16:37:42 2021 +0200

    small fix

[33mcommit 08ea531a947e440458de4a8640cd01021025aa59[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jun 4 22:23:42 2021 +0200

    Remove minimax testing from games shown in welcome

[33mcommit a0930885f00ae29c215cef34131626f6e2d3abc1[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jun 4 21:56:52 2021 +0200

    Six and Coerceo dida

[33mcommit 985a79e6147faa51cba27970c7730275cd108703[m
Merge: 2eff2f265 29a17caf8
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jun 4 21:35:39 2021 +0200

    merge conflict handled

[33mcommit ac572b34016242b22069b905a6364ba696f0c555[m
Merge: 99d5a1116 985a79e61
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jun 4 21:29:40 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit 99d5a1116e410c8b5972ad4b5a0dcda9b17c1f66[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jun 4 20:58:32 2021 +0200

    Fix last step of Coerceo dida

[33mcommit 2eff2f265d626203f1a3022cc79b52be2bd99f7b[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jun 4 20:55:17 2021 +0200

    Tablut Minimax enhanced; Minimax and MGPNode refactor, investigation ongoing

[33mcommit 3d816413b16beb519cc52f5045d93faeb23a2f7e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jun 4 20:50:34 2021 +0200

    Refactor PartStatus, use meaningful values instead of magic constansts

[33mcommit 29a17caf884a60c1dab3365d8395b4b2797fa22b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jun 4 18:16:53 2021 +0200

    Other refactor of joiner

[33mcommit 19eea534a9704c49cede15372924355defe72ccd[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jun 4 18:10:39 2021 +0200

    Refactor joiner

[33mcommit d41fdc79c260b05359da8271115dd63200309ea4[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Jun 3 20:21:19 2021 +0200

    Fix language mistakes!

[33mcommit dc5adc72b1087ddb2ea96afee14578db8a3ac7d5[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Jun 3 20:17:33 2021 +0200

    Big refactor of parts domain

[33mcommit 166a7b1f16f5dc81bccb201374a1864fd0c91dc4[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Jun 2 07:32:52 2021 +0200

    Improve Gipf dida

[33mcommit d2d79bdf7c4197e748ee1fde12e175714e5b2b1c[m
Merge: 03558060d a17291576
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jun 1 22:36:02 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit 03558060db36f9a8800a043988e3ef06724e752a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jun 1 22:35:02 2021 +0200

    Show time spent in minimax

[33mcommit 65ade18844caf6622fff38b1ae38d5503d86459b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jun 1 22:25:17 2021 +0200

    Improve Awale minimax ordering

[33mcommit a172915762ccbf7e86b617dd9a270fda841f24f1[m
Merge: 50dd1c971 07c80fec1
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Jun 1 20:27:23 2021 +0200

    fix merge conflict; finish coerceo didacticial adaptation

[33mcommit 50dd1c97162708166075fd4e6ad4bc4dfd04bfa6[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Jun 1 19:53:01 2021 +0200

    add a second pylos minimax to compare the future enhancements. Enhance coerceo didacticial and didacticial game wrapper

[33mcommit 07c80fec11727423f5105db64fd70d0ab7e661da[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jun 1 18:15:38 2021 +0200

    Improvement of Awale and Epaminondas minimax ordering

[33mcommit ea0e25c99554a155f18187c9ae59bd26e35b8827[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jun 1 08:41:34 2021 +0200

    Update Awale & Coerceo dida

[33mcommit 83727e6dc4dc7b2adb3b52f078b79ba7c9fdbeaf[m
Merge: 9bedd2a49 facc089b3
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon May 31 22:23:59 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit 9bedd2a494265af0d83720253b8646525ada3ef7[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon May 31 22:23:36 2021 +0200

    Add reversi minimax tests

[33mcommit facc089b37d51c81c316cc262d56596f2501debe[m
Merge: 05918c755 2b0742c9c
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon May 31 21:42:45 2021 +0200

    merge

[33mcommit 05918c7559599a76f49f55472c3fab2733562999[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon May 31 21:38:51 2021 +0200

    refactor six, all didacticials

[33mcommit aeea987d894d50aea2aa0709678ca15d974254eb[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon May 31 21:21:43 2021 +0200

    Sort moves in Reversi and Kamisado

[33mcommit 2b0742c9cfb80f0cbb60544b1fe553cc827d7261[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun May 30 18:43:39 2021 +0200

    Update README

[33mcommit e0958fb9f2fadd481f4b5c16846e167d007cad75[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun May 30 16:31:31 2021 +0200

    Minor refactor of alphaBeta

[33mcommit 2100be1a0f619bb3b77da1d69b39097fc11ce071[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun May 30 10:20:00 2021 +0200

    Sort moves in Dvonn minimax, store the number of created nodes

[33mcommit b497fa40b16ee87c236425d9b3ed7aa84171c639[m
Merge: e3aa18e8f e6fa7a83f
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat May 29 17:59:27 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit e3aa18e8fb7d0a5dcc98a20074b6a5df321f738e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat May 29 17:56:07 2021 +0200

    Fix server-page test, improve dvonn minimax ordering

[33mcommit e6fa7a83fcea4c9dabd63b4d3bb9006f29b8fbfd[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat May 29 13:43:40 2021 +0200

    small fixs

[33mcommit 2748f36062f813dbdd3eb133f147a51b130b0866[m
Merge: dde7e828b e6fa7a83f
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sat May 29 13:43:18 2021 +0200

    Merge pull request #42 from MartinREMY42/develop
    
    Master 12

[33mcommit 812823a1fd835db018897be4df427a50b8a43f36[m
Merge: 3b76ef3e2 3be1f6dd5
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat May 29 13:30:20 2021 +0200

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into develop

[33mcommit 3b76ef3e2494dfa825b1525ff3da9f371153b33a[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat May 29 13:29:40 2021 +0200

    fix pentago encoder

[33mcommit 3be1f6dd510565cd4567f0c7cd4e2e02fcc1bf81[m
Merge: 72c89ed51 54fd9866e
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri May 28 23:06:08 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit 69ed01d5d9bfee104e0c8883eedbd5a92773cab5[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri May 28 22:59:10 2021 +0200

    recheck

[33mcommit 72c89ed5192a5ec7bf26a41751c28ce44c3c7776[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri May 28 22:53:38 2021 +0200

    Add fakeAsync to most (except one) tests

[33mcommit 54fd9866edb5bf9683390727a8818288cc829047[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri May 28 22:52:26 2021 +0200

    add encoder to pentago component

[33mcommit 6a1792ad15cc7039225644c83d0814870a1e30d9[m
Merge: a8a4568f8 db9924982
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri May 28 22:36:37 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit db9924982261ec31aad23cf47a1ffd490d3307a8[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri May 28 22:13:38 2021 +0200

    Create pentago encoder

[33mcommit a8a4568f8401a0942921dce5c9cfb7a0c55d44df[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri May 28 19:56:29 2021 +0200

    Minor changes

[33mcommit 07bca1c0b0f51a8e2cef0ef75ee8659e48739161[m
Merge: 89e32ee8f 8685710df
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri May 28 19:18:33 2021 +0200

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into develop

[33mcommit 89e32ee8f5c628449b5b0b5f8fe4c26a04d0867c[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri May 28 19:17:58 2021 +0200

    enhance six

[33mcommit 8685710df94ba2a4eb7bb5f702a24859c31fae3c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri May 28 08:39:25 2021 +0200

    Remove some linting errors

[33mcommit 23f87f9c8a865db589678652a2b3b227376c50c9[m
Merge: 19d231d0f 39775a7fe
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri May 28 08:18:08 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit 19d231d0f28a383cf3f2ae52ffbdcbd59ac8cb69[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri May 28 08:17:37 2021 +0200

    Highlight all moved pieces in Siam

[33mcommit e52faaeb6a086ff5b683fad3ef8143230bee0b39[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri May 28 07:07:21 2021 +0200

    Improve script to update images and update the images

[33mcommit 39775a7fe09724baab10e01d376dcf6697134db0[m
Merge: fddd8f842 a01f5f7dd
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu May 27 22:09:30 2021 +0200

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into develop

[33mcommit fddd8f842267ac2e742f6f57cc11020fbf8747be[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu May 27 22:07:40 2021 +0200

    small pentago minimax enhancement

[33mcommit a01f5f7dd2d103f5088eed28900af2007cd138d4[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu May 27 21:35:49 2021 +0200

    Forgot to add Rules.spec.ts

[33mcommit 412e946d68def5c014f584027abdc07852ce67a1[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu May 27 21:35:26 2021 +0200

    Update getBoardValue and getGameState

[33mcommit 878429020fdf1e506edb69e78d3a32b96e6d8a49[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu May 27 07:30:50 2021 +0200

    Add expectToBeVictory test function

[33mcommit 2547bfa7db7308438f2ec3ff09d58780274e883e[m
Merge: 65c6ee49e 454c94434
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed May 26 21:32:02 2021 +0200

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into develop

[33mcommit 65c6ee49efe1913439dfb8f3b476bb1244d76a7a[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed May 26 21:31:32 2021 +0200

    Enhance details on didacticial game wrapper and finish pentago

[33mcommit 454c94434a69e947045bb85765fa7fdb13173a63[m
Merge: 8dc4cd8c6 9b5c7cc30
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed May 26 07:14:13 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit 8dc4cd8c6239fcb6467b39ac5f36f32965723fb8[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed May 26 07:11:58 2021 +0200

    Improve welcome component tests

[33mcommit 9b5c7cc30ace316b5000c32a1f195cdc17df5154[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue May 25 23:54:54 2021 +0200

    advance on pentago coverage, functionnality apparently finished

[33mcommit cc5910b4ff435b2d39219a4e1a3041889aba0bff[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue May 25 22:19:48 2021 +0200

    Fix service tests

[33mcommit 3755db196e4e4c6d82bb0070bd81e8352166c89f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon May 24 22:37:11 2021 +0200

    Refactor some service and online parts creation

[33mcommit 74e287e9e13360e304d3ad39f16fc0bc1ac2d2fb[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon May 24 21:46:45 2021 +0200

    merge and update index.html

[33mcommit d593e6c2a27301c312691e9eea7b46be95428e97[m
Merge: 972c70ad5 c55200b08
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon May 24 21:43:27 2021 +0200

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into develop

[33mcommit 972c70ad5e71db607c5f644325e7c81b90fb2b78[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon May 24 21:43:02 2021 +0200

    add pentago component and rules, work in progress

[33mcommit 9c2c6475ee32ba8133f1e9e967ff78ee5034752e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon May 24 13:50:55 2021 +0200

    Part creation button on home page now works

[33mcommit c55200b0890d88a950368d27952ee2cefb062103[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon May 24 10:43:19 2021 +0200

    Improve coverage of getGameStatus

[33mcommit 1b785c29d102778ad3b7ddd9853d8bf727b2845d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon May 24 08:21:13 2021 +0200

    Fill in missing implementation of comparableEquals, test it

[33mcommit 9ef91807f9955b777944b3263b71ee3f460c6b83[m
Merge: 550859c20 2e0cd2ae8
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun May 23 22:43:44 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit 550859c204b9df2f95709c0652b6ac546365fcf7[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun May 23 22:43:23 2021 +0200

    Fix welcome masonry on mobile

[33mcommit 2e0cd2ae8b6b70cf75d331d10447f1ddb1723448[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun May 23 20:30:30 2021 +0200

    fix tests

[33mcommit 6d50b51dad00b233fde4f898a1cb94b8c7b871db[m
Merge: af570b53b 8d2532e34
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun May 23 20:10:47 2021 +0200

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into develop

[33mcommit af570b53b19f27e9f46784cabe19f101c1b3aadd[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun May 23 20:10:20 2021 +0200

    Start pentago's implementation

[33mcommit 8d2532e34db9a3bda948e2f11e2fdef2a1c5c550[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun May 23 13:41:27 2021 +0200

    AI is proposed to play when restarting local game

[33mcommit fd579d47f84ae53f4dbde5c1557dca50bb16eb0a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun May 23 09:47:36 2021 +0200

    Fix game URLs in welcome component

[33mcommit d2f61ced457ae7594121fe274ea18d4c589abba5[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun May 23 09:14:39 2021 +0200

    Minor style improvements, fix login tests

[33mcommit 5c68ab74e81d80ebd0157f7149631b3ea3f15901[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun May 23 09:05:54 2021 +0200

    Clean login component

[33mcommit 332ac6c6f870dfa2dfc158fade1783a0fcb2f363[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun May 23 09:04:49 2021 +0200

    Improve eslint settings

[33mcommit 7fbe2e81b56165714072bb40c29b98c7f88fca93[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun May 23 09:03:24 2021 +0200

    Game list on welcome page

[33mcommit e23f6c8c34fa6c79a5055770daac41d7717e05c1[m
Merge: ba730cbbd cd1059809
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat May 22 09:03:04 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit ba730cbbd39e586c6e1804c2c99eecf49878010e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat May 22 09:02:29 2021 +0200

    Remove useless buttons in home page

[33mcommit 1350cfd1e4d0d7037e10bfa2aa3f3ac0293dd874[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat May 22 09:02:11 2021 +0200

    Clean package.json

[33mcommit cd10598095ba4321a331df2a780442e51d35504e[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri May 21 23:27:14 2021 +0200

    small fix

[33mcommit dde7e828b41108cc51e5147ce65f1cb6ac9d8440[m
Merge: 56f9118f9 cd1059809
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Fri May 21 23:21:49 2021 +0200

    Merge pull request #41 from MartinREMY42/develop
    
    Master 11

[33mcommit f2e283fa61e51c4159fa0a1030088533c5a7768b[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri May 21 23:19:21 2021 +0200

    remove some lint error

[33mcommit 1663c9584a2c896b8b64b8c883f067fe6fffa27b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri May 21 22:28:58 2021 +0200

    Revert to Angular 10

[33mcommit 39e059f03d9fbe5510711e35a7f98bf250df975e[m
Merge: 12c02247f 0a666c545
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri May 21 20:10:13 2021 +0200

    merge

[33mcommit 12c02247fe53d72fe1f8f708b5f2bb1682d49fd8[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri May 21 19:53:59 2021 +0200

    Refactor BoardDatas, create second Epaminondas IA, test some MGPNode case

[33mcommit f9dce50c734dcff714fab06c848ec461163c7091[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu May 20 23:17:06 2021 +0200

    Update dependencies

[33mcommit 0a666c545f31c46cf2437371746f27de893fcaae[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu May 20 22:42:48 2021 +0200

    More inconclusive epaminondas minimax experiments

[33mcommit 10930e86d58bc6ef689bf72266a4cc5c33f270f0[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu May 20 20:52:55 2021 +0200

    Simplify Dvonn minimax, get full coverage

[33mcommit b7935f01b9e47d2b25a3a828dc5205ae7e2cb469[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu May 20 20:13:41 2021 +0200

    Preliminary testing code for new minimaxes

[33mcommit e998ac87f903fe4f046cacc5f00296507a492ef2[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu May 20 18:37:47 2021 +0200

    Various changes

[33mcommit eb1de61e2febe89f64e3d22eab7edffbd88c4b79[m
Merge: 5d3ad8cf2 87ffdbcc5
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed May 19 06:55:44 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit 5d3ad8cf2239d1aba19768729a1548add05b0f91[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed May 19 06:48:50 2021 +0200

    Update minimax testing tests

[33mcommit 87ffdbcc5fe0a93b6a05afa3534ad158e87139a8[m
Merge: 684be718b 957d6ac30
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue May 18 21:37:50 2021 +0200

    merged

[33mcommit 684be718b8e4884835a1bafd6fff9881f9c313c6[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue May 18 21:30:38 2021 +0200

    Create EpaminondasPositionalMinimax, refactor GroupDatas

[33mcommit 957d6ac3010f138a3e84a9a72f8478cd291e23dc[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon May 17 18:33:37 2021 +0200

    Minor design improvements to game wrappers

[33mcommit e5d40b0298cc5dec8a40c510a415cc321e6a4706[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon May 17 07:48:40 2021 +0200

    Update quarto component: fix piece in hand and victorious color

[33mcommit febed1cd426a741720fa91fb3e9e36ff196ad6f5[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun May 16 22:23:35 2021 +0200

    Fix second player options in local game wrapper

[33mcommit 3fde55a0150a863a36d3b8b3a821a719a38e4099[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun May 16 22:21:02 2021 +0200

    Reduce quarto stroke

[33mcommit 0a57c4272cd9b95c8ab36b692fb1c40f68ca222a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun May 16 22:20:51 2021 +0200

    Fix local game wrapper

[33mcommit 0ee7802843164e3174d803c7b4f7e334001053a1[m
Merge: a6256aa7b 9cf824345
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun May 16 20:50:31 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit a6256aa7b300c53c74cd0dc6b08b0bb99c25c66b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun May 16 20:49:57 2021 +0200

    Update siam arrow, change primary color to blue

[33mcommit 9cf8243451b9ff476f5fa36dc2ec3ff8a1112c17[m
Merge: e3e808110 51616e761
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun May 16 19:54:33 2021 +0200

    merge and make possible multi minimax

[33mcommit 51616e761ca75330cfc1f5e9ea294d1713a97e6c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun May 16 18:36:44 2021 +0200

    Remove mat-button from chat component

[33mcommit e3e808110aac6fff0dd30a1378b4992bebf2c964[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun May 16 15:55:21 2021 +0200

    replace isGameEnded by getGameStatus

[33mcommit 268de807c4ef9ce11bf470dc20721b13dd6ee786[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun May 16 11:23:36 2021 +0200

    Improve coverage of pick-game-component

[33mcommit 72bc86d58be538494c218d425620fc4252edb924[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun May 16 11:11:11 2021 +0200

    Improve server table

[33mcommit 121f41eaabf580c93b36ad24b956ffc90184cc95[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun May 16 08:24:27 2021 +0200

    Random improvements

[33mcommit b2af5e4d2f5c4c968c27416d96c9e25fbaa76be1[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat May 15 19:42:13 2021 +0200

    Improve siam a bit

[33mcommit 505fc751eaabab8feab1f7c4cf357ab0b992948e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat May 15 19:13:41 2021 +0200

    Improve testing of header

[33mcommit c743a552ff3dfc42d3ad924af20fb840b1ed4cf5[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri May 14 22:33:59 2021 +0200

    Quarto: highlight winning line

[33mcommit ccb98fe77e79cf60e325fd6e88fb84d839899884[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri May 14 19:58:37 2021 +0200

    Improve didacticial component

[33mcommit 7cccbd6a700d2b012bc34fc204135732b2c56ca6[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri May 14 19:48:31 2021 +0200

    Update dvonn component

[33mcommit 7eeb650a8137984817761fd2b5cfe992fd6ff248[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri May 14 19:36:45 2021 +0200

    Update quarto component to use SVG

[33mcommit 6ba437dcefb6a8c3a652d87821fca4028464b686[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed May 12 23:16:17 2021 +0200

    Design improvements

[33mcommit a6d64a232961560482eed19f23480ece486b4b8a[m
Merge: d63da900f caf292b3b
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu May 13 19:49:11 2021 +0200

    wip, fixed awale bug, added P4Minimax test, diminished failed tests

[33mcommit d63da900f89bf9c9dcd8b15cd55310e4570b56ad[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue May 11 22:10:36 2021 +0200

    Huge MGPNode refactor, WIP, Instable, Failing Tests

[33mcommit caf292b3b80e73cc41bba0db8b916b22d4714d4b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue May 11 20:01:49 2021 +0200

    Various game improvements

[33mcommit acd2fd91309f86cd8e395fda1440afac39bd5126[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun May 9 10:46:23 2021 +0200

    Improve quixo design

[33mcommit 111e980c4a5ce120e4416d2876fd7e964d4a02cf[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun May 9 09:01:37 2021 +0200

    Improve quixo arrows

[33mcommit b7bec45db9b87e2ee5deca046c9c2269dfa5dcb6[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun May 9 08:33:12 2021 +0200

    Improve siam view

[33mcommit 56f9118f94c9702f7d11dc7a6af367db745a6b84[m
Merge: da184c024 386e064d5
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Fri May 7 20:55:22 2021 +0200

    Merge pull request #40 from MartinREMY42/develop
    
    Master 10

[33mcommit 386e064d54ddf2dbe664bc25d64ea21ea7f70e20[m
Merge: 9e45c9bb0 a8a66aa5a
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri May 7 19:31:21 2021 +0200

    merge

[33mcommit 9e45c9bb0b4df679858102c3bd5691c086690599[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri May 7 18:57:03 2021 +0200

    Moved some file to reduce karma report size

[33mcommit a8a66aa5a5d0541298d060d40c1161f982066dae[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri May 7 18:27:47 2021 +0200

    Improve kamisado, gipf, and dvonn styles

[33mcommit c6e051b189214d135655d9596a40f4421c0e1ac1[m
Merge: 3c1187980 cebc4ca16
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri May 7 07:57:22 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit 3c1187980f5c7f88e87877cf7b6ae93bd11fed46[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri May 7 07:54:29 2021 +0200

    Adapt most of online-game-wrapper.quarto tests to use test utils

[33mcommit cebc4ca165a98d1565a393df6c7d2cb0ce5429c3[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu May 6 22:02:11 2021 +0200

    remove some more line to karma coverage report

[33mcommit f9b54a49a7acd5d5dd100cd803ef39ce3df50d2a[m
Merge: 73621b34c 0c293ff76
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu May 6 21:42:57 2021 +0200

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into develop

[33mcommit 73621b34c2f3e631266d07c4d34970ab45f6a74e[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu May 6 21:42:34 2021 +0200

    remove some line to karma-report

[33mcommit 0c293ff76acaa14497cf44a17fcb759cd9e19ea7[m
Merge: ee9d45643 5751aade0
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu May 6 21:27:19 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit ee9d4564386dca2c9fb499d028243716acb0f71d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu May 6 19:58:14 2021 +0200

    Simplify tests of some more components

[33mcommit 5751aade0fcb8178418a3561922ade09672689f2[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu May 6 20:28:12 2021 +0200

    removed 5 line from karma-report

[33mcommit 5ae10f77efa1c74b73826dbe74bade40432e2123[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu May 6 20:16:22 2021 +0200

    merge and update 'version'

[33mcommit 88613a7efd55149127984e3ddff2ca6ff0470cff[m
Merge: 05d07e275 c5119d6fa
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu May 6 20:11:19 2021 +0200

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into develop

[33mcommit 05d07e275b30a577a9dadc807d4422024cdafd9d[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu May 6 20:10:48 2021 +0200

    Six enhanced, some details finished, minor modifs as well

[33mcommit 41d37e29b7ea5b91b74a0df29723e4e1da9d9a87[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu May 6 19:03:56 2021 +0200

    Add cyclomatic complexity to eslintrc

[33mcommit 8fa4a612683f0008b1f41dc8b455d0f5b667b9e6[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu May 6 19:03:46 2021 +0200

    Refactor more tests

[33mcommit c5119d6fae68068ef441dea7f0b409f8df8f39a8[m
Merge: b17123125 31537a73c
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed May 5 22:36:31 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit b1712312534d0a89a29da47325dbeb0667c77b88[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed May 5 22:34:19 2021 +0200

    Refactor ComponentTestUtils

[33mcommit 31537a73cf8db363d84fbbe66e6bfc67ceb4aa4c[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed May 5 19:47:06 2021 +0200

    update karma conf lets aim for 91% branch coverage now

[33mcommit f40ce8aa8d4c5ec0b75fff329dbe080413c42c69[m
Merge: a5b789d9e ab09c75ab
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed May 5 19:40:34 2021 +0200

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into develop

[33mcommit a5b789d9e9878387d5a2c5c485900c22037a5491[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed May 5 19:40:04 2021 +0200

    Minimax modified to become a real alphabeta pruner

[33mcommit ab09c75ab41b838904ae5a03524d2d668f40db1c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue May 4 19:58:21 2021 +0200

    Update LOA rules tests

[33mcommit 859b7d587c82007b95ef135806e8e95d0724a549[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue May 4 19:53:57 2021 +0200

    Big test code refactor

[33mcommit d55ca358cb957db948ff8fa422b51bd62dd99109[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue May 4 08:44:39 2021 +0200

    Refactor AuthenticationServiceMock

[33mcommit 188cb5f4d78d3f62a91661022770a7f287a2b724[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon May 3 08:40:03 2021 +0200

    Don't use RouterMock anymore

[33mcommit 3b0cde5f73c3dcb7dc6659e48a9558efdfbdb1d3[m
Merge: d73e07815 0d3b64ea4
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun May 2 22:46:11 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit d73e0781514307119c18f16e4d552c01cbc9a332[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun May 2 22:45:46 2021 +0200

    Refactor requests

[33mcommit 0d3b64ea4ec936019814a581cbc5e0556f3fb6e8[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun May 2 22:04:30 2021 +0200

    continuation of the files move, now the 18 games coverage are grouped in only 18 folder, hence in 18 lines in the coverage report, which looks great

[33mcommit 274cf97c99f34f2d2dcb6d8c10db122a99bee0b4[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun May 2 21:26:55 2021 +0200

    big files moves, more to come for game components absorption by /games, minimaxes enhancements as well in coerceo and epaminondas

[33mcommit 4303312e1da2b01494632100f0c6ac4ea1fe1fbd[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat May 1 08:52:55 2021 +0200

    Remove dead code: MGPRequest was not used

[33mcommit e71e3974962e0cba952bb2518921e26c1007a5bc[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat May 1 08:52:33 2021 +0200

    [loa] Remove useless updateBoard call in component test

[33mcommit 8f4c5d88337e59bac30657ce20c171c8f69640f7[m
Merge: 86eb1a471 e2ee4ff41
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat May 1 08:29:52 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit 86eb1a4716d69772e9154141807aae596a932770[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat May 1 08:29:27 2021 +0200

    Update LOA didacticial

[33mcommit 9da6bb52502ebf6a86a71c59a69407ba5d7d39af[m
Merge: 393f61bc4 a77177093
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat May 1 08:29:11 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit e2ee4ff4194b93eeaa8e1b8771aee024b7b20161[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Apr 30 23:19:17 2021 +0200

    resultingMove and resultingSlice removed, only a slice return on applyLegalMove

[33mcommit da184c024190566c3547ec214625296b37bb15dc[m
Merge: c28c2940b e2ee4ff41
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Fri Apr 30 23:14:18 2021 +0200

    Merge pull request #39 from MartinREMY42/develop
    
    Master 9

[33mcommit 393f61bc445110a21c56b3ca5feebecbde8c183b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 30 22:55:42 2021 +0200

    Add "propose draw" mechanism

[33mcommit a771770930f72bf5ca6b74e70694591664dcc3b9[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Apr 30 19:28:14 2021 +0200

    MGPNode modified, Six refactored and enhanced, utils tests added

[33mcommit 9f8e46643462f7bb21206da0e6ded5ebf1216d3c[m
Merge: 694212c36 e4e1f91c9
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Apr 29 10:13:39 2021 +0200

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into develop

[33mcommit 694212c36e71a8a91a104b58ffb6f69f037ebb8d[m
Merge: 23aa8717c 3d5daef88
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Apr 29 10:13:17 2021 +0200

    Six AI adaptation in progress

[33mcommit e4e1f91c970a5b74f3b02cc58868cb2ab6f609a1[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Apr 28 22:39:48 2021 +0200

    Implement Comparable for Player

[33mcommit 34d8397a34aa2f3ec999ad9a46838c1be67356d4[m
Merge: 469ca5433 23aa8717c
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Apr 28 22:29:50 2021 +0200

    Merge and remove travis

[33mcommit 469ca543306e574655636af5c4df3d5942f3de96[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Apr 28 22:27:54 2021 +0200

    New game: Lines of Action

[33mcommit 23aa8717c212db038057869c91c4abd9672d34e4[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Apr 28 20:10:19 2021 +0200

    Refactoring of comparable

[33mcommit 3d5daef88f0445d5815ee8ec9b401569fd8465e1[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Apr 28 07:21:29 2021 +0200

    wip

[33mcommit b74ca3bd784a5ab9e491f28783a5bde735ec2b6b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Apr 26 22:13:19 2021 +0200

    Remove hash from URLs

[33mcommit e8c7c7c51b96c906815e30e5dc3653d5ef077fb6[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Apr 26 20:26:47 2021 +0200

    Six Minimax enhance, about to make him implement AlignementMinimax for generalisation

[33mcommit 60fd9ab5ecf12ce10cbb570c1e4ba6a38f00b78f[m
Merge: b76c4c9b1 c28c2940b
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Apr 24 10:49:37 2021 +0200

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into develop

[33mcommit b76c4c9b1227e3fd083933f54c199d08401f5fe0[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Apr 24 10:49:08 2021 +0200

    Guards enhanced, now they should work correctly

[33mcommit c28c2940beca28f9ff49f34dd30901cd686a5294[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Apr 24 00:07:54 2021 +0200

    Rework welcome page

[33mcommit 02812a6606e08943449ac6ff913aaf7ccca10f8e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 23 23:37:31 2021 +0200

    Buttons

[33mcommit 97fe0581d1fe35a0da4fe4e1a435e1d28d23c993[m
Merge: f6268b6a9 4b9c6b6c1
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 23 20:18:34 2021 +0200

    Merge branch 'develop'

[33mcommit 4b9c6b6c1e80f1a08bfee7381b60a0ea387f321a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 23 19:45:19 2021 +0200

    [actions] Update package lock

[33mcommit 6c0890b159ea4490d1835ffd9f48d206af0908c6[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 23 19:42:49 2021 +0200

    [actions] No optional buble

[33mcommit 269451954a0e715595c73b10f8120c935e3b8e85[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 23 19:40:36 2021 +0200

    [actions] Use npm ci to setup dependencies

[33mcommit 100af7dbb932deff9cbdde76cb37975d070cec64[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 23 19:39:20 2021 +0200

    [actions] Remove cache

[33mcommit e705961e17ee7be50b68d9bb12642d4c96549cde[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 23 19:37:49 2021 +0200

    [actions] Update cache

[33mcommit d1fd884b7b44e472f07cae9e1630148bb4b54cdc[m
Merge: 662575192 f6268b6a9
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 23 19:36:35 2021 +0200

    Merge branch 'master' into develop

[33mcommit 66257519261eee99107ed9deb4929aec418ce56b[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Apr 23 19:34:12 2021 +0200

    merge

[33mcommit efd098d90bb3aab6cef4c74a41e5b8e0328b9859[m
Merge: 66925e1a5 0aec152d9
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Apr 23 19:26:12 2021 +0200

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into develop

[33mcommit 66925e1a599055fb8f0f252ca8631ca0f0096d96[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Apr 23 19:25:58 2021 +0200

    removed logs

[33mcommit 0aec152d960e7af64716a7bc636cdf92c73f65ef[m
Merge: 09f8b5e29 77be9c7d0
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 23 19:14:20 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit 09f8b5e299da063010aca5ddabc00eb748726691[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 23 19:13:44 2021 +0200

    Update bootstrap to 5.0.0-beta3

[33mcommit 77be9c7d0e06ac7ab349e65ef1067df3a3446c55[m
Merge: bfb2af098 0001d424c
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Apr 23 19:12:46 2021 +0200

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into develop

[33mcommit bfb2af0983da18b8882c1c70cf5b2d61e6e8cefb[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Apr 23 19:12:21 2021 +0200

    No game test use 'html-method' (onBoardClick, choosePiece...) now

[33mcommit 0001d424c2b2c1cb8b7d929b91b4089e20369deb[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 23 18:53:32 2021 +0200

    [actions] Fix matrix

[33mcommit f683673b99f36008b81f64a3e6d9dd93fd040b47[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 23 18:50:23 2021 +0200

    [actions] Update

[33mcommit fe88a60f11f6e12ac0f42b7094f3e610182adfb6[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 23 18:49:46 2021 +0200

    Use ComponentTestUtils in didacticial

[33mcommit 1c8a14b707f7fad5bb27063000676748816a0095[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Apr 22 22:28:14 2021 +0200

    [actions] Fix master-pr

[33mcommit a867b33ba34192d521a722f48cc7f46ea23bf185[m
Merge: 7a56d9ef2 52e6a3f6e
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Apr 22 22:26:46 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit 7a56d9ef214ff309894a7ac053556cd8e0ba622a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Apr 22 22:25:46 2021 +0200

    Store fonts locally, avoid any external CSS dependencies

[33mcommit 52e6a3f6e0b0c9dab5555e86fdeabfff016b6621[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Apr 22 20:58:07 2021 +0200

    merge

[33mcommit 63f9c2e1ae2506fd877d7a3a612e620f4f9de486[m
Merge: 1d4815da0 921b7abe2
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Apr 22 20:54:19 2021 +0200

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into develop

[33mcommit 1d4815da003281320b9cea0e73b7928f0ae0eeda[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Apr 22 20:53:51 2021 +0200

    guard enhanced; authentication service tested and better used

[33mcommit 921b7abe242167b8482f939950252f324a91b5ba[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Apr 22 19:01:50 2021 +0200

    Adapt other component to use new test utils

[33mcommit 38c9d811c656ef7fd8474dea44d97ef5f47f84e7[m
Merge: 73166adae 9caea22b4
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Apr 21 22:47:27 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit 73166adae5e8e2f1381ee53d4045b3d4ac29a0f2[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Apr 21 22:47:00 2021 +0200

    Adapt epaminondas and awale to new test utils

[33mcommit 9caea22b4d4372ec132216a69392e33dda0f9b63[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Apr 21 20:42:35 2021 +0200

    merge

[33mcommit 556a6962d60a4a85dd1d932712d5793ec3878b33[m
Merge: 5b0ea6f6b b3cbb2abc
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Apr 21 20:38:25 2021 +0200

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into develop

[33mcommit 5b0ea6f6b83e9481db92bc129edce19ad95a1fc7[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Apr 21 20:38:00 2021 +0200

    CountDown visibility in danger time now work; part creation end of handshake enhanced but not quite finished

[33mcommit b3cbb2abcae6e9c1fa657d5f1eafefa64adc4ff6[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Apr 21 07:47:10 2021 +0200

    [coerceo] Use new TestUtils

[33mcommit e1cd1877e2930388111fdd532c9fb3ee7ddf18b3[m
Merge: 66822461f 878aef79b
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Apr 20 22:21:07 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit 66822461f2fb30c920a20c5f9434974d7db8ae80[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Apr 20 22:20:18 2021 +0200

    Update TestUtils, use it for Awale

[33mcommit 642f2aca13be016bbec9c65069f3a7d68a110e0a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Apr 20 22:13:48 2021 +0200

    Remove bootstrap link from app html

[33mcommit 951f48714c1eac447b287c1cb94eaddecc693e9c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Apr 20 22:13:35 2021 +0200

    [actions] Correctly install dependencies

[33mcommit 878aef79be1ef63b8d7956028df7dfd316a91ed0[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Apr 20 19:12:31 2021 +0200

    merge and npm install

[33mcommit 1f1ad48ade9ff3449901b47bcff80bc8418fadfc[m
Merge: 698216c3f f3d6aeb00
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Apr 20 19:10:36 2021 +0200

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into develop

[33mcommit 698216c3fafd9dc6a87293cf3edbeba6bebcd297[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Apr 20 19:08:05 2021 +0200

    PartCreation enhanced, online game timeout tested more

[33mcommit f3d6aeb0049eff2bd1a94a169119f15dec54d50e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Apr 20 10:31:07 2021 +0200

    [actions] Fix base href

[33mcommit 27b1fcd2aebb2c3c4a858a0c05abbe76fcd4bc29[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Apr 20 09:38:45 2021 +0200

    [actions] encrypted file missing

[33mcommit f4e661abfdc5e46e036158f5311c6fb36d021db0[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Apr 20 09:26:38 2021 +0200

    [actions] Missing firebase config

[33mcommit d807a0599d228599d5577cf4a1d74f1dd39cace7[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Apr 19 22:10:43 2021 +0200

    Update package-lock.json to hopefully fix CI dependencies

[33mcommit 20cb8f376aa0c3eec3932ef7568a903491f53d43[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Apr 19 22:05:52 2021 +0200

    [actions] Try to use npm install instead of npm ci to fix dependencies

[33mcommit 5d181175f52b8664da5878783fea3341fbec37bc[m
Merge: 24bee9786 489c2a14f
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Apr 19 21:58:05 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit 489c2a14fb69a99fda66b4b08f7e4d3472aef59c[m
Merge: fe281fb79 562935659
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Apr 19 21:23:38 2021 +0200

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into develop

[33mcommit fe281fb795577380397e4cf77b8d93ae2e8e1a93[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Apr 19 21:23:12 2021 +0200

    Joiner and chosen player in part creation leave now without posing problem, any player leaving/disconnecting in game is now noticed; test to fix

[33mcommit 24bee9786501d887050a9e0a57c63d1d609a02c1[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Apr 19 20:58:35 2021 +0200

    [actions] Setup appropriate test environment for CI

[33mcommit 562935659a469d5529231284947ae9cbb0cd05bb[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Apr 19 19:20:33 2021 +0200

    [actions] Disable unneeded npm flags

[33mcommit a2ed487098e2aea9a0c8d33aa963127ef149f076[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Apr 19 19:17:26 2021 +0200

    [actions] Fix npm test action, disable travis deployment

[33mcommit 7e091f1c8656d7b0ace01daec22db316ef1c4ad3[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Apr 19 18:47:55 2021 +0200

    [actions] Typo fixed, getting there...

[33mcommit 90166eae9fec638805c893fee519384c2cd7d038[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Apr 19 18:46:35 2021 +0200

    [actions] Missing key parameter for cache action

[33mcommit b6851b408a9af1fadc16a7386544736650d280bb[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Apr 19 18:41:59 2021 +0200

    [actions] Update actions

[33mcommit a5f426b9ca895cc480796434844af49d2ff75be3[m
Merge: b7c85ee69 2211f3b95
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Apr 19 18:39:52 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit b7c85ee69b3b7938bce44d460c99be337269f552[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Apr 19 07:31:53 2021 +0200

    Add github actions

[33mcommit 2211f3b9504a62b73a4e896091f0b163a61ebcf9[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Apr 18 20:46:31 2021 +0200

    merge

[33mcommit ea63dd0adb6b7a463574f78b108b95b88737b104[m
Merge: cfa37ce14 ae8ccce7f
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Apr 18 20:42:48 2021 +0200

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into develop

[33mcommit cfa37ce14c8b271681237ef5c063aa3812751dfd[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Apr 18 20:42:28 2021 +0200

    Seeing when a player is offline in game now possible

[33mcommit ae8ccce7f9226524a40a89d9be53700faa708e14[m
Merge: 95d376ae9 bf3bc7204
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Apr 18 19:28:50 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit 95d376ae9f50de61d705758a6297523da0180739[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Apr 18 19:27:41 2021 +0200

    [dvonn] Update tests

[33mcommit bf3bc7204b50da978b072eb660ee5809c0bee46c[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Apr 18 15:13:59 2021 +0200

    merge and small fix

[33mcommit a8ece917091d7284f22b43b26552f5eb6a3c4f76[m
Merge: 20e79fc04 4ef847d52
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Apr 18 15:08:29 2021 +0200

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into develop

[33mcommit 20e79fc04332b1380726f722ead35690851ca7ad[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Apr 18 15:08:00 2021 +0200

    Timeout endgame fixed; timeout proble linked to takeback as first turn fixed; take back request now red

[33mcommit 4ef847d52a3835a2a8b64278d740ee6d5cbe84ea[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Apr 18 09:06:34 2021 +0200

    Fix Six test, removed useless Dvonn test

[33mcommit 799761512677edb9a3ff6dcef7ee2a9ec155a605[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Apr 18 09:00:18 2021 +0200

    [six] Improve view

[33mcommit 6c02cf08b622d7f1dc8d5b6e3eca473536a65c8d[m
Merge: cc493d326 bc1389b55
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Apr 18 08:28:51 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit cc493d3261f82068bed4cee69841eeef8560c1c8[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Apr 18 08:27:29 2021 +0200

    [test-utils] Refactor and use in Dvonn

[33mcommit bc1389b55d060a1a94b790ceb5ece8ffbbeaa4ad[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Apr 17 14:02:12 2021 +0200

    Restar game possible in local game now, epaminondas highlights fixed

[33mcommit 299ceb669b1a0d2f970790a5ad97ae9caf3fb021[m
Merge: 981778fcf 736b9348a
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Apr 17 12:15:04 2021 +0200

    merge

[33mcommit 981778fcfe4f3e755f33e29a0663b52bd69c046f[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Apr 17 12:10:29 2021 +0200

    merge

[33mcommit f6268b6a91fdb9e93a710f71bffb87294ce21d6a[m
Merge: 514f2f3ba 736b9348a
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sat Apr 17 12:04:13 2021 +0200

    Merge pull request #37 from MartinREMY42/develop
    
    Master 7

[33mcommit 736b9348a3ba46c9927be720f8868888891d1d8b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 16 23:06:14 2021 +0200

    Minor fixes

[33mcommit b68652d7b8ad78f27d1e9e730d65d0d556b0dc93[m
Merge: 0a08f8f03 96e90881d
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 16 18:33:54 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit 96e90881d2b0d9c423dc652d0e83ca8818f78518[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Apr 16 17:29:44 2021 +0200

    denied canUserPlayed test created, Quixo was the last non user

[33mcommit 0a08f8f03bc6710cc8ef120b0143724d217a0d45[m
Merge: cdc8a4523 2964581cf
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 16 08:34:22 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit cdc8a4523006df00c00f02ee494e304aaad6676c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 16 08:32:30 2021 +0200

    Update dependencies, update karma conf

[33mcommit 6615705755f3021e9d02e1bb72c4605cdf9ab97a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 16 08:28:44 2021 +0200

    [hexa] Layout in hexa component should be absrtact

[33mcommit c54193e9e1a73113d3a3c4fae0a0e3807ac9c2f4[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 16 08:28:12 2021 +0200

    [dvonn] Improve error messages

[33mcommit 44a11461378e82ca189dee4f34e41040c5b4c799[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 16 07:29:32 2021 +0200

    [pylos] Fix view

[33mcommit a6e6a3c83a58e7d3bf3efbc85db6b931d17f1f18[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 16 07:17:47 2021 +0200

    [dvonn] Use hexa classes in view

[33mcommit 2964581cf7024bb4d6e1de2394e084b3347830a8[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Apr 15 20:07:08 2021 +0200

    Six finished, but didacticial

[33mcommit ef40cc183b884884f4c53c1bc702f3cf8c5f069c[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Apr 14 21:56:54 2021 +0200

    Six, enhance test and finishes last appearance details

[33mcommit 3e8d1142cebe26110323236bf5cda9857f0f7f14[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Apr 13 23:04:25 2021 +0200

    merge

[33mcommit 4d17325c69ada09b5f191e91c7bd8d257265c6a7[m
Merge: 63ad4d6f8 9a47ae6c2
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Apr 13 22:51:43 2021 +0200

    merge

[33mcommit 63ad4d6f8cd033d1db94e7a696ab49e94edc81f2[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Apr 13 22:50:15 2021 +0200

    Six, work in progress; gipf and dvonn didacticials enhanced

[33mcommit 9a47ae6c28ead1b9a79855887219814e528dd6f5[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Apr 13 17:33:52 2021 +0200

    [gipf] Fix capture highlight

[33mcommit a5ebc3999b0523fd5671cb34c107f6a84418c292[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Apr 13 17:33:28 2021 +0200

    Cleanup encoder, add some tests

[33mcommit 72f83cb50886c491548a292f42bd68e10a096a9a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Apr 13 08:17:21 2021 +0200

    Only allow JSON values containing a single depth of arrays

[33mcommit a2d68a44e7affd1de4d098f62295c2aa7c23a279[m
Merge: 920bd6a9c 8f5ce262a
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Apr 13 07:03:39 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit 920bd6a9c498fb809ad18aa2bd479cf3b0d61fd5[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Apr 13 07:02:57 2021 +0200

    Use CSS classes in Coerceo, Sahara, Siam, and Tablut

[33mcommit 8f5ce262a5458de5afb758785f15d75d53ba9d19[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Apr 12 21:02:58 2021 +0200

    Six end game rules fixed, component highlights enhanced

[33mcommit ef9ae070ff65e0ef581f3752af8f52a0eb265a49[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Apr 11 21:09:49 2021 +0200

    Six in serious progress!

[33mcommit aa6ef1a6f7993fc9cc5e415fe225b43a2107afa8[m
Merge: cfa8e70d1 7c1cb9eab
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Apr 11 17:18:27 2021 +0200

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into develop

[33mcommit cfa8e70d1d480b2bdcd2f74f9197c032c7750d69[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Apr 11 17:18:08 2021 +0200

    Six display now resize correctly

[33mcommit 7c1cb9eab22dab0c0244202130d6ffa1a1a707a0[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Apr 11 07:54:41 2021 +0200

    Improve CSS of Quixo and Reversi

[33mcommit 8889cffdd7cda38d1cbe57b564d7cc96a540c086[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Apr 10 09:01:15 2021 +0200

    More CSS in P4, Kamisado, Go, Epaminondas, Encapsule

[33mcommit 514f2f3ba805724341e8d36393c03b91c444c889[m
Merge: fb0247586 9bb90b6ee
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Fri Apr 9 21:03:33 2021 +0200

    Merge pull request #36 from MartinREMY42/develop
    
    Master 6

[33mcommit 9bb90b6ee38a056c7d6f646f38377bc14e26341d[m
Merge: 80675a7b5 9ab41d369
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 9 20:29:36 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit 9ab41d36938ea204cf4be021bf8e8146f34c73b9[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Apr 9 20:32:43 2021 +0200

    Six in progress

[33mcommit 80675a7b59f07011f8f69d18b2453a8eb3c42208[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 9 20:29:13 2021 +0200

    [epaminondas] Improve view, fix tests

[33mcommit 8e5e3bde15ba5c241cc8b2fd7775ff5a2e228c6a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 9 09:36:44 2021 +0200

    [encapsule] Use CSS

[33mcommit 886057f789c06b5258d0b2c1be42087e768e9837[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Apr 8 20:26:50 2021 +0200

    Coerceo finished

[33mcommit 3b23288e955fd6bceddbee81f95da97b6c241919[m
Merge: 96fb96d96 543114c81
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Apr 8 17:32:18 2021 +0200

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into develop

[33mcommit 96fb96d9686d751620930bf2cba243b2df6c8abd[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Apr 8 17:31:50 2021 +0200

    Coerceo Didacticial in progress

[33mcommit 543114c81bad815e15d3a82da9b3c179ab86c327[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Apr 8 08:23:37 2021 +0200

    [gipf] Update design, use generic CSS

[33mcommit 3ac9ba74db5bec7a57a8e734f28897eadb0211d9[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Apr 8 08:14:43 2021 +0200

    [awale] Use CSS for design

[33mcommit 6b357b74f5a8190ac4ef35638f4dfa826167929d[m
Merge: d3b4ec7ad 6cb3f1852
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Apr 7 22:31:03 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit d3b4ec7ad4c443f66694740e2fd6610f9402738d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Apr 7 22:30:38 2021 +0200

    [gipf] Fix tests

[33mcommit 6cb3f18528f9b2d7f1cddf05509c522491ddb20a[m
Merge: bd0d90de2 815561d96
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Apr 7 21:29:44 2021 +0200

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into develop

[33mcommit bd0d90de25cab10c19fde8e45dce20208719cf0d[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Apr 7 21:29:22 2021 +0200

    Coerceo and six in progress

[33mcommit c5931e0a9e05b1ac9e0df47583bec4a85562e1fa[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Apr 7 09:07:17 2021 +0200

    [gipf] Use classes in component

[33mcommit 815561d9697ceb70a9a8f936f39c0731d05b135e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Apr 7 08:36:30 2021 +0200

    [gipf] Improve view

[33mcommit c820a3222beedc44cc8975f127e2b518da58bc8c[m
Merge: 23156221c c516dc293
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Apr 6 22:26:59 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit 23156221caaa8ff2c648f6e822fe9292b5e10956[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Apr 6 22:26:38 2021 +0200

    [p4] prioritise middle cases

[33mcommit c516dc2939395a0f8c2b998853692c5165f81133[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Apr 5 21:51:33 2021 +0200

    merge, 10k line passed, 87% branch coverage passed!

[33mcommit e841aee1409892f1f6e62c786b3c4c6655e620db[m
Merge: 474b4dc4e 0d7bd76df
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Apr 5 21:47:47 2021 +0200

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into develop

[33mcommit 474b4dc4e1748b6da9ea2922b6cf19ac4104269f[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Apr 5 21:47:20 2021 +0200

    Six in progress

[33mcommit 0d7bd76dfffc06a435305efa33ce76a4bbd2b64f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Apr 5 16:07:22 2021 +0200

    [encapsule] Remove component's tryMove

[33mcommit b7ebb1b98aab6a420e1c39550dd09cc1525d9af1[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Apr 4 09:00:29 2021 +0200

    [hexa] Enable some tests that were commented out

[33mcommit 90862a89a12534d77467058fbf6f84877496ed02[m
Merge: 8ce47af4e b7363ff41
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Apr 4 08:54:10 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit 8ce47af4ea053bcbffd21bff429aa2885b570718[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Apr 4 08:53:44 2021 +0200

    [kamisado] improve tests

[33mcommit f60832578bf54c3bddb4aed166d9e0d36807f76f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Apr 3 07:44:52 2021 +0200

    [kamisado] Decrease number of possible errors

[33mcommit 27ff56c57cc989c5be6eedd1004473565d86ada0[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Apr 3 00:02:18 2021 +0200

    Add disabled tests that are now fixed, and a few minor changes

[33mcommit fb0247586e9cee3d609ed91018e3d775e008928f[m
Merge: bdbab6388 b7363ff41
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Fri Apr 2 20:47:29 2021 +0200

    Merge pull request #34 from MartinREMY42/develop
    
    Master 5

[33mcommit b7363ff41738a818ae349324b36e92e42e28607b[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Apr 2 20:46:16 2021 +0200

    INCLUDE_VERBOSE_IN_TEST killed; CRLF anihilated

[33mcommit aa81f5403bd3fd98d5964323de23236cdbc863bf[m
Merge: 2bbfd76ff 2e49e75e2
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 2 20:19:49 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit 2bbfd76ff821ea033388817eedcd777d36fc0de6[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 2 20:01:18 2021 +0200

    Refactor first player selection

[33mcommit 2e49e75e21b4b2a859bb61c2b0d6b2a54567020d[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Apr 2 19:30:54 2021 +0200

    Six in progress, MGPMap enhancement, MGPSet creation, ObjectUtils fix

[33mcommit 57d3d60e9d08e54312bee18673f8fb3ec6b31b71[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Apr 2 19:00:55 2021 +0200

    [encoder] Add ability to encode in JSON

[33mcommit 29f055ad005f3429822e69ba8d14a329e7b875b9[m
Merge: f8e8330cd c052c21c5
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Apr 1 09:03:31 2021 +0200

    merged

[33mcommit f8e8330cd149ec22950e9552819e951af20ca05d[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Apr 1 08:57:30 2021 +0200

    removes print and small changes

[33mcommit c052c21c54e1cd6c19d317fcb009ab8206d78779[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Apr 1 08:15:09 2021 +0200

    [encapsule] Didacticial

[33mcommit 9d0989daf792a61261cec9917f61c708189cf495[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Mar 31 08:42:14 2021 +0200

    Minor changes

[33mcommit 13e684cc0374b86b22f8b20ddda3732f2f7256d5[m
Merge: e0a4b166d 88bfae6a6
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Mar 31 08:40:43 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit e0a4b166d402924926b095e9ae11a6dc49d6a1a9[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Mar 31 08:17:15 2021 +0200

    [encapsule] Finishing refactor of encapsule

[33mcommit 88bfae6a6128bb27eaf481288b849a4c7664812f[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Mar 30 21:17:38 2021 +0200

    Enhancing Coerceo, OnlineGameWrapperComponent, TestUtils, CountDownComponent, starting Six

[33mcommit a547cad858ba8a499c1c69ab1a15bbd04e0877f2[m
Merge: 3bc2596d3 73fbf5e9b
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Mar 30 08:38:16 2021 +0200

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit 3bc2596d3b7d3d6681e83137be4b9cfeec40e7d1[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Mar 30 08:37:23 2021 +0200

    [encapsule] Big refactor

[33mcommit 73fbf5e9bfa909cd9563c1f7ede048979d951c3b[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Mar 29 21:26:09 2021 +0200

    Started six, changed count down log, cried because eisenbug is not gone

[33mcommit 3d0992f8c87f09b52c703e333bd7e60a416f9545[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Mar 28 21:17:44 2021 +0200

    small fix

[33mcommit f9e62c3a4eae565372f283f2c963acd708b247c2[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Mar 28 20:26:38 2021 +0200

    Enhance OnlineGameWrapperComponent and chronos, must be tested in production

[33mcommit d5a6680d7b0c0740c6dbe4346d751c0da1c4e917[m
Merge: 4f0f04816 fcf954260
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Mar 26 23:01:04 2021 +0100

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into develop

[33mcommit 4f0f04816b4b952c82fc36541b12b53424f50aba[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Mar 26 23:00:30 2021 +0100

    OnlineGameWrapperComponent fix and clean in progress

[33mcommit ff96e745b3340f16dc34cd5931b4c95f6328aafb[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Mar 26 22:22:12 2021 +0100

    [gipf] Change stack encoding

[33mcommit fcf9542601892966a16e433329642a08c2de21d3[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Mar 26 07:41:08 2021 +0100

    Rename tabs in server page

[33mcommit b64a30f4a633f0c589f6f8e94d4db05b1ab4ef4b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Mar 26 07:33:22 2021 +0100

    Fix online game size

[33mcommit 9bdbe64cea9b7e057132f441b976d603a38cf8af[m
Merge: 5d2fe4525 f6934d9ea
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Mar 25 22:37:15 2021 +0100

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit 5d2fe452547b709efa524988f147271adb68297b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Mar 25 22:31:20 2021 +0100

    [design] Improve online game wrapper

[33mcommit f6934d9ea5df8fcfc5c872fb9b74175ab82e4164[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Mar 25 22:01:24 2021 +0100

    OnlineGameWrapperComponent refactor to remove bug improvement, slowly in progress

[33mcommit 29c6cfb3ee716bfe10929bb17b4240d360d5733a[m
Merge: 0eea1a068 a74da69f6
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Mar 24 20:25:00 2021 +0100

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into develop

[33mcommit 0eea1a068b7117fc9bcf655b8f93c4fc87fffb0f[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Mar 24 20:24:26 2021 +0100

    wip

[33mcommit a74da69f694ecb51610eb4100f545097da40ced8[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Mar 24 09:03:14 2021 +0100

    Fix didacticial tests

[33mcommit 2eda84e02908e6c5b4c36e2e167f4689e8f3f01d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Mar 24 08:58:07 2021 +0100

    [design] Minor adjustements to height

[33mcommit 4a65ca118c53bbf8748fe4e42c7f8587acf467e1[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Mar 23 22:42:52 2021 +0100

    [design] Creation components

[33mcommit 65ab1a9742b081db3d4d929480777933c03a8f39[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Mar 23 22:28:13 2021 +0100

    [design] Local game: center vertically

[33mcommit 6ccf9151eb5e9578ebe2070d07ed4c088b667d11[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Mar 23 08:00:53 2021 +0100

    [design] Fix score in local game wrapper

[33mcommit 9cdcca46739cd0450c396593bc8c47d6b8ac9fc4[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Mar 23 07:14:17 2021 +0100

    [design] Fix local game wrapper player selection

[33mcommit a7db66d916f8664f1d262849feed05d89314539f[m
Merge: f85a5026f bcef4ee77
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Mar 23 07:04:32 2021 +0100

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit f85a5026f5091c0fd194966efecd5ea0ee71c88c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Mar 22 22:24:43 2021 +0100

    [design] Improve info panel in local games

[33mcommit bcef4ee77323075dbe50f2adebf1c6e93759eb3e[m
Merge: 38841caeb d758a0575
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Mar 22 21:05:44 2021 +0100

    merge poop with pipi

[33mcommit 38841caeb634dcfb17042ef50da389dc1e63f1ee[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Mar 22 21:01:06 2021 +0100

    between enhancement and destruction, who could fucking now, there is bug everywhere :D

[33mcommit c3b5b4160a9c70940b08d447fe36849f0fa6d4c7[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Mar 21 19:11:48 2021 +0100

    [design] Improve local game component and games SVG size (without breaking the tests)

[33mcommit d758a05750bc6460d45741720bf056a36d17fd2d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Mar 21 21:24:46 2021 +0100

    Revert "[design] Improve local game component and games SVG size"
    
    This reverts commit 05e5f5998292821cee072955e918e8d166c9e230.

[33mcommit e968fb90ee4d698c544e9845a25091f2a50e6547[m
Merge: 850853338 05e5f5998
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Mar 21 19:46:28 2021 +0100

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into develop

[33mcommit 850853338e57a59c430117c7cc7a31fdfbab08fd[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Mar 21 19:45:54 2021 +0100

    Coerceo WIP

[33mcommit 05e5f5998292821cee072955e918e8d166c9e230[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Mar 21 19:11:48 2021 +0100

    [design] Improve local game component and games SVG size

[33mcommit 0780ae14c5f3012860cbc4137a5239d50fb1d862[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Mar 21 14:18:57 2021 +0100

    [design] local creation page

[33mcommit af6d8d3b0921c46e94afb84fbcedf54cb2184a3b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Mar 21 14:09:16 2021 +0100

    [design] remodel welcome page

[33mcommit 7e27bbb8983775c1f8a63a9c7f050c3e0c96b073[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Mar 21 08:35:06 2021 +0100

    [design] Update header

[33mcommit 1aab0f2172b140e1f7a0d66395c23ed560ea05e2[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Mar 20 22:44:09 2021 +0100

    [kamisado] Ignore when player selects its selected piece

[33mcommit 349e8831c7bf1f629bed39edfe4032409dba1cef[m
Merge: 25e673020 0ad1e2d60
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Mar 20 22:39:08 2021 +0100

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit 25e67302082a954ab61fff96592f73fe37e97eda[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Mar 20 22:38:30 2021 +0100

    More refactoring in hexa and direction

[33mcommit 0ad1e2d6028dae554ac316726f119c2d0a2714b0[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Mar 20 21:47:52 2021 +0100

    Fix app module import

[33mcommit 62a30db336cc2323d39f623c13ea3cdd9228f3aa[m
Merge: 619cb5240 f8ea555df
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Mar 20 21:28:19 2021 +0100

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into develop

[33mcommit 619cb52407eeca50aa655d8479d782130304e689[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Mar 20 21:27:49 2021 +0100

    Uniformise language use to french for better future internationalisation, small P4 changes, duplicate way to get to GameWrapper from welcome

[33mcommit f8ea555df15cd1b64191956154cd75d2ec5224b6[m
Merge: 4426519c9 e418a2d65
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Mar 20 14:44:16 2021 +0100

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit 4426519c9f90ef94e587449057c548a92b7efc69[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Mar 18 22:24:25 2021 +0100

    [hexa] Refactoring HexaBoard

[33mcommit e418a2d65eb30c16d087b1abdcf9ea61abdeabfc[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Mar 19 20:04:10 2021 +0100

    Small p4 enhancement, direction enhancement

[33mcommit bdbab63889303e0557f05dc6796e9d305587074a[m
Merge: 547d14c48 e418a2d65
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Fri Mar 19 20:02:55 2021 +0100

    Merge pull request #33 from MartinREMY42/develop
    
    Master 4

[33mcommit cf3ae8304e7cf0fa2f1622e5a3fe9f6e5554d661[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Mar 19 17:18:01 2021 +0100

    Coerceo WIP

[33mcommit 9008f4dbbdb9c12a23174545b6377b2526bdaaaf[m
Merge: a9a589c34 d34a9f42c
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Mar 17 21:42:28 2021 +0100

    merge

[33mcommit a9a589c3417f5d8c0ace73f8d9590711a2e6f278[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Mar 17 21:30:10 2021 +0100

    Coerceo work in progress

[33mcommit d34a9f42cb3a00916173025248a357250d4b7f33[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Mar 17 07:30:03 2021 +0100

    [kamisado] Catch static move error and toast it

[33mcommit a03b352d5511da1e097140ea492ed866b9a3fc6d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Mar 17 07:23:20 2021 +0100

    Move snackBar to the top

[33mcommit 9df2b8510e47f8421c128ae7fd6f8b87504b2afb[m
Merge: ac3c75453 fa2a51cba
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Mar 16 22:15:23 2021 +0100

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit ac3c75453962115df917c5edee59e64af20873c0[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Mar 16 22:13:35 2021 +0100

    Refactor direction

[33mcommit fa2a51cba1931d17416e508efc0fe837b0c4b312[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Mar 15 23:06:11 2021 +0100

    Login component fully tested and enhanced

[33mcommit ca75dc1659bf954d821af9fa09a264d40392faea[m
Merge: 01c1f417d be8dd53c6
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Mar 14 22:29:31 2021 +0100

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into develop

[33mcommit 01c1f417d4d91b10aea25159899ae1e55deaa9d1[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Mar 14 22:28:18 2021 +0100

    head, welcome, and login changes

[33mcommit be8dd53c6206ff97ee3262c56928f531957d58d3[m
Merge: ffc9b352d 1cfbd11e2
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Mar 14 22:18:39 2021 +0100

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit ffc9b352d5a915524a21a506fd6ec2bd9c108673[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Mar 14 22:13:56 2021 +0100

    [p4] Improve component

[33mcommit 1cfbd11e21f4961c888d6fca01324b96313777a0[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Mar 14 20:50:40 2021 +0100

    Refactor inscription, guard; create welcome page

[33mcommit 8177a8701c2591658bda0c599d5181bac5d16d71[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Mar 14 20:48:59 2021 +0100

    Refactor inscription, guard; create welcome page

[33mcommit 3e334ff18c851c6af77b8b71900966ff50937b35[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Mar 14 18:08:54 2021 +0100

    [hexa] Generalize HexaBoard for rectangular boards

[33mcommit 3129ea97d8d11c8878ecd2c424e895c360813df3[m
Merge: 7b778e2b4 126230c98
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Mar 14 12:21:18 2021 +0100

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into develop

[33mcommit 7b778e2b4f2f9973bf7c7ecebb427f93a287f2d0[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Mar 14 12:20:48 2021 +0100

    WIP for Authentication enhancement and DB Rules

[33mcommit 126230c982de6f71ff8c01066b1321eb0b2cdcb1[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Mar 14 09:16:41 2021 +0100

    Factor GipfLine out of Gipf into HexaLine

[33mcommit 9ec355f9fc998473f93cd56ebeb3e1aef586abbe[m
Merge: 9c754335d 45f2df584
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Mar 14 08:08:00 2021 +0100

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit 9c754335db7c96f2ad4bbb9e462462ebc2b2b241[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Mar 14 08:04:47 2021 +0100

    [gipf] Don't show arrows on complete lines

[33mcommit c6d17e90aa47a07c1566cfe6db415758ac3f163a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Mar 13 21:45:50 2021 +0100

    [p4] SVG Component

[33mcommit 45f2df5849c5eb80120054ce40c26e9f6819e2fb[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Mar 13 19:43:01 2021 +0100

    merge

[33mcommit 947b45a51640d67521bb2a1aae07d7ec69315c6f[m
Merge: 4c2ec8777 9acbcb522
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Mar 13 19:31:56 2021 +0100

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into develop

[33mcommit 4c2ec87778684b812c19ecae4efcc400fdef4095[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Mar 13 19:31:26 2021 +0100

    TODO removal and small enhancement

[33mcommit 9acbcb522ef0bd1deebfaeca15c6732c87dc9f66[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Mar 13 19:07:53 2021 +0100

    Fix typo in P4Rules.spec.ts

[33mcommit 34d85f878c337a1d584a58f280aa692f1063d313[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Mar 13 18:11:34 2021 +0100

    [p4] 100% coverage on rules

[33mcommit 547d14c482fbe4bd31c6535123dfb0aa422e2244[m
Merge: 70686f117 8d0ddd94a
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sat Mar 13 16:39:44 2021 +0100

    Merge pull request #31 from MartinREMY42/develop
    
    Master 3

[33mcommit 8d0ddd94a84459caa3c78db4486fde69ecfc00e8[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Mar 13 15:10:26 2021 +0100

    [p4] remove debugging info

[33mcommit 157bf65f5f5239cae9f3e90ca52c22883b3fc867[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Mar 13 15:08:37 2021 +0100

    [p4] Refactor, improve getBoardValue to prioritise center case

[33mcommit e1950c915ec16a312f3e9650b5f3c0123fe959b6[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Mar 13 00:31:27 2021 +0100

    [gipf] Update failure messages

[33mcommit e9a1af56b9736c3d30431547b5d3267c845e0b73[m
Merge: 6bce1a77e 4aa0a085a
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Mar 13 00:31:15 2021 +0100

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit 6bce1a77e9964e18df01055b39213295d5f97d9f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Mar 12 21:19:48 2021 +0100

    Minor changes

[33mcommit 4aa0a085a0207efc206382b7790f09cad42ff3ee[m
Merge: f9f6fd3f4 f2244f58e
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Mar 12 21:11:41 2021 +0100

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into develop

[33mcommit f9f6fd3f40aab077b5f4c970427aac10e81ca0f8[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Mar 12 21:09:58 2021 +0100

    onValidUserMove became onLegalUserMove

[33mcommit f2244f58e87a45f49f8729414ee7cadfd722e3f6[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Mar 12 18:59:48 2021 +0100

    [gipf] Add dots to error messages

[33mcommit c53436c37e7917c8a29e121b9816636df250b3c6[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Mar 12 18:59:48 2021 +0100

    merge

[33mcommit 1091ab337be973eeade7262b68d27641c7aeb23a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Mar 12 08:28:42 2021 +0100

    [gipf] Bugfixes and code improvements

[33mcommit 586051d30463090e866218c679d345831dce12b3[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Mar 11 22:26:14 2021 +0100

    [didacticials] Improve some messages

[33mcommit 27f4c07bf3f9a04e8ef9490a7499c79ba8096e3c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Mar 11 19:18:53 2021 +0100

    Didacticials: minor changes to explanations

[33mcommit 6dae9399a9a26b05fe81a39bf209b33e3e30feb1[m
Merge: f632c8783 0f02d1f94
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Mar 11 18:57:25 2021 +0100

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit 0f02d1f94b19015e4d9f8c52fd03f8aac68fbb89[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Mar 11 18:49:39 2021 +0100

    merged

[33mcommit f632c87830921238b9e7f5d48c567d37130e2eb7[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Mar 11 18:41:29 2021 +0100

    [gipf] Make static error message public

[33mcommit 810e1905606d94756867c0877825faca4227d3ac[m
Merge: ac8708501 2220b88d4
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Mar 11 18:19:13 2021 +0100

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into develop

[33mcommit ac8708501ed148c7300f2cb39fd2b780d04978c9[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Mar 11 18:18:44 2021 +0100

    Didacticial enhanced, debugging online problems

[33mcommit 2220b88d4d001bb47ce41d2264a38f3c4167fd0a[m
Merge: b2f143771 a11552d84
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Mar 11 07:48:19 2021 +0100

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit b2f1437719125585b86603146a81e7c809105ee5[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Mar 11 07:47:54 2021 +0100

    [gipf] various improvements in tests

[33mcommit a11552d84389c682c92e8b4a6f59fcd868b7cb63[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Mar 10 21:50:41 2021 +0100

    DidacticialStep enhanced to be more clear, less repetitive, and allow any move; To Test yet

[33mcommit 64e66c1a47df6c7b03c6b6c4e27cce65b0ede3be[m
Merge: b73ce2e41 40eda2c33
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Mar 10 17:45:52 2021 +0100

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into develop

[33mcommit b73ce2e414159c3642d0ea407545a76016ced7bf[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Mar 10 17:45:23 2021 +0100

    dvonn enhanced; didacticial wrapper in progress; gipf didacticial in progress

[33mcommit 40eda2c3340821f52131d5b77f04837bdca238ef[m
Merge: f6d754286 81e69bd7f
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Mar 9 22:43:09 2021 +0100

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit f6d754286d30d821b1207915f0f1f074eab90cd0[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Mar 9 22:41:06 2021 +0100

    [gipf] clear moved cases in updateBoard

[33mcommit 64edc1e67821ad1f2cf04c9038b228bfe200cdae[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Mar 9 22:35:09 2021 +0100

    [gipf] Show captures directly

[33mcommit 81e69bd7f6c93b5c9e6f80cc3d30d2fc928010b8[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Mar 9 18:29:30 2021 +0100

    merge

[33mcommit ad238994dde0018471f722bdf65abaf9675633c0[m
Merge: 630bcd40f 5bf44443c
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Mar 9 18:15:55 2021 +0100

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into develop

[33mcommit 630bcd40fbea6b0e7abd6b9ef06b5000cbdfcd23[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Mar 9 18:13:59 2021 +0100

    Dvonn show capture

[33mcommit 5bf44443c2bd5827b89900e487589a4c54cccf91[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Mar 9 17:38:51 2021 +0100

    [gipf] Use coords directly in component html

[33mcommit 489008081ea409832b5da1f2d500ef5cfba3e434[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Mar 9 07:48:10 2021 +0100

    [gipf] Refactor error messages and part slice

[33mcommit fed656476ea5d64560e8f101c5812932db08a8da[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Mar 8 22:06:27 2021 +0100

    [gipf] Fix error message in test

[33mcommit bb2b23144b4791b79764b7cc3dfbae0250a52277[m
Merge: 6847efed6 4fb71a188
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Mar 8 22:04:49 2021 +0100

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit 4fb71a188bcddfa5c400eb165d6f7f1c2e1e838c[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Mar 8 19:54:24 2021 +0100

    merge

[33mcommit cbb9833f78409bf9a971ad12422c766b88e17bef[m
Merge: 5c4a58de7 6c617a3ca
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Mar 8 19:52:33 2021 +0100

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into develop

[33mcommit 5c4a58de7550d58449e35ef7eed8b5bee048f2af[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Mar 8 19:52:07 2021 +0100

    nano ticket of le fun: done

[33mcommit 6847efed67c5d090032a2393f796d28f5f413eb9[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Mar 8 19:25:50 2021 +0100

    [gipf] Highlight captures on hover

[33mcommit 850cd3adc20bf69c112ac1b671ac13830e631174[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Mar 7 21:02:00 2021 +0100

    [gipf] Improvements to component, support multiple captures

[33mcommit 238962b530f3504f069d9adf4a4469da3c55543c[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Mar 7 21:46:09 2021 +0100

    Didacticial enhances, sahara small 'fix', p4 small fix, nano ticket of fun

[33mcommit 6c617a3ca0becd4fcdd2e21080670d2ddf21fb69[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Mar 7 08:12:24 2021 +0100

    [gipf] Updates and fixes

[33mcommit 70686f117072d6d09082f49a5779c8c3f040bdd7[m
Merge: a3cee5031 1e9ddba3a
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Fri Mar 5 20:53:42 2021 +0100

    Merge pull request #30 from MartinREMY42/develop
    
    Master 2

[33mcommit 1e9ddba3ae46284f1342de4f44541de713f3c6c7[m
Merge: c77511369 642fc7c42
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Mar 5 20:38:14 2021 +0100

    fix merge conflict

[33mcommit c77511369bfe55f78c4034bd0086f9a42b88149a[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Mar 5 20:29:09 2021 +0100

    Pylos, Quixo Didacticial added, small fixed

[33mcommit 642fc7c4283c62281b449b2becf40141f8fabade[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Mar 5 20:18:20 2021 +0100

    [gipf] Show possible captures

[33mcommit f167fa1e85be304631753c6655f3e884cd5c767c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Mar 5 19:05:13 2021 +0100

    [quarto] Didacticial

[33mcommit 19a42310bf740e034a32328cfb403d3f410dad2e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Mar 5 18:51:14 2021 +0100

    [quarto] Minor refactoring

[33mcommit 8b171243a19190183c1029904a4212a2749b50fb[m
Merge: 40a3b8482 ae6a7bf57
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Mar 3 22:44:06 2021 +0100

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit 40a3b84828e16573c738943bd2cac0512bc6e1a8[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Mar 3 22:41:36 2021 +0100

    [gipf] Add arrows

[33mcommit ae6a7bf578445d68eda766fb1d010afe54944384[m
Merge: a1a9cc798 ce3a3cf5c
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Mar 3 21:39:46 2021 +0100

    Fix merge conflict

[33mcommit a1a9cc798facbe0273535b8e6600540dd69b27f7[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Mar 3 21:31:06 2021 +0100

    Siam Didacticial finished, unused siam image deleted, sahara, tablut, epaminondas didacticial added or enhanced

[33mcommit ce3a3cf5c5ce78ba504fe1baa811650a94e71ee3[m
Merge: ab40e38ae 2486aed02
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Mar 3 07:39:26 2021 +0100

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit ab40e38ae53680be530d8ff9496386c179481927[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Mar 3 07:33:41 2021 +0100

    [kamisado] Improve didacticial, fix piece highlight

[33mcommit 8a91c008b99d119f68910aa1476af16942b9a035[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Mar 2 22:37:10 2021 +0100

    [kamisado] 100% coverage

[33mcommit 2486aed022137f450ddd2376b4239e3aae351338[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Mar 1 21:22:09 2021 +0100

    Didacticial enhanced/finished?, go/epaminondas/reversi didacticial enhanced

[33mcommit 4dd1e000d346e414deba9772dc621427a0407d74[m
Merge: f61e1ce31 7fe89f2f3
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Feb 27 22:57:59 2021 +0100

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into develop

[33mcommit f61e1ce310b237cb17a564a3f56a0b68d4365e39[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Feb 27 22:57:30 2021 +0100

    Didacticial Game Wrapper enhanced and reversi didacticial created and go didacticial clarified

[33mcommit 7fe89f2f3f4fdae3e174f0211951a04cec95c143[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Feb 27 22:16:21 2021 +0100

    [kamisado] Full didacticial

[33mcommit c8b0aaa37aab91a127d089e0c240c77e5be938ef[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Feb 27 20:40:56 2021 +0100

    [kamisado] Forgot to add didactical steps file

[33mcommit d70791d600492773f80a9d44e95b47308621758e[m
Merge: 3e60b8af9 fa36decb7
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Feb 27 20:09:45 2021 +0100

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit 3e60b8af9e87655f93d3279faa9c9151285f6662[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Feb 27 20:08:47 2021 +0100

    [kamisado] update and start didacticial

[33mcommit 19c77d43fdc601b6da7cc24e6388a4ca19016d10[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Feb 27 20:08:05 2021 +0100

    [gipf] component tests now fixed and enabled

[33mcommit a3cee50313cb60b633b8ecf8f2c2a8a4d7ddcd01[m
Merge: cae9bcbbe fa36decb7
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sat Feb 27 12:37:37 2021 +0100

    Merge pull request #29 from MartinREMY42/develop
    
    Master 1

[33mcommit fa36decb751c514896d60813cd70f0e37bc1845d[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Feb 27 12:35:58 2021 +0100

    small fix

[33mcommit 4ca9e7da226cfe6e4f14604faf8618b006966c87[m
Merge: 3b2732425 925d7d56d
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Feb 26 21:22:43 2021 +0100

    Merge branch 'develop' of https://github.com/MartinREMY42/multi-game-project into develop

[33mcommit 3b2732425c7dd99adf198204eece956c40a7a965[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Feb 26 21:22:22 2021 +0100

    Epaminondas and Go Didacticial added

[33mcommit 925d7d56db337a84431ef3d454f7070f7326ff46[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Feb 26 21:13:53 2021 +0100

    [kamisado] minor style updates

[33mcommit 8869a1c5807a8b1d9e54ef445289f7ab10344b77[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Feb 26 21:13:44 2021 +0100

    [gipf] Update component tests

[33mcommit 4ed112fc2600a17443b5937d3844dae4bb93e480[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Feb 25 22:58:54 2021 +0100

    [gipf] 100% coverage of GipfPartSlice

[33mcommit 740e11172c81a068e19ecb037a4198a84d25500b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Feb 24 22:53:07 2021 +0100

    [gipf] Full coverage of rules tests

[33mcommit cae9bcbbecc92b80828c3c48b13c1725e8dff396[m
Merge: 69f9ec54a a83117c9e
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Tue Feb 23 22:05:15 2021 +0100

    Merge pull request #28 from MartinREMY42/develop
    
    Master 0

[33mcommit a83117c9e7a3491ad2212d19f8dc59bdb678692e[m
Merge: 5b44fb3d9 7d66c1344
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Feb 23 21:13:32 2021 +0100

    Merge branch 'develop' of github.com:MartinREMY42/multi-game-project into develop

[33mcommit 5b44fb3d9396212d3d0a48e0216c425c0fe4f19c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Feb 23 21:08:28 2021 +0100

    [gipf] WIP

[33mcommit 7d66c1344f48b1d96825752c63673e5a7cb2a635[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Feb 23 20:01:51 2021 +0100

    TODO Hunt

[33mcommit ae42a1a3e4e26947535f4be5ef8f2455668bb8e5[m
Merge: 5396363f1 37d55c3ee
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Feb 22 22:33:18 2021 +0100

    merging conflict, should not push fit, only xit

[33mcommit 5396363f1ce61aa4510e5221bc75c184d6dc53cf[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Feb 22 22:26:26 2021 +0100

    destroyed some TODO

[33mcommit 37d55c3eeec40701e905ff169910f98fe4b810e2[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Feb 21 08:50:06 2021 +0100

    [gipf] Improve coverage of rules

[33mcommit b07c8dcae517530550e456e7194dd53c24f73638[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Feb 20 18:15:07 2021 +0100

    [gipf] Remove other variants, increase coverage

[33mcommit e83523f41eb541ce59537855271bc90c8e03088b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Feb 20 08:28:13 2021 +0100

    Fix an incorrect Gipf test

[33mcommit fecda92ce5995a00e97f419119aa4cf65dd01572[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Feb 19 20:53:07 2021 +0100

    Disable failing gipf test

[33mcommit 08886207484833293433858601138db7cba45ec1[m
Merge: 32a1de1e9 825f0e54e
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Feb 19 20:47:34 2021 +0100

    Merge branch 'gipf' into HEAD

[33mcommit 825f0e54e0132940889f310c1a242b399f332a08[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Feb 19 20:42:51 2021 +0100

    Working of Gipf

[33mcommit 32a1de1e990852181a05ef89d7647d5c2b4f3195[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Feb 19 20:16:15 2021 +0100

    didactial and go advance and small enhancement

[33mcommit 63f3aacf5e66da8f66f2e7da334ecf6e77e129bf[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Feb 18 08:51:45 2021 +0100

    Fix typo

[33mcommit dd09928a4da90aa5792fb5a79fae91a805aca6aa[m
Merge: 341e9eaee 4dd6e0b7d
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Feb 18 08:11:45 2021 +0100

    Merge branch 'martin_didacticial_game_wrapper' of https://github.com/MartinREMY42/multi-game-project into gipf

[33mcommit bd630fcb7fe759cc88f608969229358b2c6578bc[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Feb 17 20:21:46 2021 +0100

    All 'back to move one' design bug fixed, except Encapsule's

[33mcommit 341e9eaee03dc651d595b15b1eebd2b2ff836ff4[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Feb 16 22:23:29 2021 +0100

    [gipf] Improve user experience for selecting placement direction

[33mcommit 57aa1baab80bf8566648817ea4f4e665189cda83[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Feb 16 21:02:28 2021 +0100

    wip, test failing

[33mcommit 773ca08c74c65eab46164c63efd422f2a5fb44f1[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Feb 16 17:34:21 2021 +0100

    Add number of remaining pieces to Gipf component

[33mcommit d1af5cff2013ed10d8ccb07f4562a154e47af022[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Feb 16 08:13:48 2021 +0100

    Gipf component seems to be fully working

[33mcommit 4dd6e0b7d26c74f2687b11c8bab3c7779c7ddb4c[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Feb 15 23:09:54 2021 +0100

    DidacticialGameWrapper progress, cancelMove and cancelMoveAttempt generalised

[33mcommit b04d5a76710a0344e6c8b42268e23631a76b6bb5[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Feb 15 22:12:07 2021 +0100

    WIP GipfComponent

[33mcommit 2390a7521dd6cbb04b0f2297ca7b14ff3c7d1320[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Feb 14 22:22:33 2021 +0100

    Didacticial Game Wrapper, wip

[33mcommit 6a59d1ba2393d9616e52dd7152fdf930e4ee15de[m
Merge: 31ceddb09 69f9ec54a
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Feb 13 11:24:53 2021 +0100

    Merge branch 'master' of https://github.com/MartinREMY42/multi-game-project into gipf

[33mcommit 69f9ec54a4fd8be2b1ac47bf54c97cc8d91bbe5a[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Feb 13 10:37:33 2021 +0100

    [travis] Disable linter to have meaningful build result

[33mcommit 409945f54ffb3dcbf347af81c3a97e46da475088[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Feb 13 08:16:41 2021 +0100

    Revert "Merge branch 'master' of https://github.com/MartinREMY42/multi-game-project into martin_awale_show_capture"
    
    This reverts commit 7f942fbeb428182218c8d6f95220098f8b2162f6, reversing
    changes made to 3081c8fe0bb04318a25ad8cb84a91ced023a7379.

[33mcommit 31ceddb0994a12984799e8322ef16725dee0cf96[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Feb 12 22:32:05 2021 +0100

    Gipf component player color

[33mcommit ee865cb539abda04980c19791a4c1a8a759644aa[m
Merge: 369711f28 892d2b62e
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Feb 12 08:21:02 2021 +0100

    Merge branch 'master' of https://github.com/MartinREMY42/multi-game-project into gipf

[33mcommit 369711f28eac4bde953028941cf4fee5faa56b21[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Feb 12 08:20:23 2021 +0100

    WIP Gipf component

[33mcommit 892d2b62e9b9fe1be14b3b9dd2e4ac18797db0c9[m
Author: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>
Date:   Mon Jan 25 19:40:35 2021 +0000

    Bump socket.io from 2.3.0 to 2.4.1
    
    Bumps [socket.io](https://github.com/socketio/socket.io) from 2.3.0 to 2.4.1.
    - [Release notes](https://github.com/socketio/socket.io/releases)
    - [Changelog](https://github.com/socketio/socket.io/blob/2.4.1/CHANGELOG.md)
    - [Commits](https://github.com/socketio/socket.io/compare/2.3.0...2.4.1)
    
    Signed-off-by: dependabot[bot] <support@github.com>

[33mcommit a604803b8b6619b6b00d3866d9a6fb94c41ce76a[m
Merge: 3081c8fe0 7f942fbeb
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Feb 12 07:36:58 2021 +0100

    Merge pull request #26 from MartinREMY42/martin_awale_show_capture
    
    Awale: show capture

[33mcommit 7f942fbeb428182218c8d6f95220098f8b2162f6[m
Merge: a86b023e2 3081c8fe0
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Feb 12 07:30:52 2021 +0100

    Merge branch 'master' of https://github.com/MartinREMY42/multi-game-project into martin_awale_show_capture

[33mcommit 3081c8fe0bb04318a25ad8cb84a91ced023a7379[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Feb 11 10:59:12 2021 +0100

    fix 'conflict'...

[33mcommit 20b14a2ef1253d5fcb6c7e2da165c8ebcdb18f79[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Feb 11 08:55:10 2021 +0100

    fix PR comment

[33mcommit 7a074509a8cfe18533e6021eff25c81c90c5f832[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Feb 7 19:36:08 2021 +0100

    Pylos changed stylistically and enhanced UXlly

[33mcommit 97a39120c26cfed10d608eb23ff91a91841818ef[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Feb 6 16:52:37 2021 +0100

    Tablut restored, vikings symbol drawn again

[33mcommit e7670a660dbd199c9f56cfa613ccff8623675f85[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Feb 4 16:51:37 2021 +0100

    Reversi view enhanced, code coverage enhance, QuartoHaster fixed, GameService code enhanced, closer to future refactor

[33mcommit f75aaad87e6f14459eb820b42dcdfe9da2c23de9[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Feb 4 08:28:05 2021 +0100

    Work, unit test in progress

[33mcommit c89476827ed10148cc012adc606d0b0fe5d754ad[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Feb 11 22:02:52 2021 +0100

    wip

[33mcommit 53352dc768028383bab66bf5be721e122ea39c48[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Feb 11 08:48:01 2021 +0100

    wip

[33mcommit b0ef114b35a655299479eddfb788c4f2f2b27cb8[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Feb 11 07:48:43 2021 +0100

    Update file structure for Gipf

[33mcommit c2e6a0cea0553ba245a0389c9e861d75d94bc265[m
Merge: 9f3d16a39 0f9e69d90
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Feb 10 22:40:05 2021 +0100

    Merge branch 'master' of https://github.com/MartinREMY42/multi-game-project into gipf

[33mcommit 9f3d16a391a35fa7cbed019620f48c32521ca7a8[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Feb 10 08:12:23 2021 +0100

    Minor Gipf fixes

[33mcommit 37ba564a4df508495795de4d4c10e621068165ba[m
Merge: 3a9c9bf90 3c0e3bdf2
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Feb 10 07:59:08 2021 +0100

    Merge branch 'master' into gipf

[33mcommit 3a9c9bf902414e9281ca88c916313ec6fddc4aa3[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Feb 10 07:41:31 2021 +0100

    Have all Gipf rules test green

[33mcommit 6ae49b3b3f83ac28665d730d2d62b479adad7073[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Feb 9 23:03:21 2021 +0100

    DidacticialGameWrapper wip

[33mcommit 144d33c684afa29b0afff1301a8be85acc049ad7[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Feb 9 08:03:49 2021 +0100

    WIP Gipf specs

[33mcommit a86b023e2fab103b3940b01d09ffba59f4df7688[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Feb 8 23:12:00 2021 +0100

    Awale now shows capture, no longer switch screen

[33mcommit a8d5a901d79c957fc99fd0e2af51d3e87a2dda97[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Feb 7 21:46:07 2021 +0100

    Work on Gipf tests

[33mcommit e869f7929c4d3e2d106ce315798416ff9932bc55[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Feb 7 19:36:08 2021 +0100

    Pylos changed stylistically and enhanced UXlly

[33mcommit c965d99600b8a69e4a6e84d24a4499240d0b8a24[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Feb 7 08:43:02 2021 +0100

    Encoders

[33mcommit 62b1760863ab206c5a3b484a1cd837c7f654a2ad[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Feb 6 14:07:32 2021 +0100

    Refactor GipfMove, add its specs

[33mcommit a6ac9da4d89ec72c89ca94615c20979cbd2bb07d[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Feb 6 16:52:37 2021 +0100

    Tablut restored, vikings symbol drawn again

[33mcommit 0f9e69d90aa388270b34bc3c7979c4915038c643[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Feb 3 19:57:05 2021 +0100

    No more any in equals

[33mcommit 6bd75a76fe18c3c4f4dd7f2fe9b97c30b7aad20d[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Feb 4 16:51:37 2021 +0100

    Reversi view enhanced, code coverage enhance, QuartoHaster fixed, GameService code enhanced, closer to future refactor

[33mcommit c375e1d339884b25faf16bea0fc84e7057aed41a[m
Merge: 2d4920761 2275a2022
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Feb 4 15:23:51 2021 +0100

    Merge branch 'master' of https://github.com/MartinREMY42/multi-game-project into martin_reversi_show_capture

[33mcommit 2d4920761aed19db7899bce6f722c77beec3c5a9[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Feb 4 08:28:05 2021 +0100

    Work, unit test in progress

[33mcommit 2275a202212d86ac095e944eeb4ebc1d1f94ec3f[m
Merge: f7de12ece a1f7c5e89
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Thu Feb 4 08:18:44 2021 +0100

    Merge pull request #21 from MartinREMY42/martin_tablut_fix
    
    Tablut fixed, coverage to enhance

[33mcommit 6b00a13f544d7e0c84eb7180eec31f875c71914a[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Feb 3 19:57:05 2021 +0100

    No more any in equals

[33mcommit a1f7c5e8900a2ba655f07fb13458710cd49bca0c[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Feb 2 21:33:45 2021 +0100

    Add missing file to previous commit

[33mcommit 44cabc2b9738e340299433844401392be9085321[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Feb 2 21:31:23 2021 +0100

    Tablut enhanced and refactored

[33mcommit fdb4c77251cc36c2088b287bbd9ab1ffc5a5a486[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Feb 1 20:57:24 2021 +0100

    Tablut interface enhances, code cleaned

[33mcommit 6540808ce2f2d8e4de78547d026c70a16c1ce8e3[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Jan 30 17:26:10 2021 +0100

    Folder renamed mot-mot-mod, tablut test enhanced, perhaps a futur model for all other tests

[33mcommit 72dc3ad254912f1da5361fcdfb6d6fd51a786f98[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Jan 30 15:03:12 2021 +0100

    linter enhanced and fixed, tablut wip

[33mcommit 754451523a22d901b115fba14c106fe03d346819[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jan 30 09:01:25 2021 +0100

    Gipf component, starting tests

[33mcommit b6b0d02eb36c1e0e23cf9662551bea16c31ac680[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Jan 28 17:19:17 2021 +0100

    no-fit

[33mcommit 1b7e03fb94aab00aec9dba0215f1b5c8797cc66e[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Jan 28 16:53:03 2021 +0100

    Tablut fixed, coverage to enhance

[33mcommit f7de12ece4edbf28105931b1251e9f711efd4876[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Jan 25 20:39:29 2021 +0100

    Fix some bug, enhance tests, refactor Quarto

[33mcommit f4c247ac8311569a9843c547bf715dc58448806f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Jan 20 08:02:42 2021 +0100

    First draft of GipfRules
    
    WIP Gipf
    
    WIP
    
    First draft of GipfRules

[33mcommit 3c0e3bdf26905050ad2aa55c0488912b4c9a6c03[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jan 22 19:27:45 2021 +0100

    Add notification that email can arrive in spam

[33mcommit 8c631c98500ab09f5a9a90b761208d1b54bed264[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jan 22 19:27:24 2021 +0100

    Deploy script: correctly replace COMMIT in index page

[33mcommit 46b02df4e965ffbf320c1a314f70718fa68d528e[m
Merge: 0fcae43c2 2cfdd5bf7
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jan 22 08:21:57 2021 +0100

    Merge branch 'master' of https://github.com/MartinREMY42/multi-game-project

[33mcommit 0fcae43c274fe602cabc6bf4a0bd4042c2542280[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Jan 21 22:08:49 2021 +0100

    Fix Quarto, Reversi, enhance Quarto Minimax and tests

[33mcommit 2cfdd5bf7043669a751eeb51ffea2f8b44f174a8[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Jan 20 08:01:05 2021 +0100

    Fix dependencies

[33mcommit c89e2c20dfaaa1237353ae131927889c3b5a3546[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Jan 18 21:43:16 2021 +0100

    Fix test but they still use component.ngOnInit, and replace this is causing bug

[33mcommit 8f497c165a7df5b2b82eb493f342c8391d1f581d[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Jan 18 19:01:00 2021 +0100

    Fix Pylos Test

[33mcommit 13b03a14947f69c8ec182537fd7325f46c127130[m
Merge: 9d12a2a42 f0d173da7
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Sat Jan 16 12:17:35 2021 +0100

    Merge pull request #19 from acieroid/master
    
    Setup eslint

[33mcommit f0d173da7d98976264fb2abea9de2e043afc92c4[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jan 15 20:48:16 2021 +0100

    eslint --fix

[33mcommit 088413a08e7036143cdf84c3bca44eef15c6d346[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jan 15 19:49:40 2021 +0100

    Merge

[33mcommit 9d12a2a4248e3e283a5985362e0d559d1cd927ee[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jan 15 19:43:53 2021 +0100

    WIP: just before finalisation of linting

[33mcommit 35aa383715f72241db498befb13fdb6ada1c2140[m
Merge: b4c6bbbca 9d12a2a42
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jan 15 19:41:27 2021 +0100

    Merge branch 'master' of https://github.com/MartinREMY42/multi-game-project

[33mcommit b4c6bbbca467f68adf01a47376cde3350d28aac1[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jan 15 19:40:58 2021 +0100

    Fix random player bug

[33mcommit 9d4e215dccbe0f97d4edb732830e3eeabdb81ebf[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jan 15 19:12:06 2021 +0100

    Small fixes

[33mcommit f91db4f413f3c0baee5d54266954af5ccf2e784d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Jan 12 22:17:03 2021 +0100

    Remove unused import

[33mcommit 98ddb2bb5ed13dfe499cec513e071524cda9e9d5[m
Merge: 1fbcf9bf9 46431365a
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Jan 11 08:39:08 2021 +0100

    Merge branch 'master' of https://github.com/MartinREMY42/multi-game-project

[33mcommit 1fbcf9bf9bd6cffead272e9f9212ea4e314b80a2[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Jan 11 08:37:56 2021 +0100

    Update eslint-tslint config

[33mcommit 6ff201743711321d52c1f7bbe9ece2218f64489e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jan 10 23:08:40 2021 +0100

    Improve tslint-eslint config

[33mcommit bf015cd96b0bd644039006ccf8a04ff7faf00c2c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jan 10 22:52:52 2021 +0100

    Remove fit, force typing with eslint

[33mcommit 0a259a2c94451abdd082ba6df1b754dfd0b76adf[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jan 10 22:45:59 2021 +0100

    Handle review comments

[33mcommit 5479ab8100170bf83f8ab5de9fda0dcbec1de74b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jan 10 20:49:31 2021 +0100

    Add test for redirection in online game component

[33mcommit 46431365ae47004fa19d296cf9d4e5d1c2413e20[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Jan 10 20:45:26 2021 +0100

    fix base href for travis

[33mcommit 52b5b15c64fee152f0fe805d4781f92d80a88817[m
Merge: ff13945f6 cc64357c0
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Jan 10 20:43:06 2021 +0100

    Merge branch 'master' of https://github.com/MartinREMY42/multi-game-project

[33mcommit ff13945f6fb25b769fdfe6695a7495cbeba3c9ab[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Jan 10 20:38:05 2021 +0100

    Epaminondas finished, test coverage enhanced

[33mcommit 716f572fedde6dc63190f02076acf3ea54672340[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jan 10 09:42:56 2021 +0100

    Factor router mock out of tests

[33mcommit 26d7283e26ec3bbe672056df91c016572d25cb88[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Jan 10 09:31:36 2021 +0100

    Fix OnlineGameWrapper component tests

[33mcommit aab5ec5163dac9af7b305cea321fb2d4ae612056[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jan 9 23:46:03 2021 +0100

    Restore base href and change it only for deployment

[33mcommit c7f2801fd3fbc0143cd4ab5251816c8f682e1347[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jan 9 23:44:28 2021 +0100

    Check game and part id

[33mcommit 651436e539e2ab2983ab7d3f8017f176ab4c35ce[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jan 9 17:54:55 2021 +0100

    [travis] disable build on PRs

[33mcommit d0fae3781d7304874fe3c8bf0c6a0529c6c78acc[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jan 9 13:11:29 2021 +0100

    [travis] update deploy condition

[33mcommit a5635db818eb7ccb75880ca5a4eec0190b8c0f96[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jan 9 12:30:05 2021 +0100

    Add dummy firebaseConfig for tests

[33mcommit cfa1c75ba42d4a9b3c3c72d41e634bf0914d2919[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jan 9 12:17:19 2021 +0100

    Improve travis config

[33mcommit 920dad6ea8c2d481d114a7c0ee740e31f54690f6[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jan 9 11:58:18 2021 +0100

    Style changes for eslint

[33mcommit b99b4a96154074f9d4e411da68077910c000d4d3[m
Merge: 36130c915 cc64357c0
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jan 9 11:43:52 2021 +0100

    Merge branch 'master' of https://github.com/MartinREMY42/multi-game-project

[33mcommit cc64357c0c130fd38fd428b4392c400aa466bc8e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jan 9 07:42:24 2021 +0100

    [travis] Disable deploy from non-master

[33mcommit a3a9e62e0db722a434111e84c04cdc5ac7e9c037[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Jan 9 07:38:59 2021 +0100

    Update index.html and deploy script

[33mcommit f584fea90f180635f273cd44a77845eaa6ed51d3[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jan 8 23:10:43 2021 +0100

    Update base path in index.html

[33mcommit 36130c91593ed4cb73c94232d0ccf4dc0d915fdc[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jan 8 22:59:12 2021 +0100

    Update eslint config

[33mcommit f456e9720313f92b2134197589fd89242bd79cfc[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jan 8 22:55:41 2021 +0100

    Revert "eslint --fix"
    
    This reverts commit 824da0256c36394e3a96c11e2f5bbd366f375ec8.

[33mcommit 4e918f0bd62343b873bea4407640e8aceb3c746c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jan 8 19:56:42 2021 +0100

    Travis

[33mcommit 94707424280918fb3ac9c284d90fb28ec68a6445[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jan 8 17:41:35 2021 +0100

    Epaminondas done, coverage finition remaining

[33mcommit afc669c4ee55cb34c3565051f84e63aecbccf6a2[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Jan 6 22:53:47 2021 +0100

    Restore last_changed

[33mcommit bee1308e797c51cbeefe0b932aca3c965e158ff3[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Jan 6 14:50:48 2021 +0100

    fix conflict

[33mcommit af5c582d699fd025d6b0dc18eafd333b5b6c07e0[m
Merge: 244d2f0e4 217d3a34e
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Jan 6 14:37:46 2021 +0100

    Merge branch 'master' of https://github.com/MartinREMY42/multi-game-project

[33mcommit 244d2f0e41938081ff4e8cc1c5e9c668ef2b5b07[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Jan 6 14:29:29 2021 +0100

    Create Epaminondas (work in progress)

[33mcommit dc5812d2f9e5f4ae6720f561d8547d32cfb55c55[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jan 1 23:07:09 2021 +0100

    Rename last_changed to lastChanged

[33mcommit 750a6993c78f2401073d346575cf47f6b664f6c6[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Jan 1 22:59:47 2021 +0100

    Disable checking game name in server page component

[33mcommit b3039454cdc248ade1e8cefec64e73c8b9f76c8c[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Dec 24 15:56:33 2020 +0100

    enforce use of Table and NumberTable type

[33mcommit a14e5c0be5cb487dcf4eeae56aa86008e1fec035[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Dec 22 12:53:42 2020 +0100

    Change no-redeclare to warn in eslintrc

[33mcommit 824da0256c36394e3a96c11e2f5bbd366f375ec8[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Dec 22 09:02:24 2020 +0100

    eslint --fix

[33mcommit 246f89a9bb50561b7738c70fa5a5db02adc45d92[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Dec 22 09:00:44 2020 +0100

    More eslint rules

[33mcommit 2f35602cd919e12d7af04e4641b41e6373ccc8da[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Dec 22 08:57:05 2020 +0100

    Make some test future-proof (otherwise they fail on later versions on angular)

[33mcommit 8240d6f22e5840df92a3edb989f31c33b7f03fa2[m
Merge: 2e014d514 217d3a34e
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Dec 21 23:27:36 2020 +0100

    Merge branch 'master' of https://github.com/MartinREMY42/multi-game-project

[33mcommit 2e014d514401ff77ceb19070320ae8d929fd106d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Dec 21 23:26:37 2020 +0100

    Mock router events in server page component tests

[33mcommit 4983ba7201b80122be970f310d39a2ccde6637df[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Dec 20 23:36:56 2020 +0100

    Replace MoveX by P4Move

[33mcommit c360c4bde0e7ccccd0ac4a60ef6483603c11fd3d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Dec 20 09:40:11 2020 +0100

    Check that game exist in server page

[33mcommit 9db512a48962a8d7f6918490efeb270d27696166[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Dec 19 09:23:17 2020 +0100

    Dvonn score on first turn is not 0

[33mcommit c158d59b3bee4c4ef8b33b330a5371fb6d08f4a9[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 18 23:24:56 2020 +0100

    Show score in Dvonn

[33mcommit 217d3a34e76b09075b752b86152ccca23d7a7c36[m
Merge: 2fd5ee57e 35f5f23b6
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Fri Dec 18 21:57:11 2020 +0100

    Merge pull request #18 from acieroid/master
    
    Mutability + travis + pool

[33mcommit 35f5f23b6bab7b83c2e51d3aed82847abcfcf3f1[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 18 21:40:17 2020 +0100

    Fix deploy script

[33mcommit 003b94e658251eabc6b2958d01551112eee7719f[m
Merge: 340584b48 2fd5ee57e
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 18 21:38:50 2020 +0100

    Merge branch 'master' of https://github.com/MartinREMY42/multi-game-project

[33mcommit 340584b489880f42359a876b9affd847f92707a0[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 18 21:34:53 2020 +0100

    Improve MoveX pool

[33mcommit 97bd330d0caa6c69c3f22332cbcc387d2df1c9a6[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 18 21:33:06 2020 +0100

    Check immutability

[33mcommit 2fd5ee57e08250241af44351d2cefdd636da8844[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 18 19:43:05 2020 +0100

    travis keys

[33mcommit 649da4d8ff3aaefb06998eda03187a02830344b6[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Dec 18 19:23:53 2020 +0100

    Modify script testing instruction

[33mcommit 73d7af3a5db694c9e854b5111b0bdd300c862688[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Dec 18 18:54:50 2020 +0100

    Test travis

[33mcommit a3663af319303bf29d2ad686682b32428edec1ff[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Dec 17 15:43:58 2020 +0100

    Uniformise toasting in components, and enhance GoRules

[33mcommit 4cfbeee25813e9091b9444f220882c84e3ea9fee[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 11 23:42:02 2020 +0100

    Orthogonale -> Orthogonal

[33mcommit ab055ced0894f6f3fbf14a1f6fe90d720f3cf5b1[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Dec 11 14:36:58 2020 +0100

    Refactor toasting (cancelMove), enhance testing

[33mcommit 9c8c99e0bcbdd86c158f742d2a99eab266e0d48a[m
Merge: 6adcc9fcf b624095bb
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Thu Dec 10 14:21:36 2020 +0100

    Merge pull request #17 from acieroid/refactorings
    
    Add toasts to each game

[33mcommit b624095bb33bdad02542446f735437bc515e821b[m
Merge: be46f7392 6adcc9fcf
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Dec 9 23:11:35 2020 +0100

    Merge branch 'master' of https://github.com/MartinREMY42/multi-game-project into refactorings

[33mcommit 6adcc9fcf1cd674ec33069eba37320c59a7fb6cc[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Dec 9 11:18:58 2020 +0100

    Enhance test and code, restore code coverage to previous glory

[33mcommit be46f73927f54558d7c068ce8432f5a560bb626d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Dec 8 08:18:05 2020 +0100

    Add toasts to each game

[33mcommit bfad77f2ca18766ef9d22651126cedded5d4c06c[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Dec 7 22:38:54 2020 +0100

    Replace some invalid toBeTruthy and toBeFalsy to their strictly boolean equivalent

[33mcommit 0038150691db41a99da48f620043fcfbbb363ffa[m
Merge: a5cbcf168 4fca0aa84
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Dec 7 20:36:56 2020 +0100

    Fix conflict

[33mcommit a5cbcf168499337275521a1b4c69fa3a6043bdb3[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Dec 7 20:34:54 2020 +0100

    apply light code enhancement

[33mcommit 4fca0aa84e68fa9f0033cc926e6840ac11a2ffd7[m
Merge: 8633e09e2 163f3e051
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Mon Dec 7 20:30:27 2020 +0100

    Merge pull request #15 from acieroid/refactorings
    
    Add SnackBar support, introduce MGPValidation

[33mcommit 163f3e05140ff5d8b2bc17a00c1e7e853abdd826[m
Merge: 961a389dc 8633e09e2
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Dec 6 22:48:23 2020 +0100

    Merge branch 'master' of https://github.com/MartinREMY42/multi-game-project into refactorings

[33mcommit 961a389dc603708d66c232bcaed5a68b517a1145[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Dec 6 22:45:53 2020 +0100

    Fix test setup

[33mcommit 42c06827f514dfc83d447ef62abba9d6aa771a60[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Dec 6 14:29:29 2020 +0100

    Fix more tests

[33mcommit 5de38216ba449e7af3e9c03ba8f3f6daf8a501bb[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Dec 6 09:21:43 2020 +0100

    Start fixing tests

[33mcommit 63d3f3fd9cc9744efdbb5ad7b311b23fd0a3484c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 4 21:39:01 2020 +0100

    Minor fixes

[33mcommit d09dbe0bf88dfa304bb1780ef4575d0ad0f97c22[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 4 21:21:43 2020 +0100

    WIP

[33mcommit 8633e09e2c5f7754a051a48de6d02d4b2e7585eb[m
Merge: 64acd7200 4676da016
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Dec 4 20:31:00 2020 +0100

    Merge branch 'master' of https://github.com/MartinREMY42/multi-game-project

[33mcommit 64acd7200b8dc9c00d0b3c5d40744a7ef5236252[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Dec 4 20:30:45 2020 +0100

    Fix sahara interface way, enhance sahara coverage

[33mcommit 71281db0b44287448ce62e68a8aefc965b44033a[m
Merge: 1e98e572c 4676da016
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 4 20:03:42 2020 +0100

    Merge branch 'master' of https://github.com/MartinREMY42/multi-game-project into refactorings

[33mcommit 1e98e572c5c6ee05bfa98ef7dfaab196c2c84835[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Dec 4 19:41:50 2020 +0100

    WIP

[33mcommit 4676da016610d7abeaa270f2151ae843979e1a2e[m
Merge: 46b284c49 11f47b0d1
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Fri Dec 4 19:23:18 2020 +0100

    Merge pull request #16 from acieroid/master
    
    Fix DvonnPieceStack encoding

[33mcommit 46b284c4986e792bd2009db9ba363c2579410d10[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Dec 4 13:27:05 2020 +0100

    Refactor/Generalise Rules constructor and setInitialBoard method

[33mcommit cb4c43033fdd93d06b85d5ea4bed655d29ea44a5[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Dec 3 17:45:04 2020 +0100

    Enhance OnlineGameWrapper and test

[33mcommit 8c85eadd68e82ca45a2c7c5237320168283a438b[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Dec 2 09:40:58 2020 +0100

    Enhance test: remove obsolete async use

[33mcommit 38ba34807a158f4dbcb1e820ecb9585b2e7cfc24[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Dec 1 17:18:25 2020 +0100

    Add display function, fix JoinerService test

[33mcommit 41e3cd8ced5530dff6bc93ec1eaf670136ca5246[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Dec 1 08:09:21 2020 +0100

    Use MGPValidation in GameWrapper and AbstractGameComponent

[33mcommit 4db4fe72677f0dfec8a0e0b41d37c68b770e0d4c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Nov 30 22:52:28 2020 +0100

    All games can use the snackbar

[33mcommit 13d822187b7776b1255f0c596595a6c407d64336[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Nov 30 21:19:56 2020 +0100

    SnackBar in Dvonn with MGPValidation

[33mcommit 32efef61bf8ddd21bcc047b3222d0da2d355f750[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Nov 29 15:04:26 2020 +0100

    Rename MNode to MGPNode, add LocalGame draw test, enhance P4 test

[33mcommit f05be62367688c6463b1db4879e2162a8a80badb[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Nov 27 22:09:52 2020 +0100

    Add snackbar to dvonn component

[33mcommit b66cc72749ca5d759cec03ced7f508311185c874[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Nov 27 22:09:40 2020 +0100

    Fix GameWrapper

[33mcommit fe3dd161f7584ce51f8afa0f9635ec4d7b92bd3c[m
Merge: 3aea8b7bb 57076818e
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Nov 26 21:04:24 2020 +0100

    merge and enhance tests

[33mcommit c0bd66b45a73a69e50bcac5d728328e1ea4971f7[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Nov 26 08:43:42 2020 +0100

    Snackbar test

[33mcommit 3aea8b7bb9a3c2c09e84e4da2f07b56710960661[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Nov 25 14:48:43 2020 +0100

    Change GameWrapper game infos

[33mcommit 57076818e490d23bfee6ecfc01b1202dec8badf1[m
Merge: 199972f27 8e6cbe93b
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Wed Nov 25 14:10:01 2020 +0100

    Merge pull request #14 from acieroid/refactorings
    
    Upgrade dependencies, setup eslint and Travis

[33mcommit 8e6cbe93beb5e2b4e7c3a692503e81706e133edd[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Nov 25 14:08:00 2020 +0100

    Fix deps

[33mcommit 199972f27663f24b957d32e9b9d90c8a80d5f9a9[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Nov 25 13:40:14 2020 +0100

    Rules are all pruned

[33mcommit 8c3d045a721a5832d0d6b7cd224df9cdc29b613b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Nov 25 07:42:14 2020 +0100

    don't use PATH as variable name

[33mcommit d532802404b31e6288274b294d28df4fb685cc54[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Nov 24 22:49:17 2020 +0100

    Fix travis script, move deploy to travis

[33mcommit 8f648dea0f0371118989d673a16b472f86bd2f52[m
Merge: 8cde2382d 99a143c82
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Nov 24 18:09:38 2020 +0100

    Merge branch 'master' of https://github.com/MartinREMY42/multi-game-project into refactorings

[33mcommit 8cde2382d843d296b4665dcc7644c05822c52987[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Nov 24 18:08:54 2020 +0100

    Add deployment script

[33mcommit e095e5c8264c939bac527e8d487cb8d29a33585f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Nov 22 23:20:19 2020 +0100

    Improve linter config

[33mcommit 11f47b0d1da266d910f7527d49612996f982b5d0[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Nov 22 23:10:50 2020 +0100

    Fix DvonnPieceStack encoding, add some extra tests

[33mcommit 99a143c823e1947352c68386059496c980483972[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Nov 22 15:08:18 2020 +0100

    Enhance OnlineGameWrapperComponent test (limiting log noise) and small refactor

[33mcommit c13badf2074a0edb7eda39cc3cfeaded8abd9540[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Nov 22 10:46:53 2020 +0100

    More warnings, less errors

[33mcommit 6ff9ba9c24b5b1ef04eb8ab2b9e313c2270f6574[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Nov 22 08:42:11 2020 +0100

    Prepare for DvonnPieceStack tests

[33mcommit ad5457fc81910773057a7d8d47ff9fd597341920[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Nov 22 08:45:53 2020 +0100

    Multiple stages

[33mcommit a4847e7bff8628c09b9415f2a06fd41e7eada12f[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Nov 21 23:05:07 2020 +0100

    eslint in travis

[33mcommit d513d0b5b0f90fe5837e9b8fa5c724dd27f72731[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Nov 21 18:17:57 2020 +0100

    Fix compilation

[33mcommit 64d6527194ad4c351dc11a6633d1d6479c5c2fff[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Nov 21 17:06:14 2020 +0100

    travis

[33mcommit e631711bee3f96e44bc05d76a4e0acee438ec266[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Nov 21 13:58:04 2020 +0100

    update package-lock.json

[33mcommit df7e035600524b90aab77e8ae6af579445bb58cb[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Nov 21 13:35:52 2020 +0100

    travis

[33mcommit 86ca70f202cfce511f8cd86b12f45c4f06ab7104[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Nov 21 13:19:31 2020 +0100

    travis

[33mcommit 5c8a06073e856231bd82b3744a817cb353429b9e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Nov 21 12:58:35 2020 +0100

    update travis config

[33mcommit 71ff3252b02b1f5680f09197b51c2a6144731890[m
Merge: 222e77045 1fd7f60d8
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Nov 21 12:55:14 2020 +0100

    Merge branch 'ci' of github.com:acieroid/multi-game-project into HEAD

[33mcommit 222e77045486875ab02590fe2fde2495fc69649e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Nov 21 12:55:01 2020 +0100

    Add eslint configuration

[33mcommit 7090758b897f3055960a02017d985951e19d1f4e[m
Merge: efc1aa827 de0d2d8e6
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Nov 20 22:37:35 2020 +0100

    Merge branch 'master' of https://github.com/MartinREMY42/multi-game-project

[33mcommit efc1aa8279663e4cf2d937d8d000fbe45741b581[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Nov 20 22:37:09 2020 +0100

    Enhance OnlineGameWrapperComponent and Reversi canPass

[33mcommit 52a69445f73e5f745ebb941bd3ebc13943c973ac[m
Merge: 07d0aa5ae de0d2d8e6
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Nov 20 22:34:45 2020 +0100

    Merge branch 'master' of https://github.com/MartinREMY42/multi-game-project into HEAD

[33mcommit de0d2d8e67e79bf700021086eb33b2cd82084a13[m
Merge: fbc58fe81 b608fc4ad
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Fri Nov 20 22:27:37 2020 +0100

    Merge pull request #13 from acieroid/master
    
    Kamisado + Dvonn

[33mcommit 1fd7f60d81e886ed0dea0fd1ca6d10ca028289e8[m
Merge: 3f13dc515 b608fc4ad
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Nov 20 22:14:41 2020 +0100

    Merge branch 'master' of github.com:acieroid/multi-game-project into HEAD

[33mcommit b608fc4adf6793303e5dfaa5c13ddfcc70d7e7b6[m
Merge: a054ebbe3 fbc58fe81
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Nov 20 22:02:32 2020 +0100

    Merge branch 'master' of https://github.com/MartinREMY42/multi-game-project

[33mcommit a054ebbe311e132258966c57d0746662618c5654[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Nov 20 21:38:27 2020 +0100

    More changes to Dvonn and Kamisado

[33mcommit 5a135b303bf4bd767f4b0eddcd2dda306d5665eb[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Nov 20 08:28:02 2020 +0100

    Change Dvonn encoding

[33mcommit c583d4ad083222c070a6803d70adbc436c762c79[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Nov 18 23:12:20 2020 +0100

    Handle review comments

[33mcommit fbc58fe81e3ec859b14257ccd6ed98ec628703dd[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Nov 18 16:26:08 2020 +0100

    Enhance take back and make it now refusable, update board, no longer can we play after someone resign

[33mcommit 5158a58decf222ee009c60ec6b31dc4e413bc9c2[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Nov 17 15:31:29 2020 +0100

    Take Back Enhanced, test enhanced

[33mcommit 3f13dc51529764882d1aef1640c0b19f99b549e9[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Nov 17 08:14:25 2020 +0100

    [travis] Setup

[33mcommit 7945f0aed9c5a9fe4953920f54ac9e235e47dce8[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Nov 16 23:02:10 2020 +0100

    Handle MR comments

[33mcommit 7e719d212d85c1f3cba7b97acc81f394a8a3fe35[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Nov 14 14:03:20 2020 +0100

    Take Back in progress

[33mcommit 07d0aa5ae91b9e02e2ca19b06a1f91ee5b85ec8b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Nov 9 08:07:27 2020 +0100

    Remove unused dependencies

[33mcommit 66397610dbf28f3aff84049b398259a1544c47ce[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Nov 8 23:22:34 2020 +0100

    Fix tests

[33mcommit ac3a7f768549f6556b670852456a54d97c43add8[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Nov 7 23:51:08 2020 +0100

    Upgrade angular and firebase versions

[33mcommit 079ca0497a772c8da2af912bf72b3c116b52279e[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Nov 7 00:01:07 2020 +0100

    update angular to 10

[33mcommit f880578c166a19269b242e2e2e23f1b6b12a633c[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Nov 6 23:55:18 2020 +0100

    Update to angular 9

[33mcommit 75df4db1cc95208d830e786a6e48ce1e0b31f7cf[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Nov 6 23:52:24 2020 +0100

    WIP

[33mcommit 149484098e5715eece9509e458409166b4a2cb80[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Nov 6 23:45:23 2020 +0100

    Update dependencies

[33mcommit 94e6f3e1c4963174b1901c6da45300f9abf39325[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Nov 6 18:16:27 2020 +0100

    Minor fixes

[33mcommit a357d645e32a587adeeb91faab4e7c6e018e17e4[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Nov 2 08:38:21 2020 +0100

    Final fixes

[33mcommit d37fbb0cfa9592e1dea3d82bcc2a24b81f553aa1[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Nov 1 22:59:50 2020 +0100

    Refactor Kamisado

[33mcommit e2548d2f667e53a665338bbea2adb3bdf5299719[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Oct 31 00:20:43 2020 +0100

    Clean Dvonn code

[33mcommit 6459cf7c9528e93b1c83c7fad0c09f4e0e7419de[m
Merge: dfa7ca06b 618fbfdf5
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Oct 31 00:15:37 2020 +0100

    Merge https://github.com/MartinREMY42/multi-game-project

[33mcommit dfa7ca06bb5652a80e6e1562be86ca0505b4e8a5[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Oct 30 18:44:49 2020 +0100

    Dvonn tests: await

[33mcommit c75b1513f86c2871e5027deae086b942b4608aba[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Oct 30 18:40:54 2020 +0100

    Update tests

[33mcommit 3eaa5f68c94a929c525d5abad4a2a480f053dbc2[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Oct 30 17:47:08 2020 +0100

    More Dvonn component tests

[33mcommit 2ee503d62612504d7e8d7b258e333093cfc24ba9[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Oct 30 07:48:43 2020 +0100

    Increase code coverage in Dvonn tests

[33mcommit 90925e1bc1271f3ac33a9ae2737ffa55b6569f82[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Thu Oct 29 07:48:47 2020 +0100

    Dvonn component

[33mcommit b5246a2d1d940fb7705398b6eae7ee243d46e3d6[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Oct 26 22:56:52 2020 +0100

    DvonnRules passes all tests

[33mcommit 618fbfdf5d0d72c08e6c54302ee727fcda00aeaa[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Oct 25 10:44:04 2020 +0100

    Add Local Take Back Functionnality

[33mcommit b37a32970b7dbc0fb0413973ba0841f8e4cdb20b[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Oct 24 16:52:53 2020 +0200

    Pylos test up to 100% console.log number diminished

[33mcommit 7917e233deef20022384c8c2b6e8071e0571ab66[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Wed Oct 21 23:31:35 2020 +0200

    Dvonn tests

[33mcommit 15bf8ca0d7da0b5ee887ad8df2697fda14bac84a[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Oct 20 22:46:52 2020 +0200

    Siam test reached 100%

[33mcommit ceefdeb82283d90692721652de001858674907d5[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Oct 20 22:21:32 2020 +0200

    Minor updates

[33mcommit 7ab500505263c5a13ed35249c1177d2a751d95dd[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Oct 15 15:18:56 2020 +0200

    Quixo coverage up to 100%

[33mcommit 076719f9b027d74fd0372fd24cd386325b56bc39[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Oct 11 23:41:58 2020 +0200

    Use ArrayUtils.mapBiArray

[33mcommit 88353e1c0ff827a914bea2fdbbcceb5a2780b433[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Oct 10 23:20:51 2020 +0200

    Minor refactors

[33mcommit 931096186cc0746c14e7a568a08b159a75ac4efe[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Oct 10 09:30:37 2020 +0200

    100% coverage

[33mcommit b23b10d076277a19f5ca81c377c3c1aedaf38d4d[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Oct 10 01:06:28 2020 +0200

    Improve coverage of kamisado test suite

[33mcommit 95f2a8f9ec0d12df94d5e652fe2bf8b68f0aa41b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Fri Oct 9 19:06:31 2020 +0200

    Improve kamisado component

[33mcommit a7c4cc9ccd03e5c2ee71b5c139e4bd57b9b7c404[m
Merge: a7e7b95ec 86a62a5fa
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Oct 6 08:36:14 2020 +0200

    Merge https://github.com/MartinREMY42/multi-game-project into master

[33mcommit a7e7b95ecfab6a618519a74855d3076a69a09316[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Oct 6 08:08:54 2020 +0200

    Fix remaining tests

[33mcommit c46d211842afb03e0ed40c38f069a2d5537e7a47[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Oct 5 23:10:34 2020 +0200

    Fix most tests

[33mcommit 4db18b5b70aee8c07e56ed214642e0aa4708273b[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Mon Oct 5 22:48:14 2020 +0200

    Clean kamisado

[33mcommit fd842ca47d03b4993c28300afcfb5a040a1b8aff[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sun Oct 4 23:10:11 2020 +0200

    Kamisado is now playable

[33mcommit 86a62a5fad724a1911f46a08096884a16cc06371[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Oct 4 19:53:58 2020 +0200

    Add quixo rules

[33mcommit 64bb3d866d74cd01c7e44fe4ff573f62e6215230[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Oct 3 23:08:39 2020 +0200

    Kamisado moves can't jump over other pieces

[33mcommit 78d4f44337dbec8287b750e3e571fe386bd85513[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Oct 3 17:02:27 2020 +0200

    Fix some kamisado tests

[33mcommit e2bc50917d6922e37a8b41fb61b5748e395dc644[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Oct 3 11:33:45 2020 +0200

    Improve Kamisado tests, covering most of the rules

[33mcommit d44bac474c8ab704f5625e9630698e086e349e25[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Tue Sep 29 22:49:59 2020 +0200

    Test kamisado moves

[33mcommit 0c428abfe397ed615523663ec3013b2018641bfa[m
Author: Quentin Stiévenart <quentin.stievenart@gmail.com>
Date:   Sat Sep 26 20:17:17 2020 +0200

    Kamisado

[33mcommit 47eba4f2395cf27e023c787e5dd149281ee7f7bf[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Oct 2 20:24:17 2020 +0200

    Add pylos

[33mcommit 53d75490e28dd7b0ee919b5a203d3b28e5ab671d[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Sep 28 00:35:54 2020 +0200

    Enhances Siam Minimax, probably ready to go

[33mcommit 302e2d1328b3e52518b22844f8a77c07ee93c358[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Sep 19 22:52:17 2020 +0200

    Enhances Siam Minimax

[33mcommit 7faab9099cb71b8d5142eb67ca3fb52a0266a014[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Sep 17 08:57:51 2020 +0200

    Conclude theoritically Siam updates

[33mcommit 3063d81b87aafecbce727ac5930cd7b3f38e71cd[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Sep 10 22:37:42 2020 +0200

    enhance test branches coverage with log

[33mcommit d5655bd6ec2600a8dfb52958ecf8ec0d64793806[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Sep 10 20:21:00 2020 +0200

    Enhance siam, test coverage, and minimax

[33mcommit 0f953ed96566b4150a0afd4d69db9bab195478c5[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Aug 28 19:34:28 2020 +0200

    Go Enhanced, 235 tests

[33mcommit ed81556676ce8b2f230d05319e39a29a2878085a[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Aug 14 18:38:43 2020 +0200

    rename Sahara folder to sahara

[33mcommit 53b91b71d8c5dc70b1709d42cbe1ea80d32f2f18[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Aug 14 18:23:25 2020 +0200

    Huge refactor

[33mcommit 1cf166aa4ff05c423c914a179904905723dfd1bd[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Aug 5 18:37:52 2020 +0200

    Enhance encapsule design an tablut game play

[33mcommit 6dcc92ee417968835abf0801a3fa7e3631161074[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Aug 3 19:52:46 2020 +0200

    enhance encapsule tests

[33mcommit 24738fe7c9fd5596a2089befba566fc78f04f077[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Jul 27 15:52:59 2020 +0200

    Small fixes

[33mcommit e2c16f3f745d4441b55e99f49949151b9b776184[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Jul 21 14:03:30 2020 +0200

    Refactor EncapsuleRules with static class instead of enum

[33mcommit 4e44e1973a8950779634094107168d0ac8ddb1a7[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Jul 13 18:39:46 2020 +0200

    Refactor in progress

[33mcommit b5b14e95f7e4ee3a9469f44efaec8a5505c21ebd[m
Merge: 2abcf1170 465d773ef
Author: EXT_Busi_mremy <martin.remy.42@gmail.com>
Date:   Wed Jul 8 18:54:08 2020 +0200

    Merge branch 'master' of https://github.com/MartinREMY42/multi-game-project

[33mcommit 2abcf1170f46dd87424321905692a2d1d65c5adb[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Jul 8 18:43:07 2020 +0200

    enhance

[33mcommit 465d773efb8ffe91fc5828f8ad2523388710f494[m
Author: EXT_Busi_mremy <martin.remy.42@gmail.com>
Date:   Wed Jul 8 18:43:07 2020 +0200

    enhances test on Tablut, fix some bugs on Sahara

[33mcommit 5a6ceac804e3e999f6fbe9cddd47671bbb0f450e[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Jun 30 15:27:47 2020 +0200

    Enhances tests (183) and fix online Quarto which has a bug with the Pawn '5', along with other fixs

[33mcommit ea3dce47c4688f85273c92808097745f19fa0be1[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Jun 18 12:54:10 2020 +0200

    enhances test, fix Siam

[33mcommit c7fa7a80b53f8bac80b9cc57edef940146827771[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Jun 17 13:43:52 2020 +0200

    enhances test, fix a blocking bug, now 158 tests and 70% statements, lines, and functions coverage, 51% branches

[33mcommit b310f708b289dff6fed9ead575c1c6d139c655e8[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Jun 15 14:24:45 2020 +0200

    enhances test on PartCreation up to have the 10th fail at the same space as the project, wip on the linked tests

[33mcommit 62425fd8c1facbe342bb62779e530be8fb944574[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Jun 10 08:33:12 2020 +0200

    enhances tests and DAO Mocking

[33mcommit b6c6826270316aecf1198cde758e0464240482c6[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Jun 8 12:00:22 2020 +0200

    wip: about to mock DAO to test services

[33mcommit eff4328104ef42659a2cf0e8f946ea84818c7190[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat May 30 17:19:39 2020 +0200

    enhances TablutComponent test

[33mcommit 5f39da189ad2084583d5e7c9b01a9248d1cde63b[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat May 30 16:17:50 2020 +0200

    enhance go functionnality, enable endgame, enhance tests

[33mcommit 1e78b11a1af2f06e5d62dfcf52b8eb34f7580002[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed May 20 12:27:47 2020 +0200

    enhance tests, allow go player to pass twice then mark as dead pawns groups, and fix Ko bug

[33mcommit 2aa7d74f66b13c29c0fb59f2bd26c0e7dc723964[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun May 17 10:54:13 2020 +0200

    enhance test coverage, 116 tests, 61% statement, 42% branches, 60% functions, 62% lines

[33mcommit 9e9716067daef6b4b639b035445e30acfae77744[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri May 8 20:24:54 2020 +0200

    allow offline player to choose himself the level of the AIs

[33mcommit 10231fb98940854d4273233c802b74cd75ec08ea[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu May 7 11:39:01 2020 +0200

    enhance test coverage, assuring that the wrapped game is inside the wrapper and not outside

[33mcommit 357a6adb4fe7a24cfb98718ef0c4980bcc16147f[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed May 6 13:31:12 2020 +0200

    fixed game inclusion in the right place broked at commit 87f5607

[33mcommit ce86b9d26553b8a6adf2ec2acd5c645cb958f6c8[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed May 6 12:39:35 2020 +0200

    temporary commit, should have been a stash

[33mcommit 985f2cbc1fae567457986e9613d12e3f4fdd68d6[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Apr 16 17:58:13 2020 +0200

    enhances test and fix small bug

[33mcommit 1db5461a8ad7e42bf9e23651c00391f35ff5ed08[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Apr 14 20:03:12 2020 +0200

    Enhances test: Tests: 99; Statements 3045/5296; Branches 931/2364; Functions 446/810; Lines 2721/4693

[33mcommit 2b22db3426d57b22221f85b0485194c5bb40ccd8[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Apr 7 17:59:59 2020 +0200

    enhances test: now Statements (+103)/(+4) = +1.90%; Branches   (+ 49)/(+2) = +2.05%; Functions  (+ 34)/(+0) = +4.15%; Lines      (+ 99)/(+2) = +2.08%
    
    q
    exit

[33mcommit 4a2f69fe96dcb683332dcca3c4532895404904ef[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Apr 7 14:55:35 2020 +0200

    move services in their own folder and create their test file

[33mcommit 036fcd98e716950e3c2c31c0faf07e6926a0e96c[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Apr 6 14:42:03 2020 +0200

    removes useless double space

[33mcommit b52e13dafd93a5853df69253af0b5afd87ba2137[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Apr 5 11:56:10 2020 +0200

    remove all line ending useless spaces

[33mcommit bb70d77b2bcb042891f92d0f066ba3e48a69639d[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Apr 5 10:51:47 2020 +0200

    remove all tab and replace them with four spaces

[33mcommit 86e4a1c1f05c64cc87f7b7273a72247508dc4c80[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Apr 5 10:49:24 2020 +0200

    remove all tab and replace them with four spaces

[33mcommit 87f5607b3c6d1ae2d27645e2de033801df739989[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Apr 4 17:51:10 2020 +0200

    Enhances tests, now no more commented tests, stats are 73 tests and 53.18% Statements 2866/538935; 79% Branches 856/239245; 66% Functions 389/85253; 35% Lines 2551/4782

[33mcommit effce3db869ae913202423aeb6a9424afab9ec3d[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Mar 23 15:32:28 2020 +0100

    enhance Quarto and Sahara tests and pathing

[33mcommit f1c06388e64ee142f3c55194076bd5197e099d13[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Mar 23 15:02:17 2020 +0100

    Enhance Tablut tests to make them 'orange' instead of 'red'

[33mcommit 59cf48f57b9cc5ef0d6367ac87f0b70bd7be9945[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Mar 23 10:52:50 2020 +0100

    before testing Tablut

[33mcommit c2263943c3609c919355a597a9b9f10b7167842c[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Mar 8 12:33:02 2020 +0100

    Sahara fixed and enhanced

[33mcommit f4b5d271c1a796fb59de72bcca852eff7c847394[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Mar 1 20:10:56 2020 +0100

    Reversi small bug fixed

[33mcommit fc4045b0109091df5aae0f70b94db7cee0a6ab60[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Feb 29 22:59:16 2020 +0100

    Small quarto code enhancement

[33mcommit 834bb1b01573cfb4f2b6d4e095953afbdea7708a[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sat Feb 29 22:27:20 2020 +0100

    Sahara work

[33mcommit bfe4d30eac43be75348108c8e238af2ecd33c419[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Feb 24 20:35:58 2020 +0100

    small fix of activeParts behavior subject

[33mcommit d2cfb0f23e0e49b04c0cdf8244ecaa0f5413893a[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Feb 24 20:21:16 2020 +0100

    Sahara inworking

[33mcommit 50cc22f7c87b07a780bfde9c6541752cd64d1523[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Sun Feb 23 15:31:19 2020 +0100

    siam fixed, debugging local-game-wrapper

[33mcommit 8403a430885df47ebad4f9ea8c386f085d267fbe[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Feb 20 13:02:22 2020 +0100

    server page immensely refactored

[33mcommit ccbe08ed1c87f959553b1904b845b34c57707a54[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Feb 19 15:58:23 2020 +0100

    css changed, mainly for the best

[33mcommit fc1249565a82f13dc1603766751846a063e7cb0f[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Mon Feb 17 11:56:08 2020 +0100

    Siam finished and fixed

[33mcommit 5d99a7a73942133f998938baf9aca32dd9f7f90e[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Feb 14 16:15:47 2020 +0100

    ChangeDetector used to fix localGame bug, now both local and online game seem's to be working on prod

[33mcommit 2121a109459b3e5a13133804da6f5b97a227050a[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Wed Feb 12 11:58:46 2020 +0100

    DAO enhanced by unheritance, online game or offline game might still be broken

[33mcommit 52e9b787cc2479924200bae9b32934074ca1bab2[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Feb 11 11:02:42 2020 +0100

    online game normally fixed

[33mcommit c8c455419d4e09bc0a6144fa0375f492b14e3491[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Feb 11 09:52:29 2020 +0100

    trying to fix online game, modification due to angular 8 migration probably

[33mcommit 81f4c824ad5c8809040db98d1bbc694cb578609f[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Fri Jan 31 14:00:46 2020 +0100

    Remove some enum to put static classes instead, fix P4 Bug

[33mcommit df8ed1a1cbf02504f833df13557ac8da1d3a355e[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Thu Jan 30 15:58:11 2020 +0100

    Player generalised, readonlyfication of arrays, more immutability in Slices

[33mcommit 84a7e7c5a141264ec9e9b4b34b96caa29ddfb4fc[m
Author: Martin Remy <martin.remy.42@gmail.com>
Date:   Tue Jan 28 16:45:51 2020 +0100

    project apparently fixed

[33mcommit af72065aabee8649528b145ad7cf476585f543ff[m
Author: Martin Remy <Martin.Remy@busi.eu>
Date:   Thu Jan 23 16:42:35 2020 +0100

    too much modification, changed computer and code editor

[33mcommit 55b12ca3b317d0eaaf31fa5fc992152015745091[m
Author: Martin Remy <Martin.Remy@busi.eu>
Date:   Wed Jan 8 16:37:02 2020 +0100

    fix GoMove equals, removing the captures comparaison and the casting

[33mcommit 63b68ed87c2fe84e5be30ceb4d132498d4070a49[m
Author: Martin Remy <Martin.Remy@busi.eu>
Date:   Wed Jan 8 12:59:45 2020 +0100

    strangely correct go.koRules by correcting Coord.equals, removing the instanceof line

[33mcommit 4724c72a11bd953f185a569f2ae158ca7bf56b82[m
Author: Martin Remy <Martin.Remy@busi.eu>
Date:   Tue Jan 7 16:34:23 2020 +0100

    fixs ?

[33mcommit 95ca81cf438e2273ba390709f296c9ef0149f85d[m
Author: Martin Remy <Martin.Remy@busi.eu>
Date:   Tue Jan 7 15:26:36 2020 +0100

    remove useless OLD_choose

[33mcommit cabee3046cd150a857c2afe07a8f145b680d70ac[m
Author: Martin Remy <Martin.Remy@busi.eu>
Date:   Tue Jan 7 15:23:33 2020 +0100

    enhance MNode tests, fix awale

[33mcommit d43fbfba3294d4fbb1a5464357fb934257df8da0[m
Author: Martin Remy <Martin.Remy@busi.eu>
Date:   Tue Jan 7 10:02:43 2020 +0100

    refactor a lot

[33mcommit 89db5f64799448e38f6a83286982554a21d04f1e[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Fri Jan 3 12:05:25 2020 +0100

    make Rules and MNodes generic correctlerly, removing now-useless casting

[33mcommit f28adc29ebb0275d7fe87a58a36fae6e534dce45[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Fri Jan 3 10:12:16 2020 +0100

    test enhanced widely about MNode, about to enhance genericyt

[33mcommit 30daf95db426711acc31c0a43db5a02051e4c618[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Wed Jan 1 18:49:25 2020 +0100

    refactor Encapsule and about to debug MNode minimax

[33mcommit 002674298161b59c42e7d583ef20765785612c07[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Mon Dec 30 11:53:11 2019 +0100

    encapsule enhanced

[33mcommit c5d1013fdac79d864d6c8ba89045e99f821b3319[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Mon Dec 23 21:03:37 2019 +0100

    delete unused OnlineGame.ts, work in progress for Encapsule

[33mcommit 56d3da0165dd05b9384323cf612d6434d6635917[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Mon Dec 23 14:21:55 2019 +0100

    encapsule game beginning

[33mcommit bef14c5781cd6edf03f3f98c762f3fb82691c22a[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Mon Dec 23 12:33:39 2019 +0100

    delete unused file

[33mcommit f9e5bef7f99abeb0a64a6d68f9ccddf9069364f7[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Mon Dec 23 12:24:21 2019 +0100

    make IA slower to play

[33mcommit b81c3ae13fb71cadfe104d79d90482902b5aecb3[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Mon Dec 23 10:27:22 2019 +0100

    about to merge develop and master, too long separated

[33mcommit e0cfcf69072b59481b256cbb8dcfa713caab15a6[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Mon Dec 23 10:01:30 2019 +0100

    fix reversi, show ko

[33mcommit 06be4b55f6565d778467f9f2e99c16f683c17b91[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sun Dec 22 16:45:45 2019 +0100

    Go rules implemented (ko not-visible, score not-visible, counting at the end unimplemented)

[33mcommit 0a2ade8d040e3a9fe8efb496208e5f11cf7b1bad[m
Merge: febcb133a 3dcf4bded
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Tue Dec 17 16:18:19 2019 +0100

    fix conflict

[33mcommit 3dcf4bdedc711618eae184a25c21ccbede5496e3[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Tue Dec 17 15:29:28 2019 +0100

    add Go rules incompletely

[33mcommit 1948cd37ba677161605d95b2f1430757f5c07d93[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Mon Dec 16 13:14:19 2019 +0100

    remove ?deprecated HttpClient as recommander by migration-instructions

[33mcommit 4de6316eb8d9f997e0cb8f2339f3e42c5ca0434f[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Mon Dec 16 13:07:12 2019 +0100

    starting to implements Go and about to try updating ng

[33mcommit febcb133aaa7f3840ead585c83cf1dc69dadde84[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sun Jun 16 19:08:40 2019 +0200

    Vulnerabilities erased. May them die in death.

[33mcommit 3ea760893987d6914214fc2a6b32670e0f50f429[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sun Jun 16 18:40:11 2019 +0200

    updates done to dependencies to erase vulnerabilities

[33mcommit 912e26444cd5c18727293ba4bb9575e48feebdc9[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sun Jun 16 18:09:01 2019 +0200

    Reversi fixed

[33mcommit c13b9c48881aead92cbc5ab8c0fb457b0b3ed9a1[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sun Jun 16 17:58:18 2019 +0200

    Reversi fixed

[33mcommit b1796e24850e150f0509a335894623d83b40191f[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Wed Jun 5 22:06:13 2019 +0200

    points en cours d'implémentation, tour de untel s'affiche à présent

[33mcommit d147c07332388e66258a06c19c89454c7ecc8ebf[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Thu May 30 14:53:51 2019 +0200

    Offline work with a new wrapping-component, reversi bugging

[33mcommit a8b1365a87bfd7481aef25607f85d25cbe9f96b6[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Tue May 28 13:57:53 2019 +0200

    Tablut added to the refactored components, Quarto Too

[33mcommit 8b1e62df1e36692e13aa807fde023b5c5e3c5073[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Mon May 27 14:46:52 2019 +0200

    Refactoring of the game-wrapper component done, working, must be tested

[33mcommit 9d5757d095106d1671ee6be183d1208f666fa6e2[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Mon Apr 22 20:17:45 2019 +0200

    offline-refactor: testing with a game-includer as a component, not a directive

[33mcommit a1676d6a937c6ba257e998540ced2558a9cbead9[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sat Apr 13 12:34:16 2019 +0200

    commit du 2019.04.13 avant l'amélioration du systême de connection

[33mcommit e94d4dd08e52ec655c4c40f9969e83cbe670a8ef[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Tue Apr 9 20:43:09 2019 +0200

    offline-refactor: new organisation of game component with GameWrapper and AbstractGameComponent

[33mcommit 53d952054a95883a7c361b6d84d169d70c3cce38[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sat Mar 23 21:08:58 2019 +0100

    offline-refactor sur le point de créer un composant contenant

[33mcommit 607634622bc979f0c0b22a99db0b3729f1727a3f[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Mon Feb 18 17:09:28 2019 +0100

    about to refactor offline component

[33mcommit bb29e5daa7a0b5a807b679cf103b53790f39eb16[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Tue Feb 12 21:42:34 2019 +0100

    rematch work, with correct chronos

[33mcommit 579bd26dd372bd072e6dc6086d4f7e557e25527e[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Mon Feb 11 21:29:30 2019 +0100

    chrono fonctionnels, mais pas au rematch

[33mcommit fa0add54df636fd6d354032f90152aa87c9ec883[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sun Feb 10 15:59:06 2019 +0100

    commit du dimanche soir, chronos non réparés, tentative de modification de la classe rules elle même pour obliger la distinction entre isLegal qui modifie rien et choose, qui modifie si c'est legal

[33mcommit 7924621b14033f5342ca2ec5d235d91b045c3bed[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sun Feb 3 19:11:59 2019 +0100

    part restart, but the time is not restarted, about to use @ViewChild for CountDown improvements

[33mcommit bf319b30ba499142b05b722fe6ab27402d501148[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sat Feb 2 21:24:16 2019 +0100

    not working but in progress

[33mcommit 72d38c3bb216fcf1448c0f7735e0d778db25d93a[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Tue Jan 29 18:16:52 2019 +0100

    fini, corrections à faire

[33mcommit 9d6fed80ada088f139069d21ad8fe68f9a30d0b4[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sun Jan 27 16:23:14 2019 +0100

    avant creation de la barre d'info de jeu à droite

[33mcommit 71b6074eef81088ad22072e302e4eb5b69dbd80c[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sun Jan 27 14:06:36 2019 +0100

    css amélioré après avoir été cassé sans faire exprès, plus sérieuse amélioration à venir

[33mcommit 0879ba8dd112cac99c4cb7a773d974c339aab2cb[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Fri Jan 25 10:53:53 2019 +0100

    move duration implémented, about to be tested

[33mcommit ca55c19bc37424bb57ee188fa96fce4020630ccf[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Mon Jan 21 19:39:15 2019 +0100

    précision à apporter sur les compte-à-reboureur des deux côtés

[33mcommit 69e6be7b0ac846e118e6c244d8114bf820fae073[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sun Jan 20 17:18:16 2019 +0100

    small change

[33mcommit 7ed5a2d8b00b40646ea366564d6b323b06a48c14[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sun Jan 20 16:52:39 2019 +0100

    part creation modifié, css à être appliqué, et tests de cas spéciaux !

[33mcommit 7542289ec2866bfa5ab72af85690cedb87def545[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sat Jan 19 11:59:40 2019 +0100

    awalé corrigé, test en prod à faire

[33mcommit ffa9b0014612f6c65d2fe7726f6e97fb8649b0a6[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Fri Jan 18 20:04:36 2019 +0100

    p4 réparé ?

[33mcommit 82fa30b83f4c5cdade7b560a5208fb4824a505cf[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Fri Jan 18 17:14:34 2019 +0100

    correction de fin de partie propre à l'awalé et au reversi, car le dernier joueur au moment de la victoire peut être le perdant

[33mcommit 9970212ad44035fc881eb71dcb859fd5d8305a4d[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Thu Jan 17 18:18:21 2019 +0100

    commit du jeudi

[33mcommit 91f42f2f3677b3b58771a4a2baa1b47d4b85238e[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Wed Jan 16 19:33:43 2019 +0100

    petite correction graphique

[33mcommit 6f4a5e4a00e0929e8c350fe844c2877ce5df4758[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Wed Jan 16 19:13:18 2019 +0100

    plus trop de bugs à tester

[33mcommit 322c300e638ea940aef9f7e99b88f75783c85d8d[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Tue Jan 15 21:32:34 2019 +0100

    most logic has been coded, but not the special cases

[33mcommit 05f8a2f4e8a2774355d9258ecf49b77269ea0a51[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Mon Jan 14 16:52:33 2019 +0100

    mise en prod de cette version

[33mcommit 2b87310e00d572ef27ecc4ea603a120c0be23d95[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Mon Jan 14 15:57:14 2019 +0100

    css amélioré pas mal

[33mcommit b0afb51ab744d083d87d60dafeb1f053612d5dc6[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sun Jan 13 22:07:39 2019 +0100

    améliorations css et stopObserve du chat component

[33mcommit 902ec4ff3c712f2875f5a2ebbc3cc5d2a7a9b9e8[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sun Jan 13 18:04:55 2019 +0100

    améliorations de l'apparence à venir via l'ajout d'angular material, un chat ajouté, fonctionnel, par pages (pour les jeux déjàs crées

[33mcommit a1318146f52adfda574966322a31e3bd9e191c91[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sun Jan 13 01:19:29 2019 +0100

    début d'implémentation de chat

[33mcommit 94b7074db70dc27c2319090aab189c28959547d7[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sat Jan 12 17:27:31 2019 +0100

    les bugs semblent avoir disparu et la destruction automatique de partie quand l'utilisateur quitte la part-creation-component se fait, et quitter en tant que joiner annule le joining automatiquement aussi

[33mcommit c305becb6b8aefb07cb348c577eccb6663cf14d4[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sat Jan 12 11:32:24 2019 +0100

    commit du 12

[33mcommit 8513948a41ec396d097a33f0cb64a4ba824c26d0[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Thu Jan 10 19:12:09 2019 +0100

    en plein débug, refactor, bref, rien à voir avec le chat

[33mcommit 935256e338d907ac9bdb9d0717302b6ada172236[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Thu Jan 10 19:12:02 2019 +0100

    en plein débug, refactor, bref, rien à voir avec le chat

[33mcommit 4c7d1440fef75b9feaa89b46d90868df12b0fdd0[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Wed Jan 9 18:17:58 2019 +0100

    commits avant les test de refactor des services

[33mcommit 9ff2e97679ff422d9ae1cf09da7ff04bc7c7aa87[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Mon Jan 7 19:04:41 2019 +0100

    refactoring Dao et Services fini!

[33mcommit a0dc4a3325cc8b14abe549cfbcb7eb4c71838b69[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Mon Jan 7 18:49:00 2019 +0100

    plus de refactorisation layer!

[33mcommit aecbf67700b42e9c3764cc988639512828f92b4e[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Mon Jan 7 16:21:20 2019 +0100

    seul le DAO fait des actions DAO-scoped, next: DAO only called by services

[33mcommit cb61f1957e046cb31965ae61a0bd9c3ffe92833d[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sun Jan 6 23:45:41 2019 +0100

    keep re-layering boy' !

[33mcommit 8d5709405c7f4152dc58b93f1b8b1581a9809583[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sun Jan 6 23:01:19 2019 +0100

    solution simple de layering trouvée

[33mcommit 67dee315f31fbbe57e7cbc2c0833984077dcef09[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Fri Jan 4 23:01:26 2019 +0100

    refactor fait sur login component

[33mcommit 1d5c276eb641a25c03af763133874d6f0787a021[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Fri Jan 4 23:01:15 2019 +0100

    refactor fait sur login component

[33mcommit fe7e582e62b5c42d8e397d540c7279e5756da718[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Fri Jan 4 19:49:27 2019 +0100

    bugs précents enlevés, refactor des layers dao

[33mcommit e330496916383b7b191e04cfe2a9526d9569abdf[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Thu Jan 3 10:20:39 2019 +0100

    joiningPage inutile à présent, batterie de tests à faires

[33mcommit 2eb1ef060aec941b54337d659268870b6bbc00c4[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Wed Jan 2 23:59:49 2019 +0100

    commit du soir, beaucoup à faire

[33mcommit 10885dcad31597675e39ac389897bde6065d1ac7[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Wed Jan 2 22:09:35 2019 +0100

    commit pré refactor afin d'avoir toutes des pages en mode /gameName/:id

[33mcommit eea557fd83eccd30ae0aad292d984dfeb1d8a852[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Wed Jan 2 11:41:23 2019 +0100

    small change offkline component

[33mcommit 461a022dd4ebc75857645edee21361d5cf1fab17[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Tue Jan 1 23:51:20 2019 +0100

    routing amélioré, rendu sain, mise en prod améliorée, ctrl+r fonctionne à présent

[33mcommit f793d09e5baaf74fb39f4126476b8ae9b7d4356a[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sat Dec 29 23:47:47 2018 +0100

    version mise en prod, merges with master incomings

[33mcommit 59ffece8cb314bc4bb66a18e773bf4a083bc782c[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sat Dec 29 20:17:27 2018 +0100

    4 highlight fonctionnels (sans captures)

[33mcommit d44360ef1d02f78d74fadbdb5d358469969e6a3c[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sat Dec 29 18:59:58 2018 +0100

    Highlights P4, Quarto, et Awalé fonctionnels, sans captured-highlights

[33mcommit 06353a67f2bb375ee2bc45835e46386f9bb2ef7e[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sat Dec 29 16:28:31 2018 +0100

    commit avant refactor des onClick afin de debugguer l'awalé highlighté

[33mcommit 9a186bc5ccb3a64eb6d5aa6ba9273c645297c395[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sat Dec 29 13:52:12 2018 +0100

    highlight p4, quarto finis, à tester, puis awalé en cours

[33mcommit a0cbd7bbfba9307dbb201d5e11ebc1da18c7eb82[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Fri Dec 28 17:55:53 2018 +0100

    highlight puissanc 4 fini et quarto en cours

[33mcommit 7760e21fbe74ad13b324f7cba54d9671242143fc[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Fri Dec 28 11:20:26 2018 +0100

    most bug have been found and destroyed

[33mcommit a4166ff37c22b0291bc9d0de1e4044fd2dd9f145[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Thu Dec 27 18:52:11 2018 +0100

    petite correction dans la capture du roi

[33mcommit 0df003669b4b369d64781bdce5889c8dada37005[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Thu Dec 27 18:43:45 2018 +0100

    euh, un add manquait, oups

[33mcommit c3c76f2cf362c1a8827a158dd6ad7638c295232a[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Thu Dec 27 18:33:00 2018 +0100

    debuggué, fonctionnel, mais tests à faire

[33mcommit 55d27d38149b4bf99a5673f98526032319ba84c0[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Thu Dec 27 00:04:08 2018 +0100

    bug en cours de repérage

[33mcommit ee68e35ff386cc46df8d97fecf578fd80b4a55a5[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Wed Dec 26 11:53:56 2018 +0100

    tablut fini d'être implémenté normalement

[33mcommit 3a3119790a8638c9e272a2d2e077dd5cfcb976b1[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Tue Dec 25 22:40:36 2018 +0100

    commit du soir, petit à petit ça s'implémente

[33mcommit a6fd3290237c2e60f64a1625c702ca0cdf0c769a[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Tue Dec 25 12:18:33 2018 +0100

    images ajoutés, commit de noel oublié, joyeux noel

[33mcommit 31b216d791dc994211c4fc272e9255e407f3be3c[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Mon Dec 24 00:53:59 2018 +0100

    commit du soir, légères avancées non testées

[33mcommit 4ef66f2ac85d5e7614db0255d1e43fd3b2964ace[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sun Dec 23 11:56:24 2018 +0100

    commit du matin, zut, le boulot d'hier comptera pas

[33mcommit 9943fa9eebac4154ca347d979382f71a47d843c7[m
Merge: 655b1abb8 191c05c6f
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sat Dec 22 11:22:11 2018 +0100

    Merge branch 'tablut' into develop

[33mcommit 655b1abb82865a54ba451ef4ebad26e13105a924[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sat Dec 22 10:21:50 2018 +0100

    bug corrigé, code plus propre et layeré, creating aint starting et timeouf configurable

[33mcommit 0cf1d40f0836c115049d01fbda086f5c85a51ccd[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sat Dec 22 00:27:35 2018 +0100

    bug enlevé mais un autre l'as remplacé, code nettoyé en masse, test à mener, commit 28 minutes trop tard pour compter comme commit du vendredi

[33mcommit c058b058664bf4c40a6bcda01956528bbbea441d[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Fri Dec 21 13:22:34 2018 +0100

    j'ai l'impression qu'il y a plus vraiment de bug

[33mcommit 272309b761803034a8b6f6fcc60e1b9d9926d62f[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Fri Dec 21 08:56:53 2018 +0100

    commit de pré-correction

[33mcommit a62ff6451ac92cc954d4b86ba08d279a4ab139f0[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Thu Dec 20 15:21:41 2018 +0100

    creating aint starting is done, and also configurable timeout working

[33mcommit b6d12307999b2fcea92334206b6564110af8923d[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Wed Dec 19 23:44:37 2018 +0100

    commit du soir, entre deux dev, refactor important finalement, voir out of scope du nom de branche

[33mcommit ed2c678d9a2bb9ccd226f5bd0b0a0efa9b047015[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Tue Dec 18 22:28:03 2018 +0100

    match nuls fonctionnels et testés, sauf les cas de cyclicité à l'awalé il n'y a pas encore moyen de proposer le match nul

[33mcommit ca0fa5d8477874101ce96f91cffa133e3bb3d542[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Tue Dec 18 18:18:16 2018 +0100

    small modif

[33mcommit e2665b6738eafaa3e6b242c87720916e32e41a80[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Tue Dec 18 18:04:25 2018 +0100

    no changes

[33mcommit 66e9844383bf2d702dbb529c728588dc827794cd[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Tue Dec 18 17:58:50 2018 +0100

    mergé

[33mcommit c2569d056cd2b6778d0b47da153f5b3130716875[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Tue Dec 18 17:39:09 2018 +0100

    correction fonctionnelle en cas de fin de partie conventionnelle marquée par endGame

[33mcommit c431d86550b592151b0a519f42002f433b455459[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Tue Dec 18 14:01:00 2018 +0100

    anciens dossiers supprimés

[33mcommit 108b7888f255cbd0aed6a1b5d57fbef843f44b4d[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Tue Dec 18 12:09:44 2018 +0100

    refactor appliqué via l'héritage de GameOnline sur chaque composants de jeux en ligne, ancien dossier encore présents

[33mcommit 6d91f0c56984b7bd309d1f43f4aef5f9248447fc[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Mon Dec 17 22:31:11 2018 +0100

    pas de réussite, sauvegarde de feature inachevée

[33mcommit ba848a98c1ccc2d858672d992636221e0858d4dc[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Mon Dec 17 22:30:48 2018 +0100

    pas de réussite, sauvegarde de feature inachevée

[33mcommit 3569747ad6b1cfa15894905671a140a68358a9eb[m
Merge: 699764a2c ac71d375e
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sun Dec 16 23:49:21 2018 +0100

    develop contient maintenant améliorations-strictement-css et n'as plus de bug chelou sur l'awalé sorti du cul du démon

[33mcommit 191c05c6f7235f0c52574688a40bdb37e518dfbf[m
Merge: b783bc750 699764a2c
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sun Dec 16 10:14:40 2018 +0100

    merge develop with tablut/amélirations-strictement-css

[33mcommit b783bc750aa988b744d604f6b2484806b75f5ccc[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sun Dec 16 10:05:19 2018 +0100

    tablut pas du tout implémenté, je passais le temps dans le train sans connection

[33mcommit ac71d375eda3477c7e5017da19773dc06f244b89[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sat Dec 15 19:41:29 2018 +0100

    page de connection stylisée

[33mcommit 9187122562f22c0c642f78c1342a5d04abf4328d[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sat Dec 15 14:18:48 2018 +0100

    server page améliorée

[33mcommit 699764a2cf01d4786068878406a80cb6bc6a739d[m
Merge: 2a69f1a0a 76f43094b
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Wed Dec 12 17:28:43 2018 +0100

    implemost merged onto develop

[33mcommit 76f43094b06377ac2b660b09430cbf28ec8eed74[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Wed Dec 12 17:12:47 2018 +0100

    small diff i believe

[33mcommit ef8bdfde8ada6cd2696819ded2b7a93ad07b88f3[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Tue Dec 11 23:58:51 2018 +0100

    partage de l'amélioration sur les deux autres jeux, plus de tests sont à mener, mais je met en prod

[33mcommit 2794627d55411cff2786d5e956f49d7c5cc9cdf8[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Tue Dec 11 23:01:58 2018 +0100

    l'updating de présence marchait mais tournait fou après inspection, corrié dans p4 online, tentative de partage de ce fait

[33mcommit ef66998f28d691bb2cfc14ecbbde70a74994a045[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Tue Dec 11 00:00:28 2018 +0100

    en cours de refactorisation des online-component, et répartitions sur chacun de resign et timeout

[33mcommit fbaf5521431be7aa676c5f8838b1f2cc74051453[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Mon Dec 10 00:08:45 2018 +0100

    victory by timeout is now possible !

[33mcommit b7747a87539afcd0abbfdf89786d35f2178423f6[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sun Dec 9 22:37:46 2018 +0100

    abandon possible à présent

[33mcommit 4d8eb2dac6a3fd3a57a52b02f1b4a4e3e8f43561[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sun Dec 9 22:08:04 2018 +0100

    update presence and timeout has been easier than I tought

[33mcommit 2b873cc44c73d11b2ea5ed95dab3c39e7bd4031c[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sun Dec 9 17:56:27 2018 +0100

    component quarto disponoible, fonctionnel, et avec images

[33mcommit 51559f9bcc7986606213f8a73446e58c4499f309[m
Merge: aece855c7 3a78d1f9b
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sun Dec 9 14:17:56 2018 +0100

    Merge branch 'quarto' into tmp-master-fork

[33mcommit 2a69f1a0a4dd1050dd7cd49e46e112d7d823f6d6[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sun Dec 9 14:09:47 2018 +0100

    d'autres crasses s'étaient pas encore vraiment mergé, j'en ai été averti à la compil

[33mcommit ca68ab0e57e8c3cc08fe8b1bc601b3245ed9050a[m
Merge: bd318399f 3a78d1f9b
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sun Dec 9 14:03:18 2018 +0100

    git me demande de pusher mais en vrai le contenu de cette branche est à abandonner

[33mcommit 3a78d1f9bc33f99d254e55ff3b5e26fc73b4a639[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sun Dec 9 12:45:28 2018 +0100

    traduction finie, passage à la création du composant

[33mcommit eec0f24f4e6c4314c572d7eae2a39a7b65bce107[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sat Dec 8 23:25:02 2018 +0100

    début de traduction, commit de la journée

[33mcommit 833356af9ca3a462659bda0bef3c3fa471504a9d[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sat Dec 8 13:50:00 2018 +0100

    petites améliorations sur le sserver page

[33mcommit aece855c7b9fe7dc3bf7f00dcdcd04e5fccf8391[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Thu Dec 6 23:33:11 2018 +0100

    should be correct now

[33mcommit bd318399fe4c853f8bd4c28c5dea65584108f4a6[m
Merge: e05c4677f 860e4e0f4
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Thu Dec 6 23:26:11 2018 +0100

    merging done with the smallest modif

[33mcommit 860e4e0f496a0732e3219dfbaa0161db9248d5c4[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Thu Dec 6 23:14:53 2018 +0100

    test if effective change

[33mcommit 3e6a955d39abc7cc8efc24940c15cc302fdf4cdf[m
Merge: a644f755f 64a85cf1d
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Thu Dec 6 22:59:40 2018 +0100

    Merge branch 'petite-ameliorations-d-affichage'

[33mcommit 64a85cf1d16e70dacca2c33d2946a32789be80c0[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Thu Dec 6 22:10:46 2018 +0100

    winner et currentPlayer amélioré

[33mcommit 7134cba4b5f7610d6e1482b2107a84614afdcb92[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Thu Dec 6 21:02:36 2018 +0100

    les petites améliorations d'affichage qui font plaisir

[33mcommit e05c4677f1cbbae3a914e5116c2ae8ae8f5ebb93[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Thu Dec 6 09:08:40 2018 +0100

    cette branche est le vomi, j'ai ajouté des petites modif sympa, puis j'ai attaqué un bug de l'awalé puis BOUUUM le caca

[33mcommit a644f755fda0d098ba689d4e61e6d4da58da3bf6[m
Author: MartinREMY42 <41200522+MartinREMY42@users.noreply.github.com>
Date:   Wed Dec 5 15:16:27 2018 +0100

    Update app.module.ts

[33mcommit bef51a6fb2db77001d5569569515f0d083a70517[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Wed Dec 5 09:07:14 2018 +0100

    améliorations de la joining page et lastActionTime amélioré

[33mcommit f3885fa16033df06afc81291cd6c7d03ebdba980[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Tue Dec 4 12:35:30 2018 +0100

    awalé débuggué, nouvelle version de connection, et utilisateurs réel visibles globablement

[33mcommit 0b182fdf2db10d4e1634613001b918f8ddbfe7c0[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Mon Dec 3 17:50:32 2018 +0100

    awale mansoon probablement debuggué

[33mcommit 3c6b1233b16dd58b8f6eea1a8a76b4bb6ecaa881[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sun Dec 2 22:54:41 2018 +0100

    amélioration de l'affichage de l'awalé

[33mcommit 56ac7156a71ed62e53d99cf67242db3de73f104c[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sun Dec 2 18:00:25 2018 +0100

    now we can join as halfMember

[33mcommit 52766db95cf60cf7a2f55065f1ccc83b2557b1a2[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sat Dec 1 21:42:50 2018 +0100

    semi-member login work !

[33mcommit 785edeab6d272bfbdff92d8e5deac926e69006c5[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Sat Dec 1 09:38:25 2018 +0100

    commit post awalé avec bug

[33mcommit c54327447ad434d36ff161db0e67831c592012a9[m
Merge: 74bb0471e ac6d1a6c2
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Thu Nov 29 22:54:01 2018 +0100

    merging done, not sure I understand how to properly merge

[33mcommit 74bb0471ee8722a94138013972a3beeae40cf26f[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Thu Nov 29 22:03:31 2018 +0100

    awalé buggué rajouté, parties hors lignes implémentées

[33mcommit aa397f504e2bef76e94595a5510d1facf91789ca[m
Author: Martin Remy <Martin.Remy@busi.eu>
Date:   Thu Nov 29 09:18:25 2018 +0100

    user can play only one game at a time, two of the 6 part result workd (unachieved and victory) and only unachieved part are visible on the server page

[33mcommit ac6d1a6c2c2d6fea930b6f070071d9b58f6eae4a[m
Author: Martin Remy <Martin.Remy@busi.eu>
Date:   Thu Nov 29 09:10:20 2018 +0100

    user can play only one game at a time, two of the 6 part result workd (unachieved and victory) and only unachieved part are visible on the server page

[33mcommit cc74a362f4bb023c6f3f3af95882dc6ebcc82ccd[m
Author: Martin Remy <Martin.Remy@busi.eu>
Date:   Tue Nov 27 18:26:12 2018 +0100

    column click I believe, not much new, about to host for few testing and for pleasure

[33mcommit fadc57a05f614be651d9fd70b6cb348d47e589ac[m
Author: Martin Remy <Martin.Remy@busi.eu>
Date:   Tue Nov 27 09:19:14 2018 +0100

    mid part joining halfway done

[33mcommit 2ba201da0d757f8c04b5d44c98a8bc62e59e2b36[m
Merge: 2b5aa3330 87a27b3e4
Author: Martin Remy <martin.remy@busi.eu>
Date:   Mon Nov 26 09:55:34 2018 +0100

    join as guest, create and join standard p4 part without special case

[33mcommit 87a27b3e4baa01ee99972cda52f2676dc00227b6[m
Author: Martin Remy <martin.remy@busi.eu>
Date:   Mon Nov 26 09:43:22 2018 +0100

    join as guest, create and join, observe from start, and if no one leave you can play until victory

[33mcommit 2b5aa3330322f48790d97b4f1c8c4a17fb032966[m
Author: Martin Remy <martin.remy@busi.eu>
Date:   Sun Nov 25 17:18:03 2018 +0100

    bidouillage

[33mcommit e7d7346a01eb4a0f4599c8d8c439d1ef7a6eb18f[m
Author: Martin Remy <martin.remy@busi.eu>
Date:   Sun Nov 25 16:45:27 2018 +0100

    join as guest, create and join p4 part, start it and see the bugs

[33mcommit 6567ea4d3005346bcb3cef745514813ac30be6c8[m
Author: Martin Remy <martin.remy@busi.eu>
Date:   Thu Nov 22 16:40:04 2018 +0100

    prettier, using image to show OFFLINE P4 (only)

[33mcommit 703070f81eae632ac30df4a39268681ff16eee0b[m
Author: Martin Remy <martin.remy@busi.eu>
Date:   Thu Nov 22 13:53:41 2018 +0100

    cette version ci n'as pas le créateur de partie en ligne

[33mcommit b6f062c8730451510e5b66537938ff8ba10be015[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Mon Sep 10 17:05:11 2018 +0200

    2018.09.10 la partie se charge en fonction de l'idée choisi sur la page server

[33mcommit de9abe92e77c03a39e7fb22316fc192a1ee0a817[m
Author: Martin REMY <martin.remy.42@gmail.com>
Date:   Wed Sep 5 18:23:43 2018 +0200

    Initial commit - Mercredi 05-09-2018

[33mcommit 5ee207d99355beb77019ca96fafe3af31d1f910b[m
Author: student <student@bt-training.be>
Date:   Tue Aug 28 13:21:23 2018 +0200

    initial commit
