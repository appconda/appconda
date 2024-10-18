export function Agent(agentType) {
    return (target: any) =>{
        target.prototype.uid = () => {
            return agentType.NAME;
        }
    }
}