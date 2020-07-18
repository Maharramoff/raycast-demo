class Game
{
    constructor(canvas)
    {
        this.running = false;
        this.fps = 60;
        this.step = 1 / this.fps;
        this.now = 0;
        this.lastTime = Utils._timestamp();
        this.deltaTime = 0;
        this.elapsedTime = 0;
        this.miniMap = new MiniMap(
          MAP_GRID, MAP_GRID[0].length,
          MAP_GRID.length,
          TILE_SIZE,
          WALL_COLOR,
          SPACE_COLOR,
          WALL_BORDER_COLOR
        );
        this.ctx = canvas.context;
        this.rayCanvas = new Canvas(SCREEN_WIDTH + MAP_OFFSET, SCREEN_HEIGHT);
        this.player = new Player(SCREEN_WIDTH / 2 - TILE_SIZE / 2, SCREEN_HEIGHT / 2 - TILE_SIZE / 2, 1.0, 1.5);
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

        this.now = Utils._timestamp();
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
        for (let i = 0; i < RAYS_COUNT; i++)
        {
            this.rays[i] = new Ray(rayAngle, this.player.x, this.player.y, this.rayCanvas.context);
            this.rays[i].cast();
            const wallDistance = this.rays[i].distance * Math.cos(this.rays[i].angle - this.player.rotationAngle);
            const distanceProjectionPlane = (MAP_OFFSET / 2) / Math.tan(FIELD_OF_VIEW / 2);
            this.rays[i].wallStripHeight = (TILE_SIZE / wallDistance) * distanceProjectionPlane;
            this.rays[i].alpha = WALL_ALPHA_FACTOR / wallDistance;
            rayAngle += FIELD_OF_VIEW / RAYS_COUNT;
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
        this.rayCanvas.context.clearRect(MAP_OFFSET, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        const gradient = this.ctx.createLinearGradient(0, 0, 0, SCREEN_HEIGHT);
        gradient.addColorStop(0, BACKGROUND_COLOR);
        gradient.addColorStop(0.5, '#000');
        gradient.addColorStop(1, BACKGROUND_COLOR);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, MAP_OFFSET, SCREEN_HEIGHT);
        this.rays.forEach((ray, idx) =>
        {
            ray.draw();
            ray.drawWall(this.ctx, idx)
        });
    }
}

const canvas = new Canvas(SCREEN_WIDTH + MAP_OFFSET, SCREEN_HEIGHT);
const rayCast = new Game(canvas);
rayCast.start();