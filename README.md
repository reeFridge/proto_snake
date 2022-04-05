# proto_snake

A snake game implemented with the cocos-creator

## Core mechanic

- A snake starts with a size of 3 sections
- WASD keyboard keys change next applied direction
- Each tail section follows next one
- Game stops when snake's head collides with a tail section or an obstacle (stone blocks)
- Each eaten fruit (apple) adds one tail section to the end and also increases base speed (128px/second) by 10%

## Game field

-  Game field is two times bigger than screen size (divided by cell size of size 64px)
-  Camera follows to the snake's head as long as its not too close to the edge
-  Stone blocks limits game zone at the edges of the field
-  By each fifth collected fruit, a stone block will be generated and placed at random position with a size (area) of 1% of the overal field area
      - example: game field size = 30x20 cells = 600 field area => stone block with area of 1% of 600 = 6 cells (it can be any of 2x3, 1x6, 3x3 blocks)
-  After consumption of the fruit a new one will be placed at random position
-  It is garanteed that there will be a minimum one empty cell between stone blocks (no dead ends!)

## TODO

- [ ] User interface
- [ ] Audio fx (optional)
