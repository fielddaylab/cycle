var constructGame = function(game_data,sr,canv)
{
  var g = new CycleGame();

  var player;
  var node;
  var event;
  var token;
  var total_commonality; //used in populating deck

  g.bg_img.src = "assets/"+game_data.bg_img+".png";
  g.fg_img.src = "assets/"+game_data.fg_img+".png";

  g.noun = game_data.noun;
  g.Noun = game_data.noun.charAt(0).toUpperCase() + game_data.noun.slice(1);
  g.NOUN = game_data.noun.toUpperCase();

  for(var i = 0; i < game_data.players.length && i < 2; i++)
  {
    player = new Player();
    player.id = i+1;
    player.title = game_data.players[i].title;
    player.TITLE = player.title.toUpperCase();

    if(i == 0) player.token_img = red_token_icon;
    if(i == 1) player.token_img = blue_token_icon;
    if(i == 0) player.color = red;
    if(i == 1) player.color = blue;

    g.players.push(player);
  }

  for(var i = 0; i < game_data.nodes.length; i++)
  {
    node = new Node();
    node.id = i+1;
    node.title = game_data.nodes[i].title;
    node.TITLE = node.title.toUpperCase();

    node.wx = game_data.nodes[i].x;
    node.wy = 1-game_data.nodes[i].y;
    node.ww = game_data.nodes[i].w;
    node.wh = game_data.nodes[i].h;

    node.img.src = "assets/"+game_data.nodes[i].img+".png";
    node.icon_img.src = "assets/"+game_data.nodes[i].icon_img+".png";
    node.img = thin_hex_icon;

    //inject id into event data
    for(var j = 0; j < game_data.events.length; j++)
    {
      if(game_data.events[j].from == node.title) game_data.events[j].from_id = node.id;
      if(game_data.events[j].to   == node.title) game_data.events[j].to_id   = node.id;
    }

    g.nodes.push(node);
  }

  total_commonality = 0;
  for(var i = 0; i < game_data.events.length; i++)
  {
    event = new Event();
    event.id = i+1;
    event.title = game_data.events[i].title;
    event.TITLE = event.title.toUpperCase();
    event.flavor = game_data.events[i].flavor;
    event.description  = game_data.events[i].description;
    //NEED TO MANUALLY TWEAK font/width
    event.description_lines = textToLines(canv, "italic 10px Open Sans", 120, event.description);
    event.from_id = game_data.events[i].from_id;
    event.to_id   = game_data.events[i].to_id;
    event.time    = game_data.events[i].time;
    event.amt     = game_data.events[i].amt;
    event.common  = game_data.events[i].common;

    event.start_wx = g.nodes[event.from_id-1].wx;
    event.start_wy = g.nodes[event.from_id-1].wy;
    event.end_wx = g.nodes[event.to_id-1].wx;
    event.end_wy = g.nodes[event.to_id-1].wy;

    total_commonality += game_data.events[i].common;

    synthesizeEventInfo(event);
    g.events.push(event);
  }
  //normalize commonality
  for(var i = 0; i < game_data.events.length; i++)
    g.events[i].common /= total_commonality;

  for(var i = 0; i < game_data.tokens*2; i++)
  {
    token = new Token();
    token.id = i+1;
    token.player_id = (i%g.players.length)+1;
    token.node_id = (Math.floor(i/2)%g.nodes.length)+1; //even
    //token.node_id = Math.floor(sr.next()*g.nodes.length)+1; //random
    token.disp_node_id = token.node_id;
    token.transitions = 0;

    token.ww = 0.02;
    token.wh = 0.02;
    tokenWorldTargetNode(token,g.nodes[token.node_id-1],g.tokens);
    token.wx = token.target_wx;
    token.wy = token.target_wy;

    g.tokens.push(token);
  }

  //count tokens at node
  for(var i = 0; i < g.nodes.length; i++)
  {
    var n = g.nodes[i];
    n.p1_tokens = 0;
    n.p2_tokens = 0;
    for(var j = 0; j < g.tokens.length; j++)
    {
      var t = g.tokens[j];
      if(t.node_id == n.id)
      {
        if(t.player_id == 1) n.p1_tokens++;
        if(t.player_id == 2) n.p2_tokens++;
      }
    }
    n.disp_p1_tokens = n.p1_tokens;
    n.disp_p2_tokens = n.p2_tokens;
  }

  //populate deck
  g.deck = new Deck();
  populateDeck(g.events,game_data.deck,g.deck,sr);
  //deal
  for(var i = 0; i < g.players.length; i++)
  {
    g.players[i].hand = [];
    for(var j = 0; j < game_data.hand-1; j++)
      g.players[i].hand[j] = drawCard(g.deck,sr);
  }
  g.players[0].hand[game_data.hand-1] = drawCard(g.deck,sr); //first player immediately draw one card

  g.turns_per_goal_shift = game_data.goal_shift_turns;
  g.turn = 0;
  g.player_turn = 1;

  g.goal_node = (Math.floor(sr.next()*g.nodes.length))+1;

  var eligibleevts = [];
  for(var i = 0; i < g.events.length; i++)
    if(g.events[i].from_id == g.goal_node) eligibleevts.push(i);
  if(eligibleevts.length)
  {
    var ei = Math.floor(sr.next()*eligibleevts.length);
    g.next_goal_node = g.events[eligibleevts[ei]].to_id;
  }
  else //dead end! route to random
  {
    g.next_goal_node = (Math.floor(sr.next()*g.nodes.length))+1;
  }

  g.goal_shift = g.turns_per_goal_shift;

  pushState(g);

  return g;
}

var pushState = function(g)
{
  var state = new GameState();
  state.turn = g.turn;
  state.player_turn = g.player_turn;
  state.goal_node = g.goal_node;
  var r = 0;
  var b = 0;
  var n;
  var t;
  for(var i = 0; i < g.nodes.length; i++)
  {
    n = g.nodes[i];
    for(var j = 0; j < g.tokens.length; j++)
    {
      t = g.tokens[j];
      if(n.id == t.node_id)
      {
             if(t.player_id == 1) r++;
        else if(t.player_id == 2) b++;
      }
    }
    state.node_red_n.push(r);
    state.node_blue_n.push(b);
  }
  g.history.push(state);
}

var synthesizeEventInfo = function(event)
{
  event.info = "";
  if(event.amt != 1 && event.time != 0)
    event.info = "Moves "+event.amt+" tokens over "+(event.time+1)+" turns.";
  else if(event.amt != 1)
    event.info = "Moves "+event.amt+" tokens.";
  else if(event.time != 0)
    event.info = "Takes "+(event.time+1)+" turns.";
}

var swapDiscardAndShuffle = function(deck,sr)
{
  var tmp;
  var swap;

  //swap discard into deck
  var tmp_stack = deck.discard;
  deck.discard = deck.stack;
  deck.stack = tmp_stack;

  //shuffle
  var n_discarded = deck.discard_i;
  for(var i = 0; i < n_discarded-1; i++)
  {
    swap = i+Math.floor((sr.next()*(n_discarded-i)));
    tmp = deck.stack[i];
    deck.stack[i] = deck.stack[swap];
    deck.stack[swap] = tmp;
  }

  deck.stack_i = 0;
  deck.discard_i = 0;
}

var populateDeck = function(events,n_cards,deck,sr)
{
  var event_i = 0;
  var next_event_threshhold = 0;
  deck.n_cards = n_cards;
  for(var i = 0; i < n_cards; i++)
  {
    while(i/n_cards > next_event_threshhold-0.01 && events[event_i])
    {
      next_event_threshhold += events[event_i].common;
      event_i++;
    }
    deck.discard.push(event_i);
    deck.stack.push(-1);
  }
  deck.stack_i = deck.n_cards;
  deck.discard_i = deck.n_cards;
  swapDiscardAndShuffle(deck,sr);
}

var drawCard = function(deck,sr)
{
  if(deck.stack_i >= deck.n_cards || deck.stack[deck.stack_i] == -1)
    swapDiscardAndShuffle(deck,sr);
  var card = deck.stack[deck.stack_i];
  deck.stack[deck.stack_i] = -1;
  deck.stack_i++;
  return card;
}

var discardCard = function(card,deck)
{
  deck.discard[deck.discard_i] = card;
  deck.discard_i++;
}

var playCard = function(game, index, target, sr)
{
  var delta = new StateDelta();
  delta.player_turn = game.player_turn;
  delta.event_id = game.players[game.player_turn-1].hand[index];
  delta.player_target = target;
  for(var i = 0; i < game.nodes.length; i++)
  {
    delta.node_red_delta_n[i] = 0;
    delta.node_blue_delta_n[i] = 0;
  }

  //choose/move tokens
  var event = game.events[delta.event_id-1];
  var token;
  var eligibletoks = [];
  for(var i = 0; i < game.tokens.length; i++)
    if(game.tokens[i].node_id == event.from_id && game.tokens[i].player_id == target) eligibletoks.push(i);
  for(var i = 0; i < event.amt && eligibletoks.length > 0; i++)
  {
    var ei = Math.floor(sr.next()*eligibletoks.length);
    token = game.tokens[eligibletoks[ei]];
    token.disp_node_id = token.node_id;
    token.node_id = 0;
    token.event_id = event.id;
    token.event_progress = 0;

    //delta away from node
         if(token.player_id == 1) delta.node_red_delta_n[token.disp_node_id-1]--;
    else if(token.player_id == 2) delta.node_blue_delta_n[token.disp_node_id-1]--;

    if(token.event_progress == event.time)
    {
      token.node_id = event.to_id;
      token.event_id = 0;
      token.event_progress = 0;
      token.transitions++;
      tokenWorldTargetNode(token,game.nodes[token.node_id-1],game.tokens);

           if(token.player_id == 1) delta.node_red_delta_n[token.node_id-1]--;
      else if(token.player_id == 2) delta.node_blue_delta_n[token.node_id-1]--;
    }
    else
      tokenWorldTargetEvent(token,game.events[token.event_id-1],token.event_progress);

    eligibletoks.splice(ei,1);
  }

  //distribute cards
  discardCard(game.players[game.player_turn-1].hand[index],game.deck);
  game.players[game.player_turn-1].hand.splice(index,1);
  game.player_turn = (game.player_turn%game.players.length)+1;
  game.players[game.player_turn-1].hand.push(drawCard(game.deck,sr));

  if(game.player_turn == 1)
  {
    game.turn++;

    //update token progress
    for(var i = 0; i < game.tokens.length; i++)
    {
      token = game.tokens[i];
      if(token.event_id)
      {
        event = game.events[token.event_id-1];
        token.event_progress++;
        if(token.event_progress >= event.time+1)
        {
          token.node_id = event.to_id;
          token.event_id = 0;
          token.event_progress = 0;
          token.transitions++;
          tokenWorldTargetNode(token,game.nodes[token.node_id-1],game.tokens);
        }
        else
          tokenWorldTargetEvent(token,game.events[token.event_id-1],token.event_progress);
      }
    }

    //score points
    var t;
    for(var i = 0; i < game.tokens.length; i++)
    {
      t = game.tokens[i];
      if(t.node_id == game.goal_node)
      {
        if(t.player_id == 1) delta.pts_red_delta_n++;
        if(t.player_id == 2) delta.pts_blue_delta_n++;
        game.players[t.player_id-1].pts++;
      }
    }

    game.goal_shift--;
    //move goal
    if(game.goal_shift == 0)
    {
      game.goal_shift = game.turns_per_goal_shift;

      game.goal_node = game.next_goal_node;

      var eligibleevts = [];
      for(var i = 0; i < game.events.length; i++)
        if(game.events[i].from_id == game.goal_node) eligibleevts.push(i);
      if(eligibleevts.length)
      {
        var ei = Math.floor(sr.next()*eligibleevts.length);
        game.next_goal_node = game.events[eligibleevts[ei]].to_id;
      }
      else //dead end! route to random
      {
        game.next_goal_node = (Math.floor(sr.next()*game.nodes.length))+1;
      }
    }
  }

  //count tokens at node
  for(var i = 0; i < game.nodes.length; i++)
  {
    var n = game.nodes[i];
    n.p1_tokens = 0;
    n.p2_tokens = 0;
    for(var j = 0; j < game.tokens.length; j++)
    {
      var t = game.tokens[j];
      if(t.node_id == n.id)
      {
        if(t.player_id == 1) n.p1_tokens++;
        if(t.player_id == 2) n.p2_tokens++;
      }
    }
  }

  game.deltas.push(delta);
  pushState(game);
}

