#!/usr/bin/env python3

from selenium import webdriver
import os
import unittest
from selenium.webdriver.common.keys import Keys

URLs = [
    'https://www.investing.com/equities/mts_rts',
    'https://www.investing.com/equities/vtb_rts',
    'https://www.investing.com/equities/gazprom_rts',
    'https://www.investing.com/equities/sberbank_rts'
]
drivers = []

with open('js/script.js', 'r') as f:
    script = f.read()

class ExampleTests(unittest.TestCase):

    def setUp(self):
        self.driver = webdriver.Chrome()

    def test_google_title_matches_correct_value(self):
        for url in URLs:
            options = webdriver.ChromeOptions()
            options.add_argument('headless')
            driver = webdriver.Chrome(options=options)
            drivers.append(driver)
            driver.get(url)
            driver.implicitly_wait(3.0)
            try:
                driver.execute_script(script=script)
            except Exception as ex:
                print(ex)
            print(len(drivers))

    def tearDown(self):
        self.driver.close()








