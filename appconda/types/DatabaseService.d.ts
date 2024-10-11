
export interface DatabaseService {
    list(projectId: string): any[];
    createDocument(projectId: string, databaseId: string, collectionId: string, documentId: string, data: any, permissions?: any);
    listDocuments(projectId: string, databaseId: string, collectionId: string, queries?: string[])
}