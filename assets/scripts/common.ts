import { Vec2, CCFloat, Node } from 'cc';

import { Controller } from './Controller';
import { Tail } from './Tail';

export const UP: Vec2 = new Vec2(0, 1);
export const RIGHT: Vec2 = new Vec2(1, 0);
export const DOWN: Vec2 = new Vec2(0, -1);
export const LEFT: Vec2 = new Vec2(-1, 0);
export const EPSILON: CCFloat = 0.0001;

export interface Routable {
	getStartPosition(): Vec2;
	getDestination(): Vec2;
}

export function getNodeStartPosition(node: Node) {
	const component: Routable|null = node.getComponent(Tail) || node.getComponent(Controller);

	return component ? component.getStartPosition() : null;
}

export function getNodeDestination(node: Node) {
	const component: Routable|null = node.getComponent(Tail) || node.getComponent(Controller);

	return component ? component.getDestination() : null;
}
