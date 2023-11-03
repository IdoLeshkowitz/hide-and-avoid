from otree.api import *
import random

doc = """
An empty page that passes the variable of each trajectory.
There are 10 different apps like this, each with a matching variable.
"""


class C(BaseConstants):
    NAME_IN_URL = 'PassVarsHider'
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
    def before_next_page(player: Player, timeout_happened):
        player.participant.role = "hider"
        player.participant.ended_successfully = False


page_sequence = [PassVars]
