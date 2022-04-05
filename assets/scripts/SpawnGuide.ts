import { _decorator, Component, Node, instantiate, Prefab, Graphics, Color } from 'cc';
const { ccclass, property, requireComponent, executeInEditMode } = _decorator;

const GRID_W = 24;
const GRID_H = 24;
const CELL_SIZE = 64;
const OFFSET_X = CELL_SIZE * GRID_W / 2;
const OFFSET_Y = OFFSET_X;

@ccclass('SpawnGuide')
@requireComponent(Graphics)
@executeInEditMode
export class SpawnGuide extends Component {
	@property(Color)
	primaryColor: Color = Color.WHITE.clone();

	@property(Color)
	secondaryColor: Color = Color.BLACK.clone();

	private graphics: Graphics;

	onLoad() {
		this.graphics = this.node.getComponent(Graphics);

		for (let i = 0; i < GRID_W; ++i) {
			for (let j = 0; j < GRID_H; ++j) {
				if ((i + j + 1) % 2) {
					this.graphics.fillColor = this.primaryColor;
				} else {
					this.graphics.fillColor = this.secondaryColor;
				}

				this.graphics.fillRect(
					i * CELL_SIZE - OFFSET_X,
					j * CELL_SIZE - OFFSET_Y,
					CELL_SIZE,
					CELL_SIZE
				);
			}
		}
	}
}
