import { PetriNetAlignments } from "../../../conformance/alignments/petri_net/algorithm";

export class AlignmentsFitness {
	static apply(eventLog, acceptingPetriNet, activityKey="concept:name") {
		return PetriNetAlignments.apply(eventLog, acceptingPetriNet, activityKey);
	}
	
	static evaluate(alignResults) {
		return alignResults;
	}
}

