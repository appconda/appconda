export class PetriNetReduction {
	static apply(acceptingPetriNet, asPlugin=true) {
		PetriNetReduction.reduceSingleEntryTransitions(acceptingPetriNet.net);
		PetriNetReduction.reduceSingleExitTransitions(acceptingPetriNet.net);
		
		return acceptingPetriNet;
	}
	
	static reduceSingleEntryTransitions(net) {
		let cont = true;
		while (cont) {
			cont = false;
			let singleEntryInvisibleTransitions: any = [];
			for (let transId in net.transitions) {
				let trans = net.transitions[transId];
				if (trans.label == null && Object.keys(trans.inArcs).length == 1) {
					singleEntryInvisibleTransitions.push(trans);
				}
			}
			for (let trans of singleEntryInvisibleTransitions) {
				let sourcePlace: any = null;
				let targetPlaces: any = [];
				for (let arcId in trans.inArcs) {
					let arc = trans.inArcs[arcId];
					sourcePlace = arc.source;
				}
				for (let arcId in trans.outArcs) {
					let arc = trans.outArcs[arcId];
					targetPlaces.push(arc.target);
				}
				if (Object.keys(sourcePlace.inArcs).length == 1 && Object.keys(sourcePlace.outArcs).length == 1) {
				//if (Object.keys(sourcePlace.inArcs).length > 0 && Object.keys(sourcePlace.outArcs).length == 1) {
					for (let arcId in sourcePlace.inArcs) {
						let sourceTransition = sourcePlace.inArcs[arcId].source;
						for (let p of targetPlaces) {
							net.addArcFromTo(sourceTransition, p);
						}
					}
					net.removeTransition(trans);
					net.removePlace(sourcePlace);
					cont = true;
					break;
				}
			}
		}
	}
	
	static reduceSingleExitTransitions(net) {
		let cont = true;
		while (cont) {
			cont = false;
			let singleExitInvisibleTransitions: any = [];
			for (let transId in net.transitions) {
				let trans = net.transitions[transId];
				if (trans.label == null && Object.keys(trans.outArcs).length == 1) {
					singleExitInvisibleTransitions.push(trans);
				}
			}
			for (let trans of singleExitInvisibleTransitions) {
				let targetPlace: any = null;
				let sourcePlaces: any = [];
				for (let arcId in trans.outArcs) {
					let arc = trans.outArcs[arcId];
					targetPlace = arc.target;
				}
				for (let arcId in trans.inArcs) {
					let arc = trans.inArcs[arcId];
					sourcePlaces.push(arc.source);
				}
				if (Object.keys(targetPlace.inArcs).length == 1 && Object.keys(targetPlace.outArcs).length == 1) {
				//if (Object.keys(targetPlace.inArcs).length == 1 && Object.keys(targetPlace.outArcs).length > 0) {
					for (let arcId in targetPlace.outArcs) {
						let targetTransition = targetPlace.outArcs[arcId].target;
						for (let p of sourcePlaces) {
							net.addArcFromTo(p, targetTransition);
						}
					}
					net.removeTransition(trans);
					net.removePlace(targetPlace);
					cont = true;
					break;
				}
			}
		}
	}
}

