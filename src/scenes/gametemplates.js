var GameTemplate =
{
  tokens:10,
  deck:100,
  hand:5,
  goal_shift_turns:3,
  players:
    [
      {
        title:"PlayerA",
        token_img:"red_circle",
        color:"#FF0000",
      },
      {
        title:"PlayerB",
        token_img:"blue_circle",
        color:"#0000FF",
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
  events:
    [
      {
        title:"EvA",
        from:"A",
        to:"B",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"EvB",
        from:"B",
        to:"C",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"EvC",
        from:"C",
        to:"D",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"EvD",
        from:"D",
        to:"B",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"EvE",
        from:"A",
        to:"C",
        time:0,
        amt:1,
        common:1,
      },
    ],
};

var CarbonCycleGameTemplate =
{
  tokens:10,
  deck:100,
  hand:5,
  goal_shift_turns:3,
  players:
    [
      {
        title:"PlayerA",
        token_img:"red_circle",
        color:"#FF0000",
      },
      {
        title:"PlayerB",
        token_img:"blue_circle",
        color:"#0000FF",
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
  events:
    [
      {
        title:"Photosynth",
        from:"Atmosphere",
        to:"Plants",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"Eat",
        from:"Plants",
        to:"Animals",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"Respiration",
        from:"Animals",
        to:"Atmosphere",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"Animal Death",
        from:"Animals",
        to:"Earth",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"Plant Death",
        from:"Plants",
        to:"Earth",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"Combustion",
        from:"Fuel",
        to:"Atmosphere",
        time:0,
        amt:5,
        common:1,
      },
      {
        title:"Composition",
        from:"Earth",
        to:"Fuel",
        time:1,
        amt:1,
        common:1,
      },
    ],
};

var NewCarbonCycleGameTemplate =
{
  tokens:10,
  deck:100,
  hand:5,
  goal_shift_turns:3,
  players:
    [
      {
        title:"PlayerA",
        token_img:"red_circle",
        color:"#FF0000",
      },
      {
        title:"PlayerB",
        token_img:"blue_circle",
        color:"#0000FF",
      },
    ],
  nodes:
    [
      {
        title:"Atmosphere",
        img:"circle",
        x:0.5,
        y:0.9,
        w:0.1,
        h:0.1,
      },
      {
        title:"Animals",
        img:"circle",
        x:0.1,
        y:0.7,
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
        title:"Earth (Surface)",
        img:"circle",
        x:0.2,
        y:0.5,
        w:0.1,
        h:0.1,
      },
      {
        title:"Earth (Deep)",
        img:"circle",
        x:0.3,
        y:0.4,
        w:0.1,
        h:0.1,
      },
      {
        title:"Fuel",
        img:"circle",
        x:0.6,
        y:0.7,
        w:0.1,
        h:0.1,
      },
      {
        title:"Factory",
        img:"circle",
        x:0.6,
        y:0.4,
        w:0.1,
        h:0.1,
      },
      {
        title:"Ocean (Surface)",
        img:"circle",
        x:0.8,
        y:0.7,
        w:0.1,
        h:0.1,
      },
      {
        title:"Ocean (Deep)",
        img:"circle",
        x:0.8,
        y:0.5,
        w:0.1,
        h:0.1,
      },
    ],
  events:
    [
      {
        title:"Animal Respiration",
        from:"Animals",
        to:"Atmosphere",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"Plant Respiration",
        from:"Plants",
        to:"Atmosphere",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"Photosynthesis",
        from:"Atmosphere",
        to:"Plants",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"Herbivore",
        from:"Plants",
        to:"Animals",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"Animal Death",
        from:"Animals",
        to:"Earth (Surface)",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"Plant Death",
        from:"Plants",
        to:"Earth (Surface)",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"Fire",
        from:"Plants",
        to:"Atmosphere",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"Soil Respiration",
        from:"Earth (Surface)",
        to:"Atmosphere",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"TurnIntoPetroleum",
        from:"Earth (Surface)",
        to:"Earth (Deep)",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"Harvest Oil",
        from:"Earth (Deep)",
        to:"Factory",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"Proccess Fossil Fuels",
        from:"Factory",
        to:"Fuel",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"Combustion",
        from:"Fuel",
        to:"Atmosphere",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"Erosion",
        from:"Earth (Surface)",
        to:"Ocean (Surface)",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"Sink?",
        from:"Ocean (Surface)",
        to:"Ocean (Deep)",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"Rock Cycle",
        from:"Ocean (Deep)",
        to:"Earth (Deep)",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"O to A Diffusion",
        from:"Ocean (Surface)",
        to:"Atmosphere",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"A to O Diffusion",
        from:"Atmosphere",
        to:"Ocean (Surface)",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"Ocean Respiration ?",
        from:"Ocean (Surface)",
        to:"Atmosphere",
        time:0,
        amt:1,
        common:1,
      },
    ],
};
