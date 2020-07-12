class Helper
{
    static _timestamp()
    {
        return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
    }

    static normalizeAngel(angle)
    {
        angle %= (2 * Math.PI);
        if (angle < 0)
        {
            angle += 2 * Math.PI;
        }
        return angle;
    }

    static distanceBetween2Points(x1, y1, x2, y2)
    {
        return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    }

    static degree2Radian(degree)
    {
        return degree * (Math.PI / 180);
    }
}

class Canvas
{
    constructor(width, height)
    {
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        document.body.append(this.canvas);
        this.context = this.canvas.getContext('2d');
    }
}

class Player
{
    constructor(ctx, x, y, speed, rotationSpeed)
    {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.rotationSpeed = rotationSpeed * (Math.PI / 180);
        this.rotationAngle = 0;
        this.moveDirection = 0;
        this.turnDirection = 0;
        this.playerCanvas = new Canvas(ctx.canvas.width, ctx.canvas.height)
        this.ctx = this.playerCanvas.context;
        this.ctx.fillStyle = '#fe0807';
        this.radius = 0.125 * TILE_SIZE;
    }

    update()
    {
        this.rotationAngle += this.turnDirection * this.rotationSpeed;
        const newX = this.x + Math.cos(this.rotationAngle) * this.moveDirection * this.speed;
        const newY = this.y + Math.sin(this.rotationAngle) * this.moveDirection * this.speed;

        if (!this.collision(newX, newY))
        {
            this.x = newX;
            this.y = newY;
        }
    }

    draw()
    {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        this.ctx.fill();
    }

    collision(newX, newY)
    {
        return (MAP_GRID[Math.floor((newY + this.radius) / TILE_SIZE)][Math.floor((newX + this.radius) / TILE_SIZE)] !== 0) ||
          (MAP_GRID[Math.floor((newY - this.radius) / TILE_SIZE)][Math.floor((newX - this.radius) / TILE_SIZE)] !== 0)
    }
}

class MiniMap
{
    constructor(ctx, mapData, width, height, scale, wallColor, spaceColor, wallBorderColor)
    {
        this.ctx = ctx;
        this.ctx.canvas.style.backgroundColor = spaceColor;
        this.width = width;
        this.height = height;
        this.grid = mapData;
        this.scale = scale;
        this.wallColor = wallColor;
        this.wallBorderColor = wallBorderColor;
        this.completed = false;
    }

    draw()
    {
        if (this.completed) return;

        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        for (let y = 0; y < this.height; y++)
        {
            for (let x = 0; x < this.width; x++)
            {
                const tile = this.grid[y][x];

                if (tile === 1)
                {
                    this.ctx.fillStyle = this.wallColor;
                    this.ctx.fillRect(
                      x * this.scale,
                      y * this.scale,
                      this.scale,
                      this.scale
                    );
                    this.ctx.strokeStyle = this.wallBorderColor;
                    this.ctx.strokeRect(
                      x * this.scale,
                      y * this.scale,
                      this.scale,
                      this.scale)
                    this.ctx.stroke();
                }
            }
        }

        this.completed = true;
    }
}

class Ray
{
    horzWallHitX = 0;
    vertWallHitX = 0;
    vertWallHitY = 0;
    horzWallHitY = 0;

    constructor(angle, playerX, playerY, ctx)
    {
        this.angle = Helper.normalizeAngel(angle);
        this.playerX = playerX;
        this.playerY = playerY;
        this.ctx = ctx;

        this.wallHitX = 0;
        this.wallHitY = 0;

        this.facingUp = this.facing('up');
        this.facingDown = !this.facingUp;

        this.facingRight = this.facing('right');
        this.facingLeft = !this.facingRight;
    }

    cast()
    {
        const horzHitDistance = this.horizontalHitDistance();
        const vertHitDistance = this.verticalHitDistance();

        this.wallHitX = (horzHitDistance < vertHitDistance) ? this.horzWallHitX : this.vertWallHitX;
        this.wallHitY = (horzHitDistance < vertHitDistance) ? this.horzWallHitY : this.vertWallHitY;
    }

    horizontalHitDistance()
    {
        let yStep = TILE_SIZE;
        yStep *= this.facingUp ? -1 : 1;
        let xStep = TILE_SIZE / Math.tan(this.angle);
        xStep *= (this.facingLeft && xStep > 0) ? -1 : 1;
        xStep *= (this.facingRight && xStep < 0) ? -1 : 1;

        let yIntercept = Math.floor(this.playerY / TILE_SIZE) * TILE_SIZE;
        yIntercept += this.facingDown ? TILE_SIZE : 0;
        let xIntercept = this.playerX + (yIntercept - this.playerY) / Math.tan(this.angle);
        let nextHorzTouchY = yIntercept;
        let nextHorzTouchX = xIntercept;

        if (this.facingUp)
        {
            nextHorzTouchY--;
        }

        let foundHorzWallHit = false;
        while (nextHorzTouchX >= 0 && nextHorzTouchX < SCREEN_WIDTH && nextHorzTouchY >= 0 && nextHorzTouchY < SCREEN_HEIGHT)
        {
            if (this.hitWallAt(nextHorzTouchX, nextHorzTouchY))
            {
                foundHorzWallHit = true;
                this.horzWallHitX = nextHorzTouchX;
                this.horzWallHitY = nextHorzTouchY;
                break;
            }
            else
            {
                nextHorzTouchX += xStep;
                nextHorzTouchY += yStep;
            }
        }

        return (foundHorzWallHit)
          ? Helper.distanceBetween2Points(this.playerX, this.playerY, this.horzWallHitX, this.horzWallHitY)
          : Number.MAX_VALUE;
    }

    verticalHitDistance()
    {
        let xStep = TILE_SIZE * (this.facingLeft ? -1 : 1);
        let yStep = TILE_SIZE * Math.tan(this.angle);
        yStep *= (this.facingUp && yStep > 0) ? -1 : 1;
        yStep *= (this.facingDown && yStep < 0) ? -1 : 1;

        let xIntercept = Math.floor(this.playerX / TILE_SIZE) * TILE_SIZE;
        xIntercept += this.facingRight ? TILE_SIZE : 0;
        let yIntercept = this.playerY + (xIntercept - this.playerX) * Math.tan(this.angle);
        let nextVertTouchX = xIntercept;
        let nextVertTouchY = yIntercept;

        if (this.facingLeft)
        {
            nextVertTouchX--;
        }

        let foundVertWallHit = false;
        while (nextVertTouchX >= 0 && nextVertTouchX < SCREEN_WIDTH && nextVertTouchY >= 0 && nextVertTouchY < SCREEN_HEIGHT)
        {
            if (this.hitWallAt(nextVertTouchX, nextVertTouchY))
            {
                foundVertWallHit = true;
                this.vertWallHitX = nextVertTouchX;
                this.vertWallHitY = nextVertTouchY;
                break;
            }
            else
            {
                nextVertTouchX += xStep;
                nextVertTouchY += yStep;
            }
        }

        return (foundVertWallHit)
          ? Helper.distanceBetween2Points(this.playerX, this.playerY, this.vertWallHitX, this.vertWallHitY)
          : Number.MAX_VALUE;
    }

    hitWallAt(x, y)
    {
        return MAP_GRID[Math.floor(y / TILE_SIZE)][Math.floor(x / TILE_SIZE)] !== 0;
    }

    facing(direction)
    {
        if(direction === 'up')
        {
            return this.angle < 0 || this.angle > Math.PI;
        }

        if(direction === 'right')
        {
            return this.angle < Helper.degree2Radian(90) || this.angle > Helper.degree2Radian(270);
        }

        return undefined;
    }

    draw()
    {
        this.ctx.beginPath();
        this.ctx.strokeStyle = FIELD_OF_VIEW_COLOR;
        //this.ctx.lineWidth = 1.0;
        this.ctx.moveTo(this.playerX, this.playerY);
        this.ctx.lineTo(
          this.wallHitX,
          this.wallHitY
        );
        this.ctx.stroke();
        this.ctx.closePath();
    }
}

class Raycast
{
    constructor(canvas)
    {
        this.running = false;
        this.fps = 60;
        this.step = 1 / this.fps;
        this.now = 0;
        this.lastTime = Helper._timestamp();
        this.deltaTime = 0;
        this.elapsedTime = 0;
        this.ctx = canvas.context;
        this.miniMap = new MiniMap(
          this.ctx,
          MAP_GRID, MAP_GRID[0].length,
          MAP_GRID.length,
          TILE_SIZE,
          WALL_COLOR,
          SPACE_COLOR,
          WALL_BORDER_COLOR
        );
        this.rayCanvas = new Canvas(SCREEN_WIDTH, SCREEN_HEIGHT);
        this.player = new Player(this.ctx, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, 0.5, 2);
        this.rays = [];
    }

    start()
    {
        if (this.running)
        {
            return false;
        }

        this.running = true;
        this._startListening();
        this._animate();
    }

    _animate()
    {

        this.now = Helper._timestamp();
        this.deltaTime = Math.min(1, (this.now - this.lastTime) / 1000);
        this.elapsedTime += this.deltaTime;
        while (this.elapsedTime > this.step)
        {
            this._update();
            this.elapsedTime -= this.step;
        }
        this._draw();
        this.lastTime = this.now;
        requestAnimationFrame(() => this._animate());
    }

    _update()
    {
        this.player.update();
        this.castRays();
    }

    castRays()
    {
        let stripIdx = 0;
        let rayAngle = this.player.rotationAngle - (FIELD_OF_VIEW / 2);
        this.rays = [];
        for (let i = 0; i < RAYS_COUNT; i++)
        {
            this.rays[i] = new Ray(rayAngle, this.player.x, this.player.y, this.rayCanvas.context);
            this.rays[i].cast();
            rayAngle += FIELD_OF_VIEW / RAYS_COUNT;
            stripIdx++;
        }
    }

    handleEvent = e => (function (evtType, events)
    {
        switch (evtType)
        {
            case events.KEYDOWN:
                this.onKeyDown(e);
                break;
            case events.KEYUP:
                this.onKeyUp(e);
                break;
        }
    }.bind(this))(e.type, EVENTS)

    _startListening()
    {
        document.addEventListener(EVENTS.KEYDOWN, this);
        document.addEventListener(EVENTS.KEYUP, this);
    }

    onKeyDown(e)
    {
        switch (e.keyCode)
        {
            case KEY_CODES.UP:
                this.player.moveDirection = 1;
                break;
            case KEY_CODES.DOWN:
                this.player.moveDirection = -1;
                break;
            case KEY_CODES.LEFT:
                this.player.turnDirection = -1;
                break;
            case KEY_CODES.RIGHT:
                this.player.turnDirection = 1;
                break;
        }
    }

    onKeyUp(e)
    {
        switch (e.keyCode)
        {
            case KEY_CODES.UP:
            case KEY_CODES.DOWN:
                this.player.moveDirection = 0;
                break;
            case KEY_CODES.LEFT:
            case KEY_CODES.RIGHT:
                this.player.turnDirection = 0;
                break;
        }
    }

    _draw()
    {
        this.miniMap.draw();
        this.player.draw();
        this.rayCanvas.context.canvas.width = this.rayCanvas.context.canvas.width;
        this.rays.forEach((ray) => ray.draw());
    }
}

const canvas = new Canvas(SCREEN_WIDTH, SCREEN_HEIGHT);
new Raycast(canvas).start();