var GamePlayScene = function(game, stage)
{
  var self = this;

  var dc = stage.drawCanv;
  var clicker;
  var card_clicker;

  ENUM = 0;
  var TURN_WAIT_FOR_JOIN = ENUM; ENUM++;
  var TURN_WAIT          = ENUM; ENUM++;
  var TURN_CHOOSE        = ENUM; ENUM++;
  var TURN_TOGETHER      = ENUM; ENUM++;
  var TURN_AWAY          = ENUM; ENUM++;

  var turn_stage;

  //game definition
  var g;

  var chosen_card;
  var blasting_node_i;
  var blasting_t;

  //ui only
  var hit_ui;
  var cards;
  var commit_btn;
  var ready_btn;

  self.ready = function()
  {
    clicker = new Clicker({source:stage.dispCanv.canvas});
    card_clicker = new Clicker({source:stage.dispCanv.canvas});

    g = constructGame(CarbonCycleGameTemplate,game.players);
    transformGame(dc,g.nodes,g.events,g.tokens)

    var card;
    cards = [];
    var size = ((dc.width-10)/g.players[0].hand.length)-10;
    for(var i = 0; i < g.players[0].hand.length; i++)
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
    ready_btn  = new ButtonBox(10,dc.height-110,dc.width-20,100,
      function()
      {
        if(hit_ui || turn_stage != TURN_AWAY) return;
        if(game.multiplayer == MULTIPLAYER_LOCAL)
          turn_stage = TURN_CHOOSE;
        else if(game.multiplayer == MULTIPLAYER_NET_CREATE)
        {
          if(self.player_turn == 1) turn_stage = TURN_CHOOSE;
          else turn_stage = TURN_WAIT;
        }
        else if(game.multiplayer == MULTIPLAYER_NET_JOIN)
        {
          if(self.player_turn == 1) turn_stage = TURN_WAIT;
          else turn_stage = TURN_CHOOSE;
        }
        hit_ui = true;
      }
    );
    clicker.register(commit_btn);
    clicker.register(ready_btn);

    if(game.multiplayer == MULTIPLAYER_LOCAL)
      turn_stage = TURN_CHOOSE;
    else if(game.multiplayer == MULTIPLAYER_NET_CREATE)
      turn_stage = TURN_WAIT_FOR_JOIN;
    else if(game.multiplayer == MULTIPLAYER_NET_JOIN)
      turn_Stage = TURN_WAIT;

    chosen_card = -1;
    blasting_node_i = -1;
    blasting_t = 0;
  };

  self.tick = function()
  {
    switch(turn_stage)
    {
      case TURN_WAIT_FOR_JOIN:
        if(cli.updated)
        {
          for(var i = cli.last_known+1; i < cli.database.length; i++)
          {
            if(cli.database[i].event == "JOIN" && cli.database[i].args[0] == cli.id)
            {
              cli.opponent = cli.database[i].user;
              turn_stage = TURN_CHOOSE;
            }
          }
          cli.last_known = cli.database.length-1;
          cli.updated = false;
        }
        break;
      case TURN_WAIT:
        if(cli.updated)
        {
          for(var i = cli.last_known+1; i < cli.database.length; i++)
          {
            if(cli.database[i].user == cli.opponent && cli.database[i].event == "MOVE")
            {
              chosen_card = cli.database[i].args[0];
              turn_stage = TURN_TOGETHER;
            }
          }
          cli.last_known = cli.database.length-1;
          cli.updated = false;
        }
        break;
      case TURN_CHOOSE:
        card_clicker.flush();
        clicker.ignore();
        break;
      case TURN_TOGETHER:
      case TURN_AWAY:
        clicker.flush();
        card_clicker.ignore();
        break;
    }
    hit_ui = false;

    var token;
    for(var i = 0; i < g.tokens.length; i++)
    {
      token = g.tokens[i];
      token.wx = lerp(token.wx,token.target_wx,0.1);
      token.wy = lerp(token.wy,token.target_wy,0.1);
      transformToScreen(dc,token);
    }

    if(!blasting_t)
    {
      for(var i = 0; i < g.players.length; i++)
      {
        if(g.players[i].pts > g.players[i].disp_pts)
          g.players[i].disp_pts++;
      }
    }
  };

  self.draw = function()
  {
    dc.context.fillStyle = "#000000";
    dc.context.strokeStyle = "#000000";

    //events
    dc.context.strokeStyle = "#000000";
    for(var i = 0; i < g.events.length; i++)
    {
      dc.context.beginPath();
      dc.context.moveTo(g.events[i].start_x,g.events[i].start_y);
      dc.context.lineTo(g.events[i].end_x,g.events[i].end_y);
      dc.context.stroke();
    }
    //nodes
    for(var i = 0; i < g.nodes.length; i++)
    {
      dc.context.drawImage(g.nodes[i].img,g.nodes[i].x,g.nodes[i].y,g.nodes[i].w,g.nodes[i].h);
      dc.context.fillText(g.nodes[i].title,g.nodes[i].x,g.nodes[i].y+20);
    }
    //tokens
    for(var i = 0; i < g.tokens.length; i++)
      dc.context.drawImage(g.players[g.tokens[i].player_id-1].token_img,g.tokens[i].x,g.tokens[i].y,g.tokens[i].w,g.tokens[i].h);

    var n = g.nodes[g.goal_node-1];
    dc.context.strokeRect(n.x,n.y,n.w,n.h);
    if(blasting_node_i != -1)
    {
      var n = g.nodes[blasting_node_i];
      var w = Math.sin(blasting_t);
      dc.context.strokeRect(n.x-w,n.y-w,n.w+2*w,n.h+2*w);
      blasting_t--;
      if(blasting_t <= 0)
      {
        blasting_node_i = -1;
        blasting_t = 0;
      }
    }

    switch(turn_stage)
    {
      case TURN_WAIT_FOR_JOIN:
        break;
      case TURN_WAIT:
        break;
      case TURN_CHOOSE:
        //hand
        var player = g.players[g.player_turn-1];
        for(var i = 0; i < player.hand.length; i++)
        {
          var event = g.events[player.hand[i]-1];
          dc.context.strokeRect(cards[i].x,cards[i].y,cards[i].w,cards[i].h);
          dc.context.fillText(event.title,cards[i].x+10,cards[i].y+20);
        }
        break;
      case TURN_TOGETHER:
        //commit_btn.draw(dc);
        dc.context.fillStyle = "#000000";
        dc.context.strokeRect(commit_btn.x,commit_btn.y,commit_btn.w,commit_btn.h);
        dc.context.fillText("Card Chosen:"+g.events[g.players[g.player_turn-1].hand[chosen_card]-1].title,commit_btn.x+20,commit_btn.y+20);
        dc.context.fillText("When both players have seen, click to continue.",commit_btn.x+20,commit_btn.y+40);
        break;
      case TURN_AWAY:
        //ready_btn.draw(dc);
        dc.context.fillStyle = "#000000";
        dc.context.strokeRect(ready_btn.x,ready_btn.y,ready_btn.w,ready_btn.h);
        dc.context.fillText("All players except "+g.players[g.player_turn-1].title+" look away.",ready_btn.x+20,ready_btn.y+20);
        dc.context.fillText("When ready, click to continue.",ready_btn.x+20,ready_btn.y+40);
        break;
    }

    //info
    dc.context.fillStyle = "#000000";
    dc.context.textAlign = "left";
    dc.context.fillText("Turn: "+g.turn,10,30);
    dc.context.fillText("Player: "+g.players[g.player_turn-1].title,10,50);

    dc.context.textAlign = "right";
    for(var i = 0; i < g.players.length; i++)
      dc.context.fillText("Player: "+g.players[i].disp_pts,dc.width-10,30+i*20);

    dc.context.textAlign = "left";
  };

  self.cleanup = function()
  {

  };

  var playCard = function(index)
  {
    var event = g.events[g.players[g.player_turn-1].hand[index]-1];
    var token;
    var eligibletoks = [];
    for(var i = 0; i < g.tokens.length; i++)
      if(g.tokens[i].node_id == event.from_id) eligibletoks.push(i);
    for(var i = 0; i < event.amt && eligibletoks.length > 0; i++)
    {
      var ei = Math.floor(Math.random()*eligibletoks.length);
      token = g.tokens[eligibletoks[ei]];
      token.node_id = 0;
      token.event_id = event.id;
      token.event_progress = 0;

      eligibletoks.splice(ei,1);
    }

    //update token progress
    for(var i = 0; i < g.tokens.length; i++)
    {
      token = g.tokens[i];
      if(token.event_id)
      {
        event = g.events[token.event_id-1];
        token.event_progress++;
        if(token.event_progress == event.time+1)
        {
          token.node_id = event.to_id;
          token.event_id = 0;
          token.event_progress = 0;
          token.transitions++;
          tokenWorldTargetNode(token,g.nodes[token.node_id-1]);
        }
        else
          tokenWorldTargetEvent(token,g.events[token.event_id-1],token.event_progress);
      }
    }

    discardCard(g.players[g.player_turn-1].hand[index],g.deck);
    g.players[g.player_turn-1].hand.splice(index,1);
    g.player_turn = (g.player_turn%g.players.length)+1;
    g.players[g.player_turn-1].hand.push(drawCard(g.deck));
    if(g.player_turn == 1)
    {
      g.turn++;
      g.goal_blast--;
      if(g.goal_blast == 0)
      {
        for(var i = 0; i < g.tokens.length; i++)
        {
          if(g.tokens[i].node_id == g.goal_node)
            g.players[g.tokens[i].player_id-1].pts++;
        }
        blasting_node_i = g.goal_node-1;
        blasting_t = 100;
        g.goal_blast = g.turns_per_blast;
        g.goal_node = (Math.floor(Math.random()*g.nodes.length))+1;
      }
    }
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
      chosen_card = self.index;
      if(game.multiplayer == MULTIPLAYER_NET_CREATE || game.multiplayer == MULTIPLAYER_NET_JOIN)
        cli.add(cli.id+" MOVE "+chosen_card);
      turn_stage = TURN_TOGETHER;
      hit_ui = true;
    }
  }
};

