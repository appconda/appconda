


const authPack = {
    url: 'http://93.180.135.42/QDMS/QDMSNET/BSAT/BSATWebapi.asmx?WSDL',
    token : 'jG5KCJiNA0ßßß7CUAVZ5naWvPKfVFcqex3JKJy$$$fZV2rz5u$$$RDfGWßßßxnRCAlVJDDjkhVnROßßßzSnZ27aQtLxßßß8Bnw==' 
}

class TestService extends RealmoceanService {
    async init() {
      //  const schedule = this.services.get('schedule-service');
       // const databaseService =  this.services.get('database-service');
        
      //  const qdms = this.services.get('qdms-service');

     

        //const database = await databaseService.create('the','hans', 'Hans');
       //console.log(await databaseService.list('the'))
        
    }
}

TestService.Name = 'test-service';

module.exports = TestService;