

/**
 * Agent decorator that assigns a unique identifier to the target class based on the provided agent type.
 * 
 * @param agentType - The type of agent to be associated with the target class.
 * @returns A decorator function that modifies the target class prototype.
 */
export function Agent(agentType) {
    return (target: any) =>{
        target.prototype.uid = () => {
            return agentType.NAME;
        }
    }
}