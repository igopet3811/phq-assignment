# -*- coding: utf-8 -*-
"""
Created on Fri Dec 13 13:16:58 2019

@author: igorescento
"""

from web_scraping import create_source_file, DATA_CREATION_PATH, SOURCE_FILE_NAME
from db_operations import run_db_operations

# check if page source already exists and import the data
try:
    f = open(DATA_CREATION_PATH + '/' + SOURCE_FILE_NAME)
    print('File already exists. Delete if you want to rerun web scraper.')
except IOError:
    print('File not found. Running Web scraping script to retrieve data.')
    create_source_file()

run_db_operations()