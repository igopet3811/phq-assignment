# phq-assignment

1. Pull the repo, download postgres docker image and chromedriver. Istall python3, pip, docker etc. OS used is Debian 10.

2. Run postgres docker image on the server:
    `docker run -d -p 5432:5432 --name postgres-container -e POSTGRES_PASSWORD=postgres postgres`  .


    The command runs postgres container with in/out connections on port 5432 with container name postgres-container and password postgres. The last postgres stands for the image name.
    Running command `docker ps` will display running containers.
    
3. Next step is to run a script from `/script` folder `main.py`. This will retrieve the tree from website using selenium webdriver. Make sure the connections string is correct and chromedriver is available to function correctly. The new DB and schema will be created and populated with the data from website.

4. Folder `/backend` contains Flask application. This can be run by command `python run.py`. The best option is to run it in virtual environment. Requirements file is included. 

    To install virtual environment run `sudo apt-get install python3-pip` followed by `sudo pip3 install virtualenv`. To create virtual environment run `virtualenv venv`. Use any name instead of 'venv'. To activate it run `source venv/bin/activate`. Once venv is up and running, requirements can be istalled by running `pip install -r /path/to/requirements.txt`.

    Backend is providing connectivity to the DB, so make sure that the DB string is set correctly in the `.env` file.

5. Frontend is developed in Angular 8. Node.js, npm and angular cli need to be installed in order to run it. Once all prerequisities are installed using `npm install` command, a local dev server can be started by running `npm start`.

These are all the steps required to run it locally.