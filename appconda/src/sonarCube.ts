const axios = require('axios');




async function getProjectDetails(projectKey) {

    const url = 'https://sonarcloud.io/api/components/show';
    const params = {
        component: projectKey
    };
    const config = {
        headers: { 'Authorization': `Basic ${Buffer.from('2cd30a862e8ea5594f7c11671b339a0dc9aab62b' + ':').toString('base64')}` },
        params: params
    };

    try {
        const response = await axios.get(url, config);
        return response.data.component; // Projeye ait detayları döndür
    } catch (error) {
        console.error('Error fetching project details:', error);
        return null;
    }
}

async function getIssues(projectKey) {
    const url = 'https://sonarcloud.io/api/issues/search';
    const params = {
        componentKeys: projectKey,
        statuses: 'OPEN', // Burada farklı durumlar belirtilebilir: OPEN, CONFIRMED, REOPENED, RESOLVED, CLOSED
        // Diğer parametreler, örneğin: severities, types, tags, assignees vb.
    };
    const config = {
        headers: { 'Authorization': `Basic ${Buffer.from('2cd30a862e8ea5594f7c11671b339a0dc9aab62b' + ':').toString('base64')}` },
        params: params
    };

    try {
        const response = await axios.get(url, config);
        return response.data.issues; // Sorunların listesini döndür
    } catch (error) {
        console.error('Error fetching issues:', error);
        return [];
    }
}


async function getBugCount(projectKey) {
    const url = 'https://sonarcloud.io/api/issues/search';
    const params = {
        componentKeys: projectKey,
        types: 'BUG',
        resolved: false
    };
    const config = {
        headers: { 'Authorization': `Basic ${Buffer.from('2cd30a862e8ea5594f7c11671b339a0dc9aab62b' + ':').toString('base64')}` }
    };

    try {
        const response = await axios.get(url, { params, headers: config.headers });
        const bugs = response.data.total;
        return bugs;
    } catch (error) {
        console.error('Error fetching bug count:', error);
        return null;
    }
}

async function getMeasure(projectKey) {
    const url = 'https://sonarcloud.io/api/measures/component';
    const params = {
        component: projectKey,
        metricKeys: ['complexity','cognitive_complexity','duplicated_blocks', 'duplicated_files','open_issues',
            'code_smells','sqale_rating','sqale_index','bugs','security_rating','classes'
        ].join(',') // Metrik anahtarlarını virgülle ayrılmış string olarak gönder
    };
    const config = {
        headers: { 'Authorization': `Basic ${Buffer.from('2cd30a862e8ea5594f7c11671b339a0dc9aab62b' + ':').toString('base64')}` }
    };

    try {
        const response = await axios.get(url, { params, headers: config.headers });
        const bugs = response.data.component.measures;
        return bugs;
    } catch (error) {
        console.error('Error fetching bug count:', error);
        return null;
    }
}

async function listProjects(projectId) {
    const url = 'https://sonarcloud.io/api/projects/search';

    const params = {
       organization: 'bpmgenesis'
    };

    const config = {
        headers: { 'Authorization': `Basic ${Buffer.from('2cd30a862e8ea5594f7c11671b339a0dc9aab62b' + ':').toString('base64')}` }
    };

    try {
        const response = await axios.get(url, {params,  headers: config.headers });
        return response.data.components; // Projelerin listesini döndür
    } catch (error) {
        console.error('Error listing projects:', error);
        return [];
    }
}

// Projeyi çağır
getMeasure('bpmgenesis_procetra-app').then(bugCount => {
    console.log('Bug Count:', bugCount);
});