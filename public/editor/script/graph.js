network ="";
        // create an array with nodes
        //var network;
        var nodes = new vis.DataSet([
            {id: 1, label: 'Node 1',cid: "cidCluster1"},
            {id: 2, label: 'Node 2', cid:"cidCluster1"},
            {id: 3, label: 'Node 3',cid: "cidCluster2"},
            {id: 4, label: 'Node 4',cid: "cidCluster2"},
            {id: 5, label: 'Node 5',cid: "cidCluster3"}
        ]);
    
        // create an array with edges
        var edges = new vis.DataSet([
            {from: 1, to: 1},
            {from: 1, to: 3},
            {from: 1, to: 2},
            {from: 3, to: 4},
            {from: 2, to: 4,arrows: 'from'},
            {from: 2, to: 5}
        ]);
        // provide the data in the vis format
        var data = {
            nodes: nodes,
            edges: edges
        };
        var options = {   
        layout:{
        hierarchical: {
          enabled:true,
          direction: 'LR',        // UD, DU, LR, RL
          sortMethod: 'directed',  // hubsize, directed
        }
      },
      interaction: {
            dragNodes: false,
            dragView: false
        },
      edges:{
        arrows: 'to'
      },
      nodes: {
        shape: "box"
      }
    };
/*window.onresize = function() {
    if( CurrentNavStatus.Section == "Graph")
        network.fit();
}*/
function create_graph() {
        // create a network
        var container = document.getElementById('mynetwork');
        // initialize your network!
        network = new vis.Network(container, data, options);
        network.setSize()
        network.setData(data);
        for(i=1; i<=3; i++) {
          var clusterOptionsByData = {
            joinCondition: function (childOptions) {
              return childOptions.cid == "cidCluster"+i;
            },
            clusterNodeProperties: {
              id: "cidCluster"+i,
              borderWidth: 3,
              shape: "circle",
              allowSingleNodeCluster: true,
              label: "DIOCANE"
            },
          };
          network.cluster(clusterOptionsByData);
        }
        network.on("selectNode", function (params) {
          console.log(params.nodes)
          if (params.nodes.length == 1) {
            if (network.isCluster(params.nodes[0]) == true) {
              network.openCluster(params.nodes[0]);
            }
            else {
              ;//rebuild cluster
            }
          }
        });
        network.on("afterDrawing", function () {
            this.fit();
        });
    }
    function open_all_clusters() {
          nodes = ["cidCluster1","cidCluster2","cidCluster3"];
          nodes.forEach(cluster => {
            if (network.isCluster(cluster) == true) {
              network.openCluster(cluster);
            }
          });
        }
    function clusterByCid() {
        network.setData(data);
        for(i=1; i<=3; i++) {
          var clusterOptionsByData = {
            joinCondition: function (childOptions) {
              return childOptions.cid == "cidCluster"+i;
            },
            clusterNodeProperties: {
              id: "cidCluster"+i,
              borderWidth: 3,
              shape: "circle",
              allowSingleNodeCluster: true,
              label: "DIOCANE",
              color: "red"
            },
          };
          network.cluster(clusterOptionsByData);
        }
      }