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
                countHelp: 0
            }
        ]);

        return Boolean(userData.data.length);
    }

    async getUserFromId(userId){
        let supabase = this.supabase;

        let userData = await supabase
        .from('users-chat')
        .select('userId, firstName, userName, countMessages, muteData, userReportCount, wordReportCount, countHelp, status')
        .eq('userId', userId);
        
        return userData.data[0];
    }

    async trySearchUserId(userId){
        let supabase = this.supabase;

        let user = await supabase
        .from('users-chat')
        .select('userId')
        .eq('userId', userId);

        return Boolean(user.data.length);
    }

    async setStatusUserId(userId, status){
        let supabase = this.supabase;

        let user = await supabase
        .from('users-chat')
        .update({ "status": status })
        .eq('userId', userId)

        return Boolean(user.data.length);
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

    async getAllForbiddenWords(){
        let supabase = this.supabase;

        let wordsData = await supabase
        .from('words')
        .select('word');

        console.log(wordsData.data);
        return wordsData.data;
    }

    async addTimeMuteFromUser(idUser, time){
        let supabase = this.supabase;

        let userData = await supabase
        .from('users-chat')
        .update({ "muteData": time })
        .eq('userId', idUser)

        console.log(userData.data);
        return Boolean(userData.data.length);
    }

    async getTimeMuteUser(idUser){
        let supabase = this.supabase;

        let userData = await supabase
        .from('users-chat')
        .select('muteData')
        .eq('userId', idUser);
        
        return userData.data[0].muteData;
    }

    async getWordReportCountUserId(userId){
        let supabase = this.supabase;

        let userData = await supabase
        .from('users-chat')
        .select('wordReportCount')
        .eq('userId', userId);
        
        console.log(userData.data[0].wordReportCount);
        return userData.data[0].wordReportCount;
    }

    async setWordReportCountUserId(userId, count){
        let supabase = this.supabase;

        let userData = await supabase
        .from('users-chat')
        .update({ "wordReportCount": count })
        .eq('userId', userId)

        console.log(userData.data);
        return Boolean(userData.data.length);
    }

    async addReportFromUser(userId, username, message, idUserReport){
        let supabase = this.supabase;

        let userData = await supabase
        .from('reports-users')
        .insert(
        [ 
            { 
                idUser: userId,
                username: username,
                message: message,
                idUserReport: idUserReport
            }
        ]);
        console.log(userData.data);
        return Boolean(userData.data.length);
    }

    async getReportCountUserId(userId){
        let supabase = this.supabase;

        let userData = await supabase
        .from('users-chat')
        .select('userReportCount')
        .eq('userId', userId);
        
        console.log(userData.data[0].userReportCount);
        return userData.data[0].userReportCount;
    }

    async setReportCountUserId(userId, count){
        let supabase = this.supabase;

        let userData = await supabase
        .from('users-chat')
        .update({ "userReportCount": count })
        .eq('userId', userId)

        console.log(userData.data);
        return Boolean(userData.data.length);
    }


}