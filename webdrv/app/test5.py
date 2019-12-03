#!/usr/bin/env python

import unittest
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
import random


options = webdriver.ChromeOptions()
options.add_argument('headless')
driver = webdriver.Chrome(options=options)
with open('js/script.js', 'r') as f:
    script = f.read()

print(script)

driver.get("https://www.investing.com/equities/sberbank_rts")
driver.implicitly_wait(3.0)
filename = 'screen-{num}.png'.format(num=random.randint(100, 1000))
driver.get_screenshot_as_file(filename)
try:
    driver.execute_script(script=script)
except Exception as ex:
    print(ex)

#driver.close()
