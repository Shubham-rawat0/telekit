import {Command} from "commander"

type TelegramResponse={
    ok:boolean;
    result?:{
        message_id?:number
    };
    description?:string
}

const program = new Command()

program
    .name("sendkit")
    .description("sendkit CLI")
    .command("telegram")
    .description("Send a telegram message")
    .argument("<chatId>","Telegram chat ID")
    .argument("<message>","Message text to send")
    .action(async (chatId:string ,message:string)=>{
       const token = process.env.TELEGRAM_BOT_TOKEN;

       if(!token){
        console.error("Missing TELEGRAM_BOT_TOKEN env")
        process.exit(1)
       }
       
       if(!chatId){
        console.error("Missing TELEGRAM chat id")
        process.exit(1)
       }
       
       if(!message){
        console.error("Missing TELEGRAM message text")
        process.exit(1)
       }
       
       const response= await fetch(
                    `https://api.telegram.org/bot${token}/sendMessage`,
                    {
                        method:"POST",
                        headers:{
                            "Content-Type":"application/json"
                        },
                        body: JSON.stringify({
                            chat_id:chatId,
                            text:message
                        })
                    }
       ) 

       const data = (await response.json()) as TelegramResponse

       if (!response.ok || !data.ok){
        const detail = data.description ?? response.statusText
        console.error(`Telegram API req failed:${detail}`)
        process.exit(1)
       }

       const messageId = data.result?.message_id

       console.log(`Sent telegram message to chat ${chatId}`)

       if(messageId!==undefined){
        console.log(`Telegram message id:${messageId}`)
       }
    })

program.parseAsync(process.argv)