// nodejs
const Jayson = require('jayson');

exports = module.exports =  class Endpoint  {
    rpcClient;

    constructor(host, rpcPort) {
        this.rpcClient = Jayson.client.http({
            host: host,
            port: rpcPort,
        });
    }

    requestRPC(method, ...params) {
        // console.log(method, params);
        return new Promise((resolve, reject) => {
            this.rpcClient.request(method, params, function (err, response) {
                
                if (err || response.Error) {
                    require('fs').appendFileSync(
                        './error.log',
                        `Error: ${method} ${JSON.stringify(params, null, 2)} ${
                            err ? err.message : JSON.stringify(response.Error)
                        } \n`
                    );
                    console.log(err)
                    reject(new Error(err ? err.message : JSON.stringify(response.Error)));
                    return;
                }
                resolve(response.Result);
            });
        });
    }

    GetBeaconBestState(){
        return this.requestRPC("GetBeaconBestState".toLowerCase())
    }

    GetBeaconCommitteeState(height = 0) {
        return this.requestRPC('GetBeaconCommitteeState'.toLowerCase(),height);
    }

    GetBlockChainInfo(){
        return this.requestRPC('GetBlockChainInfo'.toLowerCase(), ...arguments);
    }

    GetBalanceByPrivatekey(privateKey){
        return this.requestRPC('GetBalanceByPrivatekey'.toLowerCase(), ...arguments);
    }

    GetReward(privateKey){
        return this.requestRPC('GetBalanceByPrivatekey'.toLowerCase(), ...arguments);
    }
}

