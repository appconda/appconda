import { TokenBasedReplay } from "../../../conformance/tokenreplay/algorithm";

export class GeneralizationTbrResults {
	value: any;
	constructor(value) {
		this.value = value;
	}
}

export class GeneralizationTbr {
	static apply(log, acceptingPetriNet, activityKey="concept:name") {
		return GeneralizationTbr.evaluate(TokenBasedReplay.apply(log, acceptingPetriNet, activityKey));
	}
	
	static evaluate(tbrResults) {
		let invSqOccSum = 0.0
		for (let trans in tbrResults.transExecutions) {
			let thisTerm = 1.0 / Math.sqrt(Math.max(tbrResults.transExecutions[trans], 1));
			invSqOccSum += thisTerm;
		}
		let ret = new GeneralizationTbrResults(1.0 - invSqOccSum/(Object.keys(tbrResults.transExecutions).length));
		return ret;
	}
}
