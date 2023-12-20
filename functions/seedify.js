const seedify = {
    getUpcoming: async () => {
        try {
            let response = await fetch('https://api-igo.seedify.fund/api/pools/get_upcPool')
            let answer = await response.json()
            let formatted = []
            
            for (let i = 0; i < answer['upcPool'].length; i++) {
                if (answer['upcPool'][i].symbol !== "TEST") {
                    formatted.push({
                        tokenName: answer['upcPool'][i].title,
                        tokenSymbol: answer['upcPool'][i].symbol,
                        websiteLink: answer['upcPool'][i].browser_web_link,
                        twitterLink: answer['upcPool'][i].twitter_link,
                        whitepaperLink: answer['upcPool'][i].white_paper,
                        telegramLink: answer['upcPool'][i].telegram_link,
                        submittedDescription: answer['upcPool'][i].description
                    })
                }
            }

            return formatted
        } catch (e) {
            console.log(e)
        }
    }
}

module.exports = seedify