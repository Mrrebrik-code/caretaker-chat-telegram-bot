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
}