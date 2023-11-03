from otree.api import *
from datetime import datetime, timezone

doc = """
Your app description
"""


class C(BaseConstants):
    NAME_IN_URL = 'Exit'
    PLAYERS_PER_GROUP = None
    NUM_ROUNDS = 1


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    pass


class Player(BasePlayer):
    start_time = models.StringField(initial=datetime.now(timezone.utc))
    end_time = models.StringField(blank=True, initial="")


class PreProcess(Page):
    @staticmethod
    def before_next_page(player: Player, timeout_happened):
        player.start_time = str(datetime.now(timezone.utc))


class Exit(Page):
    @staticmethod
    def before_next_page(player: Player, timeout_happened):
        player.end_time = str(datetime.now(timezone.utc))
    @staticmethod
    def js_vars(player: Player):
        return {
            "userAcceptedTerms": player.participant.user_accepted_terms,
            "endedSuccessfully": player.participant.ended_successfully,
        }


page_sequence = [PreProcess, Exit]
