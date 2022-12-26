function ImportKeyList(){
    let keylist = {}
    let keys = require("./keylist")

    for (let i = 0; i < keys.length; i++) {
        keylist[keys[i].Cpk] = keys[i]
        delete(keylist[keys[i].Cpk]["Cpk"])
    }
    return keylist
}

exports = module.exports = {
    ImportKeyList
}