const RAYCAST_MAP = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 1, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
];
const RAYCAST_MINI_MAP_SCALE = 25;
const RAYCAST_MINI_MAP_WALL_COLOR = '#7f7f7f';

// Player
const KEY_CODES = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
};

const EVENTS = {
    KEYDOWN: 'keydown',
    KEYUP: 'keyup',
};