const { createClient } = require('@supabase/supabase-js');

module.exports = class database{
    constructor(){
        this.supabase = createClient(process.env.URL_SUPABASE, process.env.API_SUPABASE)
        console.log("Initialized database!");
    }


    async addNewUser(user){
        let supabase = this.supabase;

        let userData = await supabase
        .from('users-chat')
        .insert(
        [ 
            { 
                userId: user.id,
                firstName: user.firstname,
                userName: user.username,
                countMessages: 0,
                muteData: "false",
                userReportCount: 0,
                wordReportCount: 0,
                countHelp: 0,
                status: "joined"
            }
        ]);

        return Boolean(userData.data.length);
    }

    async addForbiddenWord(wordText){
        let supabase = this.supabase;

        let wordData = await supabase
        .from('words')
        .insert(
        [ 
            { 
                word: wordText
            }
        ]);

        return Boolean(wordData.data.length);
    }

    async removeForbiddenWord(wordText){
        let supabase = this.supabase;

        let wordData = await supabase
        .from('words')
        .delete()
        .eq('word', wordText)

        return Boolean(wordData.data.length);
    }
}