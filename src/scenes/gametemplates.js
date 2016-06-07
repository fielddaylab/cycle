var GameTemplate =
{
  tokens:10,
  deck:100,
  hand:5,
  goal_shift_turns:3,
  players:
    [
      {
        title:"RED TEAM",
        token_img:"red_circle",
        color:"#FF0000",
      },
      {
        title:"BLUE TEAM",
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
        w:0.2,
        h:0.2,
      },
      {
        title:"B",
        img:"circle",
        x:0.4,
        y:0.2,
        w:0.2,
        h:0.2,
      },
      {
        title:"C",
        img:"circle",
        x:0.6,
        y:0.8,
        w:0.2,
        h:0.2,
      },
      {
        title:"D",
        img:"circle",
        x:0.7,
        y:0.4,
        w:0.2,
        h:0.2,
      },
    ],
  events:
    [
      {
        title:"EvA",
        description:"EvA Is a THING",
        from:"A",
        to:"B",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"EvB",
        description:"EvB Is a THING",
        from:"B",
        to:"C",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"EvC",
        description:"EvC Is a THING",
        from:"C",
        to:"D",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"EvD",
        description:"EvD Is a THING",
        from:"D",
        to:"B",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"EvE",
        description:"EvE Is a THING",
        from:"A",
        to:"C",
        time:0,
        amt:1,
        common:1,
      },
    ],
};

var rx = .16;
var ry = .12;
var w = .19;
var h = .145;
var x = 0.5;
var y = 0.57;

var CarbonCycleGameTemplate =
{
  tokens:14,
  deck:100,
  hand:5,
  goal_shift_turns:3,
  noun:"carbon",
  bg_img:"carbon_bg",
  players:
    [
      {
        title:"RED TEAM",
        token_img:"red_circle",
        color:"#FF0000",
      },
      {
        title:"BLUE TEAM",
        token_img:"blue_circle",
        color:"#0000FF",
      },
    ],
  nodes:
    [
      {
        title:"Plants",
        img:"plants",
        icon_img:"plants",
        x:x,
        y:y,
        w:w,
        h:h,
      },
      {
        title:"Atmosphere",
        img:"atmosphere",
        icon_img:"atmosphere",
        x:x+Math.cos(Math.PI/2+((0/6)*Math.PI*2))*rx,
        y:y+Math.sin(Math.PI/2+((0/6)*Math.PI*2))*ry,
        w:w,
        h:h,
      },
      {
        title:"Animals",
        img:"animal",
        icon_img:"animal",
        x:x+Math.cos(Math.PI/2+((1/6)*Math.PI*2))*rx,
        y:y+Math.sin(Math.PI/2+((1/6)*Math.PI*2))*ry,
        w:w,
        h:h,
      },
      {
        title:"Earth (Surface)",
        img:"earth_surface",
        icon_img:"earth_surface",
        x:x+Math.cos(Math.PI/2+((2/6)*Math.PI*2))*rx,
        y:y+Math.sin(Math.PI/2+((2/6)*Math.PI*2))*ry,
        w:w,
        h:h,
      },
      {
        title:"Earth (Deep)",
        img:"earth_deep",
        icon_img:"earth_deep",
        x:x+Math.cos(Math.PI/2+((3/6)*Math.PI*2))*rx,
        y:y+Math.sin(Math.PI/2+((3/6)*Math.PI*2))*ry,
        w:w,
        h:h,
      },
      {
        title:"Ocean",
        img:"ocean",
        icon_img:"ocean",
        x:x+Math.cos(Math.PI/2+((4/6)*Math.PI*2))*rx,
        y:y+Math.sin(Math.PI/2+((4/6)*Math.PI*2))*ry,
        w:w,
        h:h,
      },
      {
        title:"Fuel",
        img:"fuel",
        icon_img:"fuel",
        x:x+Math.cos(Math.PI/2+((5/6)*Math.PI*2))*rx,
        y:y+Math.sin(Math.PI/2+((5/6)*Math.PI*2))*ry,
        w:w,
        h:h,
      },
    ],
  events:
    [
      {
        title:"Animal Respiration",
        description:"Breathe in, breathe out",
        from:"Animals",
        to:"Atmosphere",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"Plant Respiration",
        description:"Plants breathe too!",
        from:"Plants",
        to:"Atmosphere",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"Photosynthesis",
        description:"Turn sunshine to energy",
        from:"Atmosphere",
        to:"Plants",
        time:0,
        amt:1,
        common:1.5,
      },
      {
        title:"Herbivorism",
        description:"Eat your veggies",
        from:"Plants",
        to:"Animals",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"Animal Death",
        description:"Poor things",
        from:"Animals",
        to:"Earth (Surface)",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"Plant Death",
        description:"Wither away",
        from:"Plants",
        to:"Earth (Surface)",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"Soil Respiration",
        description:"Constant flow",
        from:"Earth (Surface)",
        to:"Atmosphere",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"Million-Year Decay",
        description:"From Coal to Petroleum",
        from:"Earth (Surface)",
        to:"Earth (Deep)",
        time:0,
        amt:1,
        common:0.5,
      },
      {
        title:"Harvest/Process Petroleum",
        description:"Drill, baby, drill!",
        from:"Earth (Deep)",
        to:"Fuel",
        time:0,
        amt:1,
        common:0.75,
      },
      {
        title:"Combustion",
        description:"BOOM",
        from:"Fuel",
        to:"Atmosphere",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"Erosion",
        description:"One Big Resevoir to another",
        from:"Earth (Surface)",
        to:"Ocean",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"Ocean Deposit",
        description:"Slowly reintegrate to land",
        from:"Ocean",
        to:"Earth (Deep)",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"Ocean Diffusion",
        description:"Exchanges in both directions!",
        from:"Ocean",
        to:"Atmosphere",
        time:0,
        amt:1,
        common:0.5,
      },
      {
        title:"Ocean Diffusion",
        description:"Exchanges in both directions!",
        from:"Atmosphere",
        to:"Ocean",
        time:0,
        amt:1,
        common:0.5,
      },
    ],
};


var WaterCycleGameTemplate =
{
  tokens:10,
  deck:100,
  hand:5,
  goal_shift_turns:3,
  noun:"water",
  bg_img:"carbon_bg",
  players:
    [
      {
        title:"RED TEAM",
        token_img:"red_circle",
        color:"#FF0000",
      },
      {
        title:"BLUE TEAM",
        token_img:"blue_circle",
        color:"#0000FF",
      },
    ],
  nodes:
    [
      {
        title:"Surface",
        img:"earth_surface",
        icon_img:"earth_surface",
        x:x,
        y:y,
        w:w,
        h:h,
      },
      {
        title:"Clouds",
        img:"atmosphere",
        icon_img:"atmosphere",
        x:x+Math.cos(Math.PI/2+((0/6)*Math.PI*2))*rx,
        y:y+Math.sin(Math.PI/2+((0/6)*Math.PI*2))*ry,
        w:w,
        h:h,
      },
      {
        title:"River",
        img:"ocean",
        icon_img:"ocean",
        x:x+Math.cos(Math.PI/2+((2/6)*Math.PI*2))*rx,
        y:y+Math.sin(Math.PI/2+((2/6)*Math.PI*2))*ry,
        w:w,
        h:h,
      },
      {
        title:"Earth",
        img:"earth_deep",
        icon_img:"earth_deep",
        x:x+Math.cos(Math.PI/2+((3/6)*Math.PI*2))*rx,
        y:y+Math.sin(Math.PI/2+((3/6)*Math.PI*2))*ry,
        w:w,
        h:h,
      },
      {
        title:"Ocean",
        img:"ocean",
        icon_img:"ocean",
        x:x+Math.cos(Math.PI/2+((4/6)*Math.PI*2))*rx,
        y:y+Math.sin(Math.PI/2+((4/6)*Math.PI*2))*ry,
        w:w,
        h:h,
      },
      {
        title:"Atmosphere",
        img:"atmosphere",
        icon_img:"atmosphere",
        x:x+Math.cos(Math.PI/2+((5/6)*Math.PI*2))*rx,
        y:y+Math.sin(Math.PI/2+((5/6)*Math.PI*2))*ry,
        w:w,
        h:h,
      },
    ],
  events:
    [
      {
        title:"Evaporation",
        description:"The air is thirsty",
        from:"Surface",
        to:"Atmosphere",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"Evaporation",
        description:"The air is thirsty",
        from:"Ocean",
        to:"Atmosphere",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"Evaporation",
        description:"The air is thirsty",
        from:"River",
        to:"Atmosphere",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"Runoff",
        description:"The water's gotta go somewhere...",
        from:"Surface",
        to:"River",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"Runoff",
        description:"The water's gotta go somewhere...",
        from:"Surface",
        to:"Ocean",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"Condensation",
        description:"Makes the air visible",
        from:"Atmosphere",
        to:"Clouds",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"Precipitation",
        description:"Rain Sleet Snow or Hail",
        from:"Clouds",
        to:"Ocean",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"Precipitation",
        description:"Rain Sleet Snow or Hail",
        from:"Clouds",
        to:"River",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"Precipitation",
        description:"Rain Sleet Snow or Hail",
        from:"Clouds",
        to:"Surface",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"Soil Absorption",
        description:"A sinking puddle",
        from:"Surface",
        to:"Earth",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"Ground Water Route to River",
        description:"I have nothing interesting to add",
        from:"Earth",
        to:"River",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"Ground Water Route to Ocean",
        description:"I have nothing interesting to add",
        from:"Earth",
        to:"Ocean",
        time:0,
        amt:1,
        common:1,
      },
    ],
};

var NitrogenCycleGameTemplate =
{
  tokens:10,
  deck:100,
  hand:5,
  goal_shift_turns:3,
  noun:"nitrogen",
  bg_img:"carbon_bg",
  players:
    [
      {
        title:"RED TEAM",
        token_img:"red_circle",
        color:"#FF0000",
      },
      {
        title:"BLUE TEAM",
        token_img:"blue_circle",
        color:"#0000FF",
      },
    ],
  nodes:
    [
      {
        title:"Atmosphere",
        img:"atmosphere",
        icon_img:"atmosphere",
        x:x+Math.cos(Math.PI/2+((0/6)*Math.PI*2))*rx,
        y:y+Math.sin(Math.PI/2+((0/6)*Math.PI*2))*ry,
        w:w,
        h:h,
      },
      {
        title:"Plants",
        img:"plants",
        icon_img:"plants",
        x:x+Math.cos(Math.PI/2+((2/6)*Math.PI*2))*rx,
        y:y+Math.sin(Math.PI/2+((2/6)*Math.PI*2))*ry,
        w:w,
        h:h,
      },
      {
        title:"Soil",
        img:"earth_surface",
        icon_img:"earth_surface",
        x:x+Math.cos(Math.PI/2+((3/6)*Math.PI*2))*rx,
        y:y+Math.sin(Math.PI/2+((3/6)*Math.PI*2))*ry,
        w:w,
        h:h,
      },
      {
        title:"Animals",
        img:"animal",
        icon_img:"animal",
        x:x+Math.cos(Math.PI/2+((4/6)*Math.PI*2))*rx,
        y:y+Math.sin(Math.PI/2+((4/6)*Math.PI*2))*ry,
        w:w,
        h:h,
      },
    ],
  events:
    [
      {
        title:"Lightning",
        description:"Thunder Boomers",
        from:"Atmosphere",
        to:"Soil",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"Bacteria Digestion",
        description:"Toot",
        from:"Soil",
        to:"Atmosphere",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"Plant Assimilation",
        description:"Through the roots!",
        from:"Soil",
        to:"Plants",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"Plant Death",
        description:"Sorry, plants. :(",
        from:"Plants",
        to:"Soil",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"Animal Death",
        description:"Sad day.",
        from:"Animals",
        to:"Soil",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"Herbivorism",
        description:"High in fiber.",
        from:"Plants",
        to:"Animals",
        time:0,
        amt:1,
        common:1,
      },
      {
        title:"Nitrigen-Fixing Plant Bacteria",
        description:"Actually doesn't pass through the plant",
        from:"Atmosphere",
        to:"Soil",
        time:0,
        amt:1,
        common:1,
      },
    ],
};
