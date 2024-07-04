(* Define types *)
module Player = struct
    type t = Zero | One
    [@@deriving yojson]
end

module Winner = struct
    type t = Player of Player.t | Draw
    [@@deriving yojson]
end

module EloInfoPair = struct
    type t = {
        player_zero_info : Domain.User.EloInfo.t;
        player_one_info : Domain.User.EloInfo.t;
    }
    [@@deriving yojson]
end

module EloDifferences = struct
    type t = {
        player_zero : float;
        player_one : float;
    }
    [@@deriving yojson]
end

module EloEntry = struct
    type t = {
        elo_info_pair : EloInfoPair.t;
        winner : Winner.t;
    }
    [@@deriving yojson]
end

module CalculationService = struct

    let w_from = fun (winner : Winner.t) (player : Player.t) : float ->
        match winner with
            | Draw -> 0.5
            | Player Zero when player = Zero -> 1.0
            | Player One when player = One -> 1.0
            | _ -> 0.0

    let k_from = fun(number_of_games_played : int) : float ->
        if number_of_games_played < 20 then 60.0
        else if number_of_games_played < 40 then 40.0
        else 20.0

    let winning_probability = fun (elo_winner : float) (elo_loser : float) : float ->
        let difference_in_elo_points : float = elo_winner -. elo_loser in
        1.0 /. (1.0 +. (10.0 ** (-. difference_in_elo_points /. 400.0)))

    let normal_elo_difference = fun (k : float) (w : float) (p : float) : float ->
        k *. (w -. p)

    let get_normal_elo_differences = fun (elo_entry : EloEntry.t) : EloDifferences.t -> {
        player_zero = begin
            let player : Player.t = Zero in
            let player_info : Domain.User.EloInfo.t = elo_entry.elo_info_pair.player_zero_info in
            let k : float = k_from player_info.number_of_games_played in
            let w : float = w_from elo_entry.winner player in
            let elo_player : float = player_info.current_elo in
            let opponent_info : Domain.User.EloInfo.t = elo_entry.elo_info_pair.player_one_info in
            let elo_opponent : float = opponent_info.current_elo in
            let p : float = winning_probability elo_player elo_opponent in
            normal_elo_difference k w p end;
        player_one = begin
            let player : Player.t = One in
            let player_info : Domain.User.EloInfo.t = elo_entry.elo_info_pair.player_one_info in
            let k : float = k_from player_info.number_of_games_played in
            let w : float = w_from elo_entry.winner player in
            let elo_player : float = player_info.current_elo in
            let opponent_info : Domain.User.EloInfo.t = elo_entry.elo_info_pair.player_zero_info in
            let elo_opponent : float = opponent_info.current_elo in
            let p : float = winning_probability elo_player elo_opponent in
            normal_elo_difference k w p end;
    }

    let get_actual_new_elo = fun (old_elo : float) (normal_elo_difference : float) : float ->
        if normal_elo_difference < 0.0 then
            (* when you loose *)
            if old_elo = 0.0 then
                1.0 (* when loosing your first match you still win 1 points *)
            else if old_elo < 100.0 then
                old_elo (* not loosing point when you are below 100 elo *)
            else if old_elo +. normal_elo_difference < 100.0 then
                100.0 (* not dropping below 100 elo *)
            else
                old_elo +. normal_elo_difference
        else
            (* when you win *)
            old_elo +. normal_elo_difference

    let new_elos = fun (elo_entry : EloEntry.t) : EloInfoPair.t ->
        let normal_elo_differences : EloDifferences.t = get_normal_elo_differences elo_entry in
        {
            player_zero_info = begin
                let current_elo : float =
                    get_actual_new_elo
                        elo_entry.elo_info_pair.player_zero_info.current_elo
                        normal_elo_differences.player_zero
                in
                {
                    current_elo;
                    number_of_games_played =
                        elo_entry.elo_info_pair.player_zero_info.number_of_games_played + 1;
                } end;
            player_one_info = begin
                let current_elo : float =
                    get_actual_new_elo
                        elo_entry.elo_info_pair.player_one_info.current_elo
                        normal_elo_differences.player_one
                in
                {
                    current_elo;
                    number_of_games_played =
                        elo_entry.elo_info_pair.player_one_info.number_of_games_played + 1;
                } end;
        }

end