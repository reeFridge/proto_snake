import { _decorator, Component, Node, instantiate, Prefab, Graphics, Color, CCInteger } from 'cc';
const { ccclass, property, requireComponent, executeInEditMode } = _decorator;

const GRID_W = 10;
const GRID_H = 10;

import { CELL_SIZE } from './common';

@ccclass('Grid')
@requireComponent(Graphics)
@executeInEditMode
export class Grid extends Component {
	@property(Color)
	primaryColor: Color = Color.WHITE.clone();

	@property(Color)
	secondaryColor: Color = Color.BLACK.clone();

	private graphics: Graphics;

	onLoad() {
		this.drawGrid(GRID_W, GRID_H);
	}

	drawGrid(width: CCInteger, height: CCInteger) {
		this.graphics = this.node.getComponent(Graphics);
		this.graphics.clear();

		for (let i = 0; i < width; ++i) {
			for (let j = 0; j < height; ++j) {
				if ((i + j + 1) % 2) {
					this.graphics.fillColor = this.primaryColor;
				} else {
					this.graphics.fillColor = this.secondaryColor;
				}

				this.graphics.fillRect(
					i * CELL_SIZE,
					j * CELL_SIZE,
					CELL_SIZE,
					CELL_SIZE
				);
			}
		}
	}
}
