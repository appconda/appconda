
export interface GithubService {
    createIssue(username: string, repo: string, token: string, issue: any);
    
}