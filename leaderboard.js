module.exports = class leaderboard{
    constructor(database){
        this.database = database;
    }

    async getLeaderboard(){
        let database = this.database;

        let leaders = await database.getUsersToLeaderboard();
        console.log(leaders);
        return leaders;
    }

    async addCountMessages(userId){
        let database = this.database;

        let counMessages = await database.getCountMessagesToUserId(userId);
        counMessages += 1;

        await database.setCountMessagesToUserId(userId, counMessages)
    }
}