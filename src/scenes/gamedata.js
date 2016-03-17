var Node = function()
{
  var self = this;

  self.x = 0;
  self.y = 0;
  self.w = 0;
  self.h = 0;

  self.wx = 0;
  self.wy = 0;
  self.ww = 0;
  self.wh = 0;

  self.img = "";

  self.id = 0;
  self.title = "Node";

  self.p1_tokens = 0;
  self.p2_tokens = 0;
  self.disp_p1_tokens = 0;
  self.disp_p2_tokens = 0;
}

var Event = function()
{
  var self = this;

  self.start_x = 0;
  self.start_y = 0;
  self.mid_x = 0;
  self.mid_y = 0;
  self.end_x = 0;
  self.end_y = 0;

  self.start_wx = 0;
  self.start_wy = 0;
  self.end_wx = 0;
  self.end_wy = 0;

  self.id = 0;
  self.title = "Event";
  self.from_id = 0;
  self.to_id = 0;
  self.time = 0;

  self.amt = 0;
  self.common = 1;
}

var Token = function()
{
  var self = this;

  self.x = 0;
  self.y = 0;
  self.w = 0;
  self.h = 0;

  self.wx = 0;
  self.wy = 0;
  self.ww = 0;
  self.wh = 0;

  self.target_wx = 0;
  self.target_wy = 0;

  self.id = 0;
  self.player_id = 0;

  self.node_id = 0;
  self.disp_node_id = 0;
  self.event_id = 0;
  self.event_progress = 0;

  self.transitions = 0;
}

var Player = function()
{
  var self = this;

  self.token_img = undefined;
  self.color = "#000000";

  self.id = 0;
  self.title = "Player";

  self.hand = [];
  self.pts = 0;
  self.disp_pts = 0;
}

var Deck = function()
{
  var self = this;

  self.stack = [];
  self.stack_i = 0;
  self.discard = [];
  self.discard_i = 0;
}

var CycleGame = function()
{
  var self = this;
  self.nodes = [];
  self.events = [];
  self.players = [];
  self.tokens = [];
  self.deck = new Deck();

  self.turns_per_goal_shift;

  self.turn = 0;
  self.player_turn = 0;
  self.goal_node = 0;
  self.goal_shift = 0;

  self.last_goal_node = 0;
  self.last_event = 0;
  self.last_target = 0;
}

