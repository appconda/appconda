import { EventLog, Trace, Event, Attribute } from "../../../../objects/log/log";

export class PetriNetPlayout {
	static apply(acceptingPetriNet, numDesideredTraces=1000, activityKey="concept:name", timestampKey="time:timestamp") {
		let petriNet = acceptingPetriNet.net;
		let initialMarking = acceptingPetriNet.im;
		let finalMarking = acceptingPetriNet.fm;
		let count = 0;
		let minTimestamp = 10000000;
		let eventLog = new EventLog();
		while (true) {
			if (count >= numDesideredTraces) {
				break;
			}
			let trace = new Trace();
			let marking = initialMarking.copy();
			while (!(finalMarking.equals(marking))) {
				let enabledTransitions = marking.getEnabledTransitions();
				let pickedTransition = enabledTransitions[Math.floor(Math.random() * enabledTransitions.length)];
				if (pickedTransition.label != null) {
					let eve = new Event();
					eve.attributes[activityKey] = new Attribute(pickedTransition.label);
					eve.attributes[timestampKey] = new Attribute(new Date(minTimestamp*1000));
					trace.events.push(eve);
				}
				marking = marking.execute(pickedTransition);
				minTimestamp++;
			}
			eventLog.traces.push(trace);
			count++;
		}
		
		return eventLog;
	}
}
