class Util {

    static getDefaultTime() {
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().replace('T', ' ').replace(/\..+/, '');
        return formattedDate
    }
}

module.exports=Util