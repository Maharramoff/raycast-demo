class Ray
{
    horzWallHitX = 0;
    vertWallHitX = 0;
    vertWallHitY = 0;
    horzWallHitY = 0;

    constructor(angle, playerX, playerY, ctx)
    {
        this.angle = Utils.normalizeAngle(angle);
        this.playerX = playerX;
        this.playerY = playerY;
        this.ctx = ctx;

        this.wallHitX = 0;
        this.wallHitY = 0;

        this.facingUp = this.facing('up');
        this.facingDown = !this.facingUp;

        this.facingRight = this.facing('right');
        this.facingLeft = !this.facingRight;
        this.distance = 0;
        this.wallStripHeight = 0;
        this.alpha = 1.0;
        this.hitWasVertical = false;
    }

    cast()
    {
        const horzHitDistance = this.horizontalHitDistance();
        const vertHitDistance = this.verticalHitDistance();

        if (horzHitDistance < vertHitDistance)
        {
            this.wallHitX = this.horzWallHitX;
            this.wallHitY = this.horzWallHitY;
            this.distance = horzHitDistance;
            this.hitWasVertical = true;
        }
        else
        {
            this.wallHitX = this.vertWallHitX;
            this.wallHitY = this.vertWallHitY;
            this.distance = vertHitDistance;
            this.hitWasVertical = false;
        }
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

        let foundHorzWallHit = false;
        while (nextHorzTouchX >= 0 && nextHorzTouchX < SCREEN_WIDTH && nextHorzTouchY >= 0 && nextHorzTouchY < SCREEN_HEIGHT)
        {
            if (this.hitWallAt(nextHorzTouchX, nextHorzTouchY - (this.facingUp ? 1 : 0)))
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
          ? Utils.distanceBetween2Points(this.playerX, this.playerY, this.horzWallHitX, this.horzWallHitY)
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

        let foundVertWallHit = false;
        while (nextVertTouchX >= 0 && nextVertTouchX < SCREEN_WIDTH && nextVertTouchY >= 0 && nextVertTouchY < SCREEN_HEIGHT)
        {
            if (this.hitWallAt(nextVertTouchX - (this.facingLeft ? 1 : 0), nextVertTouchY))
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
          ? Utils.distanceBetween2Points(this.playerX, this.playerY, this.vertWallHitX, this.vertWallHitY)
          : Number.MAX_VALUE;
    }

    hitWallAt(x, y)
    {
        return MAP_GRID[Math.floor(y / TILE_SIZE)][Math.floor(x / TILE_SIZE)] !== 0;
    }

    facing(direction)
    {
        if (direction === 'up')
        {
            return this.angle < 0 || this.angle > Math.PI;
        }

        if (direction === 'right')
        {
            return this.angle < Utils.degree2Radian(90) || this.angle > Utils.degree2Radian(270);
        }

        return undefined;
    }

    draw()
    {
        this.ctx.beginPath();
        this.ctx.strokeStyle = FIELD_OF_VIEW_COLOR;
        this.ctx.lineWidth = 2.0;
        this.ctx.moveTo(this.playerX + MAP_OFFSET, this.playerY);
        this.ctx.lineTo(
          Math.round(this.wallHitX) + MAP_OFFSET,
          Math.round(this.wallHitY)
        );
        this.ctx.stroke();
        this.ctx.closePath();
    }

    drawWall(ctx, rayNum)
    {
        ctx.fillStyle = 'rgba(' + (this.hitWasVertical ? WALL_LIGHT_COLOR : WALL_DARK_COLOR) + ', ' + this.alpha + ')';
        ctx.fillRect(
          Math.round(rayNum * WALL_STRIP_WIDTH * 2),
          Math.round((SCREEN_HEIGHT / 2) - (this.wallStripHeight / 2)),
          WALL_STRIP_WIDTH * 2,
          this.wallStripHeight
        );
    }
}