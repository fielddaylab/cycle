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
  self.event_id = 0;
  self.event_progress = 0;

  self.transitions = 0;
}

var Player = function()
{
  var self = this;

  self.token_img;

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

  self.turns_per_blast;

  self.turn = 0;
  self.player_turn = 0;
  self.goal_node = undefined;
  self.goal_blast = 0;
}
