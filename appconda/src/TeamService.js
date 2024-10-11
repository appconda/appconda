const RealmoceanService = require("./RealmoceanService");
const teamsService = require('./sdk/services/teams');

class TeamService extends RealmoceanService {

  initClient() {
    this.teams = new teamsService(this.client);
  }

  /**
   * List teams
   *
   * Get a list of all the teams in which the current user is a member. You can
   * use the parameters to filter your results.
   *
   * @param {string[]} queries
   * @param {string} search
   * @throws {RealmoceanException}
   * @returns {Promise}
   */
  async list(projectId) {
    return await this.teams.list(projectId);
  }

  /**
   * Create team
   *
   * Create a new team. The user who creates the team will automatically be
   * assigned as the owner of the team. Only the users with the owner role can
   * invite new members, add new owners and delete or update the team.
   *
   * @param {string} teamId
   * @param {string} name
   * @param {string[]} roles
   * @throws {RealmoceanException}
   * @returns {Promise}
   */
  async create(projectId, teamId, name, roles) {
    return await client.create(projectId, teamId, name, roles);
  }

  /**
    * Get team
    *
    * Get a team by its ID. All team members have read access for this resource.
    *
    * @param {string} teamId
    * @throws {RealmoceanException}
    * @returns {Promise}
    */
  async get(projectId, teamId) {
    const client = this.getClient(projectId);

    return await client.get(teamId);
  }

  /**
    * Update name
    *
    * Update the team's name by its unique ID.
    *
    * @param {string} teamId
    * @param {string} name
    * @throws {RealmoceanException}
    * @returns {Promise}
    */
  async updateName(projectId, teamId, name) {
    const client = this.getClient(projectId);
    return await client.updateName(teamId, name);
  }

  /**
   * Delete team
   *
   * Delete a team using its ID. Only team members with the owner role can
   * delete the team.
   *
   * @param {string} teamId
   * @throws {RealmoceanException}
   * @returns {Promise}
   */
  async delete(projectId, teamId) {
    const client = this.getClient(projectId);
    return await client.delete(teamId);

  }

}

TeamService.Name = 'team-service';

module.exports = TeamService;