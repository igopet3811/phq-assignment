# src/models/TreeModel.py

from . import db
from marshmallow import fields, Schema
from sqlalchemy import asc

class TreeModel(db.Model):
  """
  Tree Model
  """

  __tablename__ = 'tree'
  __table_args__ = ({"schema": "assignment"})

  uid = db.Column(db.Integer, primary_key=True)
  name = db.Column(db.Text, nullable=False)
  size = db.Column(db.Integer, nullable=False)

  def __init__(self, data):
    self.name = data.get('name')
    self.size = data.get('size')

  def save(self):
    db.session.add(self)
    db.session.commit()

  def update(self, data):
    for key, item in data.items():
      setattr(self, key, item)
    db.session.commit()

  def delete(self):
    db.session.delete(self)
    db.session.commit()
  
  @staticmethod
  def get_all():
    return TreeModel.query.order_by(asc(TreeModel.uid)).all()
    #return TreeModel.query.with_entities(TreeModel.name, TreeModel.size).order_by(asc(TreeModel.uid)).all()
  

  def __repr__(self):
    return '<uid {}>'.format(self.uid)

class TreeSchema(Schema):
  """
  Tree Schema
  """
  uid = fields.Int(dump_only=True)
  name = fields.Str(required=True)
  size = fields.Int(required=True)