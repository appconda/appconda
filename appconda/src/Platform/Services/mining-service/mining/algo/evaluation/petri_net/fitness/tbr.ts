import { TokenBasedReplay } from "../../../conformance/tokenreplay/algorithm";

export class TbrFitness {
	static apply(eventLog, acceptingPetriNet, activityKey="concept:name") {
		return TokenBasedReplay.apply(eventLog, acceptingPetriNet, activityKey);
	}
	
	static evaluate(tbrResults) {
		return tbrResults;
	}
}

