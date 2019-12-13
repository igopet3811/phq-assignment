#/src/views/TreeView.py
from flask import request, g, Blueprint, json, Response
from ..models.TreeModel import TreeModel, TreeSchema
from flask_cors import cross_origin

tree_api = Blueprint('tree_api', __name__)
tree_schema = TreeSchema()

@tree_api.route('/', methods=['GET'])
@cross_origin()
def get_all():
  """
  Get All Tree Data
  """
  el = TreeModel.get_all()
  data = tree_schema.dump(el, many=True)
  return custom_response(data, 200)  

def custom_response(res, status_code):
  """
  Custom Response Function
  """
  return Response(
    mimetype="application/json",
    response=json.dumps(res),
    status=status_code
  )