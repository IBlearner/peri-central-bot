const puppeteer = require('puppeteer');
const fs = require("fs")
require("dotenv").config()

const password = "periperi"
const adiiUser = process.env.Adii_User
const adiiPassword = process.env.Adii_Password
const rosterURL = "https://see.adiinsights.com/shifts/?unit=12660&date=2021-01-30"
const accManURL = "https://pericentral.worldmanager.com/admin/ctrl?page=accounts%2Fprofile"
const accManLogoutURL = "https://pericentral.worldmanager.com/admin/index.php?logout=true"

const fileName = "names.txt"
const dir = `${__dirname}/${fileName}`

const Sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//responsible for making the puppet log into adii and getting staff names
const CheckStaff = async (page) => {
    await page.goto(rosterURL)
    try {
        await page.waitForSelector('input[name=username]');
        await page.$eval('input[name=username]', (el, x) => {el.value = x}, adiiUser)
    
        await page.waitForSelector('input[name=password]');
        await page.$eval('input[name=password]', (el, x) => {el.value = x}, adiiPassword)
    
        await page.click("button[id='sign-in']")

        console.log(`Username (${adiiUser}) and password has been submitted to Adii`)

        await page.waitForSelector("tbody")

        const staff = await page.$$eval("tbody > tr", a => a.map(single => {
            const name = single.querySelector("th").innerText
            return name
        }))
        console.log(staff)

        await WriteNameToFile(staff)
        
    } catch (error) {
        console.log(error)
    }
}

//opening a txt file if one doesn't already exist. appends an array of names scraped from adii
const WriteNameToFile = async (x) => {
    fs.openSync(dir, 'w')
    for (let i = 0; i < x.length; i++) {
        var combinedName = x[i].replace(" ", "")
        var splitName = x[i].split(" ")
        var firstName = splitName[0]
        fs.appendFileSync(dir, `${combinedName} `)
        fs.appendFileSync(dir, `${firstName} `)
    }
}

const LoginAttempt = async (page, staffName) => {
    await page.goto(accManURL)

    const usernameElement = "input[name=username]"
    await page.waitForSelector(usernameElement)
    await page.$eval(usernameElement, (el, x) => {el.value = x}, staffName)

    const passwordElement = "input[name=password]"
    await page.waitForSelector(passwordElement)
    await page.$eval(passwordElement, (el, x) => {el.value = x}, password)

    await page.click("button[name=loginbutton]")

    console.log(`Attempting to log into ${staffName}'s details on peri central`)

    //waiting for the next page to load
    await page.waitForSelector("tr")

    //check if the new page has the header "my details" to confirm a successfull login
    var headerCheck
    try {
        headerCheck = await page.$eval("span[class='header-title']", el => el.innerHTML)
        console.log("Successfully logged in")
        await page.goto(accManLogoutURL)
        return
    } catch (error) {
        console.log("Unsuccessful login attempt")
    }
}

const Puppet = async () => {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();

    //works, txt file already exists though just skipping this step.
    if (typeof process.argv[2] !== "undefined") {
        await CheckStaff(page)
    }

    const staffNames = fs.readFileSync(dir, {encoding:'utf8', flag:'r'})
    const staffNamesArray = staffNames.split(" ")
    for (let i = 0; i < staffNamesArray.length; i++) {
        await LoginAttempt(page, staffNamesArray[i])
        await Sleep(5000)
    }

//   await page.screenshot({path: 'example.png'});

//   await browser.close();
}

Puppet()