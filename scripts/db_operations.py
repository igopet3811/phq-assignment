# -*- coding: utf-8 -*-
"""
Created on Wed Dec  4 13:10:50 2019

@author: igorescento
"""
import sys
import re

from sqlalchemy import create_engine, text, Integer, Column, Text, MetaData, Table
from sqlalchemy.pool import NullPool
from bs4 import BeautifulSoup
from web_scraping import DATA_CREATION_PATH, SOURCE_FILE_NAME

# DB connection string and schema name
DB_CONNECTION_STRING = 'postgresql://postgres:postgres@192.168.0.193:5432'
DB_SCHEMA_NAME = 'phq'


def dictify(ul):
    result = {}
    for li in ul.find_all("li", recursive=False):
        key = next(li.stripped_strings)
        ul = li.find("ul")
        if ul:
            result[key] = dictify(ul)
        else:
            result[key] = None
    return result


def dict_path(data, path, my_dict):
    for k,v in my_dict.items():
        branch = path
        if isinstance(v, dict):
            branch += k
            data.append(branch)
            dict_path(data, branch + " > ", v)
        else:
            leaf = path
            leaf += k
            data.append(leaf)
            
            
def run_db_operations():
    # create db engine
    engine = create_engine(DB_CONNECTION_STRING, convert_unicode=True, poolclass=NullPool)
    conn = engine.connect()

    try:
        create_db_sql = text(open('./sql/create_db.sql').read())
    except FileNotFoundError as e:
        print('SQL FILE(s) NOT FOUND.\n', e)
        sys.exit(1)
    
    try:
        conn.connection.connection.set_isolation_level(0)
        conn.execute(create_db_sql)
        conn.connection.connection.set_isolation_level(1)
    except Exception as e:
        err_type, err_obj, traceback = sys.exc_info()
        line_num = traceback.tb_lineno
        print ("\npsycopg2 ERROR:", e, "on line number:", line_num)
        print ("psycopg2 traceback:", traceback, "-- type:", err_type)
    finally:
        conn.close()

    # connect to newly created db
    engine = create_engine(DB_CONNECTION_STRING + '/' + DB_SCHEMA_NAME, convert_unicode=True, poolclass=NullPool)
    conn = engine.connect()
    
    try:
        create_db_sql = text(open('./sql/create_tables.sql').read())
    except FileNotFoundError as e:
        print('SQL FILE(s) NOT FOUND.\n', e)
        sys.exit(1)
    
    try:
        conn.connection.connection.set_isolation_level(0)
        conn.execute(create_db_sql)
        conn.connection.connection.set_isolation_level(1)
    except Exception as e:
        err_type, err_obj, traceback = sys.exc_info()
        line_num = traceback.tb_lineno
        print ("\npsycopg2 ERROR:", e, "on line number:", line_num)
        print ("psycopg2 traceback:", traceback, "-- type:", err_type)
    finally:
        conn.close()


    conn = engine.connect()
    # Create a metadata instance for a table
    metadata = MetaData(engine)
    MyTable = Table('tree', metadata,
                   Column('uid', Integer, primary_key=True), 
                   Column('name', Text),
                   Column('size', Integer),
                   schema = 'assignment')

    # process source file
    data = []
    with open(DATA_CREATION_PATH + '/' + SOURCE_FILE_NAME, "r") as f:
        contents = f.read()
        soup = BeautifulSoup(contents, 'html.parser')
        result = dictify(soup.find("ul"));
        dict_path(data, "", result)
        
    # create obj with name and size from data
    arr = []
    for line in data:
        val = 0
        try:
            val = int(re.sub('^.*\((.*?)\)[^\(]*$', '\g<1>', line))
        except ValueError:
            print("Not a number: ", line)
            pass
        
        row = {
                'name': (re.sub(r'\([^)]*\)', '', line.rstrip('\n'))).strip(),
                'size': val
        }
        arr.append(row)
    
    # save data to DB
    conn.execute(MyTable.insert(), arr)
    conn.close()
        
    print("DB setup and data import finished.")