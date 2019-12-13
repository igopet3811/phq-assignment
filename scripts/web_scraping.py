# -*- coding: utf-8 -*-
"""
Created on Thu Nov 21 12:55:46 2019

@author: igorescento
"""
import time
import sys
import pathlib

from datetime import datetime
from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By


# chromedriver path eg C://Users//username//Desktop//chromedriver
# https://chromedriver.chromium.org/downloads
WEBDRIVER_PATH = 'chromedriver'
DATA_CREATION_PATH = './data'
SOURCE_FILE_NAME = 'page_source.txt'

def create_source_file():
    """
    Method to scrape the tree and create a source file
    """
    print('SCRIPT START...')
    driver = webdriver.Chrome(WEBDRIVER_PATH)
    driver.set_page_load_timeout(15)
    driver.implicitly_wait(10)
    
    pathlib.Path(DATA_CREATION_PATH).mkdir(parents=True, exist_ok=True) 

    ## stop after 10 secs if cannot access the page ##
    try:
        driver.get("http://imagenet.stanford.edu/synset?wnid=n02486410")
    except TimeoutException:
        driver.execute_script("window.stop();")
    
    ## wait N seconds until the page is fully loaded ##
    time.sleep(10)
    delay = 15

    try:
        WebDriverWait(driver, delay).until(EC.presence_of_element_located((By.ID, 'tree')))
        print("Page should be ready!")
    except TimeoutException:
        print("Loading took longer than allocated time!")
        sys.exit(1)

    print('CLOSING TREE. WAITING 10 SECONDS...')
    driver.execute_script('$("#tree").jstree("close_all")')
    time.sleep(10)

    ## get count of closed leaves and keep opening unil all opened
    leaves = driver.find_elements_by_class_name("jstree-closed")
    print(len(leaves))
    while(len(leaves) > 0):
        print('TIME IS: ', datetime.now(), '. LEAVES REMAINING... ', len(leaves))
        driver.execute_script("$('#tree').jstree('open_all')")
        if(len(leaves)) > 2000:
            print('RUNNING FOR 10 MINUTES!')
            time.sleep(600)
        else:
            print('RUNNING FOR ', (len(leaves)*0.25), ' SECONDS.')
            time.sleep(len(leaves)*0.25)
        leaves = driver.find_elements_by_class_name("jstree-closed")

    # save source html, do not waste server resources
    page_source = driver.page_source
    print(page_source, file=open(DATA_CREATION_PATH + '/' + SOURCE_FILE_NAME, "a+"))
    print('Page source file created successfully! Web scraping script is finished.')