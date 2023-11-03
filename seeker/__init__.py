from otree.api import *
import random

doc = """
An empty page that passes the variable of each trajectory.
There are 10 different apps like this, each with a matching variable.
"""


class C(BaseConstants):
    NAME_IN_URL = 'PassVarsOpener'
    PLAYERS_PER_GROUP = None
    NUM_ROUNDS = 1


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    pass


class Player(BasePlayer):
    pass


# PAGES
class PassVars(Page):
    @staticmethod
    def app_after_this_page(player: Player, upcoming_apps):
        player.participant.role = "seeker"
        player.participant.ended_successfully = False


page_sequence = [PassVars]
