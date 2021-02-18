function qr(id){
  QRCode.toCanvas(document.getElementById('qr_canvas'+id), 'http://'+window.location.hostname+'/player?story='+id, function (error) {
  if (error) {
    $("#qr_success"+id).append("C'è stato un errore, in ogni caso l'url è: http://"+window.location.hostname+"/player?story="+id); 
    $('#qr_canvas'+id).remove();
    $('#btn-download'+id).remove();
  //in qr_error the url has to be written
  }
})
}

function create_Qrcodes_grid(stories) {
  $("#qrcodes_grid").empty();
  $("#qrcodes_grid").append('<div class="row mb-4"></div>');
  stories.forEach( story => {
    let header = $("<div>"+story.title+"<br>"+story.id+"</div>");
    let canvas = $('<canvas id="qr_canvas'+story.id+'"></canvas>');
    let button = $('<a href="#" class="btn btn-lg btn-success mt-2 mb-2" id="btn-download'+story.id+'" download="'+story.title+'.png"><i class="fa fa-download"></i></a>');
    button.on("click",function (e) {
        var dataURL = document.getElementById('qr_canvas'+story.id).toDataURL('image/png');
        document.getElementById('btn-download'+story.id).href = dataURL;
    });
    let qr_success = $('<div id="qr_success'+story.id+'"></div>');
    qr_success.append(canvas);
    qr_success.append("<br>");
    qr_success.append(button);
    let cell = $('<div class="col mr-3"></div>');
    cell.append(header);
    cell.append(qr_success);
    if( $("#qrcodes_grid > div:nth-last-child(1)").children().length >= 3 )
      $("#qrcodes_grid").append('<div class="row mb-4"></div>');
    $("#qrcodes_grid > div:nth-last-child(1)").append(cell);
    qr(story.id);
  });
  if( $("#qrcodes_grid").children().length >1) {
    while( $("#qrcodes_grid > div:nth-last-child(1)").children().length < 3) {
      let col = $('<div class="col mr-3"></div>');
      $("#qrcodes_grid > div:nth-last-child(1)").append(col);
    }
  }
}