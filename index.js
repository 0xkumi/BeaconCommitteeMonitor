let AsyncConsole = require('asyncconsole')
let readline = require('readline')
let Command = require("./command")

readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY)
    process.stdin.setRawMode(true);

process.stdin.on("keypress", (str,key) => {
    if (key.ctrl && key.name == "s") console.log("exit")
})

async function wait(t) {
    await new Promise(function(resolve ){
        setTimeout(function(){
            resolve()
        },t * 1000)
    }) 
    
}

let _console = new AsyncConsole(">", listCommands)

async function listCommands(input){
    let cmd = input.split(" ")
    while(true) {
        Command.run(...cmd)
        await wait(5)

    }

}
