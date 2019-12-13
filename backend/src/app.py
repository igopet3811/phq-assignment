#src/app.py
from flask import Flask
from .config import app_config
from .models import db

# import tree_api blueprint
from .views.TreeView import tree_api as tree_blueprint


def create_app(env_name):
  """
  Create app
  """
  
  # app initiliazation
  app = Flask(__name__)

  app.config.from_object(app_config[env_name])

  # initializing db
  db.init_app(app)

  app.register_blueprint(tree_blueprint, url_prefix='/api/v1/tree')

  @app.route('/', methods=['GET'])
  def index():
    """
    example endpoint
    """
    return 'Flask working...'

  return app