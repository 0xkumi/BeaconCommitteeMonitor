let Endpoint = require("./node")
let beacon0 =  new Endpoint("127.0.0.1",20000)

const CMD_LIST = {
    'show': {
        "beaconcommittee":showBeaconCommittee,
        "blockchaininfo":1
    },
    'stake':{},
    'addstake':{},
    'unstake':{},
}

function hint(...cmd) {
    if (cmd.length == 0) {
        let k = Object.keys(CMD_LIST)
        console.log(k)
    }

    let index = 0
    while (true) {
        if (index == cmd.length - 1 && CMD_LIST[cmd[index]] != null) {
            let k = Object.keys(CMD_LIST[cmd[index]])
            console.log(k)
        } else {
            break
        }
        index++
    }
}

async function run(...cmd) {
    let index = 0
    let cmdLevel = CMD_LIST
    while (true) {
        if (cmdLevel[cmd[index]] != null) {
            if (typeof cmdLevel[cmd[index]] == "function") {
                var fd = cmdLevel[cmd[index]]
                await fd(cmd.slice(index+1, cmd.length ))
                break
            } else{
                    cmdLevel = CMD_LIST[cmd[index]]
                    index++
            }
        } else {
            console.log(index, cmd[index], typeof CMD_LIST[cmd[index]])
            console.log("Command is not correct format!")
            break
        }
    }
}

exports = module.exports = {
    run: run
}

async function showBlockChainInfo(){
    let blockchainInfo = await beacon0.GetBlockChainInfo()
    let str = `Epoch: ${blockchainInfo["BestBlocks"]["-1"].Epoch} - `
    str += `Beacon: ${blockchainInfo["BestBlocks"]["-1"].Height}, `
    for (let v of Object.keys(blockchainInfo["BestBlocks"])) {
        if (v != "-1") {
            str += `Shard${v}: ${blockchainInfo["BestBlocks"][v]["Height"]}, `
        }
    }
    return str
}

async function showBeaconCommittee(cmd){
    let res = await beacon0.GetBeaconCommitteeState(cmd[0])
    let jsonData = JSON.parse(res)
    function StakerInfo(cpk, stakingamount, unstake, perforamnce, epochScore, fixnode,finishSync,activeTime){
        this.CPK = cpk.slice(cpk.length-6, cpk.length)
        this.StakingAmount = stakingamount
        this.Unstake = unstake
        this.Performance = perforamnce
        this.Score = epochScore
        this.FixedNode = fixnode
        this.Score = epochScore
        this.FinishSync = finishSync
        this.ShardActiveTime = activeTime
    }
    function LockingInfo(cpk, epoch, reason,releaseEpoch,releaseAmount){
        this.CPK = cpk.slice(cpk.length-6, cpk.length)
        this.Epoch = epoch
        this.Reason = reason
        this.Release = releaseEpoch
        this.Amount = releaseAmount
    }
    let committes = []
    let pending = []
    let waiting = []
    let locking = []
    for (let info of jsonData["Committee"]) {
        committes.push(new StakerInfo(info.CPK, info.StakingAmount, info.Unstake, info.Performance, info.EpochScore, info.FixedNode,info.FinishSync,info.ShardActiveTime))
    }
    for (let info of jsonData["Pending"]) {
        pending.push(new StakerInfo(info.CPK, info.StakingAmount, info.Unstake, info.Performance, info.EpochScore, info.FixedNode,info.FinishSync,info.ShardActiveTime))
    }
    for (let info of jsonData["Waiting"]) {
        waiting.push(new StakerInfo(info.CPK, info.StakingAmount, info.Unstake, info.Performance, info.EpochScore, info.FixedNode,info.FinishSync,info.ShardActiveTime))
    }
    for (let info of jsonData["Locking"]) {
        locking.push(new LockingInfo(info.CPK, info.LockingEpoch, info.LockingReason,info.ReleaseEpoch, info.ReleaseAmount))
    }
    let databcInfo = await showBlockChainInfo()
    console.clear()
    console.log(databcInfo)
    if (committes.length > 0) {
        console.log("Committee");
        console.table(committes);
    }
    if (pending.length > 0) {
        console.log("Pending");
        console.table(pending);
    }
    if (waiting.length > 0) {
        console.log("Waiting");
        console.table(waiting);
    }
    if (locking.length > 0) {
        console.log("Locking");
        console.table(locking);
    }
}
