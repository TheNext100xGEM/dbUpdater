const polkastarter = {
    getUpcoming: async () => {
        try {
            let response = await fetch('https://polkastarter.com/v3/projects?status=upcoming&view=metrics')
            let answer = await response.json()
            let formatted = []
            
            for (let i = 0; i < answer.data.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 1000))
                let response2 = await fetch(`https://polkastarter.com/v3/projects/${answer.data[i].slug}`)
                let answer2 = await response2.json()
                formatted.push({
                    tokenName: answer2.data.name,
                    tokenSymbol: answer2.data.symbol,
                    websiteLink: answer2.data.website_url,
                    twitterLink: answer2.data.twitter_handle !== "" ? `https://twitter.com/${answer2.data.twitter_handle}` : '',
                    whitepaperLink: answer2.data.whitepaper_url,
                    telegramLink: answer2.data.telegram_handle !== "" ? `https://t.me/${answer2.data.telegram_handle}` : '',
                    submittedDescription: answer2.data.description
                })
            }

            return formatted
        } catch (e) {
            console.log(e)
        }
    }
}

module.exports = polkastarter