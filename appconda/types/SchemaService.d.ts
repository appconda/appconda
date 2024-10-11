export interface SchemaService {
    /**
     * Create shema 
     * @param realmId 
     * @param databaseId 
     * @param schema 
     */
    createDatabase(realmId: string, databaseId: string, schema: any);
}