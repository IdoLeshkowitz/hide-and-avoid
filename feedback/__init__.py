from otree.api import *
from datetime import datetime, timezone


class Player(BasePlayer):
    start_time = models.StringField(blank=True, initial="")
    end_time = models.StringField(blank=True, initial="")

    feedback = models.LongStringField(blank=True, initial="")


class Feedback(Page):
    @staticmethod
    def before_next_page(player: Player, timeout_happened):
        player.end_time = str(datetime.now(timezone.utc))
    @staticmethod
    def live_method(player: Player, data):
        action = data["action"]
        if action == "set_feedback":
            feedback = data["feedback"]
            print(feedback)
            player.feedback = feedback

class Group(BaseGroup):
    pass


class Subsession(BaseSubsession):
    pass


class C(BaseConstants):
    NAME_IN_URL = 'feedback'
    PLAYERS_PER_GROUP = None
    NUM_ROUNDS = 1


class PreProcess(Page):
    @staticmethod
    def before_next_page(player: Player, timeout_happened):
        player.start_time = str(datetime.now(timezone.utc))


page_sequence = [PreProcess, Feedback]
