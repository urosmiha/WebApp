
    window.addEventListener("load", Init);
    
    // Sprites
    var ground = null;
    var pipe = null;
    var balloon = null;

    var _wait = true;

    var game_speed = 30;

    // Deafault Viewport Size
    var win_width = 800;
    var win_height = 500;

    // Vars
    var status = 0; // 0 = Start Screen / 1 = Gaming / 2 = Game Over
    var score = 0;
    var groundStep = 0;
    var scroolingSpeed = 3;
    var lockScroll = false;
    var lockJump = false;
    var lockballoon = true;

    // Score Room
    var newBest = false;
    var bestScore = 0;

    // balloon
    var xPos = 100; // This is a constant value!
    var yPos = 250;
    var yGravity = 0;
    var yGravityIncreaser = 2;
    var yJumpGravity = -17;
    var yMaxGravity = 20;
    var balloonDrawScale = 6; // size/scale
    var hitTheGround = false;

    function Pipe() {
        this.X = 0;
        this.H = 10;
        this.Marker = false;
    }

    var Pipes = [];
    var nPipes = 5;
    var PipesDistanceX = 150; // X Dist
    var PipesDistanceY = 200;
    var PipeScale = 2;

    function InitPipes() {
        var xCounter = win_width;
        for (var i = 0; i < nPipes; i++) {
            var sPipe = new Pipe();
            sPipe.X = xCounter;
            sPipe.H = Math.floor((Math.random() * (win_height - (ground.height + PipesDistanceY + 50))) + 50);
            sPipe.Marker = false;
            xCounter += PipesDistanceX + (pipe.width / PipeScale);
            Pipes.push(sPipe);
        }
    }

    function Init() {
        // Get the canvas element
        var canvas = document.getElementById("CTX");

        // Set the canvas size
        canvas.setAttribute("width", win_width);
        canvas.setAttribute("height", win_height);

        // Get canvas context
        var ctx = canvas.getContext("2d");

        // Load images
        ground = new Image();
        ground.src = "images/sand.png";
        pipe = new Image();
        pipe.src = "images/cactus.png";
        balloon = new Image();
        balloon.src = "images/balloon.png";

        // Key events
        document.addEventListener("keydown", function (e) {
            if (e.keyCode == 32) // Space Button
            {
                if (!lockJump) {
                    yGravity = yJumpGravity;
                }
                if (status == 0) // Start Room
                {
                    startGame();
                }
                if (status == 2) // Game Over State
                {
                    reset();
                }
            }
        }, false);

        // Create a loop. 30 ms interval
        var interval = window.setInterval(function () { GUpdate(ctx, canvas); }, game_speed);

    }
    
    // Move the ground
    function groundAnimation() {
        if (ground != null) {
            groundStep += scroolingSpeed;
            if (groundStep >= ground.width) {
                groundStep = 0;
            }
        }
    }

    function updateGravity() {
        yGravity += yGravityIncreaser;
        if (yGravity > yMaxGravity) {
            yGravity = yMaxGravity;
        }
    }

    function updateballoonPosition() {
        yPos += yGravity;
        if (yPos < 0) {
            yPos = 0;
        }
        if (yPos > (win_height - ground.height) - (balloon.height / balloonDrawScale)) {
            yPos = (win_height - ground.height) - (balloon.height / balloonDrawScale);

            gameOver();
        }
    }

    // Get the farest pipes X position
    function getFarestPipeX() {
        var farestX = 0;
        for (var i in Pipes) {
            if (Pipes[i].X > farestX) {
                farestX = Pipes[i].X;
            }
        }
        return farestX;
    }

    function updatePipesPosition() {
        for (var i in Pipes) {
            Pipes[i].X -= scroolingSpeed;
            if (Pipes[i].X + (pipe.width / PipeScale) < 0) {
                Pipes[i].X = getFarestPipeX() + (pipe.width / PipeScale) + PipesDistanceX; // The most far pipe!
                Pipes[i].H = Math.floor((Math.random() * (win_height - (ground.height + PipesDistanceY + 50))) + 50); // Get the new Height
                Pipes[i].Marker = false;
            }
        }
    }
    
    // get the distance between two points
    function Magnitude(p1, p2) {
        return Math.sqrt(Math.pow(p2.X - p1.X, 2) + Math.pow(p2.Y - p1.Y, 2));
    }

    // Check for collision between ballon and pipe
    function CollisionDetection(circle, rect) {
        // Test if the circle is at the corners
        // Corner Up-Left
        if (circle.X + circle.R < rect.X && circle.Y + circle.R < rect.Y) {
            if (Magnitude({ X: circle.X, Y: circle.Y }, { X: rect.X, Y: rect.Y }) <= circle.R) {
                return true;
            }
            else {
                return false;
            }
        }
        // Corner Up-Right
        if (circle.X > rect.X + rect.W && circle.Y < rect.Y) {
            if (Magnitude({ X: circle.X, Y: circle.Y }, { X: rect.X + rect.W, Y: rect.Y }) <= circle.R) {
                return true;
            }
            else {
                return false;
            }
        }
        // Corner Down-Right
        if (circle.X > rect.X + rect.W && circle.Y > rect.Y + rect.H) {
            if (Magnitude({ X: circle.X, Y: circle.Y }, { X: rect.X + rect.W, Y: rect.Y + rect.H }) <= circle.R) {
                return true;
            }
            else {
                return false;
            }
        }
        // Corner Down-Left
        if (circle.X < rect.X && circle.Y > rect.Y + rect.H) {
            if (Magnitude({ X: circle.X, Y: circle.Y }, { X: rect.X, Y: rect.Y + rect.H }) <= circle.R) {
                return true;
            }
            else {
                return false;
            }
        }

        // the test a common rectangle collision
        if (circle.X + circle.R > rect.X && circle.Y + circle.R > rect.Y &&
            circle.X - circle.R < rect.X + rect.W && circle.Y - circle.R < rect.Y + rect.H) {
            return true;
        }
        //
        return false;
    }

    function setCookie(cname, cvalue) {
        document.cookie = cname + "=" + cvalue + ";";
    }

    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var c = 0; c < ca.length; c++) {
            var d = ca[c];
            while (d.charAt(0) == ' ') {
                d = d.substring(1);
            }
            if (d.indexOf(name) == 0) {
                return d.substring(name.length, d.length);
            }
        }
        return "";
    }
    
    function reset() {
        status = 0;
        score = 0;
        yPos = 250;
        lockScroll = false;
        lockJump = false;
        lockballoon = true;
        Pipes = [];
        hitTheGround = false;
    }

    function startGame() {
        status = 1;
        InitPipes();
        lockballoon = false;
    }

    function gameOver() {
        if (status == 2) {
            return 0;
        }

        status = 2; // Game Over
        lockScroll = true;
        lockJump = true;
    }

    function testCollision() {

        var balloonCircle = {
            X: xPos + ((balloon.width / balloonDrawScale) / 2),
            Y: yPos + ((balloon.height / balloonDrawScale) / 2),
            R: (balloon.height / balloonDrawScale) / 2
        }; 

        for (var i in Pipes) {
            var cPipe = Pipes[i];

            var rectPipeUp = {
                X: cPipe.X,
                Y: -(pipe.height / PipeScale) + cPipe.H,
                W: (pipe.width / PipeScale),
                H: (pipe.height / PipeScale)
            };
            // cPipe.X, cPipe.H + PipesDistanceY
            var rectPipeDown = {
                X: cPipe.X,
                Y: cPipe.H + PipesDistanceY,
                W: (pipe.width / PipeScale),
                H: (pipe.height / PipeScale)
            };

            // Test each rectangle
            var resRectPipeUp = CollisionDetection(balloonCircle, rectPipeUp);
            var resRectPipeDown = CollisionDetection(balloonCircle, rectPipeDown);

            if (resRectPipeUp || resRectPipeDown) {
                gameOver();
            }
        }
        

    }

    function updateScore() {
        var xballoonCenter = xPos + ((balloon.width / balloonDrawScale) / 2);
        for (var p in Pipes) {
            var cPipe = Pipes[p];
            if (cPipe.X < xballoonCenter) {
                if (cPipe.Marker == false) {
                    Pipes[p].Marker = true;
                    score++;
                }
            }
        }

    }

    function GUpdate(ctx, canvas) {
        // Clear the screen
        ctx.fillStyle = "rgb(100, 149, 237)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        updateGravity();
        updateballoonPosition();
        if (!lockScroll) {
            groundAnimation();
            updatePipesPosition();
        }
        testCollision();
        updateScore();

        if (lockballoon) {
            yGravity = 0;
            yPos = 250;
        }

        // Draw the Pipes
        for (var i in Pipes) {
            var cPipe = Pipes[i];

            // New pipe ize
            var nW = pipe.width / PipeScale;
            var nH = pipe.height / PipeScale;

            // Each pipe object represents two pipes '-'
            // The first one need to be rotated
            ctx.save();
            ctx.translate(cPipe.X, -(pipe.height / PipeScale) + cPipe.H);
            var translW = nW / 2;
            var translH = nH / 2;
            ctx.translate(translW, translH);
            ctx.rotate(180 * Math.PI / 180);
            ctx.drawImage(pipe, -translW, -translH, nW, nH);

            ctx.restore();

            // The second pipe is in their normal rotation
            ctx.drawImage(pipe, cPipe.X, cPipe.H + PipesDistanceY, nW, nH);
        }

        // Draw the balloon
        if (balloon != null) {
            // Get a new image size based on a new scale
            var nW = balloon.width / balloonDrawScale;
            var nH = balloon.height / balloonDrawScale;

            // Save current context
            ctx.save();

            var traslW = (balloon.width / balloonDrawScale) / 2;
            var tranlH = (balloon.height / balloonDrawScale) / 2;
            ctx.translate(xPos, yPos);
            ctx.translate(traslW, tranlH);

            // Draw Image
            ctx.drawImage(balloon, -traslW, -tranlH, nW, nH);

            // restore context
            ctx.restore();
        }


        if (ground != null) {
            for (var i = groundStep * (-1) ; i < win_width + groundStep; i += ground.width) {
                ctx.drawImage(ground, i, win_height - ground.height);
            }
        }

        // Waiting on the game to start
        if (status == 0) {
            ctx.font = "bold 32px Corbel";
            ctx.fillStyle = "Black";
            ctx.fillText("Press Space to Start!", 60, 200);
            ctx.lineWidth = 1;
        }
        // Game is running
        if (status == 1) {
            // Show Score
            ctx.font = "bold 32px Times New Roman";
            ctx.fillStyle = "Black";
            ctx.fillText(score, 50 , 50);

            // Increase the game speed and reduce distance between the pipes as the score increases
            // The reason the whait flag is used as the score stays the same until we pass the next pipe so we don not want to change dificluty until score is adequate
            if(score % 20 == 0 && _wait == false) {
                game_speed -= 10;
                _wait = true;
            } else if(score % 10 == 0 && _wait == false) {
                game_speed += 5;
                _wait = true;
            } else if(score % 10 != 0) {
                _wait = false;
            }
        }
        // Game has eneded - you die
        if (status == 2) {

            ctx.font = "bold 32px Times New Roman";
            ctx.fillStyle = "Black";
            ctx.fillText("You Died!", 120, 190);

            ctx.font = "24px Times New Roman";
            ctx.fillStyle = "Black";
            ctx.fillText("Press Space to go Again", 120, 230);

            ctx.font = "24px Times New Roman";
            ctx.fillStyle = "Black";
            ctx.fillText("Score: " + score, 120, 270);

        }

    }
