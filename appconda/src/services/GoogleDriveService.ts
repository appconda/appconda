import e from "express";
import { BaseService } from "../BaseService";

const express = require('express');
const multer = require('multer');
const { google } = require('googleapis');

const clientId = '73132713570-hffmn5dnu9cpn36l7e5uus9llpk7q8jh.apps.googleusercontent.com';
const clientSecret = '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';

const redirectUri = 'http://localhost/v1/service/google/callback';

const scopes = ['https://www.googleapis.com/auth/drive'];



export default class GoogleDriveService extends BaseService {

    public get uid(): string {
        return 'com.appconda.service.google-drive';
    }

    get displayName(): string {
        return 'Google Drive Service'
    }

    async init() {

        const router: e.Router = this.webServer.getRouter();


        // Get the authentication URL
        router.get('/google', async (req, res) => {
            const authUrl = await this.generateAuthUrl(req);
            console.log(authUrl);
            res.redirect(authUrl);
        });

        router.get('/google/close', async (req, res) => {
            const authUrl = await this.generateAuthUrl(req);
            res.send(`
            <html lang="en">
                <head>
                </head>
                <script>

                let access_token = '';
                

                const searchParams = new URLSearchParams(decodeURI(window.location.search));
              
                // access_token = searchParams.get('access_token');
                //resolve(access_token);
                //popup.close();
              
                if (window.opener) {
                  
                    // send them to the opening window
                    try {
                    window.opener.postMessage({message:'google-drive', token: searchParams.get('access_token')});
                    } catch(e) {
                        alert(e)
                    }
                    // close the popup
                    window.close();
                  }
                  
            
              
                </script>
                <body>sadasd</body>
            </html>
            `);
        });

        /*  var drive = google.drive({
             version: "v3",
             auth: oAuth2Client,
         }); */


        // Handle the callback from the authentication flow
        router.get('/google/callback', async (req, res) => {
            console.log('google callback')
            const code = req.query.code;
            const state = JSON.parse(req.query.state as string);
            console.log(req.query.state)
            console.log(state)
            try {
                // Exchange the authorization code for access and refresh tokens
                const oAuth2Client = await this.generateAuthClient(req);
                const { tokens } = await oAuth2Client.getToken(code);
                const accessToken = tokens.access_token;
                const refreshToken = tokens.refresh_token;
                oAuth2Client.setCredentials({ refresh_token: refreshToken, access_token: accessToken });
                console.log('refresh_token : ', refreshToken)

                console.log(`${state.protocol}://${state.host}/v1/service/google/close?refresh_token=${refreshToken}&access_token=${accessToken}&CLOSE=true`)
                // Save the tokens in a database or session for future use

                // Redirect the user to a success page or perform other actions
                res.redirect(`${state.protocol}://${state.host}/v1/service/google/close?refresh_token=${refreshToken}&access_token=${accessToken}&CLOSE=true`);
            } catch (error) {
                console.error('Error authenticating:', error);
                res.status(500).send('Authentication failed.');
            }
        });

        router.get('/google/_close', async (req, res) => {
            try {
                res.send('success');
            } catch (error) {
                console.error('Error authenticating:', error);
                res.status(500).send('Authentication failed.');
            }
        });

        router.get('/google/files/:id', async (req, res) => {
            try {

                const id = req.params.id;
                const token = req.headers['x-google-drive-token'];

                const oAuth2Client = await this.generateAuthClient(req);
                oAuth2Client.setCredentials({ refresh_token: undefined, access_token: token });

                var drive = google.drive({
                    version: "v3",
                    auth: oAuth2Client,
                });

                const response = await drive.files.list({
                    q: `'${id}' in parents and mimeType != 'application/vnd.google-apps.folder'`,
                    //  pageSize: 10, // Set the desired number of files to retrieve
                    fields: 'files(*)', // Specify the fields to include in the response
                });
                const files = response.data.files;
                res.json(files);
            } catch (err) {
                console.error('Error listing files:', err);
                res.status(500).json({ error: 'Failed to list files' });
            }
        });

        router.get('/google/folders/:id', async (req, res) => {
            try {
                const id = req.params.id;

                const token = req.headers['x-google-drive-token'];

                const oAuth2Client = await this.generateAuthClient(req);
                oAuth2Client.setCredentials({ refresh_token: undefined, access_token: token });

                var drive = google.drive({
                    version: "v3",
                    auth: oAuth2Client,
                });

                const _res = await drive.files.list({
                    q: `'${id}' in parents and mimeType='application/vnd.google-apps.folder'`,
                    fields: 'nextPageToken, files(*)',
                    spaces: 'drive',
                });

                const folders = _res.data.files;
                res.json(folders);
            } catch (err) {
                console.error('The API returned an error: ' + err);
            }
        })

        /*  router.get('/google/folder/:id', async (req, res) => {
             try {
                 const token = req.headers['x-google-drive-token'];
 
                 oAuth2Client.setCredentials({ refresh_token: undefined, access_token: token });
 
                 const folders = await drive.files.list({
                     q: `'${req.params.id}' in parents`,
                     fields: 'nextPageToken, files(*)',
                 })
 
                 const _folders = folders.data.files;
                 res.json(_folders);
             } catch (err) {
                 console.error('The API returned an error: ' + err);
             }
         }) */
        router.get('/google/folder/:id/details', async (req, res) => {
            try {

                const oAuth2Client = await this.generateAuthClient(req);

                var drive = google.drive({
                    version: "v3",
                    auth: oAuth2Client,
                });

                const _res = await drive.files.get({
                    fileId: req.params.id,
                    fields: '*',
                });
                console.log(_res)
                return res.json(_res);
            } catch (err) {
                console.error('The API returned an error: ' + err);
            }
        })
    }

    private async generateAuthUrl(req: e.Request) {


        const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);



        // Generate the authentication URL
        const authUrl = oAuth2Client.generateAuthUrl({
            // 'online' (default) or 'offline' (gets refresh_token)
            access_type: 'offline',
            prompt: 'consent',
            /** Pass in the scopes array defined above.
            * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
            scope: scopes,
            state: JSON.stringify({ host: req.hostname, protocol: req.protocol }),
            // Enable incremental authorization. Recommended as a best practice.
            include_granted_scopes: true
        });

        return authUrl;
    }
    private async generateAuthClient(req: e.Request) {


        const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);


        // Generate the authentication URL
        const authUrl = oAuth2Client.generateAuthUrl({
            // 'online' (default) or 'offline' (gets refresh_token)
            access_type: 'offline',
            /** Pass in the scopes array defined above.
            * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
            scope: scopes,
            state: JSON.stringify({ host: req.hostname, protocol: req.protocol }),
            // Enable incremental authorization. Recommended as a best practice.
            include_granted_scopes: true
        });

        return oAuth2Client;
    }

    async getFileOrFolderDetails(drive: any, fileId: string) {
        try {
            const res = await drive.files.get({
                fileId: fileId,
                fields: '*',
            });

            return res;
        } catch (err) {
            console.error('The API returned an error: ' + err);
        }
    }


    async listFilesAndFolders(drive: any, folderId: string) {
        console.log(folderId)
        try {
            const res = await drive.files.list({
                q: `'${folderId}' in parents`,
                fields: 'nextPageToken, files(id, name, mimeType)',
                spaces: 'drive',
            });

            const files = res.data.files;
            return files;
        } catch (err) {
            console.error('The API returned an error: ' + err);
        }
    }

    async getConnector(): Promise<any> {
        return {
          uid: 'com.realmocean.connector.google-drive',
          name: 'Github',
          image: '/images/azure-devops.svg',
          dialog: {
            "title": 'Create Google Drive Connection',
            "image": '/images/jira.png',
            "type": "csp",
    
            "fieldMap": {
              "name": {
                "label": "Connection Name",
                "type": "text",
                "name": "name"
              },
              "application": {
                "label": "Application",
                "type": "text",
                "name": "type",
                "isDisabled": true,
                "defaultValue": "com.celmino.connection.csp"
              },
              "domain": {
                "label": "Base URI *",
                "type": "text",
                "name": "key.domain",
                "helpMessage": 'Your Jira cloud host address. For example "https://my-jira.atlassian.net"'
              },
              "eData": {
                "label": "Bimser Encript Data",
                "type": "text",
                "name": "key.eData",
                "helpMessage": 'Email you are using for logging to Jira'
              },
              "token": {
                "label": "API token ",
                "type": "text",
                "name": "key.token",
                "helpMessage": 'Your Jira token created for Celmino'
              },
              "secret": {
                "type": "virtual",
                "name": "secret",
                "value": ['key.token', 'key.eData']
              }
            },
            "layout": {
              "type": "collapse",
              "containers": [
                {
                  "label": "General",
                  "fields": [
                    "name",
                    "application"
                  ]
                },
                {
                  "label": "Connection Details",
                  "fields": [
                    "domain",
                    "eData",
                    "token"
                  ]
                }
    
    
              ]
    
            }
          }
        }
      }

}


