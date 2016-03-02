var constructGame = function(game_data,n_players)
{
  var g = new CycleGame();

  var player;
  var node;
  var event;
  var token;
  var total_commonality; //used in populating deck

  for(var i = 0; i < game_data.players.length && i < n_players; i++)
  {
    player = new Player();
    player.id = i+1;
    player.title = game_data.players[i].title;

    if(i == 0) player.token_img = red_circle_icon;
    if(i == 1) player.token_img = blue_circle_icon;
    if(i == 2) player.token_img = green_circle_icon;
    if(i == 3) player.token_img = yellow_circle_icon;

    g.players.push(player);
  }

  for(var i = 0; i < game_data.nodes.length; i++)
  {
    node = new Node();
    node.id = i+1;
    node.title = game_data.nodes[i].title;

    node.wx = game_data.nodes[i].x;
    node.wy = 1-game_data.nodes[i].y;
    node.ww = game_data.nodes[i].w;
    node.wh = game_data.nodes[i].h;

    node.img = circle_icon;

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
    token.node_id = Math.floor(Math.random()*g.nodes.length)+1;
    token.transitions = 0;

    token.ww = 0.01;
    token.wh = 0.01;
    tokenWorldTargetNode(token,g.nodes[token.node_id-1]);
    token.wx = token.target_wx;
    token.wy = token.target_wy;

    g.tokens.push(token);
  }

  //populate deck
  g.deck = new Deck();
  populateDeck(g.events,game_data.deck,g.deck);
  //deal
  for(var i = 0; i < g.players.length; i++)
  {
    g.players[i].hand = [];
    for(var j = 0; j < game_data.hand-1; j++)
      g.players[i].hand[j] = drawCard(g.deck);
  }
  g.players[0].hand[game_data.hand-1] = drawCard(g.deck); //first player immediately draw one card

  g.turn = 0;
  g.player_turn = 1;

  return g;
}

var swapDiscardAndShuffle = function(deck)
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
    swap = i+Math.floor((Math.random()*(n_discarded-i)));
    tmp = deck.stack[i];
    deck.stack[i] = deck.stack[swap];
    deck.stack[swap] = tmp;
  }

  deck.stack_i = 0;
  deck.discard_i = 0;
}

var populateDeck = function(events,n_cards,deck)
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
  swapDiscardAndShuffle(deck);
}

var drawCard = function(deck)
{
  if(deck.stack_i >= deck.n_cards || deck.stack[deck.stack_i] == -1)
    swapDiscardAndShuffle(deck);
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

