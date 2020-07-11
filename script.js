class Helper
{
    static _timestamp()
    {
        return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
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

class Ray
{
    constructor(angle, playerX, playerY, ctx)
    {
        this.angle = angle;
        this.playerX = playerX;
        this.playerY = playerY;
        this.ctx = ctx;
    }

    draw()
    {
        this.ctx.beginPath();
        this.ctx.strokeStyle = FIELD_OF_VIEW_COLOR;
        this.ctx.lineWidth = 0.5;
        this.ctx.moveTo(this.playerX, this.playerY);
        this.ctx.lineTo(
          this.playerX + Math.cos(this.angle) * 30,
          this.playerY + Math.sin(this.angle) * 30
        );
        this.ctx.stroke();
        this.ctx.closePath();
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
        this.radius = 3.0;
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
        let rayAngle = this.player.rotationAngle - (FIELD_OF_VIEW / 2);
        this.rays = [];
        for (let i = 0; i < RAYS_COUNT; i++)
        {
            this.rays.push(new Ray(rayAngle, this.player.x, this.player.y, this.rayCanvas.context));
            rayAngle += FIELD_OF_VIEW / RAYS_COUNT;
        }
    }

    handleEvent(e)
    {
        return (function (evtType, events)
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
        }.bind(this))(e.type, EVENTS);
    }

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