var GamePlayScene = function(game, stage)
{
  var self = this;

  var dc = stage.drawCanv;
  var clicker;

  var nodes;
  var edges;
  var events;

  var players;
  var tokens;

  var deck;
  var discard;
  var turn;
  var player_turn;

  //ui only
  var cards;

  self.ready = function()
  {
    clicker = new Clicker({source:stage.dispCanv.canvas});

    constructGame(CarbonCycleGameTemplate);

    var card;
    cards = [];
    var size = ((dc.width-10)/players[0].hand.length)-10;
    for(var i = 0; i < players[0].hand.length; i++)
    {
      card = new Card();
      card.index = i;

      card.x = 10+i*(size+10);
      card.y = dc.height-10-size;
      card.w = size;
      card.h = size;

      cards.push(card);
      clicker.register(card);
    }
  };

  self.tick = function()
  {
    clicker.flush();

    var token;
    for(var i = 0; i < tokens.length; i++)
    {
      token = tokens[i];
      token.wx = lerp(token.wx,token.target_wx,0.1);
      token.wy = lerp(token.wy,token.target_wy,0.1);
      transformToScreen(token);
    }
  };

  self.draw = function()
  {
    dc.context.fillStyle = "#000000";
    dc.context.strokeStyle = "#000000";

    //edges
    dc.context.strokeStyle = "#000000";
    for(var i = 0; i < edges.length; i++)
    {
      dc.context.beginPath();
      dc.context.moveTo(edges[i].start_x,edges[i].start_y);
      dc.context.lineTo(edges[i].end_x,edges[i].end_y);
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
    //hand
    var player = players[player_turn-1];
    for(var i = 0; i < player.hand.length; i++)
    {
      var event = events[player.hand[i]-1];
      dc.context.strokeRect(cards[i].x,cards[i].y,cards[i].w,cards[i].h);
      dc.context.fillText(event.title,cards[i].x+10,cards[i].y+20);
    }

    //info
    dc.context.fillText("Turn: "+turn,10,30);
    dc.context.fillText("Player: "+player_turn,10,50);
  };

  self.cleanup = function()
  {

  };

  var shuffleDeck = function()
  {
    var tmp;
    var swap;
    for(var i = 0; i < deck.length-1; i++)
    {
      swap = i+Math.floor((Math.random()*(deck.length-i)));
      tmp = deck[i];
      deck[i] = deck[swap];
      deck[swap] = tmp;
    }
  }

  var drawCard = function()
  {
    var card = deck[0];
    deck.splice(0,1);
    return card;
  }

  var discardCard = function(c)
  {
    discard.push(c);
  }

  var playCard = function(index)
  {
    var event = events[players[player_turn-1].hand[index]-1];
    var edge = edges[event.edge_id-1];
    var token;
    var eligibletoks = [];
    for(var i = 0; i < tokens.length; i++)
    {
      if(tokens[i].node_id == edge.from_id) eligibletoks.push(i);
    }
    for(var i = 0; i < event.amt && eligibletoks.length > 0; i++)
    {
      var ei = Math.floor(Math.random()*eligibletoks.length);
      token = tokens[eligibletoks[ei]];
      token.node_id = 0;
      token.edge_id = edge.id;
      token.edge_progress = 0;

      eligibletoks.splice(ei,1);
    }

    //update token progress
    for(var i = 0; i < tokens.length; i++)
    {
      token = tokens[i];
      if(token.edge_id)
      {
        edge = edges[token.edge_id-1];
        token.edge_progress++;
        if(token.edge_progress == edge.time+1)
        {
          token.node_id = edge.to_id;
          token.edge_id = 0;
          token.edge_progress = 0;
          token.transitions++;
          tokenWorldTargetNode(token,nodes[token.node_id-1]);
        }
        else
          tokenWorldTargetEdge(token,edges[token.edge_id-1],token.edge_progress);
      }
    }

    discardCard(players[player_turn-1].hand[index]);
    players[player_turn-1].hand.splice(index,1);
    players[player_turn-1].hand.push(drawCard());
    if(deck.length == 0)
    {
      deck = discard;
      discard = [];
      shuffleDeck();
    }

    player_turn = (player_turn%players.length)+1;
    if(player_turn == 1) turn++;
  }

  var constructGame = function(game_data)
  {
    var player;
    var node;
    var edge;
    var event;

    var token;
    var total_commonality; //used in populating deck

    players = [];
    for(var i = 0; i < game_data.players.length; i++)
    {
      player = new Player();
      player.id = i+1;
      player.title = game_data.players[i].title;

      if(i == 0) player.token_img = red_circle_icon;
      if(i == 1) player.token_img = blue_circle_icon;

      players.push(player);
    }

    nodes = [];
    for(var i = 0; i < game_data.nodes.length; i++)
    {
      node = new Node();
      node.id = i+1;
      node.title = game_data.nodes[i].title;

      node.wx = game_data.nodes[i].x;
      node.wy = 1-game_data.nodes[i].y;
      node.ww = game_data.nodes[i].w;
      node.wh = game_data.nodes[i].h;
      transformToScreen(node);

      node.img = circle_icon;

      //inject id into edge data
      for(var j = 0; j < game_data.edges.length; j++)
      {
        if(game_data.edges[j].from == node.title) game_data.edges[j].from_id = node.id;
        if(game_data.edges[j].to   == node.title) game_data.edges[j].to_id   = node.id;
      }

      nodes.push(node);
    }

    edges = [];
    for(var i = 0; i < game_data.edges.length; i++)
    {
      edge = new Edge();
      edge.id = i+1;
      edge.title   = game_data.edges[i].title;
      edge.from_id = game_data.edges[i].from_id;
      edge.to_id   = game_data.edges[i].to_id;
      edge.time    = game_data.edges[i].time;

      edge.start_wx = nodes[edge.from_id-1].wx;
      edge.start_wy = nodes[edge.from_id-1].wy;
      edge.end_wx = nodes[edge.to_id-1].wx;
      edge.end_wy = nodes[edge.to_id-1].wy;
      transformEdgeToScreen(edge);

      //inject id into event data
      for(var j = 0; j < game_data.events.length; j++)
      {
        if(game_data.events[j].edge == edge.title) game_data.events[j].edge_id = edge.id;
      }

      edges.push(edge);
    }

    events = [];
    total_commonality = 0;
    for(var i = 0; i < game_data.events.length; i++)
    {
      event = new Event();
      event.id = i+1;
      event.title = game_data.events[i].title;
      event.edge_id = game_data.events[i].edge_id;
      event.amt     = game_data.events[i].amt;

      total_commonality += game_data.events[i].common;

      events.push(event);
    }

    tokens = [];
    for(var i = 0; i < 10; i++)
    {
      token = new Token();
      token.id = i+1;
      token.player_id = (i%players.length)+1;
      token.node_id = Math.floor(Math.random()*nodes.length)+1;
      token.transitions = 0;

      token.ww = 0.01;
      token.wh = 0.01;
      tokenWorldTargetNode(token,nodes[token.node_id-1]);
      token.wx = token.target_wx;
      token.wy = token.target_wy;
      transformToScreen(token);

      tokens.push(token);
    }

    deck = [];
    discard = [];
    //populate deck
      //normalize commonality
    for(var i = 0; i < game_data.events.length; i++)
      game_data.events[i].common /= total_commonality;
    var event_i = 0;
    var next_event_threshhold = 0;
    for(var i = 0; i < game_data.deck; i++)
    {
      while(i/game_data.deck > next_event_threshhold-0.01 && game_data.events[event_i])
      {
        next_event_threshhold += game_data.events[event_i].common;
        event_i++;
      }
      deck.push(event_i);
    }
    shuffleDeck();
    //deal
    for(var i = 0; i < players.length; i++)
    {
      players[i].hand = [];
      for(var j = 0; j < game_data.hand; j++)
        players[i].hand.push(drawCard());
    }

    turn = 0;
    player_turn = 1;
  }

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

  var Edge = function()
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
    self.title = "Edge";
    self.from_id = 0;
    self.to_id = 0;
    self.time = 0;
  }

  var Event = function()
  {
    var self = this;

    self.id = 0;
    self.title = "Event";
    self.edge_id = 0;
    self.amt = 0;
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
    self.edge_id = 0;
    self.edge_progress = 0;

    self.transitions = 0;
  }

  var Player = function()
  {
    var self = this;

    self.token_img;

    self.id = 0;
    self.title = "Player";

    self.hand = [];
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
      playCard(self.index);
    }
  }

  var transformToScreen = function(o)
  {
    o.w = dc.width*o.ww;
    o.h = dc.height*o.wh;
    o.x = o.wx*dc.width-o.w/2;
    o.y = o.wy*dc.height-o.h/2;
  }
  var transformEdgeToScreen = function(e)
  {
    e.start_x = e.start_wx*dc.width;
    e.start_y = e.start_wy*dc.height;
    e.end_x = e.end_wx*dc.width;
    e.end_y = e.end_wy*dc.height;
    e.mid_x = (e.start_x+e.end_x)/2;
    e.mid_y = (e.start_y+e.end_y)/2;
  }
  var tokenWorldTargetEdge = function(t,e,progress)
  {
    t.target_wx = lerp(e.start_wx,e.end_wx,progress/(e.time+1))-0.01+Math.random()*0.02;
    t.target_wy = lerp(e.start_wy,e.end_wy,progress/(e.time+1))-0.01+Math.random()*0.02;
  }
  var tokenWorldTargetNode = function(t,n)
  {
    t.target_wx = n.wx-(n.ww/2)+Math.random()*n.ww;
    t.target_wy = n.wy-(n.wh/2)+Math.random()*n.wh;
  }

  var circle_icon = GenIcon();
  circle_icon.context.fillStyle = "#555555";
  circle_icon.context.beginPath();
  circle_icon.context.arc(circle_icon.width/2,circle_icon.height/2,circle_icon.width/2,0,2*Math.PI);
  circle_icon.context.fill();

  var red_circle_icon = GenIcon();
  red_circle_icon.context.fillStyle = "#FF0000";
  red_circle_icon.context.beginPath();
  red_circle_icon.context.arc(red_circle_icon.width/2,red_circle_icon.height/2,red_circle_icon.width/2,0,2*Math.PI);
  red_circle_icon.context.fill();

  var blue_circle_icon = GenIcon();
  blue_circle_icon.context.fillStyle = "#0000FF";
  blue_circle_icon.context.beginPath();
  blue_circle_icon.context.arc(blue_circle_icon.width/2,blue_circle_icon.height/2,blue_circle_icon.width/2,0,2*Math.PI);
  blue_circle_icon.context.fill();

  //TEMPLATE

  var GameTemplate =
  {
    deck:100,
    hand:5,
    players:
      [
        {
          title:"PlayerA",
          token_img:"red_circle",
        },
        {
          title:"PlayerB",
          token_img:"blue_circle",
        },
      ],
    nodes:
      [
        {
          title:"A",
          img:"circle",
          x:0.2,
          y:0.2,
          w:0.1,
          h:0.1,
        },
        {
          title:"B",
          img:"circle",
          x:0.4,
          y:0.1,
          w:0.1,
          h:0.1,
        },
        {
          title:"C",
          img:"circle",
          x:0.6,
          y:0.8,
          w:0.1,
          h:0.1,
        },
        {
          title:"D",
          img:"circle",
          x:0.7,
          y:0.4,
          w:0.1,
          h:0.1,
        },
      ],
    edges:
      [
        {
          title:"EA",
          from:"A",
          to:"B",
          time:0,
        },
        {
          title:"EB",
          from:"B",
          to:"C",
          time:0,
        },
        {
          title:"EC",
          from:"C",
          to:"D",
          time:0,
        },
        {
          title:"ED",
          from:"D",
          to:"B",
          time:0,
        },
        {
          title:"EE",
          from:"A",
          to:"C",
          time:0,
        },
        {
          title:"EE",
          from:"D",
          to:"B",
          time:0,
        },
      ],
    events:
      [
        {
          title:"EvA",
          edge:"EA",
          amt:1,
          common:1,
        },
        {
          title:"EvB",
          edge:"EB",
          amt:1,
          common:1,
        },
        {
          title:"EvC",
          edge:"EC",
          amt:1,
          common:1,
        },
        {
          title:"EvD",
          edge:"ED",
          amt:1,
          common:1,
        },
        {
          title:"EvE",
          edge:"EE",
          amt:1,
          common:1,
        },
      ],
  };

  var CarbonCycleGameTemplate =
  {
    deck:100,
    hand:5,
    players:
      [
        {
          title:"PlayerA",
          token_img:"red_circle",
        },
        {
          title:"PlayerB",
          token_img:"blue_circle",
        },
      ],
    nodes:
      [
        {
          title:"Earth",
          img:"circle",
          x:0.5,
          y:0.5,
          w:0.1,
          h:0.1,
        },
        {
          title:"Atmosphere",
          img:"circle",
          x:0.1,
          y:0.5,
          w:0.1,
          h:0.1,
        },
        {
          title:"Plants",
          img:"circle",
          x:0.3,
          y:0.8,
          w:0.1,
          h:0.1,
        },
        {
          title:"Animals",
          img:"circle",
          x:0.7,
          y:0.8,
          w:0.1,
          h:0.1,
        },
        {
          title:"Fuel",
          img:"circle",
          x:0.7,
          y:0.4,
          w:0.1,
          h:0.1,
        },
      ],
    edges:
      [
        {
          title:"Photosynthesis",
          from:"Atmosphere",
          to:"Plants",
          time:0,
        },
        {
          title:"Eat",
          from:"Plants",
          to:"Animals",
          time:0,
        },
        {
          title:"Respiration",
          from:"Animals",
          to:"Atmosphere",
          time:0,
        },
        {
          title:"Animal Death",
          from:"Animals",
          to:"Earth",
          time:0,
        },
        {
          title:"Plant Death",
          from:"Plants",
          to:"Earth",
          time:0,
        },
        {
          title:"Combustion",
          from:"Fuel",
          to:"Atmosphere",
          time:0,
        },
        {
          title:"Composition",
          from:"Earth",
          to:"Fuel",
          time:10,
        },
      ],
    events:
      [
        {
          title:"Photosynth",
          edge:"Photosynthesis",
          amt:1,
          common:1,
        },
        {
          title:"Eat",
          edge:"Eat",
          amt:1,
          common:1,
        },
        {
          title:"Respiration",
          edge:"Respiration",
          amt:1,
          common:1,
        },
        {
          title:"Animal Death",
          edge:"Animal Death",
          amt:1,
          common:1,
        },
        {
          title:"Plant Death",
          edge:"Plant Death",
          amt:1,
          common:1,
        },
        {
          title:"Combustion",
          edge:"Combustion",
          amt:1,
          common:1,
        },
        {
          title:"Composition",
          edge:"Composition",
          amt:1,
          common:1,
        },
      ],
  };

};

