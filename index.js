const puppeteer = require('puppeteer');

const user = "kienvi"
const password = "periperi"
const adiiUser = "kienvi"
const adiiPassword = "KLSV110411"
const rosterURL = "https://see.adiinsights.com/shifts/?unit=12660&date=2021-01-30"
const accManURL = "https://pericentral.worldmanager.com/admin/ctrl?page=accounts%2Fprofile"

const CheckStaff = async (page) => {
    await page.goto(rosterURL)
    try {
        await page.waitForSelector('input[name=username]');
        await page.$eval('input[name=username]', (el, x) => {el.value = x}, adiiUser)
    
        await page.waitForSelector('input[name=password]');
        await page.$eval('input[name=password]', (el, x) => {el.value = x}, adiiPassword)
    
        await page.click("button[id='sign-in']")

        console.log(`Username (${adiiUser}) and password has been submitted to Adii`)
    } catch (error) {
        console.log(error)
    }
}

const Puppet = async () => {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();

    await CheckStaff(page)

    await page.goto(accManURL);

    const usernameElement = "input[name=username]"
    await page.waitForSelector(usernameElement)
    await page.$eval(usernameElement, (el, x) => {el.value = x}, user)

    const passwordElement = "input[name=password]"
    await page.waitForSelector(passwordElement)
    await page.$eval(passwordElement, (el, x) => {el.value = x}, password)

    await page.click("button[name=loginbutton]")

    console.log(`Attempting to log into ${user}'s details on peri central`)

    //waiting for the next page to load
    await page.waitForSelector("tr")

    //check if the new page has the header "my details" to confirm a successfull login
    var headerCheck
    try {
        headerCheck = await page.$eval("span[class='header-title']", el => el.innerHTML)
        console.log("Successfully logged in")
    } catch (error) {
        console.log("Unsuccessful login attempt")
    }
//   await page.screenshot({path: 'example.png'});

//   await browser.close();
}

Puppet()