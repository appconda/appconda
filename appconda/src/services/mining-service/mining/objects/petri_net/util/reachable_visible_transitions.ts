export class PetriNetReachableVisibleTransitions {
	static apply(net, marking) {
		let reachableVisibleTransitions = {};
		let visited = {};
		let toVisit: any = [];
		toVisit.push(marking);
		while (toVisit.length > 0) {
			//console.log(reachableVisibleTransitions);
			let currMarking = toVisit.shift();
			if (currMarking in visited) {
				continue;
			}
			visited[currMarking] = 0;
			let enabledTransitions = currMarking.getEnabledTransitions();
			for (let trans of enabledTransitions) {
				if (trans.label != null) {
					reachableVisibleTransitions[trans.label] = 0;
				}
				else {
					let newMarking = currMarking.execute(trans);
					if (!(newMarking in visited)) {
						toVisit.push(newMarking);
					}
				}
			}
		}
		return Object.keys(reachableVisibleTransitions);
	}
}

