import puppeteer from 'puppeteer-core';
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage();await p.setViewport({width:1400,height:700});p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('http://localhost:8124/index.html');await p.waitForFunction('window.ready',{timeout:60000});
console.log(JSON.stringify(await p.evaluate('window.out')));
const js=process.argv[2];if(js)await p.evaluate(js);await new Promise(r=>setTimeout(r,500));
await p.screenshot({path:'/tmp/lab_p.png'});await b.close();
