var GamePlayScene = function(game, stage)
{
  var self = this;

  var dc = stage.drawCanv;
  var clicker;
  var card_clicker;

  ENUM = 0;
  var TURN_CHOOSE   = ENUM; ENUM++;
  var TURN_TOGETHER = ENUM; ENUM++;
  var TURN_AWAY     = ENUM; ENUM++;
  var TURN_WAIT     = ENUM; ENUM++;

  var turn_stage;

  //game definition
  var nodes;
  var events;

  //game state
  var goal_node;

  var players;
  var tokens;

  var deck;

  var turn;
  var player_turn;

  var chosen_card;

  //ui only
  var hit_ui;
  var cards;
  var commit_btn;
  var ready_btn;

  self.ready = function()
  {
    clicker = new Clicker({source:stage.dispCanv.canvas});
    card_clicker = new Clicker({source:stage.dispCanv.canvas});

    players = [];
    nodes = [];
    events = [];
    tokens = [];
    var deck_ptr = {}; //so bad
    constructGame(CarbonCycleGameTemplate,game.players,players,nodes,events,tokens,deck_ptr);
    deck = deck_ptr.deck;
    transformGame(dc,nodes,events,tokens)

    turn = 0;
    player_turn = 1;

    var card;
    cards = [];
    var size = ((dc.width-10)/players[0].hand.length)-10;
    for(var i = 0; i < players[0].hand.length; i++)
    {
      card = new Card();
      card.index = i;

      card.w = size;
      card.h = 100;
      card.x = 10+i*(card.w+10);
      card.y = dc.height-10-card.h;

      cards.push(card);
      card_clicker.register(card);
    }

    commit_btn = new ButtonBox(10,dc.height-110,dc.width-20,100,function(){ if(hit_ui || turn_stage != TURN_TOGETHER) return; playCard(chosen_card); turn_stage = TURN_AWAY; hit_ui = true; });
    ready_btn  = new ButtonBox(10,dc.height-110,dc.width-20,100,function(){ if(hit_ui || turn_stage != TURN_AWAY)     return; turn_stage = TURN_CHOOSE; hit_ui = true; });
    clicker.register(commit_btn);
    clicker.register(ready_btn);

    turn_stage = TURN_CHOOSE;
  };

  self.tick = function()
  {
    switch(turn_stage)
    {
      case TURN_CHOOSE:
        card_clicker.flush();
        clicker.ignore();
        break;
      case TURN_TOGETHER:
      case TURN_AWAY:
      case TURN_WAIT:
        clicker.flush();
        card_clicker.ignore();
        break;
    }
    hit_ui = false;

    var token;
    for(var i = 0; i < tokens.length; i++)
    {
      token = tokens[i];
      token.wx = lerp(token.wx,token.target_wx,0.1);
      token.wy = lerp(token.wy,token.target_wy,0.1);
      transformToScreen(dc,token);
    }
  };

  self.draw = function()
  {
    dc.context.fillStyle = "#000000";
    dc.context.strokeStyle = "#000000";

    //events
    dc.context.strokeStyle = "#000000";
    for(var i = 0; i < events.length; i++)
    {
      dc.context.beginPath();
      dc.context.moveTo(events[i].start_x,events[i].start_y);
      dc.context.lineTo(events[i].end_x,events[i].end_y);
      dc.context.stroke();
    }
    //nodes
    for(var i = 0; i < nodes.length; i++)
    {
      dc.context.drawImage(nodes[i].img,nodes[i].x,nodes[i].y,nodes[i].w,nodes[i].h);
      dc.context.fillText(nodes[i].title,nodes[i].x,nodes[i].y+20);
    }
    //tokens
    for(var i = 0; i < tokens.length; i++)
      dc.context.drawImage(players[tokens[i].player_id-1].token_img,tokens[i].x,tokens[i].y,tokens[i].w,tokens[i].h);


    switch(turn_stage)
    {
      case TURN_CHOOSE:
        //hand
        var player = players[player_turn-1];
        for(var i = 0; i < player.hand.length; i++)
        {
          var event = events[player.hand[i]-1];
          dc.context.strokeRect(cards[i].x,cards[i].y,cards[i].w,cards[i].h);
          dc.context.fillText(event.title,cards[i].x+10,cards[i].y+20);
        }
        break;
      case TURN_TOGETHER:
        //commit_btn.draw(dc);
        dc.context.fillStyle = "#000000";
        dc.context.strokeRect(commit_btn.x,commit_btn.y,commit_btn.w,commit_btn.h);
        dc.context.fillText("Card Chosen:"+events[players[player_turn-1].hand[chosen_card]-1].title,commit_btn.x+20,commit_btn.y+20);
        dc.context.fillText("When both players have seen, click to continue.",commit_btn.x+20,commit_btn.y+40);
        break;
      case TURN_AWAY:
        //ready_btn.draw(dc);
        dc.context.fillStyle = "#000000";
        dc.context.strokeRect(ready_btn.x,ready_btn.y,ready_btn.w,ready_btn.h);
        dc.context.fillText("All players except "+players[player_turn-1].title+" look away.",ready_btn.x+20,ready_btn.y+20);
        dc.context.fillText("When ready, click to continue.",ready_btn.x+20,ready_btn.y+40);
        break;
      case TURN_WAIT:
        break;
    }

    //info
    dc.context.fillStyle = "#000000";
    dc.context.fillText("Turn: "+turn,10,30);
    dc.context.fillText("Player: "+player_turn,10,50);
  };

  self.cleanup = function()
  {

  };

  var chooseCard = function(index)
  {
    chosen_card = index;
  }
  var playCard = function(index)
  {
    var event = events[players[player_turn-1].hand[index]-1];
    var token;
    var eligibletoks = [];
    for(var i = 0; i < tokens.length; i++)
    {
      if(tokens[i].node_id == event.from_id) eligibletoks.push(i);
    }
    for(var i = 0; i < event.amt && eligibletoks.length > 0; i++)
    {
      var ei = Math.floor(Math.random()*eligibletoks.length);
      token = tokens[eligibletoks[ei]];
      token.node_id = 0;
      token.event_id = event.id;
      token.event_progress = 0;

      eligibletoks.splice(ei,1);
    }

    //update token progress
    for(var i = 0; i < tokens.length; i++)
    {
      token = tokens[i];
      if(token.event_id)
      {
        event = events[token.event_id-1];
        token.event_progress++;
        if(token.event_progress == event.time+1)
        {
          token.node_id = event.to_id;
          token.event_id = 0;
          token.event_progress = 0;
          token.transitions++;
          tokenWorldTargetNode(token,nodes[token.node_id-1]);
        }
        else
          tokenWorldTargetEvent(token,events[token.event_id-1],token.event_progress);
      }
    }

    discardCard(players[player_turn-1].hand[index],deck);
    players[player_turn-1].hand.splice(index,1);
    player_turn = (player_turn%players.length)+1;
    players[player_turn-1].hand.push(drawCard(deck));
    if(player_turn == 1) turn++;
  }

  //no data- just used for interface
  var Card = function()
  {
    var self = this;

    self.index = 0; //index into current player's hand

    self.x;
    self.y;
    self.w;
    self.h;

    self.click = function(evt)
    {
      if(hit_ui) return;
      chooseCard(self.index);
      turn_stage = TURN_TOGETHER;
      hit_ui = true;
    }
  }
};

