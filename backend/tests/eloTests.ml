open Alcotest
open TestUtils
open Backend
open Utils

let elo_info_pair_eq : Elo.EloInfoPair.t testable =
  let pp ppf json = Fmt.pf ppf "%s" (JSON.to_string (Elo.EloInfoPair.to_yojson json)) in
  testable pp (=)

  let tests = [

    "EloCalculationService", [
        test "first part should end in 30-1 when player zero wins" (fun () ->
            (* Given an entry of two first-playing users and player zero won *)
            let elo_entry : Elo.EloEntry.t = {
                elo_info_pair = {
                    player_zero_info = {
                        current_elo = 0.0;
                        number_of_games_played = 0;
                    };
                    player_one_info = {
                        current_elo = 0.0;
                        number_of_games_played = 0;
                    };
                };
                winner = Player Zero;
            } in
            let expected_info_pair : Elo.EloInfoPair.t = {
                player_zero_info = {
                    current_elo = 30.0;
                    number_of_games_played = 1;
                };
                player_one_info = {
                    current_elo = 1.0;
                    number_of_games_played = 1;
                };
            } in

            (* When evaluating it *)
            let actual_info_pair : Elo.EloInfoPair.t = Elo.CalculationService.new_elos elo_entry in

            (* Then it should give 1 symbolic point to losers for their first game and 30 to winners *)
            check elo_info_pair_eq "success" expected_info_pair actual_info_pair
        );

        test "first part should end in 1-30 when player one wins" (fun () ->
            (* Given an entry of two first-playing users and player one won *)
            let elo_entry : Elo.EloEntry.t = {
                elo_info_pair = {
                    player_zero_info = {
                        current_elo = 0.0;
                        number_of_games_played = 0;
                    };
                    player_one_info = {
                        current_elo = 0.0;
                        number_of_games_played = 0;
                    };
                };
                winner = Player One;
            } in
            let expected_info_pair : Elo.EloInfoPair.t = {
                player_zero_info = {
                    current_elo = 1.0;
                    number_of_games_played = 1;
                };
                player_one_info = {
                    current_elo = 30.0;
                    number_of_games_played = 1;
                };
            } in

            (* When evaluating it *)
            let actual_info_pair : Elo.EloInfoPair.t = Elo.CalculationService.new_elos elo_entry in

            (* Then it should give 1 symbolic point to losers for their first game and 30 to winners *)
            check elo_info_pair_eq "success" expected_info_pair actual_info_pair
        );

        test "second part should end in in 1-57 when player zero wins again" (fun () ->
            (* Given an entry of two second player that just fought each other *)
            let elo_entry : Elo.EloEntry.t = {
                elo_info_pair = {
                    player_zero_info = {
                        current_elo = 30.0;
                        number_of_games_played = 1;
                    };
                    player_one_info = {
                        current_elo = 1.0;
                        number_of_games_played = 1;
                    };
                };
                winner = Player Zero;
            } in
            let expected_info_pair : Elo.EloInfoPair.t = {
                player_zero_info = {
                    current_elo = 57.50173783711419;
                    number_of_games_played = 2;
                };
                player_one_info = {
                    current_elo = 1.0;
                    number_of_games_played = 2;
                };
            } in

            (* When evaluating it *)
            let actual_info_pair : Elo.EloInfoPair.t = Elo.CalculationService.new_elos elo_entry in

            (* Then it should give no point to loser and a bit less than 30 points to winner *)
            check elo_info_pair_eq "success" expected_info_pair actual_info_pair
        );

        test "part should make win only 20 points between 20th game and 39th included" (fun () ->
            (* Given an entry of of equal level player having played between 20 and 39 parts *)
            let elo_entry : Elo.EloEntry.t = {
                elo_info_pair = {
                    player_zero_info = {
                        current_elo = 200.0;
                        number_of_games_played = 20;
                    };
                    player_one_info = {
                        current_elo = 200.0;
                        number_of_games_played = 39;
                    };
                };
                winner = Player Zero;
            } in
            let expected_info_pair : Elo.EloInfoPair.t = {
                player_zero_info = {
                    current_elo = 220.0;
                    number_of_games_played = 21;
                };
                player_one_info = {
                    current_elo = 180.0;
                    number_of_games_played = 40;
                };
            } in

            (* When evaluating it *)
            let actual_info_pair : Elo.EloInfoPair.t = Elo.CalculationService.new_elos elo_entry in

            (* Then it should add and remove 20 points to players *)
            check elo_info_pair_eq "success" expected_info_pair actual_info_pair
        );

        test "part should make win only 10 points 40th part" (fun () ->
            (* Given an entry of of equal level player having played between 20 and 39 parts *)
            let elo_entry : Elo.EloEntry.t = {
                elo_info_pair = {
                    player_zero_info = {
                        current_elo = 200.0;
                        number_of_games_played = 40;
                    };
                    player_one_info = {
                        current_elo = 200.0;
                        number_of_games_played = 39;
                    };
                };
                winner = Player Zero;
            } in
            let expected_info_pair : Elo.EloInfoPair.t = {
                player_zero_info = {
                    current_elo = 210.0;
                    number_of_games_played = 41;
                };
                player_one_info = {
                    current_elo = 180.0;
                    number_of_games_played = 40;
                };
            } in

            (* When evaluating it *)
            let actual_info_pair : Elo.EloInfoPair.t = Elo.CalculationService.new_elos elo_entry in

            (* Then it should add and remove 20 points to players *)
            check elo_info_pair_eq "success" expected_info_pair actual_info_pair
        );

        test "should not drop players elo below 100" (fun () ->
            (* Given an entry of two player with 105 elo *)
            let elo_entry : Elo.EloEntry.t = {
                elo_info_pair = {
                    player_zero_info = {
                        current_elo = 105.0;
                        number_of_games_played = 5;
                    };
                    player_one_info = {
                        current_elo = 105.0;
                        number_of_games_played = 15;
                    };
                };
                winner = Player Zero;
            } in
            let expected_info_pair : Elo.EloInfoPair.t = {
                player_zero_info = {
                    current_elo = 135.0;
                    number_of_games_played = 6;
                };
                player_one_info = {
                    current_elo = 100.0;
                    number_of_games_played = 16;
                };
            } in

            (* When evaluating it *)
            let actual_info_pair : Elo.EloInfoPair.t = Elo.CalculationService.new_elos elo_entry in

            (* Then it should remove only 5 points to looser so that its elo does not drop below 105 *)
            check elo_info_pair_eq "success" expected_info_pair actual_info_pair
        );

    ];

]
