import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { WindowRef } from '../../services/window.service';

import { map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';
import * as d3 from 'd3';

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TreeComponent implements OnInit {

  @Input() data: any;

  private tree = {};
  private margin = ({ top: 10, right: 120, bottom: 10, left: 40 });
  private dx = 20;
  dy = 150;
  lastPath: any = null;
  private openPaths: Function;
  private deletePaths: Function;
  private getRoot: Function;
  private collapse: Function;
  private update: Function;

  myControl = new FormControl();
  options: string[] = [];
  filteredOptions: Observable<string[]>;
  public minLength: number = 5;

  constructor(
    private window: WindowRef,
  ) {}

  ngOnInit() {
    const data = Object.assign([], this.data);

    for (let x = 0; x < data.length; x++) {
      let steps = data[x].name.split('  > ');
      this.createTree(data[x], steps)
    }

    this.removeEmptyArrays(this.tree);
    const root = d3.hierarchy(this.tree);

    root.x0 = this.dy / 2;
    root.y0 = 0;
    let select2_data = getAutocompleteData(this.tree, [], 0)[1];

    this.options = select2_data;

    /* autocomplete listener kicks in after 5 chars */
    this.filteredOptions = this.myControl.valueChanges
      .pipe(
        startWith(''),
        map(val => val.length >= this.minLength ? this._filter(val): [])
      );

    root.descendants().forEach((d, i) => {
      d.id = i;
      d._children = d.children;
      if (d.depth && d.data.name.length !== 7) d.children = null;
    });

    const svg = d3.select(".graph")
      .append("svg")
      .style("font", "8px sans-serif")
      .style("user-select", "none")

    const gLink = svg.append("g")
    .attr("fill", "none")
    .attr("stroke", "#555")
    .attr("stroke-opacity", 0.4)
    .attr("stroke-width", 0.5);

    const gNode = svg.append("g")
      .attr("cursor", "pointer")
      .attr("pointer-events", "all");

    let diagonal = d3.linkHorizontal().x(d => d.y).y(d => d.x);
    let tree = d3
      .tree()
      .nodeSize([this.dx, this.dy])
      .separation((a, b) => ((a.parent == root) && (b.parent == root)) ? 2 : 1);


    this.update = (source, window) => {
      const duration = d3.event && d3.event.altKey ? 2500 : 250;
      const nodes = root.descendants().reverse();
      const links = root.links();

      /* Compute the tree layout. */
      tree(root);

      let left = root;
      let right = root;

      root.eachBefore(node => {
        if (node.x < left.x) left = node;
        if (node.x > right.x) right = node;
      });

      const height = right.x - left.x + 200;

      const transition = svg.transition()
        .duration(duration)
        .attr("viewBox", [-150, left.x - 10, 1400, height])
        .tween("resize", window.ResizeObserver ? null : () => () => svg.dispatch("toggle"));

      /* Update nodes */
      const node = gNode.selectAll("g")
        .data(nodes, d => d.id);

      /* Enter any new nodes at the parent's previous position. */
      const nodeEnter = node.enter().append("g")
        .attr("transform", d => `translate(${source.y0},${source.x0})`)
        .attr("fill-opacity", 0)
        .attr("stroke-opacity", 0)
        .on("click", d => {
          if(!!this.lastPath) this.deletePaths(this.lastPath);
          d.children = d.children ? null : d._children;
          this.update(d, window);
        })
        .on('mouseover', d => {
          //console.log(d.data)
        });

      /* draw nodes */ 
      nodeEnter.append("circle")
        .attr("r", 2.5)
        .attr("fill", d => d._children ? "#555" : "#999")
        .attr("stroke-width", 10);

      /* draw text */
      nodeEnter.append("text")
        .attr("dy", "0.31em")
        .attr("x", d => d._children ? -6 : 6)
        .attr("text-anchor", d => d._children ? "end" : "start")
        .text(d => {
          if(d.data.name.length < 15 || d.data.size == 0) {
            return d.data.size !== 0 ? `${d.data.name} (${d.data.size})` : `${d.data.name}`;
          } else {
            return `${d.data.name.substring(0,15)}... (${d.data.size})`;
          }
        })
        .clone(true).lower()
          .attr("stroke-linejoin", "round")
          .attr("stroke-width", 3)
          .attr("stroke", "white");

      /* Transition nodes to their new position. */
      const nodeUpdate = node.merge(nodeEnter).transition(transition)
        .attr("transform", d => `translate(${d.y},${d.x})`)
        .attr("fill-opacity", 1)
        .attr("stroke-opacity", 1)
        .style("fill", d => d.class === "found" ? "#ff4136" : 'black');

      /* Transition exiting nodes to the parent's new position. */
      const nodeExit = node.exit().transition(transition).remove()
        .attr("transform", d => `translate(${source.y},${source.x})`)
        .attr("fill-opacity", 0)
        .attr("stroke-opacity", 0);

      /* Update links */
      const link = gLink.selectAll("path")
        .data(links, d => d.target.id);

      /* Enter any new links at the parent's previous position. */
      const linkEnter = link.enter().append("path")
        .attr("d", d => {
          const o = { x: source.x0, y: source.y0 };
          return diagonal({ source: o, target: o });
        });

      /* Transition links to their new position. */
      link.merge(linkEnter).transition(transition)
        .attr("d", diagonal);

      /* Transition exiting nodes to the parent's new position. */
      link.exit().transition(transition).remove()
        .attr("d", d => {
          const o = { x: source.x, y: source.y };
          return diagonal({ source: o, target: o });
        });

      /* Stash the old positions for transition. */
      root.eachBefore(d => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    };

    this.update(root, this.window);

    /* method to open search path */
    this.openPaths = (paths, window) => {
      for (let i = 0; i < paths.length; i++) {
        if(paths[i].id !== '1') { /* if not root */
          paths[i].class = 'found';
          if(paths[i]._children) { /* open children if hidden, else don't do anything */
            paths[i].children = paths[i]._children;
              //paths[i]._children = null;
          }
          this.update(paths[i], window);
        }
      }
    }

    /* remove the selected path class property */
    this.deletePaths = (paths) => {
      for(let i = 0; i < paths.length; i++){
        delete paths[i].class;
      }
    }

    /* return root */
    this.getRoot = () => root;
    
    /* function to process data for autocomplete selector */
    function getAutocompleteData(node, leaves, index) {
      if (node.children) {
        for (let i = 0; i < node.children.length; i++) {
          index = getAutocompleteData(node.children[i], leaves, index)[0];
        }
      }
      else {
        leaves.push({ id:++index, text:node.name, uid: node.uid });
      }
      return [index, leaves];
    }

    /* recursively collapse children */
    this.collapse = d => {
      if (d.children) {
        d._children = d.children;
        d._children.forEach(this.collapse);
        d.children = null;
      }
    }
  }

  /* method to create a tree from the data */
  createTree(data, steps) {
    let current = null;
    let existing = null;

    for (let y = 0; y < steps.length; y++) {
      if (y == 0) {
        if (!this.tree['children'] || typeof this.tree['children'] == 'undefined'){
          this.tree = { name: steps[y], size: data.size || 0, children: [], uid: data.uid };
        }
        current = this.tree['children'];
        } else {
          existing = null;
          for (let i = 0; i < current.length; i++) {
            if (current[i].name === steps[y]) {
              existing = current[i];
              break;
            }
          }
          if (existing) {
            current = existing.children;
          } else {
            current.push({ name: steps[y], size: data.size || 0, children: [], uid: data.uid });
            current = current[current.length - 1].children;
          }
        }
    }
  }

  /* function to remove empty arrays from objects/arrays */
  removeEmptyArrays(data) {
    for (let key in data) {
      let item = data[key];
      /* check if this item is an array */
      if (Array.isArray(item)) {
        /* check if the array is empty */
        if (item.length == 0) {
          /* remove this item from the parent object */
          delete data[key];
        } else {
          this.removeEmptyArrays(item);
        }
        /* if item is an object, recursively remove empty arrays */
      } else if (typeof item == "object") {
        this.removeEmptyArrays(item);
      }
    }    
  }

  /* Path to searched object */
  private searchTree(obj, search, path){
    if(obj['data']['name'] === search['text'] && obj['data']['uid'] === search['uid']) { /* if search is found return, add the object to the path and return it */
      path.push(obj);
      return path;
    }
    else if(obj.children || obj._children) { /* if children are collapsed d3 object will have them instantiated as _children */
      let children = (obj.children) ? obj.children : obj._children;
      for (let i = 0; i < children.length; i++) {
        path.push(obj); /* we assume this path is the right one */
        let found = this.searchTree(children[i], search, path);
        if(found) {/* should return the bubbled-up path from the first if statement */
          return found;
        } else {/* if not found remove this parent from the path and continue iterating */
          path.pop();
        }
      }
    }
    else {//not the right object, return false so it will continue to iterate in the loop
      return false;
    }
  }

  /* on search tree action */
  private onButtonClick() {
    if(!!this.lastPath) this.deletePaths(this.lastPath);
    let paths = this.searchTree(this.getRoot(), this.myControl.value, []);
      if (typeof(paths) !== "undefined") {
        this.getRoot().children.forEach(this.collapse);
        this.openPaths(paths, this.window);
        this.lastPath = paths;
      } else {
        alert(this.myControl.value + " not found!");
      }
  }

  /* autocomplete filter */
  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.options.filter(option => option['text'].toLowerCase().includes(filterValue));
  }

  displayFn(subject) {
    return subject ? subject.text : undefined;
  }
}
