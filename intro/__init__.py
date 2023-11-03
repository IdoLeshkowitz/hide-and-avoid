from otree.api import *
from datetime import datetime, timezone


class Player(BasePlayer):
    start_time = models.StringField(blank=True, initial="")
    end_time = models.StringField(blank=True, initial="")


class Intro(Page):
    @staticmethod
    def js_vars(player: Player):
        return {
            "role": player.participant.role,
        }

    @staticmethod
    def before_next_page(player: Player, timeout_happened):
        player.end_time = str(datetime.now(timezone.utc))


class Group(BaseGroup):
    pass


class Subsession(BaseSubsession):
    pass


class C(BaseConstants):
    NAME_IN_URL = 'intro'
    PLAYERS_PER_GROUP = None
    NUM_ROUNDS = 1


class PreProcess(Page):
    @staticmethod
    def before_next_page(player: Player, timeout_happened):
        player.start_time = str(datetime.now(timezone.utc))


page_sequence = [PreProcess,Intro]
