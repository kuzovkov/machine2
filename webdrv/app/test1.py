#!/usr/bin/env python3

from selenium import webdriver
import os
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities

cap = DesiredCapabilities().FIREFOX
cap["marionette"] = True

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
    os.environ['MOZ_HEADLESS'] = '1'
    driver = webdriver.Firefox(capabilities=cap, executable_path="/usr/local/bin/geckodriver")
    drivers.append(driver)
    driver.get(url)
    driver.implicitly_wait(3.0)
    try:
        driver.execute_script(script=script)
    except Exception as ex:
        print(ex)
    print(len(drivers))


