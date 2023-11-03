import random

from otree.api import *
from datetime import datetime, timezone


class Player(BasePlayer):
    start_time = models.StringField(blank=True, initial="")
    end_time = models.StringField(blank=True, initial="")

    box0_multiplier = models.IntegerField(blank=True, initial=-1)
    box1_multiplier = models.IntegerField(blank=True, initial=-1)
    box2_multiplier = models.IntegerField(blank=True, initial=-1)
    box3_multiplier = models.IntegerField(blank=True, initial=-1)

    box0_is_selected = models.StringField(blank=True, initial="None")
    box1_is_selected = models.StringField(blank=True, initial="None")
    box2_is_selected = models.StringField(blank=True, initial="None")
    box3_is_selected = models.StringField(blank=True, initial="None")

    box0_number_of_objects = models.IntegerField(blank=True, initial=-1)
    box1_number_of_objects = models.IntegerField(blank=True, initial=-1)
    box2_number_of_objects = models.IntegerField(blank=True, initial=-1)
    box3_number_of_objects = models.IntegerField(blank=True, initial=-1)

    total_number_of_objects = models.IntegerField(blank=True, initial=-1)

    set_permutation = models.StringField(blank=True, initial="")
    current_set = models.StringField(blank=True, initial="")

    multipliers_sets_order = models.StringField(blank=True, initial="")
    finished = models.BooleanField()


total_number_of_objects_by_set = {
    "a": 96,
    "b": 80,
    "c": 50,
}

multipliers_permutations = {
    "a": [
        [1, 1, 1, 1],
        [1, 1, 1, 1],
        [1, 1, 1, 1],
        [1, 1, 1, 1],
    ],
    "b": [
        [1, 1, 1, 3],
        [1, 1, 3, 1],
        [1, 3, 1, 1],
        [3, 1, 1, 1],
    ],
    "c": [
        [1, 4, 2, 3],
        [2, 1, 3, 4],
        [3, 2, 4, 1],
        [4, 3, 1, 2],
    ],
}


class Board(Page):
    form_model = 'player'
    form_fields = ['finished']
    @staticmethod
    def js_vars(player: Player):
        return {
            'totalNumberOfObjects': total_number_of_objects_by_set[player.current_set],
            "multipliers": [player.box0_multiplier, player.box1_multiplier, player.box2_multiplier,
                            player.box3_multiplier],
            'roundNumber': player.round_number,
            "role": player.participant.role,
        }

    @staticmethod
    def live_method(player: Player, data):
        print(data)
        action = data['action']
        if player.participant.role == "seeker":
            if action == 'set_selection':
                selection = data['selection']
                for i in range(len(selection)):
                    if i == 0:
                        player.box0_is_selected = str(selection[i])
                    elif i == 1:
                        player.box1_is_selected = str(selection[i])
                    elif i == 2:
                        player.box2_is_selected = str(selection[i])
                    elif i == 3:
                        player.box3_is_selected = str(selection[i])
            elif action == 'finish_round':
                selected_boxes = [player.box0_is_selected, player.box1_is_selected,
                                  player.box2_is_selected, player.box3_is_selected]
                print(selected_boxes)
                if selected_boxes.count("True") == 2 and not "None" in selected_boxes:
                    return {player.id_in_group: {'action': 'finish_round', 'finished': True}}
        elif player.participant.role == "hider":
            if action == 'set_number_of_objects':
                box_index = data['box_index']
                number_of_objects = data['number_of_objects']
                if box_index == 0:
                    player.box0_number_of_objects = number_of_objects
                elif box_index == 1:
                    player.box1_number_of_objects = number_of_objects
                elif box_index == 2:
                    player.box2_number_of_objects = number_of_objects
                elif box_index == 3:
                    player.box3_number_of_objects = number_of_objects
            elif action == 'finish_round':
                hidden_objects = [player.box0_number_of_objects, player.box1_number_of_objects,
                                  player.box2_number_of_objects, player.box3_number_of_objects]
                total_number_of_hidden_objects = sum(hidden_objects)
                if total_number_of_hidden_objects == player.total_number_of_objects and not -1 in hidden_objects:
                    return {player.id_in_group: {'action': 'finish_round', 'finished': True}}

    @staticmethod
    def before_next_page(player: Player, timeout_happened):
        player.end_time = str(datetime.now(timezone.utc))
        player.participant.ended_successfully = True


class Group(BaseGroup):
    pass


class Subsession(BaseSubsession):
    pass


class C(BaseConstants):
    NAME_IN_URL = 'hider_board'
    PLAYERS_PER_GROUP = None
    NUM_ROUNDS = 3


class PreProcess(Page):
    @staticmethod
    def before_next_page(player: Player, timeout_happened):
        round_number = player.round_number
        if player.round_number == 1:
            # shuffle the multipliers order
            order = ["a", "b", "c"]
            random.shuffle(order)
            player.multipliers_sets_order = str(order)
        else:
            player.multipliers_sets_order = player.in_round(1).multipliers_sets_order
        current_set = eval(player.in_round(1).multipliers_sets_order)[round_number - 1]
        set_permutation = random.choice(multipliers_permutations[current_set])
        player.set_permutation = str(set_permutation)
        player.current_set = current_set
        multipliers = set_permutation
        player.box0_multiplier = multipliers[0]
        player.box1_multiplier = multipliers[1]
        player.box2_multiplier = multipliers[2]
        player.box3_multiplier = multipliers[3]
        player.total_number_of_objects = total_number_of_objects_by_set[current_set]
        player.start_time = str(datetime.now(timezone.utc))


class Feedback(Page):
    form_model = 'player'
    form_fields = ['feedback']

    @staticmethod
    def is_displayed(player: Player):
        return player.round_number == C.NUM_ROUNDS


page_sequence = [PreProcess, Board]
