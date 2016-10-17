// ==UserScript==
// @name        vk-audio
// @namespace   mugiseyebrows.ru
// @include     https://vk.com/audios*
// @include     http://vk.com/audios*
// @version     1
// @grant       GM_xmlhttpRequest
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js
// ==/UserScript==

var config = {
  pass: 'qwerty',
  host: '127.0.0.1'
}

var gm_ajax = function(opts) {
  var data, k, ref, v;
  if (opts.url == null) {
    console.log('gm_ajax error: set url');
    return;
  }
  if (opts.method == null) {
    opts.method = 'GET';
  }
  if (opts.data == null) {
    opts.data = '';
  }
  if ($.isPlainObject(opts.data)) {
    data = [];
    ref = opts.data;
    for (k in ref) {
      v = ref[k];
      data.push(k + '=' + encodeURIComponent(v));
    }
    opts.data = data.join('&');
  }
  if (opts.success == null) {
    opts.success = function() {
      return console.log('ajax succeeded for url ' + opts.url);
    };
  }
  if (opts.error == null) {
    opts.error = function() {
      return console.log('ajax error for url ' + opts.url);
    };
  }
  opts.headers = {};
  if (opts.data.length > 0) {
    opts.headers = {
      "Content-Type": "application/x-www-form-urlencoded"
    };
  }
  return GM_xmlhttpRequest({
    method: opts.method,
    url: opts.url,
    data: opts.data,
    headers: opts.headers,
    onload: function(response) {
      return opts.success(response.responseText);
    },
    onerror: opts.error
  });
};

function geid(id) {
  return document.getElementById(id);
}

function getn(e,tn) {
  if (arguments.length == 1) {
    return [].slice.call(document.getElementsByTagName(e));
  } else if (arguments.length == 2) {
    return [].slice.call(e.getElementsByTagName(tn));
  }
}

function gecn(e,cn) {
  if (arguments.length == 1) {
    return [].slice.call(document.getElementsByClassName(e));
  } else if (arguments.length == 2) {
    return [].slice.call(e.getElementsByClassName(cn));
  }
}

var tracks = [];

function saSearch() {
  saClear();
  tracks = []; 
  
  gecn('_audio_row').forEach(function(row){
    var a = JSON.parse(row.getAttribute('data-audio'));
    if (a == null) 
      return;
    tracks.push({p:a[4],t:a[3],i1:a[0],i2:a[1]});
  });
  
  var ul = $('#sa-tracks');
  
  tracks.forEach(function(e,i){
    var li = $('<li/>').appendTo(ul);
    var label = $('<label/>').appendTo(li).html(e.p + ' - ' + e.t);
    $('<input/>').prependTo(label).attr('value',i).attr('name','tracks[]').attr('type','checkbox').attr('checked','true');
  });

  
}

function saStatus(msg) {
 $('#sa-status').html(msg);
}

function saSelectAll() {
  $(ul).find('input').each(function(i,e){
    e.checked = true;
  });
}

function saDeselectAll() {
  $(ul).find('input').each(function(i,e){
    e.checked = false;
  });
}


function saveOneTrack(selected,total) {
  
  if (selected.length < 1) {
    return;
  }
  
  var track = selected.shift();
  
  var buttonId = '#play_' + track.i2 + '_' + track.i1;
  var button = $(buttonId);
  
  if (button == null) {
    console.log('no button ' + buttonId);
    return;
  }
  
  button[0].click();
  
  setTimeout(function(){
    var url = 'http://' + config['host'] + '/vk-audio/';
    var ca = unsafeWindow.getAudioPlayer()._currentAudio;
    var src = ca[2];
    
    var name = track.p + ' - ' + track.t;
    
    name = name.replace(/&amp;/g,'&');
    
    var ajax_opts = {
      method: 'POST',
      url: url,
      data: {
        src: src,
        name: name,
        pass: config['pass'],
        index: total - selected.length - 1,
        total: total
      },
      success: function(resp) {
        //console.log(resp);
        $('#sa-msg').text(resp);
        saveOneTrack(selected,total);
      },
      error: function(e) {
        //console.log(e);
        $('#sa-msg').text(e);
        saveOneTrack(selected,total);
      }
   };

    //console.log(name);
    
    gm_ajax(ajax_opts);
  },1000);
  
}

function saSave() {
  
  var selected = [];
  $('#sa-tracks input').each(function(i,e){
    if (e.checked) {
      selected.push(tracks[i]);
    }
  });
  
  $('#sa-msg').text('saving');
  saveOneTrack(selected,selected.length);
  
}

function saButton(id,caption,fn) {
    var button = $('<input/>').appendTo('#sa-form').attr('type','button').attr('id',id).attr('value',caption);
    $(button).click(fn);
}

function saRemove() {
  $('#sa-div').remove();
}

function saClear() {
    $(ul).html('');
    tracks = []; 
}

function saSpan(id) {
  var span = $('<span/>').appendTo('#sa-form').attr('id',id);
}

function saInit() {
  div = $('<div/>').appendTo('body').attr('id','sa-div').css({position:'absolute','z-index':1000,top:0,'background-color':'#ffffff',width: '800px', 'margin-left': '-400px', left: '50%', border: '1px solid #000000', padding: '10px'});
  
  form = $('<form/>').appendTo('#sa-div').attr('id','sa-form');

  saButton('sa-parse','parse',saSearch);
  saButton('sa-clear','clear',saClear);
  saButton('sa-select','select',saSelectAll);
  saButton('sa-deselect','deselect',saDeselectAll);
  saButton('sa-save','save',saSave);
  saButton('sa-remove','remove',saRemove);
  saSpan('sa-msg');
    
  $('<br/>').appendTo(form);
  $('<div/>').appendTo(form).attr('id','sa-status').css('margin','10px 0');
  
  ul = $('<ul/>').appendTo(form).css({'list-style':'none','padding':0,'margin':0}).attr('id','sa-tracks');
  
  tracks = [];
}


setTimeout(function(){
  
  var ol = getn(geid('side_bar_inner'),'ol')[0];
  var a = $('<a/>').click(function(){
    
    saInit();
    
    
  }).text('vk-audio').attr('href','#')[0];
  var li = $('<li/>')[0];
  
  
  ol.appendChild(li);
  li.appendChild(a);
  
},1000);
