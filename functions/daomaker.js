const daomaker = {
    getUpcoming: async () => {
        try {
            let response = await fetch('https://api.daomaker.com/prepareHomePage')
            let answer = await response.json()
            let formatted = []
            
            for (let i = 0; i < answer.offerings.length; i++) {
                formatted.push({
                    tokenName: answer.offerings[i].title,
                    tokenSymbol: answer.offerings[i].token_ticker,
                    websiteLink: answer.offerings[i].company[0].website_url,
                    twitterLink: answer.offerings[i].company[0].twitter_url,
                    telegramLink: answer.offerings[i].company[0].telegram_url,
                    submittedDescription: answer.offerings[i].company[0].short_description,
                    status: answer.offerings[i].ended ? 2 : 0
                })
            }

            return formatted                                
        } catch (e) {
            console.log(e)
        }
    }
}

module.exports = daomaker