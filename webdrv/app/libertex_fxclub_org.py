#!/usr/bin/env python

from selenium import webdriver
import os


URLs = [
    'https://libertex.fxclub.org/products/currency/'
]

with open('js/libertex.fxclub.org.js', 'r') as f:
    script = f.read()

print script

drivers = []
for url in URLs:
    options = webdriver.ChromeOptions()
    options.add_argument('--no-sandbox')
    #options.add_argument('headless')
    driver = webdriver.Chrome(options=options)
    #driver = webdriver.Chrome()
    drivers.append(driver)
    driver.get(url)
    driver.implicitly_wait(3.0)
    try:
        driver.execute_script(script=script)
    except Exception, ex:
        print ex
    print len(drivers)







