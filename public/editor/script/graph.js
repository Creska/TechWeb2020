var network;
var options = {   
  layout:{
    randomSeed: "1",
    hierarchical: {
      enabled: false,
      direction: 'UD',        // UD, DU, LR, RL
      sortMethod: 'hubsize',  // hubsize, directed
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
    shape: "box"
  },
  physics: {
    enabled: true,
    solver: 'forceAtlas2Based'
  }
};
function create_nodes_structure() { 
  let nodes = [];
  CurrentWork.quests.forEach( quest => {
    if( quest.activities.length == 0 ) { //the quest has no activities
      nodes.push( {id: quest.quest_id+"Empty", label:"quest vuota",cid: quest.quest_id} );
    }
    else {
      quest.activities.forEach( activity => {
        nodes.push( {id: activity.activity_id, label:"attività:\n"+activity.activity_id,cid: quest.quest_id} );
      });
    }
  });
return nodes;
}

function create_edges_structure() { 
  let edges = [];
  CurrentWork.quests.forEach( (quest, q_index,quests) => {
    if ( quest.activities.length == 0 ) { //current quest is empty
      if( quests[q_index+1]) { //check next quest existence
        if( quests[q_index+1].activities[0] ) //check next quest has an activity
          edges.push( {from: quest.quest_id+"Empty", to: quests[q_index+1].activities[0].activity_id, label: "" } );
        else { //next quest is empty
          edges.push( {from: quest.quest_id+"Empty", to: quests[q_index+1].quest_id+"Empty", label: "" } );
        }
      }
    }
    else {
    quest.activities.forEach( (activity,a_index,activities) => {  
      activity.answer_outcome.forEach( outcome => {
        let next = outcome.next_activity_id;
        if( !outcome.condition ) { //default outcome
          if( next == "" ) {
            if( activities[a_index+1] ) {//there is a subsequent activity in the same quest
              next = activities[a_index+1].activity_id;
            }
            else { //next is the first activity from the next quest
              if( quests[q_index+1] ) {
                if( quests[q_index+1].activities[0] )
                  next = quests[q_index+1].activities[0].activity_id;
                else //the next quest is empty
                  next = quests[q_index+1].quest_id+"Empty";
              }
            }  
          }
        }
        edges.push( {from: activity.activity_id, to: next } );
      });        
    });
    }
  });
  return edges;
}

function create_graph() {
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
        shape: "box",
        allowSingleNodeCluster: true,
        label: quest.quest_title+"\n"+quest.quest_id
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
        shape: "box",
        allowSingleNodeCluster: true,
        label: quest.quest_title+"\n"+quest.quest_id
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