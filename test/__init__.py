from otree.api import *
from datetime import datetime, timezone


class Player(BasePlayer):
    start_time = models.StringField(blank=True, initial="")
    end_time = models.StringField(blank=True, initial="")
    ended_successfully = models.BooleanField(initial=False)
    current_step_index = models.IntegerField(initial=0)
    question_1_attempts = models.LongStringField(blank=True, initial="")
    question_2_attempts = models.LongStringField(blank=True, initial="")
    question_3_attempts = models.LongStringField(blank=True, initial="")


class Test(Page):
    form_model = 'player'
    form_fields = ['ended_successfully']

    @staticmethod
    def js_vars(player: Player):
        return {
            "currentStepIndex": player.current_step_index,
            "roundNumber":      player.round_number,
        }

    @staticmethod
    def live_method(player: Player, data):
        print(data)
        action = data['action']
        if action == "submit_question":
            question_id = data['question_id']
            if question_id == "question_1":
                player.question_1_attempts += str(data) + ","
            elif question_id == "question_2":
                player.question_2_attempts += str(data) + ","
            elif question_id == "question_3":
                player.question_3_attempts += str(data) + ","

    @staticmethod
    def before_next_page(player: Player, timeout_happened):
        player.end_time = str(datetime.now(timezone.utc))
        print(player.ended_successfully)

    @staticmethod
    def app_after_this_page(player: Player, upcoming_apps):
        ended_successfully = player.ended_successfully
        if ended_successfully:
            return upcoming_apps[0]
        else:
            return upcoming_apps[-1]


class Group(BaseGroup):
    pass


class Subsession(BaseSubsession):
    pass


class C(BaseConstants):
    NAME_IN_URL = 'test'
    PLAYERS_PER_GROUP = None
    NUM_ROUNDS = 1


class PreProcess(Page):
    @staticmethod
    def before_next_page(player: Player, timeout_happened):
        player.start_time = str(datetime.now(timezone.utc))


page_sequence = [PreProcess, Test]
