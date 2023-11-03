from otree.api import *
from datetime import datetime, timezone

doc = """
Your app description
"""


class C(BaseConstants):
    NAME_IN_URL = 'consent'
    PLAYERS_PER_GROUP = None
    NUM_ROUNDS = 1


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    pass


class Player(BasePlayer):
    start_time = models.StringField(initial=datetime.now(timezone.utc))
    end_time = models.StringField(blank=True, initial="")
    user_accepted_terms = models.BooleanField(label="Do you agree to participate?", choices=[[True, "Yes"],
        [False, "No"]])


# PAGES
class Consent(Page):
    form_model = "player"
    form_fields = ["user_accepted_terms"]

    @staticmethod
    def app_after_this_page(player: Player, upcoming_apps):
        if player.user_accepted_terms == False:
            return upcoming_apps[-1]

    @staticmethod
    def before_next_page(player: Player, timeout_happened):
        player.end_time = str(datetime.now(timezone.utc))
        player.participant.user_accepted_terms = player.user_accepted_terms

class MissingLabel(Page):
    def is_displayed(player: Player):
        return player.participant.label == None
    def app_after_this_page(player: Player, upcoming_apps):
        return upcoming_apps[-1]
class PreProcess(Page):
    @staticmethod
    def before_next_page(player: Player, timeout_happened):
        player.start_time = str(datetime.now(timezone.utc))


# page_sequence = [PreProcess,MissingLabel, Consent]
page_sequence = [PreProcess, Consent]
