import unittest
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
import random

class ExampleTests(unittest.TestCase):

    def setUp(self):
        #self.driver = webdriver.Chrome()
        options = webdriver.ChromeOptions()
        options.add_argument('headless')
        self.driver = webdriver.Chrome(options=options)

    def test_google_title_matches_correct_value(self):
        self.driver.get("https://www.investing.com/equities/sberbank_rts")
        filename = 'screen-{num}.png'.format(num=random.randint(100, 1000))
        self.driver.get_screenshot_as_file(filename)
        assert "SBER" in self.driver.title

    def tearDown(self):
        self.driver.close()