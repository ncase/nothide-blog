---
title: "Making a Monaco-like Shadow Effect"
date: 2013-10-26
template: article.jade
---

Step 1: Create the canvas

```html
<canvas id="game" width="600" height="600"
    style="display:block; margin:auto; position:absolute; top:0; left:0px; bottom:0; right:0;">
</canvas>
```

Step 2: Create the rest of the fucking game

```html
<body style="background:#000;">
    <canvas id="game" width="600" height="600"
        style="display:block; margin:auto; position:absolute; top:0; left:0px; bottom:0; right:0;">
    </canvas>
</body>
<script>

// Get canvas & drawing context
var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");

// Layered canvasses
var shadows = document.createElement("canvas");
var background = document.createElement("canvas");
var foreground = document.createElement("canvas");
shadows.width = foreground.width = background.width = canvas.width;
shadows.height = foreground.height = background.height = canvas.height;


// Load images
var backgroundImage = new Image();
backgroundImage.src = "background.png";
backgroundImage.onload = function(){
    background.getContext("2d").drawImage(backgroundImage,0,0);
};

var foregroundImage = new Image();
foregroundImage.src = "foreground.png";
var spriteImage = new Image();
spriteImage.src = "sprite.png";



// Load spritesheet
var spritesheet;
var xhr = new XMLHttpRequest();
xhr.open('GET', "sprite.json", false);
xhr.onreadystatechange = function(){
    if(xhr.readyState===4 && xhr.status===200){
        spritesheet = JSON.parse(xhr.responseText);
    }
};
xhr.send();





// Record Player position (relative to canvas)
var Player = { x:100, y:100, vx:0, vy:0 };
var Key = {};
window.onkeydown = function(event){
    switch(event.keyCode){
        case 37: Key.left=true; break;
        case 38: Key.up=true; break;
        case 39: Key.right=true; break;
        case 40: Key.down=true; break;
    }
}
window.onkeyup = function(event){
    switch(event.keyCode){
        case 37: Key.left=false; break;
        case 38: Key.up=false; break;
        case 39: Key.right=false; break;
        case 40: Key.down=false; break;
    }
}
Player.face = 1;
Player.frame = 0;
Player.update = function(){

    // Player face
    if(Key.left && !Key.right) Player.face = -1;
    if(Key.right && !Key.left) Player.face = 1;

    // Player frame
    if(Key.left || Key.right || Key.up || Key.down){
        Player.frame = (Player.frame+1)%spritesheet.frames.length;
    }else{
        Player.frame = 0;
    }

    // Velocity player
    var MAX_SPEED = 5;
    Player.vx += (Key.left ? -3 : 0) + (Key.right ? 3 : 0);
    Player.vy += (Key.up ? -3 : 0) + (Key.down ? 3 : 0);
    Player.vx = Player.vx>MAX_SPEED ? MAX_SPEED : (Player.vx<-MAX_SPEED ? -MAX_SPEED : Player.vx); // Limit to 20 max
    Player.vy = Player.vy>MAX_SPEED ? MAX_SPEED : (Player.vy<-MAX_SPEED ? -MAX_SPEED : Player.vy); // Limit to 20 max
    Player.vx = (!Key.left && !Key.right) ? Player.vx*0.5 : Player.vx; // Stop if no keys
    Player.vy = (!Key.up && !Key.down) ? Player.vy*0.5 : Player.vy; // Stop if no keys

    // Move player
    Player.x += Player.vx;
    Player.y += Player.vy;

    // Correct wall collision.
    for(var i=0;i<boxes.length;i++){
        var box = boxes[i];

        // Is Intersecting
        if( box.left<Player.x && box.right>Player.x && box.top<Player.y && box.bottom>Player.y){

            // Variables
            var dx = Player.x-box.left;
            var dy = Player.y-box.top;
            var slope = box.height/box.width;

            // Triangles
            var topleft = ( dy < (box.width-dx)*slope );
            var bottomright = !topleft;
            var topright = ( dy < dx*slope );
            var bottomleft = !topright;

            // Sides
            if(topleft&&bottomleft){
                Player.x = box.left;
            }else if(topright&&bottomright){
                Player.x = box.right;
            }else if(topleft&&topright){
                Player.y = box.top;
            }else if(bottomleft&&bottomright){
                Player.y = box.bottom;
            }

        }

    }

    // And outside walls
    var padding = 15;
    if(Player.x<padding) Player.x=padding;
    if(Player.y<padding) Player.y=padding;
    if(Player.x>600-padding) Player.x=600-padding;
    if(Player.y>600-padding) Player.y=600-padding;

};




// Where the walls are
var walls = [];
var boxes = []; // PROTOTYPE.
function addBox(left,top,width,height){

    var right = left+width;
    var bottom = top+height;

    var padding = 15;
    boxes.push({
        left:left-padding,
        right:right+padding,
        top:top-padding,
        bottom:bottom+padding,
        width:width+2*padding,
        height:height+2*padding
    });

    walls = walls.concat([
        { ax:left, ay:top, bx:right, by:top }, // top wall
        { ax:left, ay:bottom, bx:right, by:bottom }, // bottom wall
        { ax:left, ay:top, bx:left, by:bottom }, // left wall
        { ax:right, ay:top, bx:right, by:bottom } // right wall
    ]);

}
addBox(390,-32,17,173);
addBox(-9,197,61,13);
addBox(147,197,133,13);
addBox(325,197,65,13);
addBox(390,197,15,193);
addBox(195,210,15,329);
addBox(210,390,71,15);
addBox(325,390,144,15);
addBox(526,390,88,15);

function drawShadowShape(wall,lightX,lightY,fillStyle){

    var vector, vectorLength;
    var ctx = shadows.getContext('2d');

    // Begin drawing shadow
    ctx.fillStyle = fillStyle;
    ctx.beginPath();

    // From the start of the wall to the end of the wall
    ctx.moveTo(wall.ax,wall.ay);
    ctx.lineTo(wall.bx,wall.by);

    // From the end of the wall to a far enough distance away from the light source.
    vector = { x:wall.bx-lightX, y:wall.by-lightY };
    vectorLength = Math.sqrt(vector.x*vector.x+vector.y*vector.y);
    vector.x *= 1000000/vectorLength;
    vector.y *= 1000000/vectorLength;
    ctx.lineTo(wall.bx+vector.x,wall.by+vector.y);

    // From the start of the wall to a far enough distance away from the light source.
    vector = { x:wall.ax-lightX, y:wall.ay-lightY };
    vectorLength = Math.sqrt(vector.x*vector.x+vector.y*vector.y);
    vector.x *= 1000000/vectorLength;
    vector.y *= 1000000/vectorLength;
    ctx.lineTo(wall.ax+vector.x,wall.ay+vector.y);

    // Fill in the shadow
    ctx.fill();

}

function renderShadows(){
    shadows.width = shadows.width;
    for(var i=0;i<walls.length;i++){
        var wall = walls[i];

        // Main opaque shadow
        drawShadowShape(wall,Player.x,Player.y,"#000");

        // Fuzzy transparent shadows
        drawShadowShape(wall,Player.x-10,Player.y,"rgba(0,0,0,0.2)");
        drawShadowShape(wall,Player.x,Player.y-10,"rgba(0,0,0,0.2)");
        drawShadowShape(wall,Player.x+10,Player.y,"rgba(0,0,0,0.2)");
        drawShadowShape(wall,Player.x,Player.y+10,"rgba(0,0,0,0.2)");

    }
}

function renderForeground(){

    var ctx = foreground.getContext("2d");
    foreground.width = foreground.width;
    ctx.drawImage(foregroundImage,0,0);

    // YOU
    var frame = spritesheet.frames[Player.frame].frame;
    ctx.translate(Player.x,Player.y);
    ctx.scale(0.3,0.3);
    ctx.scale(Player.face,1); // Player facing
    ctx.translate(-90,-90);

    var offset = spritesheet.frames[Player.frame].spriteSourceSize;
    ctx.translate(offset.x,offset.y);
    ctx.drawImage(
        spriteImage,
        frame.x,frame.y,frame.w,frame.h,
        0,0,frame.w,frame.h
    );

}
function renderBackground(){
}

// Draw function
var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame;
function draw(){

    // Move Player
    Player.update();

	// Render each layers
    renderShadows();
    renderForeground();
    renderBackground();

    // Render game
    canvas.width = canvas.width;
    ctx.drawImage(shadows,0,0);
    ctx.globalCompositeOperation = "source-out";
	ctx.drawImage(foreground,0,0);
	ctx.globalCompositeOperation = "destination-over";
	ctx.drawImage(background,0,0);

	// Schedule next draw call
	requestAnimationFrame(draw);

}

// Just wait a second
setTimeout(draw,500);

</script>
```