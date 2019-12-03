#!/usr/bin/env python

from selenium import webdriver
import os


URLs = [
    'https://www.investing.com/equities/mts_rts',
    'https://www.investing.com/equities/vtb_rts',
    'https://www.investing.com/equities/gazprom_rts',
    'https://www.investing.com/equities/sberbank_rts'
]

with open('js/script.js', 'r') as f:
    script = f.read()

#print script

drivers = []
for url in URLs:
    options = webdriver.ChromeOptions()
    options.add_argument('headless')
    driver = webdriver.Chrome(options=options)
    drivers.append(driver)
    driver.get(url)
    driver.implicitly_wait(3.0)
    try:
        driver.execute_script(script=script)
    except Exception, ex:
        print ex
    print len(drivers)







