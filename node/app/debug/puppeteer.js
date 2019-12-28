#!/usr/bin/env node

//puppeteer

const puppeteer = require('puppeteer');

const runTest = async function(mode){
    const browser = await puppeteer.launch({
        args: ['--no-sandbox'],
        headless: mode === 'headless',
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(function(){
        const time = Date.now();
    const handleDocumentLoaded = function(){
        document.getElementById("injected-time").innerHTML = time;
    };
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", handleDocumentLoaded);
    } else {
        handleDocumentLoaded();
    }
});
    await page.goto('https://www.investing.com/equities/mts_rts');
    const filename = `/data/puppeteer-test.png`;
    await page.screenshot({ path: filename });
    console.log(`Saved "${filename}".`);
    await browser.close();
};

(async function(){
    await runTest('headless');
})();
