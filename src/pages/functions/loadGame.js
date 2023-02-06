export const loadGame = () => {
  // plugins
  Matter.use(MatterAttractors);

  // constants
  const PATHS = {
    DOME: "0 0 0 250 19 250 20 231.9 25.7 196.1 36.9 161.7 53.3 129.5 74.6 100.2 100.2 74.6 129.5 53.3 161.7 36.9 196.1 25.7 231.9 20 268.1 20 303.9 25.7 338.3 36.9 370.5 53.3 399.8 74.6 425.4 100.2 446.7 129.5 463.1 161.7 474.3 196.1 480 231.9 480 250 500 250 500 0 0 0",
    DROP_LEFT: "0 0 20 0 70 100 20 150 0 150 0 0",
    DROP_RIGHT: "50 0 68 0 68 150 50 150 0 100 50 0",
    APRON_LEFT: "0 0 180 120 0 120 0 0",
    APRON_RIGHT: "180 0 180 120 0 120 180 0",
  };
  const COLOUR = {
    BACKGROUND: "#212529",
    OUTER: "#d89e78",
    INNER: "#6D4219",
    BUMPER: "#fab005",
    BUMPERLINK: "#E83939",
    BUMPER_LIT: "#fff3bf",
    PADDLE: "#6D4219",
    PINBALL: "#dee2e6",
  };
  const GRAVITY = 0.75;
  const WIREFRAMES = false;
  const BUMPER_BOUNCE = 1.5;
  const PADDLE_PULL = 0.002;
  const MAX_VELOCITY = 50;

  // score elements
  let $currentScore = $(".current-score span");
  let $highScore = $(".high-score span");

  // shared variables
  let currentScore, highScore;
  let engine, world, render, pinball, stopperGroup;
  let leftPaddle, leftUpStopper, leftDownStopper, isLeftPaddleUp;
  let rightPaddle, rightUpStopper, rightDownStopper, isRightPaddleUp;

  function load() {
    init();
    createStaticBodies();
    createPaddles();
    createPinball();
    createEvents();
  }

  function init() {
    // engine (shared)
    engine = Matter.Engine.create();

    // world (shared)
    world = engine.world;
    world.bounds = {
      min: { x: 0, y: 0 },
      max: { x: 500, y: 800 },
    };
    world.gravity.y = GRAVITY; // simulate rolling on a slanted table

    // render (shared)
    render = Matter.Render.create({
      element: $(".container")[0],
      engine: engine,
      options: {
        width: world.bounds.max.x,
        height: world.bounds.max.y,
        wireframes: WIREFRAMES,
        background: "transparent",
      },
    });
    Matter.Render.run(render);

    // runner
    let runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    // used for collision filtering on various bodies
    stopperGroup = Matter.Body.nextGroup(true);

    // starting values
    currentScore = 0;
    highScore = 0;
    isLeftPaddleUp = false;
    isRightPaddleUp = false;
  }

  function createStaticBodies() {
    Matter.World.add(world, [
      // table boundaries (top, bottom, left, right)
      boundary(250, -30, 500, 100),
      boundary(250, 830, 500, 100),
      boundary(-30, 400, 100, 800),
      boundary(530, 400, 100, 800),

      // dome
      path(239, 86, PATHS.DOME),

      // pegs (left, mid, right)

      // top bumpers (left, mid, right)
      bumper(105, 250, false),
      bumper(225, 250, false),
      bumper(345, 250, false),

      // bottom link bumper
      // bumper(225, 340, true),

      // shooter lane wall
      wall(440, 520, 20, 560, COLOUR.OUTER),

      // drops (left, right)
      path(25, 360, PATHS.DROP_LEFT),
      path(425, 360, PATHS.DROP_RIGHT),

      // slingshots (left, right)
      wall(120, 510, 20, 120, COLOUR.INNER),
      wall(330, 510, 20, 120, COLOUR.INNER),

      // out lane walls (left, right)
      wall(60, 529, 20, 160, COLOUR.INNER),
      wall(390, 529, 20, 160, COLOUR.INNER),

      // flipper walls (left, right);
      wall(93, 624, 20, 98, COLOUR.INNER, -0.96),
      wall(357, 624, 20, 98, COLOUR.INNER, 0.96),

      // aprons (left, right)
      path(79, 740, PATHS.APRON_LEFT),
      path(371, 740, PATHS.APRON_RIGHT),

      // reset zones (center, right)
      reset(225, 50),
      reset(465, 30),
    ]);
  }

  function createPaddles() {
    // these bodies keep paddle swings contained, but allow the ball to pass through
    leftUpStopper = stopper(160, 591, "left", "up");
    leftDownStopper = stopper(140, 743, "left", "down");
    rightUpStopper = stopper(290, 591, "right", "up");
    rightDownStopper = stopper(310, 743, "right", "down");
    Matter.World.add(world, [
      leftUpStopper,
      leftDownStopper,
      rightUpStopper,
      rightDownStopper,
    ]);

    // this group lets paddle pieces overlap each other
    let paddleGroup = Matter.Body.nextGroup(true);

    // Left paddle mechanism
    let paddleLeft = {};
    paddleLeft.paddle = Matter.Bodies.trapezoid(170, 660, 20, 80, 0.33, {
      label: "paddleLeft",
      angle: 1.57,
      chamfer: {},
      render: {
        fillStyle: COLOUR.PADDLE,
      },
    });
    paddleLeft.brick = Matter.Bodies.rectangle(172, 672, 40, 80, {
      angle: 1.62,
      chamfer: {},
      render: {
        visible: false,
      },
    });
    paddleLeft.comp = Matter.Body.create({
      label: "paddleLeftComp",
      parts: [paddleLeft.paddle, paddleLeft.brick],
    });
    paddleLeft.hinge = Matter.Bodies.circle(142, 660, 5, {
      isStatic: true,
      render: {
        visible: false,
      },
    });
    Object.values(paddleLeft).forEach((piece) => {
      piece.collisionFilter.group = paddleGroup;
    });
    paddleLeft.con = Matter.Constraint.create({
      bodyA: paddleLeft.comp,
      pointA: { x: -29.5, y: -8.5 },
      bodyB: paddleLeft.hinge,
      length: 0,
      stiffness: 0,
    });
    Matter.World.add(world, [
      paddleLeft.comp,
      paddleLeft.hinge,
      paddleLeft.con,
    ]);
    Matter.Body.rotate(paddleLeft.comp, 0.57, { x: 142, y: 660 });

    // right paddle mechanism
    let paddleRight = {};
    paddleRight.paddle = Matter.Bodies.trapezoid(280, 660, 20, 80, 0.33, {
      label: "paddleRight",
      angle: -1.57,
      chamfer: {},
      render: {
        fillStyle: COLOUR.PADDLE,
      },
    });
    paddleRight.brick = Matter.Bodies.rectangle(278, 672, 40, 80, {
      angle: -1.62,
      chamfer: {},
      render: {
        visible: false,
      },
    });
    paddleRight.comp = Matter.Body.create({
      label: "paddleRightComp",
      parts: [paddleRight.paddle, paddleRight.brick],
    });
    paddleRight.hinge = Matter.Bodies.circle(308, 660, 5, {
      isStatic: true,
      render: {
        visible: false,
      },
    });
    Object.values(paddleRight).forEach((piece) => {
      piece.collisionFilter.group = paddleGroup;
    });
    paddleRight.con = Matter.Constraint.create({
      bodyA: paddleRight.comp,
      pointA: { x: 29.5, y: -8.5 },
      bodyB: paddleRight.hinge,
      length: 0,
      stiffness: 0,
    });
    Matter.World.add(world, [
      paddleRight.comp,
      paddleRight.hinge,
      paddleRight.con,
    ]);
    Matter.Body.rotate(paddleRight.comp, -0.57, { x: 308, y: 660 });
  }

  function createPinball() {
    // x/y are set to when pinball is launched
    pinball = Matter.Bodies.circle(0, 0, 14, {
      label: "pinball",
      collisionFilter: {
        group: stopperGroup,
      },
      render: {
        fillStyle: COLOUR.PINBALL,
      },
    });
    Matter.World.add(world, pinball);
    launchPinball();
  }

  function createEvents() {
    // events for when the pinball hits stuff
    Matter.Events.on(engine, "collisionStart", function (event) {
      let pairs = event.pairs;
      pairs.forEach(function (pair) {
        if (pair.bodyB.label === "pinball") {
          switch (pair.bodyA.label) {
            case "reset":
              launchPinball();
              break;
            case "bumper":
              pingBumper(pair.bodyA);
              break;
            case "bumperLink":
              redirectToHome();
              break;
          }
        }
      });
    });

    // regulate pinball
    Matter.Events.on(engine, "beforeUpdate", function (event) {
      // bumpers can quickly multiply velocity, so keep that in check
      Matter.Body.setVelocity(pinball, {
        x: Math.max(Math.min(pinball.velocity.x, MAX_VELOCITY), -MAX_VELOCITY),
        y: Math.max(Math.min(pinball.velocity.y, MAX_VELOCITY), -MAX_VELOCITY),
      });

      // cheap way to keep ball from going back down the shooter lane
      if (pinball.position.x > 450 && pinball.velocity.y > 0) {
        Matter.Body.setVelocity(pinball, { x: 0, y: -10 });
      }
    });

    // mouse drag (god mode for grabbing pinball)
    Matter.World.add(
      world,
      Matter.MouseConstraint.create(engine, {
        mouse: Matter.Mouse.create(render.canvas),
        constraint: {
          stiffness: 0.2,
          render: {
            visible: false,
          },
        },
      })
    );

    // keyboard paddle events
    $("body").on("keydown", function (e) {
      if (e.which === 37) {
        // left arrow key
        isLeftPaddleUp = true;
      } else if (e.which === 39) {
        // right arrow key
        isRightPaddleUp = true;
      }
    });
    $("body").on("keyup", function (e) {
      if (e.which === 37) {
        // left arrow key
        isLeftPaddleUp = false;
      } else if (e.which === 39) {
        // right arrow key
        isRightPaddleUp = false;
      }
    });

    // click/tap paddle events
    $(".left-trigger")
      .on("mousedown touchstart", function (e) {
        isLeftPaddleUp = true;
      })
      .on("mouseup touchend", function (e) {
        isLeftPaddleUp = false;
      });
    $(".right-trigger")
      .on("mousedown touchstart", function (e) {
        isRightPaddleUp = true;
      })
      .on("mouseup touchend", function (e) {
        isRightPaddleUp = false;
      });
  }

  function launchPinball() {
    updateScore(0);
    Matter.Body.setPosition(pinball, { x: 465, y: 765 });
    Matter.Body.setVelocity(pinball, { x: 0, y: -25 + rand(-2, 2) });
    Matter.Body.setAngularVelocity(pinball, 0);
  }

  function redirectToHome() {
    window.location.assign("https://www.samuelhinkinson.com/");
  }
  function pingBumper(bumper) {
    updateScore(currentScore + 10);
    // flash colour
    bumper.render.fillStyle = COLOUR.BUMPER_LIT;
    setTimeout(function () {
      bumper.render.fillStyle = COLOUR.BUMPER;
    }, 100);
  }

  function updateScore(newCurrentScore) {
    currentScore = newCurrentScore;
    $currentScore.text(currentScore);

    highScore = Math.max(currentScore, highScore);
    $highScore.text(highScore);
  }

  // matter.js has a built in random range function, but it is deterministic
  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  // outer edges of pinball table
  function boundary(x, y, width, height) {
    return Matter.Bodies.rectangle(x, y, width, height, {
      isStatic: true,
      render: {
        fillStyle: COLOUR.OUTER,
      },
    });
  }

  // wall segments
  function wall(x, y, width, height, colour, angle = 0) {
    return Matter.Bodies.rectangle(x, y, width, height, {
      angle: angle,
      isStatic: true,
      chamfer: { radius: 10 },
      render: {
        fillStyle: colour,
      },
    });
  }

  // bodies created from SVG paths
  function path(x, y, path) {
    let vertices = Matter.Vertices.fromPath(path);
    return Matter.Bodies.fromVertices(x, y, vertices, {
      isStatic: true,
      render: {
        fillStyle: COLOUR.OUTER,

        // add stroke and line width to fill in slight gaps between fragments
        strokeStyle: COLOUR.OUTER,
        lineWidth: 1,
      },
    });
  }

  // round bodies that repel pinball
  function bumper(x, y, link) {
    let label, colour;
    if (link === true) {
      label = "bumperLink";
      colour = COLOUR.BUMPERLINK;
    } else {
      label = "bumper";
      colour = COLOUR.BUMPER;
    }

    let bumper = Matter.Bodies.circle(x, y, 25, {
      label: label,
      isStatic: true,
      render: {
        fillStyle: colour,
      },
    });

    // for some reason, restitution is reset unless it's set after body creation
    bumper.restitution = BUMPER_BOUNCE;

    return bumper;
  }

  // invisible bodies to constrict paddles
  function stopper(x, y, side, position) {
    // determine which paddle composite to interact with
    let attracteeLabel = side === "left" ? "paddleLeftComp" : "paddleRightComp";

    return Matter.Bodies.circle(x, y, 40, {
      isStatic: true,
      render: {
        visible: false,
      },
      collisionFilter: {
        group: stopperGroup,
      },
      plugin: {
        attractors: [
          // stopper is always a, other body is b
          function (a, b) {
            if (b.label === attracteeLabel) {
              let isPaddleUp =
                side === "left" ? isLeftPaddleUp : isRightPaddleUp;
              let isPullingUp = position === "up" && isPaddleUp;
              let isPullingDown = position === "down" && !isPaddleUp;
              if (isPullingUp || isPullingDown) {
                return {
                  x: (a.position.x - b.position.x) * PADDLE_PULL,
                  y: (a.position.y - b.position.y) * PADDLE_PULL,
                };
              }
            }
          },
        ],
      },
    });
  }

  // contact with these bodies causes pinball to be relaunched
  function reset(x, width) {
    return Matter.Bodies.rectangle(x, 781, width, 2, {
      label: "reset",
      isStatic: true,
      render: {
        fillStyle: "#fff",
      },
    });
  }

  window.addEventListener("load", load, false);
};
