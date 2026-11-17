import puppeteer from 'puppeteer-core';
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:128,height:128});await p.goto('file://'+process.cwd()+'/public/favicon.svg');await p.screenshot({path:'/downloads/rookie9_icon.png'});await b.close();
