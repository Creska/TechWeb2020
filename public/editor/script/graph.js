var network;
var options = {   
  layout:{
    randomSeed: "1",
    hierarchical: {
      enabled:false,
      direction: 'LR',        // UD, DU, LR, RL
      sortMethod: 'directed',  // hubsize, directed
    }
},
interaction: {
      dragNodes: true,
      dragView: false
  },
edges:{
  arrows: 'to'
},
nodes: {
  shape: "ellipse"
}
};
function create_nodes_structure() { 
   nodes = [];
  CurrentWork.quests.forEach( quest => {
    quest.activities.forEach( activity => {
      nodes.push( {id: activity.activity_id, label:activity.activity_id,cid: quest.quest_id} );
    });
  });
return nodes;
}

function create_edges_structure() { 
   edges = [];
  CurrentWork.quests.forEach( (quest, q_index,quests) => {
    quest.activities.forEach( (activity,a_index,activities) => {
      activity.answer_outcome.forEach( outcome => {
        if( outcome.nextactivity == "default") { 
          if( activities.length-1 == a_index ) {//i'm the last activity of the current 
          //there must be an actual other quest and activity
            if( quests[q_index+1] && quests[q_index+1].activities[0] )
              edges.push( {from: activity.activity_id, to: quests[q_index+1].activities[0].activity_id } );
          }
          else { //push next activity in the same quest
            if( activities[a_index+1] )
              edges.push( {from: activity.activity_id, to: activities[a_index+1].activity_id } );;
          }
        }
        else {
          edges.push( {from: activity.activity_id, to: outcome.nextactivity } );
        }
      });        
    });
  });
  return edges;
}

function create_graph() {
  //var network;
  var nodes = new vis.DataSet( create_nodes_structure() );
  // create an array with edges
  var edges = new vis.DataSet( create_edges_structure() );
  // provide the data in the vis format
  var data = {
    nodes: nodes,
    edges: edges
  };
  // create a network
  var container = document.getElementById('mynetwork');
  // initialize network
  network = new vis.Network(container, data, options);
  network.on("afterDrawing", function () {
    this.fit();
  });
  cluster_graph();
}
function open_all_clusters() {
  CurrentWork.quests.forEach( quest => {
    if (network.isCluster(quest.quest_id) == true) {
      network.openCluster(quest.quest_id);
    }
  });
}

function clusterByCid() {
  CurrentWork.quests.forEach( quest => {
    var clusterOptionsByData = {
      joinCondition: function (childOptions) {
        return childOptions.cid == quest.quest_id;
      },
      clusterNodeProperties: {
        id: quest.quest_id,
        borderWidth: 3,
        shape: "ellipse",
        allowSingleNodeCluster: true,
        label: quest.quest_id //,
        //color: "red"
      },
    };
    network.cluster(clusterOptionsByData);
  });
}

function cluster_graph() { 
  CurrentWork.quests.forEach( quest => {
    var clusterOptionsByData = {
      joinCondition: function (childOptions) {
      return childOptions.cid == quest.quest_id;
      },
      clusterNodeProperties: {
        id: quest.quest_id,
        borderWidth: 3,
        shape: "ellipse",
        allowSingleNodeCluster: true,
        label: "Quest: "+quest.quest_id
      },
    };
    network.cluster(clusterOptionsByData);
    network.on("selectNode", function (params) {
      if (params.nodes.length == 1) {
        if (network.isCluster(params.nodes[0]) == true) 
          network.openCluster(params.nodes[0]);
      }
    });
  });
  network.fit();
}