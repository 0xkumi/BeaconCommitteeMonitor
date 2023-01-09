let Endpoint = require("./node")
let beacon0 = new Endpoint("127.0.0.1", 20004)
let {ImportKeyList} = require("./utils")
let keysObj = ImportKeyList()
let keys = Object.keys(keysObj)

// const k1 = "121VhftSAygpEJZ6i9jGkKtxHyWvAmXSDFvEXCQJxEg6VeaqPhramr3fkdssxs696jRR5RHcvW2KMkjvKUJudW9oXfkDvwYgpB2n2HrPkWD4tMUEbHXejqjbKQP5h1igfSV9DYwxRyc4tUiS6XkVZ5CTfPPevWJ4mXrnJ1iehxbbeSm9WBJG8nRhXFgm6Phh53Y61fGoVcbKYuUDmpFisuRmmcQgCbAFqdsH8A8wJQ5tqK2EQuwRjNL4cVx3tAqceVEHqmSMMdrjQMBT1S3W62ksdbgp6cPKe1KDvbRdJmEq32e4jgdxPCHwRpagvRahYNjtHQc1wiZRLQtKR4HA4vX98FK3rj1suDcxZpK7vGqVVQqPuw5eyjf5oJFgfD7mUg4BUzTCaMeDVTFdyTH9vU9mmyQ7eadouH58zvyeh6nHeE4v"
// const k2 = "121VhftSAygpEJZ6i9jGk6RCxhXW1MRWn8T97YNsgHHg2vzVhWQa1t4pSYKSb1PNYSmpWkb59FF6MRutDvaeU4Sdgkuz9Vmfy3x5TbbKL1Fm6N7eYz2S7VfQv6L5Qo5p8dCNEH8U58sTNA4kR8CReFBFZ8cZiNgk5z1mWB5ujzRoAoca2PfpzAtbrwCfzoifXD9KWwjbz6e7s621kd3vf4oqJPKySmsnUwh6f3ACNMepLVJj7G7QLtGrzoPPn2BgemEFdHomaSmeWp4eX5NpTvXZ8pzX6rLcJcjPnw1bqEwyH1iUZFJCdZ18UtnHs45GxnifrQFxmUNFvoEJJMBB7GqHP4Mm9xuMA3i92gkwkz5oQHTr7TgmdUpjGjvF7aRB1oEePEBQ1QLmvQpGpWZ5UYRBHTifFyL9J9BivC7XKQxE8iSz"

// ~async function(){
//     let res1 = await beacon3.GetBeaconStakerInfo(5616, k1)
//     console.log(res1)

//     let res2 = await beacon3.GetBeaconStakerInfo(5616, k2)
//     console.log(res2)
// }()


const CMD_LIST = {
    'show': {
        "customkeys": showCustomKeyInfo,
        "beaconcommittee": showBeaconCommittee,
        "blockchaininfo": 1
    },
    'stake': {},
    'addstake': {},
    'unstake': {},
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
                await fd(cmd.slice(index + 1, cmd.length))
                break
            } else {
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

async function showBlockChainInfo(blockchainInfo) {

    let str = `Epoch: ${blockchainInfo["BestBlocks"]["-1"].Epoch} - `
    str += `Beacon: ${blockchainInfo["BestBlocks"]["-1"].Height}, `
    for (let v of Object.keys(blockchainInfo["BestBlocks"])) {
        if (v != "-1") {
            str += `Shard${v}: ${blockchainInfo["BestBlocks"][v]["Height"]}, `
        }
    }
    return str
}


function indexOfStr(s, list) {
    for (let i = 0; i < list.length; i++) {
        if (s == list[i]) {
            return i
        }
    }
    return -1
}

async function showCustomKeyInfo() {
    let beaconView = await beacon0.GetBeaconBestState()
    let customKey = {}

    for (let sid of Object.keys(beaconView["ShardCommittee"])) {
        for (let k of keys) {
            let offset = indexOfStr(k, beaconView["ShardCommittee"][sid])
            if (offset !== -1) {
                if (customKey[k] == null) customKey[k] = {}
                customKey[k].shard = {
                    sid: sid,
                    role: "Committee",
                    offset: offset,
                    queueLength: beaconView["ShardCommittee"][sid].length,
                }
            }
        }
    }

    for (let sid of Object.keys(beaconView["ShardPendingValidator"])) {
        for (let k of keys) {
            let offset = indexOfStr(k, beaconView["ShardPendingValidator"][sid])
            if (offset !== -1) {
                if (customKey[k] == null) customKey[k] = {}
                customKey[k].shard = {
                    sid: sid,
                    role: "Pending",
                    offset: offset,
                    queueLength: beaconView["ShardPendingValidator"][sid].length,
                }

            }
        }
    }

    for (let sid of Object.keys(beaconView["SyncingValidator"])) {
        for (let k of keys) {
            let offset = indexOfStr(k, beaconView["SyncingValidator"][sid])
            if (offset !== -1) {
                if (customKey[k] == null) customKey[k] = {}
                customKey[k].shard = {
                    sid: sid,
                    role: "Syncing",
                }
            }
        }
    }

    for (let k of keys) {
        // console.log("k", k)
        let offset = indexOfStr(k, beaconView["CandidateShardWaitingForNextRandom"])
        if (offset !== -1) {
            if (customKey[k] == null) customKey[k] = {}
            customKey[k].shard = {
                role: "Assigning",
            }
        }
    }

    for (let k of keys) {
        let offset = indexOfStr(k, beaconView["BeaconCommittee"])
        if (offset !== -1) {
            if (customKey[k] == null) customKey[k] = {}
            customKey[k].beacon = {
                role: "Committee",
                offset: offset,
                queueLength: beaconView["BeaconCommittee"].length,
            }
        }
    }

    for (let k of keys) {
        let offset = indexOfStr(k, beaconView["BeaconPendingValidator"])
        if (offset !== -1) {
            if (customKey[k] == null) customKey[k] = {}
            customKey[k].beacon = {
                role: "Pending",
                offset: offset,
                queueLength: beaconView["BeaconPendingValidator"].length,
            }
        }
    }


    for (let k of keys) {
        let offset = indexOfStr(k, beaconView["BeaconWaiting"])
        if (offset !== -1) {
            if (customKey[k] == null) customKey[k] = {}
            customKey[k].beacon = {
                role: "Waiting",
                offset: offset,
                queueLength: beaconView["BeaconWaiting"].length,
            }
        }
    }

    for (let k of keys) {
        let offset = indexOfStr(k, beaconView["BeaconLocking"])
        if (offset !== -1) {
            if (customKey[k] == null) customKey[k] = {}
            customKey[k].beacon = {
                role: "Locking",
                offset: offset,
                queueLength: beaconView["BeaconLocking"].length,
            }
        }
    }

    function KeyInfo(cpk, beacon, shard, balance, reward) {
        this.CPK = cpk.slice(cpk.length - 6, cpk.length)
        this.Beacon = beacon ? beacon.role : ""
        this.Shard = shard ? (shard.role + " " + (shard.sid || "")).trim() : ""
        this.Balance = balance
        this.Reward = reward
    }

    let showInfo = []
    let balanceProcess = []
    let rewardProcess = []
    for (let key of Object.keys(customKey)) {
        showInfo.push(new KeyInfo(key, customKey[key].beacon, customKey[key].shard, 0, 0))
        balanceProcess.push(getKeyBalance(keysObj[key].PrivateKey))
        rewardProcess.push(getRewardAmount(keysObj[key].PaymentAddress))

    }

    let balances = await Promise.all(balanceProcess)
    let rewards = await Promise.all(rewardProcess)

    for (let i = 0; i < showInfo.length; i++) {
        showInfo[i].Balance = balances[i]
        showInfo[i].Reward = rewards[i]
    }
    return showInfo
}

async function getRewardAmount(paymentAdd) {
    let res = await beacon0.GetRewardAmount(paymentAdd)
    return res
}

async function getKeyBalance(privateKey) {
    let res = await beacon0.GetBalanceByPrivatekey(privateKey)
    return res
}

async function showBeaconCommittee(cmd) {
    let jsonData = await beacon0.GetBeaconCommitteeState(cmd[0])

    function StakerInfo(cpk, stakingamount, unstake, perforamnce, epochScore, fixnode, finishSync, activeTime) {
        this.CPK = cpk.slice(cpk.length - 6, cpk.length)
        this.StakingAmount = stakingamount
        this.Unstake = unstake
        this.Performance = perforamnce
        this.Score = epochScore
        this.FixedNode = fixnode
        this.Score = epochScore
        this.FinishSync = finishSync
        this.ShardActiveTime = activeTime
    }

    function LockingInfo(cpk, epoch, reason, releaseEpoch, releaseAmount) {
        this.CPK = cpk.slice(cpk.length - 6, cpk.length)
        this.Epoch = epoch
        this.Reason = reason
        this.Release = releaseEpoch
        this.Amount = releaseAmount
    }

    let blockchainInfo = await beacon0.GetBlockChainInfo()
    let databcInfo = await showBlockChainInfo(blockchainInfo)
    let committes = []
    let pending = []
    let waiting = []
    let locking = []
    for (let info of jsonData["Committee"]) {
        committes.push(new StakerInfo(info.CPK, info.StakingAmount, info.Unstake, info.Performance, info.EpochScore, info.FixedNode, info.FinishSync, info.ShardActiveTime))
    }

    for (let info of jsonData["Pending"]) {
        pending.push(new StakerInfo(info.CPK, info.StakingAmount, info.Unstake, info.Performance, info.EpochScore, info.FixedNode, info.FinishSync, info.ShardActiveTime))
    }

    for (let info of jsonData["Waiting"]) {
        waiting.push(new StakerInfo(info.CPK, info.StakingAmount, info.Unstake, info.Performance, info.EpochScore, info.FixedNode, info.FinishSync, info.ShardActiveTime))
    }
    for (let info of jsonData["Locking"]) {
        locking.push(new LockingInfo(info.CPK, info.LockingEpoch, info.LockingReason, info.ReleaseEpoch, info.ReleaseAmount))
    }

    let customKeyInfo = await showCustomKeyInfo()
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

    if (customKeyInfo.length > 0) {
        console.log("Custom Key Info:");
        console.table(customKeyInfo);
    }
}
