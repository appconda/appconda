import { Client, UploadProgress } from '../client';
import type { Models } from '../models';
import { Runtime } from '../enums/runtime';
import { FunctionUsageRange } from '../enums/function-usage-range';
import { ExecutionMethod } from '../enums/execution-method';
export declare class Functions {
    client: Client;
    constructor(client: Client);
    /**
     * List functions
     *
     * Get a list of all the project&#039;s functions. You can use the query params to filter your results.
     *
     * @param {string[]} queries
     * @param {string} search
     * @throws {AppcondaException}
     * @returns {Promise<Models.FunctionList>}
     */
    list(queries?: string[], search?: string): Promise<Models.FunctionList>;
    /**
     * Create function
     *
     * Create a new function. You can pass a list of [permissions](https://appconda.io/docs/permissions) to allow different project users or team with access to execute the function using the client API.
     *
     * @param {string} functionId
     * @param {string} name
     * @param {Runtime} runtime
     * @param {string[]} execute
     * @param {string[]} events
     * @param {string} schedule
     * @param {number} timeout
     * @param {boolean} enabled
     * @param {boolean} logging
     * @param {string} entrypoint
     * @param {string} commands
     * @param {string[]} scopes
     * @param {string} installationId
     * @param {string} providerRepositoryId
     * @param {string} providerBranch
     * @param {boolean} providerSilentMode
     * @param {string} providerRootDirectory
     * @param {string} templateRepository
     * @param {string} templateOwner
     * @param {string} templateRootDirectory
     * @param {string} templateVersion
     * @param {string} specification
     * @throws {AppcondaException}
     * @returns {Promise<Models.Function>}
     */
    create(functionId: string, name: string, runtime: Runtime, execute?: string[], events?: string[], schedule?: string, timeout?: number, enabled?: boolean, logging?: boolean, entrypoint?: string, commands?: string, scopes?: string[], installationId?: string, providerRepositoryId?: string, providerBranch?: string, providerSilentMode?: boolean, providerRootDirectory?: string, templateRepository?: string, templateOwner?: string, templateRootDirectory?: string, templateVersion?: string, specification?: string): Promise<Models.Function>;
    /**
     * List runtimes
     *
     * Get a list of all runtimes that are currently active on your instance.
     *
     * @throws {AppcondaException}
     * @returns {Promise<Models.RuntimeList>}
     */
    listRuntimes(): Promise<Models.RuntimeList>;
    /**
     * List available function runtime specifications
     *
     * List allowed function specifications for this instance.

     *
     * @throws {AppcondaException}
     * @returns {Promise<Models.SpecificationList>}
     */
    listSpecifications(): Promise<Models.SpecificationList>;
    /**
     * List function templates
     *
     * List available function templates. You can use template details in [createFunction](/docs/references/cloud/server-nodejs/functions#create) method.
     *
     * @param {string[]} runtimes
     * @param {string[]} useCases
     * @param {number} limit
     * @param {number} offset
     * @throws {AppcondaException}
     * @returns {Promise<Models.TemplateFunctionList>}
     */
    listTemplates(runtimes?: string[], useCases?: string[], limit?: number, offset?: number): Promise<Models.TemplateFunctionList>;
    /**
     * Get function template
     *
     * Get a function template using ID. You can use template details in [createFunction](/docs/references/cloud/server-nodejs/functions#create) method.
     *
     * @param {string} templateId
     * @throws {AppcondaException}
     * @returns {Promise<Models.TemplateFunction>}
     */
    getTemplate(templateId: string): Promise<Models.TemplateFunction>;
    /**
     * Get functions usage
     *
     *
     * @param {FunctionUsageRange} range
     * @throws {AppcondaException}
     * @returns {Promise<Models.UsageFunctions>}
     */
    getUsage(range?: FunctionUsageRange): Promise<Models.UsageFunctions>;
    /**
     * Get function
     *
     * Get a function by its unique ID.
     *
     * @param {string} functionId
     * @throws {AppcondaException}
     * @returns {Promise<Models.Function>}
     */
    get(functionId: string): Promise<Models.Function>;
    /**
     * Update function
     *
     * Update function by its unique ID.
     *
     * @param {string} functionId
     * @param {string} name
     * @param {Runtime} runtime
     * @param {string[]} execute
     * @param {string[]} events
     * @param {string} schedule
     * @param {number} timeout
     * @param {boolean} enabled
     * @param {boolean} logging
     * @param {string} entrypoint
     * @param {string} commands
     * @param {string[]} scopes
     * @param {string} installationId
     * @param {string} providerRepositoryId
     * @param {string} providerBranch
     * @param {boolean} providerSilentMode
     * @param {string} providerRootDirectory
     * @param {string} specification
     * @throws {AppcondaException}
     * @returns {Promise<Models.Function>}
     */
    update(functionId: string, name: string, runtime?: Runtime, execute?: string[], events?: string[], schedule?: string, timeout?: number, enabled?: boolean, logging?: boolean, entrypoint?: string, commands?: string, scopes?: string[], installationId?: string, providerRepositoryId?: string, providerBranch?: string, providerSilentMode?: boolean, providerRootDirectory?: string, specification?: string): Promise<Models.Function>;
    /**
     * Delete function
     *
     * Delete a function by its unique ID.
     *
     * @param {string} functionId
     * @throws {AppcondaException}
     * @returns {Promise<{}>}
     */
    delete(functionId: string): Promise<{}>;
    /**
     * List deployments
     *
     * Get a list of all the project&#039;s code deployments. You can use the query params to filter your results.
     *
     * @param {string} functionId
     * @param {string[]} queries
     * @param {string} search
     * @throws {AppcondaException}
     * @returns {Promise<Models.DeploymentList>}
     */
    listDeployments(functionId: string, queries?: string[], search?: string): Promise<Models.DeploymentList>;
    /**
     * Create deployment
     *
     * Create a new function code deployment. Use this endpoint to upload a new version of your code function. To execute your newly uploaded code, you&#039;ll need to update the function&#039;s deployment to use your new deployment UID.

This endpoint accepts a tar.gz file compressed with your code. Make sure to include any dependencies your code has within the compressed file. You can learn more about code packaging in the [Appconda Cloud Functions tutorial](https://appconda.io/docs/functions).

Use the &quot;command&quot; param to set the entrypoint used to execute your code.
     *
     * @param {string} functionId
     * @param {File} code
     * @param {boolean} activate
     * @param {string} entrypoint
     * @param {string} commands
     * @throws {AppcondaException}
     * @returns {Promise<Models.Deployment>}
     */
    createDeployment(functionId: string, code: File, activate: boolean, entrypoint?: string, commands?: string, onProgress?: (progress: UploadProgress) => void): Promise<Models.Deployment>;
    /**
     * Get deployment
     *
     * Get a code deployment by its unique ID.
     *
     * @param {string} functionId
     * @param {string} deploymentId
     * @throws {AppcondaException}
     * @returns {Promise<Models.Deployment>}
     */
    getDeployment(functionId: string, deploymentId: string): Promise<Models.Deployment>;
    /**
     * Update deployment
     *
     * Update the function code deployment ID using the unique function ID. Use this endpoint to switch the code deployment that should be executed by the execution endpoint.
     *
     * @param {string} functionId
     * @param {string} deploymentId
     * @throws {AppcondaException}
     * @returns {Promise<Models.Function>}
     */
    updateDeployment(functionId: string, deploymentId: string): Promise<Models.Function>;
    /**
     * Delete deployment
     *
     * Delete a code deployment by its unique ID.
     *
     * @param {string} functionId
     * @param {string} deploymentId
     * @throws {AppcondaException}
     * @returns {Promise<{}>}
     */
    deleteDeployment(functionId: string, deploymentId: string): Promise<{}>;
    /**
     * Rebuild deployment
     *
     *
     * @param {string} functionId
     * @param {string} deploymentId
     * @param {string} buildId
     * @throws {AppcondaException}
     * @returns {Promise<{}>}
     */
    createBuild(functionId: string, deploymentId: string, buildId?: string): Promise<{}>;
    /**
     * Cancel deployment
     *
     *
     * @param {string} functionId
     * @param {string} deploymentId
     * @throws {AppcondaException}
     * @returns {Promise<Models.Build>}
     */
    updateDeploymentBuild(functionId: string, deploymentId: string): Promise<Models.Build>;
    /**
     * Download deployment
     *
     * Get a Deployment&#039;s contents by its unique ID. This endpoint supports range requests for partial or streaming file download.
     *
     * @param {string} functionId
     * @param {string} deploymentId
     * @throws {AppcondaException}
     * @returns {string}
     */
    getDeploymentDownload(functionId: string, deploymentId: string): string;
    /**
     * List executions
     *
     * Get a list of all the current user function execution logs. You can use the query params to filter your results.
     *
     * @param {string} functionId
     * @param {string[]} queries
     * @param {string} search
     * @throws {AppcondaException}
     * @returns {Promise<Models.ExecutionList>}
     */
    listExecutions(functionId: string, queries?: string[], search?: string): Promise<Models.ExecutionList>;
    /**
     * Create execution
     *
     * Trigger a function execution. The returned object will return you the current execution status. You can ping the `Get Execution` endpoint to get updates on the current execution status. Once this endpoint is called, your function execution process will start asynchronously.
     *
     * @param {string} functionId
     * @param {string} body
     * @param {boolean} async
     * @param {string} xpath
     * @param {ExecutionMethod} method
     * @param {object} headers
     * @param {string} scheduledAt
     * @throws {AppcondaException}
     * @returns {Promise<Models.Execution>}
     */
    createExecution(functionId: string, body?: string, async?: boolean, xpath?: string, method?: ExecutionMethod, headers?: object, scheduledAt?: string): Promise<Models.Execution>;
    /**
     * Get execution
     *
     * Get a function execution log by its unique ID.
     *
     * @param {string} functionId
     * @param {string} executionId
     * @throws {AppcondaException}
     * @returns {Promise<Models.Execution>}
     */
    getExecution(functionId: string, executionId: string): Promise<Models.Execution>;
    /**
     * Delete execution
     *
     * Delete a function execution by its unique ID.

     *
     * @param {string} functionId
     * @param {string} executionId
     * @throws {AppcondaException}
     * @returns {Promise<{}>}
     */
    deleteExecution(functionId: string, executionId: string): Promise<{}>;
    /**
     * Get function usage
     *
     *
     * @param {string} functionId
     * @param {FunctionUsageRange} range
     * @throws {AppcondaException}
     * @returns {Promise<Models.UsageFunction>}
     */
    getFunctionUsage(functionId: string, range?: FunctionUsageRange): Promise<Models.UsageFunction>;
    /**
     * List variables
     *
     * Get a list of all variables of a specific function.
     *
     * @param {string} functionId
     * @throws {AppcondaException}
     * @returns {Promise<Models.VariableList>}
     */
    listVariables(functionId: string): Promise<Models.VariableList>;
    /**
     * Create variable
     *
     * Create a new function environment variable. These variables can be accessed in the function at runtime as environment variables.
     *
     * @param {string} functionId
     * @param {string} key
     * @param {string} value
     * @throws {AppcondaException}
     * @returns {Promise<Models.Variable>}
     */
    createVariable(functionId: string, key: string, value: string): Promise<Models.Variable>;
    /**
     * Get variable
     *
     * Get a variable by its unique ID.
     *
     * @param {string} functionId
     * @param {string} variableId
     * @throws {AppcondaException}
     * @returns {Promise<Models.Variable>}
     */
    getVariable(functionId: string, variableId: string): Promise<Models.Variable>;
    /**
     * Update variable
     *
     * Update variable by its unique ID.
     *
     * @param {string} functionId
     * @param {string} variableId
     * @param {string} key
     * @param {string} value
     * @throws {AppcondaException}
     * @returns {Promise<Models.Variable>}
     */
    updateVariable(functionId: string, variableId: string, key: string, value?: string): Promise<Models.Variable>;
    /**
     * Delete variable
     *
     * Delete a variable by its unique ID.
     *
     * @param {string} functionId
     * @param {string} variableId
     * @throws {AppcondaException}
     * @returns {Promise<{}>}
     */
    deleteVariable(functionId: string, variableId: string): Promise<{}>;
}
