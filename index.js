const puppeteer = require('puppeteer');

const user = "kienvi"
const password = "periperi"
const accManURL = "https://pericentral.worldmanager.com/admin/ctrl?page=accounts%2Fprofile"

const Puppet = async () => {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto(accManURL);

    const usernameElement = "input[name=username]"
    await page.waitForSelector(usernameElement)
    await page.$eval(usernameElement, (el, x) => {el.value = x}, user)

    const passwordElement = "input[name=password]"
    await page.waitForSelector(passwordElement)
    await page.$eval(passwordElement, (el, x) => {el.value = x}, password)

    await page.click("button[name=loginbutton]")

    console.log(`Attempting to log in using ${user} details`)
//   await page.screenshot({path: 'example.png'});

//   await browser.close();
}

Puppet()