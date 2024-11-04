window.onload = function() {
    var nav = document.getElementById('nav');
    var oNav = nav.getElementsByTagName('button');
    var container = document.getElementById('container');
    var oDiv = container.getElementsByClassName('tab');
    for (var i = 0; i < oNav.length; i++) {
        oNav[i].index = i;
        oNav[i].onclick = function() {
            for (var i = 0; i < oNav.length; i++) {
                oNav[i].className = '';
                oDiv[i].style.display = "none";
            }
            this.className = 'act';
            oDiv[this.index].style.display = "block"
        }
        for (var m = 1; m < oNav.length; m++) {
            oNav[m].className = '';
            oDiv[m].style.display = "none";
        }
    }
}

var get_now = document.getElementById('get_now');
get_now.addEventListener("click", function(){
  var show_now = document.getElementById('show_now')
  show_now.value = +new Date+''
  chrome.storage.local.set({
    [show_now.dataset.key]: show_now.value
  })
})


function sub_logger(){
  chrome.storage.local.get([
    'config-proxy-hook',
    ], function(e){
    chrome.browserAction.setBadgeBackgroundColor({color: '#BC1717'});
    var info = ''
    if (e['config-proxy-hook']){
      info += 'P'
    }
    if (e['config-function-proxy-hook']){
      info += 'F'
    }
    if (e['config-iframe-proxy-hook']){
      info += 'I'
    }
    chrome.browserAction.setBadgeText({text: info});
  })
}

document.querySelectorAll("input").forEach(function(v){
  chrome.storage.local.get([v.dataset.key], function (result) {
    if (v.type == 'checkbox'){
      v.checked = result[v.dataset.key];
    }
    if (v.type == 'text'){
      v.value = result[v.dataset.key] || '';
    }
  })
  v.addEventListener("change", function (e) {
    if (v.type == 'checkbox'){
      console.log(e.target.dataset.key, e.target.checked)
      chrome.storage.local.set({
        [e.target.dataset.key]: e.target.checked
      })
      sub_logger()
    }
  })
})


var proxy_all = document.getElementById('proxy_all');
proxy_all.addEventListener("click", function(){
  var selec=document.getElementsByName('proxy-obj');
  for(var i=0; i<selec.length; i++){
      if(selec[i].type=='checkbox'){
        selec[i].checked=!selec[i].checked;
        chrome.storage.local.set({
          [selec[i].getAttribute("data-key")]: selec[i].checked
        })
      }
       

  }
})