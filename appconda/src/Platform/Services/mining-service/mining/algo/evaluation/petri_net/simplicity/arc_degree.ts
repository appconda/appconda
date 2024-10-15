export class SimplicityArcDegreeResults {
	value: any;
	constructor(value) {
		this.value = value;
	}
}

export class SimplicityArcDegree {
	static apply(acceptingPetriNet, k=0) {
		return SimplicityArcDegree.evaluate(acceptingPetriNet, k);
	}
	
	static evaluate(acceptingPetriNet, k=0) {
		let summ = 0.0;
		let count = 0;
		for (let placeId in acceptingPetriNet.net.places) {
			let place = acceptingPetriNet.net.places[placeId];
			summ += Object.keys(place.inArcs).length;
			summ += Object.keys(place.outArcs).length;
			count += 2;
		}
		for (let transId in acceptingPetriNet.net.transitions) {
			let trans = acceptingPetriNet.net.transitions[transId];
			summ += Object.keys(trans.inArcs).length;
			summ += Object.keys(trans.outArcs).length;
			count += 2;
		}
		let meanDegree = 0;
		if (count > 0) {
			meanDegree = summ / count;
		}
		let simplicity = 1.0 / (1.0 + Math.max(meanDegree - k, 0));
		let ret = new SimplicityArcDegreeResults(simplicity);
		return ret;
	}
}

