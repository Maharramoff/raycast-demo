class Utils
{
    static _timestamp()
    {
        return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
    }

    static normalizeAngle(angle)
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









